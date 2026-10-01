# Design — footer-section

## 1. Context

Fifth UI increment of the portfolio: the site footer of the Stitch design **Full Chromatic Glass**, sourced from `specs/hero-section/references/chromatic-glass.html` lines 2159–2217 (authoritative markup) and the digest in `specs/hero-section/references/design-notes.md` (line 326, page shell at lines 304–312). The footer is the last element of the page shell, rendered outside `<main>`.

Hard constraints from the harness: Astro 7 + strict TypeScript, zero-JS footer, plain CSS with the existing custom properties (no Tailwind), no icon font, no new dependencies, every requirement traceable to a Vitest test. Human decisions: location line `Alicante, España (CET / UTC+1)`; only the email link ships (no GitHub/X/LinkedIn and no dot separators) as a `mailto:` to the shared `CONTACT_EMAIL`; the identity block, role and `© 2025` copyright follow the mockup (copyright year superseded 2026-10-01: the human ordered `© 2026`; see the amendment in `specs/footer-section/requirements.md`); the stale contact-section footer exclusion is superseded with a dated amendment.

The feature mirrors the `contact-section` architecture: a presentational component with scoped styles and no client script, a layout that owns the page shell, and the existing test conventions (Container API render + source CSS assertions). It adds no data collection and no page data.

## 2. Decisions summary

1. New `src/components/FooterSection.astro`: static markup (no `Props`), one inline `schedule` SVG and scoped CSS. No script, no island, no inline handler.
2. Placement: `src/layouts/BaseLayout.astro` renders `<FooterSection />` immediately after `</main>` and before the `#toast` element. `src/pages/index.astro` is untouched. Rationale and rejected alternative in §6.
3. Shell translation: `.footer` = `width: 100%`; `margin-top: var(--space-margin)` (`mt-margin` = 2rem); `position: relative`; `z-index: 10`; `background-color: rgba(255, 255, 255, 0.4)` (`bg-white/40`); `-webkit-backdrop-filter`/`backdrop-filter: blur(40px)` (Tailwind `backdrop-blur-2xl` default); `border-top: 1px solid rgba(199, 210, 254, 0.35)` (`border-indigo-200/35`).
4. Inner container: `.footer__inner` = `max-width: 64rem` (`max-w-5xl`), `margin-inline: auto`, `padding-block: 3.5rem` (`py-14`), `padding-inline: 1.5rem` (`px-6`), flex column centered with `justify-content: space-between` and `gap: 2rem` (`gap-8`); at ≥768px (`md`) it becomes a row, identity aligns `flex-start` and meta aligns `flex-end`.
5. Identity block: `.footer__name` (headline-sm tokens, italic, slate-900), `.footer__role` (body-sm, weight 300, slate-600), `.footer__copyright` (body-sm, weight 300, slate-400), stacked with `gap: 0.25rem` (`gap-1`).
6. Location: `.footer__location` (label-md tokens, slate-600, `gap: 0.5rem`) with the 16px inline `schedule` SVG and the verbatim `Alicante, España (CET / UTC+1)` span. The mockup's `València` is discarded per the human decision.
7. Contact link: exactly one `<a class="footer__email" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>`, importing `CONTACT_EMAIL` from `../site-constants`; the email literal stays unique under `src/`. The mockup's GitHub/X/LinkedIn links and `•` separators are dropped (human decision), so the single-child `.footer__links` wrapper of the mockup is dropped too.
8. `schedule` is reproduced as an inline SVG with the exact Material Symbols path, `viewBox="0 -960 960 960"`, `width="16"`, `height="16"`, `fill="currentColor"`, `aria-hidden="true"`. No icon font, no external request.
9. `specs/contact-section/requirements.md` gets a dated amendment superseding only the footer clause of R41; `tests/contact-section.test.ts > omits_excluded_sections` flips from "no `<footer>`" to "exactly one `<footer>`" while keeping the no-`<nav>` and no-canvas/shader assertions.
10. `tests/index.test.ts > ships_only_clipboard_enhancement` extends its page-source scan to `components/FooterSection.astro`; the page script budget stays at two bundled clipboard scripts.
11. No global CSS change, no new token, no `@keyframes`, no suppressed focus outline, no dependency change.
12. The copyright text keeps the mockup's `© 2025` verbatim; the year observation is recorded only in `progress/current.md`. **Superseded 2026-10-01 (human order):** the effective design contract is `© 2026 Carlos Olcina. Todos los derechos reservados.` (static text, no dynamic year); see the amendment in `specs/footer-section/requirements.md`.

## 3. Files

| File                                    | Action | Responsibility                                                                                              |
| --------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| `src/components/FooterSection.astro`    | create | Footer markup, identity/location/email blocks, inline `schedule` SVG and scoped CSS (R1, R4–R19, R22).      |
| `src/layouts/BaseLayout.astro`          | modify | Imports `FooterSection` and renders `<FooterSection />` after `</main>`, before the toast (R2, R3).         |
| `specs/contact-section/requirements.md` | modify | Dated amendment superseding R41's footer clause (R20).                                                      |
| `tests/footer-section.test.ts`          | create | Component render, page placement, CSS contract, email contract, zero-JS and exclusion tests (R1–R22).       |
| `tests/contact-section.test.ts`         | modify | `omits_excluded_sections` asserts exactly one `<footer>`, keeps no-nav and canvas/shader scans (R20, R21).  |
| `tests/index.test.ts`                   | modify | `ships_only_clipboard_enhancement` adds `components/FooterSection.astro` to the scanned page sources (R18). |

Unchanged: `src/pages/index.astro`, `src/site-constants.ts`, `package.json`, `src/styles/*`, `astro.config.mjs`, `vitest.config.ts`, the other components, the other tests (audit in §8).

## 4. `src/components/FooterSection.astro`

```astro
---
import { CONTACT_EMAIL } from '../site-constants';

const SCHEDULE_ICON_PATH =
  'm612-292 56-56-148-148v-184h-80v216l172 172ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q133 0 226.5-93.5T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 133 93.5 226.5T480-160Z';
---

<footer class="footer">
  <div class="footer__inner">
    <div class="footer__identity">
      <span class="footer__name">Carlos Olcina</span>
      <p class="footer__role">Ingeniero Senior Full-Stack y Sistemas de IA</p>
      <p class="footer__copyright">
        © 2026 Carlos Olcina. Todos los derechos reservados.
      </p>
    </div>
    <div class="footer__meta">
      <div class="footer__location">
        <svg
          class="footer__schedule-icon"
          viewBox="0 -960 960 960"
          width="16"
          height="16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d={SCHEDULE_ICON_PATH}></path>
        </svg>
        <span class="footer__location-text">
          Alicante, España (CET / UTC+1)
        </span>
      </div>
      <a class="footer__email" href={`mailto:${CONTACT_EMAIL}`}>
        {CONTACT_EMAIL}
      </a>
    </div>
  </div>
</footer>
```

Class contract (tests assert these hooks): `.footer`, `.footer__inner`, `.footer__identity`, `.footer__name`, `.footer__role`, `.footer__copyright`, `.footer__meta`, `.footer__location`, `.footer__schedule-icon`, `.footer__location-text`, `.footer__email`.

Notes:

- There is no frontmatter `Props`: the only input is the shared constant, imported from `src/site-constants.ts` (R14). The email literal never appears in this file.
- The mockup's social row was `<div class="flex items-center gap-4">` with three children separated by `<span class="text-slate-300">•</span>`; with only the email left, the wrapper would have a single child, so the anchor is rendered directly inside `.footer__meta` (the 0.75rem column gap separates it from the location line). This is the only structural deviation from the mockup, mandated by the human decision.
- `<a>` inherits no colour from global CSS (`a { color: inherit; text-decoration: inherit; }`), so `.footer__email` sets `color` explicitly.
- Prettier may wrap the email anchor and the location span across lines (80-column default); both carry only whitespace between the tags and their text, so tests assert on whitespace-normalized HTML (`normalize`) and never on raw line breaks.
- The `<footer>` is a direct child of `<body>` in the rendered page, so it maps to the `contentinfo` landmark without extra ARIA.
- The `schedule` path is copied from the official Material Symbols `schedule_24px.svg` (24px grid, `viewBox="0 -960 960 960"`), including the `Zm0-400Z` subpath; no icon font is loaded.

## 5. CSS contract

All declarations live in the component's scoped `<style>` block; no global CSS and no new tokens. Rules are single-selector (the repo's test helpers extract one selector per rule).

```css
.footer {
  width: 100%;
  margin-top: var(--space-margin);
  position: relative;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.4);
  -webkit-backdrop-filter: blur(40px);
  backdrop-filter: blur(40px);
  border-top: 1px solid rgba(199, 210, 254, 0.35);
}

.footer__inner {
  max-width: 64rem;
  margin-inline: auto;
  padding-block: 3.5rem;
  padding-inline: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.footer__identity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.footer__name {
  font-family: var(--font-headline);
  font-size: var(--text-headline-sm-size);
  line-height: var(--text-headline-sm-line-height);
  letter-spacing: var(--text-headline-sm-letter-spacing);
  font-weight: var(--text-headline-sm-weight);
  font-style: italic;
  color: var(--color-slate-900);
}

.footer__role {
  font-family: var(--font-body);
  font-size: var(--text-body-sm-size);
  line-height: var(--text-body-sm-line-height);
  letter-spacing: var(--text-body-sm-letter-spacing);
  font-weight: 300;
  color: var(--color-slate-600);
}

.footer__copyright {
  font-family: var(--font-body);
  font-size: var(--text-body-sm-size);
  line-height: var(--text-body-sm-line-height);
  letter-spacing: var(--text-body-sm-letter-spacing);
  font-weight: 300;
  color: var(--color-slate-400);
}

.footer__meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.footer__location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-body);
  font-size: var(--text-label-md-size);
  line-height: var(--text-label-md-line-height);
  letter-spacing: var(--text-label-md-letter-spacing);
  font-weight: var(--text-label-md-weight);
  color: var(--color-slate-600);
}

.footer__schedule-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.footer__email {
  font-family: var(--font-body);
  font-size: var(--text-body-sm-size);
  line-height: var(--text-body-sm-line-height);
  letter-spacing: var(--text-body-sm-letter-spacing);
  font-weight: var(--text-body-sm-weight);
  color: var(--color-slate-600);
  transition: color 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.footer__email:hover {
  color: var(--color-primary);
}

@media (min-width: 768px) {
  .footer__inner {
    flex-direction: row;
  }

  .footer__identity {
    align-items: flex-start;
  }

  .footer__meta {
    align-items: flex-end;
  }
}
```

### Tailwind → CSS translation table

| Mockup utility                                            | Computed value / rule                                                                   |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `w-full`                                                  | `width: 100%`                                                                           |
| `mt-margin`                                               | `margin-top: var(--space-margin)` (`margin` = 2rem in the mockup config)                |
| `relative`, `z-10`                                        | `position: relative`, `z-index: 10`                                                     |
| `bg-white/40`                                             | `rgba(255, 255, 255, 0.4)`                                                              |
| `backdrop-blur-2xl`                                       | `blur(40px)` (Tailwind default `2xl`)                                                   |
| `border-t border-indigo-200/35`                           | `1px solid rgba(199, 210, 254, 0.35)` (indigo-200 = `#c7d2fe`)                          |
| `max-w-5xl`, `mx-auto`                                    | `64rem`, `margin-inline: auto`                                                          |
| `px-6`, `py-14`                                           | `padding-inline: 1.5rem`, `padding-block: 3.5rem`                                       |
| `flex flex-col md:flex-row`                               | `flex-direction: column` → `row` at `768px`                                             |
| `items-center`, `justify-between`                         | `align-items: center`, `justify-content: space-between`                                 |
| `gap-8`, `gap-3`, `gap-1`, `gap-2`                        | `2rem`, `0.75rem`, `0.25rem`, `0.5rem`                                                  |
| `gap-4` (dropped social row)                              | removed with the GitHub/X/LinkedIn links                                                |
| `font-headline-sm text-headline-sm italic text-slate-900` | headline-sm tokens + `font-style: italic` + `var(--color-slate-900)`                    |
| `font-body-sm text-body-sm text-slate-600/400 font-light` | body-sm tokens + `font-weight: 300` + `var(--color-slate-600)`/`var(--color-slate-400)` |
| `text-[16px]`                                             | `width: 16px; height: 16px`                                                             |
| `text-slate-600 font-label-md text-label-md`              | label-md tokens + `var(--color-slate-600)`                                              |
| `hover:text-primary transition-colors duration-200`       | `color: var(--color-primary)` + `transition: color 200ms cubic-bezier(0.4, 0, 0.2, 1)`  |
| `md` breakpoint                                           | `768px`                                                                                 |

Deviations and conflict resolutions:

- **Only-email row:** the mockup's row (`email` + `•` + `GitHub` + `•` + `X` + `•` + `LinkedIn`) is reduced to a single anchor; the wrapper `<div class="flex items-center gap-4">` and the `gap-4` translation disappear with it (human decision, R12/R13).
- **City:** `Alicante` replaces `València` in the location line (human decision, R8/R9).
- **No entrance animation:** unlike the page sections, the mockup footer carries no `animate-*` classes; the component adds none and defines no `@keyframes` (R4).
- **Focus outline:** no `outline: none`; the email link keeps the native focus outline (`tests/global-styles.test.ts`).
- **Blur value:** `backdrop-blur-2xl` is Tailwind's 40px, not the 24px used by the glass cards; the footer follows the mockup's utility, and the token `--space-margin` is reused for `mt-margin`.
- **Container width:** the footer inner container is 64rem (`max-w-5xl`) while `.site-container` is 72rem; this mismatch is intentional in the mockup (the footer is narrower than the main content column) and the footer sits outside `.site-container`.

## 6. Placement — `src/layouts/BaseLayout.astro`

The mockup renders the footer after `</main>` (line 2158–2159) as a full-width bar; `BaseLayout.astro` owns the body shell (`blooms`, `<main class="site-main">`, `<div class="site-container">` and the toast). The footer is static site chrome with no page data, so it belongs to the layout: every route gets it automatically and `index.astro` stays wiring-only for content sections.

```astro
---
import '../styles/global.css';
import FooterSection from '../components/FooterSection.astro';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<!doctype html>
<html lang="es">
  <head>…</head>
  <body>
    <div class="blooms">…</div>
    <main class="site-main">
      <div class="site-container">
        <slot />
      </div>
    </main>
    <FooterSection />
    <div class="toast" id="toast" role="status" aria-live="polite">
      …
    </div>
  </body>
</html>
```

How the tests prove the chosen placement:

- `tests/footer-section.test.ts > renders_footer_in_base_layout` reads both sources: `BaseLayout.astro` contains `import FooterSection from '../components/FooterSection.astro';` and `<FooterSection />` between `</main>` and `id="toast"`, while `index.astro` contains no `FooterSection` reference.
- `tests/footer-section.test.ts > renders_single_footer` renders the home page and asserts `</main>` index < `<footer class="footer"` index < `id="toast"` index, exactly one `<footer>`, no `<nav>` and no heading inside the footer.
- The existing `tests/index.test.ts > renders_exactly_one_h1` stays green (the footer contributes no heading).

Rejected alternative — render `<FooterSection />` in `src/pages/index.astro`:

- The footer is not home content: it is body-level chrome that the mockup places outside `<main>` and that every future route needs. Putting it in `index.astro` would couple site chrome to one page and force duplication when more routes appear, while `BaseLayout` already owns the other body-level elements (blooms, main, toast).

## 7. Contact-section amendment (R41)

Append to `specs/contact-section/requirements.md` (same dated style as the feature 8 amendment in `specs/technologies-section/requirements.md`):

```md
## Amendments

### 2026-10-01 — Footer no longer excluded (R41 footer clause superseded)

The `footer-section` feature (id 10) adds the site footer to the page shell, so the footer clause of R41 is superseded:

- **R41 effective text:** the system MUST NOT add the floating nav, the about/experience section or the WebGL shader; the home page keeps no `<nav>` element and exactly one `<footer>` element (owned by `src/components/FooterSection.astro`), and the `src/` tree gains no canvas/shader code. The no-`<footer>` clause is no longer in force.
- **Verification updated:** `tests/contact-section.test.ts > omits_excluded_sections` now asserts exactly one `<footer>` (class `footer`) and keeps asserting no `<nav>` and no `<canvas`/`shader` under `src/`.
- **No requirement is renumbered**; R1–R42 keep their coverage except the footer clause above, and the header bullet that listed the footer as out of scope is superseded from this date.
```

`tests/contact-section.test.ts > omits_excluded_sections` becomes:

```ts
it('omits_excluded_sections', async () => {
  const html = normalize(await renderPage());

  expect(html.match(/<footer\b/g)).toHaveLength(1);
  expect(html).toContain('<footer class="footer"');
  expect(html).not.toMatch(/<nav\b/);

  for (const fileUrl of collectSourceFiles(sourceRoot)) {
    const content = readFileSync(fileUrl, 'utf8').toLowerCase();
    expect(content, `${fileUrl.pathname} must not add a canvas`).not.toContain(
      '<canvas',
    );
    expect(content, `${fileUrl.pathname} must not add a shader`).not.toContain(
      'shader',
    );
  }
});
```

The rest of the contact spec and its tests are untouched.

## 8. Test strategy

**New file — `tests/footer-section.test.ts`.** Renders `FooterSection` and `Index` through the Astro Container API; the page render uses the repo's collection-aware mock, simplified to empty collections because the footer consumes no data:

```ts
vi.mock('astro:content', () => ({
  getCollection: async () => [],
}));
```

CSS assertions read `FooterSection.astro`, `BaseLayout.astro`, `index.astro` and `src/styles/global.css` with `readFileSync`, using the whitespace-normalizing `extractRule` / `extractMediaBlock` helpers duplicated per the repo convention.

Test names and coverage:

| Test name                           | Asserts                                                                                                   | R   |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- | --- |
| `renders_footer_structure`          | root `<footer class="footer">`, `.footer__inner`, no `<nav>`/`<section>`/`<script>` inside                | R1  |
| `renders_footer_in_base_layout`     | `BaseLayout` import + call order; no `FooterSection` in `index.astro`                                     | R2  |
| `renders_single_footer`             | page order `</main>` → footer → toast; one `<footer>`; no `<nav>`; no heading in footer                   | R3  |
| `omits_entrance_animation`          | no `animate-fade-in-up`, `animation-delay-`, `@keyframes`                                                 | R4  |
| `renders_identity_texts`            | verbatim name, role and copyright inside their classes                                                    | R5  |
| `styles_identity_block`             | `.footer__identity`, `.footer__name`, `.footer__role`, `.footer__copyright` declarations                  | R6  |
| `styles_responsive_layout`          | `@media (min-width: 768px)` block rules                                                                   | R7  |
| `renders_location_line`             | `.footer__location-text` = `Alicante, España (CET / UTC+1)`                                               | R8  |
| `omits_mockup_city`                 | no `València` in component source or rendered page                                                        | R9  |
| `renders_schedule_icon`             | exact `schedule` SVG attributes and path; no `material-symbols`                                           | R10 |
| `styles_location_line`              | `.footer__location`, `.footer__schedule-icon` declarations                                                | R11 |
| `renders_single_email_link`         | exactly one `<a class="footer__email">` with the `mailto:` href and whitespace-normalized visible address | R12 |
| `omits_social_links`                | no GitHub/X/LinkedIn links, no `•`, no `alex@example.com`                                                 | R13 |
| `imports_shared_contact_email`      | import line, no literal in the component, rendered href                                                   | R14 |
| `styles_email_link`                 | `.footer__email` + `:hover` declarations                                                                  | R15 |
| `styles_footer_shell`               | `.footer` declarations                                                                                    | R16 |
| `styles_footer_inner`               | `.footer__inner` and `.footer__meta` declarations                                                         | R17 |
| `ships_zero_client_javascript`      | no `<script`, `client:`, inline handlers; page keeps exactly two scripts                                  | R18 |
| `styles_are_scoped_and_tokenized`   | component `<style>` with `var(--…)`; `global.css` has no `.footer`; no keyframes/outline suppression      | R19 |
| `amends_contact_section_exclusions` | contact requirements file holds the dated R41 amendment                                                   | R20 |
| `omits_excluded_features`           | component source has no `<canvas`/`shader`                                                                | R21 |
| `omits_form_and_message_logic`      | no nav/form/input/textarea/button, no `preventDefault`, no success strings                                | R22 |

**Existing suites — impact audit.**

| Suite                                                                                           | Render scope                                  | Impact                                                                                         | Action                                                                                  |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `tests/contact-section.test.ts`                                                                 | section with fixtures + full page             | `omits_excluded_sections` currently asserts no `<footer>`; now the page has one                | Update to expect exactly one `<footer>`, keep no-nav and canvas/shader scans (R20, R21) |
| `tests/index.test.ts`                                                                           | full page                                     | `ships_only_clipboard_enhancement` scans a fixed page-source list that must include the footer | Add `components/FooterSection.astro` to `pageSources`; script budget stays at two (R18) |
| `tests/hero.test.ts`                                                                            | `HeroSection` only                            | None: its `<p>`/`<a>`/`<button>` counts are scoped to the hero                                 | None                                                                                    |
| `tests/projects-section.test.ts`                                                                | section with fixtures + page `indexOf` checks | None: no page-wide counts; footer adds no `<article>`/`<h2>`                                   | None                                                                                    |
| `tests/technologies-section.test.ts`                                                            | section with fixtures + page `indexOf` checks | None: collection-aware mock already returns `[]` for other collections                         | None                                                                                    |
| `tests/toast.test.ts`                                                                           | full page with the real content layer         | None: footer adds no `#toast` and `extractToast` slices only the toast element                 | None                                                                                    |
| `tests/clipboard.test.ts`                                                                       | source scan + `HeroSection` render            | None: footer imports `CONTACT_EMAIL`, so the literal stays unique under `src/`                 | None                                                                                    |
| `tests/fonts.test.ts`                                                                           | source scan + full page                       | None: no external font host or remote `url()` in the footer                                    | None                                                                                    |
| `tests/global-styles.test.ts`                                                                   | `src/` scan for `outline: none/0`             | None: the footer keeps the native focus outline                                                | None                                                                                    |
| `tests/tokens.test.ts`                                                                          | token counts in `src/styles/tokens.css`       | None: no token is added, changed or removed                                                    | None                                                                                    |
| `tests/projects-content`, `technologies-content`, `profiles-content`, `*-schema`, `ci-workflow` | files/workflow only                           | None: no data or workflow change                                                               | None                                                                                    |

**CSS contract.** No CSS engine runs in Vitest, so style tests read the component source and assert exact declarations with `expectDeclarations`/`extractRule` (same helpers as the other suites, kept duplicated for consistency).

**Fallback if the Container API cannot render the page.** The component render and the source/CSS assertions are independent of the page render. If the page render fails unexpectedly under Vitest, the placement assertions fall back to source-contract checks plus built-output verification in task 6.4: `dist/index.html` must contain the footer after `</main>` with the three identity texts, the Alicante line, the `mailto:` link and no `València`/social links. The chosen variant is recorded in `progress/current.md`.

## 9. Rejected alternatives

| Alternative                                                                 | Why rejected                                                                                                                                                                                                                                     |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rendering `<FooterSection />` from `src/pages/index.astro`                  | The footer is site chrome outside `<main>`; `BaseLayout` owns the body shell, so the section would have to be duplicated for every future route.                                                                                                 |
| Inlining the footer markup directly in `BaseLayout.astro`                   | `docs/architecture.md` keeps reusable UI in `src/components/`; a component is isolated, testable and consistent with every other section.                                                                                                        |
| Keeping the mockup's GitHub / X / LinkedIn links and dot separators         | Explicit human decision: only the email ships, to avoid placeholder social links.                                                                                                                                                                |
| Keeping the mockup's `<div class="flex items-center gap-4">` social wrapper | With a single child it adds nothing; the anchor sits directly in `.footer__meta` (YAGNI).                                                                                                                                                        |
| Keeping `València, España (CET / UTC+1)`                                    | The human lives in Alicante; the location must be accurate.                                                                                                                                                                                      |
| Porting the `material-symbols-outlined` font for `schedule`                 | External request and repo precedent: exact inline SVG paths, never an icon font.                                                                                                                                                                 |
| Adding any client JavaScript (menu, year, copy)                             | Zero-JS guardrail; the footer is static and the email is a plain `mailto:`.                                                                                                                                                                      |
| Reusing `animate-fade-in-up` / `animation-delay-*` for the footer           | The mockup footer has no entrance animation; adding one is speculative and would change the page choreography.                                                                                                                                   |
| New global CSS rules or design tokens                                       | Every value maps to an existing token or is a one-off layout value; scoped styles keep the global build small.                                                                                                                                   |
| `outline: none` on the email link focus                                     | Forbidden by `tests/global-styles.test.ts`; the native focus outline is preserved.                                                                                                                                                               |
| Updating the copyright year to 2026                                         | Explicit human instruction to keep `© 2025` verbatim; the observation lives only in `progress/current.md`. **Superseded 2026-10-01 (human order):** the copyright year is now 2026; see the amendment in `specs/footer-section/requirements.md`. |
| Duplicating the email literal in the footer                                 | Violates the single-occurrence rule (contact-section R11/R12) enforced by `tests/clipboard.test.ts`.                                                                                                                                             |

## 10. Out of scope / future work

- Floating nav/header and about/experience section (the human has no experience data).
- WebGL shader background.
- Footer social links (GitHub/X/LinkedIn) — deliberately dropped.
- Form/message logic (contact feature) and any footer interactivity.
- i18n; the footer copy is Spanish like the rest of the page.
- Any new dependency (icon set, UI framework, CSS tooling).
- Copyright year update (kept verbatim as instructed). **Superseded 2026-10-01 (human order):** the copyright year is now 2026; see the amendment in `specs/footer-section/requirements.md`.

## 11. Risks

| Risk                                                              | Mitigation                                                                                                                                   |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `omits_excluded_sections` flips and would fail without the update | Task 4.1 and the dated amendment land together with the component (R20).                                                                     |
| The script-budget test's source list omits the new component      | `tests/index.test.ts` extends `pageSources` with `components/FooterSection.astro`; the count stays at two (task 4.2, R18).                   |
| Ambiguity translating `backdrop-blur-2xl`                         | Tailwind default is `blur(40px)`; documented in §5 and asserted exactly in `styles_footer_shell`.                                            |
| `mailto:` href built from an expression renders unexpectedly      | The test asserts the rendered `href="mailto:carlosolcina23@gmail.com"` on normalized HTML; the source assertion checks the template literal. |
| The `schedule` path is mistyped                                   | Path copied verbatim from the official `schedule_24px.svg` and asserted with an exact `d="…"` match.                                         |
| Footer text collides with existing page-wide assertions           | Audit in §8: no suite counts page-wide `<p>`, `<a>`, `<svg>` or text besides the title; `renders_exactly_one_h1` stays green.                |
| `València` accidentally reintroduced                              | `omits_mockup_city` scans the component source and the rendered page (R9).                                                                   |
| Email literal duplicated while editing                            | `imports_shared_contact_email` plus the existing `defines_contact_email_once` guard the single occurrence (R14).                             |
