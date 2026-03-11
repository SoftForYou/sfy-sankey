---
description: Ejecuta una fase en bucle con QA review hasta aprobarla (agentes Opus aislados)
argument-hint: <número de fase, ej: 1, 3>
---

# Ejecutar fase con QA en bucle: Fase $1

Orquesta la ejecución de la Fase `$1`: run-phase → qa → si falla: fix-phase → qa → (repite fix→qa hasta 3 ciclos).

## Instrucciones de orquestación

Tú eres el coordinador. TODO el trabajo real se delega a subagentes Opus. Tú solo lees resultados y decides el siguiente paso.

---

### Paso A — run-phase (primer intento)

Lee `.claude/commands/run-phase.md` completo. Lanza agente Opus (foreground):
- `subagent_type`: `"general-purpose"`, `model`: `"opus"`
- `description`: `"run-phase $1"`
- `prompt`: El contenido de run-phase.md sustituyendo `$1`.

Espera a que termine.

---

### Paso B — QA review

Lee `.claude/commands/qa-review.md` completo. Lanza agente Opus (foreground):
- `subagent_type`: `"general-purpose"`, `model`: `"opus"`
- `description`: `"qa-review fase $1 — ciclo N"`
- `prompt`: El contenido de qa-review.md sustituyendo `$1`.

Espera a que termine.

#### Leer veredicto

Lee tú mismo (con Read) `WORKPLAN.md` y busca la ÚLTIMA sección `## Code Review Fase $1`:

**Si `## Code Review Fase $1 — APROBADA`**:
- Informa: `✓ Fase $1 aprobada (ciclo N)`
- Detente.

**Si `## Code Review Fase $1 — RETROCEDIDA`**:
- Lee los bloqueantes exactos de WORKPLAN.md (cópialos literalmente).
- Si ciclo_fix < 3: ejecuta **Paso C**.
- Si ciclo_fix = 3: informa `✗ Fase $1 agotó 3 ciclos fix→qa.` Lista los bloqueantes. Detente y pide intervención manual.

---

### Paso C — fix-phase (cuando QA retrocede)

Lee tú mismo `WORKPLAN.md` y extrae los bloqueantes exactos de la última `## Code Review Fase $1 — RETROCEDIDA`.

Lee `.claude/commands/fix-phase.md` completo. Construye el prompt con los bloqueantes explícitos:

```
[Contenido de fix-phase.md con $1 sustituido]

## BLOQUEANTES A CORREGIR (extraídos de WORKPLAN.md)

B1 — [descripción exacta copiada de WORKPLAN.md]
B2 — [descripción exacta copiada de WORKPLAN.md]
...
```

Lanza agente Opus (foreground):
- `subagent_type`: `"general-purpose"`, `model`: `"opus"`
- `description`: `"fix-phase $1 — ciclo N"`
- `prompt`: El prompt construido con bloqueantes.

Espera a que termine. Vuelve al **Paso B**.

---

## Formato de comunicación

Tras cada ciclo:
```
── Ciclo N ────────────────────────────────
  qa-review: RETROCEDIDA
  Bloqueantes:
    B1 — descripción
    B2 — descripción
  → Lanzando fix-phase...
───────────────────────────────────────────
```

Al aprobar:
```
✓ Fase $1 APROBADA en ciclo N (run + N fixes)
```

Al agotar:
```
✗ Fase $1 no aprobada en 3 ciclos fix→qa.
  Bloqueantes pendientes: [lista de WORKPLAN.md]
  Intervención manual requerida.
```

## Reglas

- Lee WORKPLAN.md tú mismo antes de cada paso C — no uses el resumen del agente.
- Incluye los bloqueantes copiados literalmente en el prompt de fix-phase.
- Nunca declares aprobada una fase sin leer WORKPLAN.md y confirmar `## Code Review Fase $1 — APROBADA`.
- Si un subagente falla con error: informa al usuario y detente.
