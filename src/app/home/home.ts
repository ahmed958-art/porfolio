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
  private touchStartY = 0;
  private wheelDeltaAccumulator = 0;
  private wheelResetTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly wheelThreshold = 90;

  private rootElement: HTMLElement | null = null;

  private isMobileViewport(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
  }

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

      if (this.isMobileViewport()) {
        return;
      }

      this.wheelHandler = (e: WheelEvent) => {
        e.preventDefault();
        if (this.isAnimating) return;

        this.wheelDeltaAccumulator += e.deltaY;

        if (this.wheelResetTimer) {
          clearTimeout(this.wheelResetTimer);
        }

        this.wheelResetTimer = setTimeout(() => {
          this.wheelDeltaAccumulator = 0;
        }, 140);

        if (Math.abs(this.wheelDeltaAccumulator) < this.wheelThreshold) {
          return;
        }

        const direction = this.wheelDeltaAccumulator > 0 ? 1 : -1;
        this.wheelDeltaAccumulator = 0;
        this.zone.run(() => this.goTo(this.currentSlide() + direction));
      };

      this.touchStartHandler = (e: TouchEvent) => {
        this.touchStartY = e.touches[0].clientY;
      };

      this.touchEndHandler = (e: TouchEvent) => {
        const delta = this.touchStartY - e.changedTouches[0].clientY;
        if (Math.abs(delta) < 50) return;
        this.zone.run(() => this.goTo(this.currentSlide() + (delta > 0 ? 1 : -1)));
      };

      const hz = this.hoverZone().nativeElement;

      this.rootElement = hz;
      hz.addEventListener('wheel', this.wheelHandler, { passive: false });
      hz.addEventListener('touchstart', this.touchStartHandler, { passive: true });
      hz.addEventListener('touchend', this.touchEndHandler, { passive: true });
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
      .to(prevEl, { yPercent: -dir * 18, opacity: 0, duration: 0.75, ease: 'power2.inOut' })
      .to(nextEl, { yPercent: 0, duration: 0.9, ease: 'power2.out' }, '-=0.58')
      .from(
        nextEl.querySelectorAll(
          '.title-word, .meta-left, .meta-right, .slide-eyebrow, .cta-btn, .work-grid-item, .about-grid-item, .intro-name, .intro-text, .intro-cta, .logos-label, .logo-card'
        ),
        { y: 24, opacity: 0, stagger: 0.045, duration: 0.55, ease: 'power2.out' },
        '-=0.42'
      );
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.wheelResetTimer) {
      clearTimeout(this.wheelResetTimer);
      this.wheelResetTimer = null;
    }

    if (this.rootElement) {
      this.rootElement.removeEventListener('wheel', this.wheelHandler);
      this.rootElement.removeEventListener('touchstart', this.touchStartHandler);
      this.rootElement.removeEventListener('touchend', this.touchEndHandler);
    }
  }
}
