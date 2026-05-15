import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { ImageTrail } from '../shared/image-trail/image-trail';
import { GalleryImage, ThreeDHoverGallery } from '../shared/three-d-hover-gallery/three-d-hover-gallery';

@Component({
  selector: 'app-home',
  imports: [ImageTrail, ThreeDHoverGallery],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);

  slide0 = viewChild.required<ElementRef<HTMLElement>>('slide0');
  slide1 = viewChild.required<ElementRef<HTMLElement>>('slide1');
  slide2 = viewChild.required<ElementRef<HTMLElement>>('slide2');
  hoverZone = viewChild.required<ElementRef<HTMLElement>>('hoverZone');

  currentSlide = signal(0);
  readonly totalSlides = 3;
  isAnimating = false;

  slides = [{ index: 0 }, { index: 1 }, { index: 2 }];

  galleryImages: GalleryImage[] = [
    { src: 'ecommerce_dark_neon_landing_page.jpg', alt: 'E-commerce project' },
    { src: 'roi_calculator_landing_page.jpg', alt: 'ROI Calculator' },
    { src: 'chatting.png', alt: 'Chat app' },
    { src: 'fitnedd.png', alt: 'Fitness app' },
    { src: 'ChatGPT Image May 1, 2026, 09_53_46 PM.png', alt: 'Project 5' },
  ];

  private wheelHandler!: (e: WheelEvent) => void;
  private touchStartHandler!: (e: TouchEvent) => void;
  private touchEndHandler!: (e: TouchEvent) => void;
  private touchCancelHandler!: () => void;
  private pointerDownHandler!: (e: PointerEvent) => void;
  private pointerUpHandler!: (e: PointerEvent) => void;
  private pointerCancelHandler!: () => void;
  private touchStartY = 0;
  private pointerStartY = 0;
  private usingPointerEvents = false;
  private readonly swipeThreshold = 30;

  private rootElement: HTMLElement | null = null;

  private get slideEls(): HTMLElement[] {
    return [
      this.slide0().nativeElement,
      this.slide1().nativeElement,
      this.slide2().nativeElement,
    ];
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.zone.runOutsideAngular(() => {
      const s0 = this.slide0().nativeElement;

      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from(s0.querySelectorAll('.title-word'), {
          y: 120,
          opacity: 0,
          stagger: 0.08,
          duration: 1,
          delay: 0.2,
        })
        .from(s0.querySelector('.meta-left'), { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
        .from(s0.querySelector('.meta-right'), { y: 20, opacity: 0, duration: 0.6 }, '-=0.5')
        .from(s0.querySelector('.slide-indicator'), { opacity: 0, duration: 0.4 }, '-=0.2');

      this.wheelHandler = (e: WheelEvent) => {
        e.preventDefault();
        if (this.isAnimating) return;
        this.zone.run(() => this.goTo(this.currentSlide() + (e.deltaY > 0 ? 1 : -1)));
      };

      this.touchStartHandler = (e: TouchEvent) => {
        this.touchStartY = e.touches[0].clientY;
      };

      this.touchEndHandler = (e: TouchEvent) => {
        const delta = this.touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(delta) < this.swipeThreshold) return;
        this.zone.run(() => this.goTo(this.currentSlide() + (delta > 0 ? 1 : -1)));
      };

      this.touchCancelHandler = () => {
        this.touchStartY = 0;
      };

      this.pointerDownHandler = (e: PointerEvent) => {
        if (e.pointerType !== 'touch') return;
        this.pointerStartY = e.clientY;
      };

      this.pointerUpHandler = (e: PointerEvent) => {
        if (e.pointerType !== 'touch') return;
        const delta = this.pointerStartY - e.clientY;
        if (Math.abs(delta) < this.swipeThreshold) return;
        this.zone.run(() => this.goTo(this.currentSlide() + (delta > 0 ? 1 : -1)));
      };

      this.pointerCancelHandler = () => {
        this.pointerStartY = 0;
      };

      const hz = this.hoverZone().nativeElement;

      this.rootElement = hz;
      hz.addEventListener('wheel', this.wheelHandler, { passive: false });

      if ('PointerEvent' in window) {
        this.usingPointerEvents = true;
        hz.addEventListener('pointerdown', this.pointerDownHandler, { passive: true });
        hz.addEventListener('pointerup', this.pointerUpHandler, { passive: true });
        hz.addEventListener('pointercancel', this.pointerCancelHandler, { passive: true });
      } else {
        hz.addEventListener('touchstart', this.touchStartHandler, { passive: true });
        hz.addEventListener('touchend', this.touchEndHandler, { passive: true });
        hz.addEventListener('touchcancel', this.touchCancelHandler, { passive: true });
      }
    });
  }

  goTo(index: number): void {
    if (index < 0 || index >= this.totalSlides || this.isAnimating) return;
    this.isAnimating = true;

    const prev = this.currentSlide();
    const dir = index > prev ? 1 : -1;
    const slides = this.slideEls;
    const prevEl = slides[prev];
    const nextEl = slides[index];

    gsap.set(nextEl, { yPercent: dir * 100, display: 'flex', opacity: 1 });

    gsap
      .timeline({
        onComplete: () => {
          gsap.set(prevEl, { display: 'none' });
          this.zone.run(() => {
            this.currentSlide.set(index);
            this.isAnimating = false;
          });
        },
      })
      .to(prevEl, { yPercent: -dir * 30, opacity: 0, duration: 0.9, ease: 'power3.inOut' })
      .to(nextEl, { yPercent: 0, duration: 1, ease: 'power3.inOut' }, '-=0.7')
      .from(
        nextEl.querySelectorAll(
          '.title-word, .meta-left, .meta-right, .slide-eyebrow, .cta-btn, .work-grid-item, .about-grid-item, .intro-name, .intro-text, .intro-cta, .logos-label, .logo-card'
        ),
        { y: 40, opacity: 0, stagger: 0.06, duration: 0.7, ease: 'power3.out' },
        '-=0.5'
      );
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.rootElement) {
      this.rootElement.removeEventListener('wheel', this.wheelHandler);
      if (this.usingPointerEvents) {
        this.rootElement.removeEventListener('pointerdown', this.pointerDownHandler);
        this.rootElement.removeEventListener('pointerup', this.pointerUpHandler);
        this.rootElement.removeEventListener('pointercancel', this.pointerCancelHandler);
      } else {
        this.rootElement.removeEventListener('touchstart', this.touchStartHandler);
        this.rootElement.removeEventListener('touchend', this.touchEndHandler);
        this.rootElement.removeEventListener('touchcancel', this.touchCancelHandler);
      }
    }
  }
}
