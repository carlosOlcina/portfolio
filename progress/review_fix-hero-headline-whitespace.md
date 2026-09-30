# Review — feature 7 (fix-hero-headline-whitespace)

**Veredicto:** APPROVED

Independent reviewer verification (2026-09-30) on branch `feat/create-github-actions`, reviewing
the uncommitted working tree against `HEAD` (`edd002b`). All gates were re-run from scratch under
the installed **Astro 7.3.5** (merge-ref dependency set, `pnpm-lock.yaml` pins `astro@7.3.5`,
`pnpm install --frozen-lockfile` reports the lockfile up to date). Requirements, tasks, diff,
spec/progress files and the scope extension were cross-checked with git, and the fix was reproduced
red-before / green-after on a pristine `git archive HEAD` tree in `/tmp/opencode` (no repo file
was modified by this review).

## Trazabilidad requirements ↔ tests

- **R1:** [x] `tests/hero.test.ts` → `emits_explicit_headline_space` (`:103-109`) extracts the raw
  `intersección de(.)<span` junction from the Container API output and pins the captured character
  to `' '` (U+0020); `renders_verbatim_hero_texts` (`:89-101`, assertion `:92-93`) contains
  `Desarrollo digital en la intersección de <span` on the whitespace-normalized output. Both green.
  Non-vacuous, independently proven: on a pristine pre-fix `HEAD` tree the junction renders
  `de<span` and `renders_verbatim_hero_texts` fails; with the fix applied both pass; removing the
  explicit construct makes the new test fail again.
- **R2:** [x] `emits_explicit_headline_space` source half (`:104`) asserts
  `/intersección de\s*\{\s*['"] ['"]\s*\}\s*<span/` against `heroSource` read from disk, so the space
  must exist as an explicit expression text node, not incidental template whitespace
  (`src/components/HeroSection.astro:9`). Non-vacuous: the removal mutation fails this assertion.
- **R3:** [x] `renders_verbatim_hero_texts` body is byte-identical: `git diff HEAD -- tests/hero.test.ts`
  shows a single `it(...)` addition (`:103-109`) and no other hunk. Its assertions (`:92-100`) are
  unchanged and green.
- **R4:** [x] `tests/hero.test.ts` → `renders_verbatim_hero_texts` under the merged Astro 7 install.
  Reproduced independently: pristine `HEAD` tree + installed Astro 7.3.5 → `de<span` failure exactly
  as in CI; applying the working-tree fix → green. Installed version and lockfile pin verified
  (`node -p` → `7.3.5`; `astro@7.3.5` in `pnpm-lock.yaml`).
- **R5:** [x] Only `tests/hero.test.ts` changed among test files (`git diff HEAD --name-only -- tests`);
  all other tests, including `tests/index.test.ts`, have unchanged bodies and pass. Full `pnpm test`
  = 14 files, 157/157 green; hero file isolated = 10/10.
- **R6:** [x] `tests/technologies-section.test.ts` → `renders_section_header` (`:270-283`, assertion
  `:275-277`) requires `Tecnologías y herramientas <span class="tech-stack__title-accent"` and the
  test body is unchanged (`git diff HEAD -- tests/technologies-section.test.ts` empty). Non-vacuous:
  pre-fix pristine `HEAD` renders `herramientas<span` and the test fails; with
  `src/components/TechnologiesSection.astro:42` fixed it passes.

All six requirements are covered by concrete, non-vacuous tests; no `R<n>` lacks coverage.

## Tasks completas

- 1.1–1.6: [x] Branch sync completed (merge commit `edd002b`, parents `cadaaa4` + `47fc422`; merge
  tip documented deviation from `git merge origin/main` is justified in `impl` §1 and
  `progress/current.md`; `origin/main` is an ancestor of `HEAD` and the remote tip is an ancestor,
  so the committer's push fast-forwards: 0 behind / 2 ahead).
- 2.1–2.2: [x] Astro 7.3.5 installed from the merged frozen lockfile; red baseline recorded with the
  exact `de<span` failure (independently reproduced by this review).
- 3.1–3.3: [x] `{' '}` added in `HeroSection.astro` and (scope extension, R6)
  `TechnologiesSection.astro`; nothing else changed in either component.
- 4.1–4.2: [x] `emits_explicit_headline_space` added (additions only); hero tests 10/10 green.
- 5.1–5.3: [x] ci-github-action references renumbered to id 6 in
  `specs/ci-github-action/{requirements,design}.md` and
  `progress/{commit,impl,review}_ci-github-action.md`; grep sweep confirms every remaining `id 5`
  match refers to `technologies-section` or is an explicit historical/renumbering note; no stale
  ci-github-action `id 5` remains.
- 6.1–6.9: [x] All gates re-run green by this review (see below); evidence recorded in
  `progress/current.md` §6 and `progress/impl_fix-hero-headline-whitespace.md` §6.
- 6.10: [ ] Human verification of the PR #7 `pull_request` run on GitHub, after the committer's push.
  **Properly documented and accepted**: `impl` §6 (table row 6.10) and `progress/current.md` §6.10
  state that Actions cannot run offline here and that the run is human-verified after push; the
  design (`design.md` §10, §11) and the Definition of done already classify this as a post-push
  human step. This is the only unchecked box and it is not implementable in this environment, so it
  does not block approval.

## Checkpoints

- C1: [x] Harness complete — `AGENTS.md`, `feature_list.json`, `progress/current.md` exist;
  `docs/{architecture,conventions,specs,verification}.md` exist; `pnpm validate` exits 0.
- C2: [x] Coherent state — exactly one feature `in_progress` (id 7); features 1–6 `done` with the
  full suite green (157/157); `progress/current.md` describes the active feature-7 session only.
- C3: [x] Architecture respected — `src/pages/` contains only `index.astro`; components live in
  `src/components/` (PascalCase); no `console.log`, TODO/FIXME, `@ts-ignore` or `eslint-disable`
  introduced; no `client:*` island added (zero-JS preserved); the fix is a one-expression change
  per component plus the new test.
- C4: [x] Real verification — relevant tests exist and were executed: `pnpm test` 14 files /
  157 passed, `pnpm check` 29 files with 0 errors / 0 warnings / 0 hints.
- C5: [x] Session closure — untracked file is only the expected
  `progress/impl_fix-hero-headline-whitespace.md`; no `*.tmp`; `dist/` and `.astro/` are ignored;
  `progress/history.md` holds the last session entries (technologies-section, ci-github-action);
  feature 7 is correctly `in_progress` (not `done` before this approval).
- C6: [x] SDD — all `sdd: true` features have their `specs/<name>/` with the three files;
  feature-7 `requirements.md` is strict EARS (one `MUST`/`MUST NOT` per R1–R6); all tasks
  `[x]` except the justified 6.10; every `R<n>` traced to a concrete named test above.

## Independently re-run verification

- `pnpm install --frozen-lockfile` → lockfile up to date, no edit; installed Astro 7.3.5.
- `pnpm lint` → exit 0, no findings.
- `pnpm check` → 29 files, 0 errors / 0 warnings / 0 hints, exit 0.
- `pnpm test` → 14 files, **157/157 passed**, exit 0 (hero 10/10, technologies 27/27).
- `pnpm build` → 1 static page + 4 optimized WebP images, exit 0. Built `dist/index.html` junction
  characters verified directly: `intersección de` + U+0020 + `<span` and
  `Tecnologías y herramientas` + U+0020 + `<span` (both char code 32).
- `pnpm validate` (lint → check → test → build) → exit 0.
- `pnpm format:check` → "All matched files use Prettier code style!", exit 0.
- Cross-check on a pristine `git archive HEAD` tree in `/tmp/opencode` (Astro 7.3.5): pre-fix
  `tests/hero.test.ts` + `tests/technologies-section.test.ts` → 2 failures with the exact
  `de<span` / `herramientas<span` junctions; with the working-tree files copied in → 37/37 pass;
  mutations of the explicit construct (removed, U+00A0, double space) each fail the new test,
  proving it pins exactly one U+0020.

## Scope verification

- `git diff HEAD -- src/components/HeroSection.astro src/components/TechnologiesSection.astro tests/hero.test.ts`
  is exactly the three intended changes: one explicit `{' '}` per component and the single new
  `it(...)` in `tests/hero.test.ts`.
- `tests/technologies-section.test.ts` unchanged vs `HEAD` (`git diff` empty), as required by the
  scope extension.
- `.github/workflows/ci.yml`, `tests/ci-workflow.test.ts` and `astro.config.mjs` are byte-identical
  to the branch tip `47fc422` and to the CI introduction commit `0bfa780`; they are not in
  `git status`. `feature_list.json` has exactly 7 unique ids/names with technologies-section 5 /
  ci-github-action 6 / fix 7.
- Note (non-blocking): task 6.7 and `design.md` §10 phrase the scope check as
  `git diff origin/main -- .github/workflows/ci.yml tests/ci-workflow.test.ts astro.config.mjs`
  being empty. That command cannot be empty while the CI feature is still unmerged (origin/main does
  not contain those files yet), so the implementer correctly substituted the equivalent invariance
  check against the branch tip and introduction commits, documented in `impl` §6 (row 6.7) and
  `progress/current.md`. The intended guarantee — these files are untouched by this feature — holds.

## Cambios requeridos

Ninguno.
