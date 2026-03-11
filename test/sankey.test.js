import { describe, it, expect } from 'vitest'
import {
  sankeyCircular,
  sankeyLeft,
  sankeyRight,
  sankeyJustify,
  sankeyCenter
} from '../src/index.js'
import { simpleDAG } from './fixtures/graphs.js'

describe('sankeyCircular factory', function () {
  it('returns a function', function () {
    var sankey = sankeyCircular()
    expect(typeof sankey).toBe('function')
  })
})

describe('layout básico', function () {
  function makeSankey () {
    return sankeyCircular()
      .nodeId(function (d) { return d.name })
      .nodeWidth(24)
      .nodePadding(8)
      .size([600, 400])
      .iterations(32)
  }

  it('produces valid node positions for a simple graph', function () {
    var sankey = makeSankey()
    var graph = sankey(simpleDAG())

    expect(graph.nodes.length).toBe(3)
    graph.nodes.forEach(function (node) {
      expect(node.x0).toBeDefined()
      expect(node.x1).toBeDefined()
      expect(node.y0).toBeDefined()
      expect(node.y1).toBeDefined()
      expect(node.x1).toBeGreaterThan(node.x0)
      expect(node.y1).toBeGreaterThan(node.y0)
    })
  })

  it('preserves link values', function () {
    var sankey = makeSankey()
    var data = simpleDAG()
    var originalValues = data.links.map(function (l) { return l.value })
    var graph = sankey(data)

    graph.links.forEach(function (link, i) {
      expect(link.value).toBe(originalValues[i])
    })
  })

  it('assigns link source and target as node objects', function () {
    var sankey = makeSankey()
    var graph = sankey(simpleDAG())

    graph.links.forEach(function (link) {
      expect(typeof link.source).toBe('object')
      expect(typeof link.target).toBe('object')
      expect(link.source.name).toBeDefined()
      expect(link.target.name).toBeDefined()
    })
  })

  it('assigns positive width to links', function () {
    var sankey = makeSankey()
    var graph = sankey(simpleDAG())

    graph.links.forEach(function (link) {
      expect(link.width).toBeGreaterThan(0)
    })
  })
})

describe('getters/setters chainables', function () {
  it('nodeWidth is chainable', function () {
    var sankey = sankeyCircular()
    var result = sankey.nodeWidth(20)
    expect(result).toBe(sankey)
    expect(sankey.nodeWidth()).toBe(20)
  })

  it('nodePadding is chainable', function () {
    var sankey = sankeyCircular()
    var result = sankey.nodePadding(10)
    expect(result).toBe(sankey)
    expect(sankey.nodePadding()).toBe(10)
  })

  it('size is chainable', function () {
    var sankey = sankeyCircular()
    var result = sankey.size([800, 600])
    expect(result).toBe(sankey)
    expect(sankey.size()).toEqual([800, 600])
  })

  it('nodeId is chainable', function () {
    var sankey = sankeyCircular()
    var accessor = function (d) { return d.name }
    var result = sankey.nodeId(accessor)
    expect(result).toBe(sankey)
  })

  it('nodeAlign is chainable', function () {
    var sankey = sankeyCircular()
    var result = sankey.nodeAlign(sankeyLeft)
    expect(result).toBe(sankey)
  })

  it('iterations is chainable', function () {
    var sankey = sankeyCircular()
    var result = sankey.iterations(10)
    expect(result).toBe(sankey)
    expect(sankey.iterations()).toBe(10)
  })

  it('circularLinkGap is chainable', function () {
    var sankey = sankeyCircular()
    var result = sankey.circularLinkGap(5)
    expect(result).toBe(sankey)
    expect(sankey.circularLinkGap()).toBe(5)
  })
})

describe('funciones de alineación', function () {
  function runWithAlign (alignFn) {
    var sankey = sankeyCircular()
      .nodeId(function (d) { return d.name })
      .nodeAlign(alignFn)
      .nodeWidth(24)
      .nodePadding(8)
      .size([600, 400])
    return sankey(simpleDAG())
  }

  it('sankeyLeft assigns valid columns', function () {
    var graph = runWithAlign(sankeyLeft)
    graph.nodes.forEach(function (node) {
      expect(node.depth).toBeGreaterThanOrEqual(0)
      expect(node.column).toBeGreaterThanOrEqual(0)
    })
  })

  it('sankeyRight assigns valid columns', function () {
    var graph = runWithAlign(sankeyRight)
    graph.nodes.forEach(function (node) {
      expect(node.depth).toBeGreaterThanOrEqual(0)
      expect(node.column).toBeGreaterThanOrEqual(0)
    })
  })

  it('sankeyJustify assigns valid columns', function () {
    var graph = runWithAlign(sankeyJustify)
    graph.nodes.forEach(function (node) {
      expect(node.depth).toBeGreaterThanOrEqual(0)
      expect(node.column).toBeGreaterThanOrEqual(0)
    })
  })

  it('sankeyCenter assigns valid columns', function () {
    var graph = runWithAlign(sankeyCenter)
    graph.nodes.forEach(function (node) {
      expect(node.depth).toBeGreaterThanOrEqual(0)
      expect(node.column).toBeGreaterThanOrEqual(0)
    })
  })
})
