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
