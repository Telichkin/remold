import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: 'src/Remold.js',
  output: {
    file: 'lib/Remold.js',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    babel({
      exclude: ['node_modules/**', 'src/*.test.js']
    }),
    commonjs({
      namedExports: {
        'node_modules/react/index.js': [ 'Component', 'createElement' ]
      }
    }),
  ],
  external: [ 'react' ],
}