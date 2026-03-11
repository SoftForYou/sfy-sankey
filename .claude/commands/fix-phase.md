---
description: Corregir bloqueantes de una fase retrocedida en QA
argument-hint: <número de fase, ej: 1, 3>
---

# Corregir bloqueantes de Fase $1

Eres un developer profesional corrigiendo una fase que fue retrocedida en code review.

**Principio de responsabilidad total**: somos un equipo de una sola persona. Si al verificar tus correcciones encuentras errores en el sistema no relacionados con esta fase, son igualmente tu responsabilidad. Arréglalo o escala, pero nunca lo ignores.

## Paso 0 — Leer el estado actual

1. Lee `WORKPLAN.md` completo.
2. Localiza la **última sección `## Code Review Fase $1 — RETROCEDIDA`**.
3. Extrae la lista exacta de bloqueantes (B1, B2, B3...).
4. Lee `memory/MEMORY.md` para contexto.

Si NO hay sección retrocedida, la fase no está retrocedida — informa y detente.

## Paso 1 — Leer el código afectado

Para cada bloqueante, **lee los archivos afectados reales** antes de tocar nada.

**Nunca corrijas código que no has leído.**

## Paso 2 — Corregir cada bloqueante

Corrige **todos** los bloqueantes listados. Para cada uno:
1. Identifica el archivo y línea exactos.
2. Lee el fragmento afectado.
3. Aplica la corrección mínima necesaria.
4. Verifica que no rompe otros archivos relacionados.

Criterio de "corrección completa":
- El bloqueante ya no existe en el código.
- No introduces nuevos problemas.
- El código sigue las convenciones del proyecto.

## Paso 3 — Verificación

Ejecuta los checks relevantes:

```bash
npm run build 2>&1    # Build debe funcionar
npm run lint 2>&1     # Lint debe pasar
npm test 2>&1         # Tests deben pasar (si existen)
```

Incluye el output completo en la evidencia.

## Paso 4 — Actualizar WORKPLAN.md

Añade al final de la sección de la fase:

```markdown
### Correcciones aplicadas (post Code Review intento N)

- **B1 corregido**: descripción de qué se cambió y dónde.
- **B2 corregido**: descripción de qué se cambió y dónde.
```

**NO elimines** las secciones `## Code Review — RETROCEDIDA` anteriores.

## Paso 5 — Commit

Crea un commit con el formato:
```
fase-N: fix — <descripción concisa de las correcciones>

- B1: qué se corrigió
- B2: qué se corrigió

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

## Reglas

- **Solo corrige bloqueantes listados**: no hagas refactoring extra ni "mejoras" no solicitadas.
- **Lee antes de escribir**: nunca edites un archivo sin leerlo primero.
- **Corrección mínima**: resuelve el problema con el menor cambio posible.
- **Si un bloqueante es ambiguo**: pregunta al usuario.
- Idioma de documentación: español.
