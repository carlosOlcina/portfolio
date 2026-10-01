# Implementation report — footer-section (feature 10)

- **Status:** implemented, awaiting reviewer. Feature **not** marked `done`.
- **Date:** 2026-10-01.
- **Spec:** `specs/footer-section/{requirements,design,tasks}.md` (approved, all tasks marked `[x]`).

## 1. Files created / modified

| File                                    | Action | Summary                                                                                                                                                                                                                |
| --------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/FooterSection.astro`    | create | `<footer class="footer">` + `footer__inner/identity/meta/location/schedule-icon/location-text/email` markup and scoped CSS. No `Props`, no script, no email literal; imports `CONTACT_EMAIL` from `../site-constants`. |
| `src/layouts/BaseLayout.astro`          | modify | Added `import FooterSection from '../components/FooterSection.astro';` and `<FooterSection />` immediately after `</main>`, before `id="toast"` (+2 lines).                                                            |
| `specs/contact-section/requirements.md` | modify | Dated `## Amendments` section (2026-10-01) superseding R41's footer clause; R41 `**Verification:**` line updated to the amended `omits_excluded_sections` expectations. R1–R42 ids unchanged.                          |
| `tests/contact-section.test.ts`         | modify | `omits_excluded_sections` now asserts exactly one `<footer class="footer">` (was: none) and keeps the no-`<nav>` + recursive `src/` `<canvas`/`shader` scans.                                                          |
| `tests/index.test.ts`                   | modify | `ships_only_clipboard_enhancement` adds `'components/FooterSection.astro'` to `pageSources`; script budget stays at two.                                                                                               |
| `tests/footer-section.test.ts`          | create | 22 tests covering R1–R22 (R23 via the existing contact suite).                                                                                                                                                         |
| `specs/footer-section/tasks.md`         | modify | All `T1.1`–`T6.6` marked `[x]`.                                                                                                                                                                                        |
| `progress/current.md`                   | modify | Implementation notes + `© 2025` observation + verification evidence.                                                                                                                                                   |

Untouched, as designed: `src/pages/index.astro`, `src/site-constants.ts`, `package.json`, `src/styles/*`, `astro.config.mjs`, `vitest.config.ts`, the other components and suites.

## 2. Tasks completed

- **T1.1–T1.6** — `FooterSection.astro`: frontmatter (`CONTACT_EMAIL` import + exact Material Symbols `SCHEDULE_ICON_PATH`), semantic root, identity block, meta block (schedule SVG + Alicante line + single email link), full scoped CSS from design.md §5, zero-JS/exclusion confirmation.
- **T2.1–T2.3** — `BaseLayout` wiring; `index.astro` untouched; shell order `blooms → main → footer → toast`.
- **T3.1–T3.2** — contact-section dated amendment + R41 verification line update.
- **T4.1–T4.3** — updated the two existing tests; audited `hero`, `projects-section`, `technologies-section`, `toast`, `clipboard`, `fonts`, `global-styles`, `tokens` — no changes needed, full suite green.
- **T5.1–T5.7** — `tests/footer-section.test.ts` with all 22 designed test names, one per `R<n>`; no test asserts the email literal inside the component (the opposite is asserted).
- **T6.1–T6.6** — format/lint/check/test/build + preview and built-output verification (evidence in §4).

## 3. Tests added / updated (results)

New `tests/footer-section.test.ts` (22/22 pass): `renders_footer_structure`, `renders_footer_in_base_layout`, `renders_single_footer`, `omits_entrance_animation`, `renders_identity_texts`, `styles_identity_block`, `styles_responsive_layout`, `renders_location_line`, `omits_mockup_city`, `renders_schedule_icon`, `styles_location_line`, `renders_single_email_link`, `omits_social_links`, `imports_shared_contact_email`, `styles_email_link`, `styles_footer_shell`, `styles_footer_inner`, `ships_zero_client_javascript`, `styles_are_scoped_and_tokenized`, `amends_contact_section_exclusions`, `omits_excluded_features`, `omits_form_and_message_logic`.

Updated and passing: `tests/contact-section.test.ts > omits_excluded_sections`, `tests/index.test.ts > ships_only_clipboard_enhancement`. The other 16 suites pass unchanged.

## 4. Verification evidence (commands and results)

| Command                                | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm format`                          | Only the new/edited files reformatted; `git status` shows no unrelated file touched.                                                                                                                                                                                                                                                                                                                                                                                                       |
| `pnpm lint`                            | 0 errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `pnpm check` (`astro check`, 37 files) | 0 errors, 0 warnings, 0 hints.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `pnpm test`                            | **18 files passed, 214 tests passed** (baseline before feature: 17 files / 192 tests).                                                                                                                                                                                                                                                                                                                                                                                                     |
| `pnpm build`                           | 1 page built, complete.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `pnpm validate`                        | Green end to end (lint + check + test + build).                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `pnpm exec prettier --check .`         | `All matched files use Prettier code style!` (mirrors the CI format check).                                                                                                                                                                                                                                                                                                                                                                                                                |
| `dist/index.html` assertions           | Order `</main>` → `<footer class="footer"` → `id="toast"`; 1 `<footer>`; identity/role/`© 2025` texts; `Alicante, España (CET / UTC+1)`; `href="mailto:carlosolcina23@gmail.com"` and visible address; exactly 2 bundled scripts (Hero + Contact); no `València`; no `github.com`/`x.com`/`linkedin.com`, no `•`, no `alex@example.com` in the footer; exactly 1 `<a>` in the footer; no `FooterSection` script.                                                                           |
| `pnpm preview` + Playwright (1280px)   | `.footer`: width 100%, margin-top 32px, relative, z-index 10, `rgba(255,255,255,0.4)`, `blur(40px)`, `1px solid rgba(199,210,254,0.35)`. `.footer__inner`: max-width 1024px, auto margins, 56px/24px padding, row, space-between, gap 32px. Identity `flex-start`, meta `flex-end`. `Newsreader`, 20px, italic, 500, `-0.3px`, slate-900; role/copyright weight 300 slate-600/slate-400; location 13px/500 slate-600; email 12px slate-600 with `color 0.2s cubic-bezier(0.4, 0, 0.2, 1)`. |
| `pnpm preview` + Playwright (375px)    | `.footer__inner` column + centered; identity and meta `align-items: center`.                                                                                                                                                                                                                                                                                                                                                                                                               |
| Hover / keyboard focus                 | Email hover computed `rgb(53, 37, 205)` (`var(--color-primary)`); Tab reaches the link and keeps the native outline (`outline-style: auto`, 1px) — no outline suppression.                                                                                                                                                                                                                                                                                                                 |
| Scope checks                           | `git diff --stat src/` = only `BaseLayout.astro` (+2); `package.json` unchanged; email literal exactly **1** occurrence under `src/` (in `site-constants.ts`); no `València` under `src/`; `FooterSection.astro`/`BaseLayout.astro` contain no `<script>`.                                                                                                                                                                                                                                 |

## 5. Traceability R<n> → test

| R   | Test(s)                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | `tests/footer-section.test.ts > renders_footer_structure`                                                                                                    |
| R2  | `tests/footer-section.test.ts > renders_footer_in_base_layout`                                                                                               |
| R3  | `tests/footer-section.test.ts > renders_single_footer` + `tests/index.test.ts > renders_exactly_one_h1`                                                      |
| R4  | `tests/footer-section.test.ts > omits_entrance_animation`                                                                                                    |
| R5  | `tests/footer-section.test.ts > renders_identity_texts`                                                                                                      |
| R6  | `tests/footer-section.test.ts > styles_identity_block`                                                                                                       |
| R7  | `tests/footer-section.test.ts > styles_responsive_layout`                                                                                                    |
| R8  | `tests/footer-section.test.ts > renders_location_line`                                                                                                       |
| R9  | `tests/footer-section.test.ts > omits_mockup_city`                                                                                                           |
| R10 | `tests/footer-section.test.ts > renders_schedule_icon`                                                                                                       |
| R11 | `tests/footer-section.test.ts > styles_location_line`                                                                                                        |
| R12 | `tests/footer-section.test.ts > renders_single_email_link`                                                                                                   |
| R13 | `tests/footer-section.test.ts > omits_social_links`                                                                                                          |
| R14 | `tests/footer-section.test.ts > imports_shared_contact_email` + `tests/clipboard.test.ts > defines_contact_email_once`                                       |
| R15 | `tests/footer-section.test.ts > styles_email_link`                                                                                                           |
| R16 | `tests/footer-section.test.ts > styles_footer_shell`                                                                                                         |
| R17 | `tests/footer-section.test.ts > styles_footer_inner`                                                                                                         |
| R18 | `tests/footer-section.test.ts > ships_zero_client_javascript` + `tests/index.test.ts > ships_only_clipboard_enhancement`                                     |
| R19 | `tests/footer-section.test.ts > styles_are_scoped_and_tokenized` + `tests/global-styles.test.ts > does_not_suppress_focus_outlines` + `tests/tokens.test.ts` |
| R20 | `tests/footer-section.test.ts > amends_contact_section_exclusions` + `tests/contact-section.test.ts > omits_excluded_sections`                               |
| R21 | `tests/contact-section.test.ts > omits_excluded_sections` + `tests/footer-section.test.ts > omits_excluded_features`                                         |
| R22 | `tests/footer-section.test.ts > omits_form_and_message_logic`                                                                                                |
| R23 | `tests/contact-section.test.ts > keeps_dependencies_unchanged`                                                                                               |

## 6. Spec deviations

- **None affecting behavior or structure.** One interpretation note: `tasks.md` T3.2 ("update the R41 verification description") was implemented both as the `**Verification updated:**` bullet inside the appended amendment (design.md §7) and by updating the R41 `**Verification:**` line to point at the amended `omits_excluded_sections` expectations, so the contact spec no longer leaves a stale verification description. R41's original requirement sentence is kept as history (dated-amendment convention, same as the feature 8 amendment), and the amendment records the effective text. No requirement ids changed.
- `styles_are_scoped_and_tokenized` asserts rules exist for the 10 styled selectors; `.footer__location-text` is a markup-only hook (it inherits typography from `.footer__location`), so the test asserts its markup presence instead of a rule that design.md §5 does not define.

## 7. Blockers

None. The Container API rendered the page without needing the design.md §8 fallback; the placement tests run against the real page render.

## Post-review update (2026-10-01) — copyright year

The human overrode the earlier year-untouched decision the same day: the static copyright text is now `© 2026 Carlos Olcina. Todos los derechos reservados.` (no dynamic year, no new code paths, feature status unchanged):

- `src/components/FooterSection.astro` — year changed to 2026 (only change in the component).
- `tests/footer-section.test.ts > renders_identity_texts` — regex expectation updated to `© 2026`; no other test changed.
- `specs/footer-section/requirements.md` — R5 verification annotated `(amended 2026-10-01: the rendered copyright year is 2026)` plus a dated `## Amendments` entry giving R5's effective text and superseding the year-untouched observations; original `© 2025` statements kept as history.
- `specs/footer-section/design.md` — text contract updated to 2026; the superseded mentions in §1, decision 12 and the rejected-alternatives table annotated with the amendment date.
- `feature_list.json` — id 10 description year updated to 2026 (prettier-formatted).
- `progress/history.md` — appended note; this section in `progress/impl_footer-section.md`.

Verification: `pnpm validate` green (lint + `astro check` + tests + build), `pnpm exec prettier --check .` green, no `2025` left under `src/` or `tests/`, and the rendered footer text is exactly `© 2026 Carlos Olcina. Todos los derechos reservados.` with zero client JavaScript.
