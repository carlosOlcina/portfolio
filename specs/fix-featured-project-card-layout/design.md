# Design — fix-featured-project-card-layout

## 1. Context and verified root cause

The featured project card (`Synapse`, `.project-card--featured`) breaks at
viewports ≥1024px: the cover renders alone in the top-right and the meta is
pushed to a second row on the left, leaving a large empty area in the top-left
of the card.

Evidence (`/tmp/opencode/shots/report.txt`, screenshots in the same directory,
captured against the current build):

| Viewport | Featured card height | Cover rect (x, y, w, h) | Meta rect (x, y, w, h) | Result            |
| -------- | -------------------- | ----------------------- | ---------------------- | ----------------- |
| 1440×900 | 663px                | 736, 419, 479×299       | 225, 750, 479×266      | two rows (bug)    |
| 1024×800 | 623px                | 528, 419, 415×259       | 81, 710, 415×266       | two rows (bug)    |
| 768×900  | 719px                | 57, 464, 654×409        | 57, 905, 654×212       | stacked (correct) |
| 375×800  | 578px                | 53, −427, 269×168       | 53, −227, 269×320      | stacked (correct) |

No horizontal overflow at any tested width, and the standard cards are
unaffected (they use flexbox).

Root cause confirmed in `src/components/ProjectCard.astro` (~lines 222–234):
inside `@media (min-width: 1024px)` the card becomes a 12-column grid and the
two halves receive definite columns but no rows:

```css
.project-card--featured .project-card__meta {
  grid-column: 1 / span 6;
}

.project-card--featured .project-card__cover {
  grid-column: 7 / span 6;
}
```

The card's DOM order is cover first, meta second. Grid auto-placement gives
the cover row 1 (columns 7–12, its definite columns); the sparse placement
cursor never moves backwards, so the meta's definite columns 1–6 are placed on
the next available row: row 2. The card therefore uses two auto rows with a
hole at row 1, columns 1–6.

## 2. Fix decision

Pin both halves to grid row 1 with `grid-row: 1` inside the existing
`@media (min-width: 1024px)` block. Explicit placement matches the style of
the existing explicit `grid-column` declarations, is deterministic, and is a
two-line diff that cannot affect anything below 1024px (the declarations live
inside the media query). The pre-existing `align-items: center` centers both
halves within the single row.

Exact change (only `src/components/ProjectCard.astro`, only the media block):

```css
@media (min-width: 1024px) {
  .project-card--featured {
    grid-template-columns: repeat(12, minmax(0, 1fr));
  }

  .project-card--featured .project-card__meta {
    grid-column: 1 / span 6;
    grid-row: 1;
  }

  .project-card--featured .project-card__cover {
    grid-column: 7 / span 6;
    grid-row: 1;
  }
}
```

Why `grid-row: 1` on both: with a definite row and column each item is
explicitly placed, so auto-placement cannot move either half; meta occupies
row 1 / columns 1–6, cover occupies row 1 / columns 7–12. `grid-row: 1` sets
`grid-row-start: 1` with an auto end, so each item spans exactly that one row
(the standard one-cell placement idiom).

Resulting geometry at ≥1024px: single row, meta left, cover right, both
vertically centered; the card collapses to roughly the height of the taller
half plus padding (no second row, no hole). Below 1024px nothing changes:
the base `.project-card--featured` stays `grid-template-columns:
minmax(0, 1fr)` and the halves stack in DOM order, cover first (R3).

## 3. Files

| File                               | Action | Responsibility                                                                                                                                                                                                            |
| ---------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/ProjectCard.astro` | modify | Add `grid-row: 1` to `.project-card--featured .project-card__meta` and `.project-card--featured .project-card__cover` inside the existing `@media (min-width: 1024px)` block (R1). No other declaration changes (R2–R4).  |
| `tests/projects-section.test.ts`   | modify | Add the `extractMediaBlock` and `renderFeaturedCard` helpers plus the tests `pins_featured_card_halves_to_one_row` (R1) and `stacks_featured_card_below_1024` (R3); pre-existing test bodies stay untouched (R2, R4, R5). |

Unchanged, explicitly: `src/components/ProjectsSection.astro`,
`src/pages/index.astro`, `src/content/**`, `src/styles/**`,
`tests/index.test.ts`, other test files, `tests/node-shims.d.ts` (no new
`readFileSync` encoding is needed), `package.json`/lockfile and all configs.
No dependency, no markup, no client-side JavaScript, no browser-runner test
dependency.

No component `Props`, public API or runtime function signature changes; the
only new signatures are the two local Vitest helpers of §4. No error or
exception is added or reused: the fix is pure CSS and introduces no runtime
code path.

## 4. Test design

Vitest runs no CSS layout engine, so the regression is pinned the same way as
the rest of the card contract: read `ProjectCard.astro` with `readFileSync`
and assert the exact declarations with the file's whitespace-normalizing
helpers. The real layout is verified separately with a browser (design §5).

### 4.1 New helper `extractMediaBlock`

The existing `extractResponsiveRule` cannot be reused for the two nested
selectors: its contract requires the selector to appear _before_ the media
marker, while `.project-card--featured .project-card__meta` / `__cover` only
appear _inside_ the block, so `indexOf(mediaMarker, selectorIndex)` would
return −1. Add a brace-matching extractor next to the existing helpers:

```ts
function extractMediaBlock(source: string, breakpoint: number): string {
  const normalized = normalize(source);
  const marker = `@media (min-width: ${breakpoint}px)`;
  const markerIndex = normalized.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Media query not found: ${marker}`);
  }

  const openIndex = normalized.indexOf('{', markerIndex);
  let depth = 0;

  for (let index = openIndex; index < normalized.length; index += 1) {
    if (normalized[index] === '{') {
      depth += 1;
    } else if (normalized[index] === '}') {
      depth -= 1;
      if (depth === 0) {
        return normalized.slice(openIndex + 1, index);
      }
    }
  }

  throw new Error(`Unbalanced media query: ${marker}`);
}
```

### 4.2 New helper `renderFeaturedCard`

The existing `renderCard` never sets the `featured` flag. Add a dedicated
helper instead of changing its signature (keeps the pre-existing test bodies
untouched):

```ts
async function renderFeaturedCard(project: ProjectData): Promise<string> {
  const container = await AstroContainer.create();
  return container.renderToString(ProjectCard, {
    props: { project, featured: true },
  });
}
```

### 4.3 New test `pins_featured_card_halves_to_one_row` (R1)

```ts
it('pins_featured_card_halves_to_one_row', () => {
  const featuredGrid = extractMediaBlock(cardSource, 1024);

  expectDeclarations(
    extractRule(featuredGrid, '.project-card--featured .project-card__meta'),
    [
      ['grid-column', '1 / span 6'],
      ['grid-row', '1'],
    ],
  );

  expectDeclarations(
    extractRule(featuredGrid, '.project-card--featured .project-card__cover'),
    [
      ['grid-column', '7 / span 6'],
      ['grid-row', '1'],
    ],
  );
});
```

This asserts both halves are explicitly placed in the same row inside the
≥1024px block: meta left (columns 1–6), cover right (columns 7–12).

### 4.4 New test `stacks_featured_card_below_1024` (R3)

```ts
it('stacks_featured_card_below_1024', async () => {
  const featuredGrid = extractMediaBlock(cardSource, 1024);
  const outsideMedia = normalize(cardSource).replace(featuredGrid, '');

  expect(outsideMedia).not.toContain('grid-row');
  expect(outsideMedia).not.toContain('grid-column');

  const html = normalize(await renderFeaturedCard(createProject()));
  expect(html.indexOf('project-card__cover')).toBeLessThan(
    html.indexOf('project-card__meta'),
  );
});
```

The static half proves no placement override exists outside the 1024px media
block (so the base single-column grid applies below 1024px); the render half
proves the DOM order is cover first, meta second. Together they pin the
stacked cover-first order.

### 4.5 Pre-existing tests (R2, R4, R5)

- `styles_featured_card` already pins `align-items: center` on
  `.project-card--featured` (R2) and the base `grid-template-columns:
minmax(0, 1fr)`; its body is not modified.
- The rest of `tests/projects-section.test.ts` pins the declarations and
  rendered markup of both cards, the section and the page (R4).
- `ships_no_client_javascript` scans `ProjectCard.astro` for `<script`,
  `client:` and inline handlers (R5).

Requirement ↔ test mapping: R1 → `pins_featured_card_halves_to_one_row`;
R2 → `styles_featured_card`; R3 → `stacks_featured_card_below_1024`;
R4 → all pre-existing tests; R5 → `ships_no_client_javascript`.

## 5. Browser-based acceptance check

**Tool status.** The Playwright MCP was fixed in this environment (its global
config command now passes `--browser chromium`, and `chromium-1247` plus the
headless shell are installed with the MCP's own Playwright CLI), but opencode
does not hot-reload MCP configs: the fix only loads after an opencode restart.
In the leader's session the MCP was not restartable, so the diagnosis was
driven directly with the Playwright engine through
`/tmp/opencode/diagnose-projects.cjs`
(`chromium.launch({ channel: 'chrome-for-testing' })` against the cached
`playwright-core` of the MCP's `npx` install).

**Procedure (tasks 4.1–4.4).**

1. Serve the current build: `pnpm build && pnpm preview` →
   `http://localhost:4321/`.
2. With the restarted session, use the Playwright MCP
   (`browser_navigate`, `browser_resize`, `browser_evaluate`,
   `browser_take_screenshot`). If the MCP is still unavailable, use the
   engine fallback: a small Node script following the pattern of
   `/tmp/opencode/diagnose-projects.cjs` (same cached `playwright-core`,
   `channel: 'chrome-for-testing'`, same `http://localhost:4321/` target).
   Record which path was used in `progress/current.md`.
3. At 1440×900 and 1024×800, evaluate for the featured card:

   ```js
   const meta = document
     .querySelector('.project-card--featured .project-card__meta')
     .getBoundingClientRect();
   const cover = document
     .querySelector('.project-card--featured .project-card__cover')
     .getBoundingClientRect();

   const sideBySide = meta.right <= cover.left + 1;
   const sameRow =
     Math.min(meta.bottom, cover.bottom) > Math.max(meta.top, cover.top);
   const centered =
     Math.abs((meta.top + meta.bottom) / 2 - (cover.top + cover.bottom) / 2) <=
     2;
   const noOverflow = document.documentElement.scrollWidth <= window.innerWidth;
   ```

   Expected: all true. Sanity check: the featured card height drops well below
   the 663px (1440) / 623px (1024) measured pre-fix, because the second row
   and the hole are gone.

4. At 768×1024 and 375×812, evaluate:
   `const stacked = cover.bottom <= meta.top + 1;` and the same
   `noOverflow` check. Expected: cover above meta, no overflow.
5. Compare the screenshots with the pre-fix evidence
   (`/tmp/opencode/shots/desktop-1440-projects.png`,
   `laptop-1024-projects.png`, `tablet-768-projects.png`,
   `mobile-375-projects.png`) and record the outcome in
   `progress/current.md`.

## 6. Rejected alternatives

| Alternative                                                                                       | Why rejected                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `grid-auto-flow: dense` on `.project-card--featured` inside the ≥1024px block                     | Dense packing would backfill the meta into row 1's empty columns, but it changes packing semantics for every grid item of the card and relies on implicit behavior instead of the explicit placement already used for the columns. Two `grid-row: 1` lines are deterministic and directly assertable. |
| Reordering the DOM (meta before cover) and swapping the column assignments at ≥1024px             | Auto-placement would then resolve without `grid-row`, but the stacked order below 1024px (R3) would flip to meta-first, contradicting the expected outcome, and the markup change is outside the minimal bugfix scope.                                                                                |
| `grid-template-areas` with named areas and explicit `grid-area` on both halves                    | Equivalent placement with a larger diff: it rewrites the existing `grid-column` declarations and adds area names for only two children. KISS prefers adding two declarations.                                                                                                                         |
| Rewriting the featured card as flexbox with `order` at ≥1024px (or `flex-direction: row-reverse`) | A structural change to a working component; it risks the glass box, the 16/10 cover box and the hover behaviour for no functional gain. Rejected as a redesign.                                                                                                                                       |
| Verifying the fix only in the browser, without a Vitest contract                                  | `docs/verification.md` requires every `R<n>` to map to a concrete Vitest test; the static CSS contract catches regressions in `pnpm validate` where no browser runs. The browser check is additional evidence, not a replacement.                                                                     |

## 7. Risks

| Risk                                                                  | Mitigation                                                                                                                                |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| The static test asserts source text, not computed layout              | The real-browser check (tasks 4.1–4.4) asserts the actual rectangles at four viewports, including the same-row overlap and centering.     |
| The fix works at the tested widths but not in between                 | The grid is proportional (`repeat(12, minmax(0, 1fr))`); 1024 and 1440 are checked explicitly plus no-overflow assertions at every width. |
| The Playwright MCP is still not loaded (it needs an opencode restart) | Documented engine fallback (`/tmp/opencode/diagnose-projects.cjs` pattern); the chosen path is recorded in `progress/current.md`.         |
| A future edit reintroduces auto-placement of the halves               | `pins_featured_card_halves_to_one_row` and `stacks_featured_card_below_1024` pin both sides of the breakpoint.                            |
