# Design — fix-hero-headline-whitespace

## 1. Context

Feature id 7 (`sdd: true`), bugfix on the done `hero-section` feature (id 2). Grounding facts:

- The `pull_request` run of PR #7 (`feat/create-github-actions`, run `36712669304`) fails in `pnpm test`: `tests/hero.test.ts:92` (`renders_verbatim_hero_texts`) expects `…intersección de <span` but the render contains `…de<span`. The branch's own push run (`36711703518`) passed because it used the branch's Astro 6 lockfile; the `pull_request` run resolves the merge ref with main's dependency set (`astro ^7.2.8`).
- Root cause (Astro docs, "Upgrade to Astro v7"): the default of `compressHTML` changed from `true` (HTML-aware) to `'jsx'` (JSX rules). JSX handling strips template whitespace around elements; the documented remedy is to include the wanted space explicitly in the source, e.g. `{" "}`.
- `src/components/HeroSection.astro` lines 8–11 currently rely on that incidental whitespace.
- PR #7 is also `CONFLICTING`: `feature_list.json` and `progress/history.md` collide with main's `technologies-section` (main took id 5). Final numbering after the sync: technologies-section 5, ci-github-action 6, this fix 7.
- Local verification only becomes meaningful after merging `origin/main` and reinstalling: the working branch still has Astro 6 with the old lockfile.

## 2. Decisions summary

1. **Fix technique.** Emit the space with an Astro expression text node `{' '}` between the headline text and the accent span: documented remedy, preserved under `compressHTML: 'jsx'`, renders a regular U+0020, cannot be trimmed as template whitespace.
2. **Component-only fix.** Keep `astro.config.mjs` (and its `compressHTML` default) untouched; no global whitespace policy change.
3. **Contract hardening, additions only.** One new test `emits_explicit_headline_space` in `tests/hero.test.ts`; `renders_verbatim_hero_texts` and every other existing body stay byte-identical.
4. **Branch sync.** `git merge origin/main` (merge commit; no rebase, no force-push). Resolve `feature_list.json` and `progress/history.md`, renumbering ci-github-action to id 6.
5. **Renumbering.** Update every current-state id reference of the ci-github-action feature from 5 to 6 (§8); requirement ids `R1`–`R23` never change.
6. **Dependency reinstall.** `pnpm install --frozen-lockfile` with the merged lockfile so the local Astro is 7.x, matching the PR merge ref.
7. **Evidence order.** Reproduce the failure under Astro 7 (red), apply the fix (green), then close with `pnpm validate` and `pnpm format:check` green; the real GitHub run is human-verified after push.

## 3. Files

| File                                                                | Action                  | Responsibility                                                                                    |
| ------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------- |
| `src/components/HeroSection.astro`                                  | modify                  | Add the explicit `{' '}` expression (R1, R2, R5).                                                 |
| `src/components/TechnologiesSection.astro`                          | modify                  | Human-approved scope extension: same explicit `{' '}` remedy in the section title (R6).           |
| `tests/hero.test.ts`                                                | modify (additions only) | New `emits_explicit_headline_space` (R1, R2); strict test and every other body untouched (R3–R5). |
| `feature_list.json`                                                 | modify                  | Merge-conflict resolution and final numbering (tech 5, ci 6, fix 7); this feature's status flow.  |
| `progress/history.md`                                               | modify                  | Merge-conflict resolution; keep both features' entries; ci entry id note (§8).                    |
| `progress/current.md`                                               | modify                  | Session log and evidence (`AGENTS.md` §3).                                                        |
| `specs/ci-github-action/requirements.md`                            | modify                  | Id references 5 → 6 (§8).                                                                         |
| `specs/ci-github-action/design.md`                                  | modify                  | Id reference 5 → 6 (§8).                                                                          |
| `progress/impl_ci-github-action.md`                                 | modify                  | Id reference 5 → 6 with renumbering note (§8).                                                    |
| `progress/review_ci-github-action.md`                               | modify                  | Id reference 5 → 6 with renumbering note (§8).                                                    |
| `progress/commit_ci-github-action.md`                               | modify                  | Id reference 5 → 6 with renumbering note (§8).                                                    |
| `specs/fix-hero-headline-whitespace/{requirements,design,tasks}.md` | create                  | This spec.                                                                                        |

Brought in by the merge (never hand-edited): main's `package.json` (`astro ^7.2.8`), `pnpm-lock.yaml`, and the `technologies-section` files (its `src/`, `tests/`, `specs/` and `progress/` artifacts). Explicitly unchanged and out of scope: `.github/workflows/ci.yml`, `tests/ci-workflow.test.ts`, `astro.config.mjs`, `src/scripts/clipboard.ts`, and every other component, page or test.

If `pnpm format:check` flags this spec folder or a progress file, normalize it format-only and report it, as previous sessions did.

## 4. Chosen fix

Before (`src/components/HeroSection.astro` lines 8–11):

```astro
<h1 class="hero__headline">
  Desarrollo digital en la intersección de
  <span class="hero__headline-accent">ingeniería e IA.</span>
</h1>
```

After:

```astro
<h1 class="hero__headline">
  Desarrollo digital en la intersección de{' '}
  <span class="hero__headline-accent">ingeniería e IA.</span>
</h1>
```

- `{' '}` is an Astro expression child that renders a single U+0020. Under `compressHTML: 'jsx'`, expression output is preserved; the newline and indentation that follow it are template whitespace and are stripped, which is the intended behavior.
- Expected rendered markup: `<h1 class="hero__headline">Desarrollo digital en la intersección de <span class="hero__headline-accent">ingeniería e IA.</span></h1>`.
- Prettier (repo config `singleQuote: true`, `prettier-plugin-astro`) may normalize the expression's inner spacing (`{' '}` vs `{ ' ' }`); the rendered result is identical. Run `prettier --write` on the file and let the committed form be Prettier-clean.
- The construct is self-documenting as a deliberate space; no CSS, no client JavaScript, no new dependency, no markup restructuring.

### Scope extension (human-approved)

During implementation the same Astro 7 `compressHTML: 'jsx'` whitespace trim was found in main's `src/components/TechnologiesSection.astro`: `tests/technologies-section.test.ts > renders_section_header` failed with `Tecnologías y herramientas<span` (reproduced on a pristine `320655c` worktree under the merged Astro 7.3.5). The human approved extending this feature — same root cause, same PR, same documented remedy — so the explicit `{' '}` expression is applied there too and the pre-existing test body stays untouched (R6, task 3.3). This note supersedes the §3 exclusion for that single file; no other component, page or test changes.

## 5. Test contract hardening

`tests/hero.test.ts` gains one test (additions only), reusing the existing module-level `heroSource` and `renderHero`:

```ts
it('emits_explicit_headline_space', async () => {
  expect(heroSource).toMatch(/intersección de\s*\{\s*['"] ['"]\s*\}\s*<span/);

  const html = await renderHero();
  const junction = /intersección de(.)<span/.exec(html);
  expect(junction?.[1]).toBe(' ');
});
```

- **Source half (R2):** proves the separating space is an explicit construct, not incidental template whitespace that a compiler upgrade can trim. It tolerates the Prettier-normalized variants (`{' '}`, `{ ' ' }`, double quotes) and the newline between the expression and the `<span>`.
- **Rendered half (R1):** captures the exact character between `de` and `<span` in the raw Container API output and pins it to U+0020, rejecting `de<span`, `de\n<span`, a non-breaking space (U+00A0) and double spaces.
- **Why hardening is needed:** the existing `normalize()` collapses `\s` (which includes NBSP) to single spaces, so the strict test alone cannot distinguish a regular space from an NBSP nor catch a double space. The new raw-junction assertion does, while `renders_verbatim_hero_texts` remains the untouched verbatim contract (R3).
- The diff of `tests/hero.test.ts` is a single `it(...)` addition; no existing test body is modified (R3, R5).

## 6. Branch sync and conflict resolution

After approval, on `feat/create-github-actions`, with a clean tree:

1. `git fetch origin`.
2. `git merge origin/main`. Expected conflicts: `feature_list.json` and `progress/history.md`; resolve `progress/current.md` as well if it is flagged.
3. `feature_list.json` resolution — final list, in order:
   - ids 1–4 unchanged (`done`);
   - id 5 `technologies-section`: keep main's entry verbatim;
   - id 6 `ci-github-action`: this branch's entry, renumbered from 5 (status as merged, `done`);
   - id 7 `fix-hero-headline-whitespace`: this feature, transitioning through the SDD flow.
     No duplicate `id`/`name`, valid JSON, Prettier-clean.
4. `progress/history.md` resolution: keep main's entries (including `technologies-section`) **and** this branch's `ci-github-action` entry; lose no session; update the ci entry's id reference (§8); keep the append-only ordering; Prettier-clean.
5. `progress/current.md` (if conflicting): keep this feature's session log.
6. Any other conflict: take main's side for files owned by the merged features or shared infrastructure (`src/`, `tests/`, `package.json`, `pnpm-lock.yaml`, `docs/`); take this branch's side for the CI feature artifacts (`specs/ci-github-action/`, `progress/*_ci-github-action.md`, `.github/workflows/ci.yml`, `tests/ci-workflow.test.ts`). Never drop either feature.
7. Complete the merge commit; do not rebase or force-push (the PR branch is already shared).

## 7. Dependency reinstall

- `pnpm install --frozen-lockfile` with the merged `pnpm-lock.yaml` (this branch modified no dependency); the flag proves the lockfile stays in sync.
- Verify the installed major: `node -p "require('./node_modules/astro/package.json').version"` (or `pnpm list astro`) must report Astro 7.x (`>=7.2.8 <8`).
- Red baseline before touching the component: `pnpm exec vitest run tests/hero.test.ts` fails on `renders_verbatim_hero_texts` with the `de<span` junction — the exact CI failure. Record the output in `progress/current.md`.
- After the fix and the new test: the same command is green.

## 8. Renumbering reference updates

Known references to the ci-github-action feature's old id 5 (discover with `rg -n 'id 5' specs progress feature_list.json`), and their target text:

| File                                     | Current reference                                                       | New text                                                                     |
| ---------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `feature_list.json`                      | ci entry `"id": 5`                                                      | `"id": 6`                                                                    |
| `progress/history.md`                    | `Feature id 5 (sdd: true)` in the ci entry                              | `Feature id 6 (sdd: true, renumbered from id 5 during the PR #7 sync merge)` |
| `specs/ci-github-action/requirements.md` | `(id 5, sdd: true)`, `feature_list.json id 5`, coverage header `(id 5)` | id 6 in all three                                                            |
| `specs/ci-github-action/design.md`       | `Feature id 5 (sdd: true)`                                              | `Feature id 6 (renumbered from id 5 during the PR #7 sync merge)`            |
| `progress/commit_ci-github-action.md`    | title `(id 5)`                                                          | `(id 6, renumbered from id 5 during the PR #7 sync merge)`                   |
| `progress/impl_ci-github-action.md`      | `**Feature:** id 5, ...`                                                | `id 6 (renumbered from id 5 during the PR #7 sync merge)`                    |
| `progress/review_ci-github-action.md`    | title `(id 5)`                                                          | `(id 6, renumbered from id 5 during the PR #7 sync merge)`                   |

Rules: requirement ids `R1`–`R23` of the ci spec never change; only the feature-id label. After editing, re-run the grep and confirm that every remaining `id 5` string refers to `technologies-section`.

## 9. Rejected alternatives

| Alternative                                                                          | Why rejected                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `&nbsp;` (or `&#160;`) non-breaking space entity                                     | Preserved by the compiler, but introduces a non-breaking space: it glues `de` to `ingeniería`, changing line-breaking at narrow viewports, and its width/semantics differ from the regular space of the design. The rendered assertion pins U+0020, so this would not pass anyway. |
| `&#32;` numeric character reference for a regular space                              | Same rendered result, but obscure in review and not the project's convention; `{' '}` communicates intent directly with no benefit lost.                                                                                                                                           |
| `compressHTML: true` (or `false`) in `astro.config.mjs`                              | Reverts/relaxes Astro 7's new default for the whole site to fix one component: changes whitespace behavior on every page, risks other layout shifts, and hides the pattern instead of fixing it. The human asked for the explicit component-level space.                           |
| CSS-only space (`.hero__headline-accent::before { content: ' '; }` or a left margin) | The space would not exist in the HTML contract (`renders_verbatim_hero_texts` would still fail), would be absent from text selection/copy and unreliable for assistive tech, and a margin is a layout hack for a text-spacing bug.                                                 |
| Restructure the headline markup (e.g. move text into a nested element)               | A larger DOM/style change than the bugfix requires; it would touch the accent style contract and existing tests without need.                                                                                                                                                      |
| Weaken `renders_verbatim_hero_texts` (accept `de<span`)                              | Contradicts the verbatim contract and R3; the test is correct and the component is wrong.                                                                                                                                                                                          |
| Revert/pin Astro 6 in `package.json`/lockfile                                        | Main owns the Astro 7 bump (PR #5); reverting fights the merge ref and reopens an unrelated decision.                                                                                                                                                                              |
| `set:html` raw fragment for the headline                                             | Bypasses escaping and obscures the template for a one-character fix.                                                                                                                                                                                                               |

## 10. Verification gates

- Component/test level: `pnpm exec vitest run tests/hero.test.ts` green under Astro 7, including `renders_verbatim_hero_texts` (unchanged) and `emits_explicit_headline_space` (new).
- Repo level: `pnpm validate` (lint + check + test + build) and `pnpm format:check` green.
- Scope level: `git diff origin/main -- .github/workflows/ci.yml tests/ci-workflow.test.ts astro.config.mjs` is empty; `tests/hero.test.ts` diff is additions only; `feature_list.json` has unique ids 1–7.
- PR level: after the push, the PR #7 `pull_request` run is green and the PR is mergeable — human-verified in GitHub, since Actions cannot run offline in this environment (same handling as the first ci-github-action run).

## 11. Risks

| Risk                                                                 | Mitigation                                                                                                                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Unexpected merge conflicts beyond the two predicted                  | §6 resolution rules: main for shared files, ours for feature artifacts; never drop a feature; report the actual conflict set in `progress/current.md`. |
| Local `node_modules` still on Astro 6 → false green                  | Mandatory `pnpm install --frozen-lockfile` plus installed-version check before any test run; the red baseline proves the Astro 7 failure first.        |
| Prettier reformats the expression and the new source assertion fails | The source regex tolerates inner spacing and quote style; `prettier --write` runs before the test gate; `pnpm format:check` is a closing gate.         |
| The fix uses NBSP and the normalized strict test still passes        | The new raw-junction assertion pins U+0020; §9 rejects NBSP explicitly.                                                                                |
| A stale "id 5" reference survives the renumbering                    | Grep step (tasks 5.2) plus reviewer traceability; final references must match the feature list.                                                        |
| Another Astro 7 whitespace regression exists outside the hero        | Out of scope for this bugfix (one feature at a time); if found, document it in `progress/current.md` for a follow-up feature.                          |
| PR #7 still red for an unrelated reason                              | Check the `pull_request` run after pushing; the excluded CI files are proven byte-identical to main, and any failure is reported with its run id.      |

## 12. Out of scope / future work

- `.github/workflows/ci.yml` and `tests/ci-workflow.test.ts` (already pass; must stay untouched).
- `astro.config.mjs` / `compressHTML` policy changes.
- Deployment, branch protection, other sections and dependency bumps beyond the merged lockfile.
- A repo-wide audit of inline-element spacing under Astro 7's `compressHTML: 'jsx'`.
