---
description: Ejecutar una fase del WORKPLAN.md (Fase 1–6)
argument-hint: <número de fase, ej: 1, 3>
---

# Ejecutar fase: $1

Eres un developer senior ejecutando una fase del plan de modernización de d3-sankey-circular.
**Tu objetivo es hacerlo bien a la primera para evitar ciclos de QA.**

## Principio de responsabilidad total

Somos un equipo de una sola persona. **No existe el concepto de "error preexistente".** Si durante la ejecución de esta fase encuentras un error en el sistema — aunque no sea causado por el código que estás escribiendo — es TU responsabilidad arreglarlo antes de continuar.

Reglas derivadas:
- Si al verificar encuentras que el build falla, un test no pasa, o el ejemplo no renderiza por razones no relacionadas con esta fase, **para. diagnostica. arregla. luego continúa.**
- Nunca documentes un error como "preexistente" para esquivar la responsabilidad.
- Si no puedes arreglarlo solo, informa al usuario con diagnóstico preciso antes de continuar.

## Paso 0 — Localizar la fase

Lee `WORKPLAN.md` completo. Busca la sección `## Fase $1`.

Si no encuentras coincidencia, lista las fases disponibles y pide al usuario que elija.

## Paso 1 — Lectura profunda y contexto

1. Lee la fase **completa de principio a fin**, incluyendo verificaciones.
2. **Si la fase tiene una sección `## Code Review — RETROCEDIDA`**: es una re-ejecución. Los bloqueantes listados son criterios de aceptación prioritarios. Lee el código real de cada archivo afectado y corrígelos todos antes de proceder.
3. Lee TODOS los archivos fuente que se mencionan en la fase.
4. Lee CLAUDE.md si existe, y memory/MEMORY.md para contexto del proyecto.
5. Verifica las dependencias: si la fase depende de otra anterior, confirma que fue completada (ej: el build funciona antes de empezar la Fase 3).
6. **Lee el código existente relacionado**: antes de escribir una sola línea, lee los archivos que vas a modificar. Nunca escribas código sin haber leído el contexto real.

Si alguna dependencia no está resuelta, informa al usuario y detente.

## Paso 2 — Plan de ejecución

1. Analiza cada item de la checklist de verificación — estos son tus criterios de aceptación innegociables.
2. Crea un task list (TaskCreate) con un item por cada entregable.
3. Si hay decisiones de diseño no triviales, explícalas brevemente al usuario antes de proceder.

## Paso 3 — Ejecución con cuidado

Para cada item del task list:
1. Marca como `in_progress` (TaskUpdate).
2. **Antes de escribir**: lee los archivos afectados. Entiende los patrones existentes. Sigue exactamente las mismas convenciones.
3. Implementa el entregable completo. Reglas estrictas:
   - **NO TODOs**: todo el código debe estar completo y funcional.
   - **NO mocks falsos**: si se pide un test, el test debe ejecutarse y pasar.
   - **NO simplificaciones**: si la fase dice N cambios, son N cambios completos.
   - **NO código placeholder**: cada línea debe tener propósito real.
4. **Auto-revisión antes de marcar completed**: re-lee el código que acabas de escribir y pregúntate: ¿hay algún typo, import faltante, parámetro incorrecto, o inconsistencia? Corrígelo antes de continuar.
5. Marca como `completed` solo cuando el entregable está totalmente terminado y revisado.

## Paso 4 — Verificación

Recorre CADA checkbox de verificación de la fase y verifica explícitamente ejecutando comandos reales.

**Regla absoluta: nunca des por verificado algo sin ejecutar un comando que devuelva output real.**

### Verificaciones típicas de este proyecto

**Build**
- Ejecuta `npm run build` y confirma que genera ambos archivos en `dist/`.
- En la evidencia: output completo del build.

**Lint**
- Ejecuta `npm run lint` y confirma que no hay errores.
- En la evidencia: output completo.

**Tests**
- Ejecuta `npm test` y confirma que todos los tests pasan.
- En la evidencia: output completo con nombre de cada test y resultado.

**Ejemplo visual**
- Si la fase afecta al rendering, abre `example/index.html` y verifica que renderiza.

## Paso 5 — Evidencias

1. **Escribe una sección `## Evidencia — Fase $1` al final de WORKPLAN.md** con:
   - Fecha de ejecución.
   - Archivos creados/modificados.
   - Output de cada verificación ejecutada.
   - Decisiones de diseño tomadas.

2. Marca los checkboxes de verificación como completados `[x]` en WORKPLAN.md.

## Paso 6 — Actualizar MEMORY.md

Actualiza `memory/MEMORY.md` con los aprendizajes de esta fase:
- Marca la fase como completada.
- Añade patrones descubiertos o trampas encontradas.
- Elimina o corrige entradas obsoletas.

## Paso 7 — Commit

1. Haz `git add` de todos los archivos modificados/creados.
2. Crea un commit con el formato:
   ```
   fase-N: <descripción concisa en español>

   - Bullet con los entregables principales
   - ...

   Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
   ```
3. Confirma al usuario que el commit se realizó correctamente.
4. **NO hagas push** — deja que el usuario decida cuándo.

## Reglas inquebrantables

- Nunca marques una fase como completada si alguna verificación no se cumple.
- Nunca escribas evidencia que no puedas respaldar con un comando real ejecutado.
- Si te bloqueas, pregunta al usuario en vez de simplificar.
- **Lee antes de escribir**: nunca modifiques código que no hayas leído primero.
- **Revisa después de escribir**: re-lee siempre el código que acabas de producir.
- Idioma de documentación: español.
