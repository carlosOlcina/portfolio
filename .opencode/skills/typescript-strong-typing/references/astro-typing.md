# Astro 6 typing patterns

Examples based on the official docs (`guides/typescript`,
`guides/content-collections`, `reference/modules/astro-content`).

## Component props

```astro
---
interface Props {
  title: string;
  description?: string;
}
const { title, description = 'Default description' } = Astro.props;
---
```

- Component with no props or slots: `type Props = Record<string, never>;`
- Do not copy `children: any` examples from the docs; in this repo `any` is an error. If the slot is required, validate at runtime with `Astro.slots.has('default')`.

## Extending HTML attributes

```astro
---
import type { HTMLAttributes } from 'astro/types';

interface Props extends HTMLAttributes<'a'> {
  external?: boolean;
}

const { external = false, href, ...attrs } = Astro.props;
---

<a
  href={href}
  target={external ? '_blank' : undefined}
  rel={external ? 'noopener noreferrer' : undefined}
  {...attrs}
>
  <slot />
</a>
```

## Wrapping an existing component

```astro
---
import type { ComponentProps } from 'astro/types';
import Button from './Button.astro';

type Props = ComponentProps<typeof Button>;
---

<Button {...Astro.props} />
```

## Polymorphic component (only if truly needed)

```astro
---
import type { HTMLTag, Polymorphic } from 'astro/types';

type Props<Tag extends HTMLTag> = Polymorphic<{ as: Tag }>;
const { as: Tag, ...props } = Astro.props;
---

<Tag {...props} />
```

## Dynamic routes with `getStaticPaths`

```astro
---
import type {
  GetStaticPaths,
  InferGetStaticParamsType,
  InferGetStaticPropsType,
} from 'astro';
import { getCollection } from 'astro:content';

export const getStaticPaths = (async () => {
  const posts = await getCollection('blog');

  return posts.map((post) => ({
    params: { slug: post.id },
    props: { title: post.data.title, draft: post.data.draft },
  }));
}) satisfies GetStaticPaths;

type Params = InferGetStaticParamsType<typeof getStaticPaths>;
type Props = InferGetStaticPropsType<typeof getStaticPaths>;
---
```

`Astro.params` and `Astro.props` are typed from `getStaticPaths`, with no
hand-written duplicate interfaces.

## Content collections (Zod schema)

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
  }),
});

export const collections = { blog };
```

- An entry type comes from `CollectionEntry<'blog'>` instead of repeating the schema:

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  post: CollectionEntry<'blog'>;
}

const { post } = Astro.props;
---
```

- If you keep a schema in its own constant, derive the type with `z.infer<typeof schema>`.
- Validation fails explicitly at build time (aligned with `docs/conventions.md`).

## Tests with the Astro Container API

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Index from '../src/pages/index.astro';

describe('index page', () => {
  it('renders the main heading', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Index);

    expect(html).toMatch(/<h1[^>]*>Astro<\/h1>/);
  });
});
```

## Configuration notes

- `verbatimModuleSyntax: true` (Astro preset): every type import goes through `import type`.
- `.astro` files are not checked by `tsc`; use `pnpm check` (`astro check`), which covers both `.astro` and `.ts`.
- Explicit error handling, no `console.log` for errors (see `docs/architecture.md`).
