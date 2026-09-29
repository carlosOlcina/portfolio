# Tasks — fix-featured-project-card-layout

Ordered checklist. Each task references the `R<n>` it covers. The implementer
marks `[x]` as tasks complete; `pnpm validate` must be green at the end. Only
`src/components/ProjectCard.astro` and `tests/projects-section.test.ts` are
touched (design.md §3); no new dependency, no client-side JavaScript, no
markup change.

## 1. CSS fix — `src/components/ProjectCard.astro` (modify)

- [x] 1.1 Add `grid-row: 1;` after `grid-column: 1 / span 6;` inside
      `.project-card--featured .project-card__meta`, within the existing
      `@media (min-width: 1024px)` block (design.md §2). — R1
- [x] 1.2 Add `grid-row: 1;` after `grid-column: 7 / span 6;` inside
      `.project-card--featured .project-card__cover`, within the same block.
      — R1
- [x] 1.3 Confirm the only changes in `src/` are those two declarations: the
      base `.project-card--featured` keeps `grid-template-columns:
minmax(0, 1fr)` and `align-items: center`, and no `grid-row` or
      `grid-column` declaration exists outside the ≥1024px block. — R2, R3, R4

## 2. Regression tests — `tests/projects-section.test.ts` (modify)

- [x] 2.1 Add the `extractMediaBlock(source, breakpoint)` helper with brace
      matching, next to the existing CSS helpers (design.md §4.1). — R1, R3
- [x] 2.2 Add the `renderFeaturedCard(project)` helper that renders
      `ProjectCard` with `featured: true` (design.md §4.2). — R3
- [x] 2.3 Add `pins_featured_card_halves_to_one_row`: extract the 1024px media
      block and assert `grid-column: 1 / span 6` + `grid-row: 1` on the meta
      and `grid-column: 7 / span 6` + `grid-row: 1` on the cover (design.md
      §4.3). — R1
- [x] 2.4 Add `stacks_featured_card_below_1024`: assert `grid-row` and
      `grid-column` appear only inside the 1024px media block, and that the
      rendered featured article puts `project-card__cover` before
      `project-card__meta` (design.md §4.4). — R3
- [x] 2.5 Confirm no pre-existing test body was modified: `styles_featured_card`
      still pins `align-items: center` (R2) and the rest of the suite (R4) is
      green. — R2, R4
- [x] 2.6 Confirm `ships_no_client_javascript` passes with no new `<script>`,
      `client:*` or inline handler in `ProjectCard.astro`. — R5

## 3. Static verification

- [x] 3.1 Run `pnpm format:check` and `pnpm lint`; no disabled rules, no
      TODOs, no dead CSS. — all R
- [x] 3.2 Run `pnpm check` (strict Astro/TypeScript diagnostics). — all R
- [x] 3.3 Run `pnpm test`; all tests green, including the two new ones. — all R
- [x] 3.4 Run `pnpm build`; the built home page still contains the featured
      card markup and the optimized covers. — all R
- [x] 3.5 Run `pnpm validate` end-to-end and confirm it is green. — all R
- [x] 3.6 Scope check: only `src/components/ProjectCard.astro` and
      `tests/projects-section.test.ts` changed for the fix; no dependency
      added, no client JS, no markup change. — R4, R5

## 4. Real-browser acceptance check (≥1024px and <1024px)

- [x] 4.1 Serve the current build (`pnpm build && pnpm preview`) at
      `http://localhost:4321/` and drive a real browser: the fixed Playwright
      MCP (global config now passes `--browser chromium`, needs an opencode
      restart to load) or, if still unavailable, the engine fallback of
      design.md §5 (`/tmp/opencode/diagnose-projects.cjs` pattern against the
      cached `playwright-core`). Record which path was used in
      `progress/current.md`. — R1, R2, R3, R4
- [x] 4.2 At 1440×900 and 1024×800, assert for the featured card: meta left of
      cover (`meta.right <= cover.left + 1`), same row (vertical rectangles
      overlap), vertical centers within 2px, and no horizontal overflow
      (`document.documentElement.scrollWidth <= window.innerWidth`). Sanity
      check: the card height drops well below the pre-fix 663px / 623px.
      — R1, R2, R4
- [x] 4.3 At 768×1024 and 375×812, assert `cover.bottom <= meta.top + 1`
      (stacked cover-first) and no horizontal overflow. — R3, R4
- [x] 4.4 Save the screenshots under `/tmp/opencode/shots/` (e.g.
      `fix-desktop-1440-projects.png`, `fix-laptop-1024-projects.png`,
      `fix-tablet-768-projects.png`, `fix-mobile-375-projects.png`), compare
      them with the pre-fix evidence and record the outcome in
      `progress/current.md`. — R1, R2, R3, R4

## Definition of done

- All checkboxes `[x]` and `pnpm validate` green.
- Every `R<n>` of `requirements.md` covered by the traceability table tests.
- Real-browser evidence at ≥1024px (one row, meta left / cover right,
  centered) and <1024px (stacked cover-first) recorded, with the browser path
  documented.
- Only the two design.md §3 files changed for the fix; no dependency, no
  client-side JavaScript.
