# Harness Engineering — Spec Driven Development

> Este archivo es el **punto de entrada** para cualquier agente que trabaje en este
> repositorio. NO es una biblia de reglas: es un **mapa**. Lee solo lo que
> necesites cuando lo necesites (divulgación progresiva).

## 1. Antes de empezar (obligatorio)

1. Ejecuta `pnpm validate` para verificar el estado (lint + tipos + tests + build).
2. Lee `progress/current.md` para entender en qué estado quedó la última sesión.
3. Lee `feature_list.json`. Toda feature nueva (`"sdd": true`) pasa por
   **Spec Driven Development** — ver `docs/specs.md` y §4 de este archivo.
4. Lee `docs/specs.md` antes de tocar cualquier spec o feature `sdd: true`.

## 2. Mapa del repositorio

| Archivo / carpeta      | Qué contiene                                                                               | Cuándo leerlo                                            |
| ---------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `feature_list.json`    | Lista de tareas con estado (`pending` / `spec_ready` / `in_progress` / `done` / `blocked`) | Siempre, al empezar                                      |
| `progress/current.md`  | Estado de la sesión actual                                                                 | Siempre, al empezar                                      |
| `progress/history.md`  | Bitácora append-only de sesiones anteriores                                                | Si necesitas contexto histórico                          |
| `specs/<feature>/`     | `requirements.md` + `design.md` + `tasks.md` (Kiro-style)                                  | Antes de implementar cualquier feature con `"sdd": true` |
| `docs/architecture.md` | Qué significa "hacer un buen trabajo" en este proyecto                                     | Antes de implementar                                     |
| `docs/conventions.md`  | Reglas de estilo, nombres, estructura                                                      | Antes de escribir código                                 |
| `docs/specs.md`        | Proceso SDD: EARS notation, los 3 archivos, puerta de aprobación humana                    | Antes de redactar o leer un spec                         |
| `docs/verification.md` | Cómo verificar que tu trabajo funciona (incluye trazabilidad requirements)                 | Antes de declarar una tarea como `done`                  |
| `CHECKPOINTS.md`       | Criterios objetivos de "estado final correcto"                                             | Para auto-evaluarte                                      |
| `.opencode/agents/`    | Definiciones de subagentes (`leader`, `spec_author`, `implementer`, `reviewer`, ...)       | Si orquestas trabajo                                     |
| `src/pages/`           | Rutas file-based de Astro (`index.astro`, `blog/[...slug].astro`, ...)                     | Para crear o modificar páginas                           |
| `src/layouts/`         | Plantillas de página reutilizables                                                         | Para definir la estructura visual                        |
| `src/components/`      | Componentes `.astro` reutilizables                                                         | Para implementar UI                                      |
| `src/content/`         | Content collections (Markdown/MDX + schema)                                                | Para contenido editable                                  |
| `tests/`               | Tests con Vitest + Astro Container API                                                     | Para verificar integración                               |

## 3. Reglas duras (no negociables)

- **Una sola feature a la vez.** No mezcles cambios de varias tareas en la misma sesión.
- **No declares una tarea `done` sin pruebas verdes.** Ejecuta
  `pnpm validate` y asegúrate de que todo pasa.
- **No saltes la fase de spec.** Toda feature con `"sdd": true` debe pasar
  por `spec_author` y obtener aprobación humana antes de tocar código.
- **No saltes la puerta de aprobación humana.** El leader detiene el flujo
  en `spec_ready` y espera.
- **Documenta lo que haces** en `progress/current.md` mientras trabajas, no al final.
- **Deja el repositorio limpio** antes de cerrar la sesión (ver §5).
- **Si no sabes algo, busca en `docs/`** antes de inventarlo.

## 4. Flujo de trabajo (SDD)

```
pending → [spec_author] → spec_ready → ⏸ HUMANO → in_progress → [implementer → reviewer] → done
```

1. El leader detecta la primera feature `pending` con `"sdd": true`.
2. El leader lanza `spec_author`, que crea
   `specs/<name>/{requirements,design,tasks}.md` y marca el status como
   `spec_ready`.
3. **Pausa.** El humano lee el spec en `specs/<name>/` y aprueba (o pide cambios).
4. Una vez aprobado, el leader cambia el status a `in_progress` y lanza `implementer`.
5. El implementer ejecuta `tasks.md` una a una, marcándolas `[x]`.
6. El reviewer verifica trazabilidad `R<n>` ↔ test y tasks completas;
   aprueba o rechaza.
7. Si aprueba, el implementer marca `done` y mueve el resumen a
   `progress/history.md`.

## 5. Cierre de sesión (lifecycle)

Antes de terminar:

1. Ejecuta `pnpm validate` — todo verde.
2. Si la tarea está acabada: marca `status: "done"` en `feature_list.json`.
3. Mueve el resumen de `progress/current.md` al final de `progress/history.md`.
4. Vacía `progress/current.md` dejando solo la plantilla.
5. No dejes archivos temporales, ni `console.log()` de debug, ni TODOs sin contexto.

## 6. Si te bloqueas

- Relee la sección relevante de `docs/`.
- Si la herramienta no hace lo que esperas, **no inventes un workaround**:
  documenta el bloqueo en `progress/current.md` y para la sesión.

# Información clave del proyecto

## 1. Datos sobre la aplicación

- Es un portfolio personal: sitio web estático de presentación.
- El nombre del proyecto/repo es `portfolio`.
- Stack: Astro 6 + TypeScript estricto, gestionado con pnpm.
- No hay backend ni base de datos: todo se genera en build.

## 2. Reglas de estilo

- Todo el generado debe seguir las siguientes reglas.
- Usar siempre el lenguaje de inglés, tanto en comentarios, commits, variables, etc.
- Priorizar la simplicidad sobre la complejidad.
- Evitar duplicación de código (DRY).
- Seguir el principio KISS.
- Aplicar SOLID cuando tenga sentido.
- No añadir comentarios innecesarios; el código debe ser autoexplicativo.
- Utilizar nombres descriptivos para variables, funciones, clases y archivos.
- Mantener funciones pequeñas y con una única responsabilidad.
- Evitar números y cadenas mágicas; utilizar constantes.
- No utilizar abreviaturas salvo que sean ampliamente conocidas.
- Mantener una estructura consistente en todo el proyecto.
- Respetar el formateo configurado por Prettier y las reglas de ESLint.
- No deshabilitar reglas del linter sin una justificación.
- No introducir dependencias nuevas sin que aporten un beneficio claro.
- Preferir composición frente a herencia cuando sea posible.
- Eliminar código muerto y código comentado.
- Evitar optimizaciones prematuras.
- Manejar los errores de forma explícita y consistente.
- No asumir valores nulos o indefinidos; validar cuando sea necesario.
- Mantener la compatibilidad con la arquitectura existente del proyecto.
- Generar código listo para producción.
- Antes de modificar código existente, entender su contexto.
- Reutilizar componentes y utilidades existentes antes de crear otros nuevos.
- No cambiar APIs públicas sin una justificación.
- Mantener compatibilidad hacia atrás cuando sea posible.
- No modificar archivos no relacionados con la tarea.
- Si existen varias soluciones válidas, elegir la más simple.
- Mantener el mismo estilo de código que el resto del proyecto.
- No generar código especulativo o no utilizado.
- Utilizar un tipado fuerte y explícito. Definir tipos, interfaces y genéricos cuando aporten claridad, evitando `any` y prefiriendo `unknown` cuando el tipo no pueda determinarse de forma segura.
- Finalizar siempre la tarea con una solución completa, evitando dejar TODOs salvo que se solicite.
- El sitio es público y global: priorizar accesibilidad, rendimiento y zero-JS por defecto.

## 3. Antes de empezar a trabajar

Una vez tengas idea del contexto de la tarea, carga las skills de
`.opencode/skills/` (si existen) que sean necesarias para esa tarea.
