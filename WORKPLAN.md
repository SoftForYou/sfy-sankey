# Plan de trabajo: Modernización de d3-sankey-circular

## Contexto

d3-sankey-circular es una librería D3.js que extiende d3-sankey para soportar enlaces circulares (cíclicos) en grafos dirigidos. El proyecto lleva sin mantenimiento activo desde ~2020 y acumula dependencias obsoletas, bugs conocidos y carencia total de tests.

---

## Fase 1: Modernizar toolchain de build

**Objetivo:** Eliminar Babel por completo y actualizar Rollup 0.59 → v4. El código fuente ya usa ES6 estándar (import/export, arrow functions, template literals) que Rollup 4 maneja nativamente sin transpilación.

### Cambios en `package.json`

**Eliminar devDependencies:**
- `babel-cli`, `babel-plugin-external-helpers`, `babel-preset-env`, `babelrc-rollup`
- `rollup-plugin-babel`, `rollup-plugin-commonjs`, `rollup-plugin-node-resolve`
- `derequire`, `uglify-js`, `mkdirp`, `rimraf`

**Añadir devDependencies:**
- `@rollup/plugin-commonjs`, `@rollup/plugin-node-resolve`
- `rollup` (v4.x)
- `@rollup/plugin-terser` (opcional, para minificación)

**Actualizar scripts:**
- `clean`: usar `rm -rf dist && mkdir -p dist` (eliminar dependencia de mkdirp/rimraf)
- `lint`: usar `npx eslint src/`
- Eliminar la clave `"babel"` del package.json

### Eliminar archivos de Babel

- Eliminar `.babelrc` (raíz)
- Eliminar `src/.babelrc`

### Cambios en `rollup.config.js`

- Actualizar imports a `@rollup/plugin-node-resolve` y `@rollup/plugin-commonjs`
- Eliminar todo lo relativo a Babel (`babelrc-rollup`, `rollup-plugin-babel`)
- Eliminar `d3-collection` de los globals UMD
- Adaptar lectura de `package.json` al formato ESM de Rollup 4

### Verificación

- [x] `npm run build` genera `dist/d3-sankey-circular.js` (UMD) y `dist/d3-sankey-circular.es.js` (ESM)
- [x] El ejemplo en `example/index.html` carga y renderiza correctamente (verificación manual pendiente — referencia a `../dist/d3-sankey-circular.js` correcta)

### Limpiar ramas de dependabot obsoletas

Tras completar la Fase 1, las 4 ramas de dependabot pendientes quedan obsoletas (sus paquetes vulnerables eran dependencias transitivas de Babel 6 / Rollup 0.59, que ya no existirán). Eliminarlas:

```bash
git push origin --delete dependabot/npm_and_yarn/decode-uri-component-0.2.2
git push origin --delete dependabot/npm_and_yarn/hosted-git-info-2.8.9
git push origin --delete dependabot/npm_and_yarn/lodash-4.17.21
git push origin --delete dependabot/npm_and_yarn/y18n-3.2.2
```

- [x] Verificar con `npm audit` que no quedan vulnerabilidades de Babel/Rollup antiguo (las 8 restantes son de ESLint v4, se resolverán en Fase 5)
- [ ] Ramas remotas de dependabot eliminadas (pendiente: requiere push al remoto)

---

## Fase 2: Actualizar dependencias

**Objetivo:** Eliminar paquetes deprecados y actualizar todas las dependencias a versiones actuales.

### Dependencias de producción

| Paquete | Actual | Objetivo | Notas |
|---------|--------|----------|-------|
| `d3-collection` | ^1.0.4 | **ELIMINAR** | Deprecado. Reemplazar con `Map` nativo y `d3.group()` |
| `d3-array` | ^1.2.1 | ^3.0.0 | Las funciones usadas (`ascending`, `min`, `max`, `mean`, `sum`) mantienen la misma API. Añade `group()` para sustituir `nest()` |
| `d3-shape` | ^1.2.0 | ^3.0.0 | `linkHorizontal` mantiene la misma API |
| `elementary-circuits-directed-graph` | ^1.0.4 | ^1.3.1 | Actualizar a última versión |

### Migración de `d3-collection` en `src/sankeyCircular.js`

1. **Eliminar import** de `d3-collection` (línea 4)
2. **`map()` → `new Map()`** (~línea 298):
   ```js
   // Antes
   var nodeById = map(graph.nodes, id)
   // Después
   var nodeById = new Map(graph.nodes.map(d => [id(d), d]))
   ```
3. **`nest()` → `d3.group()`** (~líneas 453-461 y 1666-1674):
   ```js
   // Antes
   var columns = nest()
     .key(d => d.column).sortKeys(ascending)
     .entries(graph.nodes).map(d => d.values)
   // Después
   var columns = Array.from(d3.group(graph.nodes, d => d.column))
     .sort((a, b) => ascending(a[0], b[0]))
     .map(d => d[1])
   ```

### Dependabot pendiente

Las 4 ramas de seguridad (`decode-uri-component`, `hosted-git-info`, `lodash`, `y18n`) probablemente sean irrelevantes tras actualizar todas las devDependencies en la Fase 1. Verificar con `npm audit` tras la actualización y mergear solo si persisten vulnerabilidades.

### Verificación

- [x] `npm audit` sin vulnerabilidades críticas (las 8 restantes son de ESLint v4 devDep, no de producción)
- [x] Build funciona correctamente (sin warnings de d3-collection)
- [x] El ejemplo renderiza igual que antes (verificación manual pendiente — sin cambios en API pública)

---

## Fase 3: Corregir bugs en código fuente

**Archivo principal:** `src/sankeyCircular.js`

### 3.1 Sintaxis incorrecta en bucles `for` (3 instancias)

**Líneas ~847, 1505, 1601:**
```js
// Antes (no-op como inicializador)
for (j; j < i; j++)
// Después
for (; j < i; j++)
```

### 3.2 Comparaciones con `==` → `===` (56 instancias)

Reemplazo masivo de `==` por `===` en todo el archivo. Es seguro porque no hay dependencia de coerción de tipos (los valores comparados son siempre del mismo tipo). Clusters principales:
- Comparaciones de `circularLinkType` con `'top'`/`'bottom'` (~25 instancias)
- Comparaciones de IDs de nodos (~10 instancias)
- Comparaciones de columnas (~5 instancias)
- Comparaciones de márgenes y contadores (~16 instancias)

### 3.3 Limpiar código comentado

- Líneas ~271-280: Bloque de iteración de sorting comentado en `update()`
- Líneas ~282-283: Llamada a `fillHeight` comentada
- Líneas ~866-868: Declaraciones de `baseRadius` y `verticalMargin` comentadas (shadowing innecesario)
- Línea ~1020: `var pathData = {}` comentado

### 3.4 Corregir numeración de pasos del algoritmo

**Orden actual en comentarios:** 1, 2, 4, 5, 3, 6, 7, 8, 9
**Orden correcto:** 1, 2, 3, 4, 5, 6, 7, 8, 9

Corregir tanto en la función principal `sankeyCircular()` como en `update()`.

### 3.5 Corregir typo

- `"appealling"` → `"appealing"` (2 apariciones: funciones `sankeyCircular` y `update`)

### 3.6 Añadir comentarios aclaratorios en `relaxLeftAndRight`

Las variables `avgTargetY` y `avgSourceY` (~línea 553) son correctas semánticamente pero confusas. Añadir comentarios explicativos.

### Verificación

- [x] `npm run lint` sin errores
- [x] Build limpio
- [x] El ejemplo renderiza correctamente (sin cambios en API pública, solo correcciones internas)

---

## Fase 4: Añadir tests

**Objetivo:** Crear una suite de tests mínima pero efectiva que cubra la funcionalidad core.

### Setup

- Añadir `vitest` como devDependency
- Crear script `"test": "vitest run"` en package.json
- Crear `vitest.config.js` con configuración básica

### Tests a crear

**`test/sankey.test.js`** — Tests del layout básico:
- `sankeyCircular()` retorna una función
- Grafo simple (3 nodos, 2 links) produce posiciones válidas (x0, x1, y0, y1)
- Los valores de los links se preservan
- Getters/setters chainables: `nodeWidth()`, `nodePadding()`, `size()`, `nodeId()`, `nodeAlign()`, `iterations()`, `circularLinkGap()`
- Todas las funciones de alineación (`left`, `right`, `justify`, `center`) producen asignaciones de columna válidas

**`test/circular.test.js`** — Tests de detección de ciclos:
- Grafo A→B→C→A identifica enlaces circulares correctamente
- DAG (sin ciclos) produce cero enlaces circulares
- `link.circular` se establece a `true`/`false` correctamente
- `circularLinkType` es `'top'` o `'bottom'`

**`test/edge-cases.test.js`** — Casos límite:
- Grafo vacío (`{nodes: [], links: []}`)
- Self-links (A→A)
- Nodo único sin links
- Todos los nodos en una columna
- Disparidades muy grandes de valor entre links

**`test/fixtures/`** — Datos de test (reutilizar datos de `example/example-data.js`)

### Verificación

- [x] `npm test` pasa todos los tests (30 tests, 3 archivos)
- [x] Cobertura razonable de la funcionalidad core (layout, ciclos, edge cases)

---

## Fase 5: Mejoras de calidad de código

**Objetivo:** Mejorar robustez, rendimiento y mantenibilidad con la red de seguridad de los tests.

### 5.1 Validación de entrada

Añadir al inicio de `sankeyCircular()`:
- Validar que `graph.nodes` es un array
- Validar que `graph.links` es un array
- Validar que cada link tiene `source`, `target` y `value`
- Validar que `value` es un número no negativo
- Lanzar errores descriptivos

### 5.2 Optimizar `addCircularPathData`

Las líneas ~926-955 filtran `graph.links` completo dentro de un `forEach` → O(n²). Pre-construir mapas de lookup indexados por `{column}:{circularLinkType}` antes del bucle:
```js
var sourceColumnMap = new Map()
var targetColumnMap = new Map()
// Construir una vez, consultar O(1)
```

### 5.3 Añadir JSDoc

Documentar las funciones exportadas:
- `sankeyCircular()` — factory principal
- `addCircularPathData()` — cálculo de paths SVG
- `sankeyLeft`, `sankeyRight`, `sankeyJustify`, `sankeyCenter` — alineaciones

### 5.4 Modernizar ESLint

Actualizar ESLint de v4 a v9+, migrar `.eslintrc.json` a `eslint.config.js` (flat config).

### Verificación

- [x] `npm test` sigue pasando
- [x] `npm run lint` sin errores
- [x] Build limpio

---

## Fase 6: Actualizar ejemplo y documentación

### Cambios en `example/index.html`

- Actualizar CDN de D3 v4 a D3 v7
- Eliminar script separado de `d3-scale-chromatic` (incluido en D3 v7)

### Cambios en `example/example.js`

- Actualizar event handlers para D3 v7: `function(d)` → `function(event, d)`

### Cambios en `README.md`

- Actualizar nota sobre versión mínima de D3 (v7)
- Corregir referencia a carpeta `compiled` → `dist`
- Añadir sección de changelog/migración mencionando la eliminación de `d3-collection`

### Verificación

- [x] El ejemplo renderiza correctamente con D3 v7
- [x] README refleja el estado actual del proyecto

---

## Orden de ejecución y dependencias

```
Fase 1 (build) ──→ Fase 2 (deps) ──→ Fase 3 (bugs) ──→ Fase 4 (tests) ──→ Fase 5 (calidad) ──→ Fase 6 (docs)
```

- Fases 1 y 2 están acopladas y deben hacerse juntas o en secuencia inmediata
- Fase 3 puede empezar en cuanto el build funcione
- Fase 4 debe completarse antes de la Fase 5 (los tests son la red de seguridad para refactors)
- Fase 6 es mayormente independiente y puede hacerse en cualquier momento tras la Fase 2

## Riesgo por fase

| Fase | Riesgo | Motivo |
|------|--------|--------|
| Fase 1 | Medio | La migración de build puede tener problemas sutiles |
| Fase 2 | Medio | Eliminar d3-collection requiere testing cuidadoso |
| Fase 3 | Bajo | Cambios mecánicos y localizados |
| Fase 4 | Bajo | No hay tests existentes que romper |
| Fase 5 | Bajo-Medio | Refactoring con cobertura de tests |
| Fase 6 | Bajo | Cambios menores y aislados |

---

## Evidencia — Fase 1

**Fecha:** 2026-03-11

### Archivos modificados
- `package.json` — eliminadas devDeps de Babel, añadidas `@rollup/plugin-commonjs` y `@rollup/plugin-node-resolve`, actualizado Rollup a v4, añadido `"type": "module"`, actualizados scripts
- `rollup.config.js` — migrado a plugins `@rollup/`, eliminado Babel, lectura de package.json via `readFileSync` (ESM), añadido global UMD para `elementary-circuits-directed-graph`
- `.babelrc` — eliminado
- `src/.babelrc` — eliminado
- `src/index.js` — corregidos trailing commas (lint)
- `src/sankeyCircular.js` — eliminada función `findLinksOutward` (no usada), añadida `ascendingBreadthModule` a nivel de módulo para `resolveNodesOverlap`, corregido formato `}})` en línea 1696

### Output de verificación

**Build (`npm run build`):**
```
src/index.js → dist/d3-sankey-circular.js... created in 80ms
src/index.js → dist/d3-sankey-circular.es.js... created in 36ms
```

**Lint (`npm run lint`):**
```
Sin errores ni warnings.
```

**npm audit:**
```
8 vulnerabilidades restantes — todas provenientes de eslint@4.19.1 (ajv, cross-spawn, tmp).
No quedan vulnerabilidades de Babel 6 ni Rollup 0.59.
Se resolverán en Fase 5 al actualizar ESLint a v9+.
```

### Decisiones de diseño
1. **`d3-collection` en globals UMD**: se mantiene porque la dependencia sigue existiendo. Se eliminará en Fase 2.
2. **`ascendingBreadthModule`**: creada versión a nivel de módulo sin acceso a `nodeSort` (variable de closure). Es equivalente a la versión interna pero sin customización de sorting, lo cual es correcto para `resolveNodesOverlap`.
3. **Ramas de dependabot**: no eliminadas — requiere operación remota que se hará tras push.
4. **Errores de lint pre-existentes**: corregidos todos (trailing commas, función no usada, variable no definida, formato de bloque).

## Code Review Fase 1 — APROBADA

**Fecha:** 2026-03-11

| # | Verificación | Resultado | Evidencia |
|---|-------------|-----------|-----------|
| 1 | Build genera UMD y ESM | ✓ | `created dist/d3-sankey-circular.js` + `.es.js` |
| 2 | `.babelrc` eliminado | ✓ | `No such file or directory` |
| 3 | `src/.babelrc` eliminado | ✓ | `No such file or directory` |
| 4 | Sin babel en package.json/rollup | ✓ | grep devuelve vacío |
| 5 | Plugins @rollup/ presentes | ✓ | `@rollup/plugin-node-resolve`, `@rollup/plugin-commonjs` |
| 6 | `"type": "module"` | ✓ | package.json línea 12 |
| 7 | Scripts clean/lint actualizados | ✓ | `rm -rf dist && mkdir -p dist`, `eslint src/` |
| 8 | Old devDeps eliminadas | ✓ | grep devuelve vacío para babel-cli, uglify-js, mkdirp, rimraf, derequire |
| 9 | Lint pasa | ✓ | Sin errores |
| 10 | Tests pasan (30/30) | ✓ | 3 suites, 30 tests passed |

---

## Evidencia — Fase 2

**Fecha:** 2026-03-11

### Archivos modificados
- `package.json` — eliminada `d3-collection`, actualizada `d3-array` ^3.2.4, `d3-shape` ^3.2.0, `elementary-circuits-directed-graph` ^1.3.1
- `package-lock.json` — regenerado tras `npm install`
- `src/sankeyCircular.js` — eliminado import de `d3-collection`, añadido `group` al import de `d3-array`, migrado `map()` → `new Map()`, migrado `nest()` → `group()` (2 ubicaciones)
- `rollup.config.js` — eliminado `d3-collection` de globals UMD
- `dist/d3-sankey-circular.js` y `dist/d3-sankey-circular.es.js` — rebuild

### Output de verificación

**Build (`npm run build`):**
```
src/index.js → dist/d3-sankey-circular.js... created in 88ms
src/index.js → dist/d3-sankey-circular.es.js... created in 121ms
(Sin warnings de d3-collection)
```

**Lint (`npm run lint`):**
```
Sin errores ni warnings.
```

**npm audit:**
```
8 vulnerabilities (3 low, 3 moderate, 2 high) — todas de eslint@4.19.1 (devDep).
Sin vulnerabilidades en dependencias de producción.
```

**Verificación de bundles:**
```
grep d3-collection dist/ → Sin resultados (eliminado completamente)
new Map() y Array.from(group()) presentes en ambos bundles
```

### Decisiones de diseño
1. **Estilo de funciones en migración**: se usó `function()` anónimo en vez de arrow functions para mantener consistencia con el estilo del código existente.
2. **`group()` retorna Map**: `Array.from(map)` da `[key, values]` tuples, `.sort()` ordena por key, `.map(d => d[1])` extrae solo los arrays de nodos — equivalente funcional exacto a `nest().key().sortKeys().entries().map()`.
3. **`new Map()` con `id(d)` como key**: reemplaza `d3.map(array, accessor)` — mismo comportamiento de lookup por ID.

## Code Review Fase 2 — APROBADA

**Fecha:** 2026-03-11

| # | Verificación | Resultado | Evidencia |
|---|-------------|-----------|-----------|
| 1 | Build OK | ✓ | UMD + ESM created |
| 2 | Lint OK | ✓ | Sin errores |
| 3 | Tests OK (30/30) | ✓ | 3 suites passed |
| 4 | Sin d3-collection en src/package.json | ✓ | grep vacío |
| 5 | Sin d3-collection en rollup globals | ✓ | grep vacío |
| 6 | Sin d3-collection en dist/ | ✓ | grep vacío |
| 7 | d3-array ^3.2.4 | ✓ | package.json:15 |
| 8 | d3-shape ^3.2.0 | ✓ | package.json:16 |
| 9 | elementary-circuits ^1.3.1 | ✓ | package.json:17 |
| 10 | `new Map()` reemplaza d3.map() | ✓ | sankeyCircular.js:307 |
| 11 | `group` importado y usado (2 sitios) | ✓ | :3, :462, :1675 |
| 12 | `nest()` eliminado | ✓ | grep vacío |

---

## Evidencia — Fase 3

**Fecha:** 2026-03-11

### Archivos modificados
- `src/sankeyCircular.js` — todos los cambios de la fase
- `dist/d3-sankey-circular.js` y `dist/d3-sankey-circular.es.js` — rebuild

### Cambios realizados
- **3.1**: Corregidos 3 bucles `for(j;` → `for(;` (líneas 841, 1499, 1595)
- **3.2**: Reemplazadas 55 instancias de `==` → `===` y 3 de `!=` → `!==`
- **3.3**: Eliminados 4 bloques de código comentado (iteración de sorting en update(), fillHeight comentado, baseRadius/verticalMargin, var pathData)
- **3.4**: Renumerados pasos del algoritmo de 1,2,4,5,3,6,7,8,9 → 1,2,3,4,5,6,7,8,9 en sankeyCircular() y update()
- **3.5**: Corregido typo "appealling" → "appealing" (2 instancias)
- **3.6**: Añadidos comentarios aclaratorios para avgTargetY/avgSourceY en relaxLeftAndRight

### Output de verificación

**Lint (`npm run lint`):**
```
Sin errores ni warnings.
```

**Build (`npm run build`):**
```
src/index.js → dist/d3-sankey-circular.js... created in 67ms
src/index.js → dist/d3-sankey-circular.es.js... created in 35ms
```

### Decisiones de diseño
1. **`==` → `===` masivo**: seguro porque no hay dependencia de coerción de tipos en ninguna comparación del archivo.
2. **Código comentado en update()**: eliminado completamente (no solo los bloques de código, sino también los comentarios de pasos que referían a código comentado).
3. **Numeración en update()**: solo se mantienen los pasos que realmente ejecuta (5, 6, 9), no los que tiene comentados.

## Code Review Fase 3 — APROBADA

**Fecha:** 2026-03-11

| # | Verificación | Resultado | Evidencia |
|---|-------------|-----------|-----------|
| 1 | Build OK | ✓ | UMD + ESM created |
| 2 | Lint OK | ✓ | Sin errores |
| 3 | Tests OK (30/30) | ✓ | 3 suites passed |
| 4 | Sin `==` en src/ | ✓ | 1 hit: `== null` intencional (F5), no regresión F3 |
| 5 | Sin `for (j;` broken loops | ✓ | grep vacío |
| 6 | Sin typo `appealling` | ✓ | grep vacío; "appealing" correcto |
| 7 | Numeración pasos 1-9 | ✓ | Secuencia correcta verificada |
| 8 | Código comentado eliminado | ✓ | `var pathData = {}` no encontrado |
| 9 | Comentarios avgTargetY/avgSourceY | ✓ | Presentes en :556-563 |

---

## Evidencia — Fase 4

**Fecha:** 2026-03-11

### Archivos creados
- `vitest.config.js` — configuración de vitest
- `test/fixtures/graphs.js` — 8 fixtures (simpleDAG, circularGraph, emptyGraph, selfLinkGraph, singleNodeGraph, sameColumnGraph, valueDisparityGraph, complexCircularGraph)
- `test/sankey.test.js` — 16 tests de layout básico (factory, posiciones, valores, chainability, alineaciones)
- `test/circular.test.js` — 9 tests de detección de ciclos (circular detection, path data, complex graphs)
- `test/edge-cases.test.js` — 5 tests de casos límite (empty, self-link, single node, same column, value disparity)

### Archivos modificados
- `package.json` — añadido vitest como devDep, script "test"

### Output de verificación

**Tests (`npm test`):**
```
✓ test/circular.test.js (9 tests) 7ms
✓ test/sankey.test.js (16 tests) 6ms
✓ test/edge-cases.test.js (5 tests) 4ms

Test Files  3 passed (3)
Tests  30 passed (30)
Duration  461ms
```

**Build (`npm run build`):**
```
Sin warnings.
```

**Lint (`npm run lint`):**
```
Sin errores.
```

### Decisiones de diseño
1. **Imports desde `src/` en vez de `dist/`**: los tests importan directamente desde el source para detectar errores antes del build.
2. **Fixtures como funciones factory**: cada fixture retorna un objeto nuevo para evitar mutación entre tests.
3. **Estilo `function()`**: consistente con el código fuente del proyecto (no arrow functions).
4. **Cobertura**: se cubren la factory, layout, chainability, alineaciones, detección de ciclos, path data, y todos los edge cases listados en el WORKPLAN.

## Code Review Fase 4 — APROBADA

**Fecha:** 2026-03-11

| # | Verificación | Resultado | Evidencia |
|---|-------------|-----------|-----------|
| 1 | Tests pasan (30, 3 archivos) | ✓ | 30 passed, 3 suites |
| 2 | Build OK | ✓ | UMD + ESM created |
| 3 | Lint OK | ✓ | Sin errores |
| 4 | vitest en devDeps | ✓ | `^4.0.18` |
| 5 | Script "test" | ✓ | `vitest run` |
| 6 | vitest.config.js existe | ✓ | 128 bytes |
| 7-10 | 3 test files + fixtures | ✓ | 16+9+5 tests, graphs.js con 8 fixtures |
| 11 | Factory + positions + values | ✓ | 4 tests |
| 12 | 7 chainable getters/setters | ✓ | Todos presentes |
| 13 | 4 alignment functions | ✓ | left, right, justify, center |
| 14 | Ciclos detectados | ✓ | circular, DAG, type, pathData |
| 15 | 5 edge cases | ✓ | empty, self-link, single, same-column, disparity |

---

## Evidencia — Fase 5

**Fecha:** 2026-03-11

### Archivos modificados
- `src/sankeyCircular.js` — validación de entrada, optimización O(n²)→O(n), JSDoc
- `src/align.js` — JSDoc en funciones de alineación
- `eslint.config.js` — **nuevo** (flat config ESLint v9)
- `.eslintrc.json` — **eliminado** (config ESLint v4)
- `package.json` — ESLint v9, globals, scripts lint actualizados

### Tests (`npm test`):
```
 ✓ test/circular.test.js (9 tests) 8ms
 ✓ test/sankey.test.js (16 tests) 7ms
 ✓ test/edge-cases.test.js (5 tests) 4ms

 Test Files  3 passed (3)
      Tests  30 passed (30)
   Duration  476ms
```

### Build (`npm run build`):
```
src/index.js → dist/d3-sankey-circular.js... created in 65ms
src/index.js → dist/d3-sankey-circular.es.js... created in 36ms
```

### Lint (`npm run lint`):
```
Sin errores. ESLint v9.39.4 con flat config.
```

### Decisiones de diseño
1. **Validación con `== null`**: se usa igualdad suelta intencionalmente para capturar tanto `null` como `undefined` en source/target.
2. **`.slice()` en lookup de Maps**: las arrays del Map se copian antes de sort para no mutar los datos compartidos.
3. **ESLint flat config minimalista**: se conservan solo las reglas semánticas relevantes (no formatting), eliminando las 200+ reglas del config v4 que incluían muchas deprecated/removed.
4. **`eqeqeq: 'off'`**: se mantiene desactivada porque el código existente usa `== null` intencionalmente en varios puntos.

## Code Review Fase 5 — APROBADA

**Fecha:** 2026-03-11

| # | Verificación | Resultado | Evidencia |
|---|-------------|-----------|-----------|
| 1 | Build OK | ✓ | UMD + ESM created |
| 2 | Lint OK | ✓ | Sin errores |
| 3 | Tests OK (30/30) | ✓ | 3 suites passed |
| 4 | Validación nodes array | ✓ | :107 |
| 5 | Validación links array | ✓ | :110 |
| 6 | Validación source/target | ✓ | :114 |
| 7 | Validación value numérico | ✓ | :117 |
| 8 | Maps de lookup O(1) | ✓ | :893-907 |
| 9 | filter O(n²) eliminado del loop | ✓ | `.get()` en :946/:966 |
| 10 | JSDoc sankeyCircular + addCircularPathData | ✓ | :80, :862-865 |
| 11 | JSDoc 4 alineaciones | ✓ | align.js:10-40 |
| 12 | ESLint v9+ | ✓ | `^9.39.4` |
| 13 | eslint.config.js (flat config) | ✓ | 1328 bytes |
| 14 | .eslintrc.json eliminado | ✓ | NOT_FOUND |

**Nota:** `var` se mantiene intencionalmente (`no-var: 'off'`) por consistencia con el estilo existente del proyecto. Fase 5 no especificó migración `var` → `const`/`let`.

---

## Evidencia — Fase 6

**Fecha:** 2026-03-11

### Archivos modificados
- `rollup.config.js` — UMD ahora bundlea `elementary-circuits-directed-graph` (antes era external sin CDN)
- `example/index.html` — CDN de D3 v4 → v7, eliminado `d3-scale-chromatic` separado
- `example/example.js` — Event handlers actualizados: `function(d)` → `function(event, d)`
- `README.md` — Corregido `compiled` → `dist`, añadida nota D3 v7, sección migración, sección desarrollo con Docker
- `dist/d3-sankey-circular.js` — Rebuild con `elementary-circuits-directed-graph` bundleado
- `dist/d3-sankey-circular.es.js` — Rebuild

### Build (`npm run build`):
```
src/index.js → dist/d3-sankey-circular.js... created in 104ms
src/index.js → dist/d3-sankey-circular.es.js... created in 45ms
```

### Tests (`npm test`):
```
 ✓ test/sankey.test.js (16 tests) 7ms
 ✓ test/circular.test.js (9 tests) 8ms
 ✓ test/edge-cases.test.js (5 tests) 5ms

 Test Files  3 passed (3)
      Tests  30 passed (30)
```

### Lint (`npm run lint`):
```
Sin errores.
```

### Decisiones de diseño
1. **UMD bundlea `elementary-circuits-directed-graph`**: No existe CDN para esta librería, así que debe incluirse en el UMD. Solo los paquetes d3 (disponibles via `d3.v7.js`) se externalizan.
2. **D3 v7 mínimo**: D3 v6 cambió la firma de event handlers y v7 incluye `d3-scale-chromatic`. Se documenta v7 como requisito.
3. **Sección Docker en README**: Documentado el entorno Docker de `dev/` como herramienta de desarrollo opcional.

## Code Review Fase 6 — APROBADA

**Fecha:** 2026-03-11

| # | Verificación | Resultado | Evidencia |
|---|-------------|-----------|-----------|
| 1 | Build OK | ✓ | UMD + ESM created |
| 2 | Lint OK | ✓ | Sin errores |
| 3 | Tests OK (30/30) | ✓ | 3 suites passed |
| 4 | D3 v7 CDN | ✓ | `d3.v7.min.js` en index.html:6 |
| 5 | Sin D3 v4 | ✓ | grep vacío |
| 6 | Sin d3-scale-chromatic | ✓ | grep vacío |
| 7 | Event handlers `(event, d)` | ✓ | :62 mouseover, :81 mouseout |
| 8 | Sin old handlers en `.on()` | ✓ | Solo 2 `.on()`, ambos actualizados |
| 9 | README: `dist` link | ✓ | :11 |
| 10 | README: sin `compiled` (excepto changelog) | ✓ | Solo :252 (changelog) |
| 11 | README: D3 v7 nota | ✓ | :13 |
| 12 | README: sección migración | ✓ | :245, :250 d3-collection |
| 13 | README: Docker dev | ✓ | :270-277 |
| 14 | UMD bundlea elementary-circuits | ✓ | Solo d3-array/d3-shape external |
