# Review — feature hero-section (id 2)

**Veredicto:** APPROVED

- **Feature:** `hero-section` (id 2, `sdd: true`, status `in_progress`).
- **Spec:** `specs/hero-section/{requirements,design,tasks}.md` (human-approved).
- **Reviewer:** `reviewer` subagent, 2026-09-28.
- **Scope:** implementation against the approved spec, repo standards (`AGENTS.md`, `docs/*`, `CHECKPOINTS.md`) and the blinded `git status`/`dist/` state.

## 1. Verification executed (exact results)

`pnpm validate` (lint → check → test → build): **exit code 0**

| Step                         | Result                                  |
| ---------------------------- | --------------------------------------- |
| `pnpm lint` (`eslint .`)     | clean, 0 errors                         |
| `pnpm check` (`astro check`) | 16 files, 0 errors, 0 warnings, 0 hints |
| `pnpm test` (`vitest run`)   | 7 files, 42/42 tests passed             |
| `pnpm build` (`astro build`) | 1 static page built                     |

Additional independent checks:

- `pnpm exec prettier --check tests src` → fails on `tests/clipboard.test.ts` only (1 line wrap, see §6.1); `src/` is clean. `pnpm format:check .` additionally flags `progress/impl_hero-section.md` (report tables) and pre-existing `.opencode/skills/astro-modern-practices/SKILL.md` (committed at `74cf8a8`, unmodified by this feature — baseline, not a regression).
- `dist/index.html`: exactly 1 `<script>` (inline module containing `toast--visible`, `2600`, `navigator.clipboard`, `#copy-email-hero-btn`, `#toast`); 0 `astro-island`; 0 external/remote script `src`; 0 `fonts.googleapis.com` / `fonts.gstatic.com` / remote `url(http…)` anywhere in `dist/`; 9 local `.woff2` in `dist/_astro/`; initial toast class is `toast` with no `toast--visible`.
- Body order in `dist/index.html`: `.blooms` → `<main class="site-main">` → `#toast` (last child of `<body>`, as design §6 requires).
- Grep sweep: no `console.log`, no `TODO`/`FIXME`, no `outline: none|0`, no inline `on*=` attributes, no `eslint-disable`, no `@ts-ignore`, no `any` in `src/` or `tests/`.
- Traceability cross-check (scripted): 40 traceability rows → 42 unique test names; all 42 exist in `tests/`; 0 tests on disk without a requirement mapping.
- Architecture/scope: `src/pages/` only routes; components in `src/components/` (PascalCase); styles in `src/styles/`; no `client:*` islands; no files modified outside design §3 plus the documented `tests/node-shims.d.ts` shim and the plan files (`package.json`, `pnpm-lock.yaml`, `feature_list.json`, `progress/*`). `pnpm-lock.yaml` diff adds only the two Fontsource packages.

## 2. Traceability R1–R40 ↔ tests

Test bodies were read, not just names. Every requirement has at least one concrete test asserting its exact values; no spec-vs-code mismatch was found (tokens, sizes, colors, timings, paths, breakpoints 768/1024).

| R   | Covered by                                                                                              | Result | Notes                                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | `tests/tokens.test.ts` → `exposes_semantic_color_tokens`                                                | [x]    | 31 properties, exact hex values (`src/styles/tokens.css:3-33`).                                                                                                            |
| R2  | `tests/tokens.test.ts` → `exposes_page_palette_color_tokens`                                            | [x]    | 13 palette properties, exact values (`tokens.css:36-48`).                                                                                                                  |
| R3  | `tests/tokens.test.ts` → `exposes_font_family_tokens`                                                   | [x]    | Exact Fontsource stacks (`tokens.css:51-52`).                                                                                                                              |
| R4  | `tests/tokens.test.ts` → `exposes_typography_scale_tokens`                                              | [x]    | 11 entries × size/line-height/letter-spacing/weight, all exact (`tokens.css:55-98`).                                                                                       |
| R5  | `tests/tokens.test.ts` → `exposes_spacing_tokens`                                                       | [x]    | 9 exact values (`tokens.css:101-109`).                                                                                                                                     |
| R6  | `tests/tokens.test.ts` → `exposes_radius_tokens`                                                        | [x]    | 5 exact values (`tokens.css:112-116`).                                                                                                                                     |
| R7  | `tests/fonts.test.ts` → `declares_fontsource_dependencies`                                              | [x]    | Both packages under `dependencies` (`package.json:22-23`); lockfile confirms only these were added.                                                                        |
| R8  | `tests/fonts.test.ts` → `imports_fontsource_entry_stylesheets`                                          | [x]    | `global.css:1-3`; build bundles 9 local `.woff2` (independently verified).                                                                                                 |
| R9  | `tests/fonts.test.ts` → `does_not_reference_external_font_providers`                                    | [x]    | Scans all `src/` + rendered page; `dist/` independently verified clean.                                                                                                    |
| R10 | `tests/global-styles.test.ts` → `applies_design_body_styles`                                            | [x]    | 12 declarations exact (`global.css:45-63`).                                                                                                                                |
| R11 | `tests/global-styles.test.ts` → `applies_base_resets`                                                   | [x]    | 7 reset rules exact (`global.css:6-43`).                                                                                                                                   |
| R12 | `tests/global-styles.test.ts` → `applies_selection_colors`                                              | [x]    | Exact (`global.css:65-68`).                                                                                                                                                |
| R13 | `tests/global-styles.test.ts` → `hides_webkit_scrollbar`                                                | [x]    | Exact (`global.css:70-72`).                                                                                                                                                |
| R14 | `tests/global-styles.test.ts` → `enables_smooth_scroll`                                                 | [x]    | Exact (`global.css:74-76`).                                                                                                                                                |
| R15 | `tests/global-styles.test.ts` → `honors_reduced_motion`                                                 | [x]    | Exact block (`global.css:78-87`).                                                                                                                                          |
| R16 | `tests/global-styles.test.ts` → `defines_fade_in_up_animation_and_delays`                               | [x]    | Keyframes + utility + 4 delays exact (`global.css:89-119`).                                                                                                                |
| R17 | `tests/hero.test.ts` → `renders_hero_structure`                                                         | [x]    | Container API: `section#overview`, 1 `<h1>`, 1 `<p>`, exactly 1 `<a>` + 1 `<button>` in `.hero__actions`, `href="#projects"`.                                              |
| R18 | `tests/hero.test.ts` → `renders_verbatim_hero_texts`                                                    | [x]    | All four strings verbatim; accent fragment is the `<span>`.                                                                                                                |
| R19 | `tests/hero.test.ts` → `styles_hero_headline`                                                           | [x]    | 6 declarations + `4.25rem` at 768px (paired via `extractResponsiveRule`).                                                                                                  |
| R20 | `tests/hero.test.ts` → `styles_gradient_accent_fragment`                                                | [x]    | 9 declarations including both `background-clip` variants and filter.                                                                                                       |
| R21 | `tests/hero.test.ts` → `styles_glass_tagline`                                                           | [x]    | 14 declarations + `1.05rem` at 768px.                                                                                                                                      |
| R22 | `tests/hero.test.ts` → `styles_primary_cta`                                                             | [x]    | Rest/hover/active + shared `.hero__cta`; `href` asserted in R17 test.                                                                                                      |
| R23 | `tests/hero.test.ts` → `styles_secondary_cta`                                                           | [x]    | All states; button `type="button"`, no `aria-disabled`, no `disabled`.                                                                                                     |
| R24 | `tests/hero.test.ts` → `renders_inline_svg_icons`                                                       | [x]    | Exact paths, viewBox, 18px, `fill`, `aria-hidden`, icon transition and hover transforms; no icon font.                                                                     |
| R25 | `tests/hero.test.ts` → `applies_hero_geometry`                                                          | [x]    | Section + inner + content + actions; `7rem` at 768px.                                                                                                                      |
| R26 | `tests/index.test.ts` → `renders_spanish_document_shell`                                                | [x]    | `lang="es"`, charset, viewport, generator, exact title/description (`&amp;` accepted), both favicons.                                                                      |
| R27 | `tests/index.test.ts` → `renders_page_shell_geometry`                                                   | [x]    | `<main class="site-main">` nesting + `.site-main`/`.site-container` values, `3rem` at 1024px.                                                                              |
| R28 | `tests/index.test.ts` → `ships_only_clipboard_enhancement`                                              | [x]    | 1 script in sources and in rendered HTML, no `is:inline`, no `client:`, no external/handler; `addEventListener` wiring asserted by R32 test; `dist/` has exactly 1 script. |
| R29 | `tests/index.test.ts` → `renders_atmospheric_blooms_layer`                                              | [x]    | Layer + exactly 3 blobs, exact positions/sizes/gradients/blur and `border-radius: var(--radius-full)`.                                                                     |
| R30 | `tests/global-styles.test.ts` → `does_not_suppress_focus_outlines`                                      | [x]    | Regex sweep over all `src/` files.                                                                                                                                         |
| R31 | `tests/index.test.ts` → `renders_exactly_one_h1`                                                        | [x]    | Counts exactly 1 `<h1` in the page.                                                                                                                                        |
| R32 | `tests/clipboard.test.ts` → `copies_contact_email_to_clipboard`, `wires_copy_listener_to_secondary_cta` | [x]    | Fake `ClipboardWriter` receives the email; static wiring asserts `#copy-email-hero-btn`, `dataset.email`, `addEventListener`, no `onclick`; rendered `data-email`.         |
| R33 | `tests/clipboard.test.ts` → `defines_contact_email_once`                                                | [x]    | Exactly 1 literal in `src/` (`HeroSection.astro:2`); script reads `dataset.email`; clipboard module has no literal.                                                        |
| R34 | `tests/clipboard.test.ts` → `shows_toast_with_copy_message`                                             | [x]    | Constant + message + visible class on a fake toast view.                                                                                                                   |
| R35 | `tests/clipboard.test.ts` → `handles_clipboard_rejection`                                               | [x]    | Resolves `false`, `onSuccess` never runs, including the missing-`navigator.clipboard` path.                                                                                |
| R36 | `tests/toast.test.ts` → `renders_hidden_toast`                                                          | [x]    | Exactly 1 `#toast`, `role="status"`, `aria-live="polite"`, message span, initial hidden state.                                                                             |
| R37 | `tests/toast.test.ts` → `styles_toast`                                                                  | [x]    | 18 declarations exact, including both backdrop-filter prefixes.                                                                                                            |
| R38 | `tests/toast.test.ts` → `defines_toast_visibility_states`                                               | [x]    | Hidden + visible declarations exact.                                                                                                                                       |
| R39 | `tests/clipboard.test.ts` → `hides_toast_after_2600ms`, `restarts_hide_timer_on_new_show`               | [x]    | Fake timers; constant `2600`; timer restarts on re-reveal.                                                                                                                 |
| R40 | `tests/toast.test.ts` → `renders_toast_icon`                                                            | [x]    | Exact path, viewBox, 18px, `aria-hidden`, `var(--color-primary)`.                                                                                                          |

## 3. Tasks

- `1.1`–`9.4`: all `[x]` in `specs/hero-section/tasks.md`.
- `9.5` (manual browser clipboard check): `[ ]` with documented justification in `progress/impl_hero-section.md` ("Tasks checked / unchecked") and `progress/current.md`. Per `docs/specs.md` ("rejects if a `[ ]` remains without documented justification"), the justification is acceptable: a real browser + real clipboard + `pnpm preview` secure context are unavailable to an agent here, and the behaviour it covers (copy, toast message, ~2.6 s auto-hide, timer restart) is unit-tested with fakes and fake timers in `tests/clipboard.test.ts`.
- **Decision:** 9.5 does **not** block approval. It remains an explicit human verification step; the human decides whether to run it (and check it) or to accept the documented justification before the feature is marked `done`.
- Definition of done otherwise met: traceability complete, no out-of-plan files, single bundled client script.

## 4. Deviations assessment

1. **`tests/node-shims.d.ts` — ACCEPTED.**
   - Necessary because `tsconfig.json` has `include: ["**/*"]`, so `astro check` type-checks `tests/**`, and the repo ships no `@types/node` (see `package.json` devDependencies); adding it would add an unplanned dependency and `tsconfig.json` is off-limits per the feature DoD.
   - Only the used surface is declared: `Dirent { name; isDirectory() }`, `readFileSync(path: URL | string, encoding: 'utf8'): string`, `readdirSync(path, { withFileTypes: true }): Dirent[]`. Tests pass `new URL(...)` and explicit `'utf8'`. No suppressions (`@ts-ignore`, `eslint-disable`), no `any`, no unused APIs.
   - Alternative offered to the human: add `@types/node` as a devDependency and delete the shim. The current solution avoids a dependency; accepted as documented.
2. **Prettier reflow of spec/reference files — ACCEPTED WITH NOTE.**
   - `specs/` is untracked (never committed), so a byte-level baseline diff is impossible. The requirements/design tables still match `design-notes.md`, and every test derived from them passes; no substantive content change was detected.
   - Side effect found: the reflow of `references/chromatic-glass.html` shifted its line numbers, so the citations in `requirements.md:4` and `design.md:5` are now stale: hero cited at `272–296` is at `551–611`; toast cited at `789–806` is at `2111–2121`; global styles cited at `3–42` are now the `<style>` block at `30–108`; "page shell: line 75" is now `<body>` at `274`. Docs-only, non-blocking (§6.2).
   - `.opencode/skills/astro-modern-practices/SKILL.md` reformat was correctly reverted (`git status` clean; last commit `74cf8a8`).

## 5. Checkpoints

| Checkpoint                  | Result | Notes                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C1 — harness complete       | [x]    | Base files and docs exist; `pnpm validate` green.                                                                                                                                                                                                                                                                                                                                                                  |
| C2 — coherent state         | [x]    | Exactly one `in_progress` (hero-section); feature 1 `done` with tests green (42 total); `progress/current.md` describes the active session.                                                                                                                                                                                                                                                                        |
| C3 — architecture respected | [x]    | Pages only routes; components PascalCase; no `console.log`/TODO; no `client:*`; the single script is the R28-approved enhancement.                                                                                                                                                                                                                                                                                 |
| C4 — real verification      | [x]    | `tests/` covers the units; 42/42 green; `astro check` 0 errors.                                                                                                                                                                                                                                                                                                                                                    |
| C5 — session closure        | [x]    | No suspicious artifacts (`dist/` gitignored; feature files pending commit); feature correctly `in_progress`; `progress/history.md` entry is expected at session close (lifecycle §5) and is not a review defect.                                                                                                                                                                                                   |
| C6 — SDD                    | [x]    | All three spec files exist; all R covered; tasks all `[x]` except the justified 9.5. EARS note: R29 carries a second MUST clause ("All three blobs MUST be circular") besides the main one, deviating from the one-MUST rule in `docs/specs.md:61`; it is a human-approved spec detail, both clauses are tested, and it does not block the implementation — recommend splitting R29 next time the spec is touched. |

## 6. Non-blocking observations (fix recommended before session close)

1. **`tests/clipboard.test.ts:95` is not Prettier-clean.** `pnpm exec prettier --check tests src` exits 1; Prettier expects the call wrapped:
   ```ts
   expect(compactHeroSource).toContain(
     'document.querySelector<HTMLButtonElement>(',
   );
   ```
   Actual keeps the 88-char single line. `progress/impl_hero-section.md` (report tables) is also not Prettier-aligned. Fix: `pnpm exec prettier --write tests/clipboard.test.ts progress/impl_hero-section.md`. Not blocking: `pnpm validate` (the repo gate) is green, `format:check` is not part of it, the baseline already fails on a committed file, and the diff has zero functional impact — but it makes task 9.1's "format was run" claim inaccurate in the final state.
2. **Stale line citations** in `requirements.md:4` / `design.md:5` after the reference HTML reflow (§4.2). Recommended: update the citations or add `specs/hero-section/references/*.html` to `.prettierignore`. Docs-only.
3. **R29 EARS nit** (§5, C6). Human-approved spec-level detail; not the implementer's call.
4. **Visual fidelity limitation.** No browser is available in this environment, so hero/toast/blooms were verified by exact declaration comparison against `design-notes.md`, the R19–R40 tables and the reference HTML — all values match — but no pixel-level comparison was possible (`chromatic-glass.png` is a 161×512 thumbnail captured mid-animation and is not a usable reference, as the implementer reported). This is the same limitation covered by task 9.5.

## 7. Blocking issues

**None.** `pnpm validate` is green; R1–R40 all have concrete tests that assert the specified values; tasks are complete except the documented, agent-unverifiable 9.5; both deviations are acceptable. Task 9.5 remains a human verification step.
