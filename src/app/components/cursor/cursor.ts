import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  inject,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

@Component({
  selector: 'app-cursor',
  templateUrl: './cursor.html',
  styleUrl: './cursor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cursor implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);

  cursorEl = viewChild.required<ElementRef<HTMLElement>>('cursor');
  cursorDotEl = viewChild.required<ElementRef<HTMLElement>>('cursorDot');

  private moveHandler!: (event: MouseEvent) => void;
  private overHandler!: (event: MouseEvent) => void;
  private downHandler!: () => void;
  private upHandler!: () => void;
  private leaveHandler!: () => void;

  private cursorElement: HTMLElement | null = null;
  private cursorDotElement: HTMLElement | null = null;
  private xTo: ReturnType<typeof gsap.quickTo> | null = null;
  private yTo: ReturnType<typeof gsap.quickTo> | null = null;
  private dotXTo: ReturnType<typeof gsap.quickTo> | null = null;
  private dotYTo: ReturnType<typeof gsap.quickTo> | null = null;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!window.matchMedia('(pointer:fine)').matches) return;

    const cursor = this.cursorEl().nativeElement;
    const cursorDot = this.cursorDotEl().nativeElement;

    this.cursorElement = cursor;
    this.cursorDotElement = cursorDot;

    this.zone.runOutsideAngular(() => {
      this.xTo = gsap.quickTo(cursor, 'x', { duration: 0.22, ease: 'power3.out' });
      this.yTo = gsap.quickTo(cursor, 'y', { duration: 0.22, ease: 'power3.out' });
      this.dotXTo = gsap.quickTo(cursorDot, 'x', { duration: 0.06, ease: 'none' });
      this.dotYTo = gsap.quickTo(cursorDot, 'y', { duration: 0.06, ease: 'none' });

      this.moveHandler = (event: MouseEvent) => {
        this.xTo?.(event.clientX);
        this.yTo?.(event.clientY);
        this.dotXTo?.(event.clientX);
        this.dotYTo?.(event.clientY);
        gsap.to(cursor, { opacity: 1, duration: 0.12, overwrite: 'auto' });
        gsap.to(cursorDot, { opacity: 1, duration: 0.12, overwrite: 'auto' });
      };

      this.overHandler = (event: MouseEvent) => {
        const target = event.target;
        const element = target instanceof Element ? target : null;
        const isInteractive = !!element?.closest(
          'a, button, input, textarea, select, label, [role="button"], .work-grid-item, .about-grid-item'
        );
        gsap.to(cursor, {
          scale: isInteractive ? 1.45 : 1,
          duration: 0.18,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      };

      this.downHandler = () => {
        gsap.to(cursor, { scale: 0.85, duration: 0.12, overwrite: 'auto' });
      };

      this.upHandler = () => {
        gsap.to(cursor, { scale: 1, duration: 0.15, overwrite: 'auto' });
      };

      this.leaveHandler = () => {
        gsap.to(cursor, { opacity: 0, duration: 0.18, overwrite: 'auto' });
        gsap.to(cursorDot, { opacity: 0, duration: 0.18, overwrite: 'auto' });
      };

      window.addEventListener('mousemove', this.moveHandler, { passive: true });
      window.addEventListener('mouseover', this.overHandler, { passive: true });
      window.addEventListener('mousedown', this.downHandler);
      window.addEventListener('mouseup', this.upHandler);
      document.addEventListener('mouseleave', this.leaveHandler);
    });
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    window.removeEventListener('mousemove', this.moveHandler);
    window.removeEventListener('mouseover', this.overHandler);
    window.removeEventListener('mousedown', this.downHandler);
    window.removeEventListener('mouseup', this.upHandler);
    document.removeEventListener('mouseleave', this.leaveHandler);

    if (this.cursorElement) gsap.killTweensOf(this.cursorElement);
    if (this.cursorDotElement) gsap.killTweensOf(this.cursorDotElement);

    this.xTo = null;
    this.yTo = null;
    this.dotXTo = null;
    this.dotYTo = null;
  }
}
