import { describe, it, expect } from 'vitest'
import { sankeyCircular } from '../src/index.js'
import {
  emptyGraph,
  selfLinkGraph,
  singleNodeGraph,
  sameColumnGraph,
  valueDisparityGraph
} from './fixtures/graphs.js'

function makeSankey () {
  return sankeyCircular()
    .nodeId(function (d) { return d.name })
    .nodeWidth(24)
    .nodePadding(8)
    .size([600, 400])
    .iterations(32)
}

describe('grafo vacío', function () {
  it('handles empty graph without errors', function () {
    var graph = makeSankey()(emptyGraph())
    expect(graph.nodes.length).toBe(0)
    expect(graph.links.length).toBe(0)
  })
})

describe('self-links', function () {
  it('handles self-linking node (A→A)', function () {
    var graph = makeSankey()(selfLinkGraph())
    expect(graph.nodes.length).toBe(2)
    expect(graph.links.length).toBe(2)

    var selfLink = graph.links.find(function (l) {
      return l.source.name === 'A' && l.target.name === 'A'
    })
    expect(selfLink).toBeDefined()
    expect(selfLink.circular).toBe(true)
  })
})

describe('nodo único sin links', function () {
  it('handles single node graph', function () {
    var graph = makeSankey()(singleNodeGraph())
    expect(graph.nodes.length).toBe(1)
    expect(graph.links.length).toBe(0)
    expect(graph.nodes[0].x0).toBeDefined()
    expect(graph.nodes[0].y0).toBeDefined()
  })
})

describe('todos los nodos en una columna', function () {
  it('handles nodes with no links (all in same column)', function () {
    var graph = makeSankey()(sameColumnGraph())
    expect(graph.nodes.length).toBe(3)
    // all nodes should be at depth 0 since there are no links
    graph.nodes.forEach(function (node) {
      expect(node.depth).toBe(0)
    })
  })
})

describe('disparidades de valor', function () {
  it('handles large value disparities between links', function () {
    var graph = makeSankey()(valueDisparityGraph())
    expect(graph.nodes.length).toBe(4)
    expect(graph.links.length).toBe(2)

    // Both links should have positive width
    graph.links.forEach(function (link) {
      expect(link.width).toBeGreaterThan(0)
    })

    // The large-value link should be wider than the small-value link
    var smallLink = graph.links.find(function (l) { return l.value === 1 })
    var largeLink = graph.links.find(function (l) { return l.value === 10000 })
    expect(largeLink.width).toBeGreaterThan(smallLink.width)
  })
})
