# Tasks — projects-section

Ordered checklist. Each task references the `R<n>` it covers. The implementer marks `[x]` as tasks complete; `pnpm validate` must be green at the end. No files outside the ones listed in `design.md` §3 are touched. `sharp` is the only new dependency; no client-side JavaScript is added.

## 1. Dependencies

- [x] 1.1 Run `pnpm add sharp` and confirm `sharp` appears under `dependencies` in `package.json` (Astro's official image service; the deliberate new dependency justified in `design.md` §2.4). — R16
- [x] 1.2 Confirm no other dependency, Astro integration or UI library is added. — R16

## 2. Design token — `src/styles/tokens.css` (modify)

- [x] 2.1 Add `--color-slate-600: #475569` to the "Page palette colors" block, after `--color-slate-500`. — R17
- [x] 2.2 Confirm no other token is renamed or changed and that `--color-slate-600` is declared exactly once. — R17

## 3. Schema module — `src/content/projects-schema.ts` (create)

- [x] 3.1 Export `buildProjectsSchema({ image })` with the generic structural dependency `image: () => TCover` and the exact field/validator table of `design.md` §4, including `coverPath: image()`, `featured: z.boolean().default(false)` and `githubUrl: z.url().optional()`. — R2, R3, R4
- [x] 3.2 Export `type ProjectData = z.infer<ReturnType<typeof buildProjectsSchema<z.ZodType<ImageMetadata>>>>` with the type-only `ImageMetadata` import from `astro`. — R2, R3
- [x] 3.3 Implement `assertUniqueProjects(projects)` over `SortableProject = Pick<ProjectData, 'id' | 'priority'>`, throwing the exact messages `Duplicate project priority: <priority>` and `Duplicate project id: <id>`. — R6, R7
- [x] 3.4 Implement `sortProjects(projects)`: validate with `assertUniqueProjects`, return a copied array sorted ascending by `priority`, never mutate the input. — R5, R6, R7
- [x] 3.5 Confirm the module imports only `astro/zod` at runtime (plus the type-only `astro` import), has no import-time side effects and is instantiable with `image: () => z.string()` in Vitest. — R2

## 4. Collection config — `src/content.config.ts` (create)

- [x] 4.1 Define the `projects` collection with `glob({ base: './src/content/projects', pattern: '**/*.md' })` and `schema: ({ image }) => buildProjectsSchema({ image })`; export `collections = { projects }`. — R1
- [x] 4.2 Confirm the `covers/` directory is not picked up as entries (pattern is `**/*.md`) and that the config is the only file importing `astro:content`/`astro:loaders`. — R1

## 5. Seed entries — `src/content/projects/` (create)

- [x] 5.1 Write `synapse.md` exactly as in `design.md` §4 (featured `true`, `githubUrl`, `priority: 1`, five technologies, `coverPath: ./covers/synapse.webp`, seed body). — R9, R10, R12
- [x] 5.2 Write `aether-cloud.md` exactly as in `design.md` §4 (no `githubUrl`, no `featured`, single-quoted description with `< 10ms.`, `coverPath: ./covers/aether-cloud.webp`, seed body). — R9, R10, R11, R12
- [x] 5.3 Write `kortex-editor.md` exactly as in `design.md` §4 (no `featured`, `priority: 3`, `coverPath: ./covers/kortex-editor.webp`, seed body). — R9, R10, R12
- [x] 5.4 Write `vanguard-cli.md` exactly as in `design.md` §4 (no `featured`, `priority: 4`, `coverPath: ./covers/vanguard-cli.webp`, seed body). — R9, R10, R12
- [x] 5.5 Confirm the four UUIDs are unique, the four priorities are unique and only Synapse declares `featured: true`. — R6, R7, R10

## 6. Raster covers — `src/content/projects/covers/` (create with ImageMagick)

- [x] 6.1 Generate `synapse.webp` with the exact ImageMagick command of `design.md` §10 (`#0f172a` base + `#3525cd`→`#818cf8` gradient, 1280×800, quality 82). — R13, R14, R15
- [x] 6.2 Generate `aether-cloud.webp` with its `design.md` §10 command (`#4f46e5`→`#6366f1`). — R13, R14, R15
- [x] 6.3 Generate `kortex-editor.webp` with its `design.md` §10 command (`#8b5cf6`→`#3525cd`). — R13, R14, R15
- [x] 6.4 Generate `vanguard-cli.webp` with its `design.md` §10 command (`#6366f1`→`#4f46e5`). — R13, R14, R15
- [x] 6.5 Verify with `magick identify src/content/projects/covers/*.webp` (expect `WEBP 1280x800` for all four). If ImageMagick lacks the WebP delegate, stop and document the blocker instead of committing another format. — R13, R14
- [x] 6.6 Confirm every cover is ≤ 262144 bytes and starts with the `RIFF`/`WEBP` magic bytes. — R14, R15

## 7. Content-layer spike under Vitest

- [x] 7.1 Add a temporary test that imports `getCollection` from `astro:content` (no `vi.mock`) and reads `getCollection('projects')`; run `pnpm test` at least once after removing the `.astro/` cache, and treat it as passing only if it returns the four entries (with `coverPath` resolved to `ImageMetadata`) **without a prior `pnpm build`** (acceptance criteria of `design.md` §11). — R45
- [x] 7.2 Record the outcome in `progress/current.md` and pick the test branch: **(A)** collection-backed content tests + real page renders; or **(B)** filesystem content tests + `vi.mock('astro:content')` fixtures in the page-rendering tests (`tests/index.test.ts` and `renders_projects_section_after_hero`). — R45
- [x] 7.3 Delete the temporary spike test. — —
- [x] 7.4 If branch B is chosen and `vi.mock('astro:content')` cannot intercept the virtual module, extract `loadProjects()` into `src/content/projects-loader.ts`, mock that file instead and document the deviation in `progress/current.md`. — R45 _(not needed: a temporary probe test confirmed `vi.mock('astro:content')` intercepts the virtual module)_

## 8. Card — `src/components/ProjectCard.astro` (create)

- [x] 8.1 Add the frontmatter `interface Props { project: ProjectData; featured?: boolean }` and the `<article class:list={['project-card', featured && 'project-card--featured']}>` root. — R27, R29
- [x] 8.2 Import `{ Image } from 'astro:assets'` and render the cover with `class="project-card__image"`, `src={project.coverPath}`, `alt={project.coverAlt}`, `width={640}`, `height={400}`, `loading="lazy"`. — R32
- [x] 8.3 Render the heading row: `<h3>` title, website link always, GitHub link only when `githubUrl` is present, both with `target="_blank"`, `rel="noopener noreferrer"` and the localized `aria-label`s of R41. — R34, R38, R39, R40, R41
- [x] 8.4 Inline the `arrow_outward` and `code` SVGs with the exact viewBox, size, `fill`, `aria-hidden` and path data of R42; no icon-font markup. — R42
- [x] 8.5 Render the description paragraph and the `<ul>`/`<li>` technology pills in frontmatter order with verbatim text. — R35, R36
- [x] 8.6 Add the scoped styles for `.project-card` (R29), `--featured` (R28), hover (R31), cover box and `:global(.project-card__image)` (R33), titles (R34), descriptions (R35), pills row/pills (R37) and links/icons, consuming tokens via `var()` as specified. The image sizing MUST use `:global(.project-card__image)` because `<Image>` renders the `<img>` outside the component's scope. — R28, R29, R31–R37
- [x] 8.7 Confirm the component contains no `<script>`, no `client:*`, no inline event handlers and no new `@keyframes`. — R20, R43

## 9. Section — `src/components/ProjectsSection.astro` (create)

- [x] 9.1 Add the frontmatter `interface Props { projects: ProjectData[] }`, call `sortProjects(projects)` and split into featured / remaining groups. — R8, R27
- [x] 9.2 Write the markup of `design.md` §6: `<section class="projects animate-fade-in-up animation-delay-100" id="projects">`, inner wrapper, header (label, rule, `<h2>` with `projects__title-accent` around `visión`, subtitle), cards wrapper with the featured cards and `.projects__grid`. — R18, R21, R27, R44
- [x] 9.3 Add the scoped styles: shell geometry (R19), header geometry and responsive row (R26), label (R22), rule (R23), title/accent (R24), subtitle (R25) and grid columns (R30). Do not redefine the entry animation. — R19, R20, R22–R26, R30
- [x] 9.4 Confirm the section contains no `<script>`, no `client:*`, no inline event handlers and no new `@keyframes`; the only animation comes from the global utilities. — R20, R43
- [x] 9.5 Confirm the section heading is a single `<h2>` and the section renders no `<h1>`. — R44

## 10. Page — `src/pages/index.astro` (modify)

- [x] 10.1 Import `getCollection` from `astro:content` and `ProjectsSection`; read `getCollection('projects')`, map `entry.data` and render `<ProjectsSection projects={projects} />` immediately after `<HeroSection />`. — R45

## 11. Tests

- [x] 11.1 Extend `tests/node-shims.d.ts` with the `readFileSync(path, 'latin1'): string` overload used by the cover assertions. — R14, R15
- [x] 11.2 Create `tests/projects-schema.test.ts`: static assertion on `src/content.config.ts` (including `schema: ({ image }) => buildProjectsSchema({ image })`) plus unit tests of the factory with `image: () => z.string()` and of the helpers with minimal fixtures (valid/invalid matrix, default, sort order/no mutation, both duplicate errors). Test names: `declares_collection_configuration`, `keeps_schema_module_free_of_astro_virtual_modules`, `validates_project_frontmatter_contract`, `defaults_featured_to_false`, `sorts_projects_by_priority`, `rejects_duplicate_priorities`, `rejects_duplicate_ids`. — R1–R7
- [x] 11.3 Create `tests/projects-content.test.ts`: assert the four seed files and their exact frontmatter/bodies (branch A: `getCollection` + built schema; branch B: filesystem + `buildProjectsSchema({ image: () => z.string() }).shape.<field>.safeParse`), the four raster covers (existence, RIFF/WEBP magic bytes via latin1, weight ≤ 262144 bytes) and `sharp` under `dependencies`. Test names: `defines_four_project_entries`, `matches_seed_frontmatter`, `omits_github_url_for_aether_cloud`, `includes_seed_bodies`, `provides_raster_cover_files`, `declares_cover_webp_format`, `keeps_covers_within_weight_bound`, `declares_image_service_dependency`. — R9–R16
- [x] 11.4 Create `tests/projects-section.test.ts`: render `ProjectsSection`/`ProjectCard` with a local `createProject(overrides)` fixture factory through `experimental_AstroContainer` (featured ordering, header texts, covers, pills, links, ARIA, single `<h2>`, duplicate render failure); use a real placeholder imported as `ImageMetadata` for `renders_project_card_covers` and apply the §11 fallback (source contract + build verification) only if `<Image>` cannot render under the Container API, recording the choice in `progress/current.md`; read the components and `tokens.css` for the CSS contract with whitespace-normalized helpers, asserting `:global(.project-card__image)`; render `src/pages/index.astro` (branch A/branch B of task 7.2) for the section placement. Test names: `validates_projects_at_render_time`, `exposes_slate_600_token`, `renders_projects_section_after_hero`, `styles_section_geometry`, `reuses_global_entry_animation`, `renders_section_header`, `styles_section_label`, `styles_section_label_rule`, `styles_section_title`, `styles_section_subtitle`, `styles_section_header_geometry`, `renders_featured_card_and_ordered_grid`, `styles_featured_card`, `styles_standard_card`, `styles_projects_grid`, `styles_card_hover`, `renders_project_card_covers`, `styles_card_covers`, `styles_card_titles`, `styles_card_descriptions`, `renders_technology_pills`, `styles_technology_pills`, `renders_website_links`, `renders_github_link_when_present`, `omits_github_link_when_absent`, `marks_external_links_with_accessible_names`, `renders_link_icons`, `ships_no_client_javascript`, `renders_single_h2`, `loads_project_collection_in_index`. — R8, R17–R45
- [x] 11.5 Update `tests/index.test.ts`: include `ProjectsSection.astro` and `ProjectCard.astro` in the script/island/handler scan (keeping the single-script assertion) and, when branch B applies, add the `vi.mock('astro:content')` fixture. Keep `renders_exactly_one_h1` green. — R43, R44
- [x] 11.6 Confirm every test file uses only the declared node shims (`readFileSync` with `'utf8'`/`'latin1'`, `readdirSync`) or extends `tests/node-shims.d.ts` if a new one is strictly needed. — all R

## 12. Verification

- [x] 12.1 Run `pnpm format` and `pnpm lint`; no disabled rules, no leftover TODOs, no dead CSS. — all R
- [x] 12.2 Run `pnpm check` (strict Astro/TypeScript diagnostics; the collection types and the `<Image>` props must resolve). — all R
- [x] 12.3 Run `pnpm test`; every test above is green and maps to its requirement. — all R
- [x] 12.4 Run `pnpm build`; confirm the built page contains the `#projects` section with four cards, four optimized `/_astro/*.webp` cover images (`<img>` with `width="640"`, `height="400"`, `loading="lazy"` and the seed `alt`), the eight links (GitHub missing for Aether Cloud), no new scripts/islands, and that deleting a `priority` duplicate would fail the build (spot-check the explicit error). — R8, R18, R32, R39, R40, R43
- [x] 12.5 Manual check with `pnpm preview`: compare the section against `specs/projects-section/references/projects-section.png` (header, featured wide card, 1/2/3-column grid, hover lift, entry animation), confirm the optimized covers load and crop to the 16/10 box and that reduced-motion collapses the entrance. — R18–R42 _(executed structurally: preview HTTP 200, section shell, 1 featured + 3 grid cards, 4 optimized covers and 17 pills verified in served HTML; the pixel comparison against the PNG and the hover/reduced-motion visuals are flagged for the human reviewer — no browser is available in this environment)_
- [x] 12.6 Scope check: no files outside `design.md` §3 modified, no dependency beyond `sharp`, no `src/` or test change beyond the listed ones. — all R

## Definition of done

- All checkboxes `[x]`, `pnpm validate` green.
- `specs/projects-section/requirements.md` traceability table fully covered by the tests in `tests/`.
- Branch A or B of task 7.2 and the preferred/fallback choice of task 11.4 recorded in `progress/current.md`.
- The only client-side script in the build remains the hero clipboard enhancement.
