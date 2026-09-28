# Design — hero-section

## 1. Context

First UI increment of the portfolio: global design tokens, Fontsource fonts, base page styles, the hero section of the Stitch design **Full Chromatic Glass**, the CSS atmospheric blooms and the hero CTA clipboard enhancement (copy the contact email + design toast). The authoritative markup is `specs/hero-section/references/chromatic-glass.html` (hero: lines 551–611; toast: lines 2111–2121; page shell: lines 1–11 and 274; global styles: lines 30–108); `design-notes.md` digests it into tokens, typography, animations and effective computed values.

Hard constraints from the harness: Astro 6 + strict TypeScript, zero client JS by default, plain CSS with custom properties (no Tailwind), Fontsource instead of a font CDN, no icon font, and every requirement traceable to a Vitest test. The one approved exception to zero JS is the hero copy interaction: a single dependency-free script (R28).

## 2. Decisions summary

1. Tokens live in `src/styles/tokens.css` as CSS custom properties; `src/styles/global.css` imports them and holds only resets, page styles and shared utilities.
2. Hero and bloom styles are component-scoped `<style>` blocks (project convention), never global component classes.
3. Component CSS consumes tokens through `var(--…)`; raw literals are used only for values that have no token (white, alpha whites, rgba shadows, arbitrary sizes such as `4.25rem` / `1.05rem` and the hero overrides of the type scale).
4. Fonts are bundled with Fontsource variable packages; the Newsreader italic face comes from `wght-italic.css`.
5. Icons are inline SVGs using the official Material Symbols Outlined 24px path data (no icon font).
6. The secondary CTA is an enabled `<button type="button">` (no `aria-disabled`, no `disabled`): activating it copies the contact email with `navigator.clipboard.writeText` and reveals the design toast.
7. Client-side JavaScript is limited to that single enhancement: one `<script>` in `HeroSection.astro` importing the dependency-free module `src/scripts/clipboard.ts`; no islands, no UI framework, no external scripts and no inline event handlers (`addEventListener` only).
8. The toast is a page-level singleton owned by `BaseLayout.astro` and rendered as the last child of `<body>`: `.hero` keeps a `forwards` transform animation whose computed transform would otherwise become the containing block of `position: fixed` descendants and pin the toast to the section.
9. The contact email is defined once, in the `HeroSection.astro` frontmatter (`CONTACT_EMAIL`), and flows to the script through the CTA's `data-email` attribute (R33); the script never re-declares it.
10. Clipboard and toast logic live in a browser-agnostic module with injected `ClipboardWriter` and structural `ToastView` interfaces, so Vitest exercises them in node (mocked writer, fake timers, fake toast) without jsdom or new dependencies; the remaining DOM wiring is a thin, statically asserted script.

## 3. Files

| File                               | Action  | Responsibility                                                                                                            |
| ---------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------- |
| `src/styles/tokens.css`            | create  | All design tokens as custom properties (R1–R6).                                                                           |
| `src/styles/global.css`            | create  | Fontsource imports, tokens import, resets, body styles, selection, scrollbar, reduced motion, animations.                 |
| `src/layouts/BaseLayout.astro`     | create  | Document shell (`lang="es"`, meta, title), blooms layer, page-level toast (markup + scoped styles), `<main>` + container. |
| `src/components/HeroSection.astro` | create  | Hero markup, inline SVG icons, `CONTACT_EMAIL` constant, scoped hero styles, single clipboard `<script>`.                 |
| `src/scripts/clipboard.ts`         | create  | Dependency-free clipboard + toast helpers with injectable interfaces (R32–R35, R38, R39).                                 |
| `src/pages/index.astro`            | rewrite | Composes `BaseLayout` + `HeroSection` with page title/description constants.                                              |
| `tests/tokens.test.ts`             | create  | Static assertions on `src/styles/tokens.css` (R1–R6).                                                                     |
| `tests/fonts.test.ts`              | create  | Fontsource deps/imports and external-provider ban (R7–R9).                                                                |
| `tests/global-styles.test.ts`      | create  | Base styles, resets, interaction styles, reduced motion, animation, focus (R10–R16, R30).                                 |
| `tests/hero.test.ts`               | create  | Hero structure/texts (Container API), enabled secondary CTA and hero CSS contract (R17–R25, R33).                         |
| `tests/clipboard.test.ts`          | create  | Clipboard copy, rejection handling, email SSOT, toast reveal/auto-hide and script wiring (R32–R35, R39).                  |
| `tests/toast.test.ts`              | create  | Toast markup/icon (Container API) and toast CSS contract (R36–R38, R40).                                                  |
| `tests/index.test.ts`              | update  | Replaces the `<h1>Astro</h1>` smoke test with page composition assertions (R26–R29, R31).                                 |
| `package.json`                     | modify  | Adds the two Fontsource dependencies (implementer runs `pnpm add`; R7).                                                   |

Unchanged: `astro.config.mjs` (no integrations), `vitest.config.ts`, `tsconfig.json`, `public/favicon.*`.

`src/scripts/` is new: the current tree only has `src/pages/`, and this module is browser code imported from a `<script>` tag, so it does not belong under `components/`. It has no import-time side effects and no dependencies, which keeps `astro check` and Vitest (node environment) happy. No new package is added for any of it.

## 4. Token naming (`src/styles/tokens.css`)

| Group           | Pattern                          | Examples                                            |
| --------------- | -------------------------------- | --------------------------------------------------- |
| Semantic colors | `--color-<design-token>`         | `--color-primary`, `--color-on-surface-variant`     |
| Palette colors  | `--color-<family>-<step>`        | `--color-indigo-600`, `--color-slate-900`           |
| Families        | `--font-headline`, `--font-body` | `--font-body: 'Plus Jakarta Sans Variable', …`      |
| Type scale      | `--text-<scale-entry>-<metric>`  | `--text-headline-xl-size`, `--text-label-md-weight` |
| Spacing         | `--space-<design-token>`         | `--space-gutter`, `--space-xl`                      |
| Radii           | `--radius-<design-token>`        | `--radius-xl`, `--radius-full`                      |

`--radius-default` keeps the design's `DEFAULT` name; `--space-sm` (0.5rem) and `--space-gutter-sm` (1rem) deliberately coexist because both exist in the design config. Exact values are in `requirements.md` (R1–R6); the file must not contain declarations other than the tokens.

Fontsource note: the variable packages expose `'Newsreader Variable'` and `'Plus Jakarta Sans Variable'`. Those names are used first in the stacks so the bundled files win; `Inter` is not part of the fallback chain because it is not bundled and no CDN is allowed. Fallbacks are only a safety net — the bundled faces always load at build time.

## 5. Global styles (`src/styles/global.css`)

Import order (CSS `@import` statements must come first):

```css
@import '@fontsource-variable/newsreader/index.css';
@import '@fontsource-variable/newsreader/wght-italic.css';
@import '@fontsource-variable/plus-jakarta-sans/index.css';
@import './tokens.css';
```

Then, in order:

1. Base resets (R11): `box-sizing`, zeroed `html`/`body`/`h1`/`p` margins, inherited link color/text-decoration, neutralized `button` defaults, `main` first/last child margins.
2. Body styles (R10): three-stop gradient, `--color-on-surface`, `body-md` typography via tokens, antialiased smoothing, `overscroll-behavior: none`, `min-height: 100vh`, `overflow-x: hidden`.
3. Selection (R12), WebKit scrollbar (R13), smooth scroll (R14).
4. Reduced-motion override (R15).
5. Entrance animation utilities (R16): `@keyframes fadeInSlideUp`, `.animate-fade-in-up`, `.animation-delay-100…400`.

The `html` element intentionally receives **no** background: the body gradient propagates to the canvas, which lets the fixed blooms layer (`z-index: -10`) paint above the gradient and below the content, exactly as in the design. This ordering is replicated, not reinvented. The `.animation-delay-*` utilities have no consumer in this increment; they are part of the design's shared animation API and are used by the next sections.

## 6. `src/layouts/BaseLayout.astro`

Public props (explicit interface, per conventions):

```astro
---
interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---
```

Structure:

- `<!doctype html>` + `<html lang="es">`.
- `<head>`: charset, viewport, generator, `<meta name="description" content={description}>`, two favicon links, `<title>{title}</title>`.
- `<body>`: blooms layer, `<main class="site-main"><div class="site-container"><slot /></div></main>`, toast singleton as the last child.
- Frontmatter imports `../styles/global.css`.

Scoped styles (BaseLayout `<style>`):

| Selector                     | Declarations                                                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `.site-main`                 | `width: 100%; padding-top: 4rem; position: relative; z-index: 10; background: transparent`                                 |
| `.site-container`            | `width: 100%; max-width: 72rem; margin-inline: auto; padding-inline: 1.5rem; position: relative; z-index: 10`              |
| `.site-container` ≥1024px    | `padding-inline: 3rem`                                                                                                     |
| `.blooms`                    | `position: fixed; inset: 0; width: 100%; height: 100%; z-index: -10; pointer-events: none; overflow: hidden; opacity: 0.6` |
| `.blooms__blob`              | `position: absolute; border-radius: var(--radius-full)`                                                                    |
| `.blooms__blob--top-left`    | R29 values: top/left, `55vw`, `linear-gradient(to bottom right, …)`, `filter: blur(130px)`                                 |
| `.blooms__blob--right`       | R29 values: top/right, `50vw`, `linear-gradient(to bottom left, …)`, `filter: blur(140px)`                                 |
| `.blooms__blob--bottom-left` | R29 values: bottom/left, `60vw × 45vw`, `linear-gradient(to top right, …)`, `filter: blur(150px)`                          |
| `.toast`                     | R37 box values + R38 hidden state (`transform: translateY(6rem); opacity: 0; pointer-events: none`)                        |
| `.toast--visible`            | R38 visible state (`transform: translateY(0); opacity: 1; pointer-events: auto`)                                           |
| `.toast__icon`               | `width: 18px; height: 18px; flex-shrink: 0; color: var(--color-primary)`                                                   |
| `.toast__text`               | `font-family: var(--font-body)`, `body-md` size/line-height/letter-spacing via tokens, `font-weight: 500`                  |

Markup:

```html
<div class="blooms">
  <div class="blooms__blob blooms__blob--top-left"></div>
  <div class="blooms__blob blooms__blob--right"></div>
  <div class="blooms__blob blooms__blob--bottom-left"></div>
</div>
```

Toast singleton (last child of `<body>`, after `<main>`):

```html
<div class="toast" id="toast" role="status" aria-live="polite">
  <!-- check_circle inline SVG (R40) -->
  <span class="toast__text" id="toast-text">¡Copiado!</span>
</div>
```

The toast is a live region (`role="status"` + `aria-live="polite"`) so screen readers announce the copy feedback when R34 updates its message; the attributes are invisible and do not alter the visual design or its animations.

The toast must not live inside `HeroSection`: `.hero` carries `.animate-fade-in-up`, and a `forwards` animation leaves a computed `transform` on the section. Any transformed ancestor becomes the containing block of `position: fixed` descendants, so the toast would be positioned relative to the hero instead of the viewport. Rendering it at body level also matches the design, where the toast sits outside the page container. Extracting a reusable `Toast.astro` component is deferred until a second consumer exists (contact form, future increment); today the singleton is one element plus four scoped rules, and its ids (`#toast`, `#toast-text`) are the contract consumed by the hero script.

`padding-top: 4rem` on `main` is the design's fixed-nav offset. The nav is out of scope, but the offset is kept so the hero starts at the same vertical position as the reference screenshot; it will be reviewed when the nav increment lands.

## 7. `src/components/HeroSection.astro`

No props: the hero copy is static in this increment (there is no content collection yet), so the component exposes no public API. This avoids speculative data plumbing.

Class contract (tests assert these hooks):

| Selector                 | Element / purpose                                        |
| ------------------------ | -------------------------------------------------------- |
| `.hero`                  | `<section id="overview">` box + entrance animation class |
| `.hero__inner`           | centered `max-w-4xl` column (R25)                        |
| `.hero__content`         | headline group column (R25)                              |
| `.hero__headline`        | `<h1>` (R19)                                             |
| `.hero__headline-accent` | gradient italic fragment (R20)                           |
| `.hero__tagline`         | glass tagline `<p>` (R21)                                |
| `.hero__actions`         | actions row (R25)                                        |
| `.hero__cta`             | shared CTA box (padding, radius, typography, transition) |
| `.hero__cta--primary`    | primary anchor modifiers (R22)                           |
| `.hero__cta--secondary`  | secondary button modifiers (R23)                         |
| `.hero__cta-label`       | label span with `letter-spacing: 0.025em`                |
| `.hero__icon`            | shared 18px icon box                                     |
| `.hero__icon--arrow`     | `arrow_downward` icon + hover translate                  |
| `.hero__icon--copy`      | `content_copy` icon (primary color) + hover rotate       |

Markup skeleton:

```html
<section class="hero animate-fade-in-up" id="overview">
  <div class="hero__inner">
    <div class="hero__content">
      <h1 class="hero__headline">
        Desarrollo digital en la intersección de
        <span class="hero__headline-accent">ingeniería e IA.</span>
      </h1>
      <p class="hero__tagline">
        Ingeniero Full-Stack &amp; Arquitecto de Software IA. Desarrollo web de
        alto rendimiento con React, Next.js y TypeScript.
      </p>
      <div class="hero__actions">
        <a class="hero__cta hero__cta--primary" href="#projects">
          <span class="hero__cta-label">Ver Proyectos</span>
          <!-- arrow_downward svg -->
        </a>
        <button
          class="hero__cta hero__cta--secondary"
          id="copy-email-hero-btn"
          type="button"
          data-email="{CONTACT_EMAIL}"
        >
          <!-- content_copy svg -->
          <span class="hero__cta-label">Copiar Correo</span>
        </button>
      </div>
    </div>
  </div>
</section>
```

The empty status-pill `<div class="flex items-center">` of the design is omitted (it renders nothing). The design's inline `onclick` is not reproduced (R28): the same behaviour is wired from the `<script>` below with `addEventListener`.

### Scoped style contract

Every declaration below is either a `var(--token)` consumption or a literal that has no token. Full values are in `requirements.md` R19–R25.

- `.hero`: `position: relative; z-index: 10; padding-block: 5rem; border-bottom: 1px solid rgba(199, 210, 254, 0.35)`, `7rem` padding from 768px.
- `.hero__inner`: flex column, centered, `gap: 2rem; max-width: 56rem; margin-inline: auto`.
- `.hero__content`: flex column, centered, `gap: 1.5rem`.
- `.hero__headline`: `font-family: var(--font-headline)`, `font-weight: var(--text-headline-xl-weight)`, `font-size: var(--text-headline-xl-size)`, `line-height: var(--text-headline-xl-line-height)`, `letter-spacing: -0.025em`, `color: var(--color-slate-900)`; `font-size: 4.25rem` from 768px.
- `.hero__headline-accent`: `display: inline-block; font-style: italic; font-family: var(--font-headline); font-weight: 300`, `linear-gradient(to right, var(--color-primary), var(--color-indigo-600), var(--color-violet-500))` clipped to text, `color: transparent`, `filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05))`.
- `.hero__tagline`: R21 values; `font-size: var(--text-body-md-size)`; `line-height: 1.625` and `letter-spacing: 0.025em` are the design's utility overrides; `font-size: 1.05rem` from 768px.
- `.hero__actions`: flex wrap, centered, `gap: 1rem; padding-top: 0.5rem`.
- `.hero__cta`: `display: inline-flex; align-items: center; gap: 0.625rem; padding: 0.875rem 1.75rem; border-radius: var(--radius-full)`, `label-md` typography via tokens, `transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1)`, `cursor: pointer`, `text-decoration: none` (links are reset to `inherit` in base).
- `.hero__cta--primary` / `:hover` / `:active`: R22 values; active state is `transform: scale(0.95)`.
- `.hero__cta--secondary` / `:hover` / `:active`: R23 values.
- `.hero__cta-label`: `letter-spacing: 0.025em`.
- `.hero__icon`: `width: 18px; height: 18px; flex-shrink: 0; transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1)`.
- `.hero__icon--copy`: `color: var(--color-primary)`.
- `.hero__cta--primary:hover .hero__icon--arrow`: `transform: translateY(0.125rem)`.
- `.hero__cta--secondary:hover .hero__icon--copy`: `transform: rotate(12deg)`.

Tailwind class internals translated: `gap-2.5` = 0.625rem, `px-7 py-3.5` = 1.75rem / 0.875rem, `gap-8` = 2rem, `gap-6` = 1.5rem, `pt-2` = 0.5rem, `md` = 768px, `lg` = 1024px, default transition easing = `cubic-bezier(0.4, 0, 0.2, 1)`.

### Icons

Official Material Symbols Outlined path data (24px optical size, viewBox `0 -960 960 960`), rendered at `18 × 18`:

```html
<svg
  class="hero__icon hero__icon--arrow"
  viewBox="0 -960 960 960"
  width="18"
  height="18"
  fill="currentColor"
  aria-hidden="true"
>
  <path
    d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z"
  />
</svg>

<svg
  class="hero__icon hero__icon--copy"
  viewBox="0 -960 960 960"
  width="18"
  height="18"
  fill="currentColor"
  aria-hidden="true"
>
  <path
    d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"
  />
</svg>
```

Both icons are decorative (`aria-hidden="true"`) because the adjacent labels carry the accessible names. No `material-symbols-outlined` class, no ligature text, no icon font request.

### Contact email and clipboard script

Frontmatter constant (single source of truth, R33):

```ts
const CONTACT_EMAIL = 'carlosolcina23@gmail.com';
```

The constant is rendered exactly once, into the secondary CTA (`data-email={CONTACT_EMAIL}`), and the script reads it back from the DOM:

```astro
<script>
  import { copyToClipboard, showToast } from '../scripts/clipboard';

  const button = document.querySelector<HTMLButtonElement>(
    '#copy-email-hero-btn',
  );
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-text');

  if (button && toast && toastMessage) {
    button.addEventListener('click', () => {
      const email = button.dataset.email;
      if (!email) return;
      void copyToClipboard(email, () =>
        showToast({ container: toast, message: toastMessage }),
      );
    });
  }
</script>
```

- Astro bundles this block into one module asset; it is the only client script on the page (R28).
- DOM contract: `#copy-email-hero-btn` (this component) and the page-level `#toast` / `#toast-text` singleton owned by `BaseLayout` (§6). Null guards make the script a no-op if the markup changes.
- `copyToClipboard` receives the toast reveal as its success callback, so a rejected clipboard promise can never call `showToast` (R35).
- No inline handler attributes, no framework runtime.

## 8. `src/scripts/clipboard.ts` (create)

The module keeps the browser API and the DOM behind structural interfaces so it can be unit-tested in node with fakes (design-level sketch; exact values in R32–R39):

```ts
export const COPY_SUCCESS_MESSAGE = 'Correo copiado al portapapeles';
export const TOAST_HIDE_DELAY_MS = 2600;
export const TOAST_VISIBLE_CLASS = 'toast--visible';

export interface ClipboardWriter {
  writeText(text: string): Promise<void>;
}

export interface ToastView {
  container: {
    classList: {
      add(token: string): void;
      remove(token: string): void;
    };
  };
  message: {
    textContent: string | null;
  };
}

export async function copyToClipboard(
  text: string,
  onSuccess: () => void,
  clipboard: ClipboardWriter = navigator.clipboard,
): Promise<boolean> {
  try {
    await clipboard.writeText(text);
    onSuccess();
    return true;
  } catch {
    return false;
  }
}

let hideTimeout: ReturnType<typeof setTimeout> | undefined;

export function showToast(
  view: ToastView,
  message: string = COPY_SUCCESS_MESSAGE,
  hideDelayMs: number = TOAST_HIDE_DELAY_MS,
): void {
  view.message.textContent = message;
  view.container.classList.add(TOAST_VISIBLE_CLASS);
  clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => {
    view.container.classList.remove(TOAST_VISIBLE_CLASS);
    hideTimeout = undefined;
  }, hideDelayMs);
}
```

- `ClipboardWriter` and `ToastView` are structural: the real `navigator.clipboard` and `HTMLElement` satisfy them, while tests inject `Set`-backed fakes.
- `copyToClipboard` wraps `writeText` in `try`/`catch`, so permission denials, insecure contexts and a missing `navigator.clipboard` resolve `false` without calling `onSuccess` (R35) and without an unhandled rejection.
- `showToast` resets the timer on every reveal, so the toast hides 2600 ms after the **last** reveal (R39), and writes the design message into the injected text target (R34).
- No import-time side effects: the `navigator.clipboard` default is only read when a call omits the argument.

## 9. `src/pages/index.astro`

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import HeroSection from '../components/HeroSection.astro';

const PAGE_TITLE =
  'Carlos Olcina | Ingeniero Full-Stack y Arquitecto de Software IA';
const PAGE_DESCRIPTION =
  'Ingeniero Full-Stack & Arquitecto de Software IA. Desarrollo web de alto rendimiento con React, Next.js y TypeScript.';
---

<BaseLayout title={PAGE_TITLE} description={PAGE_DESCRIPTION}>
  <HeroSection />
</BaseLayout>
```

The title/description are derived from the design's own copy (hero tagline + footer identity); the Stitch export contains no `<title>` or meta description. Constants use `SCREAMING_SNAKE_CASE` per conventions.

## 10. Test strategy

- **Structure and copy:** Astro Container API (`experimental_AstroContainer`) renders `HeroSection` and `index.astro` to HTML; assertions use exact strings and regex for tags/counts (`<h1>`, `<svg>`, `#toast`, islands, handlers).
- **Styles and tokens:** no CSS engine is available in Vitest, so tests read the CSS/`.astro` sources with `readFileSync(new URL('../src/…', import.meta.url), 'utf8')` and assert exact declarations. A shared helper collapses whitespace before comparing so formatting never breaks assertions.
- **Responsive values:** tests pair the `@media (min-width: 768px)` / `(min-width: 1024px)` offsets with the expected declaration offsets (`indexOf`) instead of parsing nested braces.
- **Single source of truth:** hero/base CSS must consume `var(--…)` for tokenized values, so tests assert the `var()` usage in components and the resolved values in `tests/tokens.test.ts`; literals only appear for non-token values. The same rule applies to the contact email: one literal in `src/`, injected into the CTA and read back through `dataset.email` (R33).
- **Clipboard and toast behaviour:** Vitest runs in node with no DOM, so `tests/clipboard.test.ts` imports `src/scripts/clipboard.ts` directly and injects a fake `ClipboardWriter` (resolving/rejecting) and a `Set`-backed `ToastView` fake; `vi.useFakeTimers()` drives the 2600 ms auto-hide and the restart-on-reveal case. No jsdom, no new dependency.
- **Script wiring:** `HeroSection.astro`'s `<script>` is not executed by the Container API, so the wiring (CTA hook, `dataset.email`, `addEventListener`, no `onclick=`) is asserted statically from the source; the behaviour it calls is covered by the unit tests above.
- **Toast contract:** `renders_hidden_toast` / `renders_toast_icon` render `index.astro` with the Container API; `styles_toast` / `defines_toast_visibility_states` read `BaseLayout.astro` with whitespace-normalized comparisons.
- **Negative assertions:** no external font URLs, no hydrated islands (`astro-island`), no UI framework runtime, no scripts other than the bundled enhancement, no inline handler attributes, no icon-font markup, no `outline` suppression.
- Every test maps to a requirement; the full matrix is the last section of `requirements.md`.

## 11. Rejected alternatives

| Alternative                                                                       | Why rejected                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tailwind (build plugin or `cdn.tailwindcss.com` as in the design)                 | Adds a build-time CSS framework for a single section and contradicts the "plain CSS with custom properties" constraint; a CDN runtime is also a forbidden external dependency and breaks zero-JS.                                                                   |
| Google Fonts CDN for Newsreader / Plus Jakarta Sans / Inter                       | External runtime dependency, privacy and performance cost, and explicitly out of scope. Fontsource ships the same files locally.                                                                                                                                    |
| `@fontsource/newsreader` + `@fontsource/plus-jakarta-sans` static weights         | The design uses variable fonts with optical sizing and an italic face; static packages would need many files and would not match the design's `opsz` rendering.                                                                                                     |
| Material Symbols icon font for `arrow_downward` / `content_copy` / `check_circle` | A whole font request for three glyphs; ligature text is fragile and invisible to tests. Inline SVGs keep zero external requests and exact 18px control.                                                                                                             |
| Implementing `.glass-chromatic` / `.glass-card-hover` utilities now               | Neither is used by the hero; adding them would be dead CSS. They belong to the projects increment that consumes them.                                                                                                                                               |
| Global utility classes mirroring Tailwind (`text-headline-xl`, `font-body-md`)    | Would require defining 11 type utilities plus font helpers that only three entries use today. Custom properties + scoped styles are smaller and match the component-style convention.                                                                               |
| `disabled` or `aria-disabled="true"` on the secondary CTA                         | The CTA is functional in this increment; both attributes would advertise an unavailable action and `disabled` would remove the button from the tab order. The enabled `<button type="button">` keeps native activation, focus and the design's hover/active styles. |
| Inline `onclick` handler, as in the design HTML                                   | Forbidden by R28: CSP-unfriendly, duplicated per markup and untestable. The listener is attached with `addEventListener` from the bundled module.                                                                                                                   |
| `document.execCommand('copy')` fallback                                           | Deprecated and requires DOM/selection plumbing; `navigator.clipboard` covers modern browsers and its rejection path is handled explicitly (R35).                                                                                                                    |
| A clipboard/toast library (clipboard.js, toastify, …)                             | Two tiny behaviours do not justify a dependency; the project optimizes for zero dependencies and a minimal bundle.                                                                                                                                                  |
| A hydrated Astro island for the copy button                                       | Pulling a UI framework runtime for one click handler contradicts the zero-JS default; a plain bundled `<script>` is enough.                                                                                                                                         |
| Toast markup inside `HeroSection`                                                 | `.hero` animates with a `forwards` transform, which turns the section into the containing block of `position: fixed` descendants and would pin the toast to the section instead of the viewport. The singleton lives in `BaseLayout`.                               |
| Email read from a content collection / env var                                    | No content collection exists yet and the contact data is static; a frontmatter constant is the smallest single source of truth (R33).                                                                                                                               |
| Wiring the hero copy through a content collection / props                         | Over-engineering for a static first increment; there is no second consumer or editable content requirement yet.                                                                                                                                                     |
| Shipping the WebGL shader now                                                     | Explicitly out of scope, adds client JS against the zero-JS rule, and the CSS blooms already reproduce the design's atmospheric background.                                                                                                                         |

No new exception types are introduced, but the clipboard interaction has one explicit error path: `copyToClipboard` catches every rejection and resolves `false` (R35), so the build stays fully static and `astro check` / `pnpm build` validate the page at build time.

## 12. Out of scope / future work

- WebGL shader (`shader.html`): future fixed full-viewport canvas at `z-index: -10` behind or replacing the blooms, with the design's simplex-noise fragment shader.
- Floating glass nav (uses `.animation-delay-*`, glass utilities and the `main` top offset introduced here).
- Projects / tech-stack / about / contact sections, footer, contact form.
- Reuse of the toast outside the hero copy interaction: extracting `Toast.astro` and calling `showToast` with other messages (contact form) is future work; today the message is the copy one.
- `.glass-chromatic` and `.glass-card-hover` global utilities (projects increment).
- Open Graph metadata, once an OG image and canonical site URL exist.

## 13. Risks

| Risk                                                                         | Mitigation                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSS is verified by static assertions, not a browser                          | Assertions are exact and token-anchored; a manual comparison against `chromatic-glass.png` is part of the implementation review.                                                                               |
| Fontsource family names differ from the design's (`'… Variable'`)            | Documented stacks in R3; visually identical because the same variable fonts are bundled.                                                                                                                       |
| Body gradient propagation + `z-index: -10` blooms could be misread           | Layout mirrors the design one-to-one and keeps `html` background-free; noted in §5.                                                                                                                            |
| Test brittleness on whitespace/formatting                                    | Tests normalize whitespace before comparisons.                                                                                                                                                                 |
| `main { padding-top: 4rem }` without the nav looks like dead space           | Kept for parity with the design; flagged for review when the nav increment lands.                                                                                                                              |
| Clipboard API unavailable (insecure context, old browser, denied permission) | `copyToClipboard` catches the rejection and resolves `false`; no toast is revealed and no unhandled rejection is emitted (R35). The enhancement degrades silently, matching the design (there is no error UI). |
| The bundled script is not executed by the Container API                      | Behaviour lives in `src/scripts/clipboard.ts` and is unit-tested with injected fakes and fake timers; the thin DOM wiring is covered by static source assertions.                                              |
| Toast pinned to `.hero` instead of the viewport                              | The toast is rendered by `BaseLayout` as the last child of `<body>`, outside the `forwards`-transformed hero.                                                                                                  |
| Duplicated email literal in future increments (contact section)              | R33 requires a single occurrence in `src/`; the scan test fails if another literal appears, so future sections must reuse the constant or a shared contact config.                                             |
| `clearTimeout` reset differs from the design's naive `setTimeout`            | `design-notes.md` specifies hiding "2600 ms after the last call"; resetting the timer implements that intent and is unit-tested.                                                                               |
