import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))
var external = Object.keys(pkg.dependencies)

// UMD build: only externalize d3 packages (available via d3.v7.js global).
// Non-d3 packages (elementary-circuits-directed-graph) are bundled since
// they have no browser CDN/global equivalent.
var umdExternal = external.filter(function (dep) { return dep.startsWith('d3-') })

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.js',
    output: {
      file: pkg.main,
      name: 'd3',
      extend: true,
      format: 'umd',
      globals: {
        'd3-array': 'd3',
        'd3-interpolate': 'd3',
        'd3-path': 'd3',
        'd3-shape': 'd3'
      }
    },
    external: umdExternal,
    plugins: [
      resolve(),
      commonjs()
    ]
  },

  // ES module build (for bundlers)
  {
    input: 'src/index.js',
    output: [
      {
        file: pkg.module,
        format: 'es',
        name: 'd3',
        extend: true,
        globals: {
          'd3-array': 'd3',
          'd3-interpolate': 'd3',
          'd3-path': 'd3',
          'd3-shape': 'd3'
        }
      }
    ],
    external,
    plugins: [
      resolve(),
      commonjs()
    ]
  }
]
