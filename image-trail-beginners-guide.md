# Image Trail Effect — Beginner-Friendly Guide
### Written for vibe coders 🎨

---

## First, What Does This Effect Even Do?

Imagine you move your mouse across the screen.
Every time your mouse moves a little bit, a photo pops up right where your cursor is.
Then that photo slowly fades away and drifts down.
Multiple photos appear one after another as you move — creating a "trail" of images following your mouse.

That's it. That's the whole effect.

---

## The Big Picture — How It's Built

Think of it like 3 parts working together:

```
MOUSE MOVES
    ↓
JavaScript detects it (mousemove event)
    ↓
GSAP animates a photo card at that position
    ↓
Photo pops in → waits → fades out
```

---

## Part 1 — The Photo Cards (HTML)

We create **12 invisible photo boxes** on the screen when the page loads:

```html
<div class="trail-container">         ← the invisible floor all photos sit on

  <div class="trail-item">            ← photo box 1 (invisible to start)
    <img src="photo1.jpg" />
  </div>

  <div class="trail-item">            ← photo box 2 (invisible to start)
    <img src="photo2.jpg" />
  </div>

  ... (12 total)

</div>
```

**Why 12 boxes?**
Because creating and deleting HTML elements on every mouse move is SLOW.
Instead we create 12 boxes upfront, and we RECYCLE them over and over.
Box 1 → Box 2 → Box 3 → ... → Box 12 → Box 1 again → repeat forever.
This is called a **pool** (like a pool of workers — you reuse them instead of hiring new ones each time).

---

## Part 2 — The CSS (How Cards Are Styled)

```css
.trail-container {
  position: absolute;   /* sits inside the slide, NOT floating over the whole page */
  pointer-events: none; /* your mouse clicks pass THROUGH it — it never blocks you */
  z-index: 1;           /* layer 1 = behind the text (text is on layer 2) */
}

.trail-item {
  position: absolute;   /* each card can be placed anywhere with x and y */
  opacity: 0;           /* INVISIBLE by default — GSAP makes them visible */
  width: 160px;
  aspect-ratio: 3/4;    /* portrait rectangle shape (like a phone screen) */
}
```

**The most important rule:**
Cards start INVISIBLE (`opacity: 0`).
GSAP is the one that makes them appear and disappear.
CSS just sets up the stage.

---

## Part 3 — The JavaScript Logic (TypeScript)

### Step A — Watch the Mouse

```typescript
window.addEventListener('mousemove', (e) => {
  // e.clientX = how far from the left edge of screen your mouse is
  // e.clientY = how far from the top edge of screen your mouse is

  // only show a new photo if mouse moved at least 70px since last photo
  // (otherwise photos appear TOO fast and pile up)
  if (distance < 70) return; // "return" means STOP, do nothing

  spawnAt(e.clientX, e.clientY); // show a photo at this position
});
```

**Plain English:**
"Hey browser, whenever the mouse moves, run this code.
But only do something if the mouse moved far enough since last time."

---

### Step B — Show a Photo (the spawnAt function)

```typescript
function spawnAt(x, y) {

  // Pick the next card from the pool (round-robin recycling)
  const card = trailItems[poolIndex % 12]; // % means "remainder" — keeps cycling 0-11
  poolIndex++; // move to next card for next time

  // x, y are screen coordinates. We need to convert them to
  // be RELATIVE to the container box (not the whole screen)
  const rect = container.getBoundingClientRect(); // where is the container on screen?
  const localX = x - rect.left; // x position INSIDE the container
  const localY = y - rect.top;  // y position INSIDE the container

  // GSAP: place the card at the mouse position, make it visible, start small
  gsap.set(card, { x: localX, y: localY, opacity: 1, scale: 0.55 });

  // GSAP: grow the card to full size (pop-in effect)
  gsap.to(card, { scale: 1, duration: 0.6 });

  // GSAP: after 0.35 seconds, fade it out and drift it downward
  gsap.to(card, { opacity: 0, y: localY + 40, duration: 0.9, delay: 0.35 });
}
```

**Plain English:**
1. Grab the next available card
2. Move it to where the mouse is
3. Make it visible and small (0.55 = 55% of full size)
4. Grow it to full size over 0.6 seconds
5. After 0.35 seconds, fade it out and move it down 40px

---

## What is GSAP?

GSAP = **GreenSock Animation Platform**

It's a JavaScript library that makes animations easy.
Instead of writing complex math for smooth motion, you just say:

```typescript
gsap.to(element, { opacity: 0, duration: 1 })
// "animate this element TO opacity 0, taking 1 second"

gsap.from(element, { y: 100, opacity: 0, duration: 0.6 })
// "animate FROM y:100 and invisible TO its current position and visible"

gsap.set(element, { x: 200, y: 300 })
// "instantly place this element at x:200, y:300 — no animation"
```

Think of GSAP like a remote control for HTML elements.

---

## What is NgZone and Why Do We Use It?

Angular watches your code for changes so it can update the screen.
But `mousemove` fires 60+ times per second.
If Angular watched every single mouse move, the page would be sluggish.

```typescript
// BAD — Angular rechecks everything 60 times per second
window.addEventListener('mousemove', handler);

// GOOD — Angular ignores this, GSAP handles it directly
this.zone.runOutsideAngular(() => {
  window.addEventListener('mousemove', handler);
});
```

**Plain English:**
"Hey Angular, don't watch this part — GSAP is handling it, you'd just slow things down."

---

## What is viewChild / viewChildren?

These are Angular's way of grabbing HTML elements without using `document.querySelector`.

```typescript
// OLD WAY (bad in Angular — bypasses the framework):
const el = document.querySelector('.trail-item');

// ANGULAR WAY (correct):
// 1. Put #myRef on the HTML element
//    <div #myRef>
// 2. Grab it in TypeScript:
container  = viewChild.required<ElementRef<HTMLElement>>('container');
trailItems = viewChildren<ElementRef<HTMLElement>>('trailItem');
// 3. Use it:
container().nativeElement  // ← the actual HTML element
trailItems()               // ← array of all #trailItem elements
```

**Why bother?**
Angular tracks these refs properly. If the element disappears, Angular knows.
With `document.querySelector` Angular has no idea what you're doing.

---

## Why Pool / Recycling?

**Without recycling (bad):**
```
Mouse moves → create new <div> → animate it → delete it → repeat
Mouse moves → create new <div> → animate it → delete it → repeat
```
Creating and deleting DOM elements is expensive. Doing it 60x per second = laggy.

**With recycling (good):**
```
At startup → create 12 <div>s once
Mouse moves → reuse box 1 → reuse box 2 → ... → reuse box 12 → back to box 1
```
No creating. No deleting. Just moving existing boxes around. Super fast.

---

## How It's Connected to the Hero Slide

```html
<!-- home.html -->
<section class="slide slide-0">

  <!-- 1. Trail goes FIRST — so it's below the text in layer order -->
  <app-image-trail [size]="160" [gap]="70" />

  <!-- 2. Text goes SECOND — z-index:2 puts it above the trail -->
  <div class="slide-inner">
    <h1>Portfolio.</h1>
  </div>

</section>
```

```scss
/* home.scss */
.slide {
  isolation: isolate; /* THIS IS THE KEY LINE */
  /* Without this, z-index values don't work properly inside the slide */
  /* With this, z-index 1 (trail) vs z-index 2 (text) works perfectly */
}
```

**Plain English for `isolation: isolate`:**
Think of it like drawing on separate sheets of transparent paper.
`isolation: isolate` says "this slide is its OWN stack of sheets."
The trail is on sheet 1, the text is on sheet 2.
Sheet 2 is always on top of sheet 1 — text wins, always.

---

## The [size] and [gap] Inputs Explained

```html
<app-image-trail [size]="160" [gap]="70" />
```

| Input  | What it does | Try changing to... |
|--------|-------------|-------------------|
| `size` | Width of each photo card in pixels | `80` = tiny cards, `300` = huge cards |
| `gap`  | How many pixels your mouse must move before a new photo appears | `20` = dense trail, `150` = sparse trail |

---

## Quick Summary — The Whole Flow

```
Page loads
  → 12 invisible photo boxes created in HTML (the pool)

User moves mouse
  → JavaScript measures distance moved
  → If moved enough (gap = 70px), run spawnAt()

spawnAt() runs
  → Round-robin pick the next box from the pool
  → Convert screen coords to container-local coords
  → GSAP: place box at mouse position, make visible, scale 0.55
  → GSAP: grow to scale 1 over 0.6s  (pop-in)
  → GSAP: after 0.35s, fade to 0 and drift down 40px  (fade-out)

User navigates away
  → ngOnDestroy() runs
  → Remove mousemove listener (stop listening)
  → Kill all GSAP animations (clean up memory)
```

---

## Common Mistakes to Avoid

| Mistake | Why it breaks | Fix |
|---|---|---|
| Building the pool inside `ngAfterViewInit` | `@for` already ran with empty array — zero boxes exist | Build pool at class level (field initializer) |
| Using `position: fixed` on trail container | Floats over the ENTIRE page, ignores z-index | Use `position: absolute` |
| Forgetting `isolation: isolate` on the slide | z-index stops working, trail covers text | Add it to `.slide` in SCSS |
| Attaching mousemove inside NgZone | Angular change detection runs 60x/sec, page lags | Use `zone.runOutsideAngular()` |
| Forgetting `ngOnDestroy` cleanup | Memory leak — listener keeps firing after component gone | Always `removeEventListener` + `gsap.killTweensOf` |
