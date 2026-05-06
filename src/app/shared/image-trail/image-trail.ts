import {
  Component,
  ElementRef,
  OnDestroy,
  AfterViewInit,
  viewChild,
  viewChildren,
  NgZone,
  PLATFORM_ID,
  inject,
  input,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

export interface TrailImage {
  src: string;
  alt?: string;
}

// Your photos from /public — add or remove as needed
const PROJECT_IMAGES: TrailImage[] = [
  { src: 'roi_calculator_landing_page.jpg', alt: 'Photo 1' },
  { src: 'fitnedd.png', alt: 'Photo 2' },
  { src: 'ecommerce_dark_neon_landing_page.jpg', alt: 'Photo 3' },
  { src: 'ChatGPT Image May 1, 2026, 09_53_46 PM.png',  alt: 'Photo 4' },
  { src: 'chatting.png',  alt: 'Photo 5' },
];

@Component({
  selector: 'app-image-trail',
  standalone: true,
  template: `
    <div class="trail-container" #container>
      @for (img of pool; track img.id) {
        <div class="trail-item" #trailItem>
          <img [src]="img.src" [alt]="img.alt" draggable="false" />
        </div>
      }
    </div>
  `,
  styles: [`
    .trail-container {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
      overflow: hidden;
    }
    .trail-item {
      position: absolute;
      width: var(--trail-size, 180px);
      aspect-ratio: 3 / 4;
      top: 0;
      left: 0;
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.6) rotate(0deg);
      will-change: transform, opacity;
      border-radius: 4px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        user-select: none;
      }
    }
  `],
})
export class ImageTrail implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private zone       = inject(NgZone);

  container  = viewChild.required<ElementRef<HTMLElement>>('container');
  // One ref per .trail-item — Angular populates this after view init
  trailItems = viewChildren<ElementRef<HTMLElement>>('trailItem');

  // Inputs
  images = input<TrailImage[]>(PROJECT_IMAGES);
  size   = input<number>(180);
  gap    = input<number>(80);

  // Pool built at class level so @for renders all nodes on first CD cycle
  readonly poolSize = 12;
  pool = this.buildPool(PROJECT_IMAGES);

  private lastX = 0;
  private lastY = 0;
  private poolIndex = 0;
  private mouseMoveHandler!: (e: MouseEvent) => void;

  private buildPool(imgs: TrailImage[]): { id: number; src: string; alt: string }[] {
    return Array.from({ length: this.poolSize }, (_, i) => ({
      id:  i,
      src: imgs[i % imgs.length].src,
      alt: imgs[i % imgs.length].alt ?? '',
    }));
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Rebuild pool if custom images were passed via input
    const imgs = this.images();
    if (imgs !== PROJECT_IMAGES) this.pool = this.buildPool(imgs);

    // Set CSS var for card size
    this.container().nativeElement.style.setProperty('--trail-size', `${this.size()}px`);

    this.zone.runOutsideAngular(() => {
      this.mouseMoveHandler = (e: MouseEvent) => {
        const dx   = e.clientX - this.lastX;
        const dy   = e.clientY - this.lastY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.gap()) return;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.spawnAt(e.clientX, e.clientY, Math.atan2(dy, dx));
      };
      window.addEventListener('mousemove', this.mouseMoveHandler);
    });
  }

  private spawnAt(x: number, y: number, angle: number): void {
    const items = this.trailItems();
    if (!items.length) return;
    const el = items[this.poolIndex % items.length].nativeElement;
    this.poolIndex++;

    // Convert page coords to container-local coords
    const rect = this.container().nativeElement.getBoundingClientRect();
    const lx = x - rect.left;
    const ly = y - rect.top;

    const rotateDeg = (angle * 180) / Math.PI * 0.15;

    gsap.killTweensOf(el);
    gsap.set(el, { x: lx, y: ly, opacity: 1, scale: 0.55, rotation: rotateDeg });
    gsap.to(el, {
      scale:    1,
      rotation: rotateDeg + (Math.random() * 10 - 5),
      duration: 0.6,
      ease:     'power3.out',
    });
    gsap.to(el, {
      opacity:  0,
      scale:    0.8,
      y:        ly + 40,
      duration: 0.9,
      delay:    0.35,
      ease:     'power2.in',
    });
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.removeEventListener('mousemove', this.mouseMoveHandler);
    const items = this.trailItems();
    items.forEach(item => gsap.killTweensOf(item.nativeElement));
  }
}
