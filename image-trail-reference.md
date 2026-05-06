# Angular Image Trail Effect — Complete Technical Reference

## What It Does
When the user moves the mouse, photos appear at the cursor position and fade out — creating a "trail" of images following the mouse. Images are recycled from a fixed pool (no DOM create/destroy on every move).

---

## File Structure
```
src/
  app/
    shared/
      image-trail/
        image-trail.ts       ← standalone component (template + styles + logic all-in-one)
    home/
      home.html              ← consumes <app-image-trail> inside the hero slide
      home.ts                ← imports ImageTrail into the component's imports[]
```

---

## Step 1 — The Component (`image-trail.ts`)

### 1.1 Imports needed
```typescript
import {
  Component, ElementRef, OnDestroy, AfterViewInit,
  viewChild, viewChildren, NgZone, PLATFORM_ID, inject, input,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
```

### 1.2 Image data (hardcoded inside the component)
```typescript
const PROJECT_IMAGES: TrailImage[] = [
  { src: 'your-image-1.jpg', alt: 'Label 1' },
  { src: 'your-image-2.jpg', alt: 'Label 2' },
  // add as many as you want — files go in /public folder
];
```
Files in Angular's `/public` folder are served from the root URL (`/your-image.jpg`), so no path prefix is needed.

### 1.3 Template — fixed pool of `<div>` nodes
```html
<div class="trail-container" #container>
  @for (img of pool; track img.id) {
    <div class="trail-item" #trailItem>
      <img [src]="img.src" [alt]="img.alt" draggable="false" />
    </div>
  }
</div>
```
**Key rules:**
- `#container` → grabbed by `viewChild` to get the bounding box
- `#trailItem` on every card → grabbed by `viewChildren` so GSAP animates them by `nativeElement` (not class-name string queries)
- `@for` + `track img.id` → Angular's built-in control flow, no `*ngFor` module needed

### 1.4 Pool — built at class level (critical)
```typescript
readonly poolSize = 12;
pool = this.buildPool(PROJECT_IMAGES); // ← runs BEFORE ngAfterViewInit

private buildPool(imgs: TrailImage[]) {
  return Array.from({ length: this.poolSize }, (_, i) => ({
    id:  i,
    src: imgs[i % imgs.length].src,  // cycles if fewer images than poolSize
    alt: imgs[i % imgs.length].alt ?? '',
  }));
}
```
**Why at class level:** If you build the pool inside `ngAfterViewInit`, Angular has already done its first render with an empty array — so `@for` produces zero `<div>` nodes and GSAP has nothing to target.

### 1.5 Angular refs — no DOM queries
```typescript
container  = viewChild.required<ElementRef<HTMLElement>>('container');
trailItems = viewChildren<ElementRef<HTMLElement>>('trailItem');
```
- `viewChild.required` → throws at runtime if the element is missing (safe default)
- `viewChildren` → returns a `Signal<readonly ElementRef[]>` — call `trailItems()` to read

### 1.6 Mouse tracking outside NgZone
```typescript
ngAfterViewInit() {
  this.zone.runOutsideAngular(() => {
    this.mouseMoveHandler = (e: MouseEvent) => {
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      if (Math.sqrt(dx*dx + dy*dy) < this.gap()) return; // throttle by distance
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.spawnAt(e.clientX, e.clientY, Math.atan2(dy, dx));
    };
    window.addEventListener('mousemove', this.mouseMoveHandler);
  });
}
```
**Why outside NgZone:** `mousemove` fires hundreds of times per second. Running it inside NgZone would trigger Angular change detection on every pixel — killing performance. GSAP handles all DOM updates itself.

### 1.7 Spawn logic — recycle pool nodes
```typescript
private spawnAt(x: number, y: number, angle: number): void {
  const items = this.trailItems();
  const el = items[this.poolIndex % items.length].nativeElement;
  this.poolIndex++;                        // round-robin through the 12 nodes

  // Convert page coords → container-local coords (because container is position:absolute)
  const rect = this.container().nativeElement.getBoundingClientRect();
  const lx = x - rect.left;
  const ly = y - rect.top;

  const rotateDeg = (angle * 180) / Math.PI * 0.15; // slight tilt in movement direction

  gsap.killTweensOf(el);                             // stop any ongoing animation on this node
  gsap.set(el, { x: lx, y: ly, opacity: 1, scale: 0.55, rotation: rotateDeg });

  // Pop in
  gsap.to(el, { scale: 1, rotation: rotateDeg + (Math.random() * 10 - 5), duration: 0.6, ease: 'power3.out' });

  // Fade out + drift down
  gsap.to(el, { opacity: 0, scale: 0.8, y: ly + 40, duration: 0.9, delay: 0.35, ease: 'power2.in' });
}
```

### 1.8 Cleanup
```typescript
ngOnDestroy() {
  window.removeEventListener('mousemove', this.mouseMoveHandler);
  this.trailItems().forEach(item => gsap.killTweensOf(item.nativeElement));
}
```
Always remove `window` listeners and kill GSAP tweens in `ngOnDestroy` — otherwise they leak when the component is destroyed (e.g. when navigating away).

---

## Step 2 — CSS (inside `styles: []` in the component)

```scss
.trail-container {
  position: absolute;   /* ← must be absolute, NOT fixed */
  inset: 0;
  pointer-events: none; /* ← never blocks mouse events on content above it */
  z-index: 1;           /* ← behind slide text (z-index: 2) */
  overflow: hidden;
}

.trail-item {
  position: absolute;
  width: var(--trail-size, 180px);  /* ← controlled by [size] input */
  aspect-ratio: 3 / 4;
  top: 0; left: 0;
  opacity: 0;                        /* ← hidden by default, GSAP reveals them */
  transform: translate(-50%, -50%);  /* ← GSAP x/y positions the center */
  will-change: transform, opacity;   /* ← GPU acceleration hint */
  border-radius: 4px;
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: cover; }
}
```

**Why `position: absolute` not `position: fixed`:**
`fixed` escapes all stacking contexts and paints over every element on the page regardless of `z-index`. `absolute` stays inside the parent slide and respects `z-index` correctly.

---

## Step 3 — Link to the Hero Slide (`home.html`)

### 3.1 Import in the host component
```typescript
// home.ts
import { ImageTrail } from '../shared/image-trail/image-trail';

@Component({
  imports: [ImageTrail],   // ← register it
  ...
})
```

### 3.2 Place it inside the slide section
```html
<section class="slide slide-0" #slide0>

  <!-- Trail FIRST in DOM — renders behind everything else in this slide -->
  <app-image-trail [size]="160" [gap]="70" />

  <!-- Text content SECOND in DOM — z-index:2 puts it above the trail -->
  <div class="slide-inner">
    <h1 class="title">...</h1>
  </div>

</section>
```

**Order matters:** `<app-image-trail>` must come **before** `.slide-inner` in the DOM. Combined with `z-index: 1` (trail) vs `z-index: 2` (text), this guarantees text is always readable.

### 3.3 The slide needs `isolation: isolate`
```scss
.slide {
  position: absolute;
  isolation: isolate; /* ← creates a stacking context */
}
```
Without `isolation: isolate`, the child `z-index` values have no local reference and the browser stacks them against the entire page — making the trail win over text unpredictably.

---

## Inputs API
| Input   | Type     | Default | Description                              |
|---------|----------|---------|------------------------------------------|
| `size`  | `number` | `180`   | Card width in px                         |
| `gap`   | `number` | `80`    | Min mouse distance (px) before new image |
| `images`| `TrailImage[]` | built-in photos | Override with custom images |

---

## How to Reuse on Any Route / Page

1. Copy `src/app/shared/image-trail/image-trail.ts` — it is fully self-contained
2. Add your images to `/public`
3. Update `PROJECT_IMAGES` array inside the file
4. In your target component:
```typescript
imports: [ImageTrail]
```
5. In your template, wrap a `position: relative; isolation: isolate` container and drop `<app-image-trail />` as the first child

---

## GSAP Animation Values to Tune
| Property | Effect |
|---|---|
| `scale: 0.55` in `gsap.set` | Images pop in small |
| `scale: 1` in first `gsap.to` | They grow to full size |
| `duration: 0.6` | Speed of pop-in |
| `delay: 0.35` | How long before fade starts |
| `y: ly + 40` | How far they drift downward while fading |
| `gap()` input | Higher = fewer images, Lower = denser trail |
| `poolSize = 12` | Max simultaneous images on screen |
