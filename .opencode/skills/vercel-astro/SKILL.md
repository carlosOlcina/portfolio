---
name: vercel-astro
description: 'Use when deploying this Astro portfolio to Vercel, configuring the @astrojs/vercel adapter, or reviewing vercel.json and deployment settings. Covers static deploys without an adapter, when the adapter is actually needed (Vercel Image Optimization, Web Analytics, ISR, server islands, actions, sessions), the Astro 6 compatible version line, CLI vs Git deployments, preview deployments, and repo guardrails. Do not add the adapter, change the output mode, or introduce dependencies without explicit user approval.'
license: MIT
compatibility: opencode
metadata:
  audience: agents
  category: deployment
---

# Vercel deployment for this portfolio

## What I do

Guide deployments of this Astro 6 portfolio to Vercel: the zero-config static
path, when the `@astrojs/vercel` adapter is actually worth adding, how to
version-match it against the installed Astro, and how to verify a deploy
without breaking the project's static, zero-backend architecture.

## When to use me

- Deploying the site to Vercel through the dashboard or the `vercel` CLI.
- Configuring or reviewing `@astrojs/vercel` in `astro.config.mjs`.
- Reviewing `vercel.json`, response headers, or caching.
- Debugging a Vercel build or deploy for this repo.
- The user asks whether the adapter is needed at all.

## When NOT to use me

- Platform-agnostic build issues: fix those with the normal `pnpm validate` flow first.
- Adding on-demand rendering (`output: 'server'`) just to use an adapter: this is a static portfolio; that needs a real requirement and explicit user approval.
- Any task that requires new dependencies or analytics scripts without the user asking for them.

## Ground rules

1. A static site needs NO adapter. Vercel auto-detects Astro and builds it as-is.
2. The adapter is only for on-demand features (server islands, actions, sessions, ISR) or Vercel services (Image Optimization, Web Analytics).
3. Version alignment (verified): `@astrojs/vercel@11` declares `astro ^7`; this repo runs Astro `6.2.1`, so the compatible line is `@astrojs/vercel@10` (10.0.8 latest, peer `astro ^6.0.0`). Check with `pnpm view @astrojs/vercel@<major> peerDependencies` before installing and never accept an incompatible major silently.
4. Adding the adapter or switching output mode is a dependency/architecture change: explicit user approval plus the normal feature flow (`AGENTS.md`).
5. `package.json` declares Node `>=22.12.0`; keep it aligned with the Node version configured in Vercel.

## Deploying the current static site

Git flow: push the branch, import the project at `vercel.com/new`, let Vercel detect Astro, and accept the defaults. Later pushes create preview deployments; the production branch (`main`) creates production deployments.

CLI flow:

```bash
pnpm add -g vercel
vercel            # accept the detected settings
```

Or, to reproduce the Vercel pipeline locally:

```bash
pnpm build
vercel deploy --prebuilt
```

No environment variables are required for a static build. There is no backend, database, or API route in this project.

## Adding the adapter (only when needed)

```bash
pnpm astro add vercel     # or pin the Astro-6-compatible major explicitly
pnpm add @astrojs/vercel@^10
```

```js
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  adapter: vercel(),
});
```

Options that matter for a portfolio:

| Option          | Purpose and caveats                                                                                                                |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `imageService`  | Use Vercel Image Optimization in production (`/_vercel/image?url=...`); dev keeps `devImageService` (default `sharp`)              |
| `imagesConfig`  | Sizes/domains/remotePatterns for the Vercel image API; `domains` and `remotePatterns` are auto-filled from Astro's `image` config  |
| `webAnalytics`  | Only for `@vercel/analytics@1.3.x` or earlier; with 1.4+ use Vercel's Analytics component instead                                  |
| `isr`           | Incremental Static Regeneration (`expiration`, `bypassToken`, `exclude`); an on-demand feature, not needed for a fully static site |
| `staticHeaders` | Serverless only (adapter v10+): emit static headers (e.g. CSP) into `vercel.json` instead of a `<meta>` tag                        |

Notes:

- With `imageService: true`, `<Image>` output becomes `/_vercel/image?...` in production; verify image URLs after enabling.
- `vercel.json` remains the place for custom headers and redirects; it is optional.

## Verification

1. `pnpm validate` (lint + check + tests + build) before deploying.
2. `pnpm preview` for a local smoke test of the built output.
3. If the adapter is in play, `vercel build` or `vercel deploy --prebuilt` reproduces Vercel's pipeline locally.
4. On Vercel: check the preview deployment for the branch, the production deployment on `main`, the build logs, and `/_vercel/image?...` URLs when `imageService` is enabled.
5. Do not report a deployment as done without a successful build; if the repo flow requires a preview, share its URL.

## References

- Astro docs: `guides/deploy/vercel`, `guides/integrations-guide/vercel`.
- Vercel docs: project configuration (`vercel.json`), Git integration, preview deployments.
- Load the `astro-modern-practices` skill to version-check Astro APIs against the installed release.
