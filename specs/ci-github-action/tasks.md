# Tasks — ci-github-action

Ordered checklist. Each task references the `R<n>` it covers. The implementer marks `[x]` as tasks complete. Final gates: `pnpm validate` green and `pnpm format:check` green repo-wide. Only the files in `design.md` §3 are touched (plus format-only normalization and the SDD process files). No `src/` change, no new dependency, `package.json` and `pnpm-lock.yaml` untouched.

## 1. Baseline

- [x] 1.1 Run `pnpm exec prettier --check .` and record the exact files it flags (expected: `.opencode/skills/astro-modern-practices/SKILL.md` and `progress/review_projects-section.md`, both pre-existing drift). — R17
- [x] 1.2 Confirm `.github/workflows/ci.yml` does not exist, `.github/` exists, and the working branch is `feat/create-github-actions`. — R1

## 2. Workflow — `.github/workflows/ci.yml` (create)

- [x] 2.1 Create the file exactly as `design.md` §4: `name: CI`, `on: push` with no filter, `pull_request` restricted to `main`, `permissions: contents: read`, single `ci` job on `ubuntu-latest`, trailing newline. — R1–R8
- [x] 2.2 Write the steps in order: `actions/checkout@v6` → `pnpm/action-setup@v6` (`version: 12.6.0`) → `actions/setup-node@v7` (`node-version: 22.12.0`, `cache: pnpm`). — R9–R12, R21, R22
- [x] 2.3 Add the install step `run: pnpm install --frozen-lockfile` before the checks. — R13, R14
- [x] 2.4 Add the four check steps with the exact commands `pnpm check`, `pnpm lint`, `pnpm format:check` and `pnpm test`; no `continue-on-error`; no `pnpm format` or `prettier --write`. — R15–R20
- [x] 2.5 Confirm the file contains no build/deploy/release/publish step and no trigger beyond `push` and `pull_request`. — R8, R23
- [x] 2.6 Run `pnpm exec prettier --write .github/workflows/ci.yml` and confirm `prettier --check` reports it clean afterwards. — R17

## 3. Test contract — `tests/ci-workflow.test.ts` (create)

- [x] 3.1 Create the file with the helpers of `design.md` §5 (utf8 reads of the workflow and `package.json`, `compact`/`scalar`/`stepBlock`); no new dependency, no YAML parser, no network. — all R
- [x] 3.2 Add the tests for identity and triggers with the exact names `declares_workflow_file`, `names_workflow_ci`, `defines_single_job`, `runs_on_ubuntu_latest`, `grants_read_only_contents_permission`, `triggers_on_pushes_to_all_branches`, `triggers_on_pull_requests_targeting_main`, `declares_no_other_triggers`. — R1–R8
- [x] 3.3 Add the tests for setup, caching and install: `checks_out_before_pnpm_setup`, `installs_pnpm_before_node_setup`, `enables_pnpm_dependency_caching`, `pins_node_to_engines_minimum`, `installs_dependencies_from_frozen_lockfile`, `runs_checks_after_install`. — R9–R14
- [x] 3.4 Add the tests for the checks: `runs_typecheck`, `runs_lint`, `checks_formatting`, `runs_tests`, `fails_job_on_check_failure`, `avoids_mutating_formatters`. — R15–R20
- [x] 3.5 Add the tests for pinning and exclusions: `pins_action_versions`, `pins_pnpm_version`, `excludes_build_deploy_release_and_publish`. — R21–R23
- [x] 3.6 Run `pnpm test`; the 23 new tests are green and no existing test regressed. — all R

## 4. Format gate

- [x] 4.1 Run `pnpm exec prettier --write` on every file flagged in task 1.1 (currently the two listed in `design.md` §3); verify with `git diff` that the changes are formatting-only (whitespace/wrapping), with no content edits. — R17
- [x] 4.2 Run `pnpm format:check`; it must be green repo-wide, including the new workflow, the new test file, this spec folder and the progress files; normalize any remaining flagged file format-only. — R17

## 5. Verification

- [x] 5.1 Run `pnpm lint`; green with no disabled rules or leftover TODOs. — R16
- [x] 5.2 Run `pnpm check`; green. — R15
- [x] 5.3 Run `pnpm test`; green with every `R1`–`R23` traced to its named test. — all R
- [x] 5.4 Run `pnpm validate`; green (lint + check + test + build). — all R
- [x] 5.5 Run `pnpm format:check`; green. — R17
- [x] 5.6 Read `.github/workflows/ci.yml` end to end against `design.md` §4 and R1–R23 (static review: single job, triggers, step order, commands, pins, permissions, no build/deploy). — R1–R23
- [x] 5.7 Scope check: only `design.md` §3 files changed (plus format-only normalization); `src/` untouched; no new dependency; `package.json` and `pnpm-lock.yaml` unchanged. — all R
- [x] 5.8 Record in `progress/current.md`: evidence of 5.1–5.6 and the explicit note that the first real GitHub run (push + PR to `main`) is human-verified after merge, since Actions cannot run offline here. — —

## Definition of done

- All checkboxes `[x]`; `pnpm validate` and `pnpm format:check` green.
- `specs/ci-github-action/requirements.md` traceability table fully covered by `tests/ci-workflow.test.ts`.
- `.github/workflows/ci.yml` committed exactly as `design.md` §4, Prettier-formatted.
- No application-code change, no new dependency, no `package.json`/`pnpm-lock.yaml` change.
- Human verification: first workflow run is green on push and on a PR targeting `main`.
