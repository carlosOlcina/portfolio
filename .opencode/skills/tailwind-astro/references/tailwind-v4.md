# Tailwind v4 quick reference (verified against v4.3.3)

## Directives

| Directive                | Purpose                                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| `@import "tailwindcss";` | Single entry point (replaces v3's `@tailwind base/components/utilities`)                                  |
| `@theme { ... }`         | Defines design tokens that generate utilities (e.g. `--color-brand-500` → `bg-brand-500`)                 |
| `@source`                | Adds sources that automatic detection misses (e.g. `@source "../node_modules/ui-lib";`)                   |
| `@utility`               | Creates a custom utility that works with variants (`hover:`, `lg:`)                                       |
| `@variant`               | Applies a variant inside CSS                                                                              |
| `@custom-variant`        | Defines a new variant                                                                                     |
| `@apply`                 | Inlines utilities inside CSS                                                                              |
| `@reference`             | Imports the Tailwind context (tokens/utilities/variants) into isolated CSS: scoped `<style>`, CSS modules |

- Use `:root` for CSS variables that must NOT generate utilities; use `@theme` when you want the utility.
- `tailwind.config.js` and `@config` are legacy compatibility only. In v4 the theme lives in CSS; do not create a new config file.
- Ecosystem plugins load with `@plugin` (e.g. `@plugin '@tailwindcss/typography';`).

## Most used `@theme` namespaces

| Namespace                              | Example                                       |
| -------------------------------------- | --------------------------------------------- |
| `--color-*`                            | `--color-brand-500: oklch(0.53 0.12 118.34);` |
| `--font-*`                             | `--font-sans`, `--font-display`               |
| `--text-*`                             | Text sizes                                    |
| `--spacing-*`                          | Base spacing scale (`--spacing: 0.25rem`)     |
| `--breakpoint-*`                       | `--breakpoint-3xl: 120rem;` → `3xl:` variant  |
| `--radius-*`, `--shadow-*`, `--ease-*` | Radii, shadows, easings                       |

## Dark mode

By default `dark:` follows `prefers-color-scheme`. For a class-based strategy:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

## What is new in v4.1 through v4.3

- **v4.1**: `text-shadow-*` and mask utilities (`mask-*`).
- **v4.2**: `mauve`, `olive`, `mist`, and `taupe` palettes; logical property utilities (`pbs-*`, `pbe-*`, `mbs-*`, `mbe-*`, `inline-*`, `block-*`); `font-features-*`.
- **v4.3**: `scrollbar-*` (width, thumb, track, gutter), `@container-size`, `zoom-*`, `tab-*`, stacked and compound `@variant` in CSS, default values for functional `@utility` definitions.

## v3 → v4 changes that usually break

| v3                               | v4                                  |
| -------------------------------- | ----------------------------------- |
| `shadow-sm` / `shadow`           | `shadow-xs` / `shadow-sm`           |
| `drop-shadow-sm` / `drop-shadow` | `drop-shadow-xs` / `drop-shadow-sm` |
| `rounded-sm` / `rounded`         | `rounded-xs` / `rounded-sm`         |
| `blur-sm` / `blur`               | `blur-xs` / `blur-sm`               |
| `outline-none`                   | `outline-hidden`                    |
| `ring`                           | `ring-3`                            |

Other changes: `hover:` only applies on devices that support hover (`@media (hover: hover)`); stacked variants evaluate left to right; every theme token is available as a CSS variable.

## Astro gotchas

- **Cascade layers**: Tailwind CSS lives in layers, so it has lower priority than unlayered CSS. Astro's default responsive styles for `<Image>`/`<Picture>` win over utilities; if you need the opposite, review `image.responsiveStyles` in the Astro config.
- **Custom fonts**: register them with `@theme inline { --font-sans: var(--font-roboto); }` after configuring the font in Astro.
- **Class detection**: automatic and respects `.gitignore`. Use `@source` only for what falls outside (for example, a library in `node_modules`).
- **Scoped `<style>`**: any `@apply` or `theme()` needs `@reference` pointing at the global stylesheet.
- **Content collections Markdown**: the documented pattern is `@plugin '@tailwindcss/typography';` plus wrapping the content in a container with `prose`.

## Official sources

- Tailwind: `functions-and-directives`, `theme`, `adding-custom-styles`, v4 upgrade guide, v4.1/v4.2/v4.3 blog posts.
- Astro: `guides/styling` (Tailwind), `guides/images`, `guides/fonts`, `recipes/tailwind-rendered-markdown`.
