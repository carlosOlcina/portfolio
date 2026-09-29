# Requirements — fix-featured-project-card-layout

- **Feature:** `fix-featured-project-card-layout` (id 4, `sdd: true`).
- **Type:** bugfix on the done `projects-section` feature (id 3); no redesign.
- **Bug:** at viewports ≥1024px the featured project card (`Synapse`,
  `.project-card--featured`) breaks: the cover renders alone in the top-right
  and the meta is pushed to a second row on the left, leaving a large empty
  area in the top-left of the card.
- **Verified root cause:** in `src/components/ProjectCard.astro`, the
  `@media (min-width: 1024px)` block gives
  `.project-card--featured .project-card__meta` `grid-column: 1 / span 6` and
  `.project-card--featured .project-card__cover` `grid-column: 7 / span 6`
  with no explicit rows; with the default grid auto-flow and the DOM order
  (cover first, meta second), the cover is placed in row 1 (columns 7–12) and
  the meta is auto-placed in row 2 (columns 1–6).
- **Evidence:** `/tmp/opencode/shots/report.txt` and the screenshots
  `desktop-1440-projects.png`, `laptop-1024-projects.png`,
  `tablet-768-projects.png` and `mobile-375-projects.png` in the same
  directory. At 1440×900 the featured card is 663px tall (cover at y=419, meta
  at y=750); at 1024×800 it is 623px (cover at y=419, meta at y=710); at
  768×900 the card stacks correctly (cover at y=464, meta at y=905).
- **In scope:** the row pinning inside the existing
  `@media (min-width: 1024px)` block of `src/components/ProjectCard.astro` and
  the regression tests in `tests/projects-section.test.ts`.
- **Out of scope:** any redesign; markup/DOM-order changes; declarations
  outside the ≥1024px block; `ProjectsSection.astro`, `src/pages/index.astro`,
  content entries, styles/tokens; new dependencies; client-side JavaScript;
  any file outside the two listed in `design.md` §3.

**Notation.** Every requirement uses EARS and contains exactly one `MUST` /
`MUST NOT`. Ids `R<n>` are stable. Every requirement is verified by at least
one concrete Vitest test (see `Traceability` at the end), and the real-browser
check of `tasks.md` §4 provides the rendered-geometry evidence.

---

## 1. Featured card placement

### R1 — Both halves share grid row 1 at ≥1024px

WHEN the viewport is at least 1024px wide, the system MUST place
`.project-card--featured .project-card__meta` in grid row 1, columns 1–6, and
`.project-card--featured .project-card__cover` in grid row 1, columns 7–12, by
declaring `grid-row: 1` alongside the existing `grid-column` values inside the
`@media (min-width: 1024px)` block of `src/components/ProjectCard.astro`.

**Verification:** `tests/projects-section.test.ts` →
`pins_featured_card_halves_to_one_row` (extracts the 1024px media block and
asserts `grid-row: 1` plus the column split on both selectors). Rendered
geometry: `tasks.md` task 4.2.

### R2 — Vertical centering preserved

The system MUST keep `align-items: center` on `.project-card--featured`, so at
viewports ≥1024px the shorter half is vertically centered against the taller
one inside row 1.

**Verification:** `tests/projects-section.test.ts` → `styles_featured_card`
(pre-existing `align-items: center` assertion, kept unmodified). Rendered
geometry: `tasks.md` task 4.2.

### R3 — Stacked cover-first order below 1024px

WHILE the viewport is narrower than 1024px, the system MUST NOT apply any
`grid-row` or `grid-column` placement to
`.project-card--featured .project-card__meta` or
`.project-card--featured .project-card__cover`, so the single-column featured
card keeps stacking the cover first and the meta second in DOM order.

**Verification:** `tests/projects-section.test.ts` →
`stacks_featured_card_below_1024` (asserts `grid-row`/`grid-column` appear only
inside the 1024px media block, and that the rendered featured article places
`project-card__cover` before `project-card__meta`). Rendered geometry:
`tasks.md` task 4.3.

## 2. Regression safety

### R4 — No change outside the ≥1024px placement fix

The system MUST NOT change any other declaration or any rendered markup of
`ProjectCard.astro`, `ProjectsSection.astro` or `src/pages/index.astro`.

**Verification:** the pre-existing tests of `tests/projects-section.test.ts`
run with unchanged bodies and stay green (`styles_featured_card`,
`styles_standard_card`, `styles_projects_grid`, `styles_card_hover`,
`styles_card_covers`, `styles_card_titles`, `styles_card_descriptions`,
`styles_technology_pills`, `renders_featured_card_and_ordered_grid`,
`renders_section_header`, `renders_project_card_covers`,
`renders_technology_pills`, `renders_website_links`,
`renders_github_link_when_present`, `omits_github_link_when_absent`,
`marks_external_links_with_accessible_names`, `renders_link_icons`,
`renders_single_h2`, `renders_projects_section_after_hero`,
`loads_project_collection_in_index`).

### R5 — Zero client JavaScript

The system MUST NOT add any client-side script, hydrated island (`client:*`)
or inline event-handler attribute to `src/components/ProjectCard.astro`.

**Verification:** `tests/projects-section.test.ts` → `ships_no_client_javascript`
(pre-existing, unchanged).

---

## Traceability

| Requirement | Test file                        | Test name                                                                                                                         |
| ----------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| R1          | `tests/projects-section.test.ts` | `pins_featured_card_halves_to_one_row` (new)                                                                                      |
| R2          | `tests/projects-section.test.ts` | `styles_featured_card` (pre-existing, unchanged)                                                                                  |
| R3          | `tests/projects-section.test.ts` | `stacks_featured_card_below_1024` (new)                                                                                           |
| R4          | `tests/projects-section.test.ts` | all pre-existing tests, unchanged bodies (e.g. `styles_standard_card`, `styles_card_covers`, `loads_project_collection_in_index`) |
| R5          | `tests/projects-section.test.ts` | `ships_no_client_javascript` (pre-existing, unchanged)                                                                            |

## Feature description coverage

| Feature description item (id 4)                                                       | Requirements |
| ------------------------------------------------------------------------------------- | ------------ |
| Featured card breaks at ≥1024px: cover row 1 right, meta row 2 left, large empty gap  | R1           |
| Meta (left) and cover (right) side by side in one row at ≥1024px, vertically centered | R1, R2       |
| Below 1024px it keeps the current stacked order (cover first)                         | R3           |
| No visual regressions in the rest of the section                                      | R2, R4       |
| Regression test for the responsive placement                                          | R1, R3       |
| Minimal bugfix scope: no redesign, no new dependencies, no client-side JavaScript     | R4, R5       |
