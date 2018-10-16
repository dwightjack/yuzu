const path = require('path');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const typescript = require('rollup-plugin-typescript2');
const replace = require('rollup-plugin-replace');
const serve = require('rollup-plugin-serve');
const livereload = require('rollup-plugin-livereload');

const tsconf = {
  tsconfig: path.join(__dirname, 'tsconfig.json'),
  typescript: require('typescript'),
  exclude: 'node_modules/**',
  useTsconfigDeclarationDir: true,
};

const plugins = [resolve(), commonjs(), typescript(tsconf)];

module.exports = {
  input: path.join(__dirname, 'src/index.ts'),
  output: {
    file: path.join(__dirname, 'tmp/bundle.js'),
    format: 'iife',
    name: 'YuzuDemo',
  },
  plugins: [
    ...plugins,
    replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    serve({
      host: '0.0.0.0',
      port: 8080,
      contentBase: 'examples/bundled',
    }),
    livereload('examples/bundled'),
  ],
};
