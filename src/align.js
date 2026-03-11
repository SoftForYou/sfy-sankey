import {min} from "d3-array";

// For a given link, return the target node's depth
function targetDepth(d) {
  return d.target.depth;
}

/**
 * Align nodes to the left: each node's column equals its depth.
 * @param {Object} node - A sankey node with a `depth` property.
 * @returns {number} The column index for the node.
 */
export function left(node) {
  return node.depth;
}

/**
 * Align nodes to the right: pushes nodes as far right as possible.
 * @param {Object} node - A sankey node with a `height` property.
 * @param {number} n - The total number of columns.
 * @returns {number} The column index for the node.
 */
export function right(node, n) {
  return n - 1 - node.height;
}

/**
 * Justify alignment: source nodes use their depth, sink nodes go to the last column.
 * @param {Object} node - A sankey node with `sourceLinks` and `depth` properties.
 * @param {number} n - The total number of columns.
 * @returns {number} The column index for the node.
 */
export function justify(node, n) {
  return node.sourceLinks.length ? node.depth : n - 1;
}

/**
 * Center alignment: nodes without targets use depth, others are centered.
 * @param {Object} node - A sankey node with `targetLinks` and `sourceLinks`.
 * @returns {number} The column index for the node.
 */
export function center(node) {
  return node.targetLinks.length ? node.depth
      : node.sourceLinks.length ? min(node.sourceLinks, targetDepth) - 1
      : 0;
}
