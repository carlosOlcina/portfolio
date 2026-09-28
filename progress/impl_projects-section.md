# Implementation summary — projects-section

- **Feature:** 3 — `projects-section` (`sdd: true`), status `in_progress` (reviewer decides `done`).
- **Spec:** `specs/projects-section/{requirements.md,design.md,tasks.md}` (R1–R45, tasks 1–12).
- **Scope:** exactly `design.md` §3. `sharp` is the only new dependency; no client-side JavaScript beyond the hero clipboard enhancement.

## Decisions recorded during implementation

| Decision                                      | Outcome                                                                                                                                                                                                                                                                                                               |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task 7.1 — `getCollection` under Vitest (R45) | **Branch B.** No-mock `getCollection('projects')` returns `[]` (`The collection "projects" does not exist or is empty`) after `rm -rf .astro` and no prior `pnpm build`; still `[]` after `pnpm astro sync`. Content tests are filesystem-based; page-rendering tests use `vi.mock('astro:content')`.                 |
| Task 7.4 — `vi.mock` fallback                 | **Not needed.** A temporary probe confirmed `vi.mock('astro:content')` intercepts the virtual module. `src/content/projects-loader.ts` was not created.                                                                                                                                                               |
| Task 11.4 — cover rendering (R32)             | **Preferred path.** A real placeholder (`src/content/projects/covers/synapse.webp`) is imported as `ImageMetadata` and `<Image>` renders through the Container API (`/_image?href=...` `<img>` with `alt`, `width="640"`, `height="400"`, `loading="lazy"`, non-empty `src`). No source-contract fallback was needed. |

## Tasks

Sections 1–12 of `specs/projects-section/tasks.md` are all `[x]`:
dependencies (`sharp`), `--color-slate-600` token, schema factory + helpers,
collection config, four seed entries, four ImageMagick WebP covers, Vitest
spike, `ProjectCard.astro`, `ProjectsSection.astro`, page wiring, three new
test files + `tests/index.test.ts` update, and verification.

## Verification evidence

- `pnpm lint` green; `pnpm check` → 23 files, 0 errors / 0 warnings / 0 hints.
- `pnpm test` → 10 files, 87 tests, all green.
- `pnpm build` green; `dist/index.html` contains:
  - `<section class="projects animate-fade-in-up animation-delay-100" id="projects">`;
  - 1 `project-card--featured` + 3 `project-card` articles;
  - 4 `<img src="/_astro/*.webp" … width="640" height="400" loading="lazy" class="project-card__image">` with the seed `alt`s;
  - 4 `https://example.com` links and only 3 `https://github.com` links (Aether Cloud omits GitHub, R40);
  - exactly 1 `<script>` (the bundled clipboard enhancement) and no `astro-island`.
- Duplicate-priority spot check: setting `vanguard-cli.md` to `priority: 1` fails
  `pnpm build` with `Duplicate project priority: 1` (R8); the seed was restored.
- `pnpm preview` served `HTTP 200` with the section shell, 4 covers and 17 pills
  in the HTML. The pixel comparison against
  `specs/projects-section/references/projects-section.png`, the hover lift and
  the reduced-motion behavior are flagged for the human reviewer: no browser is
  available in this environment. Hover/reduced-motion contracts are pinned by
  the CSS and global-style tests.
- Covers: `magick identify` → `WEBP 1280x800` for all four; sizes 2886–4224 bytes;
  `RIFF`/`WEBP` magic bytes verified by tests.

## Traceability — `R<n>` → test

| Req | Test file                                               | Test                                                              |
| --- | ------------------------------------------------------- | ----------------------------------------------------------------- |
| R1  | `tests/projects-schema.test.ts`                         | `declares_collection_configuration`                               |
| R2  | `tests/projects-schema.test.ts`                         | `keeps_schema_module_free_of_astro_virtual_modules`               |
| R3  | `tests/projects-schema.test.ts`                         | `validates_project_frontmatter_contract`                          |
| R4  | `tests/projects-schema.test.ts`                         | `defaults_featured_to_false`                                      |
| R5  | `tests/projects-schema.test.ts`                         | `sorts_projects_by_priority`                                      |
| R6  | `tests/projects-schema.test.ts`                         | `rejects_duplicate_priorities`                                    |
| R7  | `tests/projects-schema.test.ts`                         | `rejects_duplicate_ids`                                           |
| R8  | `tests/projects-section.test.ts`                        | `validates_projects_at_render_time`                               |
| R9  | `tests/projects-content.test.ts`                        | `defines_four_project_entries`                                    |
| R10 | `tests/projects-content.test.ts`                        | `matches_seed_frontmatter`                                        |
| R11 | `tests/projects-content.test.ts`                        | `omits_github_url_for_aether_cloud`                               |
| R12 | `tests/projects-content.test.ts`                        | `includes_seed_bodies`                                            |
| R13 | `tests/projects-content.test.ts`                        | `provides_raster_cover_files`                                     |
| R14 | `tests/projects-content.test.ts`                        | `declares_cover_webp_format`                                      |
| R15 | `tests/projects-content.test.ts`                        | `keeps_covers_within_weight_bound`                                |
| R16 | `tests/projects-content.test.ts`                        | `declares_image_service_dependency`                               |
| R17 | `tests/projects-section.test.ts`                        | `exposes_slate_600_token`                                         |
| R18 | `tests/projects-section.test.ts`                        | `renders_projects_section_after_hero`                             |
| R19 | `tests/projects-section.test.ts`                        | `styles_section_geometry`                                         |
| R20 | `tests/projects-section.test.ts`                        | `reuses_global_entry_animation`                                   |
| R21 | `tests/projects-section.test.ts`                        | `renders_section_header`                                          |
| R22 | `tests/projects-section.test.ts`                        | `styles_section_label`                                            |
| R23 | `tests/projects-section.test.ts`                        | `styles_section_label_rule`                                       |
| R24 | `tests/projects-section.test.ts`                        | `styles_section_title`                                            |
| R25 | `tests/projects-section.test.ts`                        | `styles_section_subtitle`                                         |
| R26 | `tests/projects-section.test.ts`                        | `styles_section_header_geometry`                                  |
| R27 | `tests/projects-section.test.ts`                        | `renders_featured_card_and_ordered_grid`                          |
| R28 | `tests/projects-section.test.ts`                        | `styles_featured_card`                                            |
| R29 | `tests/projects-section.test.ts`                        | `styles_standard_card`                                            |
| R30 | `tests/projects-section.test.ts`                        | `styles_projects_grid`                                            |
| R31 | `tests/projects-section.test.ts`                        | `styles_card_hover`                                               |
| R32 | `tests/projects-section.test.ts`                        | `renders_project_card_covers`                                     |
| R33 | `tests/projects-section.test.ts`                        | `styles_card_covers`                                              |
| R34 | `tests/projects-section.test.ts`                        | `styles_card_titles` (+ `renders_project_card_covers` `<h3>`)     |
| R35 | `tests/projects-section.test.ts`                        | `styles_card_descriptions` (+ `renders_project_card_covers` text) |
| R36 | `tests/projects-section.test.ts`                        | `renders_technology_pills`                                        |
| R37 | `tests/projects-section.test.ts`                        | `styles_technology_pills`                                         |
| R38 | `tests/projects-section.test.ts`                        | `renders_website_links`                                           |
| R39 | `tests/projects-section.test.ts`                        | `renders_github_link_when_present`                                |
| R40 | `tests/projects-section.test.ts`                        | `omits_github_link_when_absent`                                   |
| R41 | `tests/projects-section.test.ts`                        | `marks_external_links_with_accessible_names`                      |
| R42 | `tests/projects-section.test.ts`                        | `renders_link_icons`                                              |
| R43 | `tests/projects-section.test.ts`, `tests/index.test.ts` | `ships_no_client_javascript`, `ships_only_clipboard_enhancement`  |
| R44 | `tests/projects-section.test.ts`, `tests/index.test.ts` | `renders_single_h2`, `renders_exactly_one_h1`                     |
| R45 | `tests/projects-section.test.ts`                        | `loads_project_collection_in_index`                               |

Every `R<n>` of `specs/projects-section/requirements.md` maps to at least one
passing test; no requirement is untested and no test lacks an `R<n>`.
