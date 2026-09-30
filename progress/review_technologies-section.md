# Review — feature technologies-section (id 5)

**Verdict:** APPROVED
**Date:** 2026-09-30
**Reviewer:** reviewer agent. All evidence below was gathered independently
against the working tree, the built `dist/`, and a live `astro preview`
session; no implementer statement was taken at face value.

---

## 1. Gates executed (independent)

| Command / check                                                     | Result                                                                                                                                                                                    |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm validate` (lint + check + test + build)                       | **Green.** ESLint clean; `astro check` 28 files, 0 errors / 0 warnings / 0 hints; Vitest **13 files, 133/133 tests passed**; `astro build` completed (1 page, 4 optimized images reused). |
| `pnpm exec prettier --check` on every feature source/spec/test file | Clean (single exception, non-blocking, §8.1).                                                                                                                                             |
| `git status` / `git diff --stat` scope audit                        | Only `design.md` §3 files + the two authorized deviations (§5).                                                                                                                           |
| Live `pnpm preview` browser verification (Playwright)               | Section renders correctly; structure, fixed order, chips, quote bar, hovers, breakpoints, reduced motion all verified (§6).                                                               |
| Network audit on the preview page                                   | 35/35 requests local (`localhost:4321`), 26 icon 200s, **zero external/CDN requests**; 0 console errors/warnings.                                                                         |
| `dist/` audit                                                       | 1 `<script>` (inlined clipboard enhancement), 0 `astro-island`, 0 inline handlers, 0 separate JS assets, 26 icon files.                                                                   |

## 2. Traceability `R1`–`R44` ↔ concrete tests

Every requirement maps to at least one test whose assertions were read and
checked against the requirement text. No orphan test or uncovered `R<n>`.

| Req | Test (file → name)                                                                                    | Independent check                                                                                                                                                                                                                                                             |
| --- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | `technologies-schema` → `declares_collection_configuration`                                           | Asserts both loader imports, `glob({ base: './src/content/technologies', pattern: '**/*.json' })`, `schema: technologiesSchema`, `collections = { projects, technologies }`; matches `src/content.config.ts:1-16`.                                                            |
| R2  | `technologies-schema` → `keeps_schema_module_free_of_astro_virtual_modules`                           | Source imports only `astro/zod`, none of `astro:content`/`astro:loaders`/`astro:assets`; module imported and parsed in Vitest.                                                                                                                                                |
| R3  | `technologies-schema` → `validates_technology_contract`                                               | Accepts valid fixture; 13 rejection fixtures cover every "Rejected" cell of the R3 table (bad/missing id, bad/case/unknown/missing category, remote/png/uppercase/no-slash/missing iconUrl, missing/number name) plus the strict unknown-key (`tags`) case.                   |
| R4  | `technologies-schema` → `pins_category_order_constant`                                                | Asserted the exact four-label tuple in order plus schema rejection of a label outside it.                                                                                                                                                                                     |
| R5  | `technologies-schema` → `rejects_duplicate_ids`                                                       | Exact message `Duplicate technology id: <id>` from both `assertUniqueTechnologies` and `groupTechnologies` (`expectExactError`).                                                                                                                                              |
| R6  | `technologies-schema` → `groups_technologies_in_fixed_category_order`, `does_not_mutate_technologies` | Order + non-empty-only groups (partial fixture) + input array unchanged after grouping and after reversing a group.                                                                                                                                                           |
| R7  | `technologies-schema` → `sorts_technologies_alphabetically_within_category`                           | Code-point order proven with `CSS3`, `TypeScript`, `alpha` (uppercase before lowercase).                                                                                                                                                                                      |
| R8  | `technologies-section` → `validates_technologies_at_render_time`                                      | Source contains `groupTechnologies(technologies)`; duplicate-id render rejects with the exact R5 error.                                                                                                                                                                       |
| R9  | `technologies-content` → `defines_twenty_six_technology_entries`                                      | Exact 26 file names, count 26; independently listed the directory (26 `.json`).                                                                                                                                                                                               |
| R10 | `technologies-content` → `matches_seed_values`                                                        | Exact id/category/name/iconUrl per file + schema validation. Independently cross-checked all four sources (requirements R10 table, design §5, seeds, test table): **0 mismatches over 26 rows**.                                                                              |
| R11 | `technologies-content` → `declares_exactly_four_fields`                                               | `Object.keys(data).sort()` equals exactly the four keys for all 26 files.                                                                                                                                                                                                     |
| R12 | `technologies-content` → `covers_all_categories`                                                      | Set equality against `TECHNOLOGY_CATEGORIES` using the actual file contents (distribution 7/8/4/7 verified).                                                                                                                                                                  |
| R13 | `technologies-content` → `keeps_ids_unique`                                                           | 26 pairwise-distinct ids and each passes `technologiesSchema.shape.id.safeParse` (green under the installed Zod 4).                                                                                                                                                           |
| R14 | `technologies-content` → `provides_local_icon_files`                                                  | Exact 26 icon names, count 26, every seed `iconUrl` resolves; directory listing matches.                                                                                                                                                                                      |
| R15 | `technologies-content` → `declares_svg_icon_format`                                                   | Every icon contains `<svg`; `grep -L '<svg'` empty.                                                                                                                                                                                                                           |
| R16 | `technologies-content` → `keeps_icons_free_of_scripts`                                                | No `<script` in any icon; `grep -l` empty.                                                                                                                                                                                                                                    |
| R17 | `technologies-content` → `keeps_icons_within_weight_bound`                                            | Every file 0 < bytes ≤ 32768; largest is `ollama.svg` 8572 B; total 57,873 B, matching design §6 byte sizes exactly.                                                                                                                                                          |
| R18 | `technologies-section` → `exposes_font_mono_token`                                                    | Exact declaration (normalized) and exactly one `--font-mono:` occurrence; verified in `src/styles/tokens.css:54-56`.                                                                                                                                                          |
| R19 | `technologies-section` → `renders_tech_stack_section_after_projects`                                  | Page render: `#projects` before `#tech-stack`, exact class `tech-stack animate-fade-in-up animation-delay-200`, `scroll-margin-top: 6rem`. Browser: section after projects, inside `main.site-main`, computed `scroll-margin-top: 96px`.                                      |
| R20 | `technologies-section` → `styles_section_geometry`                                                    | Shell/inner/grid declarations + 768 px and 1024 px breakpoints. Browser: 4 columns at 1280, 2 at 945, 1 at 700.                                                                                                                                                               |
| R21 | `technologies-section` → `reuses_global_entry_animation`                                              | Classes reused, no `@keyframes` in the component; reduced-motion path is the global override covered by `tests/global-styles.test.ts` → `honors_reduced_motion` (exists, green). Browser with `prefers-reduced-motion: reduce`: animation and transition durations = 0.01 ms. |
| R22 | `technologies-section` → `renders_section_header`                                                     | Label `Stack Tecnológico`, rule span, `<h2>` + accent span `clave`, subtitle verbatim; one `<h2>` in the component render.                                                                                                                                                    |
| R23 | `technologies-section` → `styles_section_label`                                                       | Exact 7 declarations.                                                                                                                                                                                                                                                         |
| R24 | `technologies-section` → `styles_section_label_rule`                                                  | Exact 4 declarations.                                                                                                                                                                                                                                                         |
| R25 | `technologies-section` → `styles_section_title`                                                       | Exact `headline-lg` declarations + accent declarations.                                                                                                                                                                                                                       |
| R26 | `technologies-section` → `styles_section_subtitle`                                                    | Exact 7 declarations.                                                                                                                                                                                                                                                         |
| R27 | `technologies-section` → `styles_section_header_geometry`                                             | Column → row/`flex-end` at ≥768 px; heading/eyebrow geometry. Browser confirms both sides of the breakpoint.                                                                                                                                                                  |
| R28 | `technologies-section` → `renders_category_cards_in_fixed_order`                                      | 4 cards in `TECHNOLOGY_CATEGORIES` order, `<h3>` labels, alphabetical chips (`CSS3` before `TypeScript`), empty categories omitted; icons covered by R32. Browser: same order live.                                                                                           |
| R29 | `technologies-section` → `styles_category_cards`                                                      | Exact 11 declarations (glass box).                                                                                                                                                                                                                                            |
| R30 | `technologies-section` → `styles_category_hover`                                                      | Exact hover declarations. Browser: `translateY(-3px)`, bg 0.62, indigo border, both shadows.                                                                                                                                                                                  |
| R31 | `technologies-section` → `styles_category_headers`                                                    | Header/title/icon exact declarations.                                                                                                                                                                                                                                         |
| R32 | `technologies-section` → `renders_category_icons`                                                     | All 4 Material Symbols paths verbatim, `aria-hidden`, viewBox, 22×22, `currentColor`; no icon font.                                                                                                                                                                           |
| R33 | `technologies-section` → `styles_technology_items`                                                    | Exact list/chip/icon declarations.                                                                                                                                                                                                                                            |
| R34 | `technologies-section` → `styles_technology_item_hover`                                               | Exact hover declarations. Browser: `scale(1.1)`, border `rgba(53,205)`, bg 0.9, shadow, `cursor: default`.                                                                                                                                                                    |
| R35 | `technologies-section` → `renders_technology_icons`                                                   | `<li title>` + `<img class src alt width height loading="lazy">` per chip. Browser: 26/26 chips with correct title/alt/src and all images loaded.                                                                                                                             |
| R36 | `technologies-section` → `renders_quote_bar`                                                          | Decorative SVG container, quote text verbatim (curly quotes), badge `Filosofía Técnica`.                                                                                                                                                                                      |
| R37 | `technologies-section` → `styles_quote_bar`                                                           | Exact base, ≥640 px row, hover, main, icon declarations. Browser: base styles live.                                                                                                                                                                                           |
| R38 | `technologies-section` → `styles_quote_text`                                                          | Exact `headline-sm` + italic + primary declarations.                                                                                                                                                                                                                          |
| R39 | `technologies-section` → `renders_quote_icon`                                                         | `verified_user` path verbatim, 24×24, `aria-hidden`, viewBox, `currentColor`.                                                                                                                                                                                                 |
| R40 | `technologies-section` → `styles_quote_badge`                                                         | Exact 15 declarations incl. `--font-mono`.                                                                                                                                                                                                                                    |
| R41 | `technologies-section` → `ships_no_client_javascript`; `index` → `ships_only_clipboard_enhancement`   | Static scans of section + page sources; page scan extended to `TechnologiesSection.astro`. `dist/index.html`: exactly 1 script (inlined clipboard), 0 islands, 0 inline handlers; 0 external scripts.                                                                         |
| R42 | `technologies-section` → `renders_single_h2`; `index` → `renders_exactly_one_h1`                      | Section render: exactly 1 `<h2>`, 0 `<h1>`, 4 `<h3>`. Page: exactly 1 `<h1>`. Browser confirms live.                                                                                                                                                                          |
| R43 | `technologies-section` → `loads_technology_collection_in_index`                                       | Source asserts `getCollection('technologies')` → `.map(entry => entry.data)` → `<TechnologiesSection>` after `<ProjectsSection>`; rendered page includes fixture data. Built page includes the real 26-entry section.                                                         |
| R44 | `index` → `renders_exactly_one_h1`, `ships_only_clipboard_enhancement`                                | Page keeps 1 `<h1>` and 1 bundled script; the new section adds neither.                                                                                                                                                                                                       |

Notes: the section test's page fixture uses four technologies (one per
category) and an empty `projects` branch; the mock returns `[]` for the other
collection, so the placement test still exercises the real page wiring. The
`tests/index.test.ts` and `tests/projects-section.test.ts` mocks are
collection-aware and both suites stay green.

## 3. Tasks

`specs/technologies-section/tasks.md`: **all tasks 1.1–9.6 are `[x]`**, no
pending item, no justification needed. The claim in the implementer report
that 9.1–9.6 were blocked was superseded by the Resolution section; I
re-ran the whole gate set myself and it is green.

## 4. Scope audit

Tracked changes (`git diff --stat`):

| File                                       | Expected by design.md §3 | Notes                                                                                              |
| ------------------------------------------ | ------------------------ | -------------------------------------------------------------------------------------------------- |
| `src/content.config.ts`                    | yes                      | adds `technologies` collection; `projects` untouched.                                              |
| `src/pages/index.astro`                    | yes                      | collection load + component after `ProjectsSection`.                                               |
| `src/styles/tokens.css`                    | yes                      | `--font-mono` added once inside the font-family block; no other token changed.                     |
| `tests/index.test.ts`                      | yes                      | collection-aware mock + `TechnologiesSection.astro` added to scans.                                |
| `tests/projects-section.test.ts`           | yes                      | collection-aware mock (`technologies` → `[]`); project assertions untouched.                       |
| `tests/projects-schema.test.ts`            | **authorized deviation** | exactly the one-line `collections = { projects, technologies };` assertion update (diff verified). |
| `feature_list.json`, `progress/current.md` | leader-owned             | feature 5 added as `in_progress`; session notes only.                                              |

New files: `src/content/technologies-schema.ts`, `src/components/TechnologiesSection.astro`, 26 seed JSONs, 26 vendored SVGs under `public/icons/logos/`, 3 new test files, `specs/technologies-section/`, `progress/impl_technologies-section.md` — all covered by `design.md` §3 or the SDD process. No `package.json`, `astro.config.mjs`, layout, hero, projects or global-CSS change. No `console.log`, TODO, commented-out code or `any` in any new file; no ESLint disable directives.

Untracked `.playwright-mcp/` is browser-tooling output (the environment's
sanctioned output directory), not feature code — see non-blocking note §8.3.

## 5. Validated deviations and UUID correction

- **Option A UUID correction** (leader-approved): applied consistently to the
  four sources of truth. Programmatic extraction: 26 table rows in
  `requirements.md` R10, 26 rows in `design.md` §5, 26 seed JSONs and 26
  entries in the test seed table are **identical**, all **26 ids unique**, and
  all carry a valid RFC 9562 variant nibble (`8/9/a/b`); the extra UUID
  occurrence in `requirements.md` is the R3 example (react's id, already in
  the set). The green `keeps_ids_unique` proves `z.uuid()` accepts each id
  under the installed Zod. No old malformed id remains anywhere except the
  historical tables of `progress/impl_technologies-section.md`.
- **Seed content vs human approval:** 26 entries, exactly four fields each,
  four categories (7 Frontend / 8 Backend y Nube / 4 IA y Sistemas /
  7 Flujo de Trabajo y Diseño). Dropped `Pinecone`, `pgvector`, `WebSockets`,
  `Wasm` are absent; `Ollama` is present (svgl icon exists). Nothing else was
  substituted.
- **`tests/projects-schema.test.ts`** one-line update is the authorized
  deviation and is mechanical (R1 changes the exported collections object).

## 6. Spec conformance (browser + build, representative sample)

Live `astro preview` at `http://localhost:4321/` (Playwright):

- Section order: `#overview` → `#projects` → `#tech-stack`; section inside
  `main.site-main`, class string exact, scroll-margin 6rem.
- 4 glass cards, titles exactly `Frontend`, `Backend y Nube`,
  `IA y Sistemas`, `Flujo de Trabajo y Diseño` in order; 26 chips with the
  approved names, `title` + informative `alt`, all icons loaded (26/26 HTTP
  200 from `/icons/logos/`).
- Quote bar: decorative `verified_user` SVG (`aria-hidden`), quote text and
  `Filosofía Técnica` badge verbatim.
- CSS: 4/2/1 grid columns at 1280/945/700 px; header row + `flex-end` at
  ≥768 px, column below; quote column below 640 px, row above.
- Hover states: chip `scale(1.1)` + border `rgba(53,37,205,0.5)` + bg 0.9;
  card `translateY(-3px)` + bg 0.62 + indigo border + both shadows.
- Reduced motion (`prefers-reduced-motion: reduce`): animation and transition
  durations collapse to 0.01 ms; entrance uses the global
  `fadeInSlideUp 0.75s` with `animation-delay-200`.
- Heading structure: one `<h1>` (hero), one `<h2>` in the section, four
  `<h3>`; category/quote SVGs decorative; no icon font, no inline handlers,
  no console messages, no external requests.

## 7. CHECKPOINTS

- C1: [x] Base files and docs present; `pnpm validate` green.
- C2: [x] Exactly one feature `in_progress` (id 5); all `done` features still
  green (133/133); `progress/current.md` describes the active session.
- C3: [x] `src/pages/` only routes; components in `src/components/`
  (PascalCase); no debug `console.log`, TODOs or client JS beyond the
  pre-existing, justified clipboard enhancement.
- C4: [x] Tests exist for the new units; 133 tests green; `astro check` clean.
- C5: [x] No suspicious tracked/untracked files besides the browser-tool
  output dir (non-blocking, §8.3); `progress/history.md` holds the previous
  session entry; feature state (`in_progress`) is correct.
- C6: [x] `specs/technologies-section/` has the three files; EARS requirements
  (approved); all tasks `[x]`; every `R<n>` covered by a concrete test.

## 8. Non-blocking observations (no fix required for approval)

1. `progress/impl_technologies-section.md` is not Prettier-clean (markdown
   table padding only; every code/spec/test file is clean). Suggested cleanup
   at session close: `pnpm exec prettier --write progress/impl_technologies-section.md`,
   consistent with the previous review cycle's handling.
2. The top line of the implementer report still reads `Status: BLOCKED` while
   §9 supersedes it with `ready_for_review`; historical only.
3. `.playwright-mcp/` (untracked) contains browser-tool output from the
   implementation preview checks and from this review (screenshots, network
   log, page snapshots). It is the Playwright MCP's allowed output directory,
   but it is not gitignored; clean or ignore it before closing the session
   (C5 hygiene). It is not feature code and did not influence the verdict.
4. `requirements.md` R3 describes `z.uuid()` as "RFC 4122 UUID"; the installed
   Zod 4 enforces RFC 9562 variant bits (the reason for the approved Option A
   correction). Wording nit only; the corrected contract and tests are
   consistent.

## 9. Required fixes

**None.** Verdict: **APPROVED**.
