---
name: react-astro-islands
description: 'Use when adding, writing, or reviewing React components in this Astro portfolio, or when deciding whether an interactive island is justified. Covers @astrojs/react setup on Astro 6, hydration directives (client:load, client:idle, client:visible, client:media, client:only), serializable props, nesting and slot rules, Container API renderer testing, and the repo zero-JS guardrails. Do not use it for static UI that plain .astro components can render, and never add React or client-side JavaScript without an explicit user request and a real interactivity justification.'
license: MIT
compatibility: opencode
metadata:
  audience: agents
  category: frontend
---

# React islands in Astro

## What I do

Guide React usage inside this Astro 6 portfolio following the islands
architecture: static HTML by default, hydration only where real interactivity
is needed. I cover setup, hydration strategy, the Astro ↔ React boundary, and
how to test React output with the Container API.

## When to use me

- The user asks to add React or `@astrojs/react` to the project.
- Writing or editing `.jsx` / `.tsx` components.
- Choosing or validating a `client:*` directive.
- Deciding whether something should be an island at all.
- Testing components whose output includes React.

## When NOT to use me

- Static UI: plain `.astro` components render zero-JS HTML (see `docs/architecture.md` §3).
- Aesthetics only: styling does not justify React; use Astro components (and see the Tailwind skill if Tailwind is in play).
- Adding React to the repo: that is a dependency change and needs explicit user approval plus the normal feature flow. It may deserve a spec (`"sdd": true`).

## Version alignment (verified)

- This repo runs Astro `6.2.1`. React integrations are versioned per Astro line: `@astrojs/react@7.x` is the Astro 7 line (Oxc compiler, `@vitejs/plugin-react` v6), while the Astro 6 line is `@astrojs/react@6.x` (6.0.6 at the time of writing, React 17/18/19 peers, Node >= 22.12).
- Before installing, check what the tool resolves and prefer the major that matches Astro 6. If a peer warning appears, pin `@astrojs/react@^6` and re-run the install.
- React itself is currently `19.3.0`; `react`, `react-dom`, and `@types/*` are all peers of the integration.

## Setup

1. `pnpm astro add react`: installs `@astrojs/react` plus `react`, `react-dom`, and their types, adds `react()` to `astro.config.mjs`, and sets `jsx: react-jsx` + `jsxImportSource: react` in `tsconfig.json`.
2. Framework files must use `.jsx` or `.tsx` extensions.
3. Verify with `pnpm validate` and a quick `pnpm dev` smoke test.

## Hydration directives (choose the lowest priority that works)

| Directive             | Use when                                 | Notes                                                                            |
| --------------------- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| none                  | Output is static                         | Renders to HTML with zero JS. If it needs no interactivity, prefer `.astro`      |
| `client:load`         | Immediately visible and interactive ASAP | Highest priority                                                                 |
| `client:idle`         | Lower priority                           | Fires on `requestIdleCallback`; supports `client:idle={{ timeout: 500 }}`        |
| `client:visible`      | Below the fold or heavy                  | Uses `IntersectionObserver`; supports `client:visible={{ rootMargin: '200px' }}` |
| `client:media="..."`  | Only needed at some breakpoints          | E.g. sidebar toggles                                                             |
| `client:only="react"` | Cannot render on the server              | Skips SSR; the `"react"` hint is required; supports `slot="fallback"`            |

Rules:

- A client directive only works on a framework component directly imported into a `.astro` file. It does not work on dynamic tags or components passed through MDX's `components` prop.
- Components without a directive still render static HTML; shared framework runtime is sent once per page.
- Choose the directive so accessibility-related JavaScript runs when needed (for example, do not hide a focus-managing dialog behind `client:visible` if it can be opened from the top of the page).
- The island must be valid React only: never import `.astro` components inside `.jsx`/`.tsx`. Pass Astro-rendered static content as children or named slots instead (named slots become top-level props; kebab-case becomes camelCase).
- If a React library needs multiple React nodes as children, `experimentalReactChildren: true` switches children to real React vDOM at some runtime cost; enable it only with justification.

## Props and state

- Props passed to hydrated islands must be serializable: plain object, `number`, `string`, `Array`, `Map`, `Set`, `RegExp`, `Date`, `BigInt`, `URL`, `Uint8Array`, `Uint16Array`, `Uint32Array`, `Infinity`.
- Functions cannot be hydrated: keep event handlers inside the island. React "render props" from Astro do not work either.
- Keep islands small and self-contained; local state first. Do not add a state library without a real need and user approval.

## Testing (Vitest + Container API)

React output needs the integration renderers. Under Vite/Vitest, `loadRenderers`
from the `astro:container` virtual module is the documented path:

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer as reactContainerRenderer } from '@astrojs/react/container-renderer';
import { describe, expect, it } from 'vitest';
import IslandWrapper from '../src/components/IslandWrapper.astro';

const renderers = await loadRenderers([reactContainerRenderer()]);

describe('island', () => {
  it('renders its server HTML', async () => {
    const container = await AstroContainer.create({ renderers });
    const html = await container.renderToString(IslandWrapper);

    expect(html).toContain('expected text');
  });
});
```

- `renderToString` verifies the server-rendered HTML, not hydration. Interactivity needs a browser check (`pnpm build && pnpm preview`).
- Outside Vite (runtime shells), add renderers manually with `addServerRenderer`/`addClientRenderer` using `@astrojs/react/server.js` and `@astrojs/react/client.js`.
- Version-check these entrypoints against the installed integration before relying on them.

## Verification

- `pnpm validate` (includes `astro check`, which type-checks `.tsx` through the integration).
- `rg -n 'client:(load|idle|visible|media|only)' src` to audit every hydration point; each one needs a justification.
- `pnpm build && pnpm preview`: confirm islands hydrate only where expected and that static components ship no JavaScript.
- A Container API test may assert the island's server HTML, but hydration itself is a manual/browser check.

## References

- Astro docs: `concepts/islands`, `guides/framework-components`, `reference/directives-reference` (client directives), `reference/container-reference`.
- Load the `astro-modern-practices` skill before touching Astro APIs, and version-check everything against Astro 6.2.1.
