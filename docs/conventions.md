# Convenciones de código

> Homogeneidad extrema. La IA predice mejor cuando el repositorio se parece
> a sí mismo en todas partes.

## TypeScript / Astro

- **Versión:** TypeScript 5.x, ES2022+.
- **Formato:** Prettier con config del proyecto (`singleQuote`, plugin
  `prettier-plugin-astro`).
- **Lint:** ESLint flat config con `typescript-eslint` y
  `eslint-plugin-astro`.
- **Tipado:** explícito en funciones públicas y en las `Props` de cada
  componente. No usar `any`.

## Nombres

| Tipo        | Convención           | Ejemplo                               |
| ----------- | -------------------- | ------------------------------------- |
| Páginas     | kebab-case           | `index.astro`, `blog/[...slug].astro` |
| Layouts     | PascalCase           | `BaseLayout.astro`                    |
| Componentes | PascalCase           | `SiteHeader.astro`                    |
| Tests       | `*.test.ts`          | `index.test.ts`                       |
| Constantes  | SCREAMING_SNAKE_CASE | `SITE_TITLE`                          |

## Estructura de archivo

Páginas y componentes `.astro` empiezan por el bloque de frontmatter:

```astro
---
interface Props {
  title: string;
}

const { title } = Astro.props;
---

<section>
  <h2>{title}</h2>
</section>
```

- Los estilos van en `<style>` (scoped por defecto) salvo estilos globales en
  `src/styles/`.
- Los imports relativos se ordenan después de los imports de paquetes.

## Tests

- Un archivo de test por unidad relevante, en `tests/`.
- Usa `experimental_AstroContainer` de `astro/container` para páginas y
  componentes; Vitest puro para lógica.
- Nombres descriptivos: `renders_home_heading`.
- Tests unitarios por defecto; de integración solo cuando aporten valor.

## Manejo de errores

- Valida datos en build time y falla de forma explícita.
- Nunca propagar stack traces al usuario.
