# Requirements — projects-section

- **Feature:** `projects-section` (id 3, `sdd: true`).
- **Source of truth:** `specs/projects-section/references/projects-section.html` (projects section: lines 298–504; glass utilities and animation: lines 5–33) and its digest `progress/research_projects_section.md`.
- **Human decision (2026-09-28):** covers are **real raster pixel images**. The mockup's hand-made terminal panels (and any hand-made SVG cover) are not acceptable for the section's covers; covers go through Astro's image pipeline with the schema-context `image()` helper and `<Image>`.
- **In scope:** the `projects` content collection (glob loader + Zod schema factory + pure sort/uniqueness helpers), the four seed Markdown entries, the four raster WebP placeholder covers co-located with the content, `sharp` as the image service, one new palette token, the `#projects` section on the home page (header, featured wide card, responsive grid), the page wiring and the tests tracing every `R<n>`.
- **Out of scope (future increments):** nav/header, tech-stack / about / contact sections, footer, WebGL shader, project detail pages, Markdown body rendering, i18n, external systems, real cover art, analytics, the mockup's terminal-preview chrome, status pills and version badges.

**Notation.** Every requirement uses EARS and contains exactly one `MUST` / `MUST NOT`. Ids `R<n>` are stable. "The design reference" means the mockup HTML above plus its digest. Values in tables are the **effective computed values** of the design, after Tailwind utility translation (the same convention as `specs/hero-section/requirements.md`). Every requirement is verified by at least one concrete Vitest test (see `Traceability` at the end).

---

## 1. Content collection and schema

### R1 — Collection configuration

The system MUST define the `projects` collection in `src/content.config.ts` with `defineCollection` (from `astro:content`), the `glob` loader (from `astro/loaders`) configured with `base: './src/content/projects'` and `pattern: '**/*.md'`, and `schema: ({ image }) => buildProjectsSchema({ image })` where `buildProjectsSchema` is imported from `src/content/projects-schema.ts`, exported as `collections = { projects }`.

**Verification:** `tests/projects-schema.test.ts` → `declares_collection_configuration` (reads `src/content.config.ts`).

### R2 — Schema module boundary and factory

The system MUST export the schema from `src/content/projects-schema.ts` as the dependency-injected factory `buildProjectsSchema({ image })` — with the structural parameter `image: () => z.ZodType` — whose module imports only `astro/zod` plus type-only imports from `astro`, never the virtual modules `astro:content`, `astro:loaders` or `astro:assets`, so Vitest can import it and stub `image` with `() => z.string()`.

**Verification:** `tests/projects-schema.test.ts` → `keeps_schema_module_free_of_astro_virtual_modules` (imports the module in Vitest, builds a schema with the string stub and asserts the source imports).

### R3 — Schema field contract

The system MUST build a Zod object (via `buildProjectsSchema`) that accepts and rejects the frontmatter contract below (Zod 4 through `astro/zod`).

| Field          | Validator                           | Accepted                                                                       | Rejected                |
| -------------- | ----------------------------------- | ------------------------------------------------------------------------------ | ----------------------- |
| `id`           | `z.uuid()`                          | RFC 4122 UUID                                                                  | `'not-a-uuid'`, missing |
| `title`        | `z.string()`                        | any string                                                                     | missing, number         |
| `description`  | `z.string()`                        | any string                                                                     | missing, number         |
| `technologies` | `z.array(z.string()).min(1)`        | `['Go', 'Rust']`                                                               | `[]`, missing           |
| `coverPath`    | injected `image()` (schema context) | entry-relative path, e.g. `./covers/synapse.webp`, resolved to `ImageMetadata` | missing path            |
| `coverAlt`     | `z.string()`                        | any string                                                                     | missing                 |
| `websiteUrl`   | `z.url()`                           | `https://example.com`                                                          | `'not-a-url'`, missing  |
| `githubUrl`    | `z.url().optional()`                | valid URL or absent                                                            | `'not-a-url'`           |
| `priority`     | `z.number()`                        | `1`                                                                            | `'1'`, missing          |
| `featured`     | `z.boolean().default(false)`        | `true` / `false` / absent                                                      | `'true'`                |

**Verification:** `tests/projects-schema.test.ts` → `validates_project_frontmatter_contract` (injects the `() => z.string()` stub; accepts a minimal valid fixture without `githubUrl`/`featured`; rejects one fixture per rejected cell). The real file resolution of `coverPath` into `ImageMetadata` is exercised by the build (see `tasks.md` 12.4) and by `declares_collection_configuration`.

### R4 — Featured default

WHEN `featured` is absent from an entry's frontmatter, the system MUST resolve it to `false` through the schema.

**Verification:** `tests/projects-schema.test.ts` → `defaults_featured_to_false`.

### R5 — Priority sorting helper

The system MUST export `sortProjects(projects)` from `src/content/projects-schema.ts`, returning a new array ordered by ascending `priority` (lower value first) without mutating the input array.

**Verification:** `tests/projects-schema.test.ts` → `sorts_projects_by_priority` (fixtures in `[3, 1, 2]` order; asserts the returned titles are `[1, 2, 3]` and the input order is unchanged).

### R6 — Duplicate priority rejection

The system MUST export `assertUniqueProjects(projects)` such that `sortProjects` throws an `Error` with the exact message `Duplicate project priority: <priority>` when two projects declare the same `priority`.

**Verification:** `tests/projects-schema.test.ts` → `rejects_duplicate_priorities`.

### R7 — Duplicate id rejection

The system MUST make `assertUniqueProjects(projects)` (and therefore `sortProjects`) throw an `Error` with the exact message `Duplicate project id: <id>` when two projects declare the same frontmatter `id`.

**Verification:** `tests/projects-schema.test.ts` → `rejects_duplicate_ids`.

### R8 — Build-time validation through the section

WHEN `ProjectsSection` renders, the system MUST call `sortProjects` on the received projects, so a duplicate `priority` or `id` aborts the render (and therefore `astro build`) with the explicit error of R6/R7.

**Verification:** `tests/projects-section.test.ts` → `validates_projects_at_render_time` (asserts the component frontmatter calls `sortProjects(projects)` and that rendering duplicate-priority fixtures rejects with `Duplicate project priority: 1`).

---

## 2. Seed content

### R9 — Entry files and slugs

The system MUST ship exactly four project entries in `src/content/projects/` with the kebab-case English file names of the table below; the file names double as the Astro entry slugs.

| File               | Title           |
| ------------------ | --------------- |
| `synapse.md`       | `Synapse`       |
| `aether-cloud.md`  | `Aether Cloud`  |
| `kortex-editor.md` | `Kortex Editor` |
| `vanguard-cli.md`  | `Vanguard CLI`  |

**Verification:** `tests/projects-content.test.ts` → `defines_four_project_entries`.

### R10 — Seed frontmatter values

The system MUST declare the four seed entries with the frontmatter values below (description and technologies verbatim from the mockup; `coverPath` is an entry-relative path resolved by the schema-context `image()`; `featured` absent for the three non-featured entries so R4 applies).

| File               | `id`                                   | `title`         | `description` (verbatim)                                                               | `technologies` (in order)                                  | `coverPath`                   | `coverAlt`                                         | `websiteUrl`          | `githubUrl`          | `priority` | `featured` |
| ------------------ | -------------------------------------- | --------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------- | -------------------------------------------------- | --------------------- | -------------------- | ---------- | ---------- |
| `synapse.md`       | `6f9c1c1e-4a7b-4a3e-9d2f-1f5c8a2b7e10` | `Synapse`       | `Copiloto IA para desarrolladores con análisis semántico de Git y AST en tiempo real.` | Next.js, TypeScript, Tailwind, Claude API, Tree-sitter AST | `./covers/synapse.webp`       | `Portada de Synapse: degradado índigo.`            | `https://example.com` | `https://github.com` | `1`        | `true`     |
| `aether-cloud.md`  | `2b8f0d4a-9c31-4f6e-8a75-3d9e0b6c1a24` | `Aether Cloud`  | `Sincronización de estado en tiempo real en el edge con latencia global < 10ms.`       | Go, Rust, WebSockets, Redis                                | `./covers/aether-cloud.webp`  | `Portada de Aether Cloud: degradado azul.`         | `https://example.com` | absent (see R11)     | `2`        | absent     |
| `kortex-editor.md` | `c4a3e5b2-7d19-4b8c-a1f6-5e2d9087c431` | `Kortex Editor` | `Editor colaborativo local-first impulsado por CRDTs y WebAssembly.`                   | React, Wasm, CRDTs, Canvas                                 | `./covers/kortex-editor.webp` | `Portada de Kortex Editor: degradado violeta.`     | `https://example.com` | `https://github.com` | `3`        | absent     |
| `vanguard-cli.md`  | `9d7b2e64-3c85-4a1f-b6e9-7f0c4a8d5b2e` | `Vanguard CLI`  | `Herramienta CLI para auditorías de código y análisis de PRs con embeddings locales.`  | Node.js, Rust CLI, Embeddings, Actions                     | `./covers/vanguard-cli.webp`  | `Portada de Vanguard CLI: degradado índigo claro.` | `https://example.com` | `https://github.com` | `4`        | absent     |

**Verification:** `tests/projects-content.test.ts` → `matches_seed_frontmatter` (with `getCollection` when the content layer is available under Vitest, otherwise filesystem assertions — see `design.md` §11).

### R11 — Optional `githubUrl` exercised by a seed

The system MUST omit `githubUrl` from `src/content/projects/aether-cloud.md` so the optional path is exercised by real content.

**Verification:** `tests/projects-content.test.ts` → `omits_github_url_for_aether_cloud`.

### R12 — Seed bodies

The system MUST give every seed entry a non-empty Markdown body after its frontmatter (body rendering is future scope; the paragraph only documents the project).

**Verification:** `tests/projects-content.test.ts` → `includes_seed_bodies`.

---

## 3. Cover assets and image pipeline

### R13 — Raster cover files

The system MUST provide the four placeholder cover assets in `src/content/projects/covers/` with the raster WebP file names below, co-located with the entries so the schema-context `image()` resolves them.

| File                                             | Seed entry         |
| ------------------------------------------------ | ------------------ |
| `src/content/projects/covers/synapse.webp`       | `synapse.md`       |
| `src/content/projects/covers/aether-cloud.webp`  | `aether-cloud.md`  |
| `src/content/projects/covers/kortex-editor.webp` | `kortex-editor.md` |
| `src/content/projects/covers/vanguard-cli.webp`  | `vanguard-cli.md`  |

**Verification:** `tests/projects-content.test.ts` → `provides_raster_cover_files`.

### R14 — Raster WebP format

The system MUST author each cover as a raster WebP file whose first four bytes are `RIFF` and whose bytes 8–11 are `WEBP`.

**Verification:** `tests/projects-content.test.ts` → `declares_cover_webp_format` (reads each file as latin1 and asserts the magic bytes).

### R15 — Cover weight bound

The system MUST keep every cover file at or below 262144 bytes (256 KiB).

**Verification:** `tests/projects-content.test.ts` → `keeps_covers_within_weight_bound`.

### R16 — Image service dependency

The system MUST declare `sharp` in the `dependencies` section of `package.json` as the image service that powers Astro's image pipeline (build-time optimization and validation of the user-provided pixel covers).

**Verification:** `tests/projects-content.test.ts` → `declares_image_service_dependency`.

---

## 4. Design tokens

### R17 — Slate 600 palette token

The system MUST expose `--color-slate-600: #475569` in `src/styles/tokens.css` (the mockup's `text-slate-600`, not yet part of the palette tokens).

**Verification:** `tests/projects-section.test.ts` → `exposes_slate_600_token`.

---

## 5. Projects section UI

### R18 — Placement, anchor and scroll offset

WHEN the home page is requested, the system MUST render the projects section immediately after the hero as `<section class="projects animate-fade-in-up animation-delay-100" id="projects">` with `scroll-margin-top: 6rem`, inside the existing `main.site-main` container.

**Verification:** `tests/projects-section.test.ts` → `renders_projects_section_after_hero`.

### R19 — Section shell geometry

The system MUST lay out the section shell with the exact geometry below.

| Element            | Declarations                                                                |
| ------------------ | --------------------------------------------------------------------------- |
| `.projects`        | `padding-block: 6rem`; `border-bottom: 1px solid rgba(199, 210, 254, 0.35)` |
| `.projects__inner` | `display: flex; flex-direction: column; gap: 3.5rem`                        |
| `.projects__cards` | `display: flex; flex-direction: column; gap: 2rem`                          |

**Verification:** `tests/projects-section.test.ts` → `styles_section_geometry`.

### R20 — Global entrance animation reuse

The system MUST reuse the existing global entrance utilities (`animate-fade-in-up`, `animation-delay-100`) on the section and MUST NOT define new `@keyframes` in the section or card styles; the global `prefers-reduced-motion` override of `src/styles/global.css` remains the only motion-reduction path.

**Verification:** `tests/projects-section.test.ts` → `reuses_global_entry_animation` (static source assertions; the reduced-motion block itself is covered by the hero spec's `honors_reduced_motion`).

### R21 — Header structure and texts

The system MUST render the section header with the exact structure and texts below: a label row (label span + 3rem rule), an `<h2>` whose accent fragment carries the word `visión`, and the subtitle `<p>`.

| Element        | Text / structure (verbatim)                                                 |
| -------------- | --------------------------------------------------------------------------- |
| Label span     | `Proyectos Seleccionados`                                                   |
| `<h2>`         | `Proyectos con ` + `<span class="projects__title-accent">visión</span>`     |
| Subtitle `<p>` | `Software escalable, arquitecturas cloud y soluciones de IA en producción.` |

**Verification:** `tests/projects-section.test.ts` → `renders_section_header`.

### R22 — Label styles

The system MUST style `.projects__label` with the exact declarations below.

| Declaration      | Value                              |
| ---------------- | ---------------------------------- |
| `font-family`    | `var(--font-body)`                 |
| `font-size`      | `var(--text-label-sm-size)`        |
| `line-height`    | `var(--text-label-sm-line-height)` |
| `font-weight`    | `500`                              |
| `letter-spacing` | `0.18em`                           |
| `text-transform` | `uppercase`                        |
| `color`          | `var(--color-primary)`             |

**Verification:** `tests/projects-section.test.ts` → `styles_section_label`.

### R23 — Label rule styles

The system MUST style `.projects__label-rule` as a block with `height: 1px`, `width: 3rem` and `background-color: rgba(53, 37, 205, 0.4)`.

**Verification:** `tests/projects-section.test.ts` → `styles_section_label_rule`.

### R24 — Title and accent styles

The system MUST style `.projects__title` with the `headline-lg` tokens (`font-family: var(--font-headline)`, `font-size: var(--text-headline-lg-size)`, `line-height: var(--text-headline-lg-line-height)`, `font-weight: var(--text-headline-lg-weight)`, `letter-spacing: -0.025em`, `color: var(--color-slate-900)`) and `.projects__title-accent` with `font-family: var(--font-headline)`, `font-style: italic`, `font-weight: 400`, `color: var(--color-primary)`.

**Verification:** `tests/projects-section.test.ts` → `styles_section_title`.

### R25 — Subtitle styles

The system MUST style `.projects__subtitle` with the exact declarations below.

| Declaration      | Value                                |
| ---------------- | ------------------------------------ |
| `font-family`    | `var(--font-body)`                   |
| `font-weight`    | `300`                                |
| `font-size`      | `var(--text-body-md-size)`           |
| `line-height`    | `1.625`                              |
| `letter-spacing` | `var(--text-body-md-letter-spacing)` |
| `color`          | `var(--color-slate-600)`             |
| `max-width`      | `28rem`                              |

**Verification:** `tests/projects-section.test.ts` → `styles_section_subtitle`.

### R26 — Header responsive geometry

The system MUST lay out `.projects__header` as a column with `justify-content: space-between` and `gap: 1.5rem`, switching at viewports ≥768px to `flex-direction: row` with `align-items: flex-end`; `.projects__heading` MUST be a column with `gap: 0.75rem` and `.projects__eyebrow` a row with `align-items: center` and `gap: 0.75rem`.

**Verification:** `tests/projects-section.test.ts` → `styles_section_header_geometry`.

### R27 — Featured card and ordered grid

The system MUST render every entry with `featured: true` as a full-width `.project-card--featured` card before `.projects__grid`, and every remaining entry inside `.projects__grid`, with the entries of each group ordered by ascending `priority`.

**Verification:** `tests/projects-section.test.ts` → `renders_featured_card_and_ordered_grid` (renders the section with scrambled priority fixtures; asserts the featured card precedes the grid and the grid titles follow ascending priority).

### R28 — Featured card glass box

The system MUST style `.project-card--featured` with the exact declarations below.

| Declaration                                            | Value                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------- |
| `display` / `grid-template-columns` / `gap`            | `grid` / `minmax(0, 1fr)` / `2rem`                                        |
| `align-items`                                          | `center`                                                                  |
| `padding`                                              | `1.75rem`; `2rem` at viewports ≥768px                                     |
| `border-radius`                                        | `var(--radius-2xl)`                                                       |
| `background-color`                                     | `rgba(255, 255, 255, 0.45)`                                               |
| `backdrop-filter` / `-webkit-backdrop-filter`          | `blur(24px)`                                                              |
| `border`                                               | `1px solid rgba(255, 255, 255, 0.7)`                                      |
| `box-shadow`                                           | `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)` |
| `grid-template-columns` at viewports ≥1024px           | `repeat(12, minmax(0, 1fr))`                                              |
| `.project-card--featured .project-card__meta` ≥1024px  | `grid-column: 1 / span 6`                                                 |
| `.project-card--featured .project-card__cover` ≥1024px | `grid-column: 7 / span 6`                                                 |

**Verification:** `tests/projects-section.test.ts` → `styles_featured_card`.

### R29 — Standard card glass box

The system MUST style the base `.project-card` with the exact declarations below.

| Declaration                                              | Value                                                                  |
| -------------------------------------------------------- | ---------------------------------------------------------------------- |
| `display` / `flex-direction` / `justify-content` / `gap` | `flex` / `column` / `space-between` / `1.25rem`                        |
| `padding`                                                | `1.5rem`                                                               |
| `border-radius`                                          | `var(--radius-2xl)`                                                    |
| `background-color`                                       | `rgba(255, 255, 255, 0.4)`                                             |
| `backdrop-filter` / `-webkit-backdrop-filter`            | `blur(16px)`                                                           |
| `border`                                                 | `1px solid rgba(255, 255, 255, 0.6)`                                   |
| `box-shadow`                                             | `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)` |
| `cursor`                                                 | `default`                                                              |

**Verification:** `tests/projects-section.test.ts` → `styles_standard_card`.

### R30 — Responsive grid columns

The system MUST lay out `.projects__grid` as a grid with `gap: 1.5rem` and `grid-template-columns: minmax(0, 1fr)`, switching to `repeat(2, minmax(0, 1fr))` at viewports ≥768px and `repeat(3, minmax(0, 1fr))` at viewports ≥1024px.

**Verification:** `tests/projects-section.test.ts` → `styles_projects_grid`.

### R31 — Glass card hover

The system MUST apply the design's `glass-card-hover` behaviour to both card variants with the exact declarations below.

| State                    | Declarations                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------- |
| Base transition          | `all 0.3s cubic-bezier(0.16, 1, 0.3, 1)`                                           |
| Hover `background-color` | `rgba(255, 255, 255, 0.62)`                                                        |
| Hover `border-color`     | `rgba(129, 140, 248, 0.55)`                                                        |
| Hover `box-shadow`       | `0 20px 42px -8px rgba(79, 70, 229, 0.14), 0 0 24px -2px rgba(99, 102, 241, 0.16)` |
| Hover `transform`        | `translateY(-3px)`                                                                 |

**Verification:** `tests/projects-section.test.ts` → `styles_card_hover`.

### R32 — Cover rendering through the image pipeline

The system MUST render each card cover with `<Image>` from `astro:assets` using `src={project.coverPath}` (the `ImageMetadata` resolved by `image()`), `alt={project.coverAlt}`, `width={640}`, `height={400}` and `loading="lazy"`.

**Verification:** `tests/projects-section.test.ts` → `renders_project_card_covers` (preferred: Container API with a real placeholder imported as `ImageMetadata`; fallback when `<Image>` cannot render under Vitest per `design.md` §11: source-contract assertions on `ProjectCard.astro` plus built-output verification in `tasks.md` 12.4).

### R33 — Cover box geometry

The system MUST style `.project-card__cover` with `width: 100%`, `aspect-ratio: 16 / 10`, `border-radius: var(--radius-xl)` and `overflow: hidden`, and the element rendered by `<Image>` (`.project-card__image`, targeted through `:global`) with `display: block`, `width: 100%`, `height: 100%` and `object-fit: cover`, so user covers of any intrinsic size crop consistently to 16/10.

**Verification:** `tests/projects-section.test.ts` → `styles_card_covers`.

### R34 — Card title styles

The system MUST render each project title as a single `<h3>` and style `.project-card__title` with the `headline-sm` tokens (`font-family: var(--font-headline)`, `font-size: var(--text-headline-sm-size)`, `line-height: var(--text-headline-sm-line-height)`, `letter-spacing: var(--text-headline-sm-letter-spacing)`, `font-weight: var(--text-headline-sm-weight)`, `color: var(--color-slate-900)`); the featured variant overrides them with the `headline-md` tokens.

**Verification:** `tests/projects-section.test.ts` → `styles_card_titles` (plus `renders_project_card_covers` for the `<h3>` element and text).

### R35 — Card description styles

The system MUST style `.project-card__description` with `font-family: var(--font-body)`, `font-weight: 300`, `font-size: var(--text-body-md-size)`, `line-height: 1.625`, `letter-spacing: var(--text-body-md-letter-spacing)` and `color: var(--color-slate-600)`.

**Verification:** `tests/projects-section.test.ts` → `styles_card_descriptions` (plus the exact rendered text in `renders_project_card_covers`).

### R36 — Technology pills content

The system MUST render the technologies of each project as a `<ul class="project-card__technologies">` with exactly one `<li class="project-card__technology">` per technology, in the frontmatter order and with the verbatim text.

**Verification:** `tests/projects-section.test.ts` → `renders_technology_pills`.

### R37 — Technology pills and row styles

The system MUST style the pills row and pills with the exact declarations below.

| Element                       | Declarations                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.project-card__technologies` | `display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(226, 232, 240, 0.5); list-style: none`                                                                                                                                                                                                                                                 |
| Featured row override         | `gap: 0.5rem; padding-top: 1.25rem`                                                                                                                                                                                                                                                                                                                                                                                         |
| `.project-card__technology`   | `font-family: var(--font-body)`; `font-size: var(--text-label-sm-size)`; `line-height: var(--text-label-sm-line-height)`; `font-weight: var(--text-label-sm-weight)`; `letter-spacing: var(--text-label-sm-letter-spacing)`; `padding: 0.125rem 0.625rem`; `border-radius: var(--radius-full)`; `background-color: rgba(255, 255, 255, 0.6)`; `border: 1px solid rgba(255, 255, 255, 0.8)`; `color: var(--color-slate-700)` |
| Featured pill override        | `padding: 0.25rem 0.75rem`                                                                                                                                                                                                                                                                                                                                                                                                  |

**Verification:** `tests/projects-section.test.ts` → `styles_technology_pills`.

### R38 — Website link

The system MUST render a website anchor per card with `href={project.websiteUrl}`.

**Verification:** `tests/projects-section.test.ts` → `renders_website_links`.

### R39 — GitHub link when present

WHEN a project declares `githubUrl`, the system MUST render a second anchor with `href={project.githubUrl}`.

**Verification:** `tests/projects-section.test.ts` → `renders_github_link_when_present`.

### R40 — GitHub link when absent

IF a project does not declare `githubUrl`, THEN the system MUST NOT render any GitHub anchor for that card.

**Verification:** `tests/projects-section.test.ts` → `omits_github_link_when_absent` (fixture without `githubUrl`; asserts exactly one anchor in the card links).

### R41 — External link attributes and accessible names

The system MUST render both card links as external links with `target="_blank"`, `rel="noopener noreferrer"` and the localized accessible names `Visitar el sitio web de <title>` (website) and `Ver el código fuente de <title> en GitHub` (GitHub).

**Verification:** `tests/projects-section.test.ts` → `marks_external_links_with_accessible_names`.

### R42 — Decorative inline SVG icons

The system MUST render the link icons as decorative inline SVGs (`aria-hidden="true"`, `width="18"`, `height="18"`, `fill="currentColor"`, `viewBox="0 -960 960 960"`) with the exact Material Symbols path data below and no icon font.

| Icon            | Path data                                                                                                 |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `arrow_outward` | `m256-240-56-56 384-384H240v-80h480v480h-80v-344L256-240Z`                                                |
| `code`          | `M320-240 80-480l240-240 57 57-184 184 183 183-56 56Zm320 0-57-57 184-184-183-183 56-56 240 240-240 240Z` |

**Verification:** `tests/projects-section.test.ts` → `renders_link_icons`.

### R43 — Zero client JavaScript

The system MUST add no client-side script, no hydrated island (`client:*`) and no inline event-handler attribute in the projects section or its cards; the page keeps exactly one bundled script, the existing clipboard enhancement.

**Verification:** `tests/projects-section.test.ts` → `ships_no_client_javascript` (static scans) and the updated `tests/index.test.ts` → `ships_only_clipboard_enhancement` (page-wide scan extended to the new components).

### R44 — Single section heading

The system MUST use exactly one `<h2>` as the projects section heading and MUST NOT render any `<h1>` inside the section; the home page keeps its single `<h1>` (hero).

**Verification:** `tests/projects-section.test.ts` → `renders_single_h2` and `tests/index.test.ts` → `renders_exactly_one_h1` (existing).

---

## 6. Page wiring

### R45 — Home page loads the collection

WHEN the home page is built, the system MUST read the `projects` collection with `getCollection('projects')` in `src/pages/index.astro`, map each entry to its `data`, and pass the array to `<ProjectsSection projects={projects} />` rendered immediately after `<HeroSection />`.

**Verification:** `tests/projects-section.test.ts` → `loads_project_collection_in_index` (asserts the page source wiring and, when the content layer is available under Vitest, that the rendered page includes the four seeds; otherwise the mapped fixtures rendered through the documented `vi.mock` fallback of `design.md` §11).

---

## Traceability

| Requirement | Test file                                               | Test name                                                        |
| ----------- | ------------------------------------------------------- | ---------------------------------------------------------------- |
| R1          | `tests/projects-schema.test.ts`                         | `declares_collection_configuration`                              |
| R2          | `tests/projects-schema.test.ts`                         | `keeps_schema_module_free_of_astro_virtual_modules`              |
| R3          | `tests/projects-schema.test.ts`                         | `validates_project_frontmatter_contract`                         |
| R4          | `tests/projects-schema.test.ts`                         | `defaults_featured_to_false`                                     |
| R5          | `tests/projects-schema.test.ts`                         | `sorts_projects_by_priority`                                     |
| R6          | `tests/projects-schema.test.ts`                         | `rejects_duplicate_priorities`                                   |
| R7          | `tests/projects-schema.test.ts`                         | `rejects_duplicate_ids`                                          |
| R8          | `tests/projects-section.test.ts`                        | `validates_projects_at_render_time`                              |
| R9          | `tests/projects-content.test.ts`                        | `defines_four_project_entries`                                   |
| R10         | `tests/projects-content.test.ts`                        | `matches_seed_frontmatter`                                       |
| R11         | `tests/projects-content.test.ts`                        | `omits_github_url_for_aether_cloud`                              |
| R12         | `tests/projects-content.test.ts`                        | `includes_seed_bodies`                                           |
| R13         | `tests/projects-content.test.ts`                        | `provides_raster_cover_files`                                    |
| R14         | `tests/projects-content.test.ts`                        | `declares_cover_webp_format`                                     |
| R15         | `tests/projects-content.test.ts`                        | `keeps_covers_within_weight_bound`                               |
| R16         | `tests/projects-content.test.ts`                        | `declares_image_service_dependency`                              |
| R17         | `tests/projects-section.test.ts`                        | `exposes_slate_600_token`                                        |
| R18         | `tests/projects-section.test.ts`                        | `renders_projects_section_after_hero`                            |
| R19         | `tests/projects-section.test.ts`                        | `styles_section_geometry`                                        |
| R20         | `tests/projects-section.test.ts`                        | `reuses_global_entry_animation`                                  |
| R21         | `tests/projects-section.test.ts`                        | `renders_section_header`                                         |
| R22         | `tests/projects-section.test.ts`                        | `styles_section_label`                                           |
| R23         | `tests/projects-section.test.ts`                        | `styles_section_label_rule`                                      |
| R24         | `tests/projects-section.test.ts`                        | `styles_section_title`                                           |
| R25         | `tests/projects-section.test.ts`                        | `styles_section_subtitle`                                        |
| R26         | `tests/projects-section.test.ts`                        | `styles_section_header_geometry`                                 |
| R27         | `tests/projects-section.test.ts`                        | `renders_featured_card_and_ordered_grid`                         |
| R28         | `tests/projects-section.test.ts`                        | `styles_featured_card`                                           |
| R29         | `tests/projects-section.test.ts`                        | `styles_standard_card`                                           |
| R30         | `tests/projects-section.test.ts`                        | `styles_projects_grid`                                           |
| R31         | `tests/projects-section.test.ts`                        | `styles_card_hover`                                              |
| R32         | `tests/projects-section.test.ts`                        | `renders_project_card_covers`                                    |
| R33         | `tests/projects-section.test.ts`                        | `styles_card_covers`                                             |
| R34         | `tests/projects-section.test.ts`                        | `styles_card_titles`                                             |
| R35         | `tests/projects-section.test.ts`                        | `styles_card_descriptions`                                       |
| R36         | `tests/projects-section.test.ts`                        | `renders_technology_pills`                                       |
| R37         | `tests/projects-section.test.ts`                        | `styles_technology_pills`                                        |
| R38         | `tests/projects-section.test.ts`                        | `renders_website_links`                                          |
| R39         | `tests/projects-section.test.ts`                        | `renders_github_link_when_present`                               |
| R40         | `tests/projects-section.test.ts`                        | `omits_github_link_when_absent`                                  |
| R41         | `tests/projects-section.test.ts`                        | `marks_external_links_with_accessible_names`                     |
| R42         | `tests/projects-section.test.ts`                        | `renders_link_icons`                                             |
| R43         | `tests/projects-section.test.ts`, `tests/index.test.ts` | `ships_no_client_javascript`, `ships_only_clipboard_enhancement` |
| R44         | `tests/projects-section.test.ts`, `tests/index.test.ts` | `renders_single_h2`, `renders_exactly_one_h1`                    |
| R45         | `tests/projects-section.test.ts`                        | `loads_project_collection_in_index`                              |

## Feature description coverage

| Feature description item (id 3)                                                                                                                                                                             | Requirements      |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Projects section on the home page with anchor `id="projects"`                                                                                                                                               | R18–R21, R26      |
| Zod-validated Markdown content collection `projects` (UUID id, title, description, technologies[], coverPath validated with `image()`, coverAlt, websiteUrl, optional githubUrl, unique priority, featured) | R1–R8, R10–R12    |
| Four example entries seeded from the mockup (Synapse featured, Aether Cloud, Kortex Editor, Vanguard CLI)                                                                                                   | R9–R12            |
| Raster WebP placeholder covers in `src/content/projects/covers/` optimized through Astro's image pipeline (`sharp` dependency)                                                                              | R13–R16, R32–R33  |
| Pure sorting/uniqueness helpers and tests tracing `R<n>`                                                                                                                                                    | R5–R8, R45        |
| Excludes nav, tech-stack/about/contact, footer, WebGL shader, project detail pages, Markdown body rendering                                                                                                 | Out of scope list |
