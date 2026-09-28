# Design — projects-section

## 1. Context

Second UI increment of the portfolio: the projects section of the Stitch design **Full Chromatic Glass**, rendered from a Zod-validated Markdown content collection. The authoritative markup is `specs/projects-section/references/projects-section.html` (projects section: lines 298–504; `glass-card-hover` and animation utilities: lines 5–33); `progress/research_projects_section.md` digests it.

**Revision (human decision, 2026-09-28): covers are real raster pixel images.** The mockup is a static Tailwind-CDN page that fakes its previews with hand-built HTML terminal panels; the human rejected carrying that craft into the app: the real section ships normal pixel covers optimized by Astro. This supersedes the first draft of this spec (SVG placeholders in `public/` + plain `<img>`): covers now live next to the content, `coverPath` is validated with the schema-context `image()` helper, cards render `<Image>` from `astro:assets`, and `sharp` is added as the image service.

Hard constraints from the harness: Astro 6 + strict TypeScript, zero client JS, plain CSS with the existing custom properties (no Tailwind), no icon font, and every requirement traceable to a Vitest test. The critical new constraint is testability: the schema module must stay importable by Vitest without `astro:content` (hence a dependency-injected schema factory), and the presentational units must render with fixture data through the Container API.

## 2. Decisions summary

1. The `projects` collection lives in `src/content.config.ts` with the `glob` loader (`base: './src/content/projects'`, `pattern: '**/*.md'`) and `schema: ({ image }) => buildProjectsSchema({ image })`.
2. `src/content/projects-schema.ts` exports the **schema factory** `buildProjectsSchema({ image })` (structural `image: () => z.ZodType` dependency), so it imports only `astro/zod` plus a type-only `ImageMetadata` import from `astro` — never `astro:content`, `astro:loaders` or `astro:assets`. Vitest instantiates it with `image: () => z.string()`.
3. Cover files live co-located with the entries in `src/content/projects/covers/<slug>.webp` and the frontmatter value stays a plain relative path (`./covers/synapse.webp`). The `image()` helper resolves and validates each path at build time and turns `entry.data.coverPath` into `ImageMetadata`, which `<Image>` consumes.
4. `sharp` is the one deliberate new dependency: Astro's official image service (documented prerequisite for build-time optimization and for `image()`/`<Image>` on user-provided pixel covers). It is declared in `dependencies` (not `devDependencies`) so production builds always have it, instead of relying on Astro's optional dependency.
5. Four **raster WebP placeholders** (1280×800, palette gradients) are seeded into `src/content/projects/covers/`. They are generated once with ImageMagick using the reproducible commands of §10 and then managed by the human like any other content asset.
6. The same module exports `ProjectData` and the pure helpers `assertUniqueProjects` / `sortProjects` (ascending `priority`; duplicate `priority`/`id` throw explicit errors). Helpers only depend on `Pick<ProjectData, 'id' | 'priority'>`, so tests can use minimal fixtures.
7. `ProjectsSection.astro` calls `sortProjects(projects)` during render: "lower priority first" is a property of the rendered output, duplicate priorities fail `astro build`, and Vitest proves both with fixtures — no `astro:content` involved.
8. Presentational split: `ProjectsSection.astro` (section shell + header + featured/grid split, receives `projects: ProjectData[]`) and `ProjectCard.astro` (one card, `featured?: boolean` modifier, receives `project: ProjectData`). Only `src/pages/index.astro` touches `getCollection('projects')`.
9. Frontmatter `id` is **data only** (stable UUID for identity and uniqueness validation). Astro still generates the entry `id` from the file name (`synapse`, `aether-cloud`, …); the namespaces are independent and the kebab-case file names are the future slugs for detail pages.
10. Cards re-implement the mockup's `.glass-card-hover` primitive and reuse the global `animate-fade-in-up` / `animation-delay-100` utilities and the existing reduced-motion override. The cover box keeps a fixed 16/10 `aspect-ratio` with `object-fit: cover`, so covers of any intrinsic size crop consistently (the mockup's fixed `h-44`/`h-64`/`h-72` heights are superseded by the human decision).
11. One new palette token (`--color-slate-600: #475569`) is added for the mockup's `text-slate-600` descriptions; everything else consumes existing `--color-*`, `--font-*`, `--text-*`, `--radius-*` tokens.
12. Both card links are icon-only inline SVGs with Spanish `aria-label`s and `rel="noopener noreferrer"`; GitHub is omitted entirely when `githubUrl` is absent.
13. No client JS of any kind is added: zero scripts, zero islands, zero inline handlers.

## 3. Files

| File                                             | Action | Responsibility                                                                                               |
| ------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------ |
| `src/content.config.ts`                          | create | `projects` collection: glob loader + `({ image }) => buildProjectsSchema({ image })` (R1).                   |
| `src/content/projects-schema.ts`                 | create | `buildProjectsSchema` factory, `ProjectData`, `assertUniqueProjects`, `sortProjects` (R2–R7).                |
| `src/content/projects/synapse.md`                | create | Featured seed entry (R9–R12).                                                                                |
| `src/content/projects/aether-cloud.md`           | create | Seed entry without `githubUrl` (R9–R12).                                                                     |
| `src/content/projects/kortex-editor.md`          | create | Seed entry (R9–R12).                                                                                         |
| `src/content/projects/vanguard-cli.md`           | create | Seed entry (R9–R12).                                                                                         |
| `src/content/projects/covers/synapse.webp`       | create | Raster placeholder cover, generated with ImageMagick (R13–R15).                                              |
| `src/content/projects/covers/aether-cloud.webp`  | create | Raster placeholder cover (R13–R15).                                                                          |
| `src/content/projects/covers/kortex-editor.webp` | create | Raster placeholder cover (R13–R15).                                                                          |
| `src/content/projects/covers/vanguard-cli.webp`  | create | Raster placeholder cover (R13–R15).                                                                          |
| `package.json`                                   | modify | Adds `sharp` to `dependencies` via `pnpm add sharp` (R16).                                                   |
| `src/styles/tokens.css`                          | modify | Adds `--color-slate-600: #475569` (R17).                                                                     |
| `src/components/ProjectCard.astro`               | create | Card markup (`<Image>` cover, title, links, description, pills) + scoped styles (R29, R31–R42).              |
| `src/components/ProjectsSection.astro`           | create | Section shell, header, `sortProjects` call, featured/grid split + scoped styles (R8, R18–R28, R30, R43–R44). |
| `src/pages/index.astro`                          | modify | Loads the collection and composes `<ProjectsSection projects={…} />` after the hero (R45).                   |
| `tests/projects-schema.test.ts`                  | create | Collection config, schema factory/stub and helpers (R1–R7).                                                  |
| `tests/projects-section.test.ts`                 | create | Section/card rendering with fixtures + CSS contract (R8, R17–R45).                                           |
| `tests/projects-content.test.ts`                 | create | Seeds, raster covers and `sharp` dependency (R9–R16).                                                        |
| `tests/index.test.ts`                            | modify | Extends the script/island/handler scan to the new components; keeps the single `<h1>` assertion (R43–R44).   |
| `tests/node-shims.d.ts`                          | modify | Adds the `'latin1'` encoding overload of `readFileSync` used for WebP magic-byte assertions (R14–R15).       |

Unchanged: `astro.config.mjs` (no integrations), `vitest.config.ts`, `tsconfig.json` (image asset module declarations come from the `astro/client` types already reached through `astro/tsconfigs/strict`), `src/components/HeroSection.astro`, `src/layouts/BaseLayout.astro`, `src/scripts/clipboard.ts`. `sharp` is the only new dependency.

## 4. Data model and seed content

### Frontmatter contract

| Field          | Validator                           | Notes                                                                      |
| -------------- | ----------------------------------- | -------------------------------------------------------------------------- |
| `id`           | `z.uuid()`                          | Unique per entry; data only, never the Astro routing id (see §2.9).        |
| `title`        | `z.string()`                        | Card `<h3>`.                                                               |
| `description`  | `z.string()`                        | Short card paragraph.                                                      |
| `technologies` | `z.array(z.string()).min(1)`        | Pills, rendered in order.                                                  |
| `coverPath`    | schema-context `image()` (injected) | Entry-relative path (`./covers/synapse.webp`) resolved to `ImageMetadata`. |
| `coverAlt`     | `z.string()`                        | Required (public global site).                                             |
| `websiteUrl`   | `z.url()`                           | Always rendered.                                                           |
| `githubUrl`    | `z.url().optional()`                | Rendered only when present.                                                |
| `priority`     | `z.number()`                        | Unique across entries; **lower renders first**.                            |
| `featured`     | `z.boolean().default(false)`        | `true` renders the wide flagship card (Synapse in the seeds).              |

`image()` resolves paths relative to the entry file, so `./covers/synapse.webp` points at `src/content/projects/covers/synapse.webp`. The glob loader pattern `**/*.md` ignores the `covers/` directory; only the four Markdown files become entries. A missing or unreadable cover fails content validation at build time (the explicit failure required by `docs/conventions.md`).

### Seed files (exact content)

`src/content/projects/synapse.md`:

```markdown
---
id: 6f9c1c1e-4a7b-4a3e-9d2f-1f5c8a2b7e10
title: Synapse
description: Copiloto IA para desarrolladores con análisis semántico de Git y AST en tiempo real.
technologies:
  - Next.js
  - TypeScript
  - Tailwind
  - Claude API
  - Tree-sitter AST
coverPath: ./covers/synapse.webp
coverAlt: 'Portada de Synapse: degradado índigo.'
websiteUrl: https://example.com
githubUrl: https://github.com
priority: 1
featured: true
---

Copiloto que combina análisis semántico de Git y AST para revisar cambios en tiempo real.
```

`src/content/projects/aether-cloud.md` (no `githubUrl`, no `featured`; the description is single-quoted because it contains `<`):

```markdown
---
id: 2b8f0d4a-9c31-4f6e-8a75-3d9e0b6c1a24
title: Aether Cloud
description: 'Sincronización de estado en tiempo real en el edge con latencia global < 10ms.'
technologies:
  - Go
  - Rust
  - WebSockets
  - Redis
coverPath: ./covers/aether-cloud.webp
coverAlt: 'Portada de Aether Cloud: degradado azul.'
websiteUrl: https://example.com
priority: 2
---

Runtime distribuido que sincroniza estado en el edge con latencia global mínima.
```

`src/content/projects/kortex-editor.md`:

```markdown
---
id: c4a3e5b2-7d19-4b8c-a1f6-5e2d9087c431
title: Kortex Editor
description: Editor colaborativo local-first impulsado por CRDTs y WebAssembly.
technologies:
  - React
  - Wasm
  - CRDTs
  - Canvas
coverPath: ./covers/kortex-editor.webp
coverAlt: 'Portada de Kortex Editor: degradado violeta.'
websiteUrl: https://example.com
githubUrl: https://github.com
priority: 3
---

Editor local-first que resuelve la colaboración con CRDTs y WebAssembly.
```

`src/content/projects/vanguard-cli.md`:

```markdown
---
id: 9d7b2e64-3c85-4a1f-b6e9-7f0c4a8d5b2e
title: Vanguard CLI
description: Herramienta CLI para auditorías de código y análisis de PRs con embeddings locales.
technologies:
  - Node.js
  - Rust CLI
  - Embeddings
  - Actions
coverPath: ./covers/vanguard-cli.webp
coverAlt: 'Portada de Vanguard CLI: degradado índigo claro.'
websiteUrl: https://example.com
githubUrl: https://github.com
priority: 4
---

CLI de auditoría que analiza pull requests con embeddings ejecutados en local.
```

The bodies are seeds: they exist so the entries are valid Markdown documents, but this increment does not render them (out of scope).

## 5. Schema factory and collection config

`src/content/projects-schema.ts` (imports only `astro/zod` at runtime plus the type-only `ImageMetadata`; no import-time side effects):

```ts
import { z } from 'astro/zod';
import type { ImageMetadata } from 'astro';

export interface ProjectsSchemaDependencies<TCover extends z.ZodType> {
  image: () => TCover;
}

export function buildProjectsSchema<
  TCover extends z.ZodType = z.ZodType<ImageMetadata>,
>({ image }: ProjectsSchemaDependencies<TCover>) {
  return z.object({
    id: z.uuid(),
    title: z.string(),
    description: z.string(),
    technologies: z.array(z.string()).min(1),
    coverPath: image(),
    coverAlt: z.string(),
    websiteUrl: z.url(),
    githubUrl: z.url().optional(),
    priority: z.number(),
    featured: z.boolean().default(false),
  });
}

export type ProjectData = z.infer<
  ReturnType<typeof buildProjectsSchema<z.ZodType<ImageMetadata>>>
>;

export type SortableProject = Pick<ProjectData, 'id' | 'priority'>;

export function assertUniqueProjects(
  projects: readonly SortableProject[],
): void {
  const priorities = new Set<number>();
  const ids = new Set<string>();

  for (const project of projects) {
    if (priorities.has(project.priority)) {
      throw new Error(`Duplicate project priority: ${project.priority}`);
    }
    if (ids.has(project.id)) {
      throw new Error(`Duplicate project id: ${project.id}`);
    }
    priorities.add(project.priority);
    ids.add(project.id);
  }
}

export function sortProjects<T extends SortableProject>(
  projects: readonly T[],
): T[] {
  assertUniqueProjects(projects);
  return [...projects].sort((a, b) => a.priority - b.priority);
}
```

- The factory is generic over the cover validator so Vitest can call `buildProjectsSchema({ image: () => z.string() })` and assert accept/reject behaviour without casts, while `ProjectData` is instantiated with `z.ZodType<ImageMetadata>` — the production shape whose `coverPath` is accepted by `<Image src>`.
- Error messages are part of the contract (R6/R7) and are asserted verbatim. `sortProjects` copies before sorting, so the props array is never mutated.
- If a future Astro version types the schema-context `image` function incompatibly with `() => TCover`, widen the dependency signature to `image: (options?: unknown) => TCover`; the stub and `ProjectData` stay unchanged.

`src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { buildProjectsSchema } from './content/projects-schema';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) => buildProjectsSchema({ image }),
});

export const collections = { projects };
```

This is the only file that imports the virtual modules; it is never imported by Vitest. The collection makes Astro's image pipeline validate every `coverPath` at build time and emit optimized assets for `<Image>`.

## 6. `src/components/ProjectsSection.astro`

```astro
---
import { sortProjects, type ProjectData } from '../content/projects-schema';
import ProjectCard from './ProjectCard.astro';

interface Props {
  projects: ProjectData[];
}

const { projects } = Astro.props;
const orderedProjects = sortProjects(projects);
const featuredProjects = orderedProjects.filter((project) => project.featured);
const remainingProjects = orderedProjects.filter(
  (project) => !project.featured,
);
---

<section class="projects animate-fade-in-up animation-delay-100" id="projects">
  <div class="projects__inner">
    <div class="projects__header">
      <div class="projects__heading">
        <div class="projects__eyebrow">
          <span class="projects__label">Proyectos Seleccionados</span>
          <span class="projects__label-rule"></span>
        </div>
        <h2 class="projects__title">
          Proyectos con <span class="projects__title-accent">visión</span>
        </h2>
      </div>
      <p class="projects__subtitle">
        Software escalable, arquitecturas cloud y soluciones de IA en
        producción.
      </p>
    </div>
    <div class="projects__cards">
      {featuredProjects.map((project) => (
        <ProjectCard project={project} featured />
      ))}
      <div class="projects__grid">
        {remainingProjects.map((project) => (
          <ProjectCard project={project} />
        ))}
      </div>
    </div>
  </div>
</section>
```

Class contract (tests assert these hooks): `.projects`, `.projects__inner`, `.projects__header`, `.projects__heading`, `.projects__eyebrow`, `.projects__label`, `.projects__label-rule`, `.projects__title`, `.projects__title-accent`, `.projects__subtitle`, `.projects__cards`, `.projects__grid`.

Scoped styles (values in R19, R22–R26, R30; Tailwind translations in §8):

- `.projects`: `padding-block: 6rem` (`py-24`), `border-bottom: 1px solid rgba(199, 210, 254, 0.35)` (`border-indigo-200/35`), `scroll-margin-top: 6rem` (`scroll-mt-24`, the fixed-nav offset; the nav lands in a later increment, same rationale as the hero's `main` padding).
- `.projects__inner`: `display: flex; flex-direction: column; gap: 3.5rem` (`gap-14`).
- `.projects__header`: column with `justify-content: space-between; gap: 1.5rem`; at ≥768px `flex-direction: row; align-items: flex-end`.
- `.projects__heading`: column, `gap: 0.75rem`.
- `.projects__eyebrow`: row, `align-items: center`, `gap: 0.75rem`.
- `.projects__label`, `.projects__label-rule`, `.projects__title`, `.projects__title-accent`, `.projects__subtitle`: R22–R25.
- `.projects__cards`: column, `gap: 2rem` (`gap-8`).
- `.projects__grid`: R30.

No new `@keyframes`: the section consumes the global `animate-fade-in-up` / `animation-delay-100` utilities (R20), whose reduced-motion behaviour is already global.

## 7. `src/components/ProjectCard.astro`

```astro
---
import { Image } from 'astro:assets';
import type { ProjectData } from '../content/projects-schema';

interface Props {
  project: ProjectData;
  featured?: boolean;
}

const { project, featured = false } = Astro.props;
---

<article class:list={['project-card', featured && 'project-card--featured']}>
  <div class="project-card__cover">
    <Image
      class="project-card__image"
      src={project.coverPath}
      alt={project.coverAlt}
      width={640}
      height={400}
      loading="lazy"
    />
  </div>
  <div class="project-card__meta">
    <div class="project-card__heading">
      <h3 class="project-card__title">{project.title}</h3>
      <div class="project-card__links">
        <a
          class="project-card__link"
          href={project.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visitar el sitio web de ${project.title}`}
        >
          <!-- arrow_outward svg -->
        </a>
        {project.githubUrl && (
          <a
            class="project-card__link"
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ver el código fuente de ${project.title} en GitHub`}
          >
            <!-- code svg -->
          </a>
        )}
      </div>
    </div>
    <p class="project-card__description">{project.description}</p>
    <ul class="project-card__technologies">
      {project.technologies.map((technology) => (
        <li class="project-card__technology">{technology}</li>
      ))}
    </ul>
  </div>
</article>
```

Icons (R42, exact path data taken from the Material Symbols Outlined 24px assets):

```html
<svg
  class="project-card__icon"
  viewBox="0 -960 960 960"
  width="18"
  height="18"
  fill="currentColor"
  aria-hidden="true"
>
  <path d="m256-240-56-56 384-384H240v-80h480v480h-80v-344L256-240Z" />
</svg>

<svg
  class="project-card__icon"
  viewBox="0 -960 960 960"
  width="18"
  height="18"
  fill="currentColor"
  aria-hidden="true"
>
  <path
    d="M320-240 80-480l240-240 57 57-184 184 183 183-56 56Zm320 0-57-57 184-184-183-183 56-56 240 240-240 240Z"
  />
</svg>
```

Class contract: `.project-card`, `.project-card--featured`, `.project-card__cover`, `.project-card__image`, `.project-card__meta`, `.project-card__heading`, `.project-card__title`, `.project-card__links`, `.project-card__link`, `.project-card__icon`, `.project-card__description`, `.project-card__technologies`, `.project-card__technology`.

Layout notes:

- Standard card: column flow `cover → meta`; `justify-content: space-between` + `gap: 1.25rem` reproduce the mockup's `flex-col justify-between` + inner `gap-5`.
- Featured card: at ≥1024px a 12-column grid with explicit placement (`meta` in columns 1–6, `cover` in columns 7–12, i.e. meta left / cover right as in the mockup); below 1024px it stacks in DOM order (`cover` first). The mockup places the featured meta before the preview on mobile; a single DOM order for both variants was preferred over duplicating markup, and the deviation only affects the stacked mobile order of the wide card.
- The cover box keeps a fixed 16/10 aspect ratio (R33) instead of the mockup's fixed heights, per the human decision, so user covers of any intrinsic size crop consistently.

### Scoping with `<Image>`

`<Image>` renders the final `<img>` itself, so the scoped selector that sizes it must be global: `class="project-card__image"` is forwarded by `<Image>` to the `<img>`, but the element does not carry `ProjectCard`'s `data-astro-cid-*` attribute. The style block therefore uses:

```css
:global(.project-card__image) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

`.project-card__cover` (a plain element of the card template) keeps normal scoping. Without `:global(...)` the sizing rules would silently not match; the CSS test asserts the `:global` selector accordingly.

## 8. Tailwind → CSS translation table

| Mockup utility                                          | Computed value / rule                                                               |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `py-24`, `scroll-mt-24`                                 | `6rem`                                                                              |
| `gap-14`, `gap-8`, `gap-6`, `gap-5`, `gap-3`            | `3.5rem`, `2rem`, `1.5rem`, `1.25rem`, `0.75rem`                                    |
| `gap-2.5`, `gap-2`, `gap-1.5`                           | `0.625rem`, `0.5rem`, `0.375rem`                                                    |
| `p-8`, `p-7`, `p-6`                                     | `2rem`, `1.75rem`, `1.5rem`                                                         |
| `px-3 py-1`, `px-2.5 py-0.5`                            | `0.25rem 0.75rem`, `0.125rem 0.625rem`                                              |
| `pt-5`, `pt-4 mt-4`, `mb-3.5`                           | `1.25rem`, `1rem` + `1rem`, `0.875rem`                                              |
| `max-w-md`, `w-12`, `h-px`                              | `28rem`, `3rem`, `1px`                                                              |
| `tracking-[0.18em]`, `tracking-tight`                   | `0.18em`, `-0.025em`                                                                |
| `leading-relaxed`                                       | `1.625`                                                                             |
| `backdrop-blur-xl`, `backdrop-blur-lg`                  | `blur(24px)`, `blur(16px)`                                                          |
| `rounded-2xl`, `rounded-xl`                             | `var(--radius-2xl)`, `var(--radius-xl)`                                             |
| `bg-white/45`, `bg-white/40`, `bg-white/60`             | `rgba(255, 255, 255, 0.45)`, `rgba(255, 255, 255, 0.4)`, `rgba(255, 255, 255, 0.6)` |
| `border-white/70`, `border-white/60`, `border-white/80` | `rgba(255, 255, 255, 0.7)`, `rgba(255, 255, 255, 0.6)`, `rgba(255, 255, 255, 0.8)`  |
| `shadow-xl`                                             | `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)`           |
| `shadow-md`                                             | `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)`              |
| `border-slate-200/50`                                   | `rgba(226, 232, 240, 0.5)`                                                          |
| `text-slate-600`                                        | `var(--color-slate-600)` (new token, R17)                                           |
| `bg-primary/40`                                         | `rgba(53, 37, 205, 0.4)`                                                            |
| `md` / `lg` breakpoints                                 | `768px` / `1024px`                                                                  |

Cover box: the mockup's `h-44` / `h-64` / `md:h-72` heights are deliberately replaced by `aspect-ratio: 16 / 10` with `object-fit: cover` (R33), per the human decision. Hover is taken from the mockup's own `glass-card-hover` rule (R31), not from the redundant Tailwind hover utilities.

## 9. `src/pages/index.astro`

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import HeroSection from '../components/HeroSection.astro';
import ProjectsSection from '../components/ProjectsSection.astro';

const PAGE_TITLE = '…';
const PAGE_DESCRIPTION = '…';

const projectEntries = await getCollection('projects');
const projects = projectEntries.map((entry) => entry.data);
---

<BaseLayout title={PAGE_TITLE} description={PAGE_DESCRIPTION}>
  <HeroSection />
  <ProjectsSection projects={projects} />
</BaseLayout>
```

`getCollection` is called once per build; `entry.data.coverPath` arrives as `ImageMetadata` (resolved by `image()`), which is exactly what `<ProjectsSection>`/`<ProjectCard>` expect.

## 10. Raster covers and reproducible generation

Placeholder covers are generated once with ImageMagick (the human verified `magick`/`convert` are available) and committed like any other content asset. Each file is 1280×800 WebP: solid `#0f172a` base plus the project's gradient pair at 85 % opacity, quality 82.

| File                 | Gradient pair         |
| -------------------- | --------------------- |
| `synapse.webp`       | `#3525cd` → `#818cf8` |
| `aether-cloud.webp`  | `#4f46e5` → `#6366f1` |
| `kortex-editor.webp` | `#8b5cf6` → `#3525cd` |
| `vanguard-cli.webp`  | `#6366f1` → `#4f46e5` |

Commands (run from the repository root; IM7 `magick`, IM6 equivalent `convert`):

```bash
magick -size 1280x800 xc:'#0f172a' \
  \( -size 1280x800 gradient:'#3525cd-#818cf8' -alpha set -channel A -evaluate set 85% +channel \) \
  -compose over -composite -quality 82 src/content/projects/covers/synapse.webp

magick -size 1280x800 xc:'#0f172a' \
  \( -size 1280x800 gradient:'#4f46e5-#6366f1' -alpha set -channel A -evaluate set 85% +channel \) \
  -compose over -composite -quality 82 src/content/projects/covers/aether-cloud.webp

magick -size 1280x800 xc:'#0f172a' \
  \( -size 1280x800 gradient:'#8b5cf6-#3525cd' -alpha set -channel A -evaluate set 85% +channel \) \
  -compose over -composite -quality 82 src/content/projects/covers/kortex-editor.webp

magick -size 1280x800 xc:'#0f172a' \
  \( -size 1280x800 gradient:'#6366f1-#4f46e5' -alpha set -channel A -evaluate set 85% +channel \) \
  -compose over -composite -quality 82 src/content/projects/covers/vanguard-cli.webp
```

Verify with `magick identify src/content/projects/covers/*.webp` (expect `WEBP 1280x800`). The human manages these files afterwards; the tests only assert existence, WebP magic bytes and the weight bound, so replacement covers keep passing as long as they are WebP and reasonably sized.

## 11. Test strategy

**Fixtures over the content layer (primary).** `tests/projects-section.test.ts` renders `ProjectsSection` and `ProjectCard` with a local `createProject(overrides)` fixture factory through `experimental_AstroContainer`. `tests/projects-schema.test.ts` imports `src/content/projects-schema.ts` directly and calls `buildProjectsSchema({ image: () => z.string() })` — no `astro:content` involved in either file.

**Schema tests with the stubbed `image`.** The stub makes `coverPath` a required string field, which is enough to assert the accept/reject matrix, the `featured` default and the helper behaviour. Real path resolution into `ImageMetadata` is not unit-testable without the content layer; it is covered by the collection config assertion (R1) and by the build (R3 note, `tasks.md` 12.4).

**Content and asset tests.** Seed files and covers are read with `readFileSync`; covers are read with the `'latin1'` encoding (1 char per byte, so magic bytes and byte length are exact without `Buffer` typings) using the extended `tests/node-shims.d.ts` overload. `package.json` is parsed for the `sharp` dependency. RGB differences from ImageMagick output do not affect these assertions.

**Cover rendering (R32) — preferred path.** With `sharp` installed, `tests/projects-section.test.ts` imports a real placeholder (`import synapseCover from '../../src/content/projects/covers/synapse.webp'`, typed `ImageMetadata` through the `astro/client` declarations already in the tsconfig chain) and uses it in the fixture factory; the Container API renders the card and the test asserts the resulting `<img>` (`alt`, `width="640"`, `height="400"`, `loading="lazy"`, non-empty optimized `src`). If the Container API cannot render `<Image>` in this project, the documented fallback is: `renders_project_card_covers` becomes a source-contract assertion on `ProjectCard.astro` (`import { Image } from 'astro:assets'` and the five `<Image>` props of R32) and `pnpm build` (task 12.4) verifies the generated `dist/index.html` contains the optimized `<img>` (`/_astro/*.webp`, `width`, `height`, `loading="lazy"`, `alt`). The chosen variant is recorded in `progress/current.md`. If the failure also blocks the non-cover rendering assertions, stop and document it there instead of shipping untested render paths.

**CSS contract.** No CSS engine runs in Vitest, so style tests read `src/components/ProjectsSection.astro` / `ProjectCard.astro` / `src/styles/tokens.css` with `readFileSync` and assert exact declarations, using the same whitespace-normalizing `extractRule` / `extractResponsiveRule` helper pattern already duplicated in `tests/index.test.ts` and `tests/hero.test.ts` (keep the duplication for consistency; no shared test util refactor in this increment). `:global(.project-card__image)` is asserted verbatim.

**`getCollection` under Vitest — decision and fallback (R45, R18).** `vitest.config.ts` uses `getViteConfig`, and older Astro versions had `astro:content` unusable in Vitest; Astro 6 may work after content sync. Task 7.1 of `tasks.md` is a spike that must settle it with two acceptance criteria:

1. A test importing `getCollection` from `astro:content` (without `vi.mock`) returns the four entries.
2. It does so on a clean checkout **without a prior `pnpm build`**, because `pnpm validate` runs `pnpm test` before `pnpm build`.

- **If the spike passes:** `tests/projects-content.test.ts` loads the real collection with `getCollection('projects')` and validates each entry against the built schema, and `tests/index.test.ts` / `renders_projects_section_after_hero` render the real page.
- **If the spike fails:** `tests/projects-content.test.ts` falls back to filesystem assertions (file names, exact frontmatter lines from §4, UUID/URL values validated with `buildProjectsSchema({ image: () => z.string() }).shape.id.safeParse(...)`, non-empty body) and the page-rendering tests mock the virtual module with fixtures:

```ts
vi.mock('astro:content', () => ({
  getCollection: async () =>
    FIXTURE_ENTRIES.map((data, index) => ({
      id: `fixture-${index}`,
      data,
    })),
}));
```

`vi.mock` is hoisted, so it is declared before importing `src/pages/index.astro`; `tests/index.test.ts` and `tests/projects-section.test.ts` share the same fixture factory (duplicated locally, matching the existing no-shared-util convention). If the virtual module proves impossible to intercept even with a factory, the last-resort fallback is to extract the two lines of `index.astro` into `src/content/projects-loader.ts` (`loadProjects()` returning `ProjectData[]`) and mock that real file instead; the outcome and the chosen branch are recorded in `progress/current.md`.

**Escaping.** `{project.description}` is HTML-escaped by Astro, so the Aether description renders as `Sincronización … global &lt; 10ms.`; rendering assertions use the escaped form, filesystem assertions use the raw form.

## 12. Rejected alternatives

| Alternative                                                                                                  | Why rejected                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hand-made SVG covers in `public/` with plain `<img>` and a string `coverPath` (the first draft of this spec) | Superseded by the human decision of 2026-09-28: the real app uses normal pixel images, and the mockup's hand-made panels/SVGs are not the product. `public/` files are never optimized or validated; `image()` validates the file at build time and yields `ImageMetadata` for `<Image/>` without any string-path plumbing. |
| Hand-built terminal-preview panels (as in the mockup) as the covers                                          | Same human decision: they are hardcoded mockup chrome (filenames, metrics, versions) with no data-model fields. Real cover images replace them.                                                                                                                                                                             |
| `getImage()` by hand instead of `<Image>`                                                                    | More code for identical output; `<Image>` already enforces `alt`, infers sizes and emits the optimized `src`. The card needs no custom transformation beyond the fixed 640×400 display size.                                                                                                                                |
| `public/` covers referenced by absolute URL (`/projects/x.webp`)                                             | Outside Astro's asset pipeline: no validation, no optimization, and it would force the card back to a string-typed `coverPath`. The entry-relative `./covers/x.webp` path is the documented content-collection image pattern and migrates cleanly when the human replaces the seeds.                                        |
| `file()` loader with one JSON/YAML file for all projects                                                     | Breaks the one-file-per-project model requested by the human, loses per-entry Markdown bodies (future scope), makes slugs synthetic, and JSON/YAML cannot reference `image()` paths the same way Markdown frontmatter does.                                                                                                 |
| MDX entries                                                                                                  | Body rendering is out of scope and MDX would add the `@astrojs/mdx` integration and its runtime for nothing.                                                                                                                                                                                                                |
| Tailwind or a CSS-in-JS island                                                                               | Contradicts the project's plain-CSS + custom-properties convention and the zero-JS rule; the mockup's utilities translate one-to-one (§8).                                                                                                                                                                                  |
| Sorting and uniqueness validation in `src/pages/index.astro`                                                 | Would tie the ordering guarantee to the page and remove the only render-time justification for a component-level helper; testability would depend on `astro:content` being available under Vitest. The section owning `sortProjects` keeps the guarantee provable with fixtures (R8).                                       |
| Two card components (`FeaturedProjectCard` + `ProjectCard`) or duplicated markup                             | The variants share cover/meta/links/pills; a single component with a `featured` modifier avoids duplicated link/ARIA/icon logic that would otherwise drift.                                                                                                                                                                 |
| `getCollection` inside `ProjectsSection`                                                                     | Would couple the presentational unit to `astro:content` and make Container-API rendering with fixtures impossible; only the page touches the collection.                                                                                                                                                                    |
| Status pill (`Arquitectura Destacada`) and version badge (`v1.4.2 Producción`)                               | Not in the data model; hardcoding them on the featured card would be wrong as soon as the human edits `src/content`. Add schema fields later if they are wanted.                                                                                                                                                            |
| Icon font (Material Symbols) or text-only links                                                              | The icon font is an external request forbidden since the hero increment; inline SVGs keep zero external requests. Icon-only links are made accessible with `aria-label`s (R41), and text links would diverge from the mockup's title row.                                                                                   |
| Responsive `widths`/`sizes` on the cover image                                                               | Deferred: the requested contract is a fixed 640×400 output with a fixed 16/10 CSS crop; adding srcset variants now would complicate the tests and the generated output for no current requirement.                                                                                                                          |
| Remote cover URLs in `coverPath`                                                                             | The seeds and the human-managed content are local files; remote images would need `image.remotePatterns` configuration and would step outside the content-collection image pattern.                                                                                                                                         |
| A hydrated island or inline handler for anything in the section                                              | There is no interaction to ship: the cards are static links. Zero JS is preserved.                                                                                                                                                                                                                                          |
| Using the frontmatter `id` as the Astro slug (`slug` frontmatter override)                                   | Unnecessary coupling between data identity (stable UUID) and routing; filename slugs already satisfy the future detail-page requirement.                                                                                                                                                                                    |

## 13. Out of scope / future work

- Nav/header, tech-stack, about and contact sections, footer, contact form.
- Project detail pages (`src/pages/projects/[id].astro`) and the `render()` of entry bodies.
- Markdown body rendering and MDX.
- WebGL shader.
- Real cover art: the human replaces the four generated WebP placeholders with production images (any intrinsic size; the 16/10 box crops them).
- Responsive `srcset`/`sizes` for covers and authorizing remote image sources.
- i18n; the section copy and `aria-label`s are Spanish like the rest of the page.
- Analytics or outbound-link tracking.

## 14. Risks

| Risk                                                          | Mitigation                                                                                                                                                                                            |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getCollection` unavailable in Vitest (or only after a build) | §11 spike with explicit acceptance criteria; fixture-based rendering for section/card tests; `vi.mock('astro:content')` fallback; loader-extraction last resort.                                      |
| `<Image>` not renderable through the Container API in Vitest  | Preferred path uses real `ImageMetadata` with `sharp` installed; documented fallback in §11 (source contract + `dist/` verification). Decision recorded in `progress/current.md`.                     |
| `sharp` installation (native binary) across platforms         | `pnpm add sharp` pins it in `dependencies` and the lockfile; it is Astro's official image service, not a speculative library.                                                                         |
| ImageMagick missing the WebP delegate (generation step)       | `magick identify` verifies output; if WebP output is unavailable, stop and document the blocker instead of committing a non-WebP file (R14 guards the format).                                        |
| A user cover with a different aspect ratio looks cropped      | Intended: the 16/10 box with `object-fit: cover` crops consistently (R33). `coverAlt` remains descriptive.                                                                                            |
| A missing/unreadable cover path fails the build               | Intended explicit failure (`docs/conventions.md`): `image()` validation reports the offending entry at build time.                                                                                    |
| CSS is verified by static assertions, not a browser           | Exact, token-anchored declarations; manual comparison against `specs/projects-section/references/projects-section.png` is part of task 12.5.                                                          |
| Seed content drifts from the schema                           | Build fails on schema violations; `tests/projects-content.test.ts` asserts the exact frontmatter of §4 and unit tests pin the schema.                                                                 |
| A duplicate `priority` (or `id`) slips in                     | `sortProjects` throws explicit errors during section render, so `astro build` fails; unit tests pin both messages. Intentionally strict — the human edits content afterwards and gets a loud failure. |
| HTML escaping mismatch (`<` in the Aether description)        | Tests assert the escaped `&lt;` in rendered HTML and the raw `<` in files, as documented in §11.                                                                                                      |
| Static test helpers duplicated across files                   | Matches the existing convention (`index.test.ts`, `hero.test.ts`); a shared test util refactor is deliberately out of scope.                                                                          |
