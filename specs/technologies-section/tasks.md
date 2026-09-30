# Tasks — technologies-section

Ordered checklist. Each task references the `R<n>` it covers. The implementer marks `[x]` as tasks complete; `pnpm validate` must be green at the end. No files outside the ones listed in `design.md` §3 are touched. No new dependency is added; no client-side JavaScript is added.

## 1. Schema module — `src/content/technologies-schema.ts` (create)

- [x] 1.1 Export `TECHNOLOGY_CATEGORIES` as a readonly tuple with exactly the four mockup labels in order (`Frontend`, `Backend y Nube`, `IA y Sistemas`, `Flujo de Trabajo y Diseño`) plus the `TechnologyCategory` type. — R4
- [x] 1.2 Export `LOCAL_ICON_PATH_PATTERN = /^\/icons\/logos\/[a-z0-9-]+\.svg$/` and `technologiesSchema` as a strict Zod object (`z.strictObject`; fallback `z.object({...}).strict()`), with `id: z.uuid()`, `category: z.enum(TECHNOLOGY_CATEGORIES)` (fallback `z.enum([...TECHNOLOGY_CATEGORIES])`), `iconUrl: z.string().regex(LOCAL_ICON_PATH_PATTERN)` and `name: z.string()`. — R3, R4
- [x] 1.3 Export `TechnologyData` via `z.infer<typeof technologiesSchema>`. — R3
- [x] 1.4 Implement `assertUniqueTechnologies(technologies)` throwing the exact message `Duplicate technology id: <id>` on a repeated id. — R5
- [x] 1.5 Implement `groupTechnologies(technologies)`: validate duplicates first, return one new group per non-empty category ordered by `TECHNOLOGY_CATEGORIES`, with items sorted ascending by `name` (code-point comparison, no `localeCompare`), never mutating the input. — R5, R6, R7
- [x] 1.6 Confirm the module imports only `astro/zod`, has no side effects and is instantiable/importable from Vitest without virtual modules. — R2

## 2. Collection config — `src/content.config.ts` (modify)

- [x] 2.1 Add the `technologies` collection with `glob({ base: './src/content/technologies', pattern: '**/*.json' })` and `schema: technologiesSchema`; export `collections = { projects, technologies }` leaving `projects` untouched. — R1
- [x] 2.2 Confirm the config is still the only file importing `astro:content`/`astro/loaders` and that the JSON glob does not pick up anything outside `src/content/technologies/`. — R1

## 3. Seed entries — `src/content/technologies/` (create)

- [x] 3.1 Write the seven `Frontend` files exactly as in `design.md` §5: `css3.json`, `framer.json`, `html5.json`, `nextjs.json`, `react.json`, `tailwindcss.json`, `typescript.json`. — R9, R10, R11
- [x] 3.2 Write the eight `Backend y Nube` files: `docker.json`, `go.json`, `nodejs.json`, `postgresql.json`, `python.json`, `redis.json`, `rust.json`, `vercel.json`. — R9, R10, R11
- [x] 3.3 Write the four `IA y Sistemas` files: `claude.json`, `langchain.json`, `ollama.json`, `openai.json`. — R9, R10, R11
- [x] 3.4 Write the seven `Flujo de Trabajo y Diseño` files: `figma.json`, `git.json`, `github.json`, `linear.json`, `postman.json`, `raycast.json`, `vscode.json`. — R9, R10, R11
- [x] 3.5 Confirm every file has exactly the four keys `id`, `category`, `iconUrl`, `name`, that all 26 UUIDs are unique and valid, and that the four categories are all represented. — R11, R12, R13

## 4. Icon assets — `public/icons/logos/` (create)

- [x] 4.1 Create the directory and vendor the 26 SVGs with the exact local names and svgl sources of `design.md` §6 (reproducible `curl` loop). — R14
- [x] 4.2 Verify every file contains an `<svg` root element, that none contains `<script`, and that each is ≤ 32768 bytes. — R15, R16, R17
- [x] 4.3 Confirm the vendoring introduces no runtime fetch, no CDN reference and no dependency in `package.json`. — R14 (design constraint)

## 5. Design token — `src/styles/tokens.css` (modify)

- [x] 5.1 Add `--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;` to the font families block, after `--font-body`. — R18
- [x] 5.2 Confirm no other token is renamed or changed and that `--font-mono` is declared exactly once. — R18

## 6. Section — `src/components/TechnologiesSection.astro` (create)

- [x] 6.1 Add the frontmatter: `interface Props { technologies: TechnologyData[] }`, `const groups = groupTechnologies(technologies);`, `CATEGORY_ICON_PATHS` (typed `Record<TechnologyCategory, string>`) and `QUOTE_ICON_PATH` with the exact path data of R32/R39. — R8, R32, R39
- [x] 6.2 Write the section shell and header markup of `design.md` §7: `<section class="tech-stack animate-fade-in-up animation-delay-200" id="tech-stack">`, inner wrapper, label row (label + rule), `<h2>` with `tech-stack__title-accent` around `clave`, subtitle. — R19, R22
- [x] 6.3 Render the category cards: one `.tech-stack__category` per group, header with the 22px inline category SVG (`aria-hidden="true"`) and `<h3 class="tech-stack__category-title">`, then `.tech-stack__items` with one `<li class="tech-stack__item" title={name}>` per technology containing `<img class="tech-stack__icon" src={iconUrl} alt={name} width="20" height="20" loading="lazy" />`. — R28, R32, R35
- [x] 6.4 Render the quote bar: inline `verified_user` SVG (24px, `aria-hidden="true"`), the verbatim quote text and the `Filosofía Técnica` badge. — R36, R39
- [x] 6.5 Add the scoped styles: shell geometry and grid breakpoints (R20), label (R23), rule (R24), title/accent (R25), subtitle (R26), header geometry (R27), category card (R29), category hover (R30), category header/icon/title (R31), items/chips/icon (R33), chip hover (R34), quote bar (R37), quote text (R38), badge (R40). Do not redefine the entry animation. — R20, R23–R27, R29–R31, R33, R34, R37, R38, R40
- [x] 6.6 Confirm the component contains no `<script>`, no `client:*`, no inline event handlers and no new `@keyframes`; the heading is a single `<h2>` with no `<h1>`. — R21, R41, R42

## 7. Page — `src/pages/index.astro` (modify)

- [x] 7.1 Import `TechnologiesSection`; add `const technologyEntries = await getCollection('technologies');` + `const technologies = technologyEntries.map((entry) => entry.data);` and render `<TechnologiesSection technologies={technologies} />` immediately after `<ProjectsSection projects={projects} />`. — R43

## 8. Tests

- [x] 8.1 Create `tests/technologies-schema.test.ts`: static assertion on `src/content.config.ts`; module-boundary assertion; accept/reject matrix plus strict unknown-key rejection; category constant; duplicate-id error; grouping order, alphabetical order and no-mutation checks. Test names: `declares_collection_configuration`, `keeps_schema_module_free_of_astro_virtual_modules`, `validates_technology_contract`, `pins_category_order_constant`, `rejects_duplicate_ids`, `groups_technologies_in_fixed_category_order`, `does_not_mutate_technologies`, `sorts_technologies_alphabetically_within_category`. — R1–R7
- [x] 8.2 Create `tests/technologies-content.test.ts`: read `src/content/technologies/` and `public/icons/logos/` with `readFileSync`/`readdirSync`; assert the 26 file names, the exact seed values (each entry also validated with `technologiesSchema`), the four-key shape, category coverage, unique ids, the exact icon file set with every `iconUrl` resolving, SVG roots, absence of `<script` and the weight bound. Test names: `defines_twenty_six_technology_entries`, `matches_seed_values`, `declares_exactly_four_fields`, `covers_all_categories`, `keeps_ids_unique`, `provides_local_icon_files`, `declares_svg_icon_format`, `keeps_icons_free_of_scripts`, `keeps_icons_within_weight_bound`. — R9–R17
- [x] 8.3 Create `tests/technologies-section.test.ts`: render `TechnologiesSection` with a local `createTechnology(overrides)` fixture factory through `experimental_AstroContainer` (markup, fixed category order, alphabetical chips, covers/icons, quote bar, single `<h2>`, duplicate render failure); read the component and `tokens.css` for the CSS contract with the duplicated whitespace-normalizing helpers; render `src/pages/index.astro` with the collection-aware `vi.mock('astro:content')` (projects branch empty) for placement and page wiring. Test names: `validates_technologies_at_render_time`, `exposes_font_mono_token`, `renders_tech_stack_section_after_projects`, `styles_section_geometry`, `reuses_global_entry_animation`, `renders_section_header`, `styles_section_label`, `styles_section_label_rule`, `styles_section_title`, `styles_section_subtitle`, `styles_section_header_geometry`, `renders_category_cards_in_fixed_order`, `styles_category_cards`, `styles_category_hover`, `styles_category_headers`, `renders_category_icons`, `styles_technology_items`, `styles_technology_item_hover`, `renders_technology_icons`, `renders_quote_bar`, `styles_quote_bar`, `styles_quote_text`, `renders_quote_icon`, `styles_quote_badge`, `ships_no_client_javascript`, `renders_single_h2`, `loads_technology_collection_in_index`. — R8, R18–R43
- [x] 8.4 Update `tests/index.test.ts`: make the `vi.mock('astro:content')` factory collection-aware (technologies branch may be empty) and add `'components/TechnologiesSection.astro'` to the script/island/handler scan; keep `renders_exactly_one_h1` green. — R41, R42, R44
- [x] 8.5 Update `tests/projects-section.test.ts`: make its `vi.mock('astro:content')` factory collection-aware (technologies branch returns `[]`), keeping all project assertions green. — R19 (page render), R43
- [x] 8.6 Confirm the new tests need no extra node shims (`readFileSync` with `'utf8'` and `readdirSync` are already declared in `tests/node-shims.d.ts`). — all R

## 9. Verification

- [x] 9.1 Run `pnpm format` and `pnpm lint`; no disabled rules, no leftover TODOs, no dead CSS. — all R
- [x] 9.2 Run `pnpm check` (strict Astro/TypeScript diagnostics; the new collection types must resolve in `index.astro`). — all R
- [x] 9.3 Run `pnpm test`; every test above is green and maps to its requirement. — all R
- [x] 9.4 Run `pnpm build`; confirm `dist/icons/logos/` contains the 26 SVGs and `dist/index.html` contains `id="tech-stack"`, the four `tech-stack__category-title` headings, the 26 `<img src="/icons/logos/…">` tags with their `alt` values, the quote text, no new scripts/islands and that the only bundled script is the clipboard enhancement. Spot-check that a duplicate `id` or an unknown JSON key fails the build (temporarily, then revert). — R8, R19, R35, R41, R43
- [x] 9.5 Run `pnpm preview` and compare the section against `specs/projects-section/references/projects-section.html` lines 1199–1733: header, 4-column bento at desktop, chip hover, quote bar, entrance animation and its reduced-motion collapse. — R19–R40
- [x] 9.6 Scope check: no files outside `design.md` §3 modified, no dependency added, no `src/` or test change beyond the listed ones. — all R

## Definition of done

- All checkboxes `[x]`, `pnpm validate` green.
- `specs/technologies-section/requirements.md` traceability table fully covered by the tests in `tests/`.
- The Container API fallback (if any) and the mock strategy are recorded in `progress/current.md`.
- The only client-side script in the build remains the hero clipboard enhancement.
