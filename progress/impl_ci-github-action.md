# Implementation report — `ci-github-action`

- **Feature:** id 6 (renumbered from id 5 during the PR #7 sync merge), `name: ci-github-action`, `sdd: true` (status still `in_progress`; awaiting reviewer).
- **Spec:** `specs/ci-github-action/{requirements,design,tasks}.md`, approved by the human.
- **Branch:** `feat/create-github-actions`.
- **Date:** 2026-09-30.

## Tasks

All tasks 1.1–5.8 of `specs/ci-github-action/tasks.md` are marked `[x]`. No task needed a spec deviation.

## Files

| File                                               | Action | Note                                                                                             |
| -------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------ |
| `.github/workflows/ci.yml`                         | create | Exactly `design.md` §4, Prettier-clean, trailing newline.                                        |
| `tests/ci-workflow.test.ts`                        | create | 23 tests, one per `R<n>`; text contract over the workflow file plus `package.json` for R12.      |
| `.opencode/skills/astro-modern-practices/SKILL.md` | modify | Format-only normalization (task 4.1).                                                            |
| `progress/review_projects-section.md`              | modify | Format-only normalization (task 4.1).                                                            |
| `specs/ci-github-action/design.md`                 | modify | Format-only normalization (task 4.1, additional offender reported per §3).                       |
| `specs/ci-github-action/requirements.md`           | modify | Format-only normalization (task 4.1, additional offender reported per §3).                       |
| `feature_list.json`                                | modify | Status/id-5 process edits (by the SDD flow) plus format-only normalization (task 4.1, reported). |
| `progress/current.md`                              | modify | Session log required by `AGENTS.md`.                                                             |

Unchanged: `src/**`, `package.json`, `pnpm-lock.yaml`, `astro.config.mjs`, `vitest.config.ts`, `tsconfig.json`, `eslint.config.js`, `.prettierrc`, `.prettierignore`, `tests/node-shims.d.ts`.

## Format-only normalization evidence

Task 1.1 flagged 5 files (`prettier --check .`): the two expected pre-existing ones plus `feature_list.json`, `specs/ci-github-action/design.md` and `specs/ci-github-action/requirements.md`. Per `design.md` §3 they were rewritten with `prettier --write` and verified as format-only:

- For every normalized file, the working file is byte-identical to `prettier` run over its pre-format content (`--stdin-filepath` against the snapshot of the previous content): `.opencode/skills/astro-modern-practices/SKILL.md`, `progress/review_projects-section.md`, `specs/ci-github-action/design.md` and `specs/ci-github-action/requirements.md`.
- `feature_list.json` was compared at JSON level: `features[0..3]` are content-identical to `HEAD`; `features[4]` is the `ci-github-action` entry (id 5 at that time, now id 6) that existed before formatting; only the `valid_status` array wrapping changed.
- Diffs for the markdown files touch only table alignment and whitespace; no words, code spans or links changed.

## Verification evidence

All commands were run from the repository root. Full outputs were captured in the session; key lines:

- `pnpm lint` (`eslint .`): exit 0, no findings.
- `pnpm check` (`astro check`): `Result (24 files): 0 errors, 0 warnings, 0 hints`, exit 0.
- `pnpm test` (`vitest run`): `Test Files 11 passed (11)`, `Tests 112 passed (112)`; the new file alone: `Test Files 1 passed (1)`, `Tests 23 passed (23)`.
- `pnpm build` (`astro build`): `1 page(s) built`, 4 optimized WebP images, exit 0.
- `pnpm validate` (`lint → check → test → build`): exit 0.
- `pnpm format:check` (`prettier --check .`): `All matched files use Prettier code style!`, exit 0.

Static review (task 5.6): `.github/workflows/ci.yml` read end to end against `design.md` §4 — workflow `name: CI`; `push` with no branch filter and `pull_request.branches: [main]`; no other triggers; `permissions: contents: read`; single job `ci` on `ubuntu-latest`; step order checkout → `pnpm/action-setup@v6` (`version: 12.6.0`) → `actions/setup-node@v7` (`node-version: 22.12.0`, `cache: pnpm`) → `pnpm install --frozen-lockfile` → `pnpm check` → `pnpm lint` → `pnpm format:check` → `pnpm test`; no `continue-on-error`, no `pnpm format`/`prettier --write`, no build/deploy/release/publish tokens.

Scope check (task 5.7): `git status --short` shows only the files above; `git diff --name-only -- src package.json pnpm-lock.yaml` is empty; no dependency was added.

## Traceability — `R<n>` → test

All tests live in `tests/ci-workflow.test.ts` and read `.github/workflows/ci.yml` (plus `package.json` for R12) from disk as text; no network, no YAML parser, no new dependency.

| Requirement | Test in `tests/ci-workflow.test.ts`          | Result |
| ----------- | -------------------------------------------- | ------ |
| R1          | `declares_workflow_file`                     | pass   |
| R2          | `names_workflow_ci`                          | pass   |
| R3          | `defines_single_job`                         | pass   |
| R4          | `runs_on_ubuntu_latest`                      | pass   |
| R5          | `grants_read_only_contents_permission`       | pass   |
| R6          | `triggers_on_pushes_to_all_branches`         | pass   |
| R7          | `triggers_on_pull_requests_targeting_main`   | pass   |
| R8          | `declares_no_other_triggers`                 | pass   |
| R9          | `checks_out_before_pnpm_setup`               | pass   |
| R10         | `installs_pnpm_before_node_setup`            | pass   |
| R11         | `enables_pnpm_dependency_caching`            | pass   |
| R12         | `pins_node_to_engines_minimum`               | pass   |
| R13         | `installs_dependencies_from_frozen_lockfile` | pass   |
| R14         | `runs_checks_after_install`                  | pass   |
| R15         | `runs_typecheck`                             | pass   |
| R16         | `runs_lint`                                  | pass   |
| R17         | `checks_formatting`                          | pass   |
| R18         | `runs_tests`                                 | pass   |
| R19         | `fails_job_on_check_failure`                 | pass   |
| R20         | `avoids_mutating_formatters`                 | pass   |
| R21         | `pins_action_versions`                       | pass   |
| R22         | `pins_pnpm_version`                          | pass   |
| R23         | `excludes_build_deploy_release_and_publish`  | pass   |

Every test maps to exactly one requirement and every requirement has at least one test: 23 requirements, 23 tests, 0 gaps.

## Human verification note

GitHub Actions cannot run offline in this environment. The workflow commands are exactly the local gates verified above (`lint`, `check`, `format:check`, `test`), and the YAML shape is pinned by the offline contract. The first real run of the workflow (a push to any branch and a pull request targeting `main`) is **human-verified after merge**; no claim is made here that GitHub executed it.

## Status

Feature remains `in_progress`. Not marked `done`; waiting for the reviewer.
