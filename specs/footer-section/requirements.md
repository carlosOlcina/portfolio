# Requirements — footer-section

- **Feature:** `footer-section` (id 10, `sdd: true`).
- **Source of truth:** `specs/hero-section/references/chromatic-glass.html` lines 2159–2217 (authoritative footer markup) and its digest `specs/hero-section/references/design-notes.md` (line 326). The footer renders after `</main>` as a full-width bar with an inner `max-w-5xl` (64rem) container.
- **Human decisions (2026-10-01, non-negotiable):**
  1. The footer follows the Stitch "Full Chromatic Glass" mockup: translucent glass bar, identity block (`Carlos Olcina` + role + copyright), schedule icon and location line.
  2. The location line MUST read `Alicante, España (CET / UTC+1)`; the mockup's `València, España (CET / UTC+1)` is discarded because the human lives in Alicante.
  3. In the mockup's social row (email placeholder plus GitHub / X / LinkedIn separated by dots) **only** the email ships: a `mailto:` link showing `carlosolcina23@gmail.com`, consumed from the shared `CONTACT_EMAIL` in `src/site-constants.ts`. No GitHub/X/LinkedIn links, no dot separators.
  4. The copyright text stays verbatim `© 2025 Carlos Olcina. Todos los derechos reservados.` (the year is intentionally untouched; the observation is recorded only in `progress/current.md`).
  5. The footer is site chrome and belongs to the page shell: `BaseLayout.astro` renders it immediately after `</main>` and before the existing toast, outside `.site-container`; `src/pages/index.astro` is not modified.
  6. The stale contact-section exclusion (R41) is superseded through a dated amendment in `specs/contact-section/requirements.md` while the no-nav, no-about/experience and no-WebGL-shader exclusions remain.
- **In scope:** `src/components/FooterSection.astro` (markup, texts, inline `schedule` SVG, scoped CSS), the `BaseLayout.astro` wiring, the dated contact-section amendment, the update of `tests/contact-section.test.ts > omits_excluded_sections` and `tests/index.test.ts > ships_only_clipboard_enhancement`, and the new `tests/footer-section.test.ts` tracing every `R<n>`.
- **Out of scope (future increments):** floating nav/header, about/experience section, WebGL shader background, form/message logic, social links in the footer, i18n, Tailwind or any new dependency, new global CSS or design tokens, changes to the copyright year.

**Notation.** Every requirement uses EARS and contains exactly one `MUST` / `MUST NOT`. Ids `R<n>` are stable. "The design reference" means the mockup HTML above plus its digest. Values are the **effective computed values** of the design after Tailwind utility resolution (same convention as `specs/hero-section/requirements.md` and `specs/contact-section/requirements.md`); `backdrop-blur-2xl`, `max-w-5xl`, `gap-8`, `gap-3`, `gap-1` and `mt-margin` follow the mockup's Tailwind config (`margin: 2rem`) and Tailwind defaults (`2xl` = 40px, `5xl` = 64rem). Every requirement is verified by at least one concrete Vitest test (see `Traceability` at the end).

---

## 1. Component, placement and page invariants

### R1 — Semantic footer root

WHEN `FooterSection` renders, the system MUST render a single root `<footer class="footer">` element whose only child is `<div class="footer__inner">`, with no `<nav>`, `<main>`, `<section>` or `<script>` element inside it.

**Verification:** `tests/footer-section.test.ts` → `renders_footer_structure` (renders the component through the Container API; asserts the root tag, the inner wrapper and the absence of the forbidden elements).

### R2 — Layout wiring

The system MUST wire the footer through `src/layouts/BaseLayout.astro` by importing `FooterSection` and rendering `<FooterSection />` immediately after the `</main>` element and before the `#toast` element, with `src/pages/index.astro` left unmodified and free of any `FooterSection` reference.

**Verification:** `tests/footer-section.test.ts` → `renders_footer_in_base_layout` (reads `BaseLayout.astro` and `index.astro` and asserts the import, the call order `</main>` → `<FooterSection />` → `id="toast"` and the index absence).

### R3 — Page composition

WHEN the home page renders, the system MUST render exactly one `<footer>` element, positioned after `</main>` and before the toast, contributing no `<nav>` element and no `<h1>`–`<h6>` element.

**Verification:** `tests/footer-section.test.ts` → `renders_single_footer` (page render: `</main>` index < `<footer class="footer"` index < `id="toast"` index; exactly one `<footer>`; no `<nav>`; no heading inside the footer) plus the existing `tests/index.test.ts` → `renders_exactly_one_h1`.

### R4 — No entrance animation

The system MUST NOT apply the global entrance animation utilities (`animate-fade-in-up`, `animation-delay-*`) or define any `@keyframes` rule in the footer component.

**Verification:** `tests/footer-section.test.ts` → `omits_entrance_animation` (source scan of `FooterSection.astro`).

---

## 2. Identity block

### R5 — Identity texts

The system MUST render the identity block with the exact structure and verbatim texts below.

| Element              | Markup text (verbatim)                                 |
| -------------------- | ------------------------------------------------------ |
| `.footer__name`      | `Carlos Olcina`                                        |
| `.footer__role`      | `Ingeniero Senior Full-Stack y Sistemas de IA`         |
| `.footer__copyright` | `© 2025 Carlos Olcina. Todos los derechos reservados.` |

**Verification:** `tests/footer-section.test.ts` → `renders_identity_texts` (amended 2026-10-01: the rendered copyright year is 2026).

### R6 — Identity styles

The system MUST style the identity block with the exact declarations below.

| Element              | Declarations                                                                                                                                                                                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.footer__identity`  | `display: flex`; `flex-direction: column`; `align-items: center`; `gap: 0.25rem`                                                                                                                                                                                                                   |
| `.footer__name`      | `font-family: var(--font-headline)`; `font-size: var(--text-headline-sm-size)`; `line-height: var(--text-headline-sm-line-height)`; `letter-spacing: var(--text-headline-sm-letter-spacing)`; `font-weight: var(--text-headline-sm-weight)`; `font-style: italic`; `color: var(--color-slate-900)` |
| `.footer__role`      | `font-family: var(--font-body)`; `font-size: var(--text-body-sm-size)`; `line-height: var(--text-body-sm-line-height)`; `letter-spacing: var(--text-body-sm-letter-spacing)`; `font-weight: 300`; `color: var(--color-slate-600)`                                                                  |
| `.footer__copyright` | `font-family: var(--font-body)`; `font-size: var(--text-body-sm-size)`; `line-height: var(--text-body-sm-line-height)`; `letter-spacing: var(--text-body-sm-letter-spacing)`; `font-weight: 300`; `color: var(--color-slate-400)`                                                                  |

**Verification:** `tests/footer-section.test.ts` → `styles_identity_block`.

### R7 — Responsive layout

WHEN the viewport is at least 768px wide, the system MUST switch `.footer__inner` to `flex-direction: row` and align `.footer__identity` with `align-items: flex-start` and `.footer__meta` with `align-items: flex-end`.

**Verification:** `tests/footer-section.test.ts` → `styles_responsive_layout` (extracts the `@media (min-width: 768px)` block).

---

## 3. Location line and schedule icon

### R8 — Location text

WHEN the footer renders, the system MUST render the location line as `.footer__location` containing the decorative schedule icon and a `.footer__location-text` span whose verbatim text is `Alicante, España (CET / UTC+1)`.

**Verification:** `tests/footer-section.test.ts` → `renders_location_line`.

### R9 — No mockup city

The system MUST NOT contain the string `València` in `FooterSection.astro` or in the rendered home page.

**Verification:** `tests/footer-section.test.ts` → `omits_mockup_city` (source scan plus page render).

### R10 — Schedule icon

The system MUST render the schedule icon as a decorative inline SVG with `class="footer__schedule-icon"`, `viewBox="0 -960 960 960"`, explicit `width="16"` and `height="16"`, `fill="currentColor"`, `aria-hidden="true"`, the exact Material Symbols `schedule` path below and no icon font.

| Icon       | Path data                                                                                                                                                                                                                                                                                                                                                      |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schedule` | `m612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z` |

**Verification:** `tests/footer-section.test.ts` → `renders_schedule_icon`.

### R11 — Location styles

The system MUST style the location line with the exact declarations below.

| Element                  | Declarations                                                                                                                                                                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.footer__location`      | `display: flex`; `align-items: center`; `gap: 0.5rem`; `font-family: var(--font-body)`; `font-size: var(--text-label-md-size)`; `line-height: var(--text-label-md-line-height)`; `letter-spacing: var(--text-label-md-letter-spacing)`; `font-weight: var(--text-label-md-weight)`; `color: var(--color-slate-600)` |
| `.footer__schedule-icon` | `width: 16px`; `height: 16px`; `flex-shrink: 0`                                                                                                                                                                                                                                                                     |

**Verification:** `tests/footer-section.test.ts` → `styles_location_line`.

---

## 4. Contact email link

### R12 — Single email link

The system MUST render exactly one link in the footer, `<a class="footer__email" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>`, so the visible text and the `mailto:` target are the shared contact address.

**Verification:** `tests/footer-section.test.ts` → `renders_single_email_link` (renders the component and the page; extracts the `<footer>` block and asserts exactly one `<a class="footer__email">`, its `href="mailto:carlosolcina23@gmail.com"` and its whitespace-normalized visible text).

### R13 — No social links or dot separators

The system MUST NOT render GitHub, X or LinkedIn links, dot separators (`•`) or the mockup's placeholder address `alex@example.com` in the footer.

**Verification:** `tests/footer-section.test.ts` → `omits_social_links` (component source and rendered footer scan for `github.com`, `x.com`, `linkedin.com`, `>GitHub<`, `>LinkedIn<`, `>X<`, `•` and `alex@example.com`).

### R14 — Shared contact email

The system MUST consume the shared contact email by importing `CONTACT_EMAIL` from `../site-constants` in `src/components/FooterSection.astro`, with no `carlosolcina23@gmail.com` literal duplicated in the component.

**Verification:** `tests/footer-section.test.ts` → `imports_shared_contact_email` (asserts the import line, the absence of the literal in the component source and the rendered `mailto:` href) plus the existing `tests/clipboard.test.ts` → `defines_contact_email_once` (single literal in `src/`).

### R15 — Email link styles

The system MUST style `.footer__email` with `font-family: var(--font-body)`, `font-size: var(--text-body-sm-size)`, `line-height: var(--text-body-sm-line-height)`, `letter-spacing: var(--text-body-sm-letter-spacing)`, `font-weight: var(--text-body-sm-weight)`, `color: var(--color-slate-600)` and `transition: color 200ms cubic-bezier(0.4, 0, 0.2, 1)`, and its hover state with `color: var(--color-primary)`.

**Verification:** `tests/footer-section.test.ts` → `styles_email_link`.

---

## 5. Footer shell

### R16 — Footer bar styles

The system MUST style `.footer` with the exact declarations below.

| Declaration                                   | Value                                 |
| --------------------------------------------- | ------------------------------------- |
| `width`                                       | `100%`                                |
| `margin-top`                                  | `var(--space-margin)`                 |
| `position`                                    | `relative`                            |
| `z-index`                                     | `10`                                  |
| `background-color`                            | `rgba(255, 255, 255, 0.4)`            |
| `-webkit-backdrop-filter` / `backdrop-filter` | `blur(40px)`                          |
| `border-top`                                  | `1px solid rgba(199, 210, 254, 0.35)` |

**Verification:** `tests/footer-section.test.ts` → `styles_footer_shell`.

### R17 — Inner container geometry

The system MUST style `.footer__inner` with `max-width: 64rem`, `margin-inline: auto`, `padding-block: 3.5rem`, `padding-inline: 1.5rem`, `display: flex`, `flex-direction: column`, `align-items: center`, `justify-content: space-between` and `gap: 2rem`, and `.footer__meta` with `display: flex`, `flex-direction: column`, `align-items: center` and `gap: 0.75rem`.

**Verification:** `tests/footer-section.test.ts` → `styles_footer_inner`.

### R18 — Zero client JavaScript and script budget

The system MUST add no client-side script, no hydrated island (`client:*`) and no inline event-handler attribute to `FooterSection`, keeping the page's bundled scripts at exactly two (the hero and contact clipboard enhancements) with no third `<script>`.

**Verification:** `tests/footer-section.test.ts` → `ships_zero_client_javascript` (source scan plus page render script count) and the updated `tests/index.test.ts` → `ships_only_clipboard_enhancement` (scan list extended to `FooterSection.astro`, still expecting two bundled scripts).

### R19 — Scoped styles and untouched globals

The system MUST keep every footer declaration inside the component's scoped `<style>` block, reusing existing `var(--…)` tokens wherever the design maps to one, adding no rule to `src/styles/global.css`, no new design token, no `@keyframes` and no `outline: none`/`outline: 0` declaration.

**Verification:** `tests/footer-section.test.ts` → `styles_are_scoped_and_tokenized` (reads the component and `global.css`) plus the existing `tests/global-styles.test.ts` → `does_not_suppress_focus_outlines` and `tests/tokens.test.ts` (unchanged token counts).

---

## 6. Exclusions and contact-spec amendment

### R20 — Contact-section exclusion amended

The system MUST supersede R41's footer clause through a dated amendment in `specs/contact-section/requirements.md` stating that the page now renders exactly one `<footer>` (owned by `FooterSection`) while the no-nav, no-about/experience and no-WebGL-shader clauses remain in force, with `tests/contact-section.test.ts > omits_excluded_sections` updated to assert exactly one `<footer>` instead of none.

**Verification:** `tests/footer-section.test.ts` → `amends_contact_section_exclusions` (reads `specs/contact-section/requirements.md` and asserts the amendment heading, the `R41` reference and the `superseded` wording) plus the updated `tests/contact-section.test.ts` → `omits_excluded_sections` (one `<footer>`, no `<nav>`).

### R21 — No canvas or shader code

The system MUST keep the `src/` tree free of `<canvas>` elements and shader code, superseding only the footer clause of the contact-section exclusion.

**Verification:** `tests/contact-section.test.ts` → `omits_excluded_sections` (recursive `src/` scan kept from the original test) and `tests/footer-section.test.ts` → `omits_excluded_features` (component source scan).

### R22 — Footer scope exclusions

The system MUST NOT render the floating nav, the about/experience section, the WebGL shader or form/message logic inside the footer: no `<nav>`, `<form>`, `<input>`, `<textarea>` or `<button>`, no `preventDefault`/submit handler and no success or message strings.

**Verification:** `tests/footer-section.test.ts` → `omits_form_and_message_logic` (component source and rendered footer scan).

### R23 — No new dependencies

The system MUST NOT add or remove dependencies: the `dependencies` and `devDependencies` maps of `package.json` stay exactly as they are before this feature.

**Verification:** `tests/contact-section.test.ts` → `keeps_dependencies_unchanged` (existing test, kept green by this feature).

---

## Traceability

| Requirement | Test file                       | Test name(s)                                                                                                   |
| ----------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| R1          | `tests/footer-section.test.ts`  | `renders_footer_structure`                                                                                     |
| R2          | `tests/footer-section.test.ts`  | `renders_footer_in_base_layout`                                                                                |
| R3          | `tests/footer-section.test.ts`  | `renders_single_footer` (plus `tests/index.test.ts` → `renders_exactly_one_h1`)                                |
| R4          | `tests/footer-section.test.ts`  | `omits_entrance_animation`                                                                                     |
| R5          | `tests/footer-section.test.ts`  | `renders_identity_texts`                                                                                       |
| R6          | `tests/footer-section.test.ts`  | `styles_identity_block`                                                                                        |
| R7          | `tests/footer-section.test.ts`  | `styles_responsive_layout`                                                                                     |
| R8          | `tests/footer-section.test.ts`  | `renders_location_line`                                                                                        |
| R9          | `tests/footer-section.test.ts`  | `omits_mockup_city`                                                                                            |
| R10         | `tests/footer-section.test.ts`  | `renders_schedule_icon`                                                                                        |
| R11         | `tests/footer-section.test.ts`  | `styles_location_line`                                                                                         |
| R12         | `tests/footer-section.test.ts`  | `renders_single_email_link`                                                                                    |
| R13         | `tests/footer-section.test.ts`  | `omits_social_links`                                                                                           |
| R14         | `tests/footer-section.test.ts`  | `imports_shared_contact_email` (plus `tests/clipboard.test.ts` → `defines_contact_email_once`)                 |
| R15         | `tests/footer-section.test.ts`  | `styles_email_link`                                                                                            |
| R16         | `tests/footer-section.test.ts`  | `styles_footer_shell`                                                                                          |
| R17         | `tests/footer-section.test.ts`  | `styles_footer_inner`                                                                                          |
| R18         | `tests/footer-section.test.ts`  | `ships_zero_client_javascript` (plus `tests/index.test.ts` → `ships_only_clipboard_enhancement`)               |
| R19         | `tests/footer-section.test.ts`  | `styles_are_scoped_and_tokenized` (plus `tests/global-styles.test.ts`, `tests/tokens.test.ts`)                 |
| R20         | `tests/footer-section.test.ts`  | `amends_contact_section_exclusions` (plus updated `tests/contact-section.test.ts` → `omits_excluded_sections`) |
| R21         | `tests/contact-section.test.ts` | `omits_excluded_sections` (plus `tests/footer-section.test.ts` → `omits_excluded_features`)                    |
| R22         | `tests/footer-section.test.ts`  | `omits_form_and_message_logic`                                                                                 |
| R23         | `tests/contact-section.test.ts` | `keeps_dependencies_unchanged`                                                                                 |

## Feature description coverage

| Feature description item (id 10)                                                                          | Requirements      |
| --------------------------------------------------------------------------------------------------------- | ----------------- |
| Site footer (translucent chromatic glass bar) on the home page, mockup lines 2159–2217                    | R1, R16, R17      |
| Left identity block: `Carlos Olcina` italic headline-sm slate-900, role and copyright in body-sm          | R5, R6            |
| Right block: schedule icon plus location line and contact link                                            | R8, R10, R11, R12 |
| Location MUST read `Alicante, España (CET / UTC+1)` (not the mockup's València)                           | R8, R9            |
| Social row ships as ONLY the email link (no GitHub / X / LinkedIn, no dot separators)                     | R12, R13          |
| `mailto:` to the shared `CONTACT_EMAIL` from `src/site-constants.ts`, no duplicate literal                | R12, R14          |
| Footer placed in the page shell after `</main>` and before the toast                                      | R2, R3            |
| Supersede the stale footer exclusion: contact-section R41 amendment plus `omits_excluded_sections` update | R20, R21          |
| Page invariants: zero client JS, no nav, no about/experience, no WebGL shader, no form/message logic      | R3, R18, R21, R22 |
| No new dependencies                                                                                       | R23               |

## Human decision coverage

| Human directive                                                                                 | Requirements         |
| ----------------------------------------------------------------------------------------------- | -------------------- |
| 1. Footer follows the Stitch mockup (identity block, role, copyright, glass shell)              | R1, R5, R6, R16, R17 |
| 2. Location line reads `Alicante, España (CET / UTC+1)`, not `València`                         | R8, R9               |
| 3. Only the email link ships, as `mailto:` to `CONTACT_EMAIL`, with no social links or dots     | R12, R13, R14        |
| 4. Copyright text kept verbatim (year untouched; observation recorded in `progress/current.md`) | R5                   |
| 5. Footer owned by the page shell (`BaseLayout`), rendered after `</main>`                      | R2, R3               |
| 6. Amendment/withdrawal of the contact-section footer exclusion                                 | R20, R21             |
| 7. Zero-JS footer, no new dependencies                                                          | R18, R19, R23        |

## Amendments

### 2026-10-01 — Copyright year updated to 2026 (human order)

The human ordered the footer copyright year updated to 2026 on the same day the feature was implemented. R5 is amended:

- **R5 effective text (copyright row):** `.footer__copyright` MUST render `© 2026 Carlos Olcina. Todos los derechos reservados.` (verbatim and static, no dynamic year); `.footer__name` and `.footer__role` keep the texts above, and the `© 2025` wording earlier in this file is kept as history.
- **Verification updated:** `tests/footer-section.test.ts > renders_identity_texts` now asserts the `© 2026` text; the R5 verification note above is annotated with the amendment date.
- **Superseded observation:** the "changes to the copyright year" clause of the out-of-scope bullet and the year-untouched observation in human decision 4 are superseded from this date.
- **No requirement is renumbered**; R1–R23 keep their coverage and ids.
