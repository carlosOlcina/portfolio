# Implementation report — `fix-hero-headline-whitespace` (id 7)

- **Feature:** id 7, `name: fix-hero-headline-whitespace`, `sdd: true` (status `in_progress`; not marked `done`).
- **Spec:** `specs/fix-hero-headline-whitespace/{requirements,design,tasks}.md`, approved by the human.
- **Branch:** `feat/create-github-actions`.
- **Date:** 2026-09-30.
- **Result:** hero fix, hardening test, branch sync, renumbering and the human-approved scope
  extension (same Astro 7 whitespace class in `TechnologiesSection.astro`, §7) complete. All
  gates green under Astro 7.3.5: `pnpm test` 157/157, `pnpm lint`, `pnpm check`, `pnpm build`,
  `pnpm validate` and `pnpm format:check`. Task 6.10 remains human-verified on GitHub after the
  committer pushes.

## 1. Branch sync (tasks 1.1–1.6)

- Pre-merge state (task 1.1): branch clean at `cadaaa4`; `origin/main` = `320655c` (PR #6 merge,
  technologies-section + `astro ^7.2.8`); `origin/feat/create-github-actions` = `47fc422`, a
  GitHub web-UI conflict-resolution merge authored by the human that already contains
  `origin/main` but resolved the ids the other way around (ci 5, technologies 6, no fix entry).
- **Documented deviation (task 1.2/1.6):** the sync merged `origin/feat/create-github-actions`
  (`47fc422`, a superset of `origin/main`) instead of a fresh `git merge origin/main`, because
  `design.md` §6.7 forbids rebase/force-push on the shared branch: merging the shared tip keeps
  its commit in history, yields exactly one merge commit and keeps the branch fast-forwardable.
  The resolution itself follows `design.md` §6 exactly.
- Merge commit `edd002b` (`Merge remote-tracking branch 'origin/feat/create-github-actions' into
feat/create-github-actions`), parents `cadaaa4` and `47fc422`; only `feature_list.json`
  conflicted and was resolved per §6.
- `feature_list.json` (task 1.3): ids 1–4 unchanged, technologies-section 5 (main's entry
  verbatim), ci-github-action 6 (ours, renumbered), fix-hero-headline-whitespace 7
  (`in_progress`). 7 unique ids/names; valid JSON; Prettier-clean.
- `progress/history.md` (task 1.4): both sessions kept (main's technologies entry and the ci
  entry); the ci entry header is now
  ``Feature id 6 (`sdd: true`, renumbered from id 5 during the PR #7 sync merge)``.
- No other conflicts (task 1.5).
- Branch relation after the merge: `origin/feat/create-github-actions` is an ancestor of `HEAD`
  (0 behind, 2 ahead: `cadaaa4` + `edd002b`), so the committer's push can fast-forward — no
  rebase and no force-push needed.

## 2. Dependency reinstall and red baseline (tasks 2.1–2.2)

- `pnpm install --frozen-lockfile` → up to date, no lockfile edit; installed
  **Astro 7.3.5** (`node -p "require('./node_modules/astro/package.json').version"` → `7.3.5`,
  merged `pnpm-lock.yaml` pins `astro@7.3.5`), `pnpm list astro --depth 0` → `astro@7.3.5`.
- Red baseline (task 2.2), `pnpm exec vitest run tests/hero.test.ts` (full output:
  `/tmp/opencode/red-baseline-astro7.txt`):

  ```
  ❯ tests/hero.test.ts (9 tests | 1 failed)
    × renders_verbatim_hero_texts
  FAIL tests/hero.test.ts > hero section > renders_verbatim_hero_texts
  Expected: "Desarrollo digital en la intersección de <span"
  Received: "...>Desarrollo digital en la intersección de<span class="hero__headline-accent"...
  Tests  1 failed | 8 passed (9)
  ```

  Exactly the `de<span` junction of the CI failure, reproduced under Astro 7 before any edit.

## 3. Component fix (tasks 3.1–3.3)

- `src/components/HeroSection.astro` gains the explicit expression text node, nothing else:

  ```diff
  -        Desarrollo digital en la intersección de
  +        Desarrollo digital en la intersección de{' '}
           <span class="hero__headline-accent">ingeniería e IA.</span>
  ```

- `pnpm exec prettier --write src/components/HeroSection.astro` → `(unchanged)`; the expression
  survives and the file stays Prettier-clean.
- Rendered junction confirmed with the strict test after the fix:
  `pnpm exec vitest run tests/hero.test.ts -t renders_verbatim_hero_texts` → `1 passed | 8 skipped`.
- Scope extension (task 3.3, R6): `src/components/TechnologiesSection.astro` gains the same
  explicit expression between `Tecnologías y herramientas` and the accent `<span>` (one-line
  diff); `prettier --write` → `(unchanged)`.

## 4. Test hardening (tasks 4.1–4.2)

- `tests/hero.test.ts` gains one test after `renders_verbatim_hero_texts` (additions only):

  ```ts
  it('emits_explicit_headline_space', async () => {
    expect(heroSource).toMatch(/intersección de\s*\{\s*['"] ['"]\s*\}\s*<span/);

    const html = await renderHero();
    const junction = /intersección de(.)<span/.exec(html);
    expect(junction?.[1]).toBe(' ');
  });
  ```

- `pnpm exec prettier --check tests/hero.test.ts` → clean; diff is the single `it(...)`
  addition, no existing body touched (task 6.8 review).
- `pnpm exec vitest run tests/hero.test.ts` → **10 passed (10)**.

## 5. Renumbering updates (tasks 5.1–5.3)

- Applied `design.md` §8: `specs/ci-github-action/requirements.md` (three references → id 6),
  `specs/ci-github-action/design.md` (id 6 + note), `progress/commit_ci-github-action.md`,
  `progress/impl_ci-github-action.md` and `progress/review_ci-github-action.md` (id 6 + note;
  remaining body references renumbered too).
- `rg -n 'id 5' specs progress feature_list.json` (task 5.2): every remaining match either
  refers to `technologies-section` or is an explicit "renumbered from id 5" note; no stale
  ci-github-action id reference.
- `feature_list.json` (task 5.3): exactly 7 features, unique ids 1–7 and unique names, this
  feature `in_progress`, ci-github-action `done` as id 6.

## 6. Gates (tasks 6.1–6.9)

| Task | Command                       | Result                                                                                                                                                                                                 |
| ---- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 6.1  | `pnpm lint`                   | green (`eslint .`, no findings)                                                                                                                                                                        |
| 6.2  | `pnpm check`                  | green: 29 files, 0 errors / 0 warnings / 0 hints                                                                                                                                                       |
| 6.3  | `pnpm test`                   | green: 14 files, 157/157 tests (hero 10/10, technologies 27/27)                                                                                                                                        |
| 6.4  | `pnpm build`                  | green: 1 page built, 4 WebP images optimized, no warnings                                                                                                                                              |
| 6.5  | `pnpm validate`               | green: lint + check + test + build all pass                                                                                                                                                            |
| 6.6  | `pnpm format:check`           | green after format-only normalization of this session's files (see §8)                                                                                                                                 |
| 6.7  | scope check                   | `.github/workflows/ci.yml`, `tests/ci-workflow.test.ts`, `astro.config.mjs` byte-identical to `47fc422` and `0bfa780`; only design §3 files changed by this feature (plus the merge's main-side files) |
| 6.8  | `git diff tests/hero.test.ts` | additions only; `renders_verbatim_hero_texts` body byte-identical                                                                                                                                      |
| 6.9  | evidence recorded             | this report + `progress/current.md`                                                                                                                                                                    |
| 6.10 | human verification on GitHub  | pending: PR #7 run after the committer's push (Actions cannot run offline here)                                                                                                                        |

- Fast test outputs: `/tmp/opencode/red-baseline-astro7.txt`, `/tmp/opencode/final-test-fresh.txt`,
  `/tmp/opencode/final-build.txt`, `/tmp/opencode/baseline-main-technologies.txt`,
  `/tmp/opencode/extension-final-test.txt`, `/tmp/opencode/extension-lint.txt`,
  `/tmp/opencode/extension-check.txt`, `/tmp/opencode/extension-build.txt`.
- Local-reproducibility note: an initial `pnpm test` showed 4 failures because a stale Astro 6
  `.astro/data-store.json` made the unmocked `getCollection('projects')` in `tests/toast.test.ts`
  and `tests/fonts.test.ts` load real entries with unresolved `__ASTRO_IMAGE_` placeholders.
  After `rm -rf .astro && pnpm check` (fresh Astro 7 sync; Astro 7 writes
  `.astro/collections/*.schema.json`, not the old data store) and after `pnpm build`, those tests
  pass; the only failure was §7, now fixed by the scope extension.

## 7. Scope extension (human-approved) — Astro 7 whitespace regression in the technologies section

- **Symptom:** `tests/technologies-section.test.ts > renders_section_header` (line 275) expects
  `Tecnologías y herramientas <span class="tech-stack__title-accent"` but the compiler renders
  `Tecnologías y herramientas<span ...` — the same `compressHTML: 'jsx'` trim as the hero bug,
  in `src/components/TechnologiesSection.astro` (lines 41–43).
- **Pre-existing, not caused by this feature:**
  - `git diff 320655c HEAD -- src/components/TechnologiesSection.astro tests/technologies-section.test.ts`
    is empty (main's exact files); `package.json` / `pnpm-lock.yaml` are also main's exact files.
  - Reproduced on a pristine `320655c` worktree with the same installed Astro 7.3.5:
    `1 failed | 26 passed (27)` (`/tmp/opencode/baseline-main-technologies.txt`).
  - The main-side session reported 133/133 green, but with a local `node_modules` still on
    Astro 6 (the same stale-install trap that hid the hero bug); CI run `36713718221` (head
    `47fc422`, main's 7.3.5 lockfile) failed at `pnpm format:check` before reaching tests, and
    run `36712669304` predates main's technologies merge (11 files, hero-only failure).
- **Why no fix was applied in the first pass:** `design.md` §11/§12 classify any other Astro 7
  whitespace regression as out of scope ("one feature at a time; document for a follow-up") and
  the human had limited this feature to the files in `design.md` §3; per the implementer
  protocol the session stopped and reported the blocker instead of deviating.
- **Resolution (human-approved scope extension):** the human authorized extending feature 7
  (same root cause, same PR, same documented remedy). `src/components/TechnologiesSection.astro`
  now emits `{' '}` after `Tecnologías y herramientas`; `tests/technologies-section.test.ts` is
  unchanged. `R6` documents the contract (`requirements.md` §2) and task 3.3 is `[x]`.
- **Verification after the fix:** `pnpm exec vitest run tests/technologies-section.test.ts
tests/hero.test.ts` → **37 passed (37)**; full `pnpm test` → **157 passed (157)**; all gates
  green (see §6).

## 8. Scope and working tree

- Uncommitted (left for the committer after review, per the leader's instruction): the
  `{' '}` fixes in `HeroSection.astro` and `TechnologiesSection.astro`, the new
  `emits_explicit_headline_space` test, the §5 renumbering edits, the R6 spec additions,
  this report and `progress/current.md`.
- Format-only normalization: this feature's markdown files are normalized with Prettier
  (reported in `progress/current.md`).
- Out of scope and untouched: `.github/workflows/ci.yml`, `tests/ci-workflow.test.ts`,
  `astro.config.mjs`, `tests/technologies-section.test.ts` (test body unchanged), every other
  component/page/test, and the merged main artifacts. `src/components/TechnologiesSection.astro`
  is modified only by the human-approved scope extension (§7).

## 9. Traceability `R1`–`R6` → test

| Requirement | Test                                                                                                              | Status |
| ----------- | ----------------------------------------------------------------------------------------------------------------- | ------ |
| R1          | `tests/hero.test.ts` → `emits_explicit_headline_space` (raw junction = U+0020) + `renders_verbatim_hero_texts`    | green  |
| R2          | `tests/hero.test.ts` → `emits_explicit_headline_space` (source-level explicit-construct assertion)                | green  |
| R3          | `tests/hero.test.ts` → `renders_verbatim_hero_texts` (body byte-identical in the diff)                            | green  |
| R4          | `tests/hero.test.ts` → `renders_verbatim_hero_texts` under the merged Astro 7.3.5 install (red baseline → green)  | green  |
| R5          | all pre-existing `tests/hero.test.ts` (10/10) and `tests/index.test.ts` tests, unchanged bodies (within 156 pass) | green  |
| R6          | `tests/technologies-section.test.ts` → `renders_section_header` (pre-existing, body unchanged)                    | green  |
