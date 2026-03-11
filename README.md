# d3-sankey-circular

Fork of [tomshanley/d3-sankey-circular](https://github.com/tomshanley/d3-sankey-circular), which extends [d3-sankey](https://github.com/d3/d3-sankey) to support circular links (cyclic graphs).

This fork modernizes the build toolchain, removes deprecated dependencies, adds tests, and fixes bugs. See [Changes in this fork](#changes-in-this-fork) for details.

## Install

```bash
npm install d3-sankey-circular
```

Requires **D3 v7** (or v6 minimum).

## Usage

```js
var sankey = d3.sankeyCircular()
  .nodeId(function (d) { return d.name })
  .nodeWidth(10)
  .nodePadding(20)
  .size([width, height])
  .nodeAlign(d3.sankeyJustify)
  .iterations(5)
  .circularLinkGap(1)

var graph = sankey(data)
```

The API follows [d3-sankey](https://github.com/d3/d3-sankey#api-reference) with these additions:

### Additional options

| Method | Description | Default |
|--------|-------------|---------|
| `circularLinkGap([gap])` | Gap in pixels between adjacent circular links | `2` |
| `nodeSort([sort])` | Custom node sort function within columns | `undefined` (automatic) |
| `nodePaddingRatio([ratio])` | Vertical padding as proportion (0-1) of densest column | Falls back to `nodePadding` |
| `sortNodes([sort])` | Sort nodes by column (`"col"`) or automatic | `null` |

### Additional node properties

| Property | Description |
|----------|-------------|
| `node.partOfCycle` | `true` if the node has circular links |
| `node.circularLinkType` | `"top"` or `"bottom"` |

### Additional link properties

| Property | Description |
|----------|-------------|
| `link.circular` | `true` if the link is circular |
| `link.circularLinkType` | `"top"` or `"bottom"` |
| `link.path` | SVG path `d` string (works for both circular and normal links) |

### Drawing links

```js
svg.selectAll("path")
  .data(graph.links)
  .enter()
  .append("path")
    .attr("d", function (d) { return d.path })
    .style("stroke-width", function (d) { return Math.max(1, d.width) })
    .style("stroke", function (d) { return d.circular ? "red" : "black" })
```

### Alignment functions

`d3.sankeyLeft`, `d3.sankeyRight`, `d3.sankeyCenter`, `d3.sankeyJustify` -- same as [d3-sankey](https://github.com/d3/d3-sankey#alignments).

## Changes in this fork

- **Modernized build**: Rollup 4, no Babel. Outputs UMD and ES module.
- **Removed `d3-collection`**: replaced with native `Map` and `d3-array` `group()`.
- **D3 v7 compatible**: updated example and event handlers.
- **Tests**: 30 tests (vitest) covering layout, circular detection, and edge cases.
- **Input validation**: descriptive errors for invalid nodes/links/values.
- **Performance**: O(n) circular path computation (was O(n^2)).
- **Bug fixes**: corrected `for` loop syntax, strict equality throughout.
- **ESLint v9**: flat config, no legacy dependencies.

## Development

```bash
npm install          # Install dependencies
npm run build        # Build UMD and ES module to dist/
npm test             # Run tests
npm run lint         # Lint source code
```

A Docker environment is available in `dev/` for consistent builds:

```bash
cd dev
docker compose up -d
docker compose exec node sh
```
