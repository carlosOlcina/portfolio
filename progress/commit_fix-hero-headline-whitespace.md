# Commit — feature fix-hero-headline-whitespace (id 7)

- **Scope:** three commits for the failing PR #7: the approved spec
  (`cadaaa4`), the branch sync with the human's web merge (`edd002b`), and the
  Astro 7 whitespace fix + contract hardening + id renumbering + closure (this
  commit).
- **Committer:** commits agent, 2026-09-30.
- **Pre-commit check:** `pnpm validate` green under Astro 7.3.5 — lint +
  `astro check` (29 files, 0 errors) + `pnpm test` (14 files, 157/157 tests) +
  build; `pnpm format:check` green repo-wide.
- **Result:** pushed to `origin/feat/create-github-actions` (fast-forward, no
  force, no rebase) so PR #7 re-runs and becomes mergeable.

## Files committed

Commit `cadaaa4` (spec):

- `specs/fix-hero-headline-whitespace/{requirements,design,tasks}.md`,
  `feature_list.json`, `progress/current.md`.

Commit `edd002b` (sync merge):

- `feature_list.json` and `progress/history.md` conflict resolutions (final
  numbering: technologies-section 5, ci-github-action 6, this fix 7).

This commit:

Modified:

- `src/components/HeroSection.astro` — explicit `{' '}` before the accent span
  (R1, R2).
- `src/components/TechnologiesSection.astro` — same remedy (R6, human-approved
  scope extension).
- `tests/hero.test.ts` — additions only: `emits_explicit_headline_space`
  (R1–R3).
- `feature_list.json` — feature 7 marked `done`.
- `progress/history.md` — 2026-09-30 fix session entry.
- `progress/current.md` — emptied to template.
- `specs/fix-hero-headline-whitespace/{requirements,design,tasks}.md` — scope
  extension (R6, extension note, task 3.3).
- `specs/ci-github-action/{requirements,design}.md` and
  `progress/{commit,impl,review}_ci-github-action.md` — ci feature id renumbered
  5 → 6.

New:

- `progress/impl_fix-hero-headline-whitespace.md`
- `progress/review_fix-hero-headline-whitespace.md`
- `progress/commit_fix-hero-headline-whitespace.md` (this report).

## Commit message used

```text
fix: restore spaces trimmed by Astro 7 compressHTML

Astro 7 changed the default of compressHTML from true to 'jsx', which
strips template whitespace around inline elements. Two headings that
relied on incidental whitespace rendered without their separating
space (HeroSection: "intersección de<span>", TechnologiesSection:
"herramientas<span>"), breaking their verbatim contracts and reading
wrong on screen; PR #7's merge-ref run caught the first one. Emit the
space explicitly with {' '} in both components, the remedy documented
in the Astro 7 upgrade guide.

Harden the hero contract with emits_explicit_headline_space
(additions only): the source assertion requires the explicit construct
and the rendered junction is pinned to a regular U+0020, rejecting a
missing, doubled or non-breaking space. renders_verbatim_hero_texts
and every other existing test body stay unchanged; the technologies
contract needed no change.

Sync feat/create-github-actions with main (the human's web-merge
resolution 47fc422 plus the feature id renumbering: technologies-section
5, ci-github-action 6, this fix 7) so PR #7 becomes mergeable. Astro
7.3.5 installed from the merged frozen lockfile; pnpm validate and
pnpm format:check green. Excludes CI workflow changes:
.github/workflows/ci.yml and tests/ci-workflow.test.ts already pass.

Spec and evidence: specs/fix-hero-headline-whitespace/,
progress/impl_fix-hero-headline-whitespace.md,
progress/review_fix-hero-headline-whitespace.md.
```

## Warnings / notes

- The human's GitHub web-merge (`47fc422`) had numbered `ci-github-action` 5 /
  `technologies-section` 6; the approved spec normalized the final numbering to
  technologies-section 5 / ci-github-action 6 / fix 7, kept everywhere with
  renumbering notes.
- The push triggers both the `push` and the `pull_request` runs for PR #7; the
  first real verification is done by the human in the GitHub UI (Actions cannot
  run offline here).
- No secrets, credentials or build artifacts included; `dist/` and `.astro/`
  remain gitignored.
