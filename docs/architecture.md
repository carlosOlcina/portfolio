# Arquitectura — Qué significa "hacer un buen trabajo"

> Este documento define el estándar de calidad. Los agentes revisores
> evalúan código contra este archivo. Si no está aquí, no es un requisito.

## Principios

1. **Sitio estático con Astro.** No hay backend ni base de datos: todo se
   genera en build. El routing es file-based: cada archivo en `src/pages/`
   es una ruta.

2. **Estructura `src/`:**
   - `pages/` — rutas file-based (`.astro` o `.md`)
   - `layouts/` — plantillas de página reutilizables
   - `components/` — componentes `.astro` reutilizables
   - `content/` — content collections (Markdown/MDX + schema Zod) si aplica
   - `styles/` — estilos globales
   - `assets/` — imágenes y assets procesados por Astro

3. **Zero-JS por defecto.** Sin framework de UI en cliente salvo
   justificación. Añade islas (`client:*`) solo cuando aporten valor real
   de interactividad.

4. **TypeScript estricto.** `tsconfig.json` extiende
   `astro/tsconfigs/strict`. No usar `any`. Tipar explícitamente las APIs
   públicas de componentes (interfaces `Props`).

5. **SEO y accesibilidad.** HTML semántico, metadatos (`title`,
   `description`, Open Graph), contraste suficiente, navegación por teclado
   y textos alternativos. El sitio es público y global.

6. **Rendimiento.** Imágenes optimizadas, CSS mínimo, cero dependencias
   innecesarias. El build debe mantenerse pequeño.

7. **Testing.** Vitest para lógica y Astro Container API para renderizar
   páginas y componentes. Un test por unidad relevante.

## Flujo de datos

```
Contenido (src/content, Markdown) ──→ Componentes .astro ──→ HTML estático (dist/)
```

No hay estado en servidor ni llamadas a APIs propias.

## Qué NO hacer

- No usar `console.log()` para errores. Manejo explícito de errores.
- No añadir JavaScript de cliente sin una razón de interactividad.
- No mezclar estilos de múltiples fuentes: seguir `docs/conventions.md`.
- No saltar tests — toda feature nueva tiene su test.
