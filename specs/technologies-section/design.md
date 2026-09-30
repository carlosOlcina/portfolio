# Design — technologies-section

## 1. Context

Third UI increment of the portfolio: the tech stack section of the Stitch design **Full Chromatic Glass**, rendered from a Zod-validated **JSON** content collection with svgl logos vendored under `public/icons/logos/`. The authoritative markup is `specs/projects-section/references/projects-section.html` lines 1199–1733; `specs/hero-section/references/design-notes.md` (line 323) digests its texts.

Hard constraints from the harness: Astro 6 + strict TypeScript, zero client JS, plain CSS with the existing custom properties (no Tailwind), no icon font, no new dependencies, and every requirement traceable to a Vitest test. User constraints: JSON (not Markdown) content data, svgl icons hardcoded in the JSON as local paths, exactly four fields per entry (`id`, `category`, `iconUrl`, `name`).

The feature mirrors the `projects-section` architecture: a schema module that Vitest can import without virtual modules, a presentational section component that receives plain data, and a page that owns the only `getCollection` calls. Two differences: the entries are JSON (no Astro image pipeline involved) and there are **no injected dependencies**, so the schema is a plain exported constant instead of a factory.

## 2. Decisions summary

1. The `technologies` collection lives in `src/content.config.ts` with the `glob` loader (`base: './src/content/technologies'`, `pattern: '**/*.json'`) and `schema: technologiesSchema`.
2. One JSON file per technology entry (`src/content/technologies/<slug>.json`), matching the one-entry-per-file model of `projects` and keeping the four fields at the top level of each file. The `file()` single-array loader is rejected (§12).
3. `src/content/technologies-schema.ts` exports `technologiesSchema` (`z.strictObject`), `TECHNOLOGY_CATEGORIES`, `TechnologyData`, `assertUniqueTechnologies` and `groupTechnologies`. It imports only `astro/zod`; Vitest imports it directly. No factory: there is no Astro-context dependency to inject (unlike the projects `image()`).
4. `category` stores the **verbatim mockup label** (`Frontend`, `Backend y Nube`, `IA y Sistemas`, `Flujo de Trabajo y Diseño`), validated by `z.enum(TECHNOLOGY_CATEGORIES)`. One source of truth for labels, ordering and the schema enum.
5. `iconUrl` is validated as a root-relative local path with `/^\/icons\/logos\/[a-z0-9-]+\.svg$/`; remote URLs, non-SVG files, uppercase or underscored names and paths without a leading slash are rejected at build time.
6. Deterministic order without extra fields: fixed category order from `TECHNOLOGY_CATEGORIES` and alphabetical order by `name` (code-point comparison, locale-independent) inside each category. Empty categories are omitted.
7. `groupTechnologies` calls `assertUniqueTechnologies` first; duplicate `id`s throw `Duplicate technology id: <id>` during section render, so `astro build` fails loudly (same guarantee as `sortProjects`).
8. 26 seed JSON entries (7 Frontend, 8 Backend y Nube, 4 IA y Sistemas, 7 Flujo de Trabajo y Diseño) proposed for human approval in §5; mockup items without an svgl icon are dropped and documented, and one substitution (Ollama) is flagged in §15.
9. 26 vendored SVGs in `public/icons/logos/` with normalized kebab-case names; every source URL was verified on 2026-09-30 (HTTP 200, `image/svg+xml`) and is recorded with its byte size in §6. No runtime fetch, no CDN, no dependency.
10. One new token (`--font-mono`) for the mockup's `font-mono` badge; everything else consumes existing `--color-*`, `--font-*`, `--text-*`, `--radius-*` tokens.
11. `TechnologiesSection.astro` receives `technologies: TechnologyData[]`, calls `groupTechnologies` and renders the header, the four-category bento grid (glass cards), the icon chips and the closing quote bar, reusing the global `animate-fade-in-up` / `animation-delay-200` utilities. No scripts, no islands, no inline handlers.
12. Icons render as plain `<img>` from `public/` (SVGs are copied as-is and never go through Astro's image pipeline); category and quote icons are decorative inline SVGs replicating the mockup's Material Symbols ligatures. Technology `<img>`s carry the technology name as `alt` (informative) plus a `title` tooltip on the `<li>` (mockup parity).
13. Only `src/pages/index.astro` touches `getCollection('technologies')`; the section component stays presentational and fixture-testable.
14. Existing tests that mock `astro:content` become collection-aware (the page now issues two `getCollection` calls).

## 3. Files

| File                                       | Action | Responsibility                                                                                                            |
| ------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| `src/content/technologies-schema.ts`       | create | `TECHNOLOGY_CATEGORIES`, `technologiesSchema`, `TechnologyData`, `assertUniqueTechnologies`, `groupTechnologies` (R2–R7). |
| `src/content.config.ts`                    | modify | Adds the `technologies` collection with the JSON glob loader and `technologiesSchema` (R1).                               |
| `src/content/technologies/*.json`          | create | 26 seed entries, exactly four fields each (R9–R13).                                                                       |
| `public/icons/logos/*.svg`                 | create | 26 svgl logos, kebab-case names, root-relative `iconUrl` targets (R14–R17).                                               |
| `src/styles/tokens.css`                    | modify | Adds `--font-mono` (R18).                                                                                                 |
| `src/components/TechnologiesSection.astro` | create | Section shell, header, four-category glass grid, chips, quote bar + scoped styles (R8, R19–R42).                          |
| `src/pages/index.astro`                    | modify | Loads the collection and composes `<TechnologiesSection />` after `<ProjectsSection />` (R43).                            |
| `tests/technologies-schema.test.ts`        | create | Collection config, schema contract, constant, helpers (R1–R7).                                                            |
| `tests/technologies-content.test.ts`       | create | 26 seeds, four-field shape, categories, ids, icon files and SVG safety (R9–R17).                                          |
| `tests/technologies-section.test.ts`       | create | Section rendering with fixtures + CSS contract + page placement (R8, R18–R43).                                            |
| `tests/index.test.ts`                      | modify | Collection-aware mock; extends the script/island/handler scan to the new component (R41–R44).                             |
| `tests/projects-section.test.ts`           | modify | Collection-aware mock so the page still renders with the new `getCollection('technologies')` call.                        |

Unchanged: `astro.config.mjs` (no integrations), `vitest.config.ts`, `tsconfig.json`, `package.json` (no new dependencies), `tests/node-shims.d.ts` (the icon tests only need `'utf8'` and `readdirSync`, already shimmed), `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/HeroSection.astro`, `src/components/ProjectsSection.astro`, `src/components/ProjectCard.astro`, `src/scripts/clipboard.ts`, `tests/tokens.test.ts` (no exhaustive font-family assertion), the project seeds and covers.

## 4. Data model and schema

### Schema module — `src/content/technologies-schema.ts`

Imports only `astro/zod`; no virtual modules, no side effects, directly importable by Vitest.

```ts
import { z } from 'astro/zod';

export const TECHNOLOGY_CATEGORIES = [
  'Frontend',
  'Backend y Nube',
  'IA y Sistemas',
  'Flujo de Trabajo y Diseño',
] as const;

export type TechnologyCategory = (typeof TECHNOLOGY_CATEGORIES)[number];

export const LOCAL_ICON_PATH_PATTERN = /^\/icons\/logos\/[a-z0-9-]+\.svg$/;

export const technologiesSchema = z.strictObject({
  id: z.uuid(),
  category: z.enum(TECHNOLOGY_CATEGORIES),
  iconUrl: z.string().regex(LOCAL_ICON_PATH_PATTERN),
  name: z.string(),
});

export type TechnologyData = z.infer<typeof technologiesSchema>;

export function assertUniqueTechnologies(
  technologies: readonly Pick<TechnologyData, 'id'>[],
): void {
  const ids = new Set<string>();

  for (const technology of technologies) {
    if (ids.has(technology.id)) {
      throw new Error(`Duplicate technology id: ${technology.id}`);
    }
    ids.add(technology.id);
  }
}

export interface TechnologyGroup<T extends TechnologyData = TechnologyData> {
  category: TechnologyCategory;
  items: T[];
}

const compareByName = (a: TechnologyData, b: TechnologyData): number => {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
};

export function groupTechnologies<T extends TechnologyData>(
  technologies: readonly T[],
): TechnologyGroup<T>[] {
  assertUniqueTechnologies(technologies);

  return TECHNOLOGY_CATEGORIES.flatMap((category) => {
    const items = technologies
      .filter((technology) => technology.category === category)
      .sort(compareByName);

    return items.length > 0 ? [{ category, items }] : [];
  });
}
```

Notes:

- `z.strictObject` rejects unknown keys, enforcing the four-field contract at build time. If `astro/zod` ever lacks `strictObject`, the fallback is `z.object({ ... }).strict()`; the tests only observe accept/reject behaviour.
- If `z.enum` rejects the readonly tuple in the installed Zod version, the fallback is `z.enum([...TECHNOLOGY_CATEGORIES])`.
- `filter` returns a new array before `sort`, so the input is never mutated; groups are new objects. The error message is part of the contract (R5) and is asserted verbatim.
- Alphabetical order by `name` uses `<`/`>` (code points), avoiding `localeCompare` differences across ICU versions.

### `src/content.config.ts`

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { buildProjectsSchema } from './content/projects-schema';
import { technologiesSchema } from './content/technologies-schema';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: ({ image }) => buildProjectsSchema({ image }),
});

const technologies = defineCollection({
  loader: glob({ base: './src/content/technologies', pattern: '**/*.json' }),
  schema: technologiesSchema,
});

export const collections = { projects, technologies };
```

The glob loader parses each JSON file and validates its data with `technologiesSchema`; the entry `id` is derived from the file name (`react`, `nextjs`, …) while the data `id` stays a UUID used only for identity and uniqueness (same convention as projects). A file with an unknown key, an unknown category, a remote `iconUrl` or a duplicate UUID fails `astro build` explicitly.

## 5. Seed content

26 entries proposed for human approval (see §15.1). Files are listed alphabetically per category — the rendered order is computed by `groupTechnologies`.

| File               | `id` (UUID)                            | `category`                  | `name`          | `iconUrl`                      |
| ------------------ | -------------------------------------- | --------------------------- | --------------- | ------------------------------ |
| `css3.json`        | `6fa13057-c283-4fbe-9094-7142b35f86ac` | `Frontend`                  | `CSS3`          | `/icons/logos/css3.svg`        |
| `framer.json`      | `4d8f1e35-a061-4d9c-be72-5f20913d648a` | `Frontend`                  | `Framer Motion` | `/icons/logos/framer.svg`      |
| `html5.json`       | `5e902f46-b172-4ead-af83-6031a24e759b` | `Frontend`                  | `HTML5`         | `/icons/logos/html5.svg`       |
| `nextjs.json`      | `1a5c8b02-7d3e-4a69-8b4f-2c9d6e0a3157` | `Frontend`                  | `Next.js`       | `/icons/logos/nextjs.svg`      |
| `react.json`       | `0e4b7a91-6c2d-4f58-9a3e-1b7c5d8f2046` | `Frontend`                  | `React`         | `/icons/logos/react.svg`       |
| `tailwindcss.json` | `3c7e0d24-9f50-4c8b-ad61-4e1f802c5379` | `Frontend`                  | `Tailwind CSS`  | `/icons/logos/tailwindcss.svg` |
| `typescript.json`  | `2b6d9c13-8e4f-4b7a-9c50-3d0e7f1b4268` | `Frontend`                  | `TypeScript`    | `/icons/logos/typescript.svg`  |
| `docker.json`      | `d618a7ce-39fa-4a25-a70b-e8b9cad0fd13` | `Backend y Nube`            | `Docker`        | `/icons/logos/docker.svg`      |
| `go.json`          | `81c35279-e4a5-4bd0-b2b6-9364d57ba8ce` | `Backend y Nube`            | `Go`            | `/icons/logos/go.svg`          |
| `nodejs.json`      | `70b24168-d394-4acf-b1a5-8253c46a97bd` | `Backend y Nube`            | `Node.js`       | `/icons/logos/nodejs.svg`      |
| `postgresql.json`  | `b4f685ac-17d8-4e03-85e9-c697a8aedbf1` | `Backend y Nube`            | `PostgreSQL`    | `/icons/logos/postgresql.svg`  |
| `python.json`      | `a3e5749b-06c7-4df2-b4d8-b586f79dcae0` | `Backend y Nube`            | `Python`        | `/icons/logos/python.svg`      |
| `redis.json`       | `c50796bd-28e9-4f14-96fa-d7a8b9bfec02` | `Backend y Nube`            | `Redis`         | `/icons/logos/redis.svg`       |
| `rust.json`        | `92d4638a-f5b6-4ce1-a3c7-a475e68cb9df` | `Backend y Nube`            | `Rust`          | `/icons/logos/rust.svg`        |
| `vercel.json`      | `e729b8df-4a0b-4b36-b81c-f9cadbe10e24` | `Backend y Nube`            | `Vercel`        | `/icons/logos/vercel.svg`      |
| `claude.json`      | `f83ac9e0-5b1c-4c47-992d-0adbecf21f35` | `IA y Sistemas`             | `Claude API`    | `/icons/logos/claude.svg`      |
| `langchain.json`   | `1a5ceb02-7d3e-4e69-9b4f-2cfd0e143b57` | `IA y Sistemas`             | `LangChain`     | `/icons/logos/langchain.svg`   |
| `ollama.json`      | `2b6dfc13-8e4f-4f7a-ac50-3d0e1f254c68` | `IA y Sistemas`             | `Ollama`        | `/icons/logos/ollama.svg`      |
| `openai.json`      | `094bdaf1-6c2d-4d58-8a3e-1becfd032a46` | `IA y Sistemas`             | `OpenAI`        | `/icons/logos/openai.svg`      |
| `figma.json`       | `3c7e0d24-9f50-4a8b-bd61-4e1f20a65d79` | `Flujo de Trabajo y Diseño` | `Figma`         | `/icons/logos/figma.svg`       |
| `git.json`         | `4d8f1e35-a061-4b9c-be72-5f2031b76e8a` | `Flujo de Trabajo y Diseño` | `Git`           | `/icons/logos/git.svg`         |
| `github.json`      | `5e902f46-b172-4cad-bf83-603142c87f9b` | `Flujo de Trabajo y Diseño` | `GitHub`        | `/icons/logos/github.svg`      |
| `linear.json`      | `6fa13057-c283-4dbe-b094-714253d980ac` | `Flujo de Trabajo y Diseño` | `Linear`        | `/icons/logos/linear.svg`      |
| `postman.json`     | `92d4638a-f5b6-40e1-b3c7-a47586a2c3df` | `Flujo de Trabajo y Diseño` | `Postman`       | `/icons/logos/postman.svg`     |
| `raycast.json`     | `81c35279-e4a5-4fd0-a2b6-936475f1b2ce` | `Flujo de Trabajo y Diseño` | `Raycast`       | `/icons/logos/raycast.svg`     |
| `vscode.json`      | `70b24168-d394-4ecf-91a5-825364e0a1bd` | `Flujo de Trabajo y Diseño` | `VS Code`       | `/icons/logos/vscode.svg`      |

Each file is exactly:

```json
{
  "id": "0e4b7a91-6c2d-4f58-9a3e-1b7c5d8f2046",
  "category": "Frontend",
  "iconUrl": "/icons/logos/react.svg",
  "name": "React"
}
```

### Mockup mapping (drops, splits and additions)

| Mockup item                                                                                                | Seed outcome                                            | Reason                                                                                                      |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `React`, `TypeScript`, `Tailwind CSS`, `Framer Motion`                                                     | kept                                                    | svgl icons available.                                                                                       |
| `Next.js 15`                                                                                               | kept as `Next.js` (version suffix dropped)              | Version numbers do not belong in a four-field data model.                                                   |
| `HTML5 / CSS3`                                                                                             | split into `HTML5` + `CSS3`                             | One icon per entry; both logos exist.                                                                       |
| `Node.js`, `Python`, `PostgreSQL`, `Redis`, `Docker`                                                       | kept                                                    | svgl icons available.                                                                                       |
| `Prisma / Drizzle`                                                                                         | dropped                                                 | Avoids two overlapping ORMs; svgl sources (`prisma.svg`, `drizzle-orm_light.svg`) are documented for later. |
| `AWS / Vercel`                                                                                             | kept as `Vercel` only                                   | Hosting slot already covered; AWS source (`aws_light.svg`) documented for later.                            |
| `OpenAI / Claude APIs`                                                                                     | split into `OpenAI` + `Claude API`                      | One icon per entry; Claude is referenced by the Synapse project.                                            |
| `LangChain`                                                                                                | kept                                                    | svgl source `langchain-logo.svg`.                                                                           |
| `Pinecone`, `pgvector`, `WebSockets`, `Wasm`                                                               | dropped                                                 | No svgl icons exist for them (verified against the svgl catalog on 2026-09-30).                             |
| `Ollama`                                                                                                   | added (proposed replacement for the icon-less AI items) | Keeps the AI category meaningful and matches Vanguard CLI's local-model usage; see §15.3.                   |
| `Figma`, `Git & GitHub` → `Git` + `GitHub`, `Linear`, `VS Code / Cursor` → `VS Code`, `Raycast`, `Postman` | kept (split where the slot had two logos)               | Cursor dropped for balance; svgl source (`cursor_light.svg`) documented.                                    |
| —                                                                                                          | added `Go`, `Rust`                                      | Referenced by the project seeds (Aether Cloud, Vanguard CLI) and available in svgl.                         |

## 6. Icon assets (`public/icons/logos/`)

All 26 sources were fetched and verified on **2026-09-30**: every URL answered `200` with `content-type: image/svg+xml` and an `<svg` root. The chosen variants are the ones intended for **light backgrounds** (the section's glass cards are light); for single-variant logos the only asset is used.

| Local file        | svgl source                                     | Bytes | Variant note                                            |
| ----------------- | ----------------------------------------------- | ----- | ------------------------------------------------------- |
| `react.svg`       | `https://svgl.app/library/react_light.svg`      | 6534  | Light-background mark (`react_dark.svg` is brighter).   |
| `nextjs.svg`      | `https://svgl.app/library/nextjs_icon_dark.svg` | 1091  | Only icon variant; black circle reads on light.         |
| `typescript.svg`  | `https://svgl.app/library/typescript.svg`       | 1744  | Single variant.                                         |
| `tailwindcss.svg` | `https://svgl.app/library/tailwindcss.svg`      | 747   | Single variant.                                         |
| `framer.svg`      | `https://svgl.app/library/framer.svg`           | 194   | Light-background variant.                               |
| `html5.svg`       | `https://svgl.app/library/html5.svg`            | 382   | Single variant.                                         |
| `css3.svg`        | `https://svgl.app/library/css.svg`              | 2348  | Current CSS logo (`css_old.svg` is the legacy mark).    |
| `nodejs.svg`      | `https://svgl.app/library/nodejs.svg`           | 2491  | Single variant.                                         |
| `go.svg`          | `https://svgl.app/library/golang.svg`           | 1472  | Light-background wordmark (`golang_dark.svg` is white). |
| `rust.svg`        | `https://svgl.app/library/rust.svg`             | 5425  | Light-background variant.                               |
| `python.svg`      | `https://svgl.app/library/python.svg`           | 1126  | Single variant.                                         |
| `postgresql.svg`  | `https://svgl.app/library/postgresql.svg`       | 3944  | Single variant.                                         |
| `redis.svg`       | `https://svgl.app/library/redis.svg`            | 1928  | Single variant.                                         |
| `docker.svg`      | `https://svgl.app/library/docker.svg`           | 1488  | Single variant.                                         |
| `vercel.svg`      | `https://svgl.app/library/vercel.svg`           | 169   | Light-background variant.                               |
| `claude.svg`      | `https://svgl.app/library/claude-ai-icon.svg`   | 1999  | Single variant (terracotta mark).                       |
| `openai.svg`      | `https://svgl.app/library/openai.svg`           | 2430  | Light-background variant.                               |
| `langchain.svg`   | `https://svgl.app/library/langchain-logo.svg`   | 491   | Single variant.                                         |
| `ollama.svg`      | `https://svgl.app/library/ollama_light.svg`     | 8572  | Light-background variant.                               |
| `figma.svg`       | `https://svgl.app/library/figma.svg`            | 1087  | Single variant.                                         |
| `git.svg`         | `https://svgl.app/library/git.svg`              | 484   | Single variant.                                         |
| `github.svg`      | `https://svgl.app/library/github_light.svg`     | 997   | Light-background mark (`github_dark.svg` is white).     |
| `linear.svg`      | `https://svgl.app/library/linear.svg`           | 836   | Single variant.                                         |
| `vscode.svg`      | `https://svgl.app/library/vscode.svg`           | 3345  | Single variant.                                         |
| `raycast.svg`     | `https://svgl.app/library/raycast.svg`          | 688   | Single variant.                                         |
| `postman.svg`     | `https://svgl.app/library/postman.svg`          | 5861  | Single variant.                                         |

Reproducible vendoring (run from the repository root; `curl` is available in the environment):

```bash
install -d public/icons/logos
while read -r local url; do
  curl -fsSL "$url" -o "public/icons/logos/$local"
done <<'EOF'
react.svg https://svgl.app/library/react_light.svg
nextjs.svg https://svgl.app/library/nextjs_icon_dark.svg
typescript.svg https://svgl.app/library/typescript.svg
tailwindcss.svg https://svgl.app/library/tailwindcss.svg
framer.svg https://svgl.app/library/framer.svg
html5.svg https://svgl.app/library/html5.svg
css3.svg https://svgl.app/library/css.svg
nodejs.svg https://svgl.app/library/nodejs.svg
go.svg https://svgl.app/library/golang.svg
rust.svg https://svgl.app/library/rust.svg
python.svg https://svgl.app/library/python.svg
postgresql.svg https://svgl.app/library/postgresql.svg
redis.svg https://svgl.app/library/redis.svg
docker.svg https://svgl.app/library/docker.svg
vercel.svg https://svgl.app/library/vercel.svg
claude.svg https://svgl.app/library/claude-ai-icon.svg
openai.svg https://svgl.app/library/openai.svg
langchain.svg https://svgl.app/library/langchain-logo.svg
ollama.svg https://svgl.app/library/ollama_light.svg
figma.svg https://svgl.app/library/figma.svg
git.svg https://svgl.app/library/git.svg
github.svg https://svgl.app/library/github_light.svg
linear.svg https://svgl.app/library/linear.svg
vscode.svg https://svgl.app/library/vscode.svg
raycast.svg https://svgl.app/library/raycast.svg
postman.svg https://svgl.app/library/postman.svg
EOF
```

Post-download checks: `grep -L '<svg' public/icons/logos/*.svg` (expect no output), `grep -l '<script' public/icons/logos/*.svg` (expect no output), `wc -c public/icons/logos/*.svg` (every file ≤ 32768 bytes; the largest is `ollama.svg` at 8572).

Because the files live in `public/`, Astro copies them unchanged to `/icons/logos/<name>.svg`; `iconUrl` is therefore a root-relative path with no image-pipeline processing (SVGs are vector, already optimized, and the user asked for exactly this structure).

## 7. `src/components/TechnologiesSection.astro`

```astro
---
import {
  groupTechnologies,
  type TechnologyCategory,
  type TechnologyData,
} from '../content/technologies-schema';

interface Props {
  technologies: TechnologyData[];
}

const { technologies } = Astro.props;
const groups = groupTechnologies(technologies);

const CATEGORY_ICON_PATHS: Record<TechnologyCategory, string> = {
  Frontend:
    'M480-118 120-398l66-50 294 228 294-228 66 50-360 280Zm0-202L120-600l360-280 360 280-360 280Zm0-280Zm0 178 230-178-230-178-230 178 230 178Z',
  'Backend y Nube':
    'M300-720q-25 0-42.5 17.5T240-660q0 25 17.5 42.5T300-600q25 0 42.5-17.5T360-660q0-25-17.5-42.5T300-720Zm0 400q-25 0-42.5 17.5T240-260q0 25 17.5 42.5T300-200q25 0 42.5-17.5T360-260q0-25-17.5-42.5T300-320ZM160-840h640q17 0 28.5 11.5T840-800v280q0 17-11.5 28.5T800-480H160q-17 0-28.5-11.5T120-520v-280q0-17 11.5-28.5T160-840Zm40 80v200h560v-200H200Zm-40 320h640q17 0 28.5 11.5T840-400v280q0 17-11.5 28.5T800-80H160q-17 0-28.5-11.5T120-120v-280q0-17 11.5-28.5T160-440Zm40 80v200h560v-200H200Zm0-400v200-200Zm0 400v200-200Z',
  'IA y Sistemas':
    'M390-120q-51 0-88-35.5T260-241q-60-8-100-53t-40-106q0-21 5.5-41.5T142-480q-11-18-16.5-38t-5.5-42q0-61 40-105.5t99-52.5q3-51 41-86.5t90-35.5q26 0 48.5 10t41.5 27q18-17 41-27t49-10q52 0 89.5 35t40.5 86q59 8 99.5 53T840-560q0 22-5.5 42T818-480q11 18 16.5 38.5T840-400q0 62-40.5 106.5T699-241q-5 50-41.5 85.5T570-120q-25 0-48.5-9.5T480-156q-19 17-42 26.5t-48 9.5Zm130-590v460q0 21 14.5 35.5T570-200q20 0 34.5-16t15.5-36q-21-8-38.5-21.5T550-306q-10-14-7.5-30t16.5-26q14-10 30-7.5t26 16.5q11 16 28 24.5t37 8.5q33 0 56.5-23.5T760-400q0-5-.5-10t-2.5-10q-17 10-36.5 15t-40.5 5q-17 0-28.5-11.5T640-440q0-17 11.5-28.5T680-480q33 0 56.5-23.5T760-560q0-33-23.5-56T680-640q-11 18-28.5 31.5T613-587q-16 6-31-1t-20-23q-5-16 1.5-31t22.5-20q15-5 24.5-18t9.5-30q0-21-14.5-35.5T570-760q-21 0-35.5 14.5T520-710Zm-80 460v-460q0-21-14.5-35.5T390-760q-21 0-35.5 14.5T340-710q0 16 9 29.5t24 18.5q16 5 23 20t2 31q-6 16-21 23t-31 1q-21-8-38.5-21.5T279-640q-32 1-55.5 24.5T200-560q0 33 23.5 56.5T280-480q17 0 28.5 11.5T320-440q0 17-11.5 28.5T280-400q-21 0-40.5-5T203-420q-2 5-2.5 10t-.5 10q0 33 23.5 56.5T280-320q20 0 37-8.5t28-24.5q10-14 26-16.5t30 7.5q14 10 16.5 26t-7.5 30q-14 19-32 33t-39 22q1 20 16 35.5t35 15.5q21 0 35.5-14.5T440-250Zm40-230Z',
  'Flujo de Trabajo y Diseño':
    'M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-400H160v400Zm140-40-56-56 103-104-104-104 57-56 160 160-160 160Zm180 0v-80h240v80H480Z',
};

const QUOTE_ICON_PATH =
  'm438-338 226-226-57-57-169 169-84-84-57 57 141 141Zm42 258q-139-35-229.5-159.5T160-516v-244l320-120 320 120v244q0 152-90.5 276.5T480-80Zm0-84q104-33 172-132t68-220v-189l-240-90-240 90v189q0 121 68 220t172 132Zm0-316Z';
---

<section
  class="tech-stack animate-fade-in-up animation-delay-200"
  id="tech-stack"
>
  <div class="tech-stack__inner">
    <div class="tech-stack__header">
      <div class="tech-stack__heading">
        <div class="tech-stack__eyebrow">
          <span class="tech-stack__label">Stack Tecnológico</span>
          <span class="tech-stack__label-rule"></span>
        </div>
        <h2 class="tech-stack__title">
          Tecnologías y herramientas
          <span class="tech-stack__title-accent">clave</span>
        </h2>
      </div>
      <p class="tech-stack__subtitle">
        Stack moderno optimizado para velocidad, mantenibilidad y escalabilidad.
      </p>
    </div>
    <div class="tech-stack__grid">
      {groups.map((group) => (
        <div class="tech-stack__category">
          <div class="tech-stack__category-header">
            <svg
              class="tech-stack__category-icon"
              viewBox="0 -960 960 960"
              width="22"
              height="22"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={CATEGORY_ICON_PATHS[group.category]}></path>
            </svg>
            <h3 class="tech-stack__category-title">{group.category}</h3>
          </div>
          <ul class="tech-stack__items">
            {group.items.map((technology) => (
              <li class="tech-stack__item" title={technology.name}>
                <img
                  class="tech-stack__icon"
                  src={technology.iconUrl}
                  alt={technology.name}
                  width="20"
                  height="20"
                  loading="lazy"
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div class="tech-stack__quote">
      <div class="tech-stack__quote-main">
        <svg
          class="tech-stack__quote-icon"
          viewBox="0 -960 960 960"
          width="24"
          height="24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d={QUOTE_ICON_PATH}></path>
        </svg>
        <p class="tech-stack__quote-text">
          “Código limpio, arquitectura escalable y rendimiento sin fricción.”
        </p>
      </div>
      <span class="tech-stack__badge">Filosofía Técnica</span>
    </div>
  </div>
</section>
```

Class contract (tests assert these hooks): `.tech-stack`, `.tech-stack__inner`, `.tech-stack__header`, `.tech-stack__heading`, `.tech-stack__eyebrow`, `.tech-stack__label`, `.tech-stack__label-rule`, `.tech-stack__title`, `.tech-stack__title-accent`, `.tech-stack__subtitle`, `.tech-stack__grid`, `.tech-stack__category`, `.tech-stack__category-header`, `.tech-stack__category-icon`, `.tech-stack__category-title`, `.tech-stack__items`, `.tech-stack__item`, `.tech-stack__icon`, `.tech-stack__quote`, `.tech-stack__quote-main`, `.tech-stack__quote-icon`, `.tech-stack__quote-text`, `.tech-stack__badge`.

Notes:

- The `animate-fade-in-up` / `animation-delay-200` classes come from the mockup (lines 1201) and the global stylesheet; the component defines no `@keyframes`.
- Category titles are upgraded from the mockup's `div`/`span` to `<h3>`, consistent with the projects card titles; the section keeps a single `<h2>`.
- The mockup's Material Symbols ligatures (`layers`, `dns`, `neurology`, `terminal`, `verified_user`) are reproduced as inline SVGs with exact 24px Material Symbols paths (R32, R39), the same technique already used for the projects link icons.
- `alt={technology.name}` makes every chip informative for assistive tech; `title` on the `<li>` keeps the mockup's native tooltip. Icons are 20×20 CSS with `object-fit: contain` so wordmark-shaped assets (e.g. Go) scale cleanly.
- `loading="lazy"` is used for all 26 icons: the section is below the fold and the total payload is under 60 KB.
- No `<script>`, no `client:*`, no inline handlers, no `@keyframes` (R21, R41).

## 8. CSS contract — computed values

All declarations are specified value-by-value in `requirements.md` (R20, R23–R27, R29–R31, R33–R34, R37–R38, R40). The styles live in the component's scoped `<style>` block; no new global CSS.

### Tailwind → CSS translation table

| Mockup utility                                                                                | Computed value / rule                                                                                |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `py-24`, `scroll-mt-24`                                                                       | `6rem`                                                                                               |
| `gap-12`, `gap-6`, `gap-5`, `gap-3`, `gap-2.5`, `gap-2`, `gap-3.5`                            | `3rem`, `1.5rem`, `1.25rem`, `0.75rem`, `0.625rem`, `0.5rem`, `0.875rem`                             |
| `p-6`, `px-3.5 py-1.5`                                                                        | `1.5rem`, `0.375rem 0.875rem`                                                                        |
| `w-10 h-10`, `w-5 h-5`, `text-[22px]`, `text-[24px]`, `max-w-md`                              | `2.5rem`, `20px`, `22px`, `24px`, `28rem`                                                            |
| `tracking-[0.18em]`, `tracking-[0.16em]`, `tracking-tight`                                    | `0.18em`, `0.16em`, `-0.025em`                                                                       |
| `leading-relaxed`                                                                             | `1.625`                                                                                              |
| `backdrop-blur-lg`, `backdrop-blur-md`                                                        | `blur(16px)`, `blur(12px)`                                                                           |
| `rounded-2xl`, `rounded-xl`, `rounded-full`                                                   | `var(--radius-2xl)`, `var(--radius-xl)`, `var(--radius-full)`                                        |
| `bg-white/40`, `bg-white/60`, `bg-white/90`                                                   | `rgba(255, 255, 255, 0.4)`, `rgba(255, 255, 255, 0.6)`, `rgba(255, 255, 255, 0.9)`                   |
| `bg-indigo-500/10`, `bg-primary/10`                                                           | `rgba(99, 102, 241, 0.1)`, `rgba(53, 37, 205, 0.1)`                                                  |
| `border-white/60`, `border-white/80`                                                          | `rgba(255, 255, 255, 0.6)`, `rgba(255, 255, 255, 0.8)`                                               |
| `border-indigo-200/35`, `border-indigo-200/50`, `border-indigo-300/80`                        | `rgba(199, 210, 254, 0.35)`, `rgba(199, 210, 254, 0.5)`, `rgba(165, 180, 252, 0.8)`                  |
| `border-primary/25`, `hover:border-primary/50`                                                | `rgba(53, 37, 205, 0.25)`, `rgba(53, 37, 205, 0.5)`                                                  |
| `shadow-[0_8px_30px_rgba(79,70,229,0.05)]`, `hover:shadow-[0_12px_36px_rgba(79,70,229,0.08)]` | `0 8px 30px rgba(79, 70, 229, 0.05)`, `0 12px 36px rgba(79, 70, 229, 0.08)`                          |
| `shadow-sm`                                                                                   | `0 1px 2px 0 rgba(0, 0, 0, 0.05)`                                                                    |
| `text-slate-600`, `text-slate-800`, `text-slate-900`, `text-primary`                          | `var(--color-slate-600)`, `var(--color-slate-800)`, `var(--color-slate-900)`, `var(--color-primary)` |
| `font-mono`                                                                                   | `var(--font-mono)` (new token, R18)                                                                  |
| `transition-all duration-200` / `duration-300`                                                | `transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1)` / `all 300ms cubic-bezier(0.4, 0, 0.2, 1)`      |
| `sm` / `md` / `lg` breakpoints                                                                | `640px` / `768px` / `1024px`                                                                         |

Conflict resolutions and deviations (documented because the mockup relies on utility-order behaviour):

- **Quote text color:** the mockup lists `text-slate-900 … text-primary`; the computed value is `var(--color-primary)` (the design intent of a tinted, italic serif quote; the same resolution style as the projects section's `glass-card-hover` precedence).
- **Category title and quote text font:** the mockup combines `font-serif` (Tailwind default stack) with the custom `font-headline-sm` utility; the computed value is the project's Newsreader token `var(--font-headline)`, consistent with every heading on the site.
- **Category card hover:** `hover:bg-white/60` is superseded by the mockup's own `glass-card-hover` rule (computed values of R30), the same precedence rule applied to `ProjectCard`.
- **Chips are not interactive:** the mockup marks them `cursor-pointer`, but the data model has no URL and the section ships no interaction, so the computed `cursor` is `default` (informative chips, not controls). Tooltips remain through `title`.
- **List resets:** the chip container is a real `<ul>` (semantics), so the component adds `margin: 0; padding: 0; list-style: none` that the mockup's `<div>` did not need. `global.css` only resets `h1`/`p` margins.

## 9. `src/pages/index.astro`

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import HeroSection from '../components/HeroSection.astro';
import ProjectsSection from '../components/ProjectsSection.astro';
import TechnologiesSection from '../components/TechnologiesSection.astro';

const PAGE_TITLE = '…';
const PAGE_DESCRIPTION = '…';

const projectEntries = await getCollection('projects');
const projects = projectEntries.map((entry) => entry.data);

const technologyEntries = await getCollection('technologies');
const technologies = technologyEntries.map((entry) => entry.data);
---

<BaseLayout title={PAGE_TITLE} description={PAGE_DESCRIPTION}>
  <HeroSection />
  <ProjectsSection projects={projects} />
  <TechnologiesSection technologies={technologies} />
</BaseLayout>
```

The section order matches the mockup (hero → projects → tech stack → about → contact); future increments append below.

## 10. Test strategy

**Fixtures over the content layer (primary).** `tests/technologies-section.test.ts` renders `TechnologiesSection` with a local `createTechnology(overrides)` factory through `experimental_AstroContainer`; the component does not touch `astro:content`, so no mock is needed for component-level renders. `tests/technologies-schema.test.ts` imports `src/content/technologies-schema.ts` directly (it only imports `astro/zod`).

**Content and asset tests without the content layer.** `tests/technologies-content.test.ts` reads the 26 JSON files with `readFileSync` + `JSON.parse` and applies `technologiesSchema` directly; there is no `image()`-style Astro dependency to stub, so no content-layer spike is needed. Icon files are read with `readFileSync(..., 'utf8')` (already shimmed) and the directory with `readdirSync(..., { withFileTypes: true })`. The real glob loader is exercised by `pnpm build` (task 9.4).

**Page-render tests — collection-aware mock.** The home page now issues two `getCollection` calls, so the existing `vi.mock('astro:content')` blocks of `tests/index.test.ts` and `tests/projects-section.test.ts` must branch on the collection name:

```ts
vi.mock('astro:content', async () => {
  const { default: cover } =
    await import('../src/content/projects/covers/synapse.webp');

  const projectEntries = [/* the existing four project fixtures */];
  const technologyEntries = [
    /* technology fixtures for the technologies-section tests (empty in the other files) */
  ];

  return {
    getCollection: async (collection: string) =>
      collection === 'technologies'
        ? technologyEntries.map((data, index) => ({
            id: `technology-${index}`,
            data,
          }))
        : projectEntries.map((data, index) => ({
            id: `project-${index}`,
            data: { coverPath: cover, ...data },
          })),
  };
});
```

`vi.mock` is hoisted, so it is declared before importing `src/pages/index.astro`; fixtures are duplicated per file, matching the existing no-shared-util convention.

**CSS contract.** No CSS engine runs in Vitest, so style tests read `TechnologiesSection.astro` and `src/styles/tokens.css` with `readFileSync` and assert exact declarations using the same whitespace-normalizing `extractRule` / `extractResponsiveRule` / `extractMediaBlock` helper pattern already duplicated in `tests/index.test.ts` and `tests/projects-section.test.ts` (keep the duplication for consistency).

**Fallback if the Container API cannot render a piece.** The schema and content tests are independent of the Container API and stay green. If rendering `TechnologiesSection` or the page fails unexpectedly under Vitest, the affected assertions fall back to source-contract checks (`TechnologiesSection.astro` markup/classes) plus built-output verification in task 9.4: `dist/index.html` must contain `id="tech-stack"`, the four `<h3 class="tech-stack__category-title">` labels, the 26 `<img ... src="/icons/logos/…">` tags (public assets keep their paths in the build) and the quote text. The chosen variant is recorded in `progress/current.md`.

**Direct-page invariant checks.** `tests/index.test.ts` keeps `renders_exactly_one_h1` and `ships_only_clipboard_enhancement`; the latter adds `components/TechnologiesSection.astro` to its scanned page sources so the single-script and no-island/no-handler scans cover the new component.

## 11. Rejected alternatives

| Alternative                                                                                                                                           | Why rejected                                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `file()` loader with a single `technologies.json` array                                                                                               | The `id` key interacts with Astro's entry identification rules, entry order is not needed (the helper computes the order), and the one-file-per-entry model matches the repo's `projects` collection. Glob keeps the four fields purely as validated data. |
| One JSON file per **category** with a nested `items` array                                                                                            | The schema/data shape would stop matching the required four-field entry, and the mockup's category labels would become structural metadata instead of validated data; grouping would no longer be testable as a pure helper.                               |
| Markdown or MDX entries (as in `projects`)                                                                                                            | The user explicitly asked for JSON data managed by a content collection; there is no body to render.                                                                                                                                                       |
| Runtime fetch from the svgl CDN or inline remote URLs                                                                                                 | Violates the zero-external-request policy and the user's "SVG files live in `public/icons/logos/`" requirement; builds would depend on a third party.                                                                                                      |
| Inlining each logo's SVG markup in the JSON data                                                                                                      | The data model is exactly four fields with an `iconUrl`; inlining would bloat the JSON, defeat browser caching and diverge from the user's file layout.                                                                                                    |
| Astro's image pipeline / `src/assets` + `import.meta.glob` for the logos                                                                              | The user asked for files under `public/icons/logos/` referenced by path; SVGs are already optimized and need no transformation, and the image pipeline would add build churn for zero benefit.                                                             |
| A `technologies-loader.ts` module wrapping `getCollection`                                                                                            | Unnecessary indirection: the only consumer is `index.astro` and the established pattern is direct `getCollection` in the page.                                                                                                                             |
| `category` stored as an English slug with a display-label map                                                                                         | Two sources of truth (slug list + label map); the mockup labels are content, and `z.enum(TECHNOLOGY_CATEGORIES)` validates them directly while the constant drives the order.                                                                              |
| Per-entry `order`/`priority` field to control sorting                                                                                                 | Would break the exactly-four-fields requirement; the fixed category constant + alphabetical `name` order is deterministic without extra data.                                                                                                              |
| Material Symbols icon font for category/quote icons                                                                                                   | External request, forbidden since the hero increment; the repo precedent is inline SVGs with exact Material Symbols paths.                                                                                                                                 |
| New dependencies (SVGO, an svgl SDK, an icon component library)                                                                                       | Vendored files need no processing; the repo forbids speculative dependencies.                                                                                                                                                                              |
| Client-side filtering/search or tooltips for the chips                                                                                                | Zero-JS hard rule; there is no interaction in the mockup beyond native tooltips.                                                                                                                                                                           |
| Keeping the mockup's combined labels (`HTML5 / CSS3`, `OpenAI / Claude APIs`, `Git & GitHub`, `AWS / Vercel`, `VS Code / Cursor`, `Prisma / Drizzle`) | Each entry carries exactly one `iconUrl`; one label for two logos is not representable, so the slots are split (or trimmed) and the drops are documented.                                                                                                  |

## 12. Out of scope / future work

- Nav/header, about and contact sections, footer, contact form.
- WebGL shader background.
- i18n; the section copy is Spanish like the rest of the page.
- Outbound links or per-technology pages (the four-field model has no URLs).
- Client-side filtering, search, tooltips or animated counters.
- Dark-mode icon variants and theme switching.
- SVG minification through new tooling; vendored files are used as published by svgl.
- Removing `main > :last-child { margin-bottom: 0 !important; }` behaviour for the contact section (future increment).

## 13. Risks

| Risk                                                                    | Mitigation                                                                                                                                                           |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Upstream svgl files change after vendoring                              | The vendored copies are frozen in `public/`; the source URL and byte size of every file are recorded in §6 so re-vendoring is a deliberate, reviewable content edit. |
| The human disagrees with the proposed seed list (drops/substitution)    | §15 lists every decision; at approval time the tables of R9/R10/R14 and the tests are updated in the same change before implementation starts.                       |
| Existing page tests break because of the second `getCollection` call    | `tests/index.test.ts` and `tests/projects-section.test.ts` mocks become collection-aware (task 8.4/8.5); `tests/technologies-section.test.ts` uses the same pattern. |
| `z.strictObject` or `z.enum(readonly tuple)` unavailable in `astro/zod` | Documented fallbacks: `z.object({...}).strict()` and `z.enum([...TECHNOLOGY_CATEGORIES])`.                                                                           |
| Wordmark-style logos (Go) look small in a 20px chip                     | `object-fit: contain` scales them proportionally; the chip keeps the 40px glass frame from the mockup.                                                               |
| Chosen light-background variants look wrong on a future dark theme      | Dark mode is out of scope; the light variants are the only ones vendored, and adding `_dark` files later is a content-only change.                                   |
| Alphabetical order does not match the human's preferred order           | The order is a single helper + R7; changing it later (e.g. to a curated constant) is a bounded change with tests already pinning the current behaviour.              |
| A duplicate seed UUID or an extra JSON key slips in                     | `astro build` fails through the strict schema and `groupTechnologies`' uniqueness check; tests pin all 26 seeds and the four-key shape.                              |
| `--font-mono` diverges from the mockup on some platforms                | The exact Tailwind default mono stack is pinned in the token and asserted by the token test.                                                                         |
| Static CSS assertions cannot see the rendered visual                    | Values are token-anchored and exact; task 9.5 compares the preview against the mockup (layout, hover, quote bar, chips) and reduced-motion behaviour manually.       |

## 14. Open decisions for the human

1. **Seed list (§5).** Approve the 26 entries, or edit them before implementation. Explicit drops with documented svgl sources: `Prisma`/`Drizzle`, `AWS`, `Cursor`; explicit drops without an available svgl icon: `Pinecone`, `pgvector`, `WebSockets`, `Wasm` (the last two are referenced by project seeds). Split mockup slots: `HTML5`/`CSS3`, `OpenAI`/`Claude API`, `Git`/`GitHub`, `VS Code` (Cursor dropped). Additions: `Go`, `Rust`, `Ollama`. If the list changes, requirements R9/R10/R14 and the test tables change with it.
2. **`--font-mono` token.** Needed by the mockup's badge (`font-mono`); confirm adding it to `src/styles/tokens.css` is acceptable versus falling back to `var(--font-body)` with a letter-spacing tweak.
3. **Ollama substitution.** Confirm `Ollama` as the fourth AI entry (proposed replacement for the icon-less `Pinecone`/`pgvector`/`WebSockets`/`Wasm` items, matching Vanguard CLI's local-model usage); the alternative is a 3-entry AI category (Claude API, OpenAI, LangChain).
4. **Category titles as `<h3>`.** The mockup uses a `div`; the spec upgrades it to a heading for document structure. Confirm this semantic improvement.
5. **Chip tooltip accessibility.** The chips carry both `title` (mouse tooltip, mockup parity) and informative `alt` (assistive tech). If duplicate naming is a concern, the `title` attribute can be dropped before implementation.
