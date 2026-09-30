# Implementation report — technologies-section (id 5)

Status: **ready_for_review** — see Resolution §9

## 1. Task checklist status

| Task group           | Status | Notes                                                                                   |
| -------------------- | ------ | --------------------------------------------------------------------------------------- |
| 1. Schema module     | `[x]`  | `src/content/technologies-schema.ts` exactly as `design.md` §4.                         |
| 2. Collection config | `[x]`  | `technologies` collection added; `projects` untouched.                                  |
| 3. Seed entries      | `[x]`  | 26 JSON files; four keys each; 26 unique ids; 4 categories.                             |
| 4. Icon assets       | `[x]`  | 26 SVGs vendored; all `<svg>` roots; no `<script`; all ≤ 32768 B.                       |
| 5. Design token      | `[x]`  | `--font-mono` added once, after `--font-body`.                                          |
| 6. Section component | `[x]`  | `TechnologiesSection.astro`; no scripts/islands/handlers/keyframes.                     |
| 7. Page wiring       | `[x]`  | `getCollection('technologies')` + component after `ProjectsSection`.                    |
| 8. Tests             | `[x]`  | All test files authored; 131/133 green (see §6 for the 2 red).                          |
| 9. Verification      | `[ ]`  | Blocked: `pnpm check` and `pnpm build` reject 8 seed UUIDs (see §6). `pnpm lint` green. |

`tasks.md` checkboxes: 1.1–8.6 marked `[x]`; 9.1–9.6 intentionally left `[ ]`.

## 2. Files created / modified

Created:

- `src/content/technologies-schema.ts`
- `src/content/technologies/*.json` (26 files, one per seed)
- `public/icons/logos/*.svg` (26 files)
- `src/components/TechnologiesSection.astro`
- `tests/technologies-schema.test.ts`
- `tests/technologies-content.test.ts`
- `tests/technologies-section.test.ts`

Modified:

- `src/content.config.ts` — adds the `technologies` collection, `collections = { projects, technologies }`.
- `src/styles/tokens.css` — adds `--font-mono` after `--font-body`.
- `src/pages/index.astro` — loads the collection and renders `<TechnologiesSection technologies={technologies} />` after `<ProjectsSection />`.
- `tests/index.test.ts` — collection-aware `astro:content` mock; `TechnologiesSection.astro` added to the script/island/handler scan.
- `tests/projects-section.test.ts` — collection-aware mock (technologies branch `[]`).
- `tests/projects-schema.test.ts` — **deviation, forced by R1**: its `declares_collection_configuration` assertion pinned `export const collections = { projects };`, which R1 replaces with `{ projects, technologies }`. The file is not listed in `design.md` §3 (editorial omission); without the one-string update the suite stays red. No projects behavior changed.
- `specs/technologies-section/tasks.md` — checkboxes updated.

Not touched (as instructed): `feature_list.json`, `progress/current.md`, `progress/history.md`, `package.json`, `astro.config.mjs`, other components/styles/tests.

## 3. Icons actually vendored (`public/icons/logos/`)

All 26 downloaded on 2026-09-30 from the svgl URLs of `design.md` §6; every byte size matches the design table exactly; the total is 57,873 bytes.

| File              | Bytes | File             | Bytes |
| ----------------- | ----- | ---------------- | ----- |
| `claude.svg`      | 1999  | `nextjs.svg`     | 1091  |
| `css3.svg`        | 2348  | `nodejs.svg`     | 2491  |
| `docker.svg`      | 1488  | `ollama.svg`     | 8572  |
| `figma.svg`       | 1087  | `openai.svg`     | 2430  |
| `framer.svg`      | 194   | `postgresql.svg` | 3944  |
| `git.svg`         | 484   | `postman.svg`    | 5861  |
| `github.svg`      | 997   | `python.svg`     | 1126  |
| `go.svg`          | 1472  | `raycast.svg`    | 688   |
| `html5.svg`       | 382   | `react.svg`      | 6534  |
| `langchain.svg`   | 491   | `redis.svg`      | 1928  |
| `linear.svg`      | 836   | `rust.svg`       | 5425  |
| `tailwindcss.svg` | 747   | `typescript.svg` | 1744  |
| `vercel.svg`      | 169   | `vscode.svg`     | 3345  |

Checks: `grep -L '<svg'` → empty; `grep -l '<script'` → empty; largest file `ollama.svg` (8,572 B) < 32,768 B. No runtime fetch, no CDN, no dependency added.

## 4. Test strategy and mocks

- Component renders use `experimental_AstroContainer` with a local `createTechnology(overrides)` factory; the component never touches `astro:content`, so no content mock is needed for component-level tests.
- Page renders use a collection-aware `vi.mock('astro:content')`: the new section test returns 4 technology fixtures (one per category); `tests/index.test.ts` and `tests/projects-section.test.ts` return `[]` for `technologies` and keep their project fixtures.
- CSS contract tests read `TechnologiesSection.astro` / `tokens.css` with `readFileSync` and the duplicated whitespace-normalizing `extractRule` / `extractResponsiveRule` / `extractMediaBlock` helpers, consistent with `tests/index.test.ts` and `tests/projects-section.test.ts`.
- Container API fallback was not needed: the component and the full page render correctly under Vitest.
- Assertions that inspect exact elements account for the `data-astro-cid-*` attributes injected by the Container API (regex-based tag matches), same spirit as the existing project tests.

## 5. Traceability — `R<n>` → test

| Req | Test file / test name                                                                                               | State        |
| --- | ------------------------------------------------------------------------------------------------------------------- | ------------ |
| R1  | `technologies-schema.test.ts` → `declares_collection_configuration`                                                 | green        |
| R2  | `technologies-schema.test.ts` → `keeps_schema_module_free_of_astro_virtual_modules`                                 | green        |
| R3  | `technologies-schema.test.ts` → `validates_technology_contract`                                                     | green        |
| R4  | `technologies-schema.test.ts` → `pins_category_order_constant`                                                      | green        |
| R5  | `technologies-schema.test.ts` → `rejects_duplicate_ids`                                                             | green        |
| R6  | `technologies-schema.test.ts` → `groups_technologies_in_fixed_category_order`, `does_not_mutate_technologies`       | green        |
| R7  | `technologies-schema.test.ts` → `sorts_technologies_alphabetically_within_category`                                 | green        |
| R8  | `technologies-section.test.ts` → `validates_technologies_at_render_time`                                            | green        |
| R9  | `technologies-content.test.ts` → `defines_twenty_six_technology_entries`                                            | green        |
| R10 | `technologies-content.test.ts` → `matches_seed_values`                                                              | **red — §6** |
| R11 | `technologies-content.test.ts` → `declares_exactly_four_fields`                                                     | green        |
| R12 | `technologies-content.test.ts` → `covers_all_categories`                                                            | green        |
| R13 | `technologies-content.test.ts` → `keeps_ids_unique`                                                                 | **red — §6** |
| R14 | `technologies-content.test.ts` → `provides_local_icon_files`                                                        | green        |
| R15 | `technologies-content.test.ts` → `declares_svg_icon_format`                                                         | green        |
| R16 | `technologies-content.test.ts` → `keeps_icons_free_of_scripts`                                                      | green        |
| R17 | `technologies-content.test.ts` → `keeps_icons_within_weight_bound`                                                  | green        |
| R18 | `technologies-section.test.ts` → `exposes_font_mono_token`                                                          | green        |
| R19 | `technologies-section.test.ts` → `renders_tech_stack_section_after_projects`                                        | green        |
| R20 | `technologies-section.test.ts` → `styles_section_geometry`                                                          | green        |
| R21 | `technologies-section.test.ts` → `reuses_global_entry_animation`                                                    | green        |
| R22 | `technologies-section.test.ts` → `renders_section_header`                                                           | green        |
| R23 | `technologies-section.test.ts` → `styles_section_label`                                                             | green        |
| R24 | `technologies-section.test.ts` → `styles_section_label_rule`                                                        | green        |
| R25 | `technologies-section.test.ts` → `styles_section_title`                                                             | green        |
| R26 | `technologies-section.test.ts` → `styles_section_subtitle`                                                          | green        |
| R27 | `technologies-section.test.ts` → `styles_section_header_geometry`                                                   | green        |
| R28 | `technologies-section.test.ts` → `renders_category_cards_in_fixed_order`                                            | green        |
| R29 | `technologies-section.test.ts` → `styles_category_cards`                                                            | green        |
| R30 | `technologies-section.test.ts` → `styles_category_hover`                                                            | green        |
| R31 | `technologies-section.test.ts` → `styles_category_headers`                                                          | green        |
| R32 | `technologies-section.test.ts` → `renders_category_icons`                                                           | green        |
| R33 | `technologies-section.test.ts` → `styles_technology_items`                                                          | green        |
| R34 | `technologies-section.test.ts` → `styles_technology_item_hover`                                                     | green        |
| R35 | `technologies-section.test.ts` → `renders_technology_icons`                                                         | green        |
| R36 | `technologies-section.test.ts` → `renders_quote_bar`                                                                | green        |
| R37 | `technologies-section.test.ts` → `styles_quote_bar`                                                                 | green        |
| R38 | `technologies-section.test.ts` → `styles_quote_text`                                                                | green        |
| R39 | `technologies-section.test.ts` → `renders_quote_icon`                                                               | green        |
| R40 | `technologies-section.test.ts` → `styles_quote_badge`                                                               | green        |
| R41 | `technologies-section.test.ts` → `ships_no_client_javascript`; `index.test.ts` → `ships_only_clipboard_enhancement` | green        |
| R42 | `technologies-section.test.ts` → `renders_single_h2`; `index.test.ts` → `renders_exactly_one_h1`                    | green        |
| R43 | `technologies-section.test.ts` → `loads_technology_collection_in_index`                                             | green        |
| R44 | `index.test.ts` → `renders_exactly_one_h1`, `ships_only_clipboard_enhancement`                                      | green        |

## 6. BLOCKER — spec contradiction: `z.uuid()` vs the approved seed UUIDs

`R3` requires `id: z.uuid()`. `R10` pins 26 exact seed ids. `R13` requires each seed id to pass `technologiesSchema.shape.id.safeParse`. Under the installed Zod 4 (`astro/zod` 4.3.6), `z.uuid()` validates **RFC 9562**: it rejects any UUID whose variant nibble (first hex digit of the 4th group) is not `8/9/a/b`. Eight of the approved seed ids fail:

| File          | Approved `id`                          | Rejected variant nibble |
| ------------- | -------------------------------------- | ----------------------- |
| `css3.json`   | `6fa13057-c283-4fbe-d094-7142b35f86ac` | `d`                     |
| `git.json`    | `4d8f1e35-a061-4b9c-ce72-5f2031b76e8a` | `c`                     |
| `github.json` | `5e902f46-b172-4cad-df83-603142c87f9b` | `d`                     |
| `go.json`     | `81c35279-e4a5-4bd0-f2b6-9364d57ba8ce` | `f`                     |
| `html5.json`  | `5e902f46-b172-4ead-cf83-6031a24e759b` | `c`                     |
| `linear.json` | `6fa13057-c283-4dbe-e094-714253d980ac` | `e`                     |
| `nodejs.json` | `70b24168-d394-4acf-e1a5-8253c46a97bd` | `e`                     |
| `vscode.json` | `70b24168-d394-4ecf-f1a5-825364e0a1bd` | `f`                     |

Evidence (all from the current tree):

- `pnpm check` → `[InvalidContentEntryDataError] technologies → css3 data does not match collection schema. id: Invalid UUID`.
- `pnpm test` → 131/133; the only red tests are `matches_seed_values` (fails on `css3.json`) and `keeps_ids_unique` (fails on `css3.json`); the other 24 ids pass.
- `pnpm build` not run to completion: the content layer sync fails first with the same error.
- Under Zod 3 semantics (`z.uuid()` was shape-only) these values would have passed; the spec/design explicitly target Zod 4, whose `z.uuid()` is stricter. The spec author could not have validated these values.

The three requirements cannot all be satisfied. **No seed value or schema was changed** — this needs a spec decision (implementer protocol: do not invent requirement/design changes).

Options for the human/spec owner:

- **Option A (recommended): correct the 8 ids** in `requirements.md` R10, `design.md` §5, the seed JSONs and the seed table of `technologies-content.test.ts`. Minimal edit: replace the 4th group's first nibble with `8/9/a/b` while keeping all 26 pairwise distinct (e.g. css3 `…-4fbe-9094-…`, git `…-4b9c-be72-…`, github `…-4cad-bf83-…`, go `…-4bd0-b2b6-…`, html5 `…-4ead-af83-…`, linear `…-4dbe-b094-…`, nodejs `…-4acf-b1a5-…`, vscode `…-4ecf-91a5-…`). Keep `z.uuid()` and all contracts unchanged.
- **Option B: relax the validator** to `z.guid()` (Zod 4) in R3/design §4 while keeping R10/R13 as approved. `z.guid()` accepts all 26 approved values and still rejects `'not-a-uuid'`, so every other test/assertion stands. Cost: version/variant positions are no longer validated.

When the choice is approved, the follow-up is small: Option A touches the 8 JSONs + R10/design tables + the test seed table; Option B touches one line of `technologies-schema.ts` + R3/design wording. Then tasks 9.1–9.6 (format/lint/check/test/build/preview/scope) can be completed.

## 7. Deviations from the spec (with justification)

1. `tests/projects-schema.test.ts` updated (file not in `design.md` §3): R1 mandates `export const collections = { projects, technologies };`; the existing test asserted the old export string. Mechanical, one-line assertion update required for a green suite; no projects behavior changed.
2. Style tests normalize whitespace before matching: Prettier wraps the long `--font-mono` declaration, so `exposes_font_mono_token` normalizes the file first (the same pattern used by `tests/tokens.test.ts`). The asserted value is still exact and declared once.
3. `pnpm format` was run once (task 9.1). It reformatted two pre-existing unrelated files (`.opencode/skills/astro-modern-practices/SKILL.md`, `progress/review_projects-section.md`); both were reverted with `git checkout --`, so only feature files appear as changes.
4. No changes to `feature_list.json` or `progress/current.md` (leader-owned), per instructions. Not committed (per instructions).

## 8. Current validation snapshot

- `pnpm lint` → green (no warnings).
- `pnpm check` → red: content schema rejects the 8 ids of §6.
- `pnpm test` → 131 passed / 2 failed (both §6), 133 total.
- `pnpm build` → blocked by the same content schema error (not run further).
- Task 9.5 (`pnpm preview` visual comparison) not possible until the build is green.

## 9. Resolution (2026-09-30) — Option A approved; status `ready_for_review`

The leader approved the mechanical correction (Option A): keep `id: z.uuid()` (R3) and the 26-entry list (R10), fix only the 8 malformed ids. Applied consistently to the four sources of truth (seed JSONs, `requirements.md` R10, `design.md` §5, `tests/technologies-content.test.ts` seed table). No other spec/design change.

Changed ids (old → new; only the 4th group's variant nibble changed):

| File          | Old id                                 | New id                                 |
| ------------- | -------------------------------------- | -------------------------------------- |
| `css3.json`   | `6fa13057-c283-4fbe-d094-7142b35f86ac` | `6fa13057-c283-4fbe-9094-7142b35f86ac` |
| `git.json`    | `4d8f1e35-a061-4b9c-ce72-5f2031b76e8a` | `4d8f1e35-a061-4b9c-be72-5f2031b76e8a` |
| `github.json` | `5e902f46-b172-4cad-df83-603142c87f9b` | `5e902f46-b172-4cad-bf83-603142c87f9b` |
| `go.json`     | `81c35279-e4a5-4bd0-f2b6-9364d57ba8ce` | `81c35279-e4a5-4bd0-b2b6-9364d57ba8ce` |
| `html5.json`  | `5e902f46-b172-4ead-cf83-6031a24e759b` | `5e902f46-b172-4ead-af83-6031a24e759b` |
| `linear.json` | `6fa13057-c283-4dbe-e094-714253d980ac` | `6fa13057-c283-4dbe-b094-714253d980ac` |
| `nodejs.json` | `70b24168-d394-4acf-e1a5-8253c46a97bd` | `70b24168-d394-4acf-b1a5-8253c46a97bd` |
| `vscode.json` | `70b24168-d394-4ecf-f1a5-825364e0a1bd` | `70b24168-d394-4ecf-91a5-825364e0a1bd` |

Post-fix check: 26/26 ids pass `z.uuid()` and remain pairwise distinct; no old id remains anywhere outside this historical report.

### Verification commands and results (tasks 9.1–9.6)

| Command / check                                                                                       | Result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec prettier --write` on the feature files only (specs, seeds, component, page, styles, tests) | all files clean/unchanged after the run; no unrelated file reformatted                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `pnpm lint`                                                                                           | green                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `pnpm check` (`astro check`, 28 files)                                                                | 0 errors, 0 warnings, 0 hints                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `pnpm test`                                                                                           | 13 files, **133/133 tests green** (R10 and R13 now green)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `pnpm build`                                                                                          | green; 1 page built                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `dist/` checks (9.4)                                                                                  | `dist/icons/logos/` has the 26 SVGs; `dist/index.html` has `id="tech-stack"`, the 4 `tech-stack__category-title` headings in order, 26 `<img src="/icons/logos/…" alt="…">`, the quote text; exactly 1 script tag (the inlined hero clipboard enhancement), 0 `astro-island`, 0 inline handlers, 0 separate JS assets, 0 external requests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Negative spot-check A (9.4)                                                                           | adding an unknown key `tags` to `react.json` → `InvalidContentEntryDataError`, build exit 1 (reverted)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Negative spot-check B (9.4)                                                                           | duplicating an id in `docker.json` → build fails with `Duplicate technology id: 0e4b7a91-6c2d-4f58-9a3e-1b7c5d8f2046`, exit 1 (reverted; final rebuild green)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Preview (9.5)                                                                                         | `pnpm preview` + browser checks on `http://localhost:4321/`: section after `#projects`; 4 glass cards in `TECHNOLOGY_CATEGORIES` order; 26 chips, all images load (26/26, no failures, all requests local, no CDN); grid 4 columns at 1280px, 2 at 900px, 1 at 700px; header row/flex-end at ≥768px, column below; quote row at ≥640px, column below; chip hover → `scale(1.1)` + `border rgba(53,37,205,0.5)` + `background 0.9`; card hover → `translateY(-3px)` + `background 0.62` + indigo border; entrance animation `fadeInSlideUp 0.75s` delay 0.2s forwards; with `prefers-reduced-motion: reduce` all animation/transition durations collapse to `0.01ms`. Screenshot compared against `specs/projects-section/references/projects-section.html` lines 1199–1733: header, bento, chips and quote bar match; the section renders and no client JS runs. |
| Scope check (9.6)                                                                                     | No new dependency (`package.json` untouched); tracked changes limited to `src/content.config.ts`, `src/pages/index.astro`, `src/styles/tokens.css`, `tests/index.test.ts`, `tests/projects-section.test.ts`, `tests/projects-schema.test.ts` (R1-forced one-liner); new files are the 26 seeds, 26 icons, schema module, component and 3 test files; spec tables updated for the approved id correction. No unrelated file modified.                                                                                                                                                                                                                                                                                                                                                                                                                             |

### Remaining deviations

- Same as §7: `tests/projects-schema.test.ts` one-line assertion update (not in `design.md` §3, forced by R1) and whitespace-normalized `--font-mono` assertion (Prettier line wrap). No new deviations.
- `pnpm format` (global) side effect was avoided this round by formatting only the feature files; the two previously reformatted unrelated files remain untouched in the worktree.

### Status

`ready_for_review`: all tasks 1.1–9.6 are `[x]`, traceability R1–R44 is covered by green tests, `pnpm validate` is fully green. The feature is **not** marked `done`; `feature_list.json` and `progress/current.md` were not touched and nothing was committed.
