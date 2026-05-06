# Copilot Instructions

## Project Overview
This is an Angular portfolio project.

## Tech Stack
- Angular (latest)
- TypeScript
- SCSS
- Angular Router

## Development Guidelines
- Use Angular CLI conventions
- Follow Angular style guide
- Use SCSS for styling
- Implement lazy-loaded routing modules where appropriate


# Portfolio App — Build Agenda

## Stack
- **Framework:** Angular 19 (Standalone Components, Signals)
- **Styling:** SCSS + CSS Custom Properties
- **Animations:** GSAP 3 + ScrollTrigger + Lenis (smooth scroll)
- **Icons:** Lucide Angular / SVG inline
- **Fonts:** Variable fonts via Google Fonts (Inter + Clash Display)

---

## Phases

### Phase 1 — Foundation
- [x] Angular project scaffolded
- [ ] Install GSAP, Lenis, @gsap/ScrollTrigger
- [ ] Global SCSS design tokens (colors, spacing, typography)
- [ ] Lenis smooth scroll service
- [ ] Custom cursor component
- [ ] Page transition service (GSAP timeline per route)

---

### Phase 2 — Layout & Navigation
- [ ] Shell layout component (nav + router-outlet + footer)
- [ ] Magnetic navbar links (GSAP mouse follow)
- [ ] Animated hamburger → full-screen menu overlay
- [ ] Logo SVG morph on scroll
- [ ] Progress bar (scroll depth indicator)

---

### Phase 3 — Hero Section
- [ ] Full-viewport hero with Clash Display headline
- [ ] GSAP SplitText character stagger intro animation
- [ ] Floating 3D-tilt card (mouse parallax)
- [ ] Looping marquee ticker (available for work)
- [ ] Scroll-triggered hero exit (clip-path wipe)

---

### Phase 4 — About Section
- [ ] Horizontal scroll pinned section (ScrollTrigger pin)
- [ ] Scramble text effect on viewport entry
- [ ] Skill bars animated with GSAP fromTo
- [ ] Profile image reveal (masked SVG clip)
- [ ] Counter stats (years, projects, cups of coffee)

---

### Phase 5 — Work / Projects Section
- [ ] Filterable project grid (Angular signals for state)
- [ ] Project card hover — image scale + color overlay
- [ ] Case study page transition (shared element FLIP animation)
- [ ] Parallax project images on scroll
- [ ] Infinite loop carousel for tech stack logos

---

### Phase 6 — Services / Skills Section
- [ ] Accordion with GSAP height animation
- [ ] Rotating 3D cube skill display
- [ ] Scroll-triggered stagger cards

---

### Phase 7 — Testimonials / Social Proof
- [ ] Auto-play draggable slider (pointer events + GSAP inertia)
- [ ] Quote reveal word-by-word on scroll

---

### Phase 8 — Contact Section
- [ ] Magnetic CTA button
- [ ] Form field focus animations
- [ ] EmailJS or Formspree integration
- [ ] Footer link hover underline draw (SVG stroke-dashoffset)

---

### Phase 9 — Polish & Performance
- [ ] Preloader with counter + logo reveal
- [ ] Dark / light mode toggle (CSS custom property swap + GSAP crossfade)
- [ ] Reduced-motion media query fallbacks
- [ ] Lazy-loaded route chunks per section
- [ ] Lighthouse score target: 95+
- [ ] Meta tags + OG images

---

### Phase 10 — Deploy
- [ ] Build optimisation (budgets, esbuild)
- [ ] Deploy to Vercel / Netlify
- [ ] Custom domain + SSL

---

## Animation Principles (house rules)
1. **Ease:** `power3.out` for entrances, `power2.inOut` for transitions
2. **Duration:** 0.6s micro, 1–1.4s macro
3. **Stagger:** 0.08s between siblings
4. **ScrollTrigger scrub:** `scrub: 1.5` for parallax, `toggleActions` for snaps
5. **FLIP:** use GSAP Flip plugin for layout changes (filter, reorder)
6. **Never animate layout props** — use `transform` + `opacity` only
7. **Always kill ScrollTrigger instances** in Angular `ngOnDestroy` / effect cleanup

---

## Folder Structure (target)
```
src/
  app/
    core/
      services/
        lenis.service.ts
        cursor.service.ts
        theme.service.ts
    shared/
      components/
        cursor/
        magnetic-button/
        marquee/
        preloader/
    features/
      hero/
      about/
      work/
        project-card/
        case-study/
      services/
      testimonials/
      contact/
    layout/
      navbar/
      footer/
      page-transition/
  styles/
    _tokens.scss
    _typography.scss
    _mixins.scss
    _reset.scss
```
 YOU know about a how to made a best file strusture 
 
 u know all about responsivness u make a scrach website a fully resposive u make a animation website responisve
