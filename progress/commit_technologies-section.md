# Commit — feature technologies-section (id 5)

- **Scope:** single atomic commit for the complete `technologies-section`
  increment: JSON content collection + schema + seeds + vendored svgl icons,
  section component, tests, SDD spec, evidence and session bookkeeping.
- **Committer:** commits agent, 2026-09-30.
- **Pre-commit check:** `pnpm validate` green — lint + `astro check` (28 files,
  0 errors) + `pnpm test` (13 files, 133/133 tests) + build with 4 optimized
  WebP images.
- **Result:** 1 commit on branch `feat/create-tecnologies-section`; no push.

## Files committed

Modified:

- `feature_list.json` — feature `technologies-section` added and marked `done`.
- `progress/history.md` — 2026-09-30 technologies-section session summary.
- `src/content.config.ts` — adds the `technologies` JSON collection (glob
  loader + schema); `projects` untouched.
- `src/pages/index.astro` — loads `getCollection('technologies')` and renders
  `<TechnologiesSection />` after `<ProjectsSection />`.
- `src/styles/tokens.css` — adds `--font-mono` (quote badge).
- `tests/index.test.ts` — collection-aware `astro:content` mock; script/island
  scan extended to the new component.
- `tests/projects-section.test.ts` — collection-aware mock (`technologies`
  branch returns `[]`).
- `tests/projects-schema.test.ts` — one-line `collections` assertion update
  required by R1 (authorized deviation; no projects behavior changed).

New (untracked before this commit):

- `specs/technologies-section/{requirements,design,tasks}.md` — approved SDD
  spec (R1–R44, traceability, all tasks `[x]`).
- `src/content/technologies-schema.ts` — `technologiesSchema`,
  `TECHNOLOGY_CATEGORIES`, `TechnologyData`, `assertUniqueTechnologies`,
  `groupTechnologies`.
- `src/content/technologies/*.json` — 26 seed entries, exactly four fields each
  (7 Frontend / 8 Backend y Nube / 4 IA y Sistemas / 7 Flujo de Trabajo y
  Diseño).
- `public/icons/logos/*.svg` — 26 svgl logos vendored locally (57,873 B total;
  no runtime fetch, no CDN).
- `src/components/TechnologiesSection.astro` — section shell, header, glass
  category cards, chips, quote bar; zero client JavaScript.
- `tests/technologies-schema.test.ts`, `tests/technologies-content.test.ts`,
  `tests/technologies-section.test.ts` — R1–R44 coverage.
- `progress/impl_technologies-section.md`, `progress/review_technologies-section.md`
  — evidence.
- `progress/commit_technologies-section.md` — this report (same commit).

## Commit message used

```
feat(technologies-section): render tech stack from a JSON collection

Add the third increment from the Stitch "Full Chromatic Glass" design:
the tech stack section on the home page (anchor #tech-stack), fed by a
Zod-validated JSON content collection so technologies are content, not
hand-coded markup.

Each of the 26 seed entries declares exactly id (UUID), category,
iconUrl and name; the glob loader reads one JSON file per entry and the
schema validates iconUrl as a local /icons/logos/*.svg path. The four
mockup categories render in a fixed order with entries sorted
alphabetically and empty categories omitted, while duplicate ids abort
the build with an explicit error. The 26 svgl logos are vendored under
public/icons/logos/ (no runtime fetch, no CDN, no new dependencies);
technologies without an svgl icon were dropped per the approved spec.

TechnologiesSection reuses the global entrance animation and renders
glass category cards, chips with informative alt text and a closing
quote bar, with zero client JavaScript.

Scope excludes nav, about/contact sections, footer and WebGL shader.

133 tests green across 13 files tracing R1-R44; pnpm validate green
(lint + check + test + build). Browser checks covered the 1280/945/700
px layouts and reduced motion.

Spec and evidence: specs/technologies-section/,
progress/impl_technologies-section.md,
progress/review_technologies-section.md.
```

## Warnings / notes

- Leader-approved Option A correction: 8 of the 26 approved seed UUIDs did not
  satisfy Zod 4 `z.uuid()` (invalid RFC 9562 variant nibble); the ids were
  corrected in requirements R10, design §5, the seed JSONs and the test table,
  keeping the validator and the 26-entry list unchanged.
- Technologies without an svgl icon (`Pinecone`, `pgvector`, `WebSockets`,
  `Wasm`) were deleted per the human decision; `Ollama` kept (svgl icon
  exists).
- Reviewer verdict APPROVED (`progress/review_technologies-section.md`), no
  required fixes. Non-blocking: R3 wording says "RFC 4122" while Zod 4 enforces
  RFC 9562 (left as-is); the `.playwright-mcp/` browser-tool output was removed
  before committing.
- No remote operation performed (no push); existing commits untouched.
