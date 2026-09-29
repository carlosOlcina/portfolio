# Implementation — fix-featured-project-card-layout (id 4)

Bugfix on the done `projects-section` feature. Spec:
`specs/fix-featured-project-card-layout/` (approved; all tasks `[x]`).

## Files changed (strict scope)

| File                               | Change                                                                                                                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/ProjectCard.astro` | +2 lines: `grid-row: 1;` after each `grid-column` on `.project-card--featured .project-card__meta` / `__cover`, inside the existing `@media (min-width: 1024px)` block. |
| `tests/projects-section.test.ts`   | + helpers `extractMediaBlock`, `renderFeaturedCard`; + tests `pins_featured_card_halves_to_one_row`, `stacks_featured_card_below_1024`. 0 removed lines.                |

No markup/DOM change, no `Props` change, no dependency/lockfile change, no
client-side JavaScript, no other file modified for the fix. `git diff -- src/`
is exactly the two declarations; all `grid-row`/`grid-column` occurrences in
the component are inside the ≥1024px media block.

## Verification (all green)

| Command         | Result                                                              |
| --------------- | ------------------------------------------------------------------- |
| `pnpm lint`     | exit 0, 0 errors                                                    |
| `pnpm check`    | 23 files, 0 errors / 0 warnings / 0 hints                           |
| `pnpm test`     | 10 files, 89/89 tests passed (was 87; +2 new)                       |
| `pnpm build`    | 1 page + 4 optimized WebP; built CSS contains minified `grid-row:1` |
| `pnpm validate` | exit 0                                                              |

Formatting: the two changed files and the spec files pass
`prettier --check`. Repo-wide `pnpm format:check` is red only on two
pre-existing files not touched by this feature
(`.opencode/skills/astro-modern-practices/SKILL.md`,
`progress/review_projects-section.md`); verified against their HEAD blobs with
`prettier --stdin-filepath` that they were already unformatted before this
session, and they were reverted to HEAD to respect the strict scope.

## Traceability R<n> → test

| Requirement                        | Test                                                                                     | Status |
| ---------------------------------- | ---------------------------------------------------------------------------------------- | ------ |
| R1 (row 1 / columns split ≥1024px) | `tests/projects-section.test.ts` → `pins_featured_card_halves_to_one_row`                | passes |
| R2 (`align-items: center` kept)    | `tests/projects-section.test.ts` → `styles_featured_card` (pre-existing, body untouched) | passes |
| R3 (stacked cover-first <1024px)   | `tests/projects-section.test.ts` → `stacks_featured_card_below_1024`                     | passes |
| R4 (no changes elsewhere)          | all pre-existing tests, unchanged bodies (87 → still green)                              | passes |
| R5 (zero client JS)                | `tests/projects-section.test.ts` → `ships_no_client_javascript` (pre-existing)           | passes |

## Real-browser acceptance (engine fallback)

- Path used: **engine fallback** — `/tmp/opencode/verify-fix.cjs` with the
  cached `playwright-core` (`/home/carlo/.npm/_npx/9833c18b2d85bc59`),
  `chromium.launch({ channel: 'chrome-for-testing' })`. The Playwright MCP
  still requires the pending opencode restart, so it was not used.
- Served with `pnpm build && pnpm preview --port 4321` (HTTP 200); preview
  stopped after the check (port free).
- Results (`VERIFY PASSED`, 0 console errors):

| Viewport | meta.right ≤ cover.left | same row / centers | card height (pre-fix) | no overflow | stacked cover-first   |
| -------- | ----------------------- | ------------------ | --------------------- | ----------- | --------------------- |
| 1440×900 | 704 ≤ 737 ✓             | ✓ / Δ 0px          | 365.38px (663px) ✓    | ✓           | n/a                   |
| 1024×800 | 496 ≤ 529 ✓             | ✓ / Δ 0px          | 331.88px (623px) ✓    | ✓           | n/a                   |
| 768×1024 | n/a                     | n/a                | 718.69px              | ✓           | ✓ (873.19 ≤ 905.19)   |
| 375×812  | n/a                     | n/a                | 577.94px              | ✓           | ✓ (−253.03 ≤ −221.03) |

- Screenshots: `/tmp/opencode/shots/fix-{desktop-1440,laptop-1024,tablet-768,mobile-375}-projects.png`.
  Visual comparison with pre-fix `desktop-1440-projects.png`: the empty
  top-left hole and the meta second row are gone.

## Notes

- Not marking the feature `done`; awaiting reviewer.
- No commit made.
