# Implementation report — hero-section

- **Status:** implemented, awaiting reviewer. `feature_list.json` left `in_progress`.
- **Spec:** `specs/hero-section/{requirements,design,tasks}.md` (human-approved).
- **Scope delivered:** global design tokens, Fontsource fonts, base page styles,
  hero section, CSS atmospheric blooms, page shell, clipboard enhancement + toast,
  and the full Vitest coverage for R1–R40.

## Files created / modified

Created:

| File                               | Responsibility                                                                                                                                 |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/styles/tokens.css`            | 31 semantic colors, 13 palette colors, 2 families, 11 type-scale entries, 9 spaces, 5 radii (R1–R6).                                           |
| `src/styles/global.css`            | Fontsource imports, tokens import, resets, body styles, selection, scrollbar, smooth scroll, reduced motion, entrance animation (R8, R10–R16). |
| `src/layouts/BaseLayout.astro`     | Document shell, blooms layer, page-level toast singleton, `<main>`/container geometry (R26, R27, R29, R36–R38, R40).                           |
| `src/components/HeroSection.astro` | Hero markup, inline SVG icons, `CONTACT_EMAIL`, scoped styles, single clipboard `<script>` (R17–R25, R28, R32, R33).                           |
| `src/scripts/clipboard.ts`         | `copyToClipboard` + `showToast` with injectable interfaces (R32–R35, R38, R39).                                                                |
| `tests/tokens.test.ts`             | R1–R6 (6 tests).                                                                                                                               |
| `tests/fonts.test.ts`              | R7–R9 (3 tests).                                                                                                                               |
| `tests/global-styles.test.ts`      | R10–R16, R30 (8 tests).                                                                                                                        |
| `tests/hero.test.ts`               | R17–R25, R33 (9 tests).                                                                                                                        |
| `tests/clipboard.test.ts`          | R32–R35, R39 (7 tests).                                                                                                                        |
| `tests/toast.test.ts`              | R36–R38, R40 (4 tests).                                                                                                                        |
| `tests/node-shims.d.ts`            | Test-only ambient typings for the `node:fs` surface (deviation, see below).                                                                    |

Modified:

| File                    | Change                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `src/pages/index.astro` | Rewritten: `PAGE_TITLE` / `PAGE_DESCRIPTION`, `BaseLayout` + `HeroSection` (R26, R27).                              |
| `tests/index.test.ts`   | Replaced the Astro smoke test with R26–R29, R31 assertions (5 tests).                                               |
| `package.json`          | `pnpm add @fontsource-variable/newsreader @fontsource-variable/plus-jakarta-sans` (5.3.0, the only two added deps). |
| `pnpm-lock.yaml`        | Lockfile update from the same command.                                                                              |

`specs/hero-section/tasks.md` was checked task by task (see below).
No other source, config or feature files were changed.

## Commands run and results

| Command                                                                           | Result                                                                                                                                                       |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm validate` (baseline)                                                        | Green before starting (1 test).                                                                                                                              |
| `pnpm add @fontsource-variable/newsreader @fontsource-variable/plus-jakarta-sans` | Added 2 packages, no others; `package.json` diff shows only those two `dependencies`.                                                                        |
| `pnpm format`                                                                     | Ran (`prettier --write .`).                                                                                                                                  |
| `pnpm validate` (final)                                                           | **Green**: `eslint .` clean; `astro check` 0 errors / 0 warnings on 16 files; `vitest run` **42 tests / 7 files passed**; `astro build` 1 static page built. |
| `pnpm exec prettier --write src tests`                                            | Re-run after later edits; only in-plan files touched.                                                                                                        |

Build inspection of `dist/` (task 9.4):

- `dist/index.html` contains **exactly one** `<script>`: `<script type="module">` with
  the minified clipboard enhancement (`toast--visible`, `TOAST_HIDE_DELAY_MS` 2600,
  `navigator.clipboard`, `#copy-email-hero-btn`, `#toast`).
- No `astro-island`, no UI framework runtime, no external scripts, no `on*=` handlers.
- No `fonts.googleapis.com`, `fonts.gstatic.com` or remote font URLs anywhere in `dist/`.
  Fontsource is bundled: 9 local `.woff2` assets in `dist/_astro/` (Newsreader normal +
  italic and Plus Jakarta Sans) plus one small inlined base64 face; the only `http`
  string in `dist/` is the SVG `xmlns` namespace in `favicon.svg`.
- The CSS bundle keeps the tokens and the hero/toast/blooms rules
  (`--color-primary: #3525cd`, `padding-block:5rem`, `translateY(6rem)`,
  `@media(min-width:768px)`, `@media(min-width:1024px)`, `fadeInSlideUp`).

## Tasks checked / unchecked

- `[x]` 1.1–1.2, 2.1–2.6, 3.1–3.7, 4.1–4.6, 5.1–5.9, 6.1–6.4, 7.1, 8.1–8.7, 9.1–9.4.
- `[ ]` **9.5 — manual browser clipboard check**, intentionally unchecked: no browser is
  installed in this environment and the interaction requires a real clipboard and
  `pnpm preview` in a secure context. Not executable by an agent here; flagged for the
  reviewer/human. The behaviour it covers (copy, toast message, ~2.6 s auto-hide) is
  unit-tested with fakes in `tests/clipboard.test.ts`.

## Traceability R1–R40 → tests

| R       | Test(s)                                                                                                                                                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1–R6   | `tests/tokens.test.ts`: `exposes_semantic_color_tokens`, `exposes_page_palette_color_tokens`, `exposes_font_family_tokens`, `exposes_typography_scale_tokens`, `exposes_spacing_tokens`, `exposes_radius_tokens`                                                    |
| R7–R9   | `tests/fonts.test.ts`: `declares_fontsource_dependencies`, `imports_fontsource_entry_stylesheets`, `does_not_reference_external_font_providers`                                                                                                                     |
| R10–R16 | `tests/global-styles.test.ts`: `applies_design_body_styles`, `applies_base_resets`, `applies_selection_colors`, `hides_webkit_scrollbar`, `enables_smooth_scroll`, `honors_reduced_motion`, `defines_fade_in_up_animation_and_delays`                               |
| R17–R25 | `tests/hero.test.ts`: `renders_hero_structure`, `renders_verbatim_hero_texts`, `styles_hero_headline`, `styles_gradient_accent_fragment`, `styles_glass_tagline`, `styles_primary_cta`, `styles_secondary_cta`, `renders_inline_svg_icons`, `applies_hero_geometry` |
| R26–R29 | `tests/index.test.ts`: `renders_spanish_document_shell`, `renders_page_shell_geometry`, `ships_only_clipboard_enhancement`, `renders_atmospheric_blooms_layer`                                                                                                      |
| R30     | `tests/global-styles.test.ts`: `does_not_suppress_focus_outlines`                                                                                                                                                                                                   |
| R31     | `tests/index.test.ts`: `renders_exactly_one_h1`                                                                                                                                                                                                                     |
| R32     | `tests/clipboard.test.ts`: `copies_contact_email_to_clipboard`, `wires_copy_listener_to_secondary_cta`                                                                                                                                                              |
| R33     | `tests/clipboard.test.ts`: `defines_contact_email_once`                                                                                                                                                                                                             |
| R34     | `tests/clipboard.test.ts`: `shows_toast_with_copy_message`                                                                                                                                                                                                          |
| R35     | `tests/clipboard.test.ts`: `handles_clipboard_rejection`                                                                                                                                                                                                            |
| R36–R38 | `tests/toast.test.ts`: `renders_hidden_toast`, `styles_toast`, `defines_toast_visibility_states`                                                                                                                                                                    |
| R39     | `tests/clipboard.test.ts`: `hides_toast_after_2600ms`, `restarts_hide_timer_on_new_show`                                                                                                                                                                            |
| R40     | `tests/toast.test.ts`: `renders_toast_icon`                                                                                                                                                                                                                         |

## Deviations / notes

1. **`tests/node-shims.d.ts` (new file, outside design §3).** `astro check` type-checks
   `tests/**` (tsconfig `include: ["**/*"]`) and this repo has **no `@types/node`**;
   adding it would violate the "no other dependencies" rule and editing `tsconfig.json`
   is forbidden. The shim declares only the used surface (`readFileSync`,
   `readdirSync` + `Dirent`, URL-based paths) so the static source assertions compile
   without suppressions. Tests use `new URL(...)` so only `node:fs` is declared.
   If the human prefers `@types/node` as a devDependency, the shim can be deleted.
2. **Prettier formatting outside the plan.** The mandated `pnpm format` reflows
   markdown/HTML it has never processed before. It rewrote the untracked spec files
   `specs/hero-section/*.md` and `references/*.html` (content unchanged, only table
   alignment/line wrapping). It also reformatted
   `.opencode/skills/astro-modern-practices/SKILL.md`, which I reverted with
   `git checkout --`. `feature_list.json` only carries the leader's `in_progress` entry.
3. **Visual comparison (step 4).** The reference `chromatic-glass.png` is a 161×512
   thumbnail that captured the hero mid-animation (hero content not painted), so a
   pixel comparison is not possible from it. I compared every hero/toast/bloom
   declaration value-by-value against `design-notes.md` and the R19–R40 tables and
   found no deviation. `9.5` (real-browser check) remains for the human.
4. **Test helper duplication.** The whitespace/canonicalization and recursive source
   scan helpers are defined per test file to respect the design §3 file list (no extra
   shared test util file).

## Addendum — post-review fixes

Reviewer verdict: APPROVED (`progress/review_hero-section.md`). The two recommended
non-blocking fixes were applied; no functional changes.

1. **Prettier cleanliness.** Ran
   `pnpm exec prettier --write tests/clipboard.test.ts progress/impl_hero-section.md progress/review_hero-section.md`.
   The wrapped `expect(compactHeroSource).toContain(...)` call in
   `tests/clipboard.test.ts` and the report tables are now Prettier-clean. No
   committed files outside the feature were reformatted.
2. **Stale reference line citations.** The earlier Prettier reflow of
   `references/chromatic-glass.html` shifted its line numbers. Every anchor was
   re-verified with `rg -n`/`sed` and the citations were updated in
   `requirements.md` (header bullet) and `design.md` (§1):
   - hero markup: `272–296` → `551–611` (`<section` at 551, `</section>` at 611);
   - toast markup: `789–806` → `2111–2121` (`<div` at 2111, `</div>` at 2121);
   - global styles: `3–42` → `30–108` (`<style>` at 30, `</style>` at 108);
   - page shell: `1–2 and 75` → `1–11 and 274` (`<!doctype html>` line 1,
     `<html …>` lines 2–11, `<body` line 274).

Verification after the fixes:

- `pnpm exec prettier --check tests src` → **green**, exit 0
  ("All matched files use Prettier code style!").
- `pnpm validate` → **green**, exit 0: `eslint .` clean, `astro check` 0 errors
  (16 files), `vitest run` 42/42 tests in 7 files, `astro build` 1 static page.
- `feature_list.json` untouched: `hero-section` remains `in_progress`.
- Task `9.5` (manual browser clipboard check) remains unchecked for the human.

## Session close

- **Date:** 2026-09-28.
- **Final status:** `done`. Task 9.5 was human-verified (the clipboard copies
  `carlosolcina23@gmail.com`, the toast shows `Correo copiado al portapapeles` and
  auto-hides after ~2.6 s); every task in `specs/hero-section/tasks.md` is `[x]` and
  `feature_list.json` marks `hero-section` as `done`.
- **Final `pnpm validate`:** green (exit 0) — `eslint .` clean, `astro check`
  0 errors (16 files), `vitest run` 42/42 tests in 7 files, `astro build`
  1 static page.
- Session summary appended to `progress/history.md`; `progress/current.md` reset to
  its template. Evidence kept: this report and `progress/review_hero-section.md`.
