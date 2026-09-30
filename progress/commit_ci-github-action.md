# Commit — feature ci-github-action (id 5)

- **Scope:** single atomic commit for the repository CI gate: the GitHub
  Actions workflow, its offline contract tests, the approved SDD spec, the
  session evidence, the two format-only normalizations required by the new
  format gate, and the bookkeeping.
- **Committer:** commits agent, 2026-09-30.
- **Pre-commit check:** `pnpm validate` green — lint + `astro check` (24 files,
  0 errors) + `pnpm test` (11 files, 112/112 tests) + build; `pnpm format:check`
  green repo-wide.
- **Result:** 1 commit on `feat/create-github-actions`; pushed to `origin`
  with upstream tracking in the same session. No amend, no force.

## Files committed

Modified:

- `feature_list.json` — feature `ci-github-action` added and marked `done`.
- `.opencode/skills/astro-modern-practices/SKILL.md` — format-only Prettier
  normalization (pre-existing table alignment drift; prerequisite so the new
  `format:check` gate is green).
- `progress/review_projects-section.md` — format-only Prettier normalization
  (same rationale).
- `progress/history.md` — 2026-09-30 CI workflow session summary.

New (untracked before this commit):

- `.github/workflows/ci.yml` — the CI workflow (R1–R23).
- `tests/ci-workflow.test.ts` — offline text contract, one test per R1–R23.
- `specs/ci-github-action/{requirements,design,tasks}.md` — approved SDD spec.
- `progress/impl_ci-github-action.md` — implementation evidence.
- `progress/review_ci-github-action.md` — reviewer verdict (APPROVED).
- `progress/commit_ci-github-action.md` — this report (same commit).

## Commit message used

```text
ci: add GitHub Actions CI workflow

Add a repository-level CI gate: the workflow "CI" runs on pushes to every
branch and on pull requests targeting main, installs dependencies with pnpm
using setup-node's cache: pnpm, and runs typecheck (astro check), lint
(eslint), format check (prettier --check) and tests (vitest) as separate,
attributable steps.

pnpm/action-setup must precede actions/setup-node because cache: pnpm
resolves the pnpm store from PATH; the install passes --frozen-lockfile
explicitly because pnpm 12 no longer enables frozen installs by default on
CI. Actions are pinned to reviewed majors (checkout@v6, action-setup@v6 with
pnpm 12.6.0, setup-node@v7) and Node is pinned to 22.12.0, the engines.node
floor in package.json.

GitHub Actions cannot run offline here, so the workflow is covered by an
offline text contract (tests/ci-workflow.test.ts, 23 tests tracing R1-R23 of
the approved spec in specs/ci-github-action/); the first real run is
triggered by this push and verified by the human in the GitHub UI. Two
pre-existing Prettier-drifted files are normalized format-only so the new
format:check gate is green repo-wide. The workflow deliberately defines no
build, deploy, release or publish step.

112 tests green across 11 files; pnpm validate green (lint + check + test +
build); pnpm format:check green.

Spec and evidence: specs/ci-github-action/,
progress/impl_ci-github-action.md, progress/review_ci-github-action.md.
```

## Warnings / notes

- GitHub Actions cannot run in this environment; the first real workflow run
  is triggered by this push (all-branch `push` trigger) and must be verified
  by the human in the GitHub Actions UI.
- `progress/current.md` is unchanged from HEAD (restored template); no diff
  committed.
- The two format-only files are unrelated to the CI feature itself; they were
  normalized because the approved spec requires the new format gate to be
  green repo-wide.
- No secrets, credentials or build artifacts included; `dist/` and `.astro/`
  remain gitignored.
