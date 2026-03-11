import { describe, it, expect } from 'vitest'
import { sankeyCircular } from '../src/index.js'
import { circularGraph, simpleDAG, complexCircularGraph } from './fixtures/graphs.js'

function makeSankey () {
  return sankeyCircular()
    .nodeId(function (d) { return d.name })
    .nodeWidth(24)
    .nodePadding(8)
    .size([600, 400])
    .iterations(32)
}

describe('detección de ciclos', function () {
  it('identifica enlaces circulares en grafo A→B→C→A', function () {
    var graph = makeSankey()(circularGraph())
    var circularLinks = graph.links.filter(function (l) { return l.circular })
    expect(circularLinks.length).toBeGreaterThan(0)
  })

  it('DAG sin ciclos produce cero enlaces circulares', function () {
    var graph = makeSankey()(simpleDAG())
    var circularLinks = graph.links.filter(function (l) { return l.circular })
    expect(circularLinks.length).toBe(0)
  })

  it('link.circular se establece a true o false en todos los links', function () {
    var graph = makeSankey()(circularGraph())
    graph.links.forEach(function (link) {
      expect(typeof link.circular).toBe('boolean')
    })
  })

  it('circularLinkType es top o bottom para enlaces circulares', function () {
    var graph = makeSankey()(circularGraph())
    var circularLinks = graph.links.filter(function (l) { return l.circular })
    circularLinks.forEach(function (link) {
      expect(['top', 'bottom']).toContain(link.circularLinkType)
    })
  })

  it('non-circular links do not have circularLinkType', function () {
    var graph = makeSankey()(circularGraph())
    var nonCircularLinks = graph.links.filter(function (l) { return !l.circular })
    nonCircularLinks.forEach(function (link) {
      expect(link.circularLinkType).toBeUndefined()
    })
  })
})

describe('circular path data', function () {
  it('circular links have circularPathData', function () {
    var graph = makeSankey()(circularGraph())
    var circularLinks = graph.links.filter(function (l) { return l.circular })
    circularLinks.forEach(function (link) {
      expect(link.circularPathData).toBeDefined()
      expect(link.path).toBeDefined()
    })
  })

  it('non-circular links have standard path', function () {
    var graph = makeSankey()(simpleDAG())
    graph.links.forEach(function (link) {
      expect(link.path).toBeDefined()
    })
  })
})

describe('grafo circular complejo', function () {
  it('processes complex circular graph without errors', function () {
    var graph = makeSankey()(complexCircularGraph())
    expect(graph.nodes.length).toBe(6)
    expect(graph.links.length).toBe(6)
  })

  it('identifies the backward link as circular', function () {
    var graph = makeSankey()(complexCircularGraph())
    // process3 → process1 is the backward link
    var backwardLink = graph.links.find(function (l) {
      return l.source.name === 'process3' && l.target.name === 'process1'
    })
    expect(backwardLink).toBeDefined()
    expect(backwardLink.circular).toBe(true)
  })
})
