# Design — ci-github-action

## 1. Context

Feature id 5 (`sdd: true`). Goal: a repository-level GitHub Actions gate that mirrors the local quality commands on every branch push and on pull requests to `main`, with pnpm dependency caching and without any build, deploy or release step.

Grounding facts:

- `package.json` scripts: `check` = `astro check`, `lint` = `eslint .`, `format:check` = `prettier --check .`, `test` = `vitest run`; `validate` = lint + check + test + **build**, which is why the workflow runs four separate commands instead of `pnpm validate`.
- `package.json` has **no `packageManager` field**, so `pnpm/action-setup` requires an explicit `version` input.
- The local toolchain is **pnpm 12.6.0** (`node_modules/.modules.yaml` → `"packageManager": "pnpm@12.6.0"`); `pnpm/action-setup@v6` supports pnpm v12 and earlier.
- pnpm 12 is a standalone native executable; installing it through npm needs Node 22.13+, but `pnpm/action-setup` runs before `actions/setup-node` on the runner's default Node, so the job's pinned Node version is unaffected.
- On pnpm 12, `pnpm install` no longer enables `--frozen-lockfile` by default on CI (upstream change), so the flag must be explicit.
- `.github/` exists but is empty; `.github/workflows/ci.yml` is new.
- `pnpm format:check` currently fails on two pre-existing drifted files; the new gate cannot be green until they are normalized (format-only), see §3.

Constraints: the workflow cannot be executed offline, so every `R<n>` is verified by a deterministic Vitest test that reads `.github/workflows/ci.yml` (and `package.json` for R12) as text — no network, no GitHub API, no new dependencies (no YAML parser).

## 2. Decisions summary

1. **Single workflow, single job.** Workflow `name: CI`; job id `ci`; `runs-on: ubuntu-latest`; workflow-level `permissions: contents: read` (least privilege).
2. **Triggers.** `push:` with no branch filter (all branches) and `pull_request.branches: [main]`; no other events.
3. **Step order.** checkout → `pnpm/action-setup@v6` (pnpm `12.6.0`) → `actions/setup-node@v7` (`node-version: 22.12.0`, `cache: pnpm`) → `pnpm install --frozen-lockfile` → `pnpm check` → `pnpm lint` → `pnpm format:check` → `pnpm test`. `actions/setup-node` with `cache: pnpm` needs pnpm already on `PATH`, hence the order.
4. **Pinning strategy.** Actions are pinned to reviewed major tags; tool versions are pinned exactly (pnpm `12.6.0`, Node `22.12.0`). No floating refs (`@main`, `@latest`) and no SHA pinning (see §7).
5. **Node version.** `22.12.0` is the literal floor of `engines.node` (`>=22.12.0`): the gate proves the declared minimum instead of an unreproducible "latest" resolution.
6. **Caching.** `actions/setup-node`'s `cache: pnpm` (keyed on `pnpm-lock.yaml` by default) instead of a manual `actions/cache` step.
7. **Install.** `pnpm install --frozen-lockfile` (explicit; see §1) — a lockfile out of sync with `package.json` fails the job instead of being rewritten.
8. **Format gate.** `pnpm format:check` (`prettier --check .`), never `pnpm format` (`prettier --write`) — CI must detect drift without modifying files.
9. **Failure semantics.** Each check is its own step with no `continue-on-error`, so any failing command fails the job and the failure is attributable to one gate.
10. **Scope.** No build job, no deploy/release/publish step, no `src/` change, no new dependency, `package.json` and `pnpm-lock.yaml` untouched.
11. **Test contract.** One new test file, `tests/ci-workflow.test.ts`, with one test per `R<n>`; text assertions with whitespace/quote normalization so the contract survives Prettier formatting of the YAML.
12. **Format gate prerequisite.** Two pre-existing files are normalized with Prettier (format-only) so the new `format:check` step can actually pass.

## 3. Files

| File                                               | Action | Responsibility                                                                                         |
| -------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| `.github/workflows/ci.yml`                         | create | The CI workflow (R1–R23).                                                                              |
| `tests/ci-workflow.test.ts`                        | create | Offline text contract for the workflow, one test per requirement (R1–R23).                             |
| `.opencode/skills/astro-modern-practices/SKILL.md` | modify | Format-only normalization (`prettier --write`); pre-existing drift verified by earlier sessions (R17). |
| `progress/review_projects-section.md`              | modify | Format-only normalization; same rationale (R17).                                                       |
| `progress/current.md`                              | modify | Session log required by `AGENTS.md`; must end Prettier-clean (R17).                                    |
| `feature_list.json`                                | modify | Status field transitions only (`spec_ready` → `in_progress` → `done`).                                 |

Unchanged: `package.json`, `pnpm-lock.yaml`, `astro.config.mjs`, `vitest.config.ts`, `tsconfig.json`, `eslint.config.js`, `.prettierrc`, `.prettierignore`, everything under `src/`, and `tests/node-shims.d.ts` (its `readFileSync(…, 'utf8')` overload already covers the new test).

If `pnpm format:check` reports any additional file (for instance this spec folder or a progress file), it is normalized the same format-only way; formatting-only changes outside the table are acceptable and must be reported in `progress/current.md`.

## 4. Workflow content

`.github/workflows/ci.yml` (exact intended content; Prettier-formatted, trailing newline included):

```yaml
name: CI

on:
  push:
  pull_request:
    branches:
      - main

permissions:
  contents: read

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Set up pnpm
        uses: pnpm/action-setup@v6
        with:
          version: 12.6.0

      - name: Set up Node.js
        uses: actions/setup-node@v7
        with:
          node-version: 22.12.0
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck
        run: pnpm check

      - name: Lint
        run: pnpm lint

      - name: Check formatting
        run: pnpm format:check

      - name: Test
        run: pnpm test
```

Notes:

- `push:` is a key with an empty value: GitHub interprets it as "every branch". `pull_request.branches` (`main` only) is the base-branch filter.
- The workflow file lives inside Prettier's `--check .` scope (`.prettierignore` does not exclude `.github/`), so it must itself be Prettier-clean.
- Names are stable because the tests key on the action references and commands, not on step display names; display names exist only for readable check output.
- The file deliberately contains no `#` comments, keeping the exclusion assertions of R23 simple.

## 5. Requirement → test contract

`tests/ci-workflow.test.ts` reads both files as utf8 through the existing `node:fs` shim and asserts with regular expressions on stable tokens. Helpers (local to the file, matching the repo convention of duplicated test utilities):

```ts
const workflow = readFileSync(
  new URL('../.github/workflows/ci.yml', import.meta.url),
  'utf8',
);
const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as { engines?: { node?: string } };

const compact = (value: string): string => value.replace(/\s+/g, ' ').trim();
const scalar = (value: string): string =>
  value.trim().replace(/^['"]|['"]$/g, '');

function stepBlock(marker: string): string {
  const start = workflow.indexOf(marker);
  if (start === -1) {
    throw new Error(`Step not found: ${marker}`);
  }
  const rest = workflow.slice(start + marker.length);
  const nextStep = rest.search(/^ {6}- /m);
  return nextStep === -1
    ? workflow.slice(start)
    : workflow.slice(start, start + marker.length + nextStep);
}
```

| R   | Assertion technique                                                                                                                                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | `readFileSync` succeeds and `workflow.trim()` is not empty.                                                                                          |
| R2  | The first line matches `/^name: CI$/m`.                                                                                                              |
| R3  | Slicing from `jobs:`, the count of 2-space-indented `key:` lines is exactly 1 (`ci:`).                                                               |
| R4  | `/^ {4}runs-on: ubuntu-latest$/m`.                                                                                                                   |
| R5  | `compact(workflow)` contains `permissions: contents: read` and no `write`.                                                                           |
| R6  | `/^ {2}push:\s*$/m`; `branches:` occurs exactly once in the whole file; `compact(workflow)` matches `/on: push: pull_request:/`.                     |
| R7  | `compact(workflow)` matches `/pull_request: branches: (- main                                                                                        | \[main\])/` (tolerates block or flow list). |
| R8  | The `on:` block (up to `permissions:`) has exactly two 2-space-indented keys, `push` and `pull_request`.                                             |
| R9  | `indexOf('actions/checkout@v6') < indexOf('pnpm/action-setup@v6')`.                                                                                  |
| R10 | `indexOf('pnpm/action-setup@v6') < indexOf('actions/setup-node@v7')`.                                                                                |
| R11 | `stepBlock('actions/setup-node@v7')` matches `/cache:\s*pnpm/`.                                                                                      |
| R12 | Extract `node-version` value (`scalar`), extract, with `/(\d+\.\d+\.\d+)/`, the floor of `packageJson.engines.node`, assert equality with `22.12.0`. |
| R13 | `workflow` contains `run: pnpm install --frozen-lockfile`.                                                                                           |
| R14 | `indexOf('pnpm install --frozen-lockfile')` is less than the index of each of the four check commands.                                               |
| R15 | `run: pnpm check` present.                                                                                                                           |
| R16 | `run: pnpm lint` present.                                                                                                                            |
| R17 | `run: pnpm format:check` present.                                                                                                                    |
| R18 | `run: pnpm test` present.                                                                                                                            |
| R19 | `workflow` does not contain `continue-on-error`.                                                                                                     |
| R20 | No `/prettier\s+--write/` and no `/^ *run: pnpm format$/m` (so `format:check` itself does not trip the assertion).                                   |
| R21 | `uses: actions/checkout@v6`, `uses: pnpm/action-setup@v6` and `uses: actions/setup-node@v7` are present.                                             |
| R22 | `stepBlock('pnpm/action-setup@v6')` matches `/version:\s*12\.6\.0/`.                                                                                 |
| R23 | `workflow` does not match `/pnpm build                                                                                                               | astro build                                 | upload-artifact | deploy | release | publish/i`. |

The normalization helpers keep assertions invariant to Prettier quirks (single vs double quotes, block vs flow lists), while all tokens that carry a requirement are asserted verbatim. No YAML parser is imported; the file shape is pinned by this contract and by the design content above.

## 6. Pinned versions strategy

| Item                 | Pin               | Rationale                                                                                                                                                                        | How it moves                                  |
| -------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `actions/checkout`   | `@v6` (major tag) | First-party GitHub action; major tags are maintained and receive security patches within the major.                                                                              | Reviewed manual bump                          |
| `pnpm/action-setup`  | `@v6` (major tag) | Official pnpm action; v6 supports pnpm v12 and earlier.                                                                                                                          | Reviewed manual bump                          |
| `actions/setup-node` | `@v7` (major tag) | Official GitHub action providing the `cache: pnpm` integration.                                                                                                                  | Reviewed manual bump                          |
| pnpm                 | `12.6.0` (exact)  | Matches the local toolchain that produced `pnpm-lock.yaml`; reproducible installs. Explicit `version` input also sidesteps the upstream `package_json_file` inference bug in v6. | Deliberate bump together with local toolchain |
| Node.js              | `22.12.0` (exact) | Literal `engines.node` floor (`>=22.12.0`); proves the declared minimum.                                                                                                         | Deliberate bump when `engines.node` moves     |

Policy: no floating refs (`@main`, `@latest`, `lts/*`) and no unreviewed bump automation. The repository has no Dependabot/Renovate configuration and this feature does not add one (out of scope); a future feature can automate these bumps.

## 7. Rejected alternatives

| Alternative                                                                                      | Why rejected                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SHA-pinned actions (`uses: actions/checkout@<40-hex>`)                                           | Strongest supply-chain pin, but opaque diffs and manual SHA lookups with no bump automation in this repo. Major tags from the two publishers (GitHub, pnpm) are the reviewed middle ground; SHA pinning can be adopted later together with automation.                         |
| `pnpm/setup@v1` (successor action that installs pnpm and a Node runtime in one step)             | The human request explicitly asks for pnpm set up before `actions/setup-node` with `cache: pnpm`; the pnpm README confirms `pnpm/action-setup` + `actions/setup-node` remains valid for pnpm v12. Switching runtimes to a newer single action is not needed and adds unknowns. |
| `pnpm/action-setup`'s own `cache: true` input                                                    | Duplicates caching responsibility; the requested and documented integration is `actions/setup-node`'s `cache: pnpm` (which keys the cache on `pnpm-lock.yaml`).                                                                                                                |
| Manual `actions/cache` step for the pnpm store (`pnpm store path`)                               | More YAML and manual key/restore logic for what `actions/setup-node` already implements; also needs pnpm before the cache step anyway, reordering setup for no benefit.                                                                                                        |
| A single step running `pnpm validate`                                                            | `validate` includes `pnpm build`, which is explicitly out of scope, and a single combined command hides which gate failed. Four separate steps keep failures attributable.                                                                                                     |
| `pnpm format` (write mode) as the CI format gate                                                 | Mutates the checkout and exits 0 even when files were unformatted, so it cannot fail the job. `format:check` (`prettier --check .`) is the non-mutating gate the human asked for and is already a `package.json` script.                                                       |
| Adding a YAML parser (`yaml`) as a devDependency to assert structure                             | A new dependency to read one 40-line static file; the harness allows reading the workflow as text, and normalized text assertions are deterministic and offline.                                                                                                               |
| `actionlint` or running the workflow locally (`act`) as the verification mechanism               | Needs a downloaded binary/network or local containers; not deterministic offline and outside the repo's Vitest gate. The static contract plus the identical local commands (`pnpm lint/check/format:check/test`) is the accepted evidence.                                     |
| Floating Node specs (`lts/*`, `22.x`, `node-version-file: package.json`)                         | Resolve to whatever is latest at run time (possibly another major), so the gate is not reproducible and the contract could only assert a range. Exact `22.12.0` tests the declared minimum deterministically.                                                                  |
| Adding `packageManager: pnpm@12.6.0` to `package.json` and omitting the action's `version` input | Modifies project configuration beyond the CI-only scope and changes local Corepack behavior; the explicit `version` input is sufficient and keeps `package.json` untouched.                                                                                                    |
| Adding the two drifted files to `.prettierignore` instead of normalizing them                    | Hides real formatting drift and weakens the new gate; previous sessions verified the drift is accidental (not intentional), so a format-only `prettier --write` is the honest fix.                                                                                             |
| Matrix across OS or Node versions (e.g. ubuntu/windows/macos, Node 22 + 24)                      | Not requested; multiplies CI cost without a target behavior to protect (the site is a static Linux-built artifact).                                                                                                                                                            |
| `concurrency` groups to cancel superseded runs, `timeout-minutes`, workflow badges               | Nice-to-haves not requested; deliberately deferred to keep the first workflow minimal and fully testable.                                                                                                                                                                      |

## 8. Risks

| Risk                                                                   | Mitigation                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| GitHub Actions cannot be executed offline                              | The workflow commands are exactly the local gates, verified by `pnpm lint`, `pnpm check`, `pnpm test` and `pnpm format:check`; the static contract pins the YAML. The human verifies the first real run on GitHub after merge. |
| `pnpm format:check` is red before the feature (two pre-existing files) | Format-only normalization is part of the tasks; `format:check` must be green before review. Additional offenders reported by Prettier are normalized the same way and reported in `progress/current.md`.                       |
| Prettier reformats the workflow YAML after creation                    | The design content is already Prettier-shaped; the implementer runs `prettier --write` on the file and the tests normalize whitespace/quotes, so the committed file and contract stay aligned.                                 |
| Action major tags move or are yanked                                   | Pins are explicit strings asserted by tests; any bump is a visible, reviewed change.                                                                                                                                           |
| pnpm 12.6.0 availability or its npm-install Node floor (22.13+)        | `pnpm/action-setup` installs pnpm before `actions/setup-node` on the runner's default Node; pnpm v12 runs as a standalone native executable, so the project's pinned Node does not affect pnpm itself.                         |
| `push` on all branches duplicates runs for branch PRs                  | Intended by the request (every branch push plus PRs to `main`); `concurrency` cancellation is explicitly deferred.                                                                                                             |
| Lockfile drift silently passing                                        | `--frozen-lockfile` is explicit (pnpm 12 removed the CI default), so drift fails the install step.                                                                                                                             |
| An out-of-scope file changes during implementation                     | Tasks include a scope check: only `design.md` §3 files (plus format-only normalization) and the SDD process files may differ.                                                                                                  |

## 9. Out of scope / future work

- Deployment, preview environments, release automation and artifact publishing.
- A build job or any `pnpm build`/`astro build` invocation (the closing `pnpm validate` in local sessions keeps covering the build).
- Caching beyond the pnpm store (Astro/`dist` caches).
- OS/Node matrices, `concurrency` groups, `timeout-minutes`, workflow badges.
- Dependency-bot automation (Dependabot/Renovate) for action and tool bumps.
- SHA pinning of actions; `actionlint`; local `act` runs.
- Branch protection rules and required-status-check configuration on GitHub.
