# Verificación — Cómo demostrar que el trabajo funciona

> Regla de oro: **el agente no dice "funciona", lo demuestra**.
> Toda feature termina con evidencia ejecutable, no con afirmaciones.

## Niveles de verificación

### Nivel 1 — Tests unitarios (obligatorio)

Toda función o componente relevante en `src/` tiene al menos un test que:

1. Cubre el camino feliz.
2. Cubre al menos un caso edge o de error si puede fallar.

Comando:

```bash
pnpm test
```

### Nivel 2 — Lint y tipos (obligatorio)

```bash
pnpm lint
pnpm check
```

`pnpm check` ejecuta `astro check` (diagnósticos de `.astro` y TypeScript).

### Nivel 3 — Build (obligatorio)

```bash
pnpm build
```

Si el build estático falla, no hay entrega.

### Nivel 4 — Trazabilidad de requirements (obligatorio para features con `"sdd": true`)

Cada `R<n>` de `specs/<name>/requirements.md` debe poder mapearse a al
menos un test concreto en `tests/` o `src/**/*.test.ts`. El reviewer
rechaza si falta cobertura.

## Verificación final antes de cerrar

```bash
pnpm validate
```

Equivale a `pnpm lint && pnpm check && pnpm test && pnpm build`.

## Anti-patrones (no hacer)

- ❌ "He añadido el componente, debería funcionar." → falta test ejecutable.
- ❌ Test que solo verifica que la función no lanza excepción. → tiene que
  comprobar el resultado concreto.
- ❌ Marcar la feature como `done` sin pasar `pnpm validate`.

Si está rojo, **no** marques nada como `done`. Anota el bloqueo
en `progress/current.md` con estado `blocked` en `feature_list.json`.
