# Commit — feature fix-featured-project-card-layout (id 4)

- **Scope:** single atomic commit for the featured project card layout bugfix:
  the two-line CSS placement fix, the regression tests, the SDD spec, the
  browser evidence and the session bookkeeping.
- **Committer:** commits agent, 2026-09-29.
- **Pre-commit check:** `pnpm validate` green — lint + `astro check` (23 files,
  0 errors) + `pnpm test` (10 files, 89/89 tests) + build.
- **Result:** 1 commit on `main`; no push, no amend.

## Files committed

Modified:

- `feature_list.json` — feature `fix-featured-project-card-layout` added and
  marked `done`.
- `src/components/ProjectCard.astro` — `grid-row: 1` added to both featured
  card halves inside the existing `@media (min-width: 1024px)` block.
- `tests/projects-section.test.ts` — `extractMediaBlock`,
  `renderFeaturedCard` and the two regression tests (additions only; 0
  deletions).
- `progress/history.md` — 2026-09-29 layout bugfix session summary.

New (untracked before this commit):

- `specs/fix-featured-project-card-layout/{requirements,design,tasks}.md` —
  approved SDD spec (R1–R5).
- `progress/impl_fix-featured-project-card-layout.md` — implementation
  evidence.
- `progress/review_fix-featured-project-card-layout.md` — reviewer verdict
  (APPROVED).
- `progress/commit_fix-featured-project-card-layout.md` — this report (same
  commit).

## Commit message used

```
fix(projects-section): pin featured card halves to one grid row

At >=1024px the featured project card placed its cover in row 1 and its
meta in a second row: the 12-column grid assigned both halves explicit
grid-column values but no rows, so auto-placement pushed the DOM-ordered
cover to row 1 and the meta to row 2, leaving a large empty gap.

Pin both halves to grid row 1 inside the existing 1024px media query so
meta (left) and cover (right) share one row and stay vertically centered;
below 1024px the card keeps stacking cover-first. Two regression tests
pin the placement contract and the stacked order.

89 tests green across 10 files; pnpm validate green (lint + check + test
+ build); real-browser checks at 1440/1024/768/375 included.

Spec and evidence: specs/fix-featured-project-card-layout/,
progress/impl_fix-featured-project-card-layout.md,
progress/review_fix-featured-project-card-layout.md.
```

## Warnings / notes

- Environment fix outside the repo: the Playwright MCP needed
  `--browser chromium` (global opencode config) plus the chromium-1247 build;
  opencode must be restarted for it to load. The browser verification used the
  Playwright engine fallback (`/tmp/opencode/verify-fix.cjs`).
- `progress/current.md` is unchanged from HEAD (restored template); no diff
  committed.
- No remote operation performed (no push); existing commits untouched.
