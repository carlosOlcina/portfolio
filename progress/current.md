# Current session

## Feature 7 — `fix-hero-headline-whitespace` (SDD)

Diagnosis of the failing GitHub workflow (PR #7, failed run 36712669304):

- The CI workflow itself works: push run 36711703518 passed on `feat/create-github-actions`.
- The `pull_request` run fails in `pnpm test`: `tests/hero.test.ts > renders_verbatim_hero_texts`
  expects `…intersección de <span` but the rendered HTML contains `…de<span` — under Astro 7
  (main bumped to `astro ^7.2.8` in PR #5) the compiler trims the source whitespace before the
  accent span. Real visual regression: the headline would read "deingeniería".
- PR #7 is also `CONFLICTING`: `feature_list.json` and `progress/history.md` collide with
  main's `technologies-section` (main took id 5).
- Fix scope: explicit space in `src/components/HeroSection.astro` + branch sync with main
  (merge `origin/main`; final ids: technologies-section 5, ci-github-action 6, this fix 7) +
  `pnpm validate` green under Astro 7.

Feature registered as id 7; id 6 is reserved for the renumbered `ci-github-action`
and both ids complete after the sync merge. No application code touched by the spec_author.

Spec drafted at `specs/fix-hero-headline-whitespace/{requirements,design,tasks}.md`
(R1–R5, strict EARS: rendered single space, explicit `{' '}` emission, strict contract
unchanged and green under Astro 7, no other regression). Feature status set to
`spec_ready`; awaiting human approval. No git, `src/` or `tests/` change by the
spec_author.

- Spec `specs/fix-hero-headline-whitespace/` ready (R1-R5, design, tasks); waiting for human approval before implementation.
