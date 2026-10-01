# Requirements — contact-section

- **Feature:** `contact-section` (id 9, `sdd: true`).
- **Source of truth:** `specs/hero-section/references/chromatic-glass.html` (section "5. CONTACT & COLLABORATION": lines 1885–2108) and its digest `specs/hero-section/references/design-notes.md` (line 325).
- **Human decisions (2026-10-01, non-negotiable):**
  1. The section renders on the home page after `TechnologiesSection` with anchor `id="contact"`.
  2. The Spanish copy is verbatim from the mockup (eyebrow, headline, intro, form labels/placeholders).
  3. The Cal.com booking card ("Reservar Reunión de 30 min" / "Agendar en Cal.com") is **deleted entirely**.
  4. The direct email card is click-to-copy with `carlosolcina23@gmail.com`, reusing `src/scripts/clipboard.ts` and the `#toast` / `#toast-text` elements of `BaseLayout.astro`, with the same behaviour as `HeroSection`.
  5. The contact email lives in **one** shared site constant imported by both `HeroSection.astro` and `ContactSection.astro`.
  6. `profiles` is a new JSON content collection validated with Zod, each entry with **exactly** `id` (UUID), `title` and `url`. Seed URLs are placeholders for the human to replace.
  7. The **contact form is presentation-only**: no submission handler, no fake success banner, no client-side script for the form. A future feature will wire the message logic.
- **In scope:** the `profiles` content collection (glob JSON loader + Zod schema module + pure ordering/duplicate helpers + seed entries), the shared contact-email constant, the `#contact` section on the home page (header, left options column with the click-to-copy email card and the "Redes y Perfiles" card, right column with the presentation-only form), the page wiring, the contact clipboard enhancement and the tests tracing every `R<n>`.
- **Out of scope (future increments):** the experience/about section (the human has no experience data), floating nav/header, footer, WebGL shader background, project detail pages, form submission/message logic, success feedback, i18n, Tailwind or any new dependency, new global CSS.

**Notation.** Every requirement uses EARS and contains exactly one `MUST` / `MUST NOT`. Ids `R<n>` are stable. "The design reference" means the mockup HTML above plus its digest. Values in tables are the **effective computed values** of the design, after Tailwind utility overrides (the same convention as `specs/hero-section/requirements.md` and `specs/technologies-section/requirements.md`). Every requirement is verified by at least one concrete Vitest test (see `Traceability` at the end).

---

## 1. Profiles content collection and schema

### R1 — Collection configuration

The system MUST define the `profiles` collection in `src/content.config.ts` with `defineCollection` (from `astro:content`), the `glob` loader (from `astro/loaders`) configured with `base: './src/content/profiles'` and `pattern: '**/*.json'`, and `schema: profilesSchema` imported from `src/content/profiles-schema.ts`, exporting `collections = { projects, technologies, profiles }` while leaving the two existing collections untouched.

**Verification:** `tests/profiles-schema.test.ts` → `declares_collection_configuration` (reads `src/content.config.ts`).

### R2 — Schema module boundary

The system MUST keep `src/content/profiles-schema.ts` importable by Vitest by importing only `astro/zod` at runtime, never the virtual modules `astro:content`, `astro:loaders` or `astro:assets`, and by exporting the schema as a plain `profilesSchema` constant (no dependency-injected factory).

**Verification:** `tests/profiles-schema.test.ts` → `keeps_schema_module_free_of_astro_virtual_modules` (imports the module in Vitest, parses a valid fixture and asserts the source imports).

### R3 — Schema field contract

The system MUST build a strict Zod object (`z.strictObject`, Zod 4 through `astro/zod`) that accepts the contract below, rejects every fixture in the "Rejected" column and rejects otherwise valid entries carrying an unknown key (e.g. `handle`).

| Field   | Validator    | Accepted                                                   | Rejected                                                    |
| ------- | ------------ | ---------------------------------------------------------- | ----------------------------------------------------------- |
| `id`    | `z.uuid()`   | RFC 4122 UUID, e.g. `3a7d1f52-9b4c-4e68-8f21-6c0d5a9e7b34` | `'not-a-uuid'`, missing                                     |
| `title` | `z.string()` | any string, e.g. `GitHub`                                  | missing, number                                             |
| `url`   | `z.url()`    | absolute URL, e.g. `https://github.com`                    | `'github.com'`, `'/profiles/github'`, empty string, missing |

**Verification:** `tests/profiles-schema.test.ts` → `validates_profile_contract` (accepts the minimal valid fixture; rejects one fixture per rejected cell).

### R4 — Duplicate id rejection

The system MUST export `assertUniqueProfiles(profiles)` from `src/content/profiles-schema.ts` such that `sortProfiles` (and therefore the section render) throws an `Error` with the exact message `Duplicate profile id: <id>` when two entries declare the same `id`.

**Verification:** `tests/profiles-schema.test.ts` → `rejects_duplicate_ids`.

### R5 — Deterministic order without mutation

The system MUST export `sortProfiles(profiles)` from `src/content/profiles-schema.ts`, returning a **new** array ordered ascending by `title` using code-point comparison (`<` / `>`, no `localeCompare`) and never mutating the input array or its entries.

**Verification:** `tests/profiles-schema.test.ts` → `sorts_profiles_by_title` and `does_not_mutate_profiles`.

### R6 — Build-time validation through the section

WHEN `ContactSection` renders, the system MUST call `sortProfiles` on the received profiles, so a duplicate `id` aborts the render (and therefore `astro build`) with the explicit error of R4.

**Verification:** `tests/contact-section.test.ts` → `validates_profiles_at_render_time` (asserts the component frontmatter calls `sortProfiles(profiles)` and that rendering duplicate-id fixtures rejects with `Duplicate profile id: <id>`).

---

## 2. Profiles seed content

### R7 — Entry files

The system MUST ship exactly three profile entries as JSON files in `src/content/profiles/`: `github.json`, `linkedin.json` and `x.json` (file names double as the Astro entry ids; the `id` data field is a separate UUID).

**Verification:** `tests/profiles-content.test.ts` → `defines_three_profile_entries`.

### R8 — Seed values

The system MUST declare the three seed entries with the exact `id`, `title` and `url` values below. The URLs are realistic **placeholders** based on the mockup and on the design-notes' profile list; the human is expected to replace them with the real profile URLs.

| File            | `id`                                   | `title`    | `url`                  |
| --------------- | -------------------------------------- | ---------- | ---------------------- |
| `github.json`   | `3a7d1f52-9b4c-4e68-8f21-6c0d5a9e7b34` | `GitHub`   | `https://github.com`   |
| `linkedin.json` | `7c2e8a41-5d6f-4b93-a0e8-2f4c9d1b6a05` | `LinkedIn` | `https://linkedin.com` |
| `x.json`        | `b5f0c3d8-2a71-4c9e-9d36-8e7a1b4f2c90` | `X`        | `https://x.com`        |

**Verification:** `tests/profiles-content.test.ts` → `matches_seed_values` (parses each file, asserts the three values and validates the entry against `profilesSchema`).

### R9 — Exactly three fields

The system MUST declare exactly the three keys `id`, `title` and `url` in every seed JSON file (no extra field; the Astro entry id is derived from the file name and is not part of the JSON).

**Verification:** `tests/profiles-content.test.ts` → `declares_exactly_three_fields` (asserts `Object.keys(data).sort()` equals `['id', 'title', 'url']` for all three files).

### R10 — Unique ids across seeds

The system MUST declare three unique UUID values across the seed files, each passing `profilesSchema.shape.id`.

**Verification:** `tests/profiles-content.test.ts` → `keeps_ids_unique`.

---

## 3. Shared contact email

### R11 — Single shared constant

The system MUST export `CONTACT_EMAIL` with the value `'carlosolcina23@gmail.com'` from `src/site-constants.ts` (Screaming Snake Case per `docs/conventions.md`).

**Verification:** `tests/clipboard.test.ts` → `defines_contact_email_once` (asserts the exact export declaration).

### R12 — One literal occurrence in `src/`

The system MUST keep exactly one occurrence of the literal `carlosolcina23@gmail.com` in the whole `src/` tree — the `src/site-constants.ts` declaration — so no other source file duplicates the address.

**Verification:** `tests/clipboard.test.ts` → `defines_contact_email_once` (recursively scans `src/` and counts occurrences).

### R13 — Hero uses the shared constant

The system MUST import `CONTACT_EMAIL` from `src/site-constants.ts` in `src/components/HeroSection.astro` and use it as the copy button `data-email` value, with no local email constant left in the component.

**Verification:** `tests/clipboard.test.ts` → `imports_shared_contact_email` (source assertions plus the rendered hero `data-email` value).

### R14 — Contact section uses the shared constant

The system MUST import `CONTACT_EMAIL` from `src/site-constants.ts` in `src/components/ContactSection.astro` and use it as the copy button `data-email` value.

**Verification:** `tests/contact-section.test.ts` → `imports_shared_contact_email` (source assertions plus the rendered contact `data-email` value).

---

## 4. Contact clipboard enhancement and toast reuse

### R15 — Clipboard wiring in the contact card

The system MUST wire the copy interaction with a bundled component script that imports `copyToClipboard` and `showToast` from `../scripts/clipboard`, selects the copy button with `document.querySelector<HTMLButtonElement>('#copy-email-contact-btn')`, reads the address from `button.dataset.email`, calls `copyToClipboard(email, () => showToast({ container: toast, message: toastMessage }))` on click and adds no inline event-handler attribute.

**Verification:** `tests/contact-section.test.ts` → `wires_copy_listener_to_contact_card` (source assertions; runtime clipboard behaviour itself is covered by the existing `tests/clipboard.test.ts`).

### R16 — Copy card semantics and markup

The system MUST render the direct-email card as a `<button class="contact__email-card" id="copy-email-contact-btn" type="button" data-email={CONTACT_EMAIL}>` containing the `Correo Directo` label, the visible email value `{CONTACT_EMAIL}`, and a decorative 20px `mail` icon plus a decorative 18px `content_copy` icon, both inline SVGs carrying `class`, `viewBox="0 -960 960 960"`, explicit `width`/`height`, `fill="currentColor"` and `aria-hidden="true"` with the exact paths below and no icon font.

| Icon           | Path data                                                                                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mail`         | `M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z`             |
| `content_copy` | `M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z` |

**Verification:** `tests/contact-section.test.ts` → `renders_copy_email_card`.

### R17 — Toast reuse

The system MUST target the existing `#toast` and `#toast-text` elements of `BaseLayout.astro` from the contact script, so the copy confirmation uses the same toast component and message (`Correo copiado al portapapeles`) as the hero.

**Verification:** `tests/contact-section.test.ts` → `reuses_base_layout_toast`.

### R18 — Single toast element

The system MUST NOT add a second toast element to the page; the rendered home page keeps exactly one `id="toast"` and one `id="toast-text"`, both owned by `BaseLayout.astro`.

**Verification:** `tests/contact-section.test.ts` → `renders_single_toast` and the existing `tests/toast.test.ts` → `renders_hidden_toast`.

---

## 5. Contact section shell and header

### R19 — Placement, anchor and entrance animation

WHEN the home page renders, the system MUST render the contact section immediately after the technologies section as `<section class="contact animate-fade-in-up animation-delay-400" id="contact">` with `scroll-margin-top: 6rem`, reusing the global entrance utilities and defining no `@keyframes`.

**Verification:** `tests/contact-section.test.ts` → `renders_contact_section_after_technologies` (renders the page with fixtures; asserts `id="tech-stack"` precedes `id="contact"`, the exact section class string and the `scroll-margin-top` declaration).

### R20 — Section shell geometry

The system MUST lay out the section shell with the exact geometry below.

| Element           | Declarations                                       |
| ----------------- | -------------------------------------------------- |
| `.contact`        | `padding-block: 6rem`                              |
| `.contact__inner` | `display: flex; flex-direction: column; gap: 3rem` |

**Verification:** `tests/contact-section.test.ts` → `styles_section_geometry`.

### R21 — Header structure and verbatim texts

The system MUST render the section header with the exact structure and Spanish texts below: a label row (label span + 3rem rule), an `<h2>` whose accent fragment carries the word `increíble` with the surrounding whitespace emitted explicitly (e.g. `{' '}`) so the rendered text keeps the spaces under the Astro compiler, and the intro `<p>`.

| Element     | Text / structure (verbatim)                                                               |
| ----------- | ----------------------------------------------------------------------------------------- |
| Label span  | `Contacto y Colaboración`                                                                 |
| `<h2>`      | `Construyamos algo ` + `<span class="contact__title-accent">increíble</span>` + ` juntos` |
| Intro `<p>` | `¿Tienes un proyecto web o de inteligencia artificial en mente? Hablemos.`                |

**Verification:** `tests/contact-section.test.ts` → `renders_section_header`.

### R22 — Header geometry

The system MUST lay out `.contact__header` as a column with `gap: 0.75rem` and `max-width: 42rem`, and `.contact__eyebrow` as a row with `align-items: center` and `gap: 0.75rem`.

**Verification:** `tests/contact-section.test.ts` → `styles_header_geometry`.

### R23 — Label and rule styles

The system MUST style `.contact__label` and `.contact__label-rule` with the exact declarations below.

| Declaration        | `.contact__label`                  | `.contact__label-rule`   |
| ------------------ | ---------------------------------- | ------------------------ |
| `display`          | —                                  | `block`                  |
| `height`           | —                                  | `1px`                    |
| `width`            | —                                  | `3rem`                   |
| `background-color` | —                                  | `rgba(53, 37, 205, 0.4)` |
| `font-family`      | `var(--font-body)`                 | —                        |
| `font-size`        | `var(--text-label-sm-size)`        | —                        |
| `line-height`      | `var(--text-label-sm-line-height)` | —                        |
| `font-weight`      | `500`                              | —                        |
| `letter-spacing`   | `0.18em`                           | —                        |
| `text-transform`   | `uppercase`                        | —                        |
| `color`            | `var(--color-primary)`             | —                        |

**Verification:** `tests/contact-section.test.ts` → `styles_section_label_and_rule`.

### R24 — Title and accent styles

The system MUST style `.contact__title` with the `headline-lg` tokens (`font-family: var(--font-headline)`, `font-size: var(--text-headline-lg-size)`, `line-height: var(--text-headline-lg-line-height)`, `font-weight: var(--text-headline-lg-weight)`, `letter-spacing: -0.025em`, `color: var(--color-slate-900)`) and `.contact__title-accent` with `font-family: var(--font-headline)`, `font-style: italic`, `font-weight: 300` and `color: var(--color-primary)`.

**Verification:** `tests/contact-section.test.ts` → `styles_section_title`.

### R25 — Intro styles

The system MUST style `.contact__intro` with the exact declarations below.

| Declaration      | Value                                |
| ---------------- | ------------------------------------ |
| `font-family`    | `var(--font-body)`                   |
| `font-weight`    | `300`                                |
| `font-size`      | `var(--text-body-md-size)`           |
| `line-height`    | `1.625`                              |
| `letter-spacing` | `var(--text-body-md-letter-spacing)` |
| `color`          | `var(--color-slate-600)`             |

**Verification:** `tests/contact-section.test.ts` → `styles_section_intro`.

---

## 6. Contact layout and options column

### R26 — Grid geometry

The system MUST lay out `.contact__grid` as a single column with `gap: 2rem` and `align-items: start`, switching at viewports ≥1024px to `grid-template-columns: repeat(12, minmax(0, 1fr))` with `.contact__options` spanning 5 columns and `.contact__form-panel` spanning 7 columns, and `.contact__options` a column with `gap: 1rem`.

**Verification:** `tests/contact-section.test.ts` → `styles_contact_grid`.

### R27 — Email card styles

The system MUST style `.contact__email-card` with the exact declarations below and its children `.contact__email-main`, `.contact__email-badge`, `.contact__email-badge-icon`, `.contact__email-text`, `.contact__email-label`, `.contact__email-value` and `.contact__email-copy-icon` with the exact declarations of `design.md` §8 (badge 40×40 glass box in `rgba(53, 37, 205, 0.1)`, label in `label-sm` with `letter-spacing: 0.1em` and `color: var(--color-slate-500)`, value in `body-md` weight `500` and `color: var(--color-slate-900)`, copy icon 18px in `var(--color-slate-400)`).

| Declaration                                   | Value                                                                  |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| `display`                                     | `flex`                                                                 |
| `align-items` / `justify-content`             | `center` / `space-between`                                             |
| `padding`                                     | `1.25rem`                                                              |
| `border-radius`                               | `var(--radius-2xl)`                                                    |
| `background-color`                            | `rgba(255, 255, 255, 0.45)`                                            |
| `-webkit-backdrop-filter` / `backdrop-filter` | `blur(24px)`                                                           |
| `border`                                      | `1px solid rgba(255, 255, 255, 0.7)`                                   |
| `box-shadow`                                  | `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)` |
| `cursor`                                      | `pointer`                                                              |
| `text-align`                                  | `left`                                                                 |
| `transition`                                  | `all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`                               |

**Verification:** `tests/contact-section.test.ts` → `styles_email_card`.

### R28 — Email card interaction states

The system MUST apply the design's `glass-card-hover` behaviour to `.contact__email-card` (hover: `background-color: rgba(255, 255, 255, 0.62)`, `border-color: rgba(129, 140, 248, 0.55)`, `box-shadow: 0 20px 42px -8px rgba(79, 70, 229, 0.14), 0 0 24px -2px rgba(99, 102, 241, 0.16)`, `transform: translateY(-3px)`; active: `transform: scale(0.99)`) and its hover-dependent states: badge `transform: scale(1.05)` + `background-color: rgba(53, 37, 205, 0.2)`, value `color: var(--color-primary)`, copy icon `color: var(--color-primary)` + `transform: rotate(12deg)`.

**Verification:** `tests/contact-section.test.ts` → `styles_email_card_hover`.

### R29 — Profiles card markup and rendering

The system MUST render the "Redes y Perfiles" card with a `.contact__social-label` span and a `.contact__profiles` list containing one `<li>` per profile, in `sortProfiles` order, each with an `<a class="contact__profile-link" href={profile.url} target="_blank" rel="noreferrer">` holding the profile `title` and a decorative 14px `arrow_outward` inline SVG (`aria-hidden="true"`) with the exact path below.

| Icon            | Path data                                                  |
| --------------- | ---------------------------------------------------------- |
| `arrow_outward` | `m256-240-56-56 384-384H240v-80h480v480h-80v-344L256-240Z` |

**Verification:** `tests/contact-section.test.ts` → `renders_profiles_card` (renders scrambled fixtures; asserts order, labels, href, `target`, `rel` and the exact icon path).

### R30 — Profiles card and link styles

The system MUST style `.contact__social` with `display: flex`, `flex-direction: column`, `gap: 1rem`, `padding: 1.5rem`, `border-radius: var(--radius-2xl)`, `background-color: rgba(255, 255, 255, 0.45)`, `-webkit-backdrop-filter: blur(24px)`, `backdrop-filter: blur(24px)`, `border: 1px solid rgba(255, 255, 255, 0.7)` and the `shadow-md` box-shadow of R27; `.contact__profiles` with `display: flex`, `flex-wrap: wrap`, `gap: 0.5rem`, `margin: 0`, `padding: 0`, `list-style: none`; and `.contact__profile-link` with `display: inline-flex`, `align-items: center`, `gap: 0.375rem`, `padding: 0.375rem 0.875rem`, `border-radius: var(--radius-lg)`, `background-color: rgba(255, 255, 255, 0.6)`, `border: 1px solid rgba(255, 255, 255, 0.8)`, `color: var(--color-slate-800)`, the `label-md` typography tokens, `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)` and `transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1)`, with hover `background-color: rgba(255, 255, 255, 0.85)`, `border-color: rgba(53, 37, 205, 0.4)` and `transform: translateY(-0.125rem)`, plus `.contact__social-label` in `label-sm` with `letter-spacing: 0.1em`, `text-transform: uppercase` and `color: var(--color-slate-500)`.

**Verification:** `tests/contact-section.test.ts` → `styles_profiles_card`.

---

## 7. Contact form (presentation-only)

### R31 — Form panel styles

The system MUST style `.contact__form-panel` with the exact declarations below, including the hover `border-color`.

| Declaration                                   | Value                                                                     |
| --------------------------------------------- | ------------------------------------------------------------------------- |
| `padding`                                     | `2rem`                                                                    |
| `border-radius`                               | `var(--radius-2xl)`                                                       |
| `background-color`                            | `rgba(255, 255, 255, 0.5)`                                                |
| `-webkit-backdrop-filter` / `backdrop-filter` | `blur(24px)`                                                              |
| `border`                                      | `1px solid rgba(255, 255, 255, 0.7)`                                      |
| `box-shadow`                                  | `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)` |
| `transition`                                  | `all 300ms cubic-bezier(0.4, 0, 0.2, 1)`                                  |
| `:hover` `border-color`                       | `rgba(165, 180, 252, 0.8)`                                                |

**Verification:** `tests/contact-section.test.ts` → `styles_form_panel`.

### R32 — Form structure and fields grid

The system MUST render a `<form class="contact__form">` containing a `.contact__fields` wrapper for the name/email fields followed by the message field and the submit button, with `.contact__form` a column with `gap: 1.25rem` and `.contact__fields` a grid with `grid-template-columns: minmax(0, 1fr)` and `gap: 1.25rem`, switching to `repeat(2, minmax(0, 1fr))` at viewports ≥640px.

**Verification:** `tests/contact-section.test.ts` → `renders_form_structure`.

### R33 — Field semantics and attributes

The system MUST render the three form controls with the exact accessible contract below, each with its `<label>` bound through `for`/`id`.

| Label (`for`)                                        | Control (`id`)             | `type` / rows | `placeholder`                                  | `required` |
| ---------------------------------------------------- | -------------------------- | ------------- | ---------------------------------------------- | ---------- |
| `Nombre` (`contact-name`)                            | `input#contact-name`       | `text`        | `Elena Rostova`                                | yes        |
| `Correo Electrónico` (`contact-email`)               | `input#contact-email`      | `email`       | `elena@empresa.com`                            | yes        |
| `Mensaje / Alcance del Proyecto` (`contact-message`) | `textarea#contact-message` | `rows="4"`    | `Detalles del proyecto, plazos y objetivos...` | yes        |

No other attribute is added to the controls (no `name`, no `autocomplete`, no `data-*`, no `id` on the form or the submit button).

**Verification:** `tests/contact-section.test.ts` → `renders_accessible_form_fields`.

### R34 — Input and textarea styles

The system MUST style `.contact__input`, `.contact__textarea`, their `::placeholder` and `:focus` states with the exact declarations of `design.md` §8: 60% white glass, `blur(12px)`, `border: 1px solid rgba(255, 255, 255, 0.8)`, `color: var(--color-slate-900)`, `font-family: inherit`, `body-md` typography at weight `300`, `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)`, `transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1)`, input `height: 3rem` + `padding-inline: 1rem`, textarea `padding: 1rem` + `resize: none`, placeholders in `var(--color-slate-400)` and focus `border-color: var(--color-indigo-500)`, `background-color: rgba(255, 255, 255, 0.9)`, `box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15)`, with the native focus outline preserved and no `outline: none` (`tests/global-styles.test.ts` forbids suppression).

**Verification:** `tests/contact-section.test.ts` → `styles_form_fields`.

### R35 — Submit button

The system MUST render `<button class="contact__submit" type="submit">` with the text `Enviar Mensaje` and a decorative 18px `send` inline SVG (`aria-hidden="true"`) with the exact path below, styled with `display: inline-flex`, `align-items: center`, `justify-content: center`, `gap: 0.625rem`, `width: 100%`, `padding: 1rem 1.5rem`, `border-radius: var(--radius-xl)`, `background-image: linear-gradient(to right, var(--color-indigo-600), var(--color-primary), var(--color-indigo-600))`, white text, `label-md` typography at weight `500`, `letter-spacing: 0.025em`, `border: 1px solid rgba(53, 37, 205, 0.4)`, `box-shadow: 0 6px 24px rgba(79, 70, 229, 0.35)`, `cursor: pointer`, `margin-top: 0.5rem` and `transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1)`; hover `background-image: linear-gradient(to right, var(--color-indigo-700), var(--color-indigo-600), var(--color-indigo-700))` + `box-shadow: 0 10px 32px rgba(79, 70, 229, 0.5)`; active `transform: scale(0.98)`; the icon translates `0.25rem` right on hover.

| Icon   | Path data                                                                                    |
| ------ | -------------------------------------------------------------------------------------------- |
| `send` | `M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z` |

**Verification:** `tests/contact-section.test.ts` → `renders_submit_button`.

### R36 — Presentation-only form

The system MUST ship the form as presentation-only UI: no `onsubmit`, no `action`, no `method`, no `preventDefault`, no submit listener, no `handleFormSubmit`, no form/hook ids (`contact-form`, `form-submit-btn`, `form-success-banner`), and no success banner or success text (`¡Mensaje enviado!`) anywhere in the section.

**Verification:** `tests/contact-section.test.ts` → `ships_presentation_only_form`.

---

## 8. Home page wiring and page invariants

### R37 — Home page loads the profiles collection

WHEN the home page is built, the system MUST read the `profiles` collection with `getCollection('profiles')` in `src/pages/index.astro`, map each entry to its `data`, and render `<ContactSection profiles={profiles} />` immediately after `<TechnologiesSection technologies={technologies} />`.

**Verification:** `tests/contact-section.test.ts` → `loads_profile_collection_in_index` (asserts the page source wiring and that the rendered page includes the section with fixture data; rendered through the collection-aware `vi.mock('astro:content')` pattern of `design.md` §10).

### R38 — Heading invariants

WHEN the home page renders, the system MUST keep exactly one `<h1>` (the hero), with the contact section contributing exactly one `<h2>` and no `<h1>` inside it.

**Verification:** `tests/contact-section.test.ts` → `renders_single_h2` and the existing `tests/index.test.ts` → `renders_exactly_one_h1`.

### R39 — Script budget and zero-island scope

The system MUST keep the page's client JavaScript limited to exactly two bundled clipboard scripts (hero and contact): no hydrated island (`client:*`), no inline event-handler attribute, no third `<script>`, and the contact script is the only one added by this feature.

**Verification:** `tests/contact-section.test.ts` → `ships_only_clipboard_enhancement` and the updated `tests/index.test.ts` → `ships_only_clipboard_enhancement` (page-wide scan extended to `ContactSection.astro`, expecting the two clipboard scripts).

---

## 9. Exclusions

### R40 — No Cal.com booking card

The system MUST NOT render the mockup's Cal.com booking card: no `Reservar Reunión de 30 min`, no `Agendar en Cal.com`, no `cal.com` URL and no `calendar_month` icon anywhere in the section or the page.

**Verification:** `tests/contact-section.test.ts` → `omits_calcom_booking_card` (scans the component source and the rendered home page for the forbidden strings).

### R41 — No nav, footer, about/experience or WebGL shader

The system MUST NOT add the floating nav, the footer, the about/experience section or the WebGL shader: the home page keeps no `<nav>`/`<footer>` element and the `src/` tree gains no canvas/shader code.

**Verification:** `tests/contact-section.test.ts` → `omits_excluded_sections` (renders the page and asserts no `<nav>`/`<footer>`; recursively scans `src/` for `<canvas`/`shader`).

### R42 — No new dependencies

The system MUST NOT add or remove dependencies: the `dependencies` and `devDependencies` maps of `package.json` stay exactly as they are before this feature.

**Verification:** `tests/contact-section.test.ts` → `keeps_dependencies_unchanged` (reads `package.json` and asserts both maps).

---

## Traceability

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
