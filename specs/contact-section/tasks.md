# Tasks — contact-section

Ordered checklist. Each task references the `R<n>` it covers. The implementer marks `[x]` as tasks complete; `pnpm validate` must be green at the end. No files outside the ones listed in `design.md` §3 are touched. No new dependency is added; no client-side JavaScript is added beyond the contact clipboard wiring.

## 1. Shared constant — `src/site-constants.ts` (create)

- [x] 1.1 Create the module with the single export `export const CONTACT_EMAIL = 'carlosolcina23@gmail.com';` (Screaming Snake Case, no other content, no comments). — R11, R12
- [x] 1.2 Confirm no other file under `src/` contains the email literal (the hero and the contact section will import this module). — R12

## 2. Profiles schema — `src/content/profiles-schema.ts` (create)

- [x] 2.1 Export `profilesSchema` as a strict Zod object (`z.strictObject`; fallback `z.object({...}).strict()`) with `id: z.uuid()`, `title: z.string()` and `url: z.url()`. — R3
- [x] 2.2 Export `ProfileData` via `z.infer<typeof profilesSchema>`. — R3
- [x] 2.3 Implement `assertUniqueProfiles(profiles)` throwing the exact message `Duplicate profile id: <id>` on a repeated id. — R4
- [x] 2.4 Implement `sortProfiles(profiles)`: validate duplicates first, return a new array sorted ascending by `title` (code-point comparison, no `localeCompare`), never mutating the input. — R4, R5
- [x] 2.5 Confirm the module imports only `astro/zod`, has no side effects and is importable from Vitest without virtual modules. — R2

## 3. Collection config — `src/content.config.ts` (modify)

- [x] 3.1 Add the `profiles` collection with `glob({ base: './src/content/profiles', pattern: '**/*.json' })` and `schema: profilesSchema`; export `collections = { projects, technologies, profiles }` leaving the two existing collections untouched. — R1
- [x] 3.2 Confirm the config is still the only file importing `astro:content`/`astro/loaders` and that the new JSON glob does not pick up anything outside `src/content/profiles/`. — R1

## 4. Seed entries — `src/content/profiles/` (create)

- [x] 4.1 Write `github.json`, `linkedin.json` and `x.json` exactly as in `design.md` §5 (id, title, url). — R7, R8, R9
- [x] 4.2 Confirm every file has exactly the three keys `id`, `title`, `url`, that the three UUIDs are unique and valid, and that each entry parses with `profilesSchema`. — R9, R10

## 5. Hero constant reuse — `src/components/HeroSection.astro` (modify)

- [x] 5.1 Replace the local `const CONTACT_EMAIL = '…';` with `import { CONTACT_EMAIL } from '../site-constants';`; keep `data-email={CONTACT_EMAIL}` and the rest of the component byte-for-byte behaviourally identical. — R13
- [x] 5.2 Confirm the hero contains no email literal and that its rendered `data-email` still resolves to the shared address. — R12, R13

## 6. Section — `src/components/ContactSection.astro` (create)

- [x] 6.1 Add the frontmatter: `import { sortProfiles, type ProfileData } from '../content/profiles-schema';`, `import { CONTACT_EMAIL } from '../site-constants';`, `interface Props { profiles: ProfileData[] }`, `const { profiles } = Astro.props;`, `const orderedProfiles = sortProfiles(profiles);` and the four icon path constants (`MAIL_ICON_PATH`, `COPY_ICON_PATH`, `ARROW_OUTWARD_ICON_PATH`, `SEND_ICON_PATH`) with the exact path data of `design.md` §7. — R6, R14, R16, R29, R35
- [x] 6.2 Write the section shell and header markup: `<section class="contact animate-fade-in-up animation-delay-400" id="contact">`, `.contact__inner`, label row (`Contacto y Colaboración` + `.contact__label-rule`), `<h2 class="contact__title">` with `Construyamos algo{' '}<span class="contact__title-accent">increíble</span>{' '}juntos` and the intro `<p class="contact__intro">` with the verbatim text. — R19, R21
- [x] 6.3 Render the email card: `<button class="contact__email-card" id="copy-email-contact-btn" type="button" data-email={CONTACT_EMAIL}>` with the `mail` badge SVG (20px), the `Correo Directo` label, the visible `{CONTACT_EMAIL}` value and the `content_copy` SVG (18px), all `aria-hidden` where decorative. — R14, R16
- [x] 6.4 Render the profiles card: `.contact__social-label` with `Redes y Perfiles` and the `.contact__profiles` list mapping `orderedProfiles` to `<a class="contact__profile-link" href={profile.url} target="_blank" rel="noreferrer">` with the title and the 14px `arrow_outward` SVG. — R29
- [x] 6.5 Render the form markup: `<form class="contact__form">`, `.contact__fields` with the name (`text`, `contact-name`, `Elena Rostova`) and email (`email`, `contact-email`, `elena@empresa.com`) fields, the message `textarea` (`contact-message`, `rows="4"`, `Detalles del proyecto, plazos y objetivos...`), each with its bound `<label>` and `required`, and no `name`/`autocomplete`/`data-*` hooks. — R32, R33
- [x] 6.6 Render the submit button `<button class="contact__submit" type="submit">` with the `Enviar Mensaje` text and the 18px `send` SVG. — R35
- [x] 6.7 Add the bundled `<script>` with the clipboard wiring of `design.md` §7 (import `copyToClipboard`/`showToast`, `#copy-email-contact-btn`, `#toast`, `#toast-text`, `button.dataset.email`, click listener, no inline handler). — R15, R17
- [x] 6.8 Add the scoped styles exactly as in `design.md` §8: shell (R20), header (R22), label/rule (R23), title/accent (R24), intro (R25), grid (R26), email card (R27, R28), social card/links (R30), form panel (R31), inputs/textarea/placeholder/focus (R34), submit (R35). Do not redefine the entrance animation or add global CSS/tokens. — R20, R22–R28, R30, R31, R34, R35
- [x] 6.9 Confirm no `onsubmit`/`action`/`method`/`preventDefault`/submit listener, no success banner or `¡Mensaje enviado!` text, no `contact-form`/`form-submit-btn`/`form-success-banner` ids, no Cal.com strings (`Reservar Reunión`, `Agendar en Cal.com`, `cal.com`, `calendar_month`), no `@keyframes`, and exactly one `<h2>` with no `<h1>`. — R36, R38, R40
- [x] 6.10 Confirm the component renders no toast markup (the BaseLayout toast is reused) and ships exactly one `<script>` (the clipboard wiring), with no `client:` and no inline handlers. — R18, R39

## 7. Page — `src/pages/index.astro` (modify)

- [x] 7.1 Import `ContactSection`; add `const profileEntries = await getCollection('profiles');` + `const profiles = profileEntries.map((entry) => entry.data);` and render `<ContactSection profiles={profiles} />` immediately after `<TechnologiesSection technologies={technologies} />`. — R37

## 8. Tests

- [x] 8.1 Create `tests/profiles-schema.test.ts`: static assertion on `src/content.config.ts` (profiles collection + export); module-boundary assertion; accept/reject matrix (uuid, string, url, strict unknown-key rejection); duplicate-id exact error; title ordering and no-mutation checks. Test names: `declares_collection_configuration`, `keeps_schema_module_free_of_astro_virtual_modules`, `validates_profile_contract`, `rejects_duplicate_ids`, `sorts_profiles_by_title`, `does_not_mutate_profiles`. — R1–R5
- [x] 8.2 Create `tests/profiles-content.test.ts`: read `src/content/profiles/` with `readFileSync`/`readdirSync`; assert the exact three file names, the exact seed values (each entry also validated with `profilesSchema`), the three-key shape and the unique ids. Test names: `defines_three_profile_entries`, `matches_seed_values`, `declares_exactly_three_fields`, `keeps_ids_unique`. — R7–R10
- [x] 8.3 Create `tests/contact-section.test.ts`: render `ContactSection` with a local `createProfile(overrides)` fixture factory through `experimental_AstroContainer` (markup, ordered profiles, email card, form semantics, single `<h2>`, duplicate render failure, exclusions), read the component for the CSS contract with the duplicated whitespace-normalizing helpers, and render `src/pages/index.astro` with the collection-aware `vi.mock('astro:content')` of `design.md` §10 (profiles fixtures; projects/technologies empty) for placement, wiring, toast and script-budget checks. Test names: `validates_profiles_at_render_time`, `imports_shared_contact_email`, `wires_copy_listener_to_contact_card`, `renders_copy_email_card`, `reuses_base_layout_toast`, `renders_single_toast`, `renders_contact_section_after_technologies`, `styles_section_geometry`, `renders_section_header`, `styles_header_geometry`, `styles_section_label_and_rule`, `styles_section_title`, `styles_section_intro`, `styles_contact_grid`, `styles_email_card`, `styles_email_card_hover`, `renders_profiles_card`, `styles_profiles_card`, `styles_form_panel`, `renders_form_structure`, `renders_accessible_form_fields`, `styles_form_fields`, `renders_submit_button`, `ships_presentation_only_form`, `loads_profile_collection_in_index`, `renders_single_h2`, `ships_only_clipboard_enhancement`, `omits_calcom_booking_card`, `omits_excluded_sections`, `keeps_dependencies_unchanged`. — R6, R14–R42
- [x] 8.4 Update `tests/clipboard.test.ts`: `defines_contact_email_once` asserts the single literal in `src/site-constants.ts` and none in `scripts/clipboard.ts`; `imports_shared_contact_email` asserts the hero import and the rendered `data-email`; drop the old local-constant assertions (the test may import `CONTACT_EMAIL` from `../src/site-constants`). — R11, R12, R13
- [x] 8.5 Update `tests/index.test.ts`: make the `vi.mock('astro:content')` factory collection-aware (profiles branch returns `[]`), add `'components/ContactSection.astro'` to the script/island/handler scan and expect exactly two bundled clipboard scripts (hero + contact); keep `renders_exactly_one_h1` green. — R39
- [x] 8.6 Update `tests/projects-section.test.ts`: make its `vi.mock('astro:content')` factory collection-aware (profiles branch returns `[]`), keeping all project assertions green. — R37 (page render)
- [x] 8.7 Confirm the new tests need no extra node shims (`readFileSync` with `'utf8'` and `readdirSync` are already declared in `tests/node-shims.d.ts`). — all R

## 9. Verification

- [x] 9.1 Run `pnpm format` and `pnpm lint`; no disabled rules, no leftover TODOs, no dead CSS. — all R
- [x] 9.2 Run `pnpm check` (strict Astro/TypeScript diagnostics; the new collection types must resolve in `index.astro` and both components). — all R
- [x] 9.3 Run `pnpm test`; every test above is green and maps to its requirement. — all R
- [x] 9.4 Run `pnpm build`; confirm `dist/index.html` contains `id="contact"`, the exact header texts, the shared email, `Redes y Perfiles`, the three profile links with their URLs, the three form controls with `required`, the submit button and exactly two bundled scripts, with no Cal.com strings and no success banner. Spot-check that a duplicate profile `id` or an unknown JSON key fails the build (temporarily, then revert). — R19, R21, R29, R33, R36, R39, R40
- [x] 9.5 Run `pnpm preview` and compare the section against `specs/hero-section/references/chromatic-glass.html` lines 1885–2108: header, two-column layout at desktop, email card hover/active, profiles pills, form focus states (native outline preserved), entrance animation and its reduced-motion collapse. Confirm the Cal.com card is absent. — R19–R35, R40
- [x] 9.6 Scope check: no files outside `design.md` §3 modified, no dependency added, no `src/` or test change beyond the listed ones, placeholder profile URLs flagged in the session summary. — R41, R42

## Definition of done

- All checkboxes `[x]`, `pnpm validate` green.
- `specs/contact-section/requirements.md` traceability table fully covered by the tests in `tests/`.
- The Container API fallback (if any) and the mock strategy are recorded in `progress/current.md`.
- The email literal appears exactly once under `src/`, in `src/site-constants.ts`.
- The only client-side scripts in the build are the hero and contact clipboard enhancements.
