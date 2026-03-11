---
description: Ejecuta todas las fases pendientes del WORKPLAN en secuencia, con QA en bucle
argument-hint: [fase-inicio, ej: 3] — opcional, por defecto empieza en la primera pendiente
---

# Ejecutar todas las fases pendientes

Orquesta la ejecución secuencial de todas las fases pendientes del WORKPLAN.md usando agentes Opus aislados.
Para cada fase: run-phase → qa-review → si falla: fix-phase → qa-review → (retry fix→qa hasta 3 veces) → siguiente fase.

Si se proporciona `$1`, empieza desde esa fase. Si no, determina automáticamente cuál es la primera pendiente.

## Paso 0 — Determinar fases a ejecutar

1. Lee `WORKPLAN.md` completo.
2. Para cada fase (1–6), determina su estado:
   - **COMPLETADA**: contiene `## Code Review Fase N — APROBADA`.
   - **PENDIENTE**: no contiene evidencia aprobada.
   - **RETROCEDIDA**: la última sección `## Code Review Fase N` es `RETROCEDIDA`.
3. Construye la lista ordenada de fases PENDIENTES y RETROCEDIDAS.
4. Si se especificó `$1`, filtra para empezar desde esa fase (inclusive).
5. Informa al usuario: "Fases completadas: [lista]. Fases a ejecutar: [lista]." y espera confirmación explícita.

## Paso 1 — Bucle principal: para cada Fase N en la lista

Procesa las fases **en orden secuencial** (las dependencias entre fases lo requieren).

### Anuncio
Informa al usuario: `▶ Iniciando Fase N — <título de la fase>`

### Flujo por fase: run-phase → qa → [fix → qa]* (máximo 3 ciclos fix→qa)

#### Paso A — Ejecutar la fase (solo el primer intento)

Lee `.claude/commands/run-phase.md` completo. Construye el prompt sustituyendo `$1` por `N`.

Lanza agente Opus (foreground):
- `subagent_type`: `"general-purpose"`, `model`: `"opus"`
- `description`: `"run-phase N"`
- `prompt`: El prompt de run-phase construido.

Espera a que termine.

#### Paso B — QA review (después de run-phase o fix-phase)

Lee `.claude/commands/qa-review.md` completo. Lanza agente Opus (foreground):
- `subagent_type`: `"general-purpose"`, `model`: `"opus"`
- `description`: `"qa-review fase N — intento M"`
- `prompt`: El prompt de qa-review construido.

Espera a que termine.

#### Leer veredicto

Lee tú mismo (con Read) `WORKPLAN.md` y busca la ÚLTIMA sección `## Code Review Fase N`:

**Si `## Code Review Fase N — APROBADA`**:
- Muestra: `✓ Fase N aprobada (intento M)`
- Pasa a la siguiente fase.

**Si `## Code Review Fase N — RETROCEDIDA`**:
- Lee y extrae los bloqueantes exactos de WORKPLAN.md.
- Muestra los bloqueantes.
- Si ciclo_fix < 3: ejecuta el **Paso C** (fix-phase).
- Si ciclo_fix = 3:
  - Muestra: `✗ Fase N agotó 3 ciclos fix→qa sin aprobar.`
  - Lista los bloqueantes pendientes.
  - **Detén toda la ejecución** y pide intervención manual.

#### Paso C — Fix-phase (solo cuando QA retrocede)

ANTES de lanzar el agente, lee tú mismo `WORKPLAN.md` y extrae los bloqueantes exactos.

Lee `.claude/commands/fix-phase.md` completo. Construye el prompt sustituyendo `$1` por `N` e incluyendo los bloqueantes extraídos.

Lanza agente Opus (foreground):
- `subagent_type`: `"general-purpose"`, `model`: `"opus"`
- `description`: `"fix-phase N — ciclo M"`
- `prompt`: El prompt de fix-phase con los bloqueantes incluidos.

Espera a que termine. Vuelve al **Paso B** (QA review).

## Paso 2 — Resumen final

Cuando todas las fases estén procesadas (o se detenga por fallo):

```
═══════════════════════════════════════════
  RESUMEN DE EJECUCIÓN — MODERNIZACIÓN
═══════════════════════════════════════════
  ✓ Fase 1 — Modernizar build (aprobada)
  ✓ Fase 2 — Actualizar dependencias (aprobada)
  ✓ Fase 3 — Corregir bugs (aprobada)
  ✗ Fase 4 — Añadir tests (bloqueada)
═══════════════════════════════════════════
```

## Reglas inquebrantables

- **Secuencial obligatorio**: nunca lances dos fases en paralelo.
- **Nunca saltes una fase fallida**: si una fase falla en 3 intentos, detente completamente.
- **Lee WORKPLAN.md tú mismo** antes de cada intento — no confíes en el resumen del agente anterior.
- **Incluye los bloqueantes exactos en el prompt** de fix — copiados de WORKPLAN.md, no parafraseados.
- **Nunca declares aprobada una fase** sin leer WORKPLAN.md y confirmar `APROBADA`.
- **Confirmación del usuario antes de empezar**: muestra la lista de fases pendientes y espera OK explícito.
- Si un subagente falla o devuelve error inesperado: informa al usuario y detente.
- Idioma de comunicación: español.
