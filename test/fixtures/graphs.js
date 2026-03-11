// Simple DAG: A → B → C (no cycles)
export function simpleDAG () {
  return {
    nodes: [
      { name: 'A' },
      { name: 'B' },
      { name: 'C' }
    ],
    links: [
      { source: 'A', target: 'B', value: 10 },
      { source: 'B', target: 'C', value: 10 }
    ]
  }
}

// Circular graph: A → B → C → A
export function circularGraph () {
  return {
    nodes: [
      { name: 'A' },
      { name: 'B' },
      { name: 'C' }
    ],
    links: [
      { source: 'A', target: 'B', value: 10 },
      { source: 'B', target: 'C', value: 10 },
      { source: 'C', target: 'A', value: 5 }
    ]
  }
}

// Empty graph
export function emptyGraph () {
  return {
    nodes: [],
    links: []
  }
}

// Self-link: A → A
export function selfLinkGraph () {
  return {
    nodes: [
      { name: 'A' },
      { name: 'B' }
    ],
    links: [
      { source: 'A', target: 'B', value: 10 },
      { source: 'A', target: 'A', value: 5 }
    ]
  }
}

// Single node, no links
export function singleNodeGraph () {
  return {
    nodes: [
      { name: 'A' }
    ],
    links: []
  }
}

// Multiple nodes, all in one column (no links between them)
export function sameColumnGraph () {
  return {
    nodes: [
      { name: 'A' },
      { name: 'B' },
      { name: 'C' }
    ],
    links: []
  }
}

// Large value disparity
export function valueDisparityGraph () {
  return {
    nodes: [
      { name: 'A' },
      { name: 'B' },
      { name: 'C' },
      { name: 'D' }
    ],
    links: [
      { source: 'A', target: 'C', value: 1 },
      { source: 'B', target: 'D', value: 10000 }
    ]
  }
}

// Complex graph with circular links (adapted from example-data.js)
export function complexCircularGraph () {
  return {
    nodes: [
      { name: 'startA' },
      { name: 'startB' },
      { name: 'process1' },
      { name: 'process2' },
      { name: 'process3' },
      { name: 'finish' }
    ],
    links: [
      { source: 'startA', target: 'process1', value: 20 },
      { source: 'startB', target: 'process1', value: 15 },
      { source: 'process1', target: 'process2', value: 25 },
      { source: 'process2', target: 'process3', value: 20 },
      { source: 'process3', target: 'finish', value: 15 },
      { source: 'process3', target: 'process1', value: 5 }
    ]
  }
}
