# Implementation report — contact-section (id 9, sdd)

Status: implementation complete, all tests green, waiting for reviewer. Feature not marked `done`.

## Tasks completed

All tasks of `specs/contact-section/tasks.md` are `[x]` (37/37): shared constant (1.1–1.2), profiles schema (2.1–2.5), collection config (3.1–3.2), seed entries (4.1–4.2), hero constant reuse (5.1–5.2), section component (6.1–6.10), page wiring (7.1), tests (8.1–8.7) and verification (9.1–9.6).

Verification evidence:

- `pnpm format` + `pnpm lint`: clean.
- `pnpm check`: 0 errors, 0 warnings, 0 hints (35 files).
- `pnpm test`: 17 files, 192 tests passed.
- `pnpm build`: green; `dist/index.html` contains `id="contact"`, the verbatim header texts, the shared email, `Redes y Perfiles`, the three profile links (`https://github.com`, `https://linkedin.com`, `https://x.com`), the three form controls with `required`, the submit button and exactly two bundled clipboard scripts; zero occurrences of `Reservar Reunión`, `Agendar en Cal.com`, `cal.com`, `calendar_month`, `¡Mensaje enviado!` or `form-success-banner`.
- Build-time spot-checks (temporarily applied, then reverted): a duplicated profile `id` fails `astro build` with `Duplicate profile id: 3a7d1f52-9b4c-4e68-8f21-6c0d5a9e7b34`; an unknown `handle` key fails with `profiles → x data does not match collection schema. Unrecognized key: "handle"`.
- `pnpm preview` browser pass (desktop 1280×900 and mobile 390×844): 12-column grid at ≥1024px (options 5 / panel 7) and single-column stack below; email-card hover (bg 0.62, border indigo, `translateY(-3px)`, badge `scale(1.05)`, value/icon primary, icon `rotate(12deg)`); input focus keeps native outline (`auto`) and applies border `indigo-500`, bg 0.9 and 4px ring; `prefers-reduced-motion: reduce` collapses the entrance animation and transitions to 0.01ms; clicking the card copies `carlosolcina23@gmail.com` and shows the BaseLayout toast with `Correo copiado al portapapeles`, auto-hidden after 2.6s; Cal.com card absent.

## Traceability R<n> → test

| Requirement | Test file                        | Test name(s)                                                                                         |
| ----------- | -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| R1          | `tests/profiles-schema.test.ts`  | `declares_collection_configuration`                                                                  |
| R2          | `tests/profiles-schema.test.ts`  | `keeps_schema_module_free_of_astro_virtual_modules`                                                  |
| R3          | `tests/profiles-schema.test.ts`  | `validates_profile_contract`                                                                         |
| R4          | `tests/profiles-schema.test.ts`  | `rejects_duplicate_ids`                                                                              |
| R5          | `tests/profiles-schema.test.ts`  | `sorts_profiles_by_title`, `does_not_mutate_profiles`                                                |
| R6          | `tests/contact-section.test.ts`  | `validates_profiles_at_render_time`                                                                  |
| R7          | `tests/profiles-content.test.ts` | `defines_three_profile_entries`                                                                      |
| R8          | `tests/profiles-content.test.ts` | `matches_seed_values`                                                                                |
| R9          | `tests/profiles-content.test.ts` | `declares_exactly_three_fields`                                                                      |
| R10         | `tests/profiles-content.test.ts` | `keeps_ids_unique`                                                                                   |
| R11         | `tests/clipboard.test.ts`        | `defines_contact_email_once`                                                                         |
| R12         | `tests/clipboard.test.ts`        | `defines_contact_email_once`                                                                         |
| R13         | `tests/clipboard.test.ts`        | `imports_shared_contact_email`                                                                       |
| R14         | `tests/contact-section.test.ts`  | `imports_shared_contact_email`                                                                       |
| R15         | `tests/contact-section.test.ts`  | `wires_copy_listener_to_contact_card`                                                                |
| R16         | `tests/contact-section.test.ts`  | `renders_copy_email_card`                                                                            |
| R17         | `tests/contact-section.test.ts`  | `reuses_base_layout_toast`                                                                           |
| R18         | `tests/contact-section.test.ts`  | `renders_single_toast` (plus `tests/toast.test.ts` → `renders_hidden_toast`)                         |
| R19         | `tests/contact-section.test.ts`  | `renders_contact_section_after_technologies`                                                         |
| R20         | `tests/contact-section.test.ts`  | `styles_section_geometry`                                                                            |
| R21         | `tests/contact-section.test.ts`  | `renders_section_header`                                                                             |
| R22         | `tests/contact-section.test.ts`  | `styles_header_geometry`                                                                             |
| R23         | `tests/contact-section.test.ts`  | `styles_section_label_and_rule`                                                                      |
| R24         | `tests/contact-section.test.ts`  | `styles_section_title`                                                                               |
| R25         | `tests/contact-section.test.ts`  | `styles_section_intro`                                                                               |
| R26         | `tests/contact-section.test.ts`  | `styles_contact_grid`                                                                                |
| R27         | `tests/contact-section.test.ts`  | `styles_email_card`                                                                                  |
| R28         | `tests/contact-section.test.ts`  | `styles_email_card_hover`                                                                            |
| R29         | `tests/contact-section.test.ts`  | `renders_profiles_card`                                                                              |
| R30         | `tests/contact-section.test.ts`  | `styles_profiles_card`                                                                               |
| R31         | `tests/contact-section.test.ts`  | `styles_form_panel`                                                                                  |
| R32         | `tests/contact-section.test.ts`  | `renders_form_structure`                                                                             |
| R33         | `tests/contact-section.test.ts`  | `renders_accessible_form_fields`                                                                     |
| R34         | `tests/contact-section.test.ts`  | `styles_form_fields`                                                                                 |
| R35         | `tests/contact-section.test.ts`  | `renders_submit_button`                                                                              |
| R36         | `tests/contact-section.test.ts`  | `ships_presentation_only_form`                                                                       |
| R37         | `tests/contact-section.test.ts`  | `loads_profile_collection_in_index`                                                                  |
| R38         | `tests/contact-section.test.ts`  | `renders_single_h2` (plus `tests/index.test.ts` → `renders_exactly_one_h1`)                          |
| R39         | `tests/contact-section.test.ts`  | `ships_only_clipboard_enhancement` (plus `tests/index.test.ts` → `ships_only_clipboard_enhancement`) |
| R40         | `tests/contact-section.test.ts`  | `omits_calcom_booking_card`                                                                          |
| R41         | `tests/contact-section.test.ts`  | `omits_excluded_sections`                                                                            |
| R42         | `tests/contact-section.test.ts`  | `keeps_dependencies_unchanged`                                                                       |

## Files created

- `src/site-constants.ts` — `CONTACT_EMAIL`.
- `src/content/profiles-schema.ts` — `profilesSchema`, `ProfileData`, `assertUniqueProfiles`, `sortProfiles`.
- `src/content/profiles/github.json`, `linkedin.json`, `x.json` — seed entries (placeholder URLs).
- `src/components/ContactSection.astro` — section shell, header, options column, form panel, scoped styles, clipboard wiring.
- `tests/profiles-schema.test.ts`, `tests/profiles-content.test.ts`, `tests/contact-section.test.ts`.

## Files modified

- `src/content.config.ts` — `profiles` collection + export.
- `src/components/HeroSection.astro` — local constant replaced by the shared import.
- `src/pages/index.astro` — loads `profiles` and renders `<ContactSection />` after the tech stack.
- `tests/clipboard.test.ts` — shared-constant assertions (R11–R13).
- `tests/index.test.ts` — collection-aware mock + two-script budget (R39).
- `tests/projects-section.test.ts` — collection-aware mock (page render).
- `tests/projects-schema.test.ts`, `tests/technologies-schema.test.ts` — `collections` export assertion updated to include `profiles` (deviation, see below).

## Deviations

1. `tests/projects-schema.test.ts` and `tests/technologies-schema.test.ts` update their static assertion of the `collections` export from `{ projects, technologies }` to `{ projects, technologies, profiles }`. R1 mandates the new export, so the old assertion cannot stay green; `design.md` §3 omitted these two test files from its modified list. The change is a mechanical consequence of the approved requirement, not a new design decision. No other deviation.
2. None of the Container API fallbacks of `design.md` §10 were needed: `ContactSection` and the home page render fine under Vitest with the collection-aware mock; content tests read the JSON files directly.

## Notes for the reviewer

- The email literal appears exactly once under `src/`, in `src/site-constants.ts` (guarded by `defines_contact_email_once`).
- Seed profile URLs are placeholders per R8/§5; replacing them is a JSON-only edit.
- The contact form is presentation-only (R36); message logic remains a future feature.
- `profiles` entry ids come from the file names; the UUID lives in the `id` data field.

## Re-implementation after git mishap (2026-10-01)

The branch `feat/contact-section` was recreated from `main` (commit `4ca167f`)
and every tracked-file modification of the original implementation was lost.
The untracked artifacts survived byte-identical (spec, impl/review reports,
`src/site-constants.ts`, `src/content/profiles-schema.ts`,
`src/content/profiles/*.json`, `src/components/ContactSection.astro` and the
three new test files). The tracked deltas were re-applied on this base:

- `src/content.config.ts` — `profiles` collection + `collections = { projects, technologies, profiles }`.
- `src/components/HeroSection.astro` — shared `CONTACT_EMAIL` import replacing the local constant.
- `src/pages/index.astro` — `getCollection('profiles')` + `<ContactSection profiles={profiles} />` after the tech stack.
- `tests/clipboard.test.ts` — `defines_contact_email_once` (single `src/` literal in `src/site-constants.ts`) and `imports_shared_contact_email` (R11–R13).
- `tests/index.test.ts` — collection-aware `astro:content` mock (profiles branch) and the two-bundled-scripts budget (R39).
- `tests/projects-section.test.ts` — collection-aware mock.
- `tests/projects-schema.test.ts` and `tests/technologies-schema.test.ts` — `collections` assertion now includes `profiles` (same deviation as above).

Base note: this branch is plain `main`, so feature 8
(`remove-technologies-quote`) is absent — the philosophy quote bar and its five
tests still exist here. The surviving contact tests were checked against this
base and are green without adaptation; no quote code or test was touched.

Verification on the re-applied tree (2026-10-01):

- `pnpm format`: clean; `pnpm lint`: clean; `pnpm check`: 0 errors / 0 warnings / 0 hints (35 files).
- `pnpm test`: 17 files, 197 tests passed (192 contact-tree tests plus the 5 feature-8 quote tests still present on `main`).
- `pnpm build`: green; `dist/index.html` contains `id="contact"`, `Redes y Perfiles`, the shared email, the three profile URLs, `Enviar Mensaje`, exactly two module scripts and none of `Agendar en Cal.com`, `calendar_month` or `¡Mensaje enviado!`.
- `specs/contact-section/tasks.md`: all 37 checkboxes `[x]`, none unchecked.

Status: re-implementation complete on `feat/contact-section`; the feature
remains `in_progress` pending reviewer re-verification.
