import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgStyle } from '@angular/common';

export interface GalleryImage {
  src: string;
  alt?: string;
}

const DEFAULT_IMAGES: GalleryImage[] = [
  { src: 'https://images.unsplash.com/photo-1540968221243-29f5d70540bf?w=800&auto=format&fit=crop&q=60', alt: 'Slide 1' },
  { src: 'https://images.unsplash.com/photo-1596135187959-562c650d98bc?w=800&auto=format&fit=crop&q=60', alt: 'Slide 2' },
  { src: 'https://images.unsplash.com/photo-1628944682084-831f35256163?w=800&auto=format&fit=crop&q=60', alt: 'Slide 3' },
  { src: 'https://images.unsplash.com/photo-1590013330451-3946e83e0392?w=800&auto=format&fit=crop&q=60', alt: 'Slide 4' },
  { src: 'https://images.unsplash.com/photo-1590421959604-741d0eec0a2e?w=800&auto=format&fit=crop&q=60', alt: 'Slide 5' },
  { src: 'https://images.unsplash.com/photo-1572613000712-eadc57acbecd?w=800&auto=format&fit=crop&q=60', alt: 'Slide 6' },
  { src: 'https://images.unsplash.com/photo-1570097192570-4b49a6736f9f?w=800&auto=format&fit=crop&q=60', alt: 'Slide 7' },
  { src: 'https://images.unsplash.com/photo-1620789550663-2b10e0080354?w=800&auto=format&fit=crop&q=60', alt: 'Slide 8' },
  { src: 'https://images.unsplash.com/photo-1617775623669-20bff4ffaa5c?w=800&auto=format&fit=crop&q=60', alt: 'Slide 9' },
  { src: 'https://images.unsplash.com/photo-1548600916-dc8492f8e845?w=800&auto=format&fit=crop&q=60', alt: 'Slide 10' },
];

@Component({
  selector: 'app-three-d-hover-gallery',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './three-d-hover-gallery.html',
  styleUrl: './three-d-hover-gallery.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThreeDHoverGallery {
  // ── Inputs ────────────────────────────────────────────────────────────────
  images            = input<GalleryImage[]>(DEFAULT_IMAGES);
  duration          = input<number>(32);
  cardWidth         = input<string>('17.5em');
  cardAspectRatio   = input<string>('7/10');
  perspective       = input<string>('35em');
  rotationDirection = input<'left' | 'right'>('left');
  withMask          = input<boolean>(true);

  // ── Computed helpers ──────────────────────────────────────────────────────
  animationName = computed(() =>
    this.rotationDirection() === 'left' ? 'slider3d-rotate-left' : 'slider3d-rotate-right'
  );

  containerStyle = computed(() => ({
    perspective: this.perspective(),
    ...(this.withMask()
      ? {
          '-webkit-mask': 'linear-gradient(90deg, transparent, #000 20% 80%, transparent)',
          mask: 'linear-gradient(90deg, transparent, #000 20% 80%, transparent)',
        }
      : {}),
  }));

  ringStyle = computed(() => ({
    transformStyle: 'preserve-3d',
    animation: `${this.animationName()} ${this.duration()}s linear infinite`,
  }));

  getImageStyle(index: number): Record<string, string> {
    const n   = this.images().length;
    const cw  = this.cardWidth();
    const tan = Math.tan(Math.PI / n);
    const tz  = `calc(-1 * (0.5 * ${cw} + 0.5em) / ${tan})`;
    const ry  = `calc(${index} * (1turn / ${n}))`;
    return {
      width:                    cw,
      aspectRatio:              this.cardAspectRatio(),
      transform:                `rotateY(${ry}) translateZ(${tz})`,
      backfaceVisibility:       'hidden',
      WebkitBackfaceVisibility: 'hidden',
    };
  }
}
