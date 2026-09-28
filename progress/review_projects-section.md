# Review — feature projects-section (id 3)

**Veredicto:** APPROVED

- **Feature:** `projects-section` (id 3, `sdd: true`, status `in_progress`).
- **Spec:** `specs/projects-section/{requirements,design,tasks}.md` (R1–R45, human-approved).
- **Reviewer:** `reviewer` subagent, 2026-09-28.
- **Scope:** implementation against the approved spec, `AGENTS.md`, `docs/*`, `CHECKPOINTS.md`, and the blinded `git status` state.

## 1. Verification executed (exact results)

`pnpm validate` (lint → check → test → build): **exit code 0**

| Step                         | Result                                      |
| ---------------------------- | ------------------------------------------- |
| `pnpm lint` (`eslint .`)     | clean, 0 errors                             |
| `pnpm check` (`astro check`) | 23 files, 0 errors, 0 warnings, 0 hints     |
| `pnpm test` (`vitest run`)   | 10 files, 87/87 tests passed                |
| `pnpm build` (`astro build`) | 1 static page + 4 optimized WebP images     |

Independent checks (not taken from the impl report):

- **Branch B really is the chosen branch and the tests do not depend on the content layer.** `tests/projects-content.test.ts` reads the real seeds/covers from the filesystem (`readFileSync`/`readdirSync`, `tests/projects-content.test.ts:1,96-135,138-262`); the page-rendering path is mocked with `vi.mock('astro:content')` plus real `ImageMetadata` covers (`tests/index.test.ts:5-68`, `tests/projects-section.test.ts:9-72`). I deleted the generated `.astro/` cache (`rm -rf .astro`) and ran `pnpm test`: 87/87 green, i.e. no prior `astro sync`/`pnpm build` is required. Outcome recorded in `progress/current.md:11-19`.
- **No spike test left behind.** `git status --porcelain -uall` lists exactly the three intended new test files and no temp/probe file; `rg -il 'spike|temporary probe' src tests` finds nothing in code.
- **R32 test genuinely renders `<Image>`.** `tests/projects-section.test.ts:7` imports `src/content/projects/covers/synapse.webp` as real `ImageMetadata`; `renders_project_card_covers` (lines 469-491) renders through the Container API and asserts the emitted `<img>` (`alt`, `width="640"`, `height="400"`, `loading="lazy"`, `class="project-card__image"`, non-empty `src`). Ran in isolation: pass, not skipped (`-t` run: 1 passed).
- **`sharp` is the only new dependency.** `git diff HEAD -- package.json` adds only `"sharp": "^0.35.4"` under `dependencies`; the lockfile adds `sharp@0.35.4`, `detect-libc` and sharp's platform packages. No Astro integration/UI library added.
- **No files outside `design.md` §3** (plus the SDD process artifacts `progress/*`, `specs/*`, `feature_list.json` and `pnpm-lock.yaml`): `git status` shows exactly the §3 files plus those process files.
- **Duplicate priority/id fail the build with the exact messages.** I temporarily set `vanguard-cli.md` `priority: 4 → 1` and `id → synapse id`, ran `pnpm build` per case, then restored the file byte-identically (`cmp` against `/tmp` backups: identical). Both builds aborted with `Error: Duplicate project priority: 1` / `Error: Duplicate project id: 6f9c1c1e-4a7b-4a3e-9d2f-1f5c8a2b7e10` (R6/R7/R8).
- **Single client script and single `<h1>`.** `dist/index.html`: exactly 1 `<script type="module">` whose content is the hero clipboard enhancement (`Correo copiado al portapapeles`), 0 `astro-island`, 0 remote scripts, exactly 1 `<h1>`, 1 `<h2>`; 1 featured + 3 grid cards; 4 `/_astro/*.webp` covers with `width="640" height="400" loading="lazy"` and the seed alts; 4 `https://example.com` links, 3 `https://github.com` links (Aether omits GitHub).
- **`coverAlt` matches the gradient-only covers.** All four covers are real raster `WEBP 1280x800` (`file`/`magick identify`), 2886–4224 bytes ≤ 262144. Sampled top/bottom pixels differ and reproduce the design §10 gradient pairs (`#3525cd→#818cf8` indigo, `#4f46e5→#6366f1` blue, `#8b5cf6→#3525cd` violet, `#6366f1→#4f46e5` light indigo), so the four "degradado …" alts are accurate.
- **Traceability cross-check (scripted):** 45/45 requirements mapped, 45/45 mapped test names exist in `tests/`; no test on disk lacks an `R<n>` mapping.

## 2. Traceability requirements ↔ tests

Test bodies were read, not just names; each asserts the values of its requirement.

| Req | Covered by                                                              | Result |
| --- | ----------------------------------------------------------------------- | ------ |
| R1  | `tests/projects-schema.test.ts` → `declares_collection_configuration`   | [x]    |
| R2  | `tests/projects-schema.test.ts` → `keeps_schema_module_free_of_astro_virtual_modules` | [x] |
| R3  | `tests/projects-schema.test.ts` → `validates_project_frontmatter_contract` | [x] |
| R4  | `tests/projects-schema.test.ts` → `defaults_featured_to_false`          | [x]    |
| R5  | `tests/projects-schema.test.ts` → `sorts_projects_by_priority`          | [x]    |
| R6  | `tests/projects-schema.test.ts` → `rejects_duplicate_priorities`        | [x]    |
| R7  | `tests/projects-schema.test.ts` → `rejects_duplicate_ids`               | [x]    |
| R8  | `tests/projects-section.test.ts` → `validates_projects_at_render_time` (+ independent build check) | [x] |
| R9  | `tests/projects-content.test.ts` → `defines_four_project_entries`       | [x]    |
| R10 | `tests/projects-content.test.ts` → `matches_seed_frontmatter`           | [x]    |
| R11 | `tests/projects-content.test.ts` → `omits_github_url_for_aether_cloud`  | [x]    |
| R12 | `tests/projects-content.test.ts` → `includes_seed_bodies`               | [x]    |
| R13 | `tests/projects-content.test.ts` → `provides_raster_cover_files`        | [x]    |
| R14 | `tests/projects-content.test.ts` → `declares_cover_webp_format`         | [x]    |
| R15 | `tests/projects-content.test.ts` → `keeps_covers_within_weight_bound`   | [x]    |
| R16 | `tests/projects-content.test.ts` → `declares_image_service_dependency`  | [x]    |
| R17 | `tests/projects-section.test.ts` → `exposes_slate_600_token`            | [x]    |
| R18 | `tests/projects-section.test.ts` → `renders_projects_section_after_hero`| [x]    |
| R19 | `tests/projects-section.test.ts` → `styles_section_geometry`            | [x]    |
| R20 | `tests/projects-section.test.ts` → `reuses_global_entry_animation`      | [x]    |
| R21 | `tests/projects-section.test.ts` → `renders_section_header`             | [x]    |
| R22 | `tests/projects-section.test.ts` → `styles_section_label`               | [x]    |
| R23 | `tests/projects-section.test.ts` → `styles_section_label_rule`          | [x]    |
| R24 | `tests/projects-section.test.ts` → `styles_section_title`               | [x]    |
| R25 | `tests/projects-section.test.ts` → `styles_section_subtitle`            | [x]    |
| R26 | `tests/projects-section.test.ts` → `styles_section_header_geometry`     | [x]    |
| R27 | `tests/projects-section.test.ts` → `renders_featured_card_and_ordered_grid` | [x] |
| R28 | `tests/projects-section.test.ts` → `styles_featured_card`               | [x]    |
| R29 | `tests/projects-section.test.ts` → `styles_standard_card`               | [x]    |
| R30 | `tests/projects-section.test.ts` → `styles_projects_grid`               | [x]    |
| R31 | `tests/projects-section.test.ts` → `styles_card_hover`                  | [x]    |
| R32 | `tests/projects-section.test.ts` → `renders_project_card_covers` (real `ImageMetadata`, Container API) | [x] |
| R33 | `tests/projects-section.test.ts` → `styles_card_covers`                 | [x]    |
| R34 | `tests/projects-section.test.ts` → `styles_card_titles` (+ `<h3>` in R32 test) | [x] |
| R35 | `tests/projects-section.test.ts` → `styles_card_descriptions` (+ rendered text in R32 test) | [x] |
| R36 | `tests/projects-section.test.ts` → `renders_technology_pills`           | [x]    |
| R37 | `tests/projects-section.test.ts` → `styles_technology_pills`            | [x]    |
| R38 | `tests/projects-section.test.ts` → `renders_website_links`              | [x]    |
| R39 | `tests/projects-section.test.ts` → `renders_github_link_when_present`   | [x]    |
| R40 | `tests/projects-section.test.ts` → `omits_github_link_when_absent`      | [x]    |
| R41 | `tests/projects-section.test.ts` → `marks_external_links_with_accessible_names` | [x] |
| R42 | `tests/projects-section.test.ts` → `renders_link_icons`                 | [x]    |
| R43 | `tests/projects-section.test.ts` → `ships_no_client_javascript` + `tests/index.test.ts` → `ships_only_clipboard_enhancement` | [x] |
| R44 | `tests/projects-section.test.ts` → `renders_single_h2` + `tests/index.test.ts` → `renders_exactly_one_h1` | [x] |
| R45 | `tests/projects-section.test.ts` → `loads_project_collection_in_index` (source wiring + mocked page render) | [x] |

## 3. Tasks completas

- Sections 1–12 of `specs/projects-section/tasks.md`: all tasks `[x]`.
- 7.1/7.2: spike executed with the two acceptance criteria, outcome FAILS → branch B recorded in `progress/current.md:11-19` and replicated independently here (`.astro` removed, tests green).
- 7.3: temporary spike test deleted — confirmed (`git status -uall`).
- 7.4: `[x]` marked "not needed" with the documented `vi.mock` interception justification.
- 12.5: executed structurally (preview HTTP 200, served HTML inspected); the pixel comparison / hover / reduced-motion visuals are explicitly flagged for the human (no browser in this environment) inside `tasks.md:89` and `progress/impl_projects-section.md:35-40`. The hover contract is pinned by `styles_card_hover` and reduced motion by the global test from the hero spec.

## 4. Checkpoints

| Checkpoint                  | Result | Notes                                                                                                                                  |
| --------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| C1 — harness complete       | [x]    | Base files + docs exist; `pnpm validate` exit 0.                                                                                        |
| C2 — coherent state         | [x]    | Only `projects-section` `in_progress`; hero `done` with green tests; `progress/current.md` describes the active session.                |
| C3 — architecture respected | [x]    | `src/pages/` only routes; components PascalCase; no `console.log`/TODO/FIXME/`any` in new code; no `client:*`; only the clipboard script. |
| C4 — real verification      | [x]    | 10 test files / 87 tests green; `astro check` 0 errors.                                                                                 |
| C5 — session closure        | [x]    | No suspicious artifacts (`dist/`, `.astro/` gitignored); untracked files are the feature's own artifacts pending commit; feature correctly `in_progress`; `history.md` entry happens at session close (lifecycle §5). |
| C6 — SDD                    | [x]    | Three spec files present; EARS with a note below; all tasks `[x]`; R1–R45 each covered by at least one concrete test.                   |

## 5. Non-blocking observations (no rejection)

1. **`progress/impl_projects-section.md` is not Prettier-clean** (`pnpm exec prettier --check src tests specs/... progress/impl_projects-section.md` warns only on that file; `src/`, `tests/` and the spec files are clean). Not gated by `pnpm validate`; recommended `pnpm exec prettier --write progress/impl_projects-section.md` before commit.
2. **EARS nit:** R20, R26 and R44 contain a second modal clause (`MUST NOT` / extra `MUST`) besides the main one, deviating from the one-MUST rule of `docs/specs.md:61`. Human-approved spec, all clauses tested; recommend splitting next time the spec is touched.
3. **Visual verification remains human-owned:** task 12.5's pixel comparison against `references/projects-section.png` and the hover/reduced-motion visuals could not be executed without a browser. All contracts are pinned by exact-value tests and the served/built HTML was verified.

## 6. Required changes

- None. `pnpm validate` green, R1–R45 fully traced, all tasks complete, no test skipped, no scope or architecture violation detected.
