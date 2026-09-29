# Review — feature fix-featured-project-card-layout (id 4)

**Veredicto:** APPROVED

Independent reviewer verification (2026-09-29): all gates re-run from scratch,
all claims cross-checked against the working tree and independently reproduced
browser evidence.

## Trazabilidad requirements ↔ tests

- **R1:** [x] covered by `tests/projects-section.test.ts:443` →
  `pins_featured_card_halves_to_one_row`. The test extracts the
  `@media (min-width: 1024px)` block with the new `extractMediaBlock` helper
  (`:155-178`, brace matching) and asserts `grid-column: 1 / span 6` +
  `grid-row: 1` on the meta and `grid-column: 7 / span 6` + `grid-row: 1` on
  the cover. It matches the fix at `src/components/ProjectCard.astro:227-235`
  and is fix-sensitive: against the pre-fix CSS the `grid-row: 1` assertion
  fails.
- **R2:** [x] covered by `tests/projects-section.test.ts:402` →
  `styles_featured_card` (pre-existing, body untouched). It pins
  `align-items: center` on `.project-card--featured` (`:407`) and the base
  `grid-template-columns: minmax(0, 1fr)` (`:405`). Browser confirms vertical
  centers within 0px at both ≥1024px viewports.
- **R3:** [x] covered by `tests/projects-section.test.ts:463` →
  `stacks_featured_card_below_1024`. Static half removes the 1024px block
  content and asserts no `grid-row`/`grid-column` remains anywhere else (so
  the 768px block and the base rule are covered too); render half uses the new
  `renderFeaturedCard` helper (`:202-207`) and asserts `project-card__cover`
  precedes `project-card__meta` in the rendered markup. `renderToString` does
  not include component styles (Astro docs: only `renderComponent` with the
  `?container` query does), so the indexOf comparison is a real DOM-order
  assertion, not a CSS-text artifact.
- **R4:** [x] covered by all pre-existing tests with unchanged bodies:
  `git diff --numstat` for `tests/projects-section.test.ts` is **65 insertions,
  0 deletions** (only the two helpers and two `it(...)` blocks were added), and
  `src/` has no change other than the two declarations.
- **R5:** [x] covered by `tests/projects-section.test.ts:759` →
  `ships_no_client_javascript` (pre-existing, unchanged); no `<script>`,
  `client:*` or inline handler in the diff.

Every `R<n>` maps to at least one concrete test; the two new tests map to
R1/R3; no orphan test was added.

## Tasks completas

- [x] 1.1 `src/components/ProjectCard.astro:229` — `grid-row: 1;` added after
      `grid-column: 1 / span 6;` inside the existing 1024px media block.
- [x] 1.2 `src/components/ProjectCard.astro:234` — `grid-row: 1;` added after
      `grid-column: 7 / span 6;` in the same block.
- [x] 1.3 Only those two declarations changed: `rg "grid-(row|column)"` on the
      component returns only lines 228/229/233/234, all inside 222–236; base
      rule keeps `minmax(0, 1fr)` (`:202`) and `align-items: center` (`:204`).
- [x] 2.1 `extractMediaBlock` helper at `tests/projects-section.test.ts:155-178`.
- [x] 2.2 `renderFeaturedCard` helper at `:202-207`.
- [x] 2.3 `pins_featured_card_halves_to_one_row` at `:443-461`.
- [x] 2.4 `stacks_featured_card_below_1024` at `:463-474`.
- [x] 2.5 Pre-existing test bodies untouched (0 deletions); `styles_featured_card`
      still pins `align-items: center`.
- [x] 2.6 `ships_no_client_javascript` green with no new script/client code.
- [x] 3.1 `pnpm lint` 0 errors; no disabled rules, no TODO/FIXME, no
      `console.log` in the changed files (see observation 1 about format:check).
- [x] 3.2 `pnpm check`: 23 files, 0 errors / 0 warnings / 0 hints.
- [x] 3.3 `pnpm test`: 10 files, 89/89 passed (87 pre-existing + 2 new).
- [x] 3.4 `pnpm build`: 1 page + 4 optimized WebP; `dist/_astro/*.css` contains
      the minified `grid-row:1`.
- [x] 3.5 `pnpm validate` exit 0 (re-run by the reviewer).
- [x] 3.6 Scope check: only the two design.md §3 files changed by the fix.
- [x] 4.1 Engine fallback documented in `progress/current.md:27-33,64-68`
      (MCP still needs the pending opencode restart; script path and cached
      `playwright-core` recorded).
- [x] 4.2 Independent re-run at 1440×900: card 365.38px (pre-fix 663px),
      meta.right 704 ≤ cover.left 736, same row, center delta 0px, no overflow;
      at 1024×800: card 331.88px (pre-fix 623px), 496 ≤ 528, same row, delta
      0px, no overflow.
- [x] 4.3 At 768×1024: cover.bottom 873.19 ≤ meta.top 905.19; at 375×812:
      cover.bottom −253.03 ≤ meta.top −221.03; no overflow in both.
- [x] 4.4 The four screenshots exist under `/tmp/opencode/shots/` and were
      visually inspected: ≥1024 meta left / cover right in one row, <1024
      stacked cover-first; the pre-fix `desktop-1440-projects.png` shows the old
      hole/two-row bug for contrast.

All 18 checkboxes are `[x]` and each claim was verified true (except the
format:check scope note, see observation 1 — non-blocking).

## Scope / git state

- `git status --porcelain`: `M feature_list.json` (leader's status change),
  `M progress/current.md` (session log), `M src/components/ProjectCard.astro`,
  `M tests/projects-section.test.ts`; untracked
  `progress/impl_fix-featured-project-card-layout.md` and
  `specs/fix-featured-project-card-layout/`. No `package.json`/lockfile, no
  config, no content, no other `src/` or `tests/` file.
- `git diff -- src/` is exactly the two `grid-row: 1;` lines; the test diff is
  additions only.
- No lint rule disabled, no dead code, no debug leftovers.
- **No commit made** (`git log -1` = `877404d feat(projects-section): ...`,
  pre-existing) and the feature is **not** `done` (still `in_progress` in
  `feature_list.json:36`).

## Static gates (reviewer re-run)

`pnpm validate` → green: `eslint` 0 errors; `astro check` 23 files, 0 errors /
0 warnings / 0 hints; `vitest` 10 files, 89/89; `astro build` 1 page + 4
optimized WebP. Matches the reported 87 pre-existing + 2 new.

## Browser evidence

- Re-ran `/tmp/opencode/verify-fix.cjs` against a fresh
  `pnpm build && pnpm preview --port 4321` (server stopped afterwards, port
  4321 free): `VERIFY PASSED`, 0 console errors, measurements identical to
  `progress/impl_fix-featured-project-card-layout.md` and `progress/current.md`.
- Screenshots `/tmp/opencode/shots/fix-{desktop-1440,laptop-1024,tablet-768,mobile-375}-projects.png`
  inspected: correct layouts at all four widths.

## Checkpoints

- C1: [x] harness files and docs exist; `pnpm validate` green.
- C2: [x] exactly one `in_progress` (id 4); `done` features keep their tests;
  `progress/current.md` describes only the active session.
- C3: [x] `src/pages/` only `index.astro`; components in `src/components/`
  PascalCase; no `console.log`/TODO; no client JS added.
- C4: [x] tests for the relevant units; 89/89 green; `pnpm check` 0 errors.
- C5: [x] untracked files are the expected spec + implementation log (no
  `*.tmp`/stray `dist/`); `progress/history.md` holds the previous session
  entry; feature status `in_progress` (correct pre-review). This session's
  history entry is pending by design at close.
- C6: [x] `specs/fix-featured-project-card-layout/{requirements,design,tasks}.md`
  present; EARS with exactly one MUST per requirement; all tasks `[x]`; every
  `R<n>` covered by a concrete test.

## Observations (non-blocking)

1. `progress/current.md:56-59` claims repo-wide `pnpm format:check` is red
   only on the two pre-existing files. Re-run today: 4 warnings — the two
   pre-existing (`.opencode/skills/astro-modern-practices/SKILL.md`,
   `progress/review_projects-section.md`; both already unformatted at HEAD,
   verified with `prettier` against the HEAD blobs) plus this session's own
   `progress/current.md` and
   `progress/impl_fix-featured-project-card-layout.md` (markdown list wrap and
   table alignment). The implementation files, spec files and
   `feature_list.json` are Prettier-clean. `format:check` is not part of
   `pnpm validate`. Recommendation for session close: run
   `pnpm exec prettier --write progress/current.md progress/impl_fix-featured-project-card-layout.md`
   and correct the note. This does not affect the feature's code, tests,
   traceability or scope.

## Cambios requeridos

None.
