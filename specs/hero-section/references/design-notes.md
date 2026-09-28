# Design reference — Full Chromatic Glass (Stitch)

Captured on 2026-09-28 from Stitch project **Portfolio** (`12622281097258900550`).

## Source screens

| Screen                                                   | ID                                 | Role                                      |
| -------------------------------------------------------- | ---------------------------------- | ----------------------------------------- |
| Modern Portfolio - Full Chromatic Glass WebGL Experience | `bc9f65e63899496ab5f86a38e6ae93d8` | Authoritative design for the site         |
| Shader                                                   | `7d877f3a501e40b8808157809a5b6844` | WebGL background used by the screen above |

## Local artifacts

| File                   | Content                                                      |
| ---------------------- | ------------------------------------------------------------ |
| `chromatic-glass.html` | Full page markup, Tailwind config, custom CSS and all texts  |
| `chromatic-glass.png`  | Desktop screenshot                                           |
| `shader.html`          | Self-contained WebGL fragment shader (simplex-noise ribbons) |

The HTML is the source of truth: **colors, animations and texts must match it exactly**.

## Scope of the `hero-section` feature

In scope:

- Global design tokens (colors, typography, spacing, radii, animations) in `src/styles/`.
- Fonts bundled from Fontsource.
- Hero section (`#overview`) with identical colors, animations and texts.
- CSS-only atmospheric background blooms (not shaders).
- Hero secondary CTA copies `carlosolcina23@gmail.com` to the clipboard and shows the design toast (see below).

Out of scope (future increments):

- WebGL shader background (`shader.html`).
- Floating navigation, projects / tech-stack / about / contact sections, footer (the design toast is implemented only for the hero copy interaction in this increment).
- Material Symbols icon font (reproduce the two hero icons as inline SVG).

## Typography

Families (from the Tailwind config in the HTML):

- Headlines (`font-headline-*`): `Newsreader`, serif. Loaded with `ital,opsz,wght@0,6..72,300..700;1,6..72,300..700`.
- Body and labels (`font-body-*`, `font-label-*`): `"Plus Jakarta Sans", "Inter", sans-serif`. Only upright weights are loaded (400–700); Inter is a fallback.

Fontsource packages (verified available, v5.3.0):

- `@fontsource-variable/newsreader` → family `'Newsreader Variable'`, weight axis 200–800, normal + italic. Entry CSS: `index.css`, `wght.css`, `wght-italic.css`, `opsz.css`, `opsz-italic.css`, `standard.css`, `standard-italic.css`.
- `@fontsource-variable/plus-jakarta-sans` → family `'Plus Jakarta Sans Variable'`, weight axis 200–800, normal + italic. Entry CSS: `index.css`, `wght.css`, `wght-italic.css`.

Recommended imports: Newsreader `index.css` + `wght-italic.css`; Plus Jakarta Sans `index.css`. No Google Fonts CDN.

Type scale (Tailwind config; class name → size / line-height / letter-spacing / weight):

| Token                | Size      | Line-height | Tracking | Weight |
| -------------------- | --------- | ----------- | -------- | ------ |
| `headline-xl`        | 3.75rem   | 1.08        | -0.03em  | 400    |
| `headline-xl-mobile` | 2.25rem   | 1.15        | -0.025em | 400    |
| `headline-lg`        | 2.5rem    | 1.15        | -0.025em | 400    |
| `headline-lg-mobile` | 1.85rem   | 1.2         | -0.02em  | 400    |
| `headline-md`        | 1.75rem   | 1.25        | -0.02em  | 400    |
| `headline-sm`        | 1.25rem   | 1.35        | -0.015em | 500    |
| `body-lg`            | 1.125rem  | 1.65        | -0.01em  | 400    |
| `body-md`            | 0.875rem  | 1.6         | -0.005em | 400    |
| `body-sm`            | 0.75rem   | 1.5         | 0.01em   | 400    |
| `label-md`           | 0.8125rem | 1.2         | 0.03em   | 500    |
| `label-sm`           | 0.6875rem | 1.2         | 0.06em   | 500    |

Note: Tailwind emits `tracking-*` / `leading-*` utilities after `text-*`, so they override the values embedded in the type classes. The hero uses `tracking-tight` (-0.025em) + `leading-[1.08]` on the h1, and `tracking-wide` (0.025em) + `leading-relaxed` (1.625) on the tagline; effective values are listed in the hero section below.

## Color tokens

Copied verbatim from the design's Tailwind config:

| Token                       | Value     |
| --------------------------- | --------- |
| `background`                | `#f8f9ff` |
| `surface`                   | `#f8f9ff` |
| `surface-dim`               | `#cbdbf5` |
| `surface-bright`            | `#f8f9ff` |
| `surface-container-lowest`  | `#ffffff` |
| `surface-container-low`     | `#eff4ff` |
| `surface-container`         | `#e5eeff` |
| `surface-container-high`    | `#dce9ff` |
| `surface-container-highest` | `#d3e4fe` |
| `surface-variant`           | `#d3e4fe` |
| `on-surface`                | `#0b1c30` |
| `on-surface-variant`        | `#464555` |
| `on-background`             | `#0b1c30` |
| `outline`                   | `#777587` |
| `outline-variant`           | `#c7c4d8` |
| `primary`                   | `#3525cd` |
| `on-primary`                | `#ffffff` |
| `primary-container`         | `#4f46e5` |
| `on-primary-container`      | `#dad7ff` |
| `secondary`                 | `#5d5e64` |
| `on-secondary`              | `#ffffff` |
| `secondary-container`       | `#dfdfe6` |
| `on-secondary-container`    | `#616269` |
| `tertiary`                  | `#3130c0` |
| `on-tertiary`               | `#ffffff` |
| `tertiary-container`        | `#4b4dd8` |
| `on-tertiary-container`     | `#d9d8ff` |
| `error`                     | `#ba1a1a` |
| `error-container`           | `#ffdad6` |
| `on-error`                  | `#ffffff` |
| `on-error-container`        | `#93000a` |

Tailwind palette colors used by the page (needed for exact reproduction):

| Name         | Value     |
| ------------ | --------- |
| `indigo-700` | `#4338ca` |
| `indigo-600` | `#4f46e5` |
| `indigo-500` | `#6366f1` |
| `indigo-400` | `#818cf8` |
| `indigo-300` | `#a5b4fc` |
| `indigo-200` | `#c7d2fe` |
| `violet-500` | `#8b5cf6` |
| `slate-900`  | `#0f172a` |
| `slate-800`  | `#1e293b` |
| `slate-700`  | `#334155` |
| `slate-500`  | `#64748b` |
| `slate-400`  | `#94a3b8` |
| `slate-300`  | `#cbd5e1` |

## Radii and spacing

Radii: `DEFAULT` 0.25rem, `lg` 0.5rem, `xl` 0.75rem, `2xl` 1rem, `full` 9999px.

Spacing tokens: `gutter` 1.5rem, `gutter-sm` 1rem, `margin` 2rem, `margin-sm` 1rem, `space-xs` 0.25rem, `space-sm` 0.5rem, `space-md` 1rem, `space-lg` 1.5rem, `space-xl` 2.5rem.

Breakpoints are Tailwind defaults: `md` = 768px, `lg` = 1024px.

## Animations and effects (copied from the HTML `<style>`)

```css
@keyframes fadeInSlideUp {
  0% {
    opacity: 0;
    transform: translateY(18px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fadeInSlideUp 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.animation-delay-100 {
  animation-delay: 100ms;
}
.animation-delay-200 {
  animation-delay: 200ms;
}
.animation-delay-300 {
  animation-delay: 300ms;
}
.animation-delay-400 {
  animation-delay: 400ms;
}

.glass-chromatic {
  background: rgba(255, 255, 255, 0.42);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow:
    0 16px 38px 0 rgba(79, 70, 229, 0.06),
    0 2px 8px 0 rgba(15, 23, 42, 0.03);
}
.glass-card-hover {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.glass-card-hover:hover {
  background: rgba(255, 255, 255, 0.62);
  border-color: rgba(129, 140, 248, 0.55);
  box-shadow:
    0 20px 42px -8px rgba(79, 70, 229, 0.14),
    0 0 24px -2px rgba(99, 102, 241, 0.16);
  transform: translateY(-3px);
}
```

Global rules: `html { scroll-behavior: smooth; }`, `::-webkit-scrollbar { display: none; }`,
`main > :first-child { margin-top: 0 !important; }`, `main > :last-child { margin-bottom: 0 !important; }`,
`body { overscroll-behavior: none; }`.

Reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Hero section (in scope)

Original markup (verbatim from `chromatic-glass.html`):

```html
<section
  class="pt-20 pb-20 md:pt-28 md:pb-28 border-b border-indigo-200/35 animate-fade-in-up relative z-10"
  id="overview"
>
  <div
    class="flex flex-col items-center text-center max-w-4xl mx-auto gap-8 relative z-10"
  >
    <div class="flex items-center">
      <!-- empty in the design (legacy status pill): omit -->
    </div>
    <div class="flex flex-col gap-6 items-center">
      <h1
        class="font-headline-xl text-headline-xl md:text-[4.25rem] text-slate-900 font-normal leading-[1.08] tracking-tight"
      >
        Desarrollo digital en la intersección de
        <span
          class="italic font-serif font-light bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-600 to-violet-500 inline-block drop-shadow-sm"
          >ingeniería e IA.</span
        >
      </h1>
      <p
        class="font-body-md md:text-[1.05rem] text-slate-700 leading-relaxed max-w-2xl font-light tracking-wide bg-white/45 backdrop-blur-xl py-2 px-5 rounded-xl border border-white/60 shadow-[0_4px_20px_rgba(79,70,229,0.04)]"
      >
        Ingeniero Full-Stack &amp; Arquitecto de Software IA. Desarrollo web de
        alto rendimiento con React, Next.js y TypeScript.
      </p>
      <div class="flex flex-wrap items-center justify-center gap-4 pt-2">
        <a
          class="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 via-primary to-indigo-600 hover:from-indigo-700 hover:via-indigo-600 hover:to-indigo-700 text-white font-label-md text-label-md font-medium hover:shadow-[0_10px_32px_rgba(79,70,229,0.45)] active:scale-95 transition-all duration-200 shadow-[0_4px_20px_rgba(79,70,229,0.3)] border border-primary/40 cursor-pointer"
          href="#projects"
        >
          <span class="tracking-wide">Ver Proyectos</span>
          <span
            class="material-symbols-outlined text-[18px] group-hover:translate-y-0.5 transition-transform duration-200"
            >arrow_downward</span
          >
        </a>
        <button
          class="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-white/50 backdrop-blur-xl border border-white/70 hover:border-indigo-300 hover:bg-white/75 text-slate-800 font-label-md text-label-md font-medium transition-all duration-200 active:scale-95 shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_6px_22px_rgba(79,70,229,0.12)] cursor-pointer"
          id="copy-email-hero-btn"
        >
          <span
            class="material-symbols-outlined text-[18px] text-primary group-hover:rotate-12 transition-transform duration-200"
            >content_copy</span
          >
          <span class="tracking-wide" id="copy-hero-text">Copiar Correo</span>
        </button>
      </div>
    </div>
  </div>
</section>
```

Effective computed values:

- Section: padding-block 5rem, 7rem at ≥768px; border-bottom 1px rgba(199, 210, 254, 0.35) (`indigo-200/35`); animation `fadeInSlideUp` 0.75s `cubic-bezier(0.16, 1, 0.3, 1)` forwards, no delay; `position: relative; z-index: 10`.
- Container: max-width 56rem, margin-inline auto, flex column centered, text-center, gap 2rem.
- H1: Newsreader 400; 3.75rem mobile, 4.25rem at ≥768px; line-height 1.08; letter-spacing -0.025em; color `#0f172a`.
- Gradient span: italic 300; gradient left→right `#3525cd` → `#4f46e5` → `#8b5cf6`; `background-clip: text; color: transparent; display: inline-block`; subtle drop shadow.
- Tagline: 0.875rem mobile, 1.05rem at ≥768px; line-height 1.625; letter-spacing 0.025em; weight 300; color `#334155`; glass box: background rgba(255,255,255,0.45), backdrop-filter blur(24px), radius 0.75rem, border 1px rgba(255,255,255,0.6), shadow `0 4px 20px rgba(79,70,229,0.04)`, padding 0.5rem 1.25rem, max-width 42rem.
- Actions: flex wrap centered, gap 1rem, padding-top 0.5rem.
- Primary CTA (`Ver Proyectos`, href `#projects`): gradient background left→right `#4f46e5` → `#3525cd` → `#4f46e5`; hover `#4338ca` → `#4f46e5` → `#4338ca`; white text `label-md`; padding 0.875rem 1.75rem; radius full; border 1px rgba(53,37,205,0.4); rest shadow `0 4px 20px rgba(79,70,229,0.3)`; hover shadow `0 10px 32px rgba(79,70,229,0.45)`; icon 18px translates 2px down on hover; `active: scale(0.95)`; transition 200ms all.
- Secondary CTA (`Copiar Correo`): background rgba(255,255,255,0.5), blur 24px, border 1px rgba(255,255,255,0.7), text `#1e293b`; hover border `#a5b4fc`, background rgba(255,255,255,0.75), shadow `0 6px 22px rgba(79,70,229,0.12)`; rest shadow `0 4px 16px rgba(15,23,42,0.04)`; icon 18px `#3525cd` rotates 12deg on hover; `active: scale(0.95)`; transition 200ms all.
  - The design attaches clipboard (`alex@example.com`, replaced by the real address `carlosolcina23@gmail.com`) and toast (`Correo copiado al portapapeles`) behaviour; now in scope (see Toast below).
- Texts (verbatim):
  - H1: `Desarrollo digital en la intersección de` + `ingeniería e IA.`
  - Tagline: `Ingeniero Full-Stack & Arquitecto de Software IA. Desarrollo web de alto rendimiento con React, Next.js y TypeScript.`
  - Buttons: `Ver Proyectos`, `Copiar Correo`.

### Toast (in scope)

Exact markup from the design (ids kept for reference):

```html
<div
  class="fixed bottom-6 right-6 z-50 transform translate-y-24 opacity-0 pointer-events-none transition-all duration-300 flex items-center gap-2.5 px-5 py-3.5 rounded-xl bg-white/85 backdrop-blur-xl border border-white/90 text-slate-900 shadow-[0_12px_36px_rgba(79,70,229,0.18)]"
  id="toast"
>
  <span class="material-symbols-outlined text-primary text-[18px]"
    >check_circle</span
  >
  <span class="font-body-md text-body-md font-medium" id="toast-text"
    >¡Copiado!</span
  >
</div>
```

Effective computed values:

- Box: fixed; bottom 1.5rem; right 1.5rem; z-index 50; flex row, align-items center, gap 0.625rem; padding 0.875rem 1.25rem; border-radius 0.75rem; background rgba(255,255,255,0.85); backdrop-filter blur(24px); border 1px rgba(255,255,255,0.9); color #0f172a; box-shadow 0 12px 36px rgba(79,70,229,0.18); transition all 300ms cubic-bezier(0.4, 0, 0.2, 1).
- Hidden state: `transform: translateY(6rem); opacity: 0; pointer-events: none`.
- Visible state: `transform: translateY(0); opacity: 1`.
- Icon: `check_circle` at 18px in `#3525cd` (inline SVG replica needed).
- Text: `body-md` typography at weight 500; message `Correo copiado al portapapeles`.
- Behaviour: appears on copy; auto-hides 2600ms after the last call.

## Page shell

- `<html lang="es" class="light scroll-smooth">`.
- Body: background `linear-gradient(to bottom, rgba(246,248,255,0.85), rgba(240,244,255,0.8), rgba(238,242,255,0.9))`; body font and color `#0b1c30`; antialiased; selection background rgba(53,37,205,0.2), selection color `#3525cd`; `min-height: 100vh`; `overflow-x: hidden`.
- Content container: max-width 72rem, padding-inline 1.5rem (3rem at ≥1024px); `main` padding-top 4rem (fixed-nav offset in the design).
- Atmospheric blooms (CSS-only, in scope): fixed full-viewport layer, opacity 0.6, `pointer-events: none`, containing three blurred gradient blobs:
  - top-left: 55vw circle at top -15% / left -10%; `linear-gradient(to bottom right, rgba(129,140,248,0.2), rgba(216,180,254,0.15), transparent)`; blur 130px.
  - right: 50vw circle at top 35% / right -12%; `linear-gradient(to bottom left, rgba(103,232,249,0.2), rgba(96,165,250,0.15), transparent)`; blur 140px.
  - bottom-left: 60vw × 45vw at bottom -8% / left 12%; `linear-gradient(to top right, rgba(196,181,253,0.2), rgba(199,210,254,0.2), rgba(251,207,232,0.15))`; blur 150px.

## WebGL background (out of scope now, noted for later)

- Canvas fixed, full screen, `-z-10`, `pointer-events: none`.
- Fragment shader: three octaves of simplex noise; base `#f5f7ff`, indigo `(0.31, 0.27, 0.90)`, violet `(0.58, 0.38, 0.96)`, cyan glow `(0.18, 0.70, 0.95)`, warm tone `(0.98, 0.88, 0.85)`; mouse wave/glow; film grain. Full source in `shader.html`.

## Rest of the page (future increments; texts verbatim in `chromatic-glass.html`)

- Floating glass nav: brand `Carlos Olcina`; links `Inicio`, `Proyectos`, `Stack Tecnológico`, `Sobre mí`, `Contacto`; CTA `Contactar`.
- Projects: `Proyectos Seleccionados` / `Proyectos con visión`; flagship `Synapse`; cards `Aether Cloud`, `Kortex Editor`, `Vanguard CLI`.
- Tech stack: `Tecnologías y herramientas clave`; categories `Frontend`, `Backend y Nube`, `IA y Sistemas`, `Flujo de Trabajo y Diseño`; quote `"Código limpio, arquitectura escalable y rendimiento sin fricción."`.
- About: `Ingeniería con impacto & precisión`; experience timeline `2023 — Presente`, `2021 — 2023`, `2018 — 2021`.
- Contact: `Construyamos algo increíble juntos`; email `carlosolcina23@gmail.com` (replaces the design placeholder); Cal.com booking; form.
- Footer: `Carlos Olcina`, `Ingeniero Senior Full-Stack y Sistemas de IA`, `València, España (CET / UTC+1)`, links `GitHub` / `X` / `LinkedIn`.
