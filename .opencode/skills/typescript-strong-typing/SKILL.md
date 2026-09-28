---
name: typescript-strong-typing
description: 'Use when writing, reviewing, or fixing TypeScript in this Astro portfolio: .ts files, .astro frontmatter and Props, content collection schemas, utilities, and tests. Enforces the repo rule of never using any (it is an ESLint error), using unknown plus narrowing at boundaries, and explicit, strong but simple and readable types with no type gymnastics. Also load it when pnpm check or pnpm lint fail on types.'
license: MIT
compatibility: opencode
metadata:
  audience: agents
  category: typescript
---

# Strong, simple typing (TypeScript 5.9 + Astro 6)

## What I do

Apply this repo's typing standard: strong, explicit, and boring. The rule is
"strong but not weird": if a type needs a paragraph to explain itself or makes
the editor struggle, simplify it. Errors must surface in `pnpm check`, never
for the user in production.

## When to use me

- Writing or editing `.ts` files and `.astro` frontmatter.
- Defining `interface Props` or wrapping existing components.
- Modeling content collection data or validating external data at build time.
- Fixing `pnpm check` or ESLint errors (`no-explicit-any`).
- Writing tests with Vitest and the Astro Container API.

## Hard rules (verified in this repo)

| Rule                                      | Source                                                         |
| ----------------------------------------- | -------------------------------------------------------------- |
| `any` is forbidden                        | `@typescript-eslint/no-explicit-any` = error (severity 2)      |
| `import type` for every type-only import  | `verbatimModuleSyntax: true` in the Astro preset               |
| `strict: true`                            | `tsconfig.json` extends `astro/tsconfigs/strict`               |
| Explicit types on public APIs and `Props` | `docs/conventions.md`                                          |
| `pnpm check` is the type gate             | `astro build` transpiles with esbuild and does NOT check types |
| Unused variables are errors               | `@typescript-eslint/no-unused-vars` = error (severity 2)       |

Notes:

- `astro/tsconfigs/strict` does NOT enable `noUncheckedIndexedAccess` or `exactOptionalPropertyTypes`. `astro/tsconfigs/strictest` exists as future hardening: that is a team decision, do not change it on your own.
- Do not touch `tsconfig.json` or `eslint.config.js` to "fix" a type error.

## Recipes

### 1. Boundaries: `unknown` + narrowing

```ts
try {
  await build();
} catch (error: unknown) {
  const message =
    error instanceof Error ? error.message : 'Unknown build error';
  throw new Error(message);
}
```

`JSON.parse`, `fetch`, and any external data enter as `unknown` and are
validated before use.

### 2. Explicit public APIs, inferred locals

```ts
export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}

const total = posts.length + drafts.length; // inferred, do not annotate
```

### 3. `interface` for shapes, `type` for unions

```ts
interface Props {
  title: string;
  description?: string;
}

type PostStatus = 'draft' | 'published';
```

### 4. Literal unions and `as const satisfies`, not `enum`

```ts
const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
] as const satisfies ReadonlyArray<{ label: string; href: string }>;
```

### 5. Discriminated unions for states

```ts
type Result =
  | { status: 'ok'; posts: Post[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };
```

### 6. `satisfies` to check without widening

```ts
export const getStaticPaths = (async () => {
  // ...
}) satisfies GetStaticPaths;
```

### 7. Astro and content collections

- `interface Props` in every component; defaults when destructuring `Astro.props`.
- Official type utilities (`HTMLAttributes`, `ComponentProps`, `InferGetStaticPropsType`, etc.): see `references/astro-typing.md`.
- Collections: `src/content.config.ts` with `defineCollection`, `z` from `astro/zod`, and loaders from `astro/loaders`. An entry type comes from `CollectionEntry<'blog'>`.

### 8. Generics only when they remove real duplication, with a simple constraint

```ts
function byId<T extends { id: string }>(
  items: readonly T[],
  id: string,
): T | undefined {
  return items.find((item) => item.id === id);
}
```

## "Weird" types you must NOT write

- `as` to silence errors; double casts (`as unknown as X`) are forbidden.
- `!` (non-null assertion) as a habit. Validate or narrow instead.
- Nested conditionals, template literal types, recursive types, multiple overloads: if you need them, the data model is probably wrong.
- `{}`, `Object`, or `Function` as types. Use `unknown`, `object`, or concrete signatures.
- Unconstrained generics or generics used only once.
- Over-annotating the obvious (`const name: string = 'x';`).
- `enum` for closed sets: prefer a literal union + `as const`.
- Decorative `readonly`; use it only when the data is genuinely shared.

## Decision table

| Situation       | Simple                          | Weird                  |
| --------------- | ------------------------------- | ---------------------- |
| External value  | `unknown` + guard               | `any` or `as`          |
| Closed set      | `type X = 'a' \| 'b'`           | `enum` or conditionals |
| Constant config | `as const satisfies ...`        | `as Config`            |
| Local variable  | inference                       | redundant annotation   |
| Multiple shapes | discriminated union             | crossed boolean flags  |
| Indexed access  | check `undefined` when relevant | assume it exists       |

## Verification

1. `pnpm check` (`astro check`) must pass with no errors.
2. `pnpm lint` must not report `no-explicit-any` or `no-unused-vars`.
3. Quick audit for accidental `any`: `rg -n ':\s*any\b|as any\b|<any>' src tests`.
4. Close with `pnpm validate` (lint + check + tests + build).

Tests follow these rules too: no `any` in `tests/`.
