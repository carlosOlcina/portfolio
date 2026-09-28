---
name: astro-modern-practices
description: Use when writing, reviewing or refactoring any Astro code in this repo (pages, layouts, components, content collections, astro.config.mjs, images, fonts, client scripts, Container API tests) or when asked for the latest/recommended Astro way of doing something. Load me before touching Astro APIs: I detect the installed Astro version, query the astro-docs MCP, version-check every API against the installed release, and enforce only stable, non-experimental features plus the repo's zero-JS and SDD conventions.
license: MIT
compatibility: opencode
metadata:
  audience: agents
  category: framework
---

# Astro Modern Practices

## What I do

Keep every Astro change in this repo aligned with the **latest stable APIs of the Astro version actually installed** (6.x at the time of writing), not with the newest Astro release in the wild. I force a documentation lookup through the `astro-docs` MCP before writing framework code, and I reject APIs that are experimental, deprecated, or newer than the installed version.

## When to use me

Load me when a task touches anything Astro-related:

- Creating or editing `src/pages/**/*.astro`, `src/layouts/**`, `src/components/**`
- `astro.config.mjs` (integrations, `image`, `fonts`, `security`, `markdown`, `env`)
- Content collections: files in `src/content/` and config in `src/content.config.ts`
- Images and fonts (`astro:assets`, `<Image />`, `<Picture />`, `<Font />`)
- Client scripts, `<script>`, `<ClientRouter />`
- Environment variables (`astro:env`, `import.meta.env`)
- Tests with the Container API in `tests/**`
- Questions like "what is the latest / recommended way to do X in Astro?"
- Any build or `astro check` error mentioning an `astro:*` module or API

## Ground rules

1. **The installed version is the source of truth.** Never use an API just because the latest docs show it.
2. **The MCP serves the latest docs** (Astro 7.x at the time of writing), while this project is pinned to Astro 6.x. Every snippet must be version-checked before copying.
3. **Stable only.** Do not enable `experimental.*` flags in `astro.config.mjs`. Do not use "preview" behavior. The only sanctioned exception is the Container API (`experimental_AstroContainer`), which `docs/conventions.md` already mandates for tests inside `tests/`.
4. **Never upgrade Astro or add dependencies/integrations on your own.** That requires an explicit user request (see `AGENTS.md` and the dependency rules in the project conventions).
5. **Respect the harness.** Features flagged `"sdd": true` in `feature_list.json` go through the Spec Driven Development flow before implementation; finish with `pnpm validate` green.
6. **Zero-JS by default.** No `client:*` directives or UI framework islands without a real interactivity justification (`docs/architecture.md` §3).

## Workflow

### 1. Detect the installed version

```bash
node -p "require('./node_modules/astro/package.json').version"
```

If the command fails, fall back to `pnpm list astro --depth 0` or the `dependencies` field in `package.json`. Record the version (currently `6.2.1`) and keep it in mind for every API decision.

### 2. Query the astro-docs MCP

Use the `astro-docs_search_astro_docs` tool from the `astro-docs` MCP server. It is configured locally in `opencode.json` and globally in `~/.config/opencode/opencode.jsonc`. If the tool is missing, tell the user the server is not configured instead of guessing APIs.

Query cheatsheet:

| Topic                | Example query                                                        |
| -------------------- | -------------------------------------------------------------------- |
| Content collections  | `content collections glob loader defineCollection schema`            |
| Live data            | `live content collections defineLiveCollection getLiveCollection`     |
| Images               | `responsive images layout srcset sizes image.layout`                 |
| Fonts                | `fonts API fontProviders local Font component cssVariable`           |
| Config               | `configuration reference image security csp env prerender`           |
| Breaking changes     | `upgrade to Astro v6 breaking changes`                               |
| Error messages       | the literal error text, e.g. `content collection is missing a loader` |
| Testing components   | `container API renderToString testing vitest`                        |

### 3. Version-check every API before using it

- Docs entries often carry an `**Added in:** astro@X.Y.Z` marker: the API is usable only if `X.Y.Z <= installed version`.
- If there is no marker, search for `upgrade to Astro v<N>` for each major between the installed version and the latest to see when the behavior changed.
- When latest docs contradict installed behavior and you need the old contract, consult the unmaintained v6 snapshot at `https://v6.docs.astro.build/` (same URL paths as `https://docs.astro.build/`). It is the only versioned fallback; do not trust other mirrors.
- If the version is still unclear, say so, choose the most conservative option, and leave a note in `progress/current.md`.

### 4. Prefer these stable, current APIs (Astro 6)

| Use this                                                                                          | Not this                                                                 |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `src/content.config.ts` with `defineCollection` + `glob()`/`file()` from `astro/loaders` + `z` from `astro/zod` | Legacy `type: 'content'` / `'data'` collections or `src/content/config.ts` |
| `render(entry)` imported from `astro:content`                                                     | `entry.render()` (removed)                                               |
| `<ClientRouter />` from `astro:transitions`                                                       | `<ViewTransitions />` (renamed in v5)                                    |
| `<Image />` / `<Picture />` from `astro:assets`, `layout` prop for responsive `srcset`/`sizes`    | Unoptimized `<img>` for local assets                                     |
| Fonts API: `fonts: [...]` in `astro.config.mjs` + `<Font cssVariable="..." />` from `astro:assets` | Manual `@font-face` + third-party font `<link>`s                        |
| `astro:env` for environment variables                                                             | Raw `process.env` / untyped `import.meta.env`                            |
| `security.csp` for Content Security Policy (stable in v6)                                        | `experimental.csp`                                                       |
| Typed `Props` interfaces; `astro/tsconfigs/strict` (already configured)                           | `any`, implicit props, missing `include: [".astro/types.d.ts", "**/*"]`  |
| `experimental_AstroContainer` from `astro/container` inside `tests/`                              | Container usage in application code                                      |

Version-specific gotchas to remember for v6:

- `import.meta.env` values are always inlined and never coerced; compare strings explicitly.
- Markdown heading IDs keep trailing hyphens (e.g. `#picture-` if you link headings manually).
- Endpoints with a file extension are never served with a trailing slash.
- Live content collections and sessions require on-demand rendering/an adapter: not applicable to this fully static site unless the user explicitly asks.
- Responsive image styles are emitted as `data-*` attributes/classes, not inline styles.

### 5. Verify with the repo gate

```bash
pnpm check    # astro check: types + .astro diagnostics
pnpm test     # Vitest + Container API
pnpm validate # lint + check + test + build — required before declaring done
```

## Self-check before finishing

- [ ] Every new Astro API appeared in the MCP results and its `Added in` version is `<=` the installed version.
- [ ] No experimental flags added; no v7-only APIs copied from latest docs.
- [ ] No new dependency, integration or Astro upgrade introduced without explicit user request.
- [ ] No new `client:*` island without justification.
- [ ] `pnpm validate` finishes green.
