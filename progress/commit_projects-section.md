# Commit — feature projects-section (id 3)

- **Scope:** single atomic commit for the complete `projects-section` increment:
  content collection + schema + seeds + covers, UI components, tests, SDD spec +
  references, evidence and session bookkeeping.
- **Committer:** commits agent, 2026-09-28.
- **Pre-commit check:** `pnpm validate` green — lint + `astro check` (23 files,
  0 errors) + `pnpm test` (10 files, 87/87 tests) + build with 4 optimized WebP
  images.
- **Result:** 1 commit on `main`; no push, no amend.

## Files committed

Modified:

- `feature_list.json` — feature `projects-section` added and marked `done`.
- `package.json` — `sharp` added to dependencies (Astro image service).
- `pnpm-lock.yaml` — lockfile entries for sharp and its platform packages.
- `progress/history.md` — 2026-09-28 projects-section session summary.
- `src/pages/index.astro` — loads `getCollection('projects')` and renders
  `<ProjectsSection />` after the hero.
- `src/styles/tokens.css` — adds `--color-slate-600`.
- `tests/index.test.ts` — projects wiring plus extended script/island scan.
- `tests/node-shims.d.ts` — latin1 `readFileSync` overload for cover tests.

New (untracked before this commit):

- `specs/projects-section/{requirements,design,tasks}.md` — approved SDD spec
  (R1–R45).
- `specs/projects-section/references/projects-section.html` and `.png` — Stitch
  design evidence.
- `src/content.config.ts`, `src/content/projects-schema.ts` — collection config
  and injectable schema factory plus pure sort/uniqueness helpers.
- `src/content/projects/{synapse,aether-cloud,kortex-editor,vanguard-cli}.md` —
  seed entries.
- `src/content/projects/covers/*.webp` — raster placeholder covers (1280×800).
- `src/components/ProjectsSection.astro`, `src/components/ProjectCard.astro` —
  section UI.
- `tests/projects-schema.test.ts`, `tests/projects-content.test.ts`,
  `tests/projects-section.test.ts` — R1–R45 coverage.
- `progress/research_projects_section.md`, `progress/impl_projects-section.md`,
  `progress/review_projects-section.md` — research and evidence.
- `progress/commit_projects-section.md` — this report (same commit).

## Commit message used

```
feat(projects-section): render projects from a Zod-validated collection

Add the second increment from the Stitch "Full Chromatic Glass" design:
the projects section on the home page (anchor #projects), fed by a
Zod-validated Markdown content collection so the human manages project
data as content instead of hand-coded markup.

The `projects` collection resolves coverPath through Astro's image()
helper and validates id (UUID), title, description, technologies,
coverAlt, websiteUrl, an optional githubUrl, a unique priority and
featured. Four seed entries from the mockup (Synapse as the featured
flagship, Aether Cloud, Kortex Editor, Vanguard CLI) ship with raster
WebP placeholder covers generated with ImageMagick and optimized by
Astro's image pipeline; sharp is the only new dependency.

The UI splits into ProjectsSection and ProjectCard: featured wide card
plus a responsive 1/2/3-column grid ordered by priority, cover <Image>
with lazy loading, technology pills and accessible external links
(GitHub omitted when absent). sortProjects/assertUniqueProjects abort
the build with explicit errors on duplicate priority or id.

Scope excludes nav, tech-stack/about/contact sections, footer, WebGL
shader, project detail pages and Markdown body rendering.

87 tests green across 10 files tracing R1-R45; pnpm validate green
(lint + check + test + build). Under Vitest the content layer is not
usable (getCollection returns []), so the tests read the seeds from
disk and mock astro:content when rendering the page.

Spec and evidence: specs/projects-section/, progress/impl_projects-section.md,
progress/review_projects-section.md.
```

## Warnings / notes

- Vitest content-layer spike: `getCollection()` returns `[]` under Vitest even
  after `astro sync`, so tests use the filesystem plus
  `vi.mock('astro:content')` (branch B); recorded in the spec and evidence.
- `sharp` is the only new dependency; no other package was added.
- Pending human visual verification (task 12.5): `pnpm preview` compared against
  `specs/projects-section/references/projects-section.png`, card hover and
  reduced-motion behaviour.
- No remote operation performed (no push); existing commits untouched.
