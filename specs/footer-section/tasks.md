# Tasks — footer-section

Ordered checklist. Each task references the `R<n>` it covers. The implementer marks `[x]` as tasks complete; `pnpm validate` must be green at the end. Only the files listed in `design.md` §3 are touched. No new dependency is added and no client-side JavaScript is introduced.

## 1. Footer component — `src/components/FooterSection.astro` (create)

- [x] 1.1 Add the frontmatter: `import { CONTACT_EMAIL } from '../site-constants';` and the `SCHEDULE_ICON_PATH` constant with the exact Material Symbols path of `design.md` §4. No `Props`, no local email literal. — R14, R10
- [x] 1.2 Write the semantic root: `<footer class="footer">` with the single `<div class="footer__inner">` child, no `<nav>`/`<section>`/`<script>` inside. — R1
- [x] 1.3 Write the identity block: `.footer__identity` with the `.footer__name` span `Carlos Olcina`, the `.footer__role` paragraph `Ingeniero Senior Full-Stack y Sistemas de IA` and the `.footer__copyright` paragraph `© 2025 Carlos Olcina. Todos los derechos reservados.` (verbatim, year untouched). — R5
- [x] 1.4 Write the meta block: `.footer__meta` with the `.footer__location` row (inline 16px `schedule` SVG with `viewBox="0 -960 960 960"`, `fill="currentColor"`, `aria-hidden="true"` + `.footer__location-text` `Alicante, España (CET / UTC+1)`) and the single `<a class="footer__email" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>`. No GitHub/X/LinkedIn links, no dot separators, no `alex@example.com`. — R8, R10, R12, R13, R14
- [x] 1.5 Add the scoped styles exactly as in `design.md` §5: shell (R16), inner/meta (R17), identity block (R6), location line and icon (R11), email link and hover (R15), and the `@media (min-width: 768px)` rules (R7). Do not add `.footer` rules to `global.css`, do not define `@keyframes`, do not suppress the focus outline. — R6, R7, R11, R15, R16, R17, R19
- [x] 1.6 Confirm the component ships no client JavaScript: no `<script>`, no `client:*`, no inline event-handler attribute, no `animate-fade-in-up`/`animation-delay-*`, and no `València`, canvas, shader, nav or form/message markup. — R4, R9, R18, R19, R21, R22

## 2. Page shell wiring — `src/layouts/BaseLayout.astro` (modify)

- [x] 2.1 Add `import FooterSection from '../components/FooterSection.astro';` in the frontmatter. — R2
- [x] 2.2 Render `<FooterSection />` immediately after `</main>` and before the `#toast` element. — R2, R3
- [x] 2.3 Confirm `src/pages/index.astro` keeps no `FooterSection` reference and the body shell order is `blooms` → `main` → footer → toast. — R2, R3

## 3. Contact spec amendment — `specs/contact-section/requirements.md` (modify)

- [x] 3.1 Append the dated `## Amendments` section of `design.md` §7 superseding only R41's footer clause (no-nav, no-about/experience and no-WebGL-shader clauses stay in force) and stating the effective R41 text. — R20, R21
- [x] 3.2 Update the R41 verification description to point at the amended `omits_excluded_sections` expectations (exactly one `<footer>`, no `<nav>`, no canvas/shader scan), keeping `R1`–`R42` ids unchanged. — R20

## 4. Existing test updates

- [x] 4.1 Update `tests/contact-section.test.ts > omits_excluded_sections`: expect exactly one `<footer>` including `<footer class="footer"`, keep `not.toMatch(/<nav\b/)` and the recursive `src/` scan for `<canvas`/`shader`. — R20, R21
- [x] 4.2 Update `tests/index.test.ts > ships_only_clipboard_enhancement`: add `'components/FooterSection.astro'` to `pageSources`; keep expecting exactly two bundled clipboard scripts and the existing island/handler scans. — R18
- [x] 4.3 Audit the remaining page-rendering suites (`hero`, `projects-section`, `technologies-section`, `toast`, `clipboard`, `fonts`, `global-styles`, `tokens`) against the footer texts and structure using the `design.md` §8 table; no change is expected and any unexpected failure is documented in `progress/current.md`. — R3, R18, R19, R23

## 5. New tests — `tests/footer-section.test.ts` (create)

- [x] 5.1 Add the scaffolding: `vi.mock('astro:content')` returning `[]`, imports of `Index`, `FooterSection` and `CONTACT_EMAIL`, source reads (`FooterSection.astro`, `BaseLayout.astro`, `index.astro`, `global.css`) and the duplicated `normalize`/`canonical`/`extractRule`/`extractMediaBlock`/`expectDeclarations`/`collectSourceFiles` helpers, plus `renderFooter()` and `renderPage()`. — all R
- [x] 5.2 Add the markup tests: `renders_footer_structure`, `renders_identity_texts`, `renders_location_line`, `omits_mockup_city`, `renders_schedule_icon`, `renders_single_email_link`, `omits_social_links`, `imports_shared_contact_email`. — R1, R5, R8, R9, R10, R12, R13, R14
- [x] 5.3 Add the style tests: `styles_identity_block`, `styles_responsive_layout`, `styles_location_line`, `styles_email_link`, `styles_footer_shell`, `styles_footer_inner`, `omits_entrance_animation`, `styles_are_scoped_and_tokenized`. — R4, R6, R7, R11, R15, R16, R17, R19
- [x] 5.4 Add the placement/wiring tests: `renders_footer_in_base_layout` and `renders_single_footer` (order `</main>` → footer → toast, one `<footer>`, no `<nav>`, no heading in the footer). — R2, R3
- [x] 5.5 Add the scope tests: `ships_zero_client_javascript` (component scan plus page script count of two), `omits_excluded_features` (no canvas/shader), `omits_form_and_message_logic` (no nav/form/input/textarea/button, no `preventDefault`, no success strings). — R18, R21, R22
- [x] 5.6 Add the spec test: `amends_contact_section_exclusions` reads `specs/contact-section/requirements.md` and asserts the dated amendment heading, the `R41` reference and the `superseded` wording. — R20
- [x] 5.7 Confirm every test name in `design.md` §8 exists and maps 1:1 to its `R<n>` in `requirements.md`; confirm no test asserts the email literal inside `FooterSection.astro`. — all R

## 6. Verification

- [x] 6.1 Run `pnpm format` and `pnpm lint`; no disabled rules, no leftover TODOs, no dead CSS. — all R
- [x] 6.2 Run `pnpm check` (strict Astro/TypeScript diagnostics; the layout import must resolve). — all R
- [x] 6.3 Run `pnpm test`; all suites green, including the amended `omits_excluded_sections` and `ships_only_clipboard_enhancement`. — all R
- [x] 6.4 Run `pnpm build`; confirm `dist/index.html` contains `<footer class="footer">` after `</main>`, the three identity texts, `Alicante, España (CET / UTC+1)`, the `mailto:carlosolcina23@gmail.com` link and exactly two bundled scripts, with no `València`, no `github.com`/`x.com`/`linkedin.com` in the footer and no third script. — R3, R5, R8, R12, R13, R18
- [x] 6.5 Run `pnpm preview` and compare against `specs/hero-section/references/chromatic-glass.html` lines 2159–2217: glass bar, responsive stacking/centering on mobile and identity/meta alignment at ≥768px, email hover colour and native focus outline. Confirm the two human deviations only (Alicante instead of València; email-only row) and the `© 2025` copyright verbatim. — R6, R7, R11, R15, R16, R17
- [x] 6.6 Scope check: only the files of `design.md` §3 modified, no dependency added, no `src/` change beyond the component and the layout, the email literal still appears exactly once under `src/` and the copyright year is untouched. Record the `© 2025` vs current-year observation and any Container API fallback in `progress/current.md`. — R14, R19, R23

## Definition of done

- All checkboxes `[x]`, `pnpm validate` green.
- `specs/footer-section/requirements.md` traceability table fully covered by the tests in `tests/`.
- The contact-section amendment is recorded and `omits_excluded_sections` passes with exactly one `<footer>`.
- The email literal appears exactly once under `src/`, in `src/site-constants.ts`.
- The page still ships exactly two bundled scripts and no `client:*` island.
- The copyright year observation is recorded in `progress/current.md`; the rendered text stays `© 2025 Carlos Olcina. Todos los derechos reservados.`
