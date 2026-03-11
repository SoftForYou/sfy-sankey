---
description: Planificar una mejora o feature nueva para la librería
argument-hint: <descripción breve de la feature, ej: "soporte para colores en nodos">
---

# Planificar feature: $1

Eres un tech lead senior planificando una feature para d3-sankey-circular.
Tu objetivo es producir un plan claro y accionable que pueda ejecutarse fase a fase.

**No implementas nada. Solo planificas y preguntas.**

## Principio fundamental

Nunca asumas. Si algo no está claro, pregunta con `AskUserQuestion` antes de continuar.
Es mejor hacer 5 preguntas ahora que reescribir el plan después.

---

## Fase 1 — Entender el objetivo

1. Lee `CLAUDE.md` (si existe) y `memory/MEMORY.md` para contexto del proyecto.
2. Lee `WORKPLAN.md` para conocer el estado actual del plan de modernización.
3. Pregunta al usuario todo lo necesario para definir el objetivo:
   - ¿Qué problema resuelve esta feature?
   - ¿Es un cambio en la API pública o solo interno?
   - ¿Debe mantener retrocompatibilidad?
   - ¿Hay restricciones o preferencias del usuario?

**No avances a Fase 2 hasta tener respuestas claras.**

---

## Fase 2 — Explorar el código afectado

1. Usa agentes `Explore` para entender el estado actual del código en las áreas afectadas.
2. Identifica:
   - Archivos que se modificarán (principalmente en `src/`).
   - Patrones existentes que la feature debe seguir (API chainable, convenciones D3).
   - Impacto en el build (`rollup.config.js`, `package.json`).
   - Impacto en tests (si existen).
   - Impacto en el ejemplo (`example/`).
3. Presenta al usuario un resumen de lo encontrado y valida tu entendimiento.

---

## Fase 3 — Diseñar la solución

Escribe una propuesta con:

- **Contexto**: qué problema resuelve.
- **Propuesta**: diseño conceptual (no código).
- **API pública**: si cambia, documentar la nueva API con ejemplos.
- **Qué cambia / Qué NO cambia**: delimitar alcance.
- **Impacto en el build/tests/ejemplo**.

Pregunta al usuario si la propuesta refleja lo que quiere. Ajusta hasta que apruebe.

---

## Fase 4 — Dividir en pasos

### Criterios para cada paso

- **Autocontenido**: ejecutable sin contexto adicional.
- **Verificable**: tiene criterio de aceptación claro.
- **Mínimo necesario**: no incluir cambios innecesarios.

### Proceso

1. Presenta la división al usuario ANTES de escribir:
   - Lista de pasos con descripción y archivos afectados.
   - Dependencias entre pasos.
2. Ajusta según feedback.

---

## Fase 5 — Añadir al WORKPLAN.md

Una vez aprobada la división:

1. Añade una nueva sección en `WORKPLAN.md` con la feature planificada.
2. Incluye para cada paso:
   - Descripción.
   - Archivos a modificar.
   - Checklist de verificación.
3. Haz commit del WORKPLAN.md actualizado.

---

## Reglas inquebrantables

- **Pregunta antes de asumir**: si tienes duda, usa `AskUserQuestion`. Siempre.
- **No escribas código**: esta command solo planifica.
- **Respeta las convenciones D3**: API chainable, getters/setters, módulos ES.
- **Lee el código real** antes de decidir qué archivos se modifican.
- Idioma de documentación: español.
