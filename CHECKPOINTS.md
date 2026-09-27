# CHECKPOINTS — Evaluación del estado final

> En sistemas multi-agente no se evalúa el camino, se evalúa el destino.
> Estos son los checkpoints objetivos que un juez (humano o IA) puede usar
> para decidir si el proyecto está sano.

## C1 — El arnés está completo

- [ ] Existen los archivos base: `AGENTS.md`, `feature_list.json`,
      `progress/current.md`.
- [ ] Existen los docs: `docs/architecture.md`, `docs/conventions.md`,
      `docs/specs.md`, `docs/verification.md`.
- [ ] `pnpm validate` termina sin errores.

## C2 — El estado es coherente

- [ ] Como mucho una feature en `in_progress` en `feature_list.json`.
- [ ] Toda feature `done` tiene tests asociados que pasan.
- [ ] `progress/current.md` está vacío o describe la sesión activa
      (no contiene basura de sesiones anteriores).

## C3 — El código respeta la arquitectura

- [ ] `src/pages/` solo contiene rutas (`.astro` o `.md`), no utilidades.
- [ ] Los componentes reutilizables viven en `src/components/` (PascalCase).
- [ ] No hay `console.log()` sueltos para debug, ni TODOs sin contexto.
- [ ] No hay JavaScript de cliente (`client:*`) sin justificación.

## C4 — La verificación es real

- [ ] `tests/` contiene tests para las unidades relevantes.
- [ ] `pnpm test` muestra > 0 tests y todos verdes.
- [ ] `pnpm check` no reporta errores de tipos.

## C5 — La sesión se cerró bien

- [ ] No hay archivos sin trackear sospechosos (`*.tmp`, `dist/` fuera de lugar).
- [ ] `progress/history.md` tiene una entrada por la última sesión.
- [ ] La última feature trabajada está reflejada en su estado correcto.

## C6 — Spec Driven Development

- [ ] Toda feature con `"sdd": true` en estado `spec_ready`, `in_progress`
      o `done` tiene su carpeta `specs/<name>/` con los 3 archivos:
      `requirements.md`, `design.md`, `tasks.md`.
- [ ] `requirements.md` usa EARS estricto (ver `docs/specs.md`).
- [ ] Toda feature `done` con `"sdd": true` tiene todas sus tasks marcadas
      `[x]` en `tasks.md`.
- [ ] Cada `R<n>` de `requirements.md` está cubierto por al menos un test
      concreto en `tests/` o `src/**/*.test.ts`.

---

**Cómo usar este archivo:** un agente revisor (`.opencode/agents/reviewer.md`)
recorre cada checkbox, marca `[x]` o `[ ]`, y rechaza el cierre de sesión
si quedan boxes vacíos en C1-C6.
