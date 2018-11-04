const path = require('path');
const glob = require('fast-glob');
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

const plugins = [
  resolve(),
  commonjs(),
  typescript(tsconf),
  replace({
    'process.env.NODE_ENV': JSON.stringify('development'),
  }),
  livereload('examples'),
  serve({
    contentBase: ['examples', 'packages'],
    host: '0.0.0.0',
    port: 8080,
  }),
];

module.exports = glob
  .sync(['*/src/index.{ts,js}'], { cwd: __dirname })
  .map((entry) => ({
    input: path.join(__dirname, entry),
    output: {
      file: path.join(
        __dirname,
        entry.replace(/\/src\/index\.(ts|js)$/, '/tmp/bundle.js'),
      ),
      format: 'iife',
      name: 'YuzuDemo',
    },
    plugins,
  }));
