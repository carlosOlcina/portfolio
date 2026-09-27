# portfolio

Personal portfolio site built with [Astro](https://astro.build) 6 and strict TypeScript, managed with pnpm.

## Commands

All commands are run from the root of the project:

| Command         | Action                                              |
| :-------------- | :-------------------------------------------------- |
| `pnpm install`  | Installs dependencies                               |
| `pnpm dev`      | Starts local dev server at `localhost:4321`         |
| `pnpm build`    | Builds the production site to `./dist/`             |
| `pnpm preview`  | Previews the production build locally               |
| `pnpm lint`     | Runs ESLint                                         |
| `pnpm check`    | Runs `astro check` (types and `.astro` diagnostics) |
| `pnpm test`     | Runs Vitest                                         |
| `pnpm format`   | Formats the repo with Prettier                      |
| `pnpm validate` | Closing gate: lint + check + test + build           |

## Project structure

```text
/
├── public/             # Static assets served as-is
├── specs/              # Kiro-style specs per feature (SDD)
├── src/
│   ├── pages/          # File-based routes
│   ├── layouts/        # Reusable page shells
│   ├── components/     # Reusable .astro components
│   ├── content/        # Content collections (Markdown/MDX + schema)
│   ├── styles/         # Global styles
│   └── assets/         # Images and assets processed by Astro
├── tests/              # Vitest tests (Astro Container API)
├── docs/               # Architecture, conventions, specs and verification
├── progress/           # Session log (current.md + history.md)
├── AGENTS.md           # Entry point for agents (SDD workflow)
└── CHECKPOINTS.md      # Objective "final state" criteria
```

## Agent harness

This repository follows Spec Driven Development with OpenCode agents
(`leader`, `spec_author`, `implementer`, `reviewer`, `commiter`,
`secure-auditer`, `skill-generator`). Read `AGENTS.md` first.
