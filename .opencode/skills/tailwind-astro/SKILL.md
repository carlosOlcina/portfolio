---
name: tailwind-astro
description: 'Use only when the user explicitly asks to add, configure, or use Tailwind CSS in this Astro portfolio, or when editing files that already integrate it (src/styles/global.css or the @tailwindcss/vite plugin in astro.config.mjs). Covers Tailwind v4 CSS-first on Astro 6: @theme tokens, responsive/dark/container variants, class:list, and this repo guardrails. Do not use it for general styling: the repo currently uses scoped <style> blocks and has no Tailwind installed.'
license: MIT
compatibility: opencode
metadata:
  audience: agents
  category: styling
---

# Tailwind CSS in this portfolio (Astro 6 + Tailwind v4)

## What I do

Guide the installation, configuration, and use of Tailwind CSS v4 (CSS-first)
inside this Astro project. This is not a generic guide: it pins the repo's
concrete decisions (pnpm, zero-JS, Prettier, harness docs) and the guardrails
that keep the current styling standard intact.

## When to use me

- The user asks to "add Tailwind", "style with Tailwind", or "use utility classes".
- Something must be configured or reviewed in `src/styles/global.css`, `@theme` blocks, or the `@tailwindcss/vite` plugin in `astro.config.mjs`.
- Tailwind classes are being written or reviewed in `.astro` components.
- The project already has `src/styles/global.css` with `@import "tailwindcss";`.

## When NOT to use me

- General styling without Tailwind: the current repo standard is scoped `<style>` blocks in `.astro` plus globals in `src/styles/` (see `docs/conventions.md`).
- Do not add the `tailwindcss` dependency or use Tailwind classes unless the user asked for it.
- Do not mix both standards (scoped styles + utilities) in the same component.

## Verified repo state

- Astro `^6.2`, strict TypeScript, pnpm; `pnpm validate` is the closing gate.
- There is NO Tailwind in `package.json`, no `src/styles/`, and no `src/layouts/`.
- Prettier uses `singleQuote` and `prettier-plugin-astro`; there is NO `prettier-plugin-tailwindcss` (do not add it without explicit approval).
- Adopting Tailwind changes the styling standard: update `docs/conventions.md` and `docs/architecture.md` in the same feature, with human approval. A new feature may require a spec (`"sdd": true`).

## Installation (Astro 6 + Tailwind v4)

1. Run `pnpm astro add tailwind`. The CLI installs `@tailwindcss/vite`, adds the plugin to `astro.config.mjs`, and creates `src/styles/global.css` with `@import "tailwindcss";`. In non-interactive environments, check `pnpm astro add --help` for the confirmation flag.
2. Import the global stylesheet exactly once, in the base layout (`src/layouts/BaseLayout.astro` once it exists):

   ```astro
   ---
   import '../styles/global.css';
   ---
   ```

3. Do not install `@astrojs/tailwind`: that is the legacy Tailwind 3 integration. Tailwind 4 is integrated through the Vite plugin.
4. Verify with `pnpm validate` and confirm the generated CSS lands in `dist/_astro/` after `pnpm build`.

## Usage rules

1. Utility-first in markup. Before reaching for `@apply`, extract an `.astro` component; `@apply` is a last resort that needs justification.
2. `@apply` or `theme()` inside a scoped `<style>` block requires `@reference`, because scoped blocks compile in isolation:

   ```astro
   <style>
     @reference '../styles/global.css';

     .card {
       @apply rounded-lg border p-4;
     }
   </style>
   ```

3. Conditional classes use Astro's `class:list` directive; never concatenate strings:

   ```astro
   <div
     class:list={[
       'flex items-center gap-2',
       isActive && 'bg-brand-500',
       className,
     ]}
   />
   ```

4. Never build class names dynamically: `bg-${color}-500` does not exist for Tailwind. Use a map of complete class names.
5. Tokens before arbitrary values: define them in `@theme` (`--color-brand-500`) and use the utility (`bg-brand-500`). Reserve `[...]` for real exceptions.
6. Mobile-first (`sm:`, `md:`, `lg:`). Dark mode uses `dark:`, which follows `prefers-color-scheme` by default; for a manual toggle define `@custom-variant dark` (see the reference).
7. Zero-JS: Tailwind is build-time CSS and adds no JavaScript. Do not add client JS for something CSS can solve.
8. Accessibility: keep semantic HTML, `focus-visible`, sufficient contrast, and `sr-only` where needed.
9. Stable class order: layout → spacing → typography → color → state. No automatic sorter is configured.
10. Do not use Tailwind 3 scale utilities (`shadow`, `rounded`, `ring`, and `outline-none` changed in v4; full table in the reference).

## Base pattern

```astro
---
interface Props {
  title: string;
}

const { title } = Astro.props;
---

<section class="mx-auto max-w-2xl px-4 py-12">
  <h1 class="text-balance text-3xl font-bold tracking-tight">{title}</h1>
</section>
```

## Verification

- `pnpm validate` before closing (lint + check + tests + build).
- A misspelled class does NOT break the build: it simply generates no CSS. Inspect the resulting HTML/CSS when something "is not applied".
- If a Container API test checks markup, it can assert the rendered classes.

## Common issues

| Symptom                     | Cause                                   | Fix                                |
| --------------------------- | --------------------------------------- | ---------------------------------- |
| Class is not applied        | Dynamic name or typo                    | Complete literal class or a map    |
| `@apply` fails in `<style>` | Missing `@reference`                    | Add `@reference` to the global CSS |
| Unexpected scale            | Utility renamed in v4                   | Check the v3 → v4 table            |
| `<Image>` ignores classes   | Tailwind cascade layers vs Astro styles | See the gotcha in the reference    |

## Resources

- `references/tailwind-v4.md`: directives, `@theme` namespaces, dark mode, v4.1–v4.3 changes, and Astro-specific gotchas.
