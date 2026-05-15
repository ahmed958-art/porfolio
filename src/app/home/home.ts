import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { gsap } from 'gsap';
import { ImageTrail } from '../shared/image-trail/image-trail';
import { GalleryImage, ThreeDHoverGallery } from '../shared/three-d-hover-gallery/three-d-hover-gallery';

@Component({
  selector: 'app-home',
  imports: [ImageTrail, ThreeDHoverGallery, NgOptimizedImage],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);
  private revealObserver: IntersectionObserver | null = null;

  galleryImages: GalleryImage[] = [
    { src: 'ecommerce_dark_neon_landing_page.jpg', alt: 'E-commerce project' },
    { src: 'roi_calculator_landing_page.jpg', alt: 'ROI Calculator' },
    { src: 'chatting.png', alt: 'Chat app' },
    { src: 'fitnedd.png', alt: 'Fitness app' },
    { src: 'ChatGPT Image May 1, 2026, 09_53_46 PM.png', alt: 'Project 5' },
  ];

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.zone.runOutsideAngular(() => {
      const root = document.documentElement;
      const s0 = document.querySelector<HTMLElement>('.slide-0');
      const sections = Array.from(document.querySelectorAll<HTMLElement>('.slide'));
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      sections[0]?.classList.add('is-visible');

      if (s0) {
        gsap
          .timeline({ defaults: { ease: 'power2.out' } })
          .from(s0.querySelectorAll('.title-word'), {
            y: 96,
            opacity: 0,
            stagger: 0.07,
            duration: 1.05,
            delay: 0.14,
          })
          .from(s0.querySelector('.meta-left'), { y: 14, opacity: 0, duration: 0.68 }, '-=0.46')
          .from(s0.querySelector('.meta-right'), { y: 14, opacity: 0, duration: 0.68 }, '-=0.56')
          .from(s0.querySelector('.slide-indicator'), { opacity: 0, duration: 0.48 }, '-=0.24');
      }

      if (prefersReducedMotion) {
        sections.forEach((section) => section.classList.add('is-visible'));
        return;
      }

      if (!('IntersectionObserver' in window)) {
        sections.forEach((section) => section.classList.add('is-visible'));
        return;
      }

      this.revealObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const element = entry.target as HTMLElement;
            element.classList.add('is-visible');

            gsap.fromTo(
              element.querySelectorAll(
                '.slide-eyebrow, .title-word, .intro-name, .intro-text, .intro-cta, .logo-card, .about-grid-item, .cta-btn'
              ),
              {
                y: 20,
                autoAlpha: 0,
              },
              {
                y: 0,
                autoAlpha: 1,
                stagger: 0.06,
                duration: 0.82,
                ease: 'power3.out',
                overwrite: 'auto',
              }
            );

            this.revealObserver?.unobserve(element);
          }
        },
        {
          root,
          threshold: 0.15,
          rootMargin: '0px 0px -6% 0px',
        }
      );

      sections.slice(1).forEach((section) => this.revealObserver?.observe(section));
    });
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.revealObserver?.disconnect();
    this.revealObserver = null;
  }
}
