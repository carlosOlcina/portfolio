# Historial de sesiones

> Bitácora append-only. Cada sesión cerrada añade su resumen al final.

## 2026-09-27 — Arnés de agentes y tooling base

- Se instalaron y configuraron ESLint, Prettier, Vitest, `astro check` y TypeScript (5.x por compatibilidad de peers).
- `package.json` expone `pnpm lint`, `pnpm check`, `pnpm test`, `pnpm build`, `pnpm format` y `pnpm validate`.
- Smoke test del index con Astro Container API en `tests/index.test.ts`.
- Arquitectura de agentes en `.opencode/agents/` adaptada desde lifup, sin Nx: leader, spec_author, implementer, reviewer, commiter, secure-auditer y skill-generator.
- Arnés SDD creado: `AGENTS.md`, `opencode.json`, `feature_list.json`, `docs/`, `progress/`, `specs/` y `CHECKPOINTS.md`.
- `pnpm validate` verde: lint + check + test + build.
