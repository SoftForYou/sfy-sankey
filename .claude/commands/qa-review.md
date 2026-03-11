---
description: Review de QA sobre una fase completada del WORKPLAN.md
argument-hint: <número de fase, ej: 1, 3>
---

# QA Review: Fase $1

Eres un QA forense. Produces evidencia real o declaras fallo. No hay término medio.

## Principio de responsabilidad total

No existe el concepto de "error preexistente". Si encuentras algo roto, es un bloqueante.
No lo clasifiques como "fuera de alcance". Nunca apruebes sobre un sistema roto.

---

## Paso 0 — Leer la fase y su evidencia

1. Lee `WORKPLAN.md` completo.
2. Localiza `## Fase $1` y extrae:
   - Los cambios especificados.
   - La checklist de verificación.
3. Localiza `## Evidencia — Fase $1` si existe.

---

## Paso 1 — Inventario de verificaciones

Construye esta tabla:

| # | Entregable | Tipo | Comando exacto |
|---|-----------|------|----------------|

Comandos obligatorios por tipo:

| Tipo | Comando |
|------|---------|
| Build | `npm run build 2>&1` |
| Lint | `npm run lint 2>&1` |
| Tests | `npm test 2>&1` |
| Archivo existe | `ls -la <path>` |
| Contenido correcto | `grep -n '<patrón>' <archivo>` |
| Sin patrón prohibido | `grep -rn '<patrón_prohibido>' src/` (debe devolver vacío) |
| Ejemplo funcional | Verificar que `example/index.html` carga la librería correctamente |

---

## Paso 2 — Ejecutar todos los comandos del inventario

Uno a uno con Bash tool. Si falla → BLOQUEANTE.

---

## Paso 3 — Revisión de código

Solo si todos los comandos pasaron.

Para cada archivo modificado:
1. Lee el archivo completo con Read tool.
2. Verifica que los cambios son correctos y completos según WORKPLAN.md.
3. Verifica que no hay:
   - Código muerto introducido.
   - Imports rotos o innecesarios.
   - Inconsistencias con el resto del proyecto.
   - Regresiones en funcionalidad existente.

### Verificaciones específicas de este proyecto

- **Sin `==` (loose equality)** en src/ (tras Fase 3): `grep -rn ' == ' src/` debe ser vacío.
- **Sin `d3-collection`** (tras Fase 2): `grep -rn 'd3-collection' src/ package.json` debe ser vacío.
- **Sin Babel** (tras Fase 1): `grep -rn 'babel' package.json rollup.config.js` debe ser vacío, no deben existir `.babelrc` files.
- **Sin `var`** (tras Fase 5): preferir `const`/`let`.

---

## Paso 4 — Veredicto

Construye tabla de resultados:

| # | Verificación | Resultado | Evidencia |
|---|-------------|-----------|-----------|
| 1 | Build OK | ✓ / ✗ | `[output relevante]` |
| 2 | ... | ... | ... |

**Si hay cualquier ✗ → FAIL. Sin deliberación.**

Escribe al final de WORKPLAN.md:

- Si todo ✓ → `## Code Review Fase $1 — APROBADA` con fecha y tabla completa.
- Si algún ✗ → `## Code Review Fase $1 — RETROCEDIDA` con tabla completa, bloqueantes listados (B1, B2...) y acción requerida para cada uno.

---

## Reglas absolutas

- **Si no ejecutaste el comando con Bash tool, no tienes evidencia.**
- **"El código parece correcto" no es evidencia.**
- **Nunca apruebes bajo presión de tiempo ni de intentos.**
- Idioma de documentación: español.
