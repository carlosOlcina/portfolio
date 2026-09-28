# Tasks — hero-section

Ordered checklist. Each task references the `R<n>` it covers. The implementer marks `[x]` as tasks complete; `pnpm validate` must be green at the end. No files outside the ones listed here are touched. The only client-side JavaScript in this increment is the clipboard enhancement of §6.

## 1. Dependencies

- [x] 1.1 Run `pnpm add @fontsource-variable/newsreader @fontsource-variable/plus-jakarta-sans` and confirm both appear under `dependencies` in `package.json`. — R7
- [x] 1.2 Confirm no other dependency, Astro integration, Tailwind package, icon-font package or clipboard/toast library is added. — R9, R28

## 2. Design tokens — `src/styles/tokens.css` (create)

- [x] 2.1 Declare the 31 semantic color custom properties (`--color-*`) with the exact values of R1. — R1
- [x] 2.2 Declare the 13 page palette color custom properties with the exact hex values of R2. — R2
- [x] 2.3 Declare `--font-headline` and `--font-body` with the Fontsource variable stacks of R3. — R3
- [x] 2.4 Declare the 11 type-scale entries as `--text-<entry>-size/-line-height/-letter-spacing/-weight` with the exact values of R4. — R4
- [x] 2.5 Declare the nine `--space-*` custom properties with the exact values of R5. — R5
- [x] 2.6 Declare the five `--radius-*` custom properties with the exact values of R6. — R6

## 3. Global styles — `src/styles/global.css` (create)

- [x] 3.1 Add the three Fontsource `@import` statements followed by `@import './tokens.css'`. — R8
- [x] 3.2 Add the base resets of R11 exactly as listed (`box-sizing`, margins, link and button neutralization, `main` first/last child). — R11
- [x] 3.3 Add body styles with the R10 declarations (gradient, `on-surface` color, `body-md` typography via tokens, antialiasing, overscroll, min-height, overflow-x). — R10
- [x] 3.4 Add `::selection` colors (R12), `::-webkit-scrollbar { display: none; }` (R13) and `html { scroll-behavior: smooth; }` (R14). — R12, R13, R14
- [x] 3.5 Add the `prefers-reduced-motion: reduce` override block exactly as in R15. — R15
- [x] 3.6 Add `@keyframes fadeInSlideUp`, `.animate-fade-in-up` and `.animation-delay-100…400` exactly as in R16. — R16
- [x] 3.7 Confirm no `outline: none` / `outline: 0` rule exists. — R30

## 4. Layout — `src/layouts/BaseLayout.astro` (create)

- [x] 4.1 Add frontmatter: `interface Props { title: string; description: string; }`, destructure props, import `../styles/global.css`. — R26
- [x] 4.2 Write the document shell: doctype, `<html lang="es">`, charset, viewport, generator, title, meta description, both favicon links, `<slot />` inside `<main class="site-main"><div class="site-container">…</div></main>`. — R26, R27
- [x] 4.3 Add the scoped styles for `.site-main` and `.site-container` with the geometry of R27 (`padding-top: 4rem`; `max-width: 72rem`; `padding-inline: 1.5rem`, `3rem` from 1024px). — R27
- [x] 4.4 Add the blooms markup (`.blooms` + three `.blooms__blob--*` children) and its scoped styles with the exact R29 values. — R29
- [x] 4.5 Render the page-level toast singleton as the last child of `<body>`, after `<main>`: `<div class="toast" id="toast" role="status" aria-live="polite">` with the message `<span class="toast__text" id="toast-text">¡Copiado!</span>` and the `check_circle` inline SVG of R40; the initial markup carries no `.toast--visible` class. — R36, R40
- [x] 4.6 Add the scoped toast styles: R37 box/position/transition, the R38 hidden state and `.toast--visible` state, `.toast__icon` size/color (R40) and `.toast__text` typography (R37). — R36, R37, R38, R40

## 5. Hero — `src/components/HeroSection.astro` (create)

- [x] 5.1 Write the markup skeleton of design §7: `<section id="overview" class="hero animate-fade-in-up">`, `.hero__inner`, `.hero__content`, `<h1>` with `.hero__headline-accent` fragment, glass `.hero__tagline`, `.hero__actions` with the primary anchor (`href="#projects"`) and the enabled secondary `<button type="button" id="copy-email-hero-btn" data-email={CONTACT_EMAIL}>`; declare `const CONTACT_EMAIL = 'carlosolcina23@gmail.com';` in the frontmatter. Do not reproduce the empty status-pill div or the inline `onclick`. — R17, R18, R23, R33
- [x] 5.2 Inline the two Material Symbols SVGs with the exact `viewBox`, size, `fill="currentColor"`, `aria-hidden="true"` and path data of R24. No icon-font class or ligature text. — R24
- [x] 5.3 Add `.hero`, `.hero__inner`, `.hero__content`, `.hero__actions` geometry and the `md` (768px) padding override of R25. — R25
- [x] 5.4 Add `.hero__headline` styles (R19) and `.hero__headline-accent` gradient styles (R20), consuming tokens via `var()` as specified in design §7. — R19, R20
- [x] 5.5 Add `.hero__tagline` glass-box styles with the R21 values, including the `-webkit-backdrop-filter` fallback. — R21
- [x] 5.6 Add shared `.hero__cta` styles, the primary CTA rest/hover/active states (R22), the secondary CTA rest/hover/active states (R23) and `.hero__cta-label` tracking; the secondary button carries no `disabled` / `aria-disabled` attribute. — R22, R23
- [x] 5.7 Add `.hero__icon` sizing/transition, `.hero__icon--copy` color, and the two hover transforms (`translateY(0.125rem)` / `rotate(12deg)`). — R24
- [x] 5.8 Confirm the markup contains no inline event-handler attributes and no focus-outline suppression. — R28, R30
- [x] 5.9 Add the `<script>` block of design §7: import `copyToClipboard` and `showToast` from `../scripts/clipboard`, select `#copy-email-hero-btn`, `#toast` and `#toast-text`, guard nulls and attach the click listener with `addEventListener`, reading the address from `button.dataset.email` and revealing the toast only through the `copyToClipboard` success callback. — R28, R32, R35

## 6. Clipboard module — `src/scripts/clipboard.ts` (create)

- [x] 6.1 Export `COPY_SUCCESS_MESSAGE` (`Correo copiado al portapapeles`), `TOAST_HIDE_DELAY_MS` (`2600`) and `TOAST_VISIBLE_CLASS` (`toast--visible`), plus the `ClipboardWriter` and `ToastView` interfaces of design §8. — R34, R38, R39
- [x] 6.2 Implement `copyToClipboard(text, onSuccess, clipboard = navigator.clipboard)`: await `writeText`, invoke `onSuccess` only on success and catch every rejection explicitly (including a missing `navigator.clipboard`), resolving `false`. — R32, R34, R35
- [x] 6.3 Implement `showToast(view, message = COPY_SUCCESS_MESSAGE, hideDelayMs = TOAST_HIDE_DELAY_MS)`: set the message, add `.toast--visible` and reset the hide timer so the class is removed 2600 ms after the last reveal. — R34, R38, R39
- [x] 6.4 Confirm the module is dependency-free, has no import-time side effects and contains no email literal. — R28, R33

## 7. Page — `src/pages/index.astro` (rewrite)

- [x] 7.1 Replace the Astro starter with `PAGE_TITLE` / `PAGE_DESCRIPTION` constants (design §9), `BaseLayout` and `HeroSection`. — R26, R27

## 8. Tests

- [x] 8.1 Create `tests/tokens.test.ts`: read `src/styles/tokens.css`, normalize whitespace, assert the six tables of R1–R6. Test names: `exposes_semantic_color_tokens`, `exposes_page_palette_color_tokens`, `exposes_font_family_tokens`, `exposes_typography_scale_tokens`, `exposes_spacing_tokens`, `exposes_radius_tokens`. — R1–R6
- [x] 8.2 Create `tests/fonts.test.ts`: parse `package.json` for the two Fontsource dependencies; assert the three `@import` statements in `global.css`; scan all source files and the rendered page for external font providers. Test names: `declares_fontsource_dependencies`, `imports_fontsource_entry_stylesheets`, `does_not_reference_external_font_providers`. — R7–R9
- [x] 8.3 Create `tests/global-styles.test.ts`: static declarations of body styles, resets, selection, scrollbar, smooth scroll, reduced motion and the animation utilities; plus the negative focus assertion. Test names: `applies_design_body_styles`, `applies_base_resets`, `applies_selection_colors`, `hides_webkit_scrollbar`, `enables_smooth_scroll`, `honors_reduced_motion`, `defines_fade_in_up_animation_and_delays`, `does_not_suppress_focus_outlines`. — R10–R16, R30
- [x] 8.4 Create `tests/hero.test.ts`: render `HeroSection` with `experimental_AstroContainer` for structure, verbatim texts, the two SVGs and the enabled secondary CTA (`type="button"`, no `aria-disabled` / `disabled`, `data-email`); read `src/components/HeroSection.astro` for the CSS contract (headline, accent, tagline, CTAs, geometry) using whitespace-normalized comparisons and offset pairing for the 768px media query. Test names: `renders_hero_structure`, `renders_verbatim_hero_texts`, `styles_hero_headline`, `styles_gradient_accent_fragment`, `styles_glass_tagline`, `styles_primary_cta`, `styles_secondary_cta`, `renders_inline_svg_icons`, `applies_hero_geometry`. — R17–R25, R33
- [x] 8.5 Update `tests/index.test.ts`: drop the `<h1>Astro</h1>` assertion; render `src/pages/index.astro` and assert the document shell, page-shell geometry, exactly one bundled client script (the clipboard enhancement) with no islands / frameworks / inline handlers, the blooms layer and a single `<h1>`. Test names: `renders_spanish_document_shell`, `renders_page_shell_geometry`, `ships_only_clipboard_enhancement`, `renders_atmospheric_blooms_layer`, `renders_exactly_one_h1`. — R26–R29, R31
- [x] 8.6 Create `tests/clipboard.test.ts`: unit-test the module with a fake `ClipboardWriter` (resolving and rejecting) and a `Set`-backed `ToastView`, driving the timer with `vi.useFakeTimers()`; add the static wiring assertion on `HeroSection.astro` and the email scan of `src/`. Test names: `copies_contact_email_to_clipboard`, `wires_copy_listener_to_secondary_cta`, `handles_clipboard_rejection`, `shows_toast_with_copy_message`, `hides_toast_after_2600ms`, `restarts_hide_timer_on_new_show`, `defines_contact_email_once`. — R32–R35, R39
- [x] 8.7 Create `tests/toast.test.ts`: render `src/pages/index.astro` with `experimental_AstroContainer` for the toast markup (`renders_hidden_toast` also asserts `role="status"` and `aria-live="polite"` on `#toast`) and the `check_circle` SVG; read `src/layouts/BaseLayout.astro` for the toast CSS with whitespace-normalized comparisons. Test names: `renders_hidden_toast`, `renders_toast_icon`, `styles_toast`, `defines_toast_visibility_states`. — R36–R38, R40

## 9. Verification

- [x] 9.1 Run `pnpm format` and `pnpm lint`; no disabled rules, no leftover TODOs, no dead CSS. — all R
- [x] 9.2 Run `pnpm check` (strict Astro/TypeScript diagnostics). — all R
- [x] 9.3 Run `pnpm test`; every test above is green and maps to its requirement. — all R
- [x] 9.4 Run `pnpm build`; confirm the built page is static, bundles the Fontsource files and contains no external font requests, exactly one bundled client script (the clipboard enhancement) and no hydrated islands. — all R
- [x] 9.5 Manual check with `pnpm preview` in a secure context (localhost qualifies): click "Copiar Correo", paste and verify `carlosolcina23@gmail.com`, confirm the toast appears with `Correo copiado al portapapeles` and hides after ~2.6 s. — R32, R34, R36–R40 (human-verified on 2026-09-28)

## Definition of done

- All checkboxes `[x]`, `pnpm validate` green.
- `specs/hero-section/requirements.md` traceability table fully covered by the tests in `tests/`.
- No files outside design §3 modified (no `astro.config.mjs`, `tsconfig.json` or `vitest.config.ts` changes).
- The only client-side script in the build is the bundled clipboard enhancement.
