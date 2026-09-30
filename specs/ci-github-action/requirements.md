# Requirements — ci-github-action

- **Feature:** `ci-github-action` (id 6, `sdd: true`).
- **Source of truth:** `feature_list.json` id 6 and the human request (2026-09-30): a GitHub Actions workflow named `CI` that runs on pushes to all branches and on pull requests targeting `main`, installs dependencies with pnpm using dependency caching, and then runs typecheck, lint, format check (non-mutating) and tests.
- **In scope:** the workflow file `.github/workflows/ci.yml` and its offline Vitest contract `tests/ci-workflow.test.ts`, plus the format-only normalization of the repository files that currently keep `pnpm format:check` red (see `design.md` §3).
- **Out of scope:** deployment, release automation, build/artifact publishing, a build job, `pnpm validate` as a single step, OS/Node matrices, concurrency cancellation, dependency-bot automation, branch protection, and any change to application code (`src/`).

**Notation.** Every requirement uses EARS and contains exactly one `MUST` / `MUST NOT`. Ids `R<n>` are stable. Each requirement is verified by at least one concrete, offline Vitest test in `tests/ci-workflow.test.ts` that reads `.github/workflows/ci.yml` (and `package.json` for R12) from disk as text; the tests use no network access and add no dependencies.

---

## 1. Workflow file and identity

### R1 — Workflow file

The workflow MUST be defined in the repository file `.github/workflows/ci.yml`.

**Verification:** `tests/ci-workflow.test.ts` → `declares_workflow_file` (reads the file from disk and asserts it is not empty).

### R2 — Workflow name

The workflow MUST be named `CI` through its top-level `name` key.

**Verification:** `tests/ci-workflow.test.ts` → `names_workflow_ci`.

### R3 — Single job

The workflow MUST declare exactly one job.

**Verification:** `tests/ci-workflow.test.ts` → `defines_single_job`.

### R4 — Runner

The job MUST run on the GitHub-hosted `ubuntu-latest` runner.

**Verification:** `tests/ci-workflow.test.ts` → `runs_on_ubuntu_latest`.

### R5 — Read-only permissions

The workflow MUST grant only read access to repository contents (`permissions: contents: read`).

**Verification:** `tests/ci-workflow.test.ts` → `grants_read_only_contents_permission`.

---

## 2. Triggers

### R6 — Push on every branch

WHEN a commit is pushed to any branch, the workflow MUST run.

**Verification:** `tests/ci-workflow.test.ts` → `triggers_on_pushes_to_all_branches` (asserts the `push` trigger is declared with no `branches` filter).

### R7 — Pull requests targeting main

WHEN a pull request targets the `main` branch, the workflow MUST run.

**Verification:** `tests/ci-workflow.test.ts` → `triggers_on_pull_requests_targeting_main` (asserts `pull_request.branches` contains only `main`).

### R8 — No other triggers

The workflow MUST NOT declare any trigger event other than `push` and `pull_request`.

**Verification:** `tests/ci-workflow.test.ts` → `declares_no_other_triggers`.

---

## 3. Toolchain setup, caching and install

### R9 — Checkout before pnpm setup

The workflow MUST run the `actions/checkout` step before the `pnpm/action-setup` step.

**Verification:** `tests/ci-workflow.test.ts` → `checks_out_before_pnpm_setup`.

### R10 — pnpm before Node.js setup

The workflow MUST install pnpm (`pnpm/action-setup`) before it configures Node.js (`actions/setup-node`), because `actions/setup-node` with `cache: pnpm` needs pnpm on `PATH` to resolve the pnpm store directory.

**Verification:** `tests/ci-workflow.test.ts` → `installs_pnpm_before_node_setup`.

### R11 — pnpm dependency caching

The workflow MUST enable pnpm dependency caching through the `actions/setup-node` `cache: pnpm` input.

**Verification:** `tests/ci-workflow.test.ts` → `enables_pnpm_dependency_caching`.

### R12 — Node.js version

The workflow MUST configure Node.js `22.12.0`, the minimum version accepted by the `engines.node` range (`>=22.12.0`) declared in `package.json`.

**Verification:** `tests/ci-workflow.test.ts` → `pins_node_to_engines_minimum` (reads the engine floor from `package.json` and asserts the workflow's `node-version` equals it).

### R13 — Frozen lockfile install

The workflow MUST install dependencies with `pnpm install --frozen-lockfile`, so the lockfile is never updated (the flag is explicit because pnpm 12 no longer enables frozen installs by default in CI environments).

**Verification:** `tests/ci-workflow.test.ts` → `installs_dependencies_from_frozen_lockfile`.

### R14 — Install before checks

WHEN the workflow runs, the workflow MUST execute the dependency installation before any of the four checks.

**Verification:** `tests/ci-workflow.test.ts` → `runs_checks_after_install`.

---

## 4. Checks

### R15 — Typecheck

The workflow MUST run the Astro typecheck with `pnpm check` (`astro check`).

**Verification:** `tests/ci-workflow.test.ts` → `runs_typecheck`.

### R16 — Lint

The workflow MUST run ESLint with `pnpm lint`.

**Verification:** `tests/ci-workflow.test.ts` → `runs_lint`.

### R17 — Format check

The workflow MUST verify formatting with `pnpm format:check` (`prettier --check .`).

**Verification:** `tests/ci-workflow.test.ts` → `checks_formatting`.

### R18 — Tests

The workflow MUST run the Vitest suite with `pnpm test` (`vitest run`).

**Verification:** `tests/ci-workflow.test.ts` → `runs_tests`.

### R19 — Fail on check failure

The workflow MUST NOT set `continue-on-error` on any step, so a failing check fails the job.

**Verification:** `tests/ci-workflow.test.ts` → `fails_job_on_check_failure`.

### R20 — No mutating formatters

The workflow MUST NOT run `pnpm format` or any `prettier --write` command.

**Verification:** `tests/ci-workflow.test.ts` → `avoids_mutating_formatters`.

---

## 5. Version pinning and scope exclusions

### R21 — Pinned action versions

The workflow MUST reference the third-party actions at the reviewed versions `actions/checkout@v6`, `pnpm/action-setup@v6` and `actions/setup-node@v7`.

**Verification:** `tests/ci-workflow.test.ts` → `pins_action_versions`.

### R22 — Pinned pnpm version

The workflow MUST install pnpm `12.6.0` through the `pnpm/action-setup` `version` input.

**Verification:** `tests/ci-workflow.test.ts` → `pins_pnpm_version` (the explicit input also avoids `pnpm/action-setup` v6's `package_json_file` inference bug recorded upstream).

### R23 — No build, deploy, release or publish steps

The workflow MUST NOT define steps that build, deploy, release or publish artifacts.

**Verification:** `tests/ci-workflow.test.ts` → `excludes_build_deploy_release_and_publish` (asserts the absence of `pnpm build`, `astro build`, `upload-artifact`, `deploy`, `release` and `publish`).

---

## Traceability

All tests live in `tests/ci-workflow.test.ts`.

| Requirement | Test name                                    |
| ----------- | -------------------------------------------- |
| R1          | `declares_workflow_file`                     |
| R2          | `names_workflow_ci`                          |
| R3          | `defines_single_job`                         |
| R4          | `runs_on_ubuntu_latest`                      |
| R5          | `grants_read_only_contents_permission`       |
| R6          | `triggers_on_pushes_to_all_branches`         |
| R7          | `triggers_on_pull_requests_targeting_main`   |
| R8          | `declares_no_other_triggers`                 |
| R9          | `checks_out_before_pnpm_setup`               |
| R10         | `installs_pnpm_before_node_setup`            |
| R11         | `enables_pnpm_dependency_caching`            |
| R12         | `pins_node_to_engines_minimum`               |
| R13         | `installs_dependencies_from_frozen_lockfile` |
| R14         | `runs_checks_after_install`                  |
| R15         | `runs_typecheck`                             |
| R16         | `runs_lint`                                  |
| R17         | `checks_formatting`                          |
| R18         | `runs_tests`                                 |
| R19         | `fails_job_on_check_failure`                 |
| R20         | `avoids_mutating_formatters`                 |
| R21         | `pins_action_versions`                       |
| R22         | `pins_pnpm_version`                          |
| R23         | `excludes_build_deploy_release_and_publish`  |

## Feature description coverage

| Feature description item (id 6)                                       | Requirements                                        |
| --------------------------------------------------------------------- | --------------------------------------------------- |
| Workflow at `.github/workflows/ci.yml`                                | R1                                                  |
| Named `CI`                                                            | R2                                                  |
| Runs on pushes to all branches                                        | R6                                                  |
| Runs on pull requests targeting `main`                                | R7                                                  |
| Installs dependencies with pnpm using dependency caching              | R9–R13, R21–R22                                     |
| Typecheck (`astro check`)                                             | R15                                                 |
| Lint (`eslint`)                                                       | R16                                                 |
| Format check (`prettier --check`, non-mutating)                       | R17, R20                                            |
| Tests (`vitest`)                                                      | R18                                                 |
| Each check fails the job when it fails                                | R19                                                 |
| Excludes deployment, release automation and build/artifact publishing | R23                                                 |
| Excludes any change to application code                               | Out of scope (`design.md` §3 and tasks scope check) |
