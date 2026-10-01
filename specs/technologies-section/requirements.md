# Requirements — technologies-section

- **Feature:** `technologies-section` (id 5, `sdd: true`).
- **Source of truth:** `specs/projects-section/references/projects-section.html` (tech stack section: lines 1199–1733) and its digest `specs/hero-section/references/design-notes.md` (line 323).
- **User constraints (2026-09-30, from the original request):** the data lives in a **JSON** content collection (not Markdown); icons are vendored from [svgl](https://svgl.app) into `public/icons/logos/` and referenced by local `iconUrl` paths (no runtime fetch, no CDN); each entry has **exactly four fields**: `id`, `category`, `iconUrl`, `name`.
- **In scope:** the `technologies` content collection (glob JSON loader + Zod schema module + pure grouping/ordering helpers), the 26 seed JSON entries, the 26 vendored svgl SVG logos under `public/icons/logos/`, one new `--font-mono` token, the `#tech-stack` section on the home page (header, four-category glass bento grid, technology chips, closing quote bar), the page wiring and the tests tracing every `R<n>`.
- **Out of scope (future increments):** floating nav/header, about and contact sections, footer, contact form, WebGL shader, i18n, technology detail pages, outbound links or tooltips per technology, client-side filtering/search, animated counters, dark-mode icon variants (one light-background variant per logo is vendored), SVG optimization through Astro's image pipeline (public assets are copied as-is), runtime requests to svgl or any CDN, new dependencies/integrations.

**Notation.** Every requirement uses EARS and contains exactly one `MUST` / `MUST NOT`. Ids `R<n>` are stable. "The design reference" means the mockup HTML above plus its digest. Values in tables are the **effective computed values** of the design, after Tailwind utility translation (the same convention as `specs/hero-section/requirements.md` and `specs/projects-section/requirements.md`). Every requirement is verified by at least one concrete Vitest test (see `Traceability` at the end).

---

## 1. Content collection and schema

### R1 — Collection configuration

The system MUST define the `technologies` collection in `src/content.config.ts` with `defineCollection` (from `astro:content`), the `glob` loader (from `astro/loaders`) configured with `base: './src/content/technologies'` and `pattern: '**/*.json'`, and `schema: technologiesSchema` imported from `src/content/technologies-schema.ts`, exporting `collections = { projects, technologies }`.

**Verification:** `tests/technologies-schema.test.ts` → `declares_collection_configuration` (reads `src/content.config.ts`).

### R2 — Schema module boundary and factory-free schema

The system MUST keep `src/content/technologies-schema.ts` importable by Vitest by importing only `astro/zod` at runtime, never the virtual modules `astro:content`, `astro:loaders` or `astro:assets`, and by exporting the schema as a plain `technologiesSchema` constant (no dependency-injected factory is needed because this schema has no Astro-context dependency).

**Verification:** `tests/technologies-schema.test.ts` → `keeps_schema_module_free_of_astro_virtual_modules` (imports the module in Vitest, parses a valid fixture and asserts the source imports).

### R3 — Schema field contract

The system MUST build a strict Zod object (`z.strictObject`, Zod 4 through `astro/zod`) that accepts and rejects the entry contract below.

| Field      | Validator                                               | Accepted                                                                   | Rejected                                                                                                                   |
| ---------- | ------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `id`       | `z.uuid()`                                              | RFC 4122 UUID, e.g. `0e4b7a91-6c2d-4f58-9a3e-1b7c5d8f2046`                 | `'not-a-uuid'`, missing                                                                                                    |
| `category` | `z.enum(TECHNOLOGY_CATEGORIES)`                         | `Frontend`, `Backend y Nube`, `IA y Sistemas`, `Flujo de Trabajo y Diseño` | `'frontend'`, `'Back-end'`, missing                                                                                        |
| `iconUrl`  | `z.string().regex(/^\/icons\/logos\/[a-z0-9-]+\.svg$/)` | `/icons/logos/react.svg`                                                   | `https://svgl.app/library/react.svg`, `/icons/logos/react.png`, `/icons/logos/React.svg`, `icons/logos/react.svg`, missing |
| `name`     | `z.string()`                                            | any string, e.g. `React`                                                   | missing, number                                                                                                            |

The strict object MUST reject an otherwise valid entry carrying an unknown key (e.g. `tags`).

**Verification:** `tests/technologies-schema.test.ts` → `validates_technology_contract` (accepts the minimal valid fixture; rejects one fixture per rejected cell).

### R4 — Category constant

The system MUST export `TECHNOLOGY_CATEGORIES` from `src/content/technologies-schema.ts` as a readonly tuple with exactly the four mockup labels in order — `Frontend`, `Backend y Nube`, `IA y Sistemas`, `Flujo de Trabajo y Diseño` — and MUST use that constant both as the schema's `category` enum and as the grouping order.

**Verification:** `tests/technologies-schema.test.ts` → `pins_category_order_constant` (asserts the exported value and that the schema field rejects a label outside the tuple).

### R5 — Duplicate id rejection

The system MUST export `assertUniqueTechnologies(technologies)` such that `groupTechnologies` (and therefore the section render) throws an `Error` with the exact message `Duplicate technology id: <id>` when two entries declare the same `id`.

**Verification:** `tests/technologies-schema.test.ts` → `rejects_duplicate_ids`.

### R6 — Grouping helper

The system MUST export `groupTechnologies(technologies)` from `src/content/technologies-schema.ts`, returning one group per **non-empty** category, ordered by `TECHNOLOGY_CATEGORIES`, with new arrays and new objects so the input array is never mutated.

**Verification:** `tests/technologies-schema.test.ts` → `groups_technologies_in_fixed_category_order` and `does_not_mutate_technologies`.

### R7 — Alphabetical order within category

Within each group, `groupTechnologies` MUST order the items ascending by `name` using code-point comparison (`<` / `>`), so the order does not depend on locale or ICU version.

**Verification:** `tests/technologies-schema.test.ts` → `sorts_technologies_alphabetically_within_category`.

### R8 — Build-time validation through the section

WHEN `TechnologiesSection` renders, the system MUST call `groupTechnologies` on the received technologies, so a duplicate `id` aborts the render (and therefore `astro build`) with the explicit error of R5.

**Verification:** `tests/technologies-section.test.ts` → `validates_technologies_at_render_time` (asserts the component frontmatter calls `groupTechnologies(technologies)` and that rendering duplicate-id fixtures rejects with `Duplicate technology id: <id>`).

---

## 2. Seed content

### R9 — Entry files

The system MUST ship exactly 26 technology entries as JSON files in `src/content/technologies/` with the kebab-case file names below; the file names double as the Astro entry ids (the `id` data field is a separate UUID).

| Category                    | Files (`src/content/technologies/`)                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `Frontend`                  | `css3.json`, `framer.json`, `html5.json`, `nextjs.json`, `react.json`, `tailwindcss.json`, `typescript.json`        |
| `Backend y Nube`            | `docker.json`, `go.json`, `nodejs.json`, `postgresql.json`, `python.json`, `redis.json`, `rust.json`, `vercel.json` |
| `IA y Sistemas`             | `claude.json`, `langchain.json`, `ollama.json`, `openai.json`                                                       |
| `Flujo de Trabajo y Diseño` | `figma.json`, `git.json`, `github.json`, `linear.json`, `postman.json`, `raycast.json`, `vscode.json`               |

**Verification:** `tests/technologies-content.test.ts` → `defines_twenty_six_technology_entries`.

### R10 — Seed values

The system MUST declare the 26 seed entries with the exact `id`, `category`, `name` and `iconUrl` values below.

| File               | `id`                                   | `category`                  | `name`          | `iconUrl`                      |
| ------------------ | -------------------------------------- | --------------------------- | --------------- | ------------------------------ |
| `css3.json`        | `6fa13057-c283-4fbe-9094-7142b35f86ac` | `Frontend`                  | `CSS3`          | `/icons/logos/css3.svg`        |
| `framer.json`      | `4d8f1e35-a061-4d9c-be72-5f20913d648a` | `Frontend`                  | `Framer Motion` | `/icons/logos/framer.svg`      |
| `html5.json`       | `5e902f46-b172-4ead-af83-6031a24e759b` | `Frontend`                  | `HTML5`         | `/icons/logos/html5.svg`       |
| `nextjs.json`      | `1a5c8b02-7d3e-4a69-8b4f-2c9d6e0a3157` | `Frontend`                  | `Next.js`       | `/icons/logos/nextjs.svg`      |
| `react.json`       | `0e4b7a91-6c2d-4f58-9a3e-1b7c5d8f2046` | `Frontend`                  | `React`         | `/icons/logos/react.svg`       |
| `tailwindcss.json` | `3c7e0d24-9f50-4c8b-ad61-4e1f802c5379` | `Frontend`                  | `Tailwind CSS`  | `/icons/logos/tailwindcss.svg` |
| `typescript.json`  | `2b6d9c13-8e4f-4b7a-9c50-3d0e7f1b4268` | `Frontend`                  | `TypeScript`    | `/icons/logos/typescript.svg`  |
| `docker.json`      | `d618a7ce-39fa-4a25-a70b-e8b9cad0fd13` | `Backend y Nube`            | `Docker`        | `/icons/logos/docker.svg`      |
| `go.json`          | `81c35279-e4a5-4bd0-b2b6-9364d57ba8ce` | `Backend y Nube`            | `Go`            | `/icons/logos/go.svg`          |
| `nodejs.json`      | `70b24168-d394-4acf-b1a5-8253c46a97bd` | `Backend y Nube`            | `Node.js`       | `/icons/logos/nodejs.svg`      |
| `postgresql.json`  | `b4f685ac-17d8-4e03-85e9-c697a8aedbf1` | `Backend y Nube`            | `PostgreSQL`    | `/icons/logos/postgresql.svg`  |
| `python.json`      | `a3e5749b-06c7-4df2-b4d8-b586f79dcae0` | `Backend y Nube`            | `Python`        | `/icons/logos/python.svg`      |
| `redis.json`       | `c50796bd-28e9-4f14-96fa-d7a8b9bfec02` | `Backend y Nube`            | `Redis`         | `/icons/logos/redis.svg`       |
| `rust.json`        | `92d4638a-f5b6-4ce1-a3c7-a475e68cb9df` | `Backend y Nube`            | `Rust`          | `/icons/logos/rust.svg`        |
| `vercel.json`      | `e729b8df-4a0b-4b36-b81c-f9cadbe10e24` | `Backend y Nube`            | `Vercel`        | `/icons/logos/vercel.svg`      |
| `claude.json`      | `f83ac9e0-5b1c-4c47-992d-0adbecf21f35` | `IA y Sistemas`             | `Claude API`    | `/icons/logos/claude.svg`      |
| `langchain.json`   | `1a5ceb02-7d3e-4e69-9b4f-2cfd0e143b57` | `IA y Sistemas`             | `LangChain`     | `/icons/logos/langchain.svg`   |
| `ollama.json`      | `2b6dfc13-8e4f-4f7a-ac50-3d0e1f254c68` | `IA y Sistemas`             | `Ollama`        | `/icons/logos/ollama.svg`      |
| `openai.json`      | `094bdaf1-6c2d-4d58-8a3e-1becfd032a46` | `IA y Sistemas`             | `OpenAI`        | `/icons/logos/openai.svg`      |
| `figma.json`       | `3c7e0d24-9f50-4a8b-bd61-4e1f20a65d79` | `Flujo de Trabajo y Diseño` | `Figma`         | `/icons/logos/figma.svg`       |
| `git.json`         | `4d8f1e35-a061-4b9c-be72-5f2031b76e8a` | `Flujo de Trabajo y Diseño` | `Git`           | `/icons/logos/git.svg`         |
| `github.json`      | `5e902f46-b172-4cad-bf83-603142c87f9b` | `Flujo de Trabajo y Diseño` | `GitHub`        | `/icons/logos/github.svg`      |
| `linear.json`      | `6fa13057-c283-4dbe-b094-714253d980ac` | `Flujo de Trabajo y Diseño` | `Linear`        | `/icons/logos/linear.svg`      |
| `postman.json`     | `92d4638a-f5b6-40e1-b3c7-a47586a2c3df` | `Flujo de Trabajo y Diseño` | `Postman`       | `/icons/logos/postman.svg`     |
| `raycast.json`     | `81c35279-e4a5-4fd0-a2b6-936475f1b2ce` | `Flujo de Trabajo y Diseño` | `Raycast`       | `/icons/logos/raycast.svg`     |
| `vscode.json`      | `70b24168-d394-4ecf-91a5-825364e0a1bd` | `Flujo de Trabajo y Diseño` | `VS Code`       | `/icons/logos/vscode.svg`      |

**Verification:** `tests/technologies-content.test.ts` → `matches_seed_values` (parses each file, asserts the four values and validates the entry against `technologiesSchema`).

### R11 — Exactly four fields

The system MUST declare exactly the four keys `id`, `category`, `iconUrl` and `name` in every seed JSON file (no extra field; the Astro entry id is derived from the file name and is not part of the JSON).

**Verification:** `tests/technologies-content.test.ts` → `declares_exactly_four_fields` (asserts `Object.keys(data).sort()` equals `['category', 'iconUrl', 'id', 'name']` for all 26 files).

### R12 — Category coverage

The system MUST seed at least one entry for each of the four `TECHNOLOGY_CATEGORIES`.

**Verification:** `tests/technologies-content.test.ts` → `covers_all_categories`.

### R13 — Unique ids across seeds

The system MUST declare 26 unique UUID values across the seed files.

**Verification:** `tests/technologies-content.test.ts` → `keeps_ids_unique` (asserts the 26 UUIDs are pairwise distinct and each passes `technologiesSchema.shape.id.safeParse`).

---

## 3. Icon assets

### R14 — Local icon files

The system MUST provide the 26 SVG logo files in `public/icons/logos/` with the exact kebab-case file names below, so every seed `iconUrl` resolves to a file at the site root (no file outside this list is added).

| File (`public/icons/logos/`) | svgl source (verified 2026-09-30)               |
| ---------------------------- | ----------------------------------------------- |
| `css3.svg`                   | `https://svgl.app/library/css.svg`              |
| `framer.svg`                 | `https://svgl.app/library/framer.svg`           |
| `html5.svg`                  | `https://svgl.app/library/html5.svg`            |
| `nextjs.svg`                 | `https://svgl.app/library/nextjs_icon_dark.svg` |
| `react.svg`                  | `https://svgl.app/library/react_light.svg`      |
| `tailwindcss.svg`            | `https://svgl.app/library/tailwindcss.svg`      |
| `typescript.svg`             | `https://svgl.app/library/typescript.svg`       |
| `docker.svg`                 | `https://svgl.app/library/docker.svg`           |
| `go.svg`                     | `https://svgl.app/library/golang.svg`           |
| `nodejs.svg`                 | `https://svgl.app/library/nodejs.svg`           |
| `postgresql.svg`             | `https://svgl.app/library/postgresql.svg`       |
| `python.svg`                 | `https://svgl.app/library/python.svg`           |
| `redis.svg`                  | `https://svgl.app/library/redis.svg`            |
| `rust.svg`                   | `https://svgl.app/library/rust.svg`             |
| `vercel.svg`                 | `https://svgl.app/library/vercel.svg`           |
| `claude.svg`                 | `https://svgl.app/library/claude-ai-icon.svg`   |
| `langchain.svg`              | `https://svgl.app/library/langchain-logo.svg`   |
| `ollama.svg`                 | `https://svgl.app/library/ollama_light.svg`     |
| `openai.svg`                 | `https://svgl.app/library/openai.svg`           |
| `figma.svg`                  | `https://svgl.app/library/figma.svg`            |
| `git.svg`                    | `https://svgl.app/library/git.svg`              |
| `github.svg`                 | `https://svgl.app/library/github_light.svg`     |
| `linear.svg`                 | `https://svgl.app/library/linear.svg`           |
| `postman.svg`                | `https://svgl.app/library/postman.svg`          |
| `raycast.svg`                | `https://svgl.app/library/raycast.svg`          |
| `vscode.svg`                 | `https://svgl.app/library/vscode.svg`           |

**Verification:** `tests/technologies-content.test.ts` → `provides_local_icon_files` (reads the directory and asserts the exact 26 names, and that every seed `iconUrl` maps to one of them).

### R15 — SVG format

The system MUST author every icon file as an SVG document whose content includes an `<svg` root element.

**Verification:** `tests/technologies-content.test.ts` → `declares_svg_icon_format`.

### R16 — No executable content in icons

The system MUST NOT include a `<script` element inside any icon file.

**Verification:** `tests/technologies-content.test.ts` → `keeps_icons_free_of_scripts`.

### R17 — Icon weight bound

The system MUST keep every icon file at or below 32768 bytes (32 KiB).

**Verification:** `tests/technologies-content.test.ts` → `keeps_icons_within_weight_bound`.

---

## 4. Design tokens

### R18 — Mono font token

The system MUST expose `--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;` in `src/styles/tokens.css` (the mockup's `font-mono` used by the quote badge).

**Verification:** `tests/technologies-section.test.ts` → `exposes_font_mono_token` (asserts the exact declaration and that it is declared once).

---

## 5. Technologies section UI

### R19 — Placement, anchor and scroll offset

WHEN the home page is requested, the system MUST render the technologies section immediately after the projects section as `<section class="tech-stack animate-fade-in-up animation-delay-200" id="tech-stack">` with `scroll-margin-top: 6rem`, inside the existing `main.site-main` container.

**Verification:** `tests/technologies-section.test.ts` → `renders_tech_stack_section_after_projects` (renders the page with fixtures; asserts `id="projects"` precedes `id="tech-stack"`, the exact section class string and the `scroll-margin-top` declaration).

### R20 — Section shell geometry

The system MUST lay out the section shell with the exact geometry below.

| Element              | Declarations                                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.tech-stack`        | `padding-block: 6rem`; `border-bottom: 1px solid rgba(199, 210, 254, 0.35)`                                                                        |
| `.tech-stack__inner` | `display: flex; flex-direction: column; gap: 3rem`                                                                                                 |
| `.tech-stack__grid`  | `display: grid; gap: 1.5rem; grid-template-columns: minmax(0, 1fr)`; `repeat(2, minmax(0, 1fr))` at ≥768px; `repeat(4, minmax(0, 1fr))` at ≥1024px |

**Verification:** `tests/technologies-section.test.ts` → `styles_section_geometry`.

### R21 — Global entrance animation reuse

The system MUST reuse the existing global entrance utilities (`animate-fade-in-up`, `animation-delay-200`) on the section and MUST NOT define new `@keyframes` in the section styles; the global `prefers-reduced-motion` override of `src/styles/global.css` remains the only motion-reduction path.

**Verification:** `tests/technologies-section.test.ts` → `reuses_global_entry_animation` (static source assertions; the reduced-motion block itself is covered by the existing `tests/global-styles.test.ts` → `honors_reduced_motion`).

### R22 — Header structure and texts

The system MUST render the section header with the exact structure and texts below: a label row (label span + 3rem rule), an `<h2>` whose accent fragment carries the word `clave`, and the subtitle `<p>`.

| Element        | Text / structure (verbatim)                                                           |
| -------------- | ------------------------------------------------------------------------------------- |
| Label span     | `Stack Tecnológico`                                                                   |
| `<h2>`         | `Tecnologías y herramientas ` + `<span class="tech-stack__title-accent">clave</span>` |
| Subtitle `<p>` | `Stack moderno optimizado para velocidad, mantenibilidad y escalabilidad.`            |

**Verification:** `tests/technologies-section.test.ts` → `renders_section_header`.

### R23 — Label styles

The system MUST style `.tech-stack__label` with the exact declarations below.

| Declaration      | Value                              |
| ---------------- | ---------------------------------- |
| `font-family`    | `var(--font-body)`                 |
| `font-size`      | `var(--text-label-sm-size)`        |
| `line-height`    | `var(--text-label-sm-line-height)` |
| `font-weight`    | `500`                              |
| `letter-spacing` | `0.18em`                           |
| `text-transform` | `uppercase`                        |
| `color`          | `var(--color-primary)`             |

**Verification:** `tests/technologies-section.test.ts` → `styles_section_label`.

### R24 — Label rule styles

The system MUST style `.tech-stack__label-rule` as a block with `height: 1px`, `width: 3rem` and `background-color: rgba(53, 37, 205, 0.4)`.

**Verification:** `tests/technologies-section.test.ts` → `styles_section_label_rule`.

### R25 — Title and accent styles

The system MUST style `.tech-stack__title` with the `headline-lg` tokens (`font-family: var(--font-headline)`, `font-size: var(--text-headline-lg-size)`, `line-height: var(--text-headline-lg-line-height)`, `font-weight: var(--text-headline-lg-weight)`, `letter-spacing: -0.025em`, `color: var(--color-slate-900)`) and `.tech-stack__title-accent` with `font-family: var(--font-headline)`, `font-style: italic`, `font-weight: 300`, `color: var(--color-primary)`.

**Verification:** `tests/technologies-section.test.ts` → `styles_section_title`.

### R26 — Subtitle styles

The system MUST style `.tech-stack__subtitle` with the exact declarations below.

| Declaration      | Value                                |
| ---------------- | ------------------------------------ |
| `font-family`    | `var(--font-body)`                   |
| `font-weight`    | `300`                                |
| `font-size`      | `var(--text-body-md-size)`           |
| `line-height`    | `1.625`                              |
| `letter-spacing` | `var(--text-body-md-letter-spacing)` |
| `color`          | `var(--color-slate-600)`             |
| `max-width`      | `28rem`                              |

**Verification:** `tests/technologies-section.test.ts` → `styles_section_subtitle`.

### R27 — Header responsive geometry

The system MUST lay out `.tech-stack__header` as a column with `justify-content: space-between` and `gap: 1.5rem`, switching at viewports ≥768px to `flex-direction: row` with `align-items: flex-end`; `.tech-stack__heading` MUST be a column with `gap: 0.75rem` and `.tech-stack__eyebrow` a row with `align-items: center` and `gap: 0.75rem`.

**Verification:** `tests/technologies-section.test.ts` → `styles_section_header_geometry`.

### R28 — Category cards and chip order

The system MUST render one `.tech-stack__category` card per non-empty category, in `TECHNOLOGY_CATEGORIES` order, each card containing a `<h3 class="tech-stack__category-title">` with the category label, one decorative category icon, and a `.tech-stack__items` list whose entries follow the R7 alphabetical order.

**Verification:** `tests/technologies-section.test.ts` → `renders_category_cards_in_fixed_order` (renders scrambled fixtures; asserts card order, `<h3>` labels and item order inside a category).

### R29 — Category card glass box

The system MUST style `.tech-stack__category` with the exact declarations below.

| Declaration                                   | Value                                    |
| --------------------------------------------- | ---------------------------------------- |
| `display` / `flex-direction` / `gap`          | `flex` / `column` / `1.25rem`            |
| `padding`                                     | `1.5rem`                                 |
| `border-radius`                               | `var(--radius-2xl)`                      |
| `background-color`                            | `rgba(255, 255, 255, 0.4)`               |
| `-webkit-backdrop-filter` / `backdrop-filter` | `blur(16px)`                             |
| `border`                                      | `1px solid rgba(255, 255, 255, 0.6)`     |
| `transition`                                  | `all 0.3s cubic-bezier(0.16, 1, 0.3, 1)` |

**Verification:** `tests/technologies-section.test.ts` → `styles_category_cards`.

### R30 — Category card hover

The system MUST apply the design's `glass-card-hover` behaviour to `.tech-stack__category` with the exact declarations below.

| State                    | Declarations                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------- |
| Hover `background-color` | `rgba(255, 255, 255, 0.62)`                                                        |
| Hover `border-color`     | `rgba(129, 140, 248, 0.55)`                                                        |
| Hover `box-shadow`       | `0 20px 42px -8px rgba(79, 70, 229, 0.14), 0 0 24px -2px rgba(99, 102, 241, 0.16)` |
| Hover `transform`        | `translateY(-3px)`                                                                 |

**Verification:** `tests/technologies-section.test.ts` → `styles_category_hover`.

### R31 — Category header styles

The system MUST style `.tech-stack__category-header` with `display: flex`, `align-items: center`, `gap: 0.625rem` and `color: var(--color-slate-900)`; `.tech-stack__category-title` with the `headline-sm` tokens (`font-family: var(--font-headline)`, `font-size: var(--text-headline-sm-size)`, `line-height: var(--text-headline-sm-line-height)`, `letter-spacing: var(--text-headline-sm-letter-spacing)`, `font-weight: var(--text-headline-sm-weight)`); and `.tech-stack__category-icon` with `width: 22px`, `height: 22px`, `flex-shrink: 0` and `color: var(--color-primary)`.

**Verification:** `tests/technologies-section.test.ts` → `styles_category_headers`.

### R32 — Category icon rendering

The system MUST render each category icon as a decorative inline SVG (`aria-hidden="true"`, `viewBox="0 -960 960 960"`, `width="22"`, `height="22"`, `fill="currentColor"`, class `tech-stack__category-icon`) with the exact Material Symbols path data below and no icon font.

| Category                                 | Path data                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Frontend` (`layers`)                    | `M480-118 120-398l66-50 294 228 294-228 66 50-360 280Zm0-202L120-600l360-280 360 280-360 280Zm0-280Zm0 178 230-178-230-178-230 178 230 178Z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `Backend y Nube` (`dns`)                 | `M300-720q-25 0-42.5 17.5T240-660q0 25 17.5 42.5T300-600q25 0 42.5-17.5T360-660q0-25-17.5-42.5T300-720Zm0 400q-25 0-42.5 17.5T240-260q0 25 17.5 42.5T300-200q25 0 42.5-17.5T360-260q0-25-17.5-42.5T300-320ZM160-840h640q17 0 28.5 11.5T840-800v280q0 17-11.5 28.5T800-480H160q-17 0-28.5-11.5T120-520v-280q0-17 11.5-28.5T160-840Zm40 80v200h560v-200H200Zm-40 320h640q17 0 28.5 11.5T840-400v280q0 17-11.5 28.5T800-80H160q-17 0-28.5-11.5T120-120v-280q0-17 11.5-28.5T160-440Zm40 80v200h560v-200H200Zm0-400v200-200Zm0 400v200-200Z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `IA y Sistemas` (`neurology`)            | `M390-120q-51 0-88-35.5T260-241q-60-8-100-53t-40-106q0-21 5.5-41.5T142-480q-11-18-16.5-38t-5.5-42q0-61 40-105.5t99-52.5q3-51 41-86.5t90-35.5q26 0 48.5 10t41.5 27q18-17 41-27t49-10q52 0 89.5 35t40.5 86q59 8 99.5 53T840-560q0 22-5.5 42T818-480q11 18 16.5 38.5T840-400q0 62-40.5 106.5T699-241q-5 50-41.5 85.5T570-120q-25 0-48.5-9.5T480-156q-19 17-42 26.5t-48 9.5Zm130-590v460q0 21 14.5 35.5T570-200q20 0 34.5-16t15.5-36q-21-8-38.5-21.5T550-306q-10-14-7.5-30t16.5-26q14-10 30-7.5t26 16.5q11 16 28 24.5t37 8.5q33 0 56.5-23.5T760-400q0-5-.5-10t-2.5-10q-17 10-36.5 15t-40.5 5q-17 0-28.5-11.5T640-440q0-17 11.5-28.5T680-480q33 0 56.5-23.5T760-560q0-33-23.5-56T680-640q-11 18-28.5 31.5T613-587q-16 6-31-1t-20-23q-5-16 1.5-31t22.5-20q15-5 24.5-18t9.5-30q0-21-14.5-35.5T570-760q-21 0-35.5 14.5T520-710Zm-80 460v-460q0-21-14.5-35.5T390-760q-21 0-35.5 14.5T340-710q0 16 9 29.5t24 18.5q16 5 23 20t2 31q-6 16-21 23t-31 1q-21-8-38.5-21.5T279-640q-32 1-55.5 24.5T200-560q0 33 23.5 56.5T280-480q17 0 28.5 11.5T320-440q0 17-11.5 28.5T280-400q-21 0-40.5-5T203-420q-2 5-2.5 10t-.5 10q0 33 23.5 56.5T280-320q20 0 37-8.5t28-24.5q10-14 26-16.5t30 7.5q14 10 16.5 26t-7.5 30q-14 19-32 33t-39 22q1 20 16 35.5t35 15.5q21 0 35.5-14.5T440-250Zm40-230Z` |
| `Flujo de Trabajo y Diseño` (`terminal`) | `M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H160v400Zm140-40-56-56 103-104-104-104 57-56 160 160-160 160Zm180 0v-80h240v80H480Z`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

**Verification:** `tests/technologies-section.test.ts` → `renders_category_icons`.

### R33 — Chip list and chip styles

The system MUST style the chip list and chips with the exact declarations below.

| Element              | Declarations                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.tech-stack__items` | `display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0; padding: 0; list-style: none`                                                                                                                                                                                                                                                                                                             |
| `.tech-stack__item`  | `display: inline-flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; border-radius: var(--radius-xl); background-color: rgba(255, 255, 255, 0.6); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.8); color: var(--color-slate-800); cursor: default; transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `.tech-stack__icon`  | `display: block; width: 20px; height: 20px; flex-shrink: 0; object-fit: contain`                                                                                                                                                                                                                                                                                                                   |

**Verification:** `tests/technologies-section.test.ts` → `styles_technology_items`.

### R34 — Chip hover

The system MUST style the chip hover state with the exact declarations below.

| State                     | Declarations                                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.tech-stack__item:hover` | `border-color: rgba(53, 37, 205, 0.5)`; `background-color: rgba(255, 255, 255, 0.9)`; `transform: scale(1.1)`; `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)` |

**Verification:** `tests/technologies-section.test.ts` → `styles_technology_item_hover`.

### R35 — Informative chip icon rendering

The system MUST render each technology icon as `<img class="tech-stack__icon" src={technology.iconUrl} alt={technology.name} width="20" height="20" loading="lazy" />` inside an `<li class="tech-stack__item" title={technology.name}>`.

**Verification:** `tests/technologies-section.test.ts` → `renders_technology_icons`.

### R36 — Quote bar structure and texts

The system MUST render the closing quote bar with a decorative inline SVG, the quote text and the badge with the exact texts below.

| Element                                | Text / structure (verbatim)                                           |
| -------------------------------------- | --------------------------------------------------------------------- |
| Quote text (`.tech-stack__quote-text`) | `“Código limpio, arquitectura escalable y rendimiento sin fricción.”` |
| Badge (`.tech-stack__badge`)           | `Filosofía Técnica`                                                   |

**Verification:** `tests/technologies-section.test.ts` → `renders_quote_bar`.

### R37 — Quote bar styles

The system MUST style the quote bar with the exact declarations below.

| Element                        | Declarations                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.tech-stack__quote`           | `display: flex; flex-direction: column; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 1.5rem; border-radius: var(--radius-2xl); background-color: rgba(99, 102, 241, 0.1); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); border: 1px solid rgba(199, 210, 254, 0.5); box-shadow: 0 8px 30px rgba(79, 70, 229, 0.05); transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1)` |
| `.tech-stack__quote` at ≥640px | `flex-direction: row; align-items: center`                                                                                                                                                                                                                                                                                                                                                                                  |
| `.tech-stack__quote:hover`     | `border-color: rgba(165, 180, 252, 0.8)`; `box-shadow: 0 12px 36px rgba(79, 70, 229, 0.08)`                                                                                                                                                                                                                                                                                                                                 |
| `.tech-stack__quote-main`      | `display: flex; align-items: center; gap: 0.875rem`                                                                                                                                                                                                                                                                                                                                                                         |
| `.tech-stack__quote-icon`      | `width: 24px; height: 24px; flex-shrink: 0; color: var(--color-primary)`                                                                                                                                                                                                                                                                                                                                                    |

**Verification:** `tests/technologies-section.test.ts` → `styles_quote_bar`.

### R38 — Quote text styles

The system MUST style `.tech-stack__quote-text` with the `headline-sm` tokens (`font-family: var(--font-headline)`, `font-size: var(--text-headline-sm-size)`, `line-height: var(--text-headline-sm-line-height)`, `letter-spacing: var(--text-headline-sm-letter-spacing)`, `font-weight: var(--text-headline-sm-weight)`), `font-style: italic` and `color: var(--color-primary)`.

**Verification:** `tests/technologies-section.test.ts` → `styles_quote_text`.

### R39 — Quote icon rendering

The system MUST render the quote icon as a decorative inline SVG (`aria-hidden="true"`, `viewBox="0 -960 960 960"`, `width="24"`, `height="24"`, `fill="currentColor"`, class `tech-stack__quote-icon`) with the exact Material Symbols `verified_user` path data below.

| Icon            | Path data                                                                                                                                                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verified_user` | `m438-338 226-226-57-57-169 169-84-84-57 57 141 141Zm42 258q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-84q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Zm0-316Z` |

**Verification:** `tests/technologies-section.test.ts` → `renders_quote_icon`.

### R40 — Quote badge styles

The system MUST style `.tech-stack__badge` with the exact declarations below.

| Declaration                                   | Value                                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `font-family`                                 | `var(--font-mono)`                                                                               |
| `font-size` / `line-height` / `font-weight`   | `var(--text-label-sm-size)` / `var(--text-label-sm-line-height)` / `var(--text-label-sm-weight)` |
| `letter-spacing` / `text-transform`           | `0.16em` / `uppercase`                                                                           |
| `white-space`                                 | `nowrap`                                                                                         |
| `color`                                       | `var(--color-primary)`                                                                           |
| `background-color` / `border`                 | `rgba(53, 37, 205, 0.1)` / `1px solid rgba(53, 37, 205, 0.25)`                                   |
| `padding` / `border-radius`                   | `0.375rem 0.875rem` / `var(--radius-full)`                                                       |
| `-webkit-backdrop-filter` / `backdrop-filter` | `blur(12px)`                                                                                     |

**Verification:** `tests/technologies-section.test.ts` → `styles_quote_badge`.

### R41 — Zero client JavaScript

The system MUST add no client-side script, no hydrated island (`client:*`) and no inline event-handler attribute in the technologies section; the page keeps exactly one bundled script, the existing clipboard enhancement.

**Verification:** `tests/technologies-section.test.ts` → `ships_no_client_javascript` (static scans) and the updated `tests/index.test.ts` → `ships_only_clipboard_enhancement` (page-wide scan extended to the new component).

### R42 — Single section heading

The system MUST use exactly one `<h2>` as the technologies section heading and MUST NOT render any `<h1>` inside the section; the category titles are `<h3>` elements and the home page keeps its single `<h1>` (hero).

**Verification:** `tests/technologies-section.test.ts` → `renders_single_h2` and `tests/index.test.ts` → `renders_exactly_one_h1` (existing).

---

## 6. Page wiring

### R43 — Home page loads the collection

WHEN the home page is built, the system MUST read the `technologies` collection with `getCollection('technologies')` in `src/pages/index.astro`, map each entry to its `data`, and pass the array to `<TechnologiesSection technologies={technologies} />` rendered immediately after `<ProjectsSection projects={projects} />`.

**Verification:** `tests/technologies-section.test.ts` → `loads_technology_collection_in_index` (asserts the page source wiring and that the rendered page includes the section with fixture data; rendered through the collection-aware `vi.mock('astro:content')` pattern of `design.md` §11).

### R44 — Page invariants preserved

WHEN the home page renders, the system MUST keep exactly one `<h1>` and exactly one bundled script (the clipboard enhancement), with the technologies section adding neither.

**Verification:** `tests/index.test.ts` → `renders_exactly_one_h1` and `ships_only_clipboard_enhancement` (updated to scan `TechnologiesSection.astro`).

---

## Traceability

| Requirement | Test file                                                   | Test name                                                                     |
| ----------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------- |
| R1          | `tests/technologies-schema.test.ts`                         | `declares_collection_configuration`                                           |
| R2          | `tests/technologies-schema.test.ts`                         | `keeps_schema_module_free_of_astro_virtual_modules`                           |
| R3          | `tests/technologies-schema.test.ts`                         | `validates_technology_contract`                                               |
| R4          | `tests/technologies-schema.test.ts`                         | `pins_category_order_constant`                                                |
| R5          | `tests/technologies-schema.test.ts`                         | `rejects_duplicate_ids`                                                       |
| R6          | `tests/technologies-schema.test.ts`                         | `groups_technologies_in_fixed_category_order`, `does_not_mutate_technologies` |
| R7          | `tests/technologies-schema.test.ts`                         | `sorts_technologies_alphabetically_within_category`                           |
| R8          | `tests/technologies-section.test.ts`                        | `validates_technologies_at_render_time`                                       |
| R9          | `tests/technologies-content.test.ts`                        | `defines_twenty_six_technology_entries`                                       |
| R10         | `tests/technologies-content.test.ts`                        | `matches_seed_values`                                                         |
| R11         | `tests/technologies-content.test.ts`                        | `declares_exactly_four_fields`                                                |
| R12         | `tests/technologies-content.test.ts`                        | `covers_all_categories`                                                       |
| R13         | `tests/technologies-content.test.ts`                        | `keeps_ids_unique`                                                            |
| R14         | `tests/technologies-content.test.ts`                        | `provides_local_icon_files`                                                   |
| R15         | `tests/technologies-content.test.ts`                        | `declares_svg_icon_format`                                                    |
| R16         | `tests/technologies-content.test.ts`                        | `keeps_icons_free_of_scripts`                                                 |
| R17         | `tests/technologies-content.test.ts`                        | `keeps_icons_within_weight_bound`                                             |
| R18         | `tests/technologies-section.test.ts`                        | `exposes_font_mono_token`                                                     |
| R19         | `tests/technologies-section.test.ts`                        | `renders_tech_stack_section_after_projects`                                   |
| R20         | `tests/technologies-section.test.ts`                        | `styles_section_geometry`                                                     |
| R21         | `tests/technologies-section.test.ts`                        | `reuses_global_entry_animation`                                               |
| R22         | `tests/technologies-section.test.ts`                        | `renders_section_header`                                                      |
| R23         | `tests/technologies-section.test.ts`                        | `styles_section_label`                                                        |
| R24         | `tests/technologies-section.test.ts`                        | `styles_section_label_rule`                                                   |
| R25         | `tests/technologies-section.test.ts`                        | `styles_section_title`                                                        |
| R26         | `tests/technologies-section.test.ts`                        | `styles_section_subtitle`                                                     |
| R27         | `tests/technologies-section.test.ts`                        | `styles_section_header_geometry`                                              |
| R28         | `tests/technologies-section.test.ts`                        | `renders_category_cards_in_fixed_order`                                       |
| R29         | `tests/technologies-section.test.ts`                        | `styles_category_cards`                                                       |
| R30         | `tests/technologies-section.test.ts`                        | `styles_category_hover`                                                       |
| R31         | `tests/technologies-section.test.ts`                        | `styles_category_headers`                                                     |
| R32         | `tests/technologies-section.test.ts`                        | `renders_category_icons`                                                      |
| R33         | `tests/technologies-section.test.ts`                        | `styles_technology_items`                                                     |
| R34         | `tests/technologies-section.test.ts`                        | `styles_technology_item_hover`                                                |
| R35         | `tests/technologies-section.test.ts`                        | `renders_technology_icons`                                                    |
| R36         | `tests/technologies-section.test.ts`                        | `renders_quote_bar`                                                           |
| R37         | `tests/technologies-section.test.ts`                        | `styles_quote_bar`                                                            |
| R38         | `tests/technologies-section.test.ts`                        | `styles_quote_text`                                                           |
| R39         | `tests/technologies-section.test.ts`                        | `renders_quote_icon`                                                          |
| R40         | `tests/technologies-section.test.ts`                        | `styles_quote_badge`                                                          |
| R41         | `tests/technologies-section.test.ts`, `tests/index.test.ts` | `ships_no_client_javascript`, `ships_only_clipboard_enhancement`              |
| R42         | `tests/technologies-section.test.ts`, `tests/index.test.ts` | `renders_single_h2`, `renders_exactly_one_h1`                                 |
| R43         | `tests/technologies-section.test.ts`                        | `loads_technology_collection_in_index`                                        |
| R44         | `tests/index.test.ts`                                       | `renders_exactly_one_h1`, `ships_only_clipboard_enhancement`                  |

## Feature description coverage

| Feature description item (id 5)                                                                                                   | Requirements                |
| --------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Tech stack section on the home page with anchor `id="tech-stack"`                                                                 | R19–R22, R28                |
| Zod-validated JSON content collection `technologies` with exactly the fields `id`, `category`, `iconUrl`, `name`                  | R1–R13                      |
| svgl SVG logos vendored in `public/icons/logos/` and referenced by local root-relative `iconUrl` paths (no runtime fetch, no CDN) | R3, R14–R17, R35            |
| Mockup's tech-stack bento glass section including its four categories, chips and closing quote                                    | R23–R40                     |
| Excludes nav, about/contact sections, footer, WebGL shader and client-side JavaScript                                             | Out of scope list, R41, R44 |

## Amendments

### 2026-09-30 — Closing quote bar removed from the updated design (R36–R40 withdrawn)

On 2026-09-30 the updated Stitch design (project `12622281097258900550`, screen `bc9f65e63899496ab5f86a38e6ae93d8`) removed the closing quote bar that sat below the technologies grid, so the frontend was synced to that source of truth:

- **R36–R40 are withdrawn.** Their markup, the `QUOTE_ICON_PATH` constant and every scoped quote/badge style were deleted from `src/components/TechnologiesSection.astro`, and the five verifying tests (`renders_quote_bar`, `styles_quote_bar`, `styles_quote_text`, `renders_quote_icon`, `styles_quote_badge`) were deleted from `tests/technologies-section.test.ts`. No empty bar, leftover comment or orphan selector remains.
- **Tasks 6.4 and 6.5 are superseded** (quote bar rendering and its scoped styles); **the quote mentions in tasks 9.4 and 9.5 are superseded** as well. All four stay marked `[x]` as historical record of the original increment.
- **The "closing quote" item in the id-5 "Feature description coverage" table is superseded.**
- **Everything else in this spec is unchanged:** no requirement is renumbered, and R1–R35 and R41–R44 keep their stated coverage.
- **`--font-mono` (R18) stays** in `src/styles/tokens.css` as a global token even though its only consumer (the quote badge) is gone; its test (`exposes_font_mono_token`) is kept.
