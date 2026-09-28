# Requirements — hero-section

- **Feature:** `hero-section` (id 2, `sdd: true`).
- **Source of truth:** `specs/hero-section/references/chromatic-glass.html` (hero markup: lines 551–611; toast markup: lines 2111–2121; page shell: lines 1–11 and 274; global styles: lines 30–108) and its digest `specs/hero-section/references/design-notes.md`.
- **In scope:** global design tokens, Fontsource fonts, base page styles, hero section, CSS atmospheric blooms, layout/page wiring, the hero secondary CTA clipboard enhancement (copy the contact email + design toast) and tests.
- **Out of scope (future increments):** WebGL shader background (`shader.html`), floating nav, projects / tech-stack / about / contact sections, footer, reuse of the toast outside the hero copy interaction (contact form and other sections), Material Symbols icon font, Tailwind or any new UI framework.

**Notation.** Every requirement uses EARS and contains exactly one `MUST` / `MUST NOT`. Ids `R<n>` are stable. "The design reference" means `design-notes.md` plus the HTML it digests. Values in tables are the **effective computed values** of the design, after Tailwind utility overrides. Every requirement is verified by at least one Vitest test (see `Traceability` at the end).

---

## 1. Global design tokens

### R1 — Semantic color tokens

The system MUST expose the design's 31 semantic color tokens as CSS custom properties in `src/styles/tokens.css` with the exact values below.

| Custom property                     | Value     |
| ----------------------------------- | --------- |
| `--color-background`                | `#f8f9ff` |
| `--color-surface`                   | `#f8f9ff` |
| `--color-surface-dim`               | `#cbdbf5` |
| `--color-surface-bright`            | `#f8f9ff` |
| `--color-surface-container-lowest`  | `#ffffff` |
| `--color-surface-container-low`     | `#eff4ff` |
| `--color-surface-container`         | `#e5eeff` |
| `--color-surface-container-high`    | `#dce9ff` |
| `--color-surface-container-highest` | `#d3e4fe` |
| `--color-surface-variant`           | `#d3e4fe` |
| `--color-on-surface`                | `#0b1c30` |
| `--color-on-surface-variant`        | `#464555` |
| `--color-on-background`             | `#0b1c30` |
| `--color-outline`                   | `#777587` |
| `--color-outline-variant`           | `#c7c4d8` |
| `--color-primary`                   | `#3525cd` |
| `--color-on-primary`                | `#ffffff` |
| `--color-primary-container`         | `#4f46e5` |
| `--color-on-primary-container`      | `#dad7ff` |
| `--color-secondary`                 | `#5d5e64` |
| `--color-on-secondary`              | `#ffffff` |
| `--color-secondary-container`       | `#dfdfe6` |
| `--color-on-secondary-container`    | `#616269` |
| `--color-tertiary`                  | `#3130c0` |
| `--color-on-tertiary`               | `#ffffff` |
| `--color-tertiary-container`        | `#4b4dd8` |
| `--color-on-tertiary-container`     | `#d9d8ff` |
| `--color-error`                     | `#ba1a1a` |
| `--color-error-container`           | `#ffdad6` |
| `--color-on-error`                  | `#ffffff` |
| `--color-on-error-container`        | `#93000a` |

**Verification:** `tests/tokens.test.ts` → `exposes_semantic_color_tokens`.

### R2 — Page palette color tokens

The system MUST expose the 13 Tailwind palette colors used by the design as CSS custom properties in `src/styles/tokens.css` with the exact hex values below.

| Custom property      | Value     |
| -------------------- | --------- |
| `--color-indigo-700` | `#4338ca` |
| `--color-indigo-600` | `#4f46e5` |
| `--color-indigo-500` | `#6366f1` |
| `--color-indigo-400` | `#818cf8` |
| `--color-indigo-300` | `#a5b4fc` |
| `--color-indigo-200` | `#c7d2fe` |
| `--color-violet-500` | `#8b5cf6` |
| `--color-slate-900`  | `#0f172a` |
| `--color-slate-800`  | `#1e293b` |
| `--color-slate-700`  | `#334155` |
| `--color-slate-500`  | `#64748b` |
| `--color-slate-400`  | `#94a3b8` |
| `--color-slate-300`  | `#cbd5e1` |

**Verification:** `tests/tokens.test.ts` → `exposes_page_palette_color_tokens`.

### R3 — Typography family tokens

The system MUST expose two font-family custom properties in `src/styles/tokens.css`: `--font-headline` with the value `'Newsreader Variable', Newsreader, serif` and `--font-body` with the value `'Plus Jakarta Sans Variable', 'Plus Jakarta Sans', sans-serif`.

**Verification:** `tests/tokens.test.ts` → `exposes_font_family_tokens`.

### R4 — Typography scale tokens

The system MUST expose all 11 entries of the design's typography scale as CSS custom properties in `src/styles/tokens.css`, each with the exact family / size / line-height / letter-spacing / weight below.

| Scale entry          | Family token      | Size custom property             | Size        | Line-height custom property             | Line-height | Tracking custom property                   | Tracking   | Weight custom property             | Weight |
| -------------------- | ----------------- | -------------------------------- | ----------- | --------------------------------------- | ----------- | ------------------------------------------ | ---------- | ---------------------------------- | ------ |
| `headline-xl`        | `--font-headline` | `--text-headline-xl-size`        | `3.75rem`   | `--text-headline-xl-line-height`        | `1.08`      | `--text-headline-xl-letter-spacing`        | `-0.03em`  | `--text-headline-xl-weight`        | `400`  |
| `headline-xl-mobile` | `--font-headline` | `--text-headline-xl-mobile-size` | `2.25rem`   | `--text-headline-xl-mobile-line-height` | `1.15`      | `--text-headline-xl-mobile-letter-spacing` | `-0.025em` | `--text-headline-xl-mobile-weight` | `400`  |
| `headline-lg`        | `--font-headline` | `--text-headline-lg-size`        | `2.5rem`    | `--text-headline-lg-line-height`        | `1.15`      | `--text-headline-lg-letter-spacing`        | `-0.025em` | `--text-headline-lg-weight`        | `400`  |
| `headline-lg-mobile` | `--font-headline` | `--text-headline-lg-mobile-size` | `1.85rem`   | `--text-headline-lg-mobile-line-height` | `1.2`       | `--text-headline-lg-mobile-letter-spacing` | `-0.02em`  | `--text-headline-lg-mobile-weight` | `400`  |
| `headline-md`        | `--font-headline` | `--text-headline-md-size`        | `1.75rem`   | `--text-headline-md-line-height`        | `1.25`      | `--text-headline-md-letter-spacing`        | `-0.02em`  | `--text-headline-md-weight`        | `400`  |
| `headline-sm`        | `--font-headline` | `--text-headline-sm-size`        | `1.25rem`   | `--text-headline-sm-line-height`        | `1.35`      | `--text-headline-sm-letter-spacing`        | `-0.015em` | `--text-headline-sm-weight`        | `500`  |
| `body-lg`            | `--font-body`     | `--text-body-lg-size`            | `1.125rem`  | `--text-body-lg-line-height`            | `1.65`      | `--text-body-lg-letter-spacing`            | `-0.01em`  | `--text-body-lg-weight`            | `400`  |
| `body-md`            | `--font-body`     | `--text-body-md-size`            | `0.875rem`  | `--text-body-md-line-height`            | `1.6`       | `--text-body-md-letter-spacing`            | `-0.005em` | `--text-body-md-weight`            | `400`  |
| `body-sm`            | `--font-body`     | `--text-body-sm-size`            | `0.75rem`   | `--text-body-sm-line-height`            | `1.5`       | `--text-body-sm-letter-spacing`            | `0.01em`   | `--text-body-sm-weight`            | `400`  |
| `label-md`           | `--font-body`     | `--text-label-md-size`           | `0.8125rem` | `--text-label-md-line-height`           | `1.2`       | `--text-label-md-letter-spacing`           | `0.03em`   | `--text-label-md-weight`           | `500`  |
| `label-sm`           | `--font-body`     | `--text-label-sm-size`           | `0.6875rem` | `--text-label-sm-line-height`           | `1.2`       | `--text-label-sm-letter-spacing`           | `0.06em`   | `--text-label-sm-weight`           | `500`  |

**Verification:** `tests/tokens.test.ts` → `exposes_typography_scale_tokens`.

### R5 — Spacing tokens

The system MUST expose the design's nine spacing tokens as CSS custom properties in `src/styles/tokens.css` with the exact values below.

| Custom property     | Value     |
| ------------------- | --------- |
| `--space-gutter`    | `1.5rem`  |
| `--space-gutter-sm` | `1rem`    |
| `--space-margin`    | `2rem`    |
| `--space-margin-sm` | `1rem`    |
| `--space-xs`        | `0.25rem` |
| `--space-sm`        | `0.5rem`  |
| `--space-md`        | `1rem`    |
| `--space-lg`        | `1.5rem`  |
| `--space-xl`        | `2.5rem`  |

**Verification:** `tests/tokens.test.ts` → `exposes_spacing_tokens`.

### R6 — Radius tokens

The system MUST expose the design's five border-radius tokens as CSS custom properties in `src/styles/tokens.css` with the exact values below.

| Custom property    | Value     |
| ------------------ | --------- |
| `--radius-default` | `0.25rem` |
| `--radius-lg`      | `0.5rem`  |
| `--radius-xl`      | `0.75rem` |
| `--radius-2xl`     | `1rem`    |
| `--radius-full`    | `9999px`  |

**Verification:** `tests/tokens.test.ts` → `exposes_radius_tokens`.

---

## 2. Fonts

### R7 — Fontsource dependencies

The system MUST declare `@fontsource-variable/newsreader` and `@fontsource-variable/plus-jakarta-sans` in the `dependencies` section of `package.json`.

**Verification:** `tests/fonts.test.ts` → `declares_fontsource_dependencies`.

### R8 — Fontsource stylesheet imports

The system MUST import the Fontsource entry stylesheets `@fontsource-variable/newsreader/index.css`, `@fontsource-variable/newsreader/wght-italic.css` and `@fontsource-variable/plus-jakarta-sans/index.css` from `src/styles/global.css`, so both variable families — including the Newsreader italic face — are bundled locally at build time.

**Verification:** `tests/fonts.test.ts` → `imports_fontsource_entry_stylesheets`.

### R9 — No external font providers

The system MUST NOT reference external font providers (`fonts.googleapis.com`, `fonts.gstatic.com` or any remote `@font-face` / font stylesheet URL) in its source files or in the generated home page.

**Verification:** `tests/fonts.test.ts` → `does_not_reference_external_font_providers`.

---

## 3. Base page styles

### R10 — Body styles

The system MUST apply the design's body styles with the exact declarations below.

| Declaration               | Value                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `background-image`        | `linear-gradient(to bottom, rgba(246, 248, 255, 0.85), rgba(240, 244, 255, 0.8), rgba(238, 242, 255, 0.9))` |
| `color`                   | `var(--color-on-surface)` (`#0b1c30`)                                                                       |
| `font-family`             | `var(--font-body)`                                                                                          |
| `font-size`               | `var(--text-body-md-size)` (`0.875rem`)                                                                     |
| `line-height`             | `var(--text-body-md-line-height)` (`1.6`)                                                                   |
| `letter-spacing`          | `var(--text-body-md-letter-spacing)` (`-0.005em`)                                                           |
| `font-weight`             | `var(--text-body-md-weight)` (`400`)                                                                        |
| `-webkit-font-smoothing`  | `antialiased`                                                                                               |
| `-moz-osx-font-smoothing` | `grayscale`                                                                                                 |
| `overscroll-behavior`     | `none`                                                                                                      |
| `min-height`              | `100vh`                                                                                                     |
| `overflow-x`              | `hidden`                                                                                                    |

**Verification:** `tests/global-styles.test.ts` → `applies_design_body_styles`.

### R11 — Base resets

The system MUST apply the design's element resets before any component styles, with the exact rules below.

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
}

h1,
p {
  margin: 0;
}

a {
  color: inherit;
  text-decoration: inherit;
}

button {
  font: inherit;
  color: inherit;
  background-color: transparent;
  border: 0;
  padding: 0;
  margin: 0;
}

main > :first-child {
  margin-top: 0 !important;
}

main > :last-child {
  margin-bottom: 0 !important;
}
```

**Verification:** `tests/global-styles.test.ts` → `applies_base_resets`.

### R12 — Selection colors

The system MUST apply the design's text-selection colors: `::selection { background-color: rgba(53, 37, 205, 0.2); color: var(--color-primary); }`.

**Verification:** `tests/global-styles.test.ts` → `applies_selection_colors`.

### R13 — Hidden WebKit scrollbar

The system MUST hide the WebKit scrollbar with `::-webkit-scrollbar { display: none; }`.

**Verification:** `tests/global-styles.test.ts` → `hides_webkit_scrollbar`.

### R14 — Smooth scrolling

The system MUST enable smooth scrolling on the document root with `html { scroll-behavior: smooth; }`.

**Verification:** `tests/global-styles.test.ts` → `enables_smooth_scroll`.

### R15 — Reduced motion

WHILE the user has `prefers-reduced-motion: reduce` enabled, the system MUST collapse animations and transitions and disable smooth scrolling with the exact design overrides below.

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

**Verification:** `tests/global-styles.test.ts` → `honors_reduced_motion`.

### R16 — Entrance animation and delays

The system MUST define the `fadeInSlideUp` keyframes, the `.animate-fade-in-up` utility and the four animation-delay utilities exactly as below.

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
```

**Verification:** `tests/global-styles.test.ts` → `defines_fade_in_up_animation_and_delays`.

---

## 4. Hero section

### R17 — Hero structure

The system MUST render the hero as a `<section id="overview">` composed of a single headline `<h1>`, a tagline `<p>`, and an actions container that holds exactly one primary anchor (`<a>`) and exactly one secondary `<button>`.

**Verification:** `tests/hero.test.ts` → `renders_hero_structure` (renders `src/components/HeroSection.astro` with the Astro Container API).

### R18 — Verbatim hero texts

The system MUST render the hero texts verbatim from the design:

| Element             | Text (verbatim)                                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `<h1>`              | `Desarrollo digital en la intersección de ingeniería e IA.`, with `ingeniería e IA.` as the gradient fragment           |
| Tagline `<p>`       | `Ingeniero Full-Stack & Arquitecto de Software IA. Desarrollo web de alto rendimiento con React, Next.js y TypeScript.` |
| Primary CTA label   | `Ver Proyectos`                                                                                                         |
| Secondary CTA label | `Copiar Correo`                                                                                                         |

**Verification:** `tests/hero.test.ts` → `renders_verbatim_hero_texts`.

### R19 — Headline styles

The system MUST style the hero `<h1>` with the exact declarations below.

| Declaration                     | Value                                          |
| ------------------------------- | ---------------------------------------------- |
| `font-family`                   | `var(--font-headline)`                         |
| `font-weight`                   | `var(--text-headline-xl-weight)` (`400`)       |
| `font-size`                     | `var(--text-headline-xl-size)` (`3.75rem`)     |
| `font-size` at viewports ≥768px | `4.25rem`                                      |
| `line-height`                   | `var(--text-headline-xl-line-height)` (`1.08`) |
| `letter-spacing`                | `-0.025em`                                     |
| `color`                         | `var(--color-slate-900)` (`#0f172a`)           |

**Verification:** `tests/hero.test.ts` → `styles_hero_headline`.

### R20 — Gradient accent fragment

The system MUST style the `ingeniería e IA.` fragment with the exact declarations below.

| Declaration                                   | Value                                                                                               |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `display`                                     | `inline-block`                                                                                      |
| `font-style`                                  | `italic`                                                                                            |
| `font-family`                                 | `var(--font-headline)`                                                                              |
| `font-weight`                                 | `300`                                                                                               |
| `background-image`                            | `linear-gradient(to right, var(--color-primary), var(--color-indigo-600), var(--color-violet-500))` |
| `background-clip` / `-webkit-background-clip` | `text`                                                                                              |
| `color`                                       | `transparent`                                                                                       |
| `filter`                                      | `drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05))`                                                        |

**Verification:** `tests/hero.test.ts` → `styles_gradient_accent_fragment`.

### R21 — Glass tagline

The system MUST style the tagline `<p>` as the design's glass box with the exact declarations below.

| Declaration                                   | Value                                   |
| --------------------------------------------- | --------------------------------------- |
| `font-family`                                 | `var(--font-body)`                      |
| `font-weight`                                 | `300`                                   |
| `font-size`                                   | `var(--text-body-md-size)` (`0.875rem`) |
| `font-size` at viewports ≥768px               | `1.05rem`                               |
| `line-height`                                 | `1.625`                                 |
| `letter-spacing`                              | `0.025em`                               |
| `color`                                       | `var(--color-slate-700)` (`#334155`)    |
| `max-width`                                   | `42rem`                                 |
| `padding`                                     | `0.5rem 1.25rem`                        |
| `border-radius`                               | `var(--radius-xl)` (`0.75rem`)          |
| `background-color`                            | `rgba(255, 255, 255, 0.45)`             |
| `backdrop-filter` / `-webkit-backdrop-filter` | `blur(24px)`                            |
| `border`                                      | `1px solid rgba(255, 255, 255, 0.6)`    |
| `box-shadow`                                  | `0 4px 20px rgba(79, 70, 229, 0.04)`    |

**Verification:** `tests/hero.test.ts` → `styles_glass_tagline`.

### R22 — Primary CTA

The system MUST style the primary CTA as an anchor pointing to `#projects`, with the exact rest, hover and active states below.

| State / property         | Value                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `href`                   | `#projects`                                                                                            |
| `padding`                | `0.875rem 1.75rem`                                                                                     |
| `gap`                    | `0.625rem`                                                                                             |
| `border-radius`          | `var(--radius-full)`                                                                                   |
| `color`                  | `#ffffff`                                                                                              |
| `background-image`       | `linear-gradient(to right, var(--color-indigo-600), var(--color-primary), var(--color-indigo-600))`    |
| `border`                 | `1px solid rgba(53, 37, 205, 0.4)`                                                                     |
| `box-shadow`             | `0 4px 20px rgba(79, 70, 229, 0.3)`                                                                    |
| Label `font-size`        | `var(--text-label-md-size)` (`0.8125rem`)                                                              |
| Label `line-height`      | `var(--text-label-md-line-height)` (`1.2`)                                                             |
| Label `font-weight`      | `var(--text-label-md-weight)` (`500`)                                                                  |
| Label `letter-spacing`   | `0.025em`                                                                                              |
| `transition`             | `all 200ms cubic-bezier(0.4, 0, 0.2, 1)`                                                               |
| Hover `background-image` | `linear-gradient(to right, var(--color-indigo-700), var(--color-indigo-600), var(--color-indigo-700))` |
| Hover `box-shadow`       | `0 10px 32px rgba(79, 70, 229, 0.45)`                                                                  |
| Active `transform`       | `scale(0.95)`                                                                                          |

**Verification:** `tests/hero.test.ts` → `styles_primary_cta`.

### R23 — Secondary CTA

The system MUST render the secondary CTA as an enabled `<button type="button">` (no `aria-disabled`, no `disabled`) and style it with the exact rest, hover and active states below.

| State / property                              | Value                                      |
| --------------------------------------------- | ------------------------------------------ |
| `padding`                                     | `0.875rem 1.75rem`                         |
| `gap`                                         | `0.625rem`                                 |
| `border-radius`                               | `var(--radius-full)`                       |
| `color`                                       | `var(--color-slate-800)` (`#1e293b`)       |
| `background-color`                            | `rgba(255, 255, 255, 0.5)`                 |
| `backdrop-filter` / `-webkit-backdrop-filter` | `blur(24px)`                               |
| `border`                                      | `1px solid rgba(255, 255, 255, 0.7)`       |
| `box-shadow`                                  | `0 4px 16px rgba(15, 23, 42, 0.04)`        |
| Label `font-size`                             | `var(--text-label-md-size)` (`0.8125rem`)  |
| Label `line-height`                           | `var(--text-label-md-line-height)` (`1.2`) |
| Label `font-weight`                           | `var(--text-label-md-weight)` (`500`)      |
| Label `letter-spacing`                        | `0.025em`                                  |
| `transition`                                  | `all 200ms cubic-bezier(0.4, 0, 0.2, 1)`   |
| Hover `border-color`                          | `var(--color-indigo-300)` (`#a5b4fc`)      |
| Hover `background-color`                      | `rgba(255, 255, 255, 0.75)`                |
| Hover `box-shadow`                            | `0 6px 22px rgba(79, 70, 229, 0.12)`       |
| Active `transform`                            | `scale(0.95)`                              |

**Verification:** `tests/hero.test.ts` → `styles_secondary_cta` (also asserts the button is enabled and carries no `aria-disabled` / `disabled`).

### R24 — Inline SVG icons

The system MUST render both hero icons as decorative inline SVGs — no icon font — with the exact contract below.

| Icon                 | Requirements                                                                                                                                                                                                                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `arrow_downward`     | `<svg viewBox="0 -960 960 960" width="18" height="18" fill="currentColor" aria-hidden="true">` containing the path `M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z`                                                                                                                                                     |
| `content_copy`       | `<svg viewBox="0 -960 960 960" width="18" height="18" fill="currentColor" aria-hidden="true">` containing the path `M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z` |
| `content_copy` color | `var(--color-primary)`                                                                                                                                                                                                                                                                                                                       |
| Icon transition      | `transform 200ms cubic-bezier(0.4, 0, 0.2, 1)`                                                                                                                                                                                                                                                                                               |
| Primary CTA hover    | the arrow icon moves to `transform: translateY(0.125rem)`                                                                                                                                                                                                                                                                                    |
| Secondary CTA hover  | the copy icon moves to `transform: rotate(12deg)`                                                                                                                                                                                                                                                                                            |

**Verification:** `tests/hero.test.ts` → `renders_inline_svg_icons`.

### R25 — Hero geometry

The system MUST lay out the hero section and its containers with the exact geometry below.

| Element                 | Declarations                                                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Section `padding-block` | `5rem`; `7rem` at viewports ≥768px                                                                                                                                  |
| Section `border-bottom` | `1px solid rgba(199, 210, 254, 0.35)`                                                                                                                               |
| Section positioning     | `position: relative; z-index: 10`                                                                                                                                   |
| Section entrance        | applies the global `.animate-fade-in-up` class                                                                                                                      |
| Inner container         | `display: flex; flex-direction: column; align-items: center; text-align: center; gap: 2rem; max-width: 56rem; margin-inline: auto; position: relative; z-index: 10` |
| Headline group          | `display: flex; flex-direction: column; align-items: center; gap: 1.5rem`                                                                                           |
| Actions container       | `display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 1rem; padding-top: 0.5rem`                                                      |

**Verification:** `tests/hero.test.ts` → `applies_hero_geometry`.

---

## 5. Page composition

### R26 — Document shell

WHEN the home page is requested, the system MUST return a document with `<html lang="es">` and head metadata composed of: charset, viewport, generator, the title `Carlos Olcina | Ingeniero Full-Stack y Arquitecto de Software IA`, the meta description `Ingeniero Full-Stack & Arquitecto de Software IA. Desarrollo web de alto rendimiento con React, Next.js y TypeScript.`, and the favicon links `/favicon.svg` and `/favicon.ico`.

**Verification:** `tests/index.test.ts` → `renders_spanish_document_shell` (renders `src/pages/index.astro` with the Astro Container API; `&` is asserted in its HTML-escaped form `&amp;`).

### R27 — Page shell geometry

The system MUST wrap the page content in a `<main>` landmark with the design's page-shell geometry: `main` with `padding-top: 4rem`, `width: 100%`, `position: relative`, `z-index: 10`; inner container with `max-width: 72rem`, `margin-inline: auto`, `padding-inline: 1.5rem` (`3rem` at viewports ≥1024px), `position: relative`, `z-index: 10`.

**Verification:** `tests/index.test.ts` → `renders_page_shell_geometry`.

### R28 — Client-side JavaScript limited to the clipboard enhancement

The system MUST ship the home page with exactly one client-side script — the dependency-free clipboard enhancement of R32–R39 — with no hydrated islands, no UI framework runtime, no external scripts and no inline event-handler attributes; the enhancement attaches its listener with `addEventListener`.

**Verification:** `tests/index.test.ts` → `ships_only_clipboard_enhancement` (asserts the single bundled script and the negative contract; the wiring is asserted statically on `src/components/HeroSection.astro` by R32).

### R29 — Atmospheric blooms layer

The system MUST render a CSS-only atmospheric layer behind the content — fixed, full viewport, `pointer-events: none`, `z-index: -10`, `opacity: 0.6` — containing exactly three blurred gradient blobs with the exact values below.

| Blob        | Position / size                                     | Background                                                                                                     | Blur          |
| ----------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------- |
| Top-left    | `top: -15%; left: -10%; width: 55vw; height: 55vw`  | `linear-gradient(to bottom right, rgba(129, 140, 248, 0.2), rgba(216, 180, 254, 0.15), transparent)`           | `blur(130px)` |
| Right       | `top: 35%; right: -12%; width: 50vw; height: 50vw`  | `linear-gradient(to bottom left, rgba(103, 232, 249, 0.2), rgba(96, 165, 250, 0.15), transparent)`             | `blur(140px)` |
| Bottom-left | `bottom: -8%; left: 12%; width: 60vw; height: 45vw` | `linear-gradient(to top right, rgba(196, 181, 253, 0.2), rgba(199, 210, 254, 0.2), rgba(251, 207, 232, 0.15))` | `blur(150px)` |

All three blobs MUST be circular (`border-radius: var(--radius-full)`).

**Verification:** `tests/index.test.ts` → `renders_atmospheric_blooms_layer`.

---

## 6. Accessibility

### R30 — Focus visibility

The system MUST NOT suppress native focus indicators on interactive elements (`outline: none`, `outline: 0` and equivalent resets are forbidden).

**Verification:** `tests/global-styles.test.ts` → `does_not_suppress_focus_outlines`.

### R31 — Single page heading

The system MUST render exactly one `<h1>` element on the home page.

**Verification:** `tests/index.test.ts` → `renders_exactly_one_h1`.

---

## 7. Clipboard enhancement

### R32 — Clipboard copy on activation

WHEN the user activates the secondary CTA, the system MUST write the contact email `carlosolcina23@gmail.com` (defined once per R33) to the system clipboard through the asynchronous `navigator.clipboard.writeText` API.

**Verification:** `tests/clipboard.test.ts` → `copies_contact_email_to_clipboard` (Vitest in node with a mocked `ClipboardWriter`) and `wires_copy_listener_to_secondary_cta` (static assertion on `src/components/HeroSection.astro`: `addEventListener` on the `#copy-email-hero-btn` CTA, reading `dataset.email`).

### R33 — Contact email single source of truth

The system MUST define the contact email `carlosolcina23@gmail.com` exactly once in `src/` — as the `CONTACT_EMAIL` constant in the `HeroSection.astro` frontmatter — and consume it from the clipboard interaction only through the CTA's `data-email` attribute, with no duplicated literal.

**Verification:** `tests/clipboard.test.ts` → `defines_contact_email_once` (scans `src/` for the literal, renders the CTA and asserts `data-email="carlosolcina23@gmail.com"`, and asserts the script reads `dataset.email`).

### R34 — Success toast

WHEN the clipboard write succeeds, the system MUST reveal the toast and set its message to `Correo copiado al portapapeles`.

**Verification:** `tests/clipboard.test.ts` → `shows_toast_with_copy_message` (fake toast view; asserts the message text and the visible class).

### R35 — Clipboard failure handling

IF the clipboard write rejects, THEN the system MUST handle the rejection explicitly, completing the interaction without revealing the toast and without an unhandled rejection.

**Verification:** `tests/clipboard.test.ts` → `handles_clipboard_rejection` (rejecting `ClipboardWriter`; asserts the promise resolves and the success callback is not invoked).

### R36 — Toast element and markup

The system MUST render exactly one page-level toast element — `<div class="toast" id="toast" role="status" aria-live="polite">` containing the message `<span class="toast__text" id="toast-text">¡Copiado!</span>` and the `check_circle` icon of R40 — initially in the hidden state of R38.

**Verification:** `tests/toast.test.ts` → `renders_hidden_toast` (renders `src/pages/index.astro` with the Container API; asserts exactly one `#toast`, that it carries `role="status"` and `aria-live="polite"`, the message span and no `.toast--visible` class).

### R37 — Toast position and visuals

The system MUST style the toast with the exact computed values below.

| Declaration / element                         | Value                                             |
| --------------------------------------------- | ------------------------------------------------- |
| `position`                                    | `fixed`                                           |
| `bottom` / `right`                            | `1.5rem` / `1.5rem`                               |
| `z-index`                                     | `50`                                              |
| `display`                                     | `flex`                                            |
| `align-items`                                 | `center`                                          |
| `gap`                                         | `0.625rem`                                        |
| `padding`                                     | `0.875rem 1.25rem`                                |
| `border-radius`                               | `var(--radius-xl)` (`0.75rem`)                    |
| `background-color`                            | `rgba(255, 255, 255, 0.85)`                       |
| `backdrop-filter` / `-webkit-backdrop-filter` | `blur(24px)`                                      |
| `border`                                      | `1px solid rgba(255, 255, 255, 0.9)`              |
| `color`                                       | `var(--color-slate-900)` (`#0f172a`)              |
| `box-shadow`                                  | `0 12px 36px rgba(79, 70, 229, 0.18)`             |
| `transition`                                  | `all 300ms cubic-bezier(0.4, 0, 0.2, 1)`          |
| Message `font-family`                         | `var(--font-body)`                                |
| Message `font-size`                           | `var(--text-body-md-size)` (`0.875rem`)           |
| Message `line-height`                         | `var(--text-body-md-line-height)` (`1.6`)         |
| Message `letter-spacing`                      | `var(--text-body-md-letter-spacing)` (`-0.005em`) |
| Message `font-weight`                         | `500`                                             |

**Verification:** `tests/toast.test.ts` → `styles_toast` (reads `src/layouts/BaseLayout.astro`, whitespace-normalized).

### R38 — Toast hidden and visible states

The system MUST toggle the toast between the hidden and visible states with the `.toast--visible` class and the exact declarations below.

| State                       | Declarations                                                    |
| --------------------------- | --------------------------------------------------------------- |
| Hidden (base `.toast`)      | `transform: translateY(6rem); opacity: 0; pointer-events: none` |
| Visible (`.toast--visible`) | `transform: translateY(0); opacity: 1; pointer-events: auto`    |

**Verification:** `tests/toast.test.ts` → `defines_toast_visibility_states`.

### R39 — Toast auto-hide

WHEN the toast is revealed, the system MUST remove the `.toast--visible` class 2600 ms after the most recent reveal.

**Verification:** `tests/clipboard.test.ts` → `hides_toast_after_2600ms` and `restarts_hide_timer_on_new_show` (Vitest fake timers).

### R40 — Toast `check_circle` icon

The system MUST render the toast icon as a decorative 18px inline SVG — `<svg viewBox="0 -960 960 960" width="18" height="18" fill="currentColor" aria-hidden="true">` with the path below — colored `var(--color-primary)`.

```
m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z
```

**Verification:** `tests/toast.test.ts` → `renders_toast_icon`.

---

## Traceability

| Requirement | Test file                     | Test name                                                                   |
| ----------- | ----------------------------- | --------------------------------------------------------------------------- |
| R1          | `tests/tokens.test.ts`        | `exposes_semantic_color_tokens`                                             |
| R2          | `tests/tokens.test.ts`        | `exposes_page_palette_color_tokens`                                         |
| R3          | `tests/tokens.test.ts`        | `exposes_font_family_tokens`                                                |
| R4          | `tests/tokens.test.ts`        | `exposes_typography_scale_tokens`                                           |
| R5          | `tests/tokens.test.ts`        | `exposes_spacing_tokens`                                                    |
| R6          | `tests/tokens.test.ts`        | `exposes_radius_tokens`                                                     |
| R7          | `tests/fonts.test.ts`         | `declares_fontsource_dependencies`                                          |
| R8          | `tests/fonts.test.ts`         | `imports_fontsource_entry_stylesheets`                                      |
| R9          | `tests/fonts.test.ts`         | `does_not_reference_external_font_providers`                                |
| R10         | `tests/global-styles.test.ts` | `applies_design_body_styles`                                                |
| R11         | `tests/global-styles.test.ts` | `applies_base_resets`                                                       |
| R12         | `tests/global-styles.test.ts` | `applies_selection_colors`                                                  |
| R13         | `tests/global-styles.test.ts` | `hides_webkit_scrollbar`                                                    |
| R14         | `tests/global-styles.test.ts` | `enables_smooth_scroll`                                                     |
| R15         | `tests/global-styles.test.ts` | `honors_reduced_motion`                                                     |
| R16         | `tests/global-styles.test.ts` | `defines_fade_in_up_animation_and_delays`                                   |
| R17         | `tests/hero.test.ts`          | `renders_hero_structure`                                                    |
| R18         | `tests/hero.test.ts`          | `renders_verbatim_hero_texts`                                               |
| R19         | `tests/hero.test.ts`          | `styles_hero_headline`                                                      |
| R20         | `tests/hero.test.ts`          | `styles_gradient_accent_fragment`                                           |
| R21         | `tests/hero.test.ts`          | `styles_glass_tagline`                                                      |
| R22         | `tests/hero.test.ts`          | `styles_primary_cta`                                                        |
| R23         | `tests/hero.test.ts`          | `styles_secondary_cta`                                                      |
| R24         | `tests/hero.test.ts`          | `renders_inline_svg_icons`                                                  |
| R25         | `tests/hero.test.ts`          | `applies_hero_geometry`                                                     |
| R26         | `tests/index.test.ts`         | `renders_spanish_document_shell`                                            |
| R27         | `tests/index.test.ts`         | `renders_page_shell_geometry`                                               |
| R28         | `tests/index.test.ts`         | `ships_only_clipboard_enhancement`                                          |
| R29         | `tests/index.test.ts`         | `renders_atmospheric_blooms_layer`                                          |
| R30         | `tests/global-styles.test.ts` | `does_not_suppress_focus_outlines`                                          |
| R31         | `tests/index.test.ts`         | `renders_exactly_one_h1`                                                    |
| R32         | `tests/clipboard.test.ts`     | `copies_contact_email_to_clipboard`, `wires_copy_listener_to_secondary_cta` |
| R33         | `tests/clipboard.test.ts`     | `defines_contact_email_once`                                                |
| R34         | `tests/clipboard.test.ts`     | `shows_toast_with_copy_message`                                             |
| R35         | `tests/clipboard.test.ts`     | `handles_clipboard_rejection`                                               |
| R36         | `tests/toast.test.ts`         | `renders_hidden_toast`                                                      |
| R37         | `tests/toast.test.ts`         | `styles_toast`                                                              |
| R38         | `tests/toast.test.ts`         | `defines_toast_visibility_states`                                           |
| R39         | `tests/clipboard.test.ts`     | `hides_toast_after_2600ms`, `restarts_hide_timer_on_new_show`               |
| R40         | `tests/toast.test.ts`         | `renders_toast_icon`                                                        |

## Feature description coverage

| Feature description item (id 2)                                     | Requirements      |
| ------------------------------------------------------------------- | ----------------- |
| Global design tokens (colors, typography, spacing) in `src/styles/` | R1–R6             |
| Fonts bundled from Fontsource (Newsreader + Plus Jakarta Sans)      | R7–R9, R3         |
| Hero section (headline, tagline, CTA buttons)                       | R17–R25           |
| Clipboard enhancement: hero CTA copies the contact email + toast    | R23, R28, R32–R40 |
| CSS atmospheric blooms                                              | R29               |
| Excludes WebGL shader, nav, remaining sections, footer              | Out of scope list |
