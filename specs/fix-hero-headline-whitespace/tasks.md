# Tasks — fix-hero-headline-whitespace

Ordered checklist. Each task references the `R<n>` it covers. The implementer marks `[x]` as tasks complete. Final gates: `pnpm validate` and `pnpm format:check` green under the merged Astro 7 dependency set, and PR #7 green and mergeable (human-verified on GitHub). Only the files in `design.md` §3 are touched.

## 1. Branch sync

- [x] 1.1 Confirm the working branch is `feat/create-github-actions` and the tree is clean; run `git fetch origin` and record `git status --short` plus the `origin/main` head in `progress/current.md`. — R4
- [x] 1.2 Run `git merge origin/main`; accept the expected conflicts in `feature_list.json` and `progress/history.md` (and `progress/current.md` if flagged). — R4
- [x] 1.3 Resolve `feature_list.json` per `design.md` §6: keep `technologies-section` as id 5, renumber `ci-github-action` to id 6, keep this fix as id 7; no duplicate ids/names, valid JSON, Prettier-clean. — R4
- [x] 1.4 Resolve `progress/history.md` per `design.md` §6: keep main's entries **and** the `ci-github-action` entry; update the ci id reference to 6 with the renumbering note (§8); lose no session. — R4
- [x] 1.5 For any other conflict, follow the §6 rule (main for shared files, ours for the CI feature artifacts); confirm no feature is dropped. — R4
- [x] 1.6 Complete the merge commit; no rebase, no force-push. — R4

## 2. Dependency reinstall

- [x] 2.1 Run `pnpm install --frozen-lockfile` with the merged lockfile; confirm the installed Astro major is 7 (`node -p "require('./node_modules/astro/package.json').version"` or `pnpm list astro`). — R4
- [x] 2.2 Red baseline: run `pnpm exec vitest run tests/hero.test.ts`; record the failure of `renders_verbatim_hero_texts` with the `de<span` junction (exact output) in `progress/current.md`. — R1, R4

## 3. Component fix

- [x] 3.1 In `src/components/HeroSection.astro`, add the explicit expression text node `{' '}` between `intersección de` and the accent `<span>` (`design.md` §4); change nothing else. — R1, R2, R5
- [x] 3.2 Run `pnpm exec prettier --write src/components/HeroSection.astro`; confirm the expression survives and the rendered junction is `de <span`. — R1, R2
- [x] 3.3 Scope extension (human-approved): add the explicit `{' '}` expression in `src/components/TechnologiesSection.astro` between `Tecnologías y herramientas` and its accent `<span>` (`design.md` §4, R6); run `pnpm exec prettier --write src/components/TechnologiesSection.astro`; change nothing else. — R6

## 4. Test contract hardening (additions only)

- [x] 4.1 Add `emits_explicit_headline_space` to `tests/hero.test.ts` (`design.md` §5): source-level explicit-construct assertion plus raw rendered junction equals U+0020. Do not modify `renders_verbatim_hero_texts` or any other existing body. — R1, R2, R3
- [x] 4.2 Run `pnpm exec vitest run tests/hero.test.ts`: every hero test green under Astro 7, including the strict contract. — R1–R5

## 5. Renumbering reference updates

- [x] 5.1 Apply the id-reference updates of `design.md` §8 (`specs/ci-github-action/requirements.md`, `specs/ci-github-action/design.md`, `progress/commit_ci-github-action.md`, `progress/impl_ci-github-action.md`, `progress/review_ci-github-action.md`). — R3, R4
- [x] 5.2 Run `rg -n 'id 5' specs progress feature_list.json` and update any remaining ci-github-action reference to id 6; remaining `id 5` matches must all refer to `technologies-section`. — R3, R4
- [x] 5.3 Confirm `feature_list.json` lists exactly seven features with unique ids 1–7 and that this feature follows the SDD flow (`in_progress` during implementation). — R3, R4

## 6. Verification gates

- [x] 6.1 Run `pnpm lint`; green. — R5
- [x] 6.2 Run `pnpm check`; green. — R5
- [x] 6.3 Run `pnpm test`; full suite green (pre-existing plus the new hero test). — R1–R5
- [x] 6.4 Run `pnpm build`; green. — R5
- [x] 6.5 Run `pnpm validate` (lint + check + test + build); green. — R1–R5
- [x] 6.6 Run `pnpm format:check`; green repo-wide (normalize this feature's files format-only if flagged, and report it). — R5
- [x] 6.7 Scope check: `git diff origin/main -- .github/workflows/ci.yml tests/ci-workflow.test.ts astro.config.mjs` is empty; only `design.md` §3 files changed. — R5
- [x] 6.8 `git diff tests/hero.test.ts` review: additions only, `renders_verbatim_hero_texts` body byte-identical. — R3
- [x] 6.9 Record the evidence of 6.1–6.8 in `progress/current.md`, noting that the push + PR #7 CI result is human-verified on GitHub (Actions cannot run offline here). — —
- [ ] 6.10 Human verification: PR #7 `pull_request` run green and mergeable. — R4

## Definition of done

- All checkboxes `[x]`; `pnpm validate` and `pnpm format:check` green under Astro 7 (`pnpm install --frozen-lockfile`).
- `renders_verbatim_hero_texts` body unchanged and green; `emits_explicit_headline_space` green; every `R1`–`R5` traced to its test.
- Final `feature_list.json`: ids 1–7 unique with technologies-section 5 / ci-github-action 6 / this fix 7; all ci id references updated.
- `.github/workflows/ci.yml`, `tests/ci-workflow.test.ts` and `astro.config.mjs` unchanged versus the merged main.
- PR #7 turns green and becomes mergeable (human-verified).
