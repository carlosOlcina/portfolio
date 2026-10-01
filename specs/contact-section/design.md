# Design — contact-section

## 1. Context

Fourth UI increment of the portfolio: the contact section of the Stitch design **Full Chromatic Glass**, sourced from `specs/hero-section/references/chromatic-glass.html` lines 1885–2108 ("5. CONTACT & COLLABORATION") and the digest in `specs/hero-section/references/design-notes.md` (line 325). The section renders after the tech stack on the home page and closes the page in this increment.

Hard constraints from the harness: Astro 7 + strict TypeScript, zero client JS except the justified clipboard enhancement, plain CSS with the existing custom properties (no Tailwind), no icon font, no new dependencies, every requirement traceable to a Vitest test. Human decisions: delete the Cal.com booking card; keep the form presentation-only; move the contact email to one shared constant; add a Zod-validated JSON `profiles` collection with exactly `id`/`title`/`url`; reuse the existing clipboard script and toast.

The feature mirrors the `technologies-section` architecture: a schema module Vitest can import without virtual modules, a presentational section component that receives plain data, and a page that owns the `getCollection` calls. The only client script added is the contact copy wiring, identical in shape to the hero one.

## 2. Decisions summary

1. The `profiles` collection lives in `src/content.config.ts` with the `glob` loader (`base: './src/content/profiles'`, `pattern: '**/*.json'`) and `schema: profilesSchema`.
2. One JSON file per profile entry (`src/content/profiles/<slug>.json`), matching the one-entry-per-file model of `projects` and `technologies`. The `file()` single-array loader is rejected (§11).
3. `src/content/profiles-schema.ts` exports `profilesSchema` (`z.strictObject`), `ProfileData`, `assertUniqueProfiles` and `sortProfiles`. It imports only `astro/zod`; Vitest imports it directly. No factory: there is no Astro-context dependency to inject.
4. Deterministic rendering order: `sortProfiles` returns a new array sorted ascending by `title` with code-point comparison (locale-independent). Duplicate `id`s throw `Duplicate profile id: <id>` during section render, so `astro build` fails loudly (same guarantee as `groupTechnologies`/`sortProjects`).
5. The contact email lives once in `src/site-constants.ts` as `CONTACT_EMAIL`; `HeroSection.astro` stops declaring its local constant and imports it, and `ContactSection.astro` imports it too. The email literal appears exactly once in `src/`.
6. `ContactSection.astro` receives `profiles: ProfileData[]`, validates/orders them with `sortProfiles` and renders the header, the left options column (click-to-copy email card + "Redes y Perfiles" card) and the right form panel. No scripts other than the clipboard wiring; no islands; no inline handlers.
7. The copy card is a real `<button type="button" id="copy-email-contact-btn" data-email={CONTACT_EMAIL}>` (keyboard-operable), not a clickable `<div>`; the script reuses `copyToClipboard`/`showToast` and the BaseLayout `#toast`/`#toast-text` elements with the same wiring as the hero.
8. The Cal.com booking card and the success banner of the mockup are deleted (human decision); the form ships as presentation-only markup with labels, `required` and ids, no `action`/`method`/`onsubmit` and no speculative hooks.
9. Material Symbols ligatures are reproduced as inline SVGs with exact path data: `mail` (20px), `content_copy` (18px), `arrow_outward` (14px) and `send` (18px). No icon font, no external request.
10. All styles live in the component's scoped `<style>` block, consuming existing `--color-*`, `--font-*`, `--text-*` and `--radius-*` tokens. No token changes, no global CSS changes.
11. Three seed profiles (`GitHub`, `LinkedIn`, `X`) proposed for human approval in §5; their URLs are placeholders based on the mockup and are flagged for replacement.
12. Only `src/pages/index.astro` touches `getCollection('profiles')`; the section component stays presentational and fixture-testable.

## 3. Files

| File                                  | Action | Responsibility                                                                                                |
| ------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| `src/site-constants.ts`               | create | Single `CONTACT_EMAIL` export (R11–R12).                                                                      |
| `src/content/profiles-schema.ts`      | create | `profilesSchema`, `ProfileData`, `assertUniqueProfiles`, `sortProfiles` (R2–R5).                              |
| `src/content.config.ts`               | modify | Adds the `profiles` collection with the JSON glob loader (R1).                                                |
| `src/content/profiles/*.json`         | create | Three seed entries, exactly three fields each (R7–R10).                                                       |
| `src/components/HeroSection.astro`    | modify | Imports `CONTACT_EMAIL` from `../site-constants`; local constant removed; behaviour unchanged (R13).          |
| `src/components/ContactSection.astro` | create | Section shell, header, options column, form panel, scoped styles and clipboard wiring (R6, R14–R36, R38–R42). |
| `src/pages/index.astro`               | modify | Loads `profiles` and composes `<ContactSection />` after `<TechnologiesSection />` (R37).                     |
| `tests/profiles-schema.test.ts`       | create | Collection config, schema contract, duplicate-id error, ordering (R1–R5).                                     |
| `tests/profiles-content.test.ts`      | create | Three seeds, three-field shape, values, unique ids (R7–R10).                                                  |
| `tests/contact-section.test.ts`       | create | Section rendering with fixtures + CSS contract + page wiring + scope checks (R6, R14–R42).                    |
| `tests/clipboard.test.ts`             | modify | Shared constant assertions (R11–R13).                                                                         |
| `tests/index.test.ts`                 | modify | Collection-aware mock (profiles branch) + two-script budget + `ContactSection.astro` scan (R39).              |
| `tests/projects-section.test.ts`      | modify | Collection-aware mock (profiles branch returns `[]`) so the page keeps rendering.                             |

Unchanged: `astro.config.mjs`, `vitest.config.ts`, `tsconfig.json`, `package.json` (no new dependencies), `tests/node-shims.d.ts`, `src/styles/*`, `src/layouts/BaseLayout.astro`, `src/scripts/clipboard.ts`, the other components, the other tests (`tests/toast.test.ts` renders the page against the real content layer and keeps working because the new seeds are valid).

## 4. Profiles data model and schema

### Schema module — `src/content/profiles-schema.ts`

Imports only `astro/zod`; no virtual modules, no side effects, directly importable by Vitest.

```ts
import { z } from 'astro/zod';

export const profilesSchema = z.strictObject({
  id: z.uuid(),
  title: z.string(),
  url: z.url(),
});

export type ProfileData = z.infer<typeof profilesSchema>;

export function assertUniqueProfiles(
  profiles: readonly Pick<ProfileData, 'id'>[],
): void {
  const ids = new Set<string>();

  for (const profile of profiles) {
    if (ids.has(profile.id)) {
      throw new Error(`Duplicate profile id: ${profile.id}`);
    }
    ids.add(profile.id);
  }
}

const compareByTitle = (a: ProfileData, b: ProfileData): number => {
  if (a.title < b.title) {
    return -1;
  }
  if (a.title > b.title) {
    return 1;
  }
  return 0;
};

export function sortProfiles<T extends ProfileData>(
  profiles: readonly T[],
): T[] {
  assertUniqueProfiles(profiles);
  return [...profiles].sort(compareByTitle);
}
```

Notes:

- `z.strictObject` rejects unknown keys, enforcing the three-field contract at build time. Fallback if `astro/zod` ever lacks `strictObject`: `z.object({ ... }).strict()`; the tests only observe accept/reject behaviour.
- `z.url()` is already used by `projects-schema.ts`, so it is available in the installed `astro/zod`.
- `[...profiles].sort(...)` never mutates the input; the error message is part of the contract (R4) and is asserted verbatim.
- Title ordering uses `<`/`>` (code points), avoiding `localeCompare` differences across ICU versions.

### `src/content.config.ts`

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { buildProjectsSchema } from './content/projects-schema';
import { profilesSchema } from './content/profiles-schema';
import { technologiesSchema } from './content/technologies-schema';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) => buildProjectsSchema({ image }),
});

const technologies = defineCollection({
  loader: glob({ base: './src/content/technologies', pattern: '**/*.json' }),
  schema: technologiesSchema,
});

const profiles = defineCollection({
  loader: glob({ base: './src/content/profiles', pattern: '**/*.json' }),
  schema: profilesSchema,
});

export const collections = { projects, technologies, profiles };
```

The glob loader parses each JSON file and validates its data with `profilesSchema`; the entry `id` is derived from the file name (`github`, `linkedin`, `x`) while the data `id` stays a UUID used only for identity and uniqueness. A file with an unknown key, a non-UUID id or a relative URL fails `astro build` explicitly.

## 5. Seed content

Three entries proposed for human approval. The URLs are placeholders copied from the mockup (`GitHub`, `LinkedIn`) and the design-notes profile list (`X`); the human replaces them with the real profile URLs later — no code change is needed for that, only JSON edits.

| File            | `id` (UUID)                            | `title`    | `url`                  |
| --------------- | -------------------------------------- | ---------- | ---------------------- |
| `github.json`   | `3a7d1f52-9b4c-4e68-8f21-6c0d5a9e7b34` | `GitHub`   | `https://github.com`   |
| `linkedin.json` | `7c2e8a41-5d6f-4b93-a0e8-2f4c9d1b6a05` | `LinkedIn` | `https://linkedin.com` |
| `x.json`        | `b5f0c3d8-2a71-4c9e-9d36-8e7a1b4f2c90` | `X`        | `https://x.com`        |

Each file is exactly:

```json
{
  "id": "3a7d1f52-9b4c-4e68-8f21-6c0d5a9e7b34",
  "title": "GitHub",
  "url": "https://github.com"
}
```

Rendered order after `sortProfiles`: `GitHub`, `LinkedIn`, `X`.

## 6. Shared contact email

### Location — `src/site-constants.ts`

```ts
export const CONTACT_EMAIL = 'carlosolcina23@gmail.com';
```

Why this location:

- `docs/architecture.md` defines `src/content/` for content collections (Markdown/MDX + Zod schema) and `src/scripts/` for the existing clipboard module (client behaviour); neither is a site-metadata module.
- The repo has no constants folder yet. A single root-level module follows the Astro convention of a `src/` constants file while avoiding an abbreviation, and keeps `src/` flat instead of inventing a `src/config/` or `src/constants/` directory that neither doc lists.
- Screaming Snake Case matches `docs/conventions.md` (Constants → `SCREAMING_SNAKE_CASE`).

### Consumers

`src/components/HeroSection.astro` frontmatter becomes:

```astro
---
import { CONTACT_EMAIL } from '../site-constants';
---
```

The rest of the hero is untouched; the button keeps `data-email={CONTACT_EMAIL}`.

`src/components/ContactSection.astro` imports the same constant (its markup is in §7). No other file in `src/` may contain the literal (R12).

## 7. `src/components/ContactSection.astro`

```astro
---
import { sortProfiles, type ProfileData } from '../content/profiles-schema';
import { CONTACT_EMAIL } from '../site-constants';

interface Props {
  profiles: ProfileData[];
}

const { profiles } = Astro.props;
const orderedProfiles = sortProfiles(profiles);

const MAIL_ICON_PATH =
  'M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z';
const COPY_ICON_PATH =
  'M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z';
const ARROW_OUTWARD_ICON_PATH =
  'm256-240-56-56 384-384H240v-80h480v480h-80v-344L256-240Z';
const SEND_ICON_PATH =
  'M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z';
---

<section class="contact animate-fade-in-up animation-delay-400" id="contact">
  <div class="contact__inner">
    <div class="contact__header">
      <div class="contact__eyebrow">
        <span class="contact__label">Contacto y Colaboración</span>
        <span class="contact__label-rule"></span>
      </div>
      <h2 class="contact__title">
        Construyamos algo <span class="contact__title-accent">increíble</span>{' '}
        juntos
      </h2>
      <p class="contact__intro">
        ¿Tienes un proyecto web o de inteligencia artificial en mente? Hablemos.
      </p>
    </div>
    <div class="contact__grid">
      <div class="contact__options">
        <button
          class="contact__email-card"
          id="copy-email-contact-btn"
          type="button"
          data-email={CONTACT_EMAIL}
        >
          <span class="contact__email-main">
            <span class="contact__email-badge">
              <svg
                class="contact__email-badge-icon"
                viewBox="0 -960 960 960"
                width="20"
                height="20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d={MAIL_ICON_PATH}></path>
              </svg>
            </span>
            <span class="contact__email-text">
              <span class="contact__email-label">Correo Directo</span>
              <span class="contact__email-value">{CONTACT_EMAIL}</span>
            </span>
          </span>
          <svg
            class="contact__email-copy-icon"
            viewBox="0 -960 960 960"
            width="18"
            height="18"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d={COPY_ICON_PATH}></path>
          </svg>
        </button>
        <div class="contact__social">
          <span class="contact__social-label">Redes y Perfiles</span>
          <ul class="contact__profiles">
            {orderedProfiles.map((profile) => (
              <li>
                <a
                  class="contact__profile-link"
                  href={profile.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{profile.title}</span>
                  <svg
                    class="contact__profile-icon"
                    viewBox="0 -960 960 960"
                    width="14"
                    height="14"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={ARROW_OUTWARD_ICON_PATH}></path>
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div class="contact__form-panel">
        <form class="contact__form">
          <div class="contact__fields">
            <div class="contact__field">
              <label class="contact__field-label" for="contact-name">
                Nombre
              </label>
              <input
                class="contact__input"
                id="contact-name"
                type="text"
                placeholder="Elena Rostova"
                required
              />
            </div>
            <div class="contact__field">
              <label class="contact__field-label" for="contact-email">
                Correo Electrónico
              </label>
              <input
                class="contact__input"
                id="contact-email"
                type="email"
                placeholder="elena@empresa.com"
                required
              />
            </div>
          </div>
          <div class="contact__field">
            <label class="contact__field-label" for="contact-message">
              Mensaje / Alcance del Proyecto
            </label>
            <textarea
              class="contact__textarea"
              id="contact-message"
              placeholder="Detalles del proyecto, plazos y objetivos..."
              rows="4"
              required
            ></textarea>
          </div>
          <button class="contact__submit" type="submit">
            <span>Enviar Mensaje</span>
            <svg
              class="contact__submit-icon"
              viewBox="0 -960 960 960"
              width="18"
              height="18"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={SEND_ICON_PATH}></path>
            </svg>
          </button>
        </form>
      </div>
    </div>
  </div>
</section>

<script>
  import { copyToClipboard, showToast } from '../scripts/clipboard';

  const button = document.querySelector<HTMLButtonElement>(
    '#copy-email-contact-btn',
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

Class contract (tests assert these hooks): `.contact`, `.contact__inner`, `.contact__header`, `.contact__eyebrow`, `.contact__label`, `.contact__label-rule`, `.contact__title`, `.contact__title-accent`, `.contact__intro`, `.contact__grid`, `.contact__options`, `.contact__email-card`, `.contact__email-main`, `.contact__email-badge`, `.contact__email-badge-icon`, `.contact__email-text`, `.contact__email-label`, `.contact__email-value`, `.contact__email-copy-icon`, `.contact__social`, `.contact__social-label`, `.contact__profiles`, `.contact__profile-link`, `.contact__profile-icon`, `.contact__form-panel`, `.contact__form`, `.contact__fields`, `.contact__field`, `.contact__field-label`, `.contact__input`, `.contact__textarea`, `.contact__submit`, `.contact__submit-icon`.

Notes:

- The mockup's email card is a `<div onclick>`; the component upgrades it to a `<button type="button">` so it is focusable and keyboard-operable, exactly like the hero secondary CTA. The mockup's `<form id="contact-form">`/`<button id="form-submit-btn">` ids are omitted because no script consumes them (R33, R36).
- The header uses explicit `{' '}` around the accent span: under the Astro compiler (feature `fix-hero-headline-whitespace`) inline whitespace next to a span is trimmed, and the headline must read `Construyamos algo increíble juntos`.
- The mockup's Cal.com card and success banner are absent by design (R40, R36).
- The four Material Symbols ligatures are replaced with inline SVGs carrying the exact 24px paths fetched from the Material Symbols release (R16, R29, R35) and never an icon font.
- The `<script>` is a bundled module script (same as the hero), not `is:inline`; it keeps the page at two bundled scripts and zero islands (R39).

## 8. CSS contract — computed values

All declarations live in the component's scoped `<style>` block; no new global CSS and no new tokens. Rules are single-selector (the repo's test helpers extract one selector per rule); `::placeholder` and `:focus` are therefore written as separate rules.

```css
.contact {
  padding-block: 6rem;
  scroll-margin-top: 6rem;
}

.contact__inner {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.contact__header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 42rem;
}

.contact__eyebrow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.contact__label {
  font-family: var(--font-body);
  font-size: var(--text-label-sm-size);
  line-height: var(--text-label-sm-line-height);
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-primary);
}

.contact__label-rule {
  display: block;
  height: 1px;
  width: 3rem;
  background-color: rgba(53, 37, 205, 0.4);
}

.contact__title {
  font-family: var(--font-headline);
  font-size: var(--text-headline-lg-size);
  line-height: var(--text-headline-lg-line-height);
  font-weight: var(--text-headline-lg-weight);
  letter-spacing: -0.025em;
  color: var(--color-slate-900);
}

.contact__title-accent {
  font-family: var(--font-headline);
  font-style: italic;
  font-weight: 300;
  color: var(--color-primary);
}

.contact__intro {
  font-family: var(--font-body);
  font-weight: 300;
  font-size: var(--text-body-md-size);
  line-height: 1.625;
  letter-spacing: var(--text-body-md-letter-spacing);
  color: var(--color-slate-600);
}

.contact__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 2rem;
  align-items: start;
}

.contact__options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 1024px) {
  .contact__grid {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }

  .contact__options {
    grid-column: span 5;
  }

  .contact__form-panel {
    grid-column: span 7;
  }
}

.contact__email-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  border-radius: var(--radius-2xl);
  background-color: rgba(255, 255, 255, 0.45);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  text-align: left;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.contact__email-card:hover {
  background-color: rgba(255, 255, 255, 0.62);
  border-color: rgba(129, 140, 248, 0.55);
  box-shadow:
    0 20px 42px -8px rgba(79, 70, 229, 0.14),
    0 0 24px -2px rgba(99, 102, 241, 0.16);
  transform: translateY(-3px);
}

.contact__email-card:active {
  transform: scale(0.99);
}

.contact__email-main {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.contact__email-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: var(--radius-xl);
  background-color: rgba(53, 37, 205, 0.1);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(53, 37, 205, 0.25);
  color: var(--color-primary);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.contact__email-card:hover .contact__email-badge {
  background-color: rgba(53, 37, 205, 0.2);
  transform: scale(1.05);
}

.contact__email-badge-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.contact__email-text {
  display: flex;
  flex-direction: column;
}

.contact__email-label {
  font-family: var(--font-body);
  font-size: var(--text-label-sm-size);
  line-height: var(--text-label-sm-line-height);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-slate-500);
}

.contact__email-value {
  font-family: var(--font-body);
  font-size: var(--text-body-md-size);
  line-height: var(--text-body-md-line-height);
  font-weight: 500;
  color: var(--color-slate-900);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.contact__email-card:hover .contact__email-value {
  color: var(--color-primary);
}

.contact__email-copy-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--color-slate-400);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.contact__email-card:hover .contact__email-copy-icon {
  color: var(--color-primary);
  transform: rotate(12deg);
}

.contact__social {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: var(--radius-2xl);
  background-color: rgba(255, 255, 255, 0.45);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.contact__social-label {
  font-family: var(--font-body);
  font-size: var(--text-label-sm-size);
  line-height: var(--text-label-sm-line-height);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-slate-500);
}

.contact__profiles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.contact__profile-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  border-radius: var(--radius-lg);
  background-color: rgba(255, 255, 255, 0.6);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  color: var(--color-slate-800);
  font-family: var(--font-body);
  font-size: var(--text-label-md-size);
  line-height: var(--text-label-md-line-height);
  font-weight: var(--text-label-md-weight);
  letter-spacing: var(--text-label-md-letter-spacing);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.contact__profile-link:hover {
  background-color: rgba(255, 255, 255, 0.85);
  border-color: rgba(53, 37, 205, 0.4);
  transform: translateY(-0.125rem);
}

.contact__profile-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--color-slate-400);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.contact__profile-link:hover .contact__profile-icon {
  color: var(--color-primary);
  transform: translate(0.125rem, -0.125rem);
}

.contact__form-panel {
  padding: 2rem;
  border-radius: var(--radius-2xl);
  background-color: rgba(255, 255, 255, 0.5);
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.contact__form-panel:hover {
  border-color: rgba(165, 180, 252, 0.8);
}

.contact__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.contact__fields {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 1.25rem;
}

@media (min-width: 640px) {
  .contact__fields {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.contact__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact__field-label {
  font-family: var(--font-body);
  font-size: var(--text-label-sm-size);
  line-height: var(--text-label-sm-line-height);
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-slate-500);
}

.contact__input {
  width: 100%;
  height: 3rem;
  padding-inline: 1rem;
  border-radius: var(--radius-xl);
  background-color: rgba(255, 255, 255, 0.6);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  color: var(--color-slate-900);
  font-family: inherit;
  font-size: var(--text-body-md-size);
  line-height: var(--text-body-md-line-height);
  font-weight: 300;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.contact__textarea {
  width: 100%;
  padding: 1rem;
  border-radius: var(--radius-xl);
  background-color: rgba(255, 255, 255, 0.6);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  color: var(--color-slate-900);
  font-family: inherit;
  font-size: var(--text-body-md-size);
  line-height: var(--text-body-md-line-height);
  font-weight: 300;
  resize: none;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.contact__input::placeholder {
  color: var(--color-slate-400);
}

.contact__textarea::placeholder {
  color: var(--color-slate-400);
}

.contact__input:focus {
  border-color: var(--color-indigo-500);
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}

.contact__textarea:focus {
  border-color: var(--color-indigo-500);
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}

.contact__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  width: 100%;
  margin-top: 0.5rem;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-xl);
  background-image: linear-gradient(
    to right,
    var(--color-indigo-600),
    var(--color-primary),
    var(--color-indigo-600)
  );
  color: #ffffff;
  font-family: var(--font-body);
  font-size: var(--text-label-md-size);
  line-height: var(--text-label-md-line-height);
  font-weight: 500;
  letter-spacing: 0.025em;
  border: 1px solid rgba(53, 37, 205, 0.4);
  box-shadow: 0 6px 24px rgba(79, 70, 229, 0.35);
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.contact__submit:hover {
  background-image: linear-gradient(
    to right,
    var(--color-indigo-700),
    var(--color-indigo-600),
    var(--color-indigo-700)
  );
  box-shadow: 0 10px 32px rgba(79, 70, 229, 0.5);
}

.contact__submit:active {
  transform: scale(0.98);
}

.contact__submit-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.contact__submit:hover .contact__submit-icon {
  transform: translateX(0.25rem);
}
```

### Tailwind → CSS translation table

| Mockup utility                                                                                       | Computed value / rule                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `py-24`, `scroll-mt-24`                                                                              | `6rem`, `6rem`                                                                                                                                                                       |
| `gap-12`, `gap-8`, `gap-5`, `gap-4`, `gap-3`, `gap-3.5`, `gap-2.5`, `gap-2`, `gap-1.5`               | `3rem`, `2rem`, `1.25rem`, `1rem`, `0.75rem`, `0.875rem`, `0.625rem`, `0.5rem`, `0.375rem`                                                                                           |
| `p-8`, `p-6`, `p-5`, `p-4`, `px-6`, `py-4`, `px-4`, `px-3.5 py-1.5`                                  | `2rem`, `1.5rem`, `1.25rem`, `1rem`, `1.5rem`, `1rem`, `1rem`, `0.375rem 0.875rem`                                                                                                   |
| `h-12`, `w-10 h-10`, `max-w-2xl`                                                                     | `3rem`, `2.5rem`, `42rem`                                                                                                                                                            |
| `rounded-2xl`, `rounded-xl`, `rounded-lg`                                                            | `var(--radius-2xl)`, `var(--radius-xl)`, `var(--radius-lg)`                                                                                                                          |
| `tracking-[0.18em]`, `tracking-widest`, `tracking-wide`, `tracking-tight`                            | `0.18em`, `0.1em`, `0.025em`, `-0.025em`                                                                                                                                             |
| `leading-relaxed`                                                                                    | `1.625`                                                                                                                                                                              |
| `backdrop-blur-xl`, `backdrop-blur-md`                                                               | `blur(24px)`, `blur(12px)`                                                                                                                                                           |
| `bg-white/45`, `bg-white/50`, `bg-white/60`, `focus:bg-white/90`                                     | `rgba(255, 255, 255, 0.45)`, `rgba(255, 255, 255, 0.5)`, `rgba(255, 255, 255, 0.6)`, `rgba(255, 255, 255, 0.9)`                                                                      |
| `bg-primary/10`, `group-hover:bg-primary/20`, `bg-primary/40`                                        | `rgba(53, 37, 205, 0.1)`, `rgba(53, 37, 205, 0.2)`, `rgba(53, 37, 205, 0.4)`                                                                                                         |
| `border-white/70`, `border-white/80`, `border-primary/25`, `border-primary/40`                       | `rgba(255, 255, 255, 0.7)`, `rgba(255, 255, 255, 0.8)`, `rgba(53, 37, 205, 0.25)`, `rgba(53, 37, 205, 0.4)`                                                                          |
| `hover:border-indigo-300/80`, `hover:border-primary/40`, `focus:border-indigo-500`                   | `rgba(165, 180, 252, 0.8)`, `rgba(53, 37, 205, 0.4)`, `var(--color-indigo-500)`                                                                                                      |
| `focus:ring-4 focus:ring-indigo-500/15`                                                              | `box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15)`                                                                                                                                     |
| `shadow-md`, `shadow-xl`, `shadow-sm`                                                                | `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)`; `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)`; `0 1px 2px 0 rgba(0, 0, 0, 0.05)` |
| `shadow-[0_6px_24px_rgba(79,70,229,0.35)]`, `hover:shadow-[0_10px_32px_rgba(79,70,229,0.5)]`         | `0 6px 24px rgba(79, 70, 229, 0.35)`, `0 10px 32px rgba(79, 70, 229, 0.5)`                                                                                                           |
| `text-slate-900/800/600/500/400`, `text-primary`                                                     | `var(--color-slate-900/800/600/500/400)`, `var(--color-primary)`                                                                                                                     |
| `transition-all duration-200` / `duration-300`                                                       | `all 200ms cubic-bezier(0.4, 0, 0.2, 1)` / `all 300ms cubic-bezier(0.4, 0, 0.2, 1)`                                                                                                  |
| `active:scale-[0.99]`, `active:scale-[0.98]`, `group-hover:scale-105`                                | `scale(0.99)`, `scale(0.98)`, `scale(1.05)`                                                                                                                                          |
| `group-hover:rotate-12`, `group-hover:translate-x-0.5 -translate-y-0.5`, `group-hover:translate-x-1` | `rotate(12deg)`, `translate(0.125rem, -0.125rem)`, `translateX(0.25rem)`                                                                                                             |
| `hover:-translate-y-0.5`, `resize-none`                                                              | `translateY(-0.125rem)`, `resize: none`                                                                                                                                              |
| `sm` / `lg` breakpoints                                                                              | `640px` / `1024px`                                                                                                                                                                   |

Conflict resolutions and deviations (documented because the mockup relies on utility-order behaviour):

- **Email card hover:** the mockup combines `hover:bg-white/65`, `hover:border-indigo-400/50` and `glass-card-hover`; the custom rule wins, so the computed hover values are `rgba(255, 255, 255, 0.62)` and `rgba(129, 140, 248, 0.55)` (same precedence resolution as `ProjectCard` and `TechnologiesSection`).
- **Focus outline:** the mockup sets `focus:outline-none`; the repo forbids suppressing focus outlines (`tests/global-styles.test.ts`), so the component keeps the native outline and adds border/background/ring on focus (R34).
- **Form controls typography:** `global.css` only resets `button`; the component sets `font-family: inherit` explicitly on inputs and the textarea so they match the body font instead of the browser's monospace default.
- **Card is a button:** `text-align: left` is added because the global button reset leaves the UA center alignment; the mockup's `div` had no such issue.
- **Headline spaces:** explicit `{' '}` around the accent span, per the `fix-hero-headline-whitespace` lesson; the compiler otherwise trims them.

## 9. `src/pages/index.astro`

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import HeroSection from '../components/HeroSection.astro';
import ProjectsSection from '../components/ProjectsSection.astro';
import TechnologiesSection from '../components/TechnologiesSection.astro';
import ContactSection from '../components/ContactSection.astro';

const PAGE_TITLE = '…';
const PAGE_DESCRIPTION = '…';

const projectEntries = await getCollection('projects');
const projects = projectEntries.map((entry) => entry.data);

const technologyEntries = await getCollection('technologies');
const technologies = technologyEntries.map((entry) => entry.data);

const profileEntries = await getCollection('profiles');
const profiles = profileEntries.map((entry) => entry.data);
---

<BaseLayout title={PAGE_TITLE} description={PAGE_DESCRIPTION}>
  <HeroSection />
  <ProjectsSection projects={projects} />
  <TechnologiesSection technologies={technologies} />
  <ContactSection profiles={profiles} />
</BaseLayout>
```

The section order matches the mockup (hero → projects → tech stack → contact); the about/experience section is skipped by human decision and is not reserved in the page.

## 10. Test strategy

**Fixtures over the content layer (primary).** `tests/contact-section.test.ts` renders `ContactSection` with a local `createProfile(overrides)` factory through `experimental_AstroContainer`; the component does not touch `astro:content`, so no mock is needed for component-level renders. `tests/profiles-schema.test.ts` imports `src/content/profiles-schema.ts` directly (it only imports `astro/zod`).

**Content tests without the content layer.** `tests/profiles-content.test.ts` reads the three JSON files with `readFileSync` + `JSON.parse` and applies `profilesSchema` directly; no content-layer spike is needed. The real glob loader is exercised by `pnpm build` (task 9.4).

**Shared constant tests — `tests/clipboard.test.ts` (modified).** `defines_contact_email_once` now asserts that the literal occurs exactly once across `src/`, that `src/site-constants.ts` declares `export const CONTACT_EMAIL = 'carlosolcina23@gmail.com';`, and that `scripts/clipboard.ts` contains no literal. `imports_shared_contact_email` asserts the hero import and rendered `data-email`, replacing the old local-constant assertion.

**Page-render tests — collection-aware mock.** The home page now issues three `getCollection` calls, so `tests/index.test.ts` and `tests/projects-section.test.ts` must branch on the collection name; the technologies branch keeps its fixtures where relevant and the new profiles branch returns `[]` (or fixtures in `contact-section.test.ts`):

```ts
vi.mock('astro:content', async () => {
  const { default: cover } =
    await import('../src/content/projects/covers/synapse.webp');

  const projectEntries = [/* existing four project fixtures */];
  const technologyEntries = [/* technology fixtures, empty where not needed */];
  const profileEntries = [/* profile fixtures, empty where not needed */];

  return {
    getCollection: async (collection: string) => {
      if (collection === 'technologies') {
        return technologyEntries.map((data, index) => ({
          id: `technology-${index}`,
          data,
        }));
      }
      if (collection === 'profiles') {
        return profileEntries.map((data, index) => ({
          id: `profile-${index}`,
          data,
        }));
      }
      return projectEntries.map((data, index) => ({
        id: `project-${index}`,
        data: { coverPath: cover, ...data },
      }));
    },
  };
});
```

`vi.mock` is hoisted, so it is declared before importing `src/pages/index.astro`; fixtures are duplicated per file, matching the existing no-shared-util convention. `tests/technologies-section.test.ts` needs no change: its mock already returns `[]` for any collection other than `technologies`. `tests/toast.test.ts` needs no change either: it exercises the real content layer, and the new seeds are valid.

**Script budget tests.** `tests/index.test.ts` → `ships_only_clipboard_enhancement` now expects two `<script>` tags among the scanned page sources (hero + contact), two rendered module scripts (`HeroSection.astro` and `ContactSection.astro`), no `is:inline` script, no `astro-island`, no inline handlers and no `client:*` anywhere under `src/`. `tests/contact-section.test.ts` → `ships_only_clipboard_enhancement` asserts the same budget from the contact side.

**CSS contract.** No CSS engine runs in Vitest, so style tests read `ContactSection.astro` with `readFileSync` and assert exact declarations using the same whitespace-normalizing `extractRule` / `extractResponsiveRule` helpers already duplicated in `tests/index.test.ts`, `tests/hero.test.ts` and `tests/technologies-section.test.ts` (keep the duplication for consistency).

**Fallback if the Container API cannot render a piece.** The schema and content tests are independent of the Container API and stay green. If rendering `ContactSection` or the page fails unexpectedly under Vitest, the affected assertions fall back to source-contract checks (`ContactSection.astro` markup/classes) plus built-output verification in task 9.4: `dist/index.html` must contain `id="contact"`, the header texts, the email address, `Redes y Perfiles`, the profile links with their URLs, the three form controls and the submit button, with no Cal.com strings, no success banner and exactly two bundled scripts. The chosen variant is recorded in `progress/current.md`.

## 11. Rejected alternatives

| Alternative                                                                     | Why rejected                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keeping `CONTACT_EMAIL` in `HeroSection.astro` and importing it from there      | A component is not a data module; it couples the contact section to the hero and makes the shared constant undiscoverable.                                                                                            |
| `src/content/site.ts` for the constant                                          | `docs/architecture.md` reserves `src/content/` for content collections; a site constant is neither content nor a Zod schema.                                                                                          |
| `src/scripts/site.ts` for the constant                                          | `src/scripts/` holds client behaviours (`clipboard.ts`); the constant is build-time data used by the frontmatter of two components.                                                                                   |
| A `src/constants/` or `src/config/` directory                                   | Neither `docs/architecture.md` nor `docs/conventions.md` lists it; one root module avoids a speculative structure.                                                                                                    |
| Duplicating the literal in both components                                      | Violates DRY and the explicit human decision; `tests/clipboard.test.ts` guards against a second occurrence.                                                                                                           |
| Adding an `initCopyEmailButton(elementId)` helper to `src/scripts/clipboard.ts` | Changes the tested public API of a module that is currently pure; the two ~15-line wirings are bounded duplication consistent with the repo's duplicated test helpers, and the human asked to reuse the existing API. |
| `file()` loader with a single `profiles.json` array                             | The `id` key interacts with Astro's entry identification rules and the one-file-per-entry model is the repo pattern for both existing collections.                                                                    |
| A per-entry `priority`/`order` field to control rendering order                 | Breaks the exactly-three-fields requirement; title ordering is deterministic without extra data.                                                                                                                      |
| Relying on file-system/insertion order for the pills                            | Non-deterministic across environments; `sortProfiles` makes the order testable.                                                                                                                                       |
| Rendering the email card as `<a href="mailto:…">`                               | The human explicitly asked for click-to-copy reusing `clipboard.ts` and the toast.                                                                                                                                    |
| A React/vanilla island for the copy card                                        | Zero-JS guardrail; the hero precedent is a bundled module script with no hydration.                                                                                                                                   |
| Wiring the form with a client-side handler and a fake success banner            | Explicitly deferred by the human to a future feature; presentation-only markup avoids speculative code.                                                                                                               |
| Porting the Cal.com booking card                                                | Deleted by the human.                                                                                                                                                                                                 |
| Material Symbols icon font for the four icons                                   | External request, forbidden since the hero increment; the repo precedent is exact inline SVG paths.                                                                                                                   |
| Adding global CSS or new design tokens for the section                          | The tokens already cover every value; scoped styles are the convention and keep the global build small.                                                                                                               |
| `outline: none` on input focus                                                  | Forbidden by the accessibility guard in `tests/global-styles.test.ts`; focus is signalled with border, background and ring while keeping the native outline.                                                          |

## 12. Out of scope / future work

- Contact form submission: message handling, validation UX, success/error feedback, `action`/endpoint (future feature, human decision).
- Experience/about section (the human has no experience data).
- Floating nav/header, footer, WebGL shader background.
- Replacing the placeholder profile URLs with real ones (JSON-only edit).
- i18n; the section copy is Spanish like the rest of the page.
- Additional profile fields (handle, icon, order) beyond `id`/`title`/`url`.
- Any new dependency (icon set, form library, UI framework).

## 13. Risks

| Risk                                                             | Mitigation                                                                                                                                                                                    |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Moving the email literal breaks `defines_contact_email_once` now | The same change updates `tests/clipboard.test.ts` to assert the new single location and both imports (task 8.4); the scan is recursive over `src/`.                                           |
| The third `getCollection('profiles')` call breaks page tests     | `tests/index.test.ts` and `tests/projects-section.test.ts` mocks become collection-aware (tasks 8.5, 8.6); `tests/technologies-section.test.ts` already returns `[]` for unknown collections. |
| The page script budget test expects one script                   | Updated to the two clipboard scripts and extended to `ContactSection.astro` (task 8.5); the component asserts it ships only the clipboard wiring.                                             |
| Whitespace trimming around the `increíble` span (Astro compiler) | Explicit `{' '}` on both sides plus a rendered-text assertion in `renders_section_header` (the `fix-hero-headline-whitespace` precedent).                                                     |
| Container API renders `required`/boolean attributes unexpectedly | Markup tests assert attribute presence with regexes on the normalized HTML instead of exact strings.                                                                                          |
| `z.strictObject` or `z.url()` unavailable in `astro/zod`         | `z.url()` is already used by `projects-schema.ts`; fallback for strict objects is `z.object({ ... }).strict()`.                                                                               |
| Placeholder profile URLs reach production                        | They are documented as placeholders in R8 and §5, and the human replaces them in the JSON files (no code change).                                                                             |
