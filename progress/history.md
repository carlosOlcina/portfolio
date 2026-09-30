# Historial de sesiones

> Bitácora append-only. Cada sesión cerrada añade su resumen al final.

## 2026-09-27 — Arnés de agentes y tooling base

- Se instalaron y configuraron ESLint, Prettier, Vitest, `astro check` y TypeScript (5.x por compatibilidad de peers).
- `package.json` expone `pnpm lint`, `pnpm check`, `pnpm test`, `pnpm build`, `pnpm format` y `pnpm validate`.
- Smoke test del index con Astro Container API en `tests/index.test.ts`.
- Arquitectura de agentes en `.opencode/agents/` adaptada desde lifup, sin Nx: leader, spec_author, implementer, reviewer, commiter, secure-auditer y skill-generator.
- Arnés SDD creado: `AGENTS.md`, `opencode.json`, `feature_list.json`, `docs/`, `progress/`, `specs/` y `CHECKPOINTS.md`.
- `pnpm validate` verde: lint + check + test + build.

## 2026-09-28 — hero-section

- Stitch design "Full Chromatic Glass" captured in `specs/hero-section/references/`
  (`chromatic-glass.html`, `chromatic-glass.png`, `shader.html`, `design-notes.md`).
- Spec approved by the human: R1–R40 (global design tokens, Fontsource fonts, base page
  styles, hero section, CSS atmospheric blooms, clipboard enhancement + toast,
  accessibility).
- Implemented `src/styles/{tokens,global}.css`, `src/layouts/BaseLayout.astro`,
  `src/components/HeroSection.astro`, `src/scripts/clipboard.ts` and rewrote
  `src/pages/index.astro`; the two Fontsource variable packages are the only new
  dependencies.
- 42 tests green across 7 files (`tests/{tokens,fonts,global-styles,hero,index,clipboard,toast}.test.ts`),
  tracing R1–R40.
- Reviewer verdict: APPROVED (`progress/review_hero-section.md`); the two recommended
  post-review fixes were applied (Prettier cleanliness, refreshed stale reference line
  citations).
- Human manual check (task 9.5) done: the clipboard copies `carlosolcina23@gmail.com`,
  the toast shows `Correo copiado al portapapeles` and auto-hides after ~2.6 s.
- Evidence kept: `progress/impl_hero-section.md` and `progress/review_hero-section.md`.
- Final `pnpm validate` green: lint + check + test + build.

## 2026-09-28 — projects-section

- Segundo incremento del diseño "Full Chromatic Glass": la sección de proyectos
  en la home (`section.projects#projects`), inmediatamente después del hero.
- Colección de contenido `projects` en `src/content.config.ts` (loader `glob`
  sobre `src/content/projects/**/*.md`) + factoría de esquema inyectable
  `buildProjectsSchema({ image })` y helpers puros `sortProjects` /
  `assertUniqueProjects` en `src/content/projects-schema.ts` (prioridad
  ascendente; `priority`/`id` duplicados abortan el build con error explícito).
- Cuatro entradas semilla (Synapse destacada, Aether Cloud, Kortex Editor,
  Vanguard CLI) con frontmatter validado (UUID, `image()` para `coverPath`,
  `githubUrl` opcional, `featured` con default `false`) y cuerpos Markdown.
- Cuatro portadas WebP raster de placeholder (1280×800, generadas con
  ImageMagick según `design.md` §10) en `src/content/projects/covers/`,
  optimizadas por el pipeline de imágenes de Astro.
- Componentes `ProjectsSection.astro` (cabecera, tarjeta destacada y grid
  responsive) y `ProjectCard.astro` (portada `<Image>`, título, enlaces con SVG
  inline, descripción y pills), cableados en `src/pages/index.astro` con
  `getCollection('projects')`.
- `sharp` es la única dependencia nueva (servicio de imágenes de Astro).
- Spike de la capa de contenido bajo Vitest (tarea 7.1): `getCollection` sin
  mock devuelve `[]` incluso tras `astro sync` → **branch B**: tests de
  contenido por filesystem y renders de página con `vi.mock('astro:content')`;
  el test temporal del spike se eliminó.
- 87 tests verdes en 10 archivos (`tests/projects-schema.test.ts`,
  `tests/projects-content.test.ts`, `tests/projects-section.test.ts` + los
  existentes), trazando R1–R45; R32 verificado con `ImageMetadata` real a
  través de la Container API.
- Reviewer verdict: APPROVED (`progress/review_projects-section.md`), sin
  cambios obligatorios; la única observación aplicada fue dar formato Prettier
  a `progress/impl_projects-section.md`.
- Pendiente humano: verificación visual (tarea 12.5) con `pnpm preview`
  comparando contra `specs/projects-section/references/projects-section.png`,
  el hover de las tarjetas y el comportamiento con `prefers-reduced-motion`.
- Evidencia: `progress/impl_projects-section.md` y `progress/review_projects-section.md`.
- `pnpm validate` verde: lint + check + test + build.

## 2026-09-29 — fix-featured-project-card-layout

- Bugfix on the done `projects-section` feature: the featured project card
  (`Synapse`) broke at viewports ≥1024px — the cover rendered alone top-right
  and the meta was pushed to a second row on the left, leaving a large empty
  gap (card 663px tall at 1440×900 pre-fix).
- Diagnosed root cause: in `src/components/ProjectCard.astro`, the
  `@media (min-width: 1024px)` grid assigned definite columns to
  `.project-card--featured .project-card__meta` (1 / span 6) and
  `.project-card--featured .project-card__cover` (7 / span 6) without pinning
  rows; with the DOM order (cover first, meta second) auto-placement put the
  cover in row 1 (columns 7–12) and the meta in row 2 (columns 1–6).
- Final fix: two `grid-row: 1;` declarations inside that same existing 1024px
  media query, one per half. No markup change, no other declaration, no new
  dependency, no client-side JavaScript.
- Regression tests in `tests/projects-section.test.ts`: new helpers
  `extractMediaBlock` (brace matching) and `renderFeaturedCard`, plus
  `pins_featured_card_halves_to_one_row` (R1) and
  `stacks_featured_card_below_1024` (R3); pre-existing test bodies untouched
  (test diff is additions only).
- Spec approved and implemented at `specs/fix-featured-project-card-layout/`
  (requirements R1–R5, design, tasks all `[x]`).
- Playwright MCP incident: the MCP's bundled `playwright-core` expected
  browser revision `chromium-1247` (only older revisions were cached) and its
  default `chrome` channel needed a system Chrome that is not installed. Fix
  applied outside the repo: installed `chromium-1247` + headless shell with the
  MCP's own Playwright CLI and added `--browser chromium` to the MCP command in
  the global opencode config; the fixed command was smoke-tested over JSON-RPC
  (initialize, navigate, close) OK. opencode does not hot-reload MCP configs,
  so a **full opencode restart is still pending** before future sessions can
  use the fixed MCP.
- Browser evidence gathered with the engine fallback
  (`/tmp/opencode/verify-fix.cjs`, cached `playwright-core`,
  `chromium.launch({ channel: 'chrome-for-testing' })`) because the MCP was not
  loaded: at 1440×900 and 1024×800 meta left / cover right in one row, vertical
  centers within 0px, no horizontal overflow, card height 365px (vs 663px
  pre-fix) and 331.88px (vs 623px); at 768×1024 and 375×812 stacked
  cover-first, no overflow. Screenshots:
  `/tmp/opencode/shots/fix-{desktop-1440,laptop-1024,tablet-768,mobile-375}-projects.png`.
- Reviewer verdict: APPROVED (`progress/review_fix-featured-project-card-layout.md`),
  no required changes; the single non-blocking observation (Prettier formatting
  of this session's progress markdown files) was resolved with
  `prettier --write`. Repo-wide `pnpm format:check` remains red only on two
  pre-existing drifted files outside this feature (verified unformatted at
  HEAD); `pnpm validate` does not include format:check.
- Evidence files: `progress/impl_fix-featured-project-card-layout.md` and
  `progress/review_fix-featured-project-card-layout.md`.
- `pnpm validate` green: lint + check + test (10 files, 89/89 tests) + build.
- **Human action required:** restart opencode so the fixed Playwright MCP
  (`--browser chromium`) loads in future sessions.

## 2026-09-30 — technologies-section (id 5)

- Third UI increment of the "Full Chromatic Glass" design: the tech-stack
  glass bento section on the home page (`<section id="tech-stack">`), rendered
  immediately after `#projects`; spec at `specs/technologies-section/`.
- Data: JSON content collection `technologies` (glob loader over
  `src/content/technologies/*.json`, strict Zod schema
  `id`/`category`/`iconUrl`/`name`, plus `TECHNOLOGY_CATEGORIES`,
  `groupTechnologies` and `assertUniqueTechnologies` helpers in
  `src/content/technologies-schema.ts`); 26 seed entries across Frontend (7),
  Backend y Nube (8), IA y Sistemas (4) and Flujo de Trabajo y Diseño (7).
- Icons: 26 svgl SVGs vendored in `public/icons/logos/` (local files only, no
  CDN and no runtime fetch; 57,873 B total, largest `ollama.svg` at 8,572 B)
  referenced by root-relative `iconUrl` paths.
- UI: `TechnologiesSection.astro` renders the header, the four-category glass
  grid, 40px chips (`title` + informative `alt`), category titles as `<h3>`
  and the closing quote bar with the `Filosofía Técnica` mono badge; one new
  `--font-mono` token; zero client JS (the only bundled script remains the
  hero clipboard enhancement).
- Spec contradiction resolved with leader approval (**Option A, mechanical
  correction**): 8 of the 26 seed ids did not satisfy Zod 4 `z.uuid()` (invalid
  RFC 9562 variant nibble); the 8 ids were corrected in the requirements R10
  table, design §5, the seed JSONs and the test table, keeping `z.uuid()` and
  the approved 26-entry list unchanged.
- Tests: 133/133 green across 13 files, tracing R1–R44 (new
  `tests/technologies-schema.test.ts`, `tests/technologies-content.test.ts`
  and `tests/technologies-section.test.ts`); `pnpm validate` green: lint +
  check (0 errors) + tests + build, with the 26 icons and the 26-entry section
  verified in `dist/`.
- Browser check (task 9.5): section after projects, 4/2/1 grid columns,
  chip and card hovers, quote bar and reduced-motion collapse verified live;
  build negative spot-checks (unknown JSON key, duplicate id) fail the build
  as intended.
- Reviewer verdict: APPROVED (`progress/review_technologies-section.md`), no
  required fixes; the single non-blocking Prettier observation on the reports
  was applied at session close.
- Evidence: `progress/impl_technologies-section.md` and
  `progress/review_technologies-section.md`.
- Non-blocking notes acked: `.playwright-mcp/` output directory cleanup/ignore
  handled by the leader; the R3 "RFC 4122" wording nit left as-is (the
  corrected contract follows RFC 9562 via Zod 4).
- `pnpm validate` green: lint + check + test (13 files, 133/133) + build.

## 2026-09-30 — ci-github-action

- Feature id 6 (`sdd: true`, renumbered from id 5 during the PR #7 sync merge): repository-level GitHub Actions gate. Created
  `.github/workflows/ci.yml` named `CI`, running on pushes to all branches and on
  pull requests targeting `main`.
- Workflow: single `ci` job on `ubuntu-latest` with `permissions: contents: read`;
  step order `actions/checkout@v6` → `pnpm/action-setup@v6` (pnpm `12.6.0`) →
  `actions/setup-node@v7` (Node `22.12.0`, `cache: pnpm`) →
  `pnpm install --frozen-lockfile` → `pnpm check` → `pnpm lint` →
  `pnpm format:check` → `pnpm test`. No build/deploy/release/publish step and no
  `continue-on-error`.
- Offline contract: `tests/ci-workflow.test.ts` with 23 tests, one per `R1`–`R23`
  of the approved spec in `specs/ci-github-action/`; suite total 112/112 tests
  across 11 files.
- Format-only normalization (tasks 4.1–4.2) with `prettier --write` of the two
  pre-existing drifted files (`.opencode/skills/astro-modern-practices/SKILL.md`,
  `progress/review_projects-section.md`) plus `feature_list.json` and the two spec
  files flagged as additional offenders per `design.md` §3; `pnpm format:check`
  green repo-wide. No application code, dependency, `package.json` or
  `pnpm-lock.yaml` change.
- Reviewer verdict: APPROVED (`progress/review_ci-github-action.md`), no required
  changes.
- `pnpm validate` (lint + check + test + build) and `pnpm format:check` green.
- Evidence kept: `progress/impl_ci-github-action.md` and
  `progress/review_ci-github-action.md`.
- **Human verification pending:** the first real GitHub Actions run — a push to any
  branch and a pull request targeting `main` — after merge; Actions cannot run
  offline in this environment.

## 2026-09-30 — fix-hero-headline-whitespace

- Bugfix on the done `hero-section` (id 2) exposed by PR #7: after main upgraded to
  Astro 7 (`astro ^7.2.8`, lockfile installing 7.3.5) the compiler's new
  `compressHTML: 'jsx'` default trims incidental template whitespace, so
  `src/components/HeroSection.astro` rendered
  `…intersección de<span class="hero__headline-accent">` and
  `tests/hero.test.ts > renders_verbatim_hero_texts` failed (visual regression
  "deingeniería"). The same failure class also existed on main in
  `src/components/TechnologiesSection.astro`
  (`tests/technologies-section.test.ts > renders_section_header`).
- Fix: emit the space explicitly with the documented Astro 7 remedy (`{' '}`)
  between the headline text and the accent span in `HeroSection.astro`, and — under
  the human-approved scope extension, same root cause and same PR — in
  `TechnologiesSection.astro`; `astro.config.mjs` / `compressHTML` untouched.
- Contract hardening, additions only: new `emits_explicit_headline_space` in
  `tests/hero.test.ts` pins the raw rendered junction to U+0020 and asserts the
  explicit construct in the component source; `renders_verbatim_hero_texts` and
  every other pre-existing body stay byte-identical. R6 traces the technologies
  extension to the unchanged `renders_section_header`.
- Branch sync: merged the human's `47fc422` web-merge commit (which already
  contained `origin/main`) and resolved `feature_list.json` / `progress/history.md`
  with the final numbering (technologies-section 5, ci-github-action 6, this fix 7);
  `pnpm install --frozen-lockfile` reinstalled Astro 7.3.5; no rebase and no
  force-push.
- Reviewer verdict: APPROVED (`progress/review_fix-hero-headline-whitespace.md`), no
  required changes.
- `pnpm validate` (lint + check + test + build) and `pnpm format:check` green under
  Astro 7.3.5; full suite 14 files / 157 tests, including hero 10/10 and
  technologies 27/27.
- Evidence kept: `progress/impl_fix-hero-headline-whitespace.md` and
  `progress/review_fix-hero-headline-whitespace.md`.
- **Human verification pending:** after the committer pushes, the PR #7 push and
  `pull_request` runs must be green and the PR mergeable — Actions cannot run
  offline in this environment.
