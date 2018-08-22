const path = require('path');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const typescript = require('rollup-plugin-typescript2');
const { uglify } = require('rollup-plugin-uglify');
const replace = require('rollup-plugin-replace');
const filesize = require('rollup-plugin-filesize');

const { version, name, license, author, homepage } = require('./package.json');

const banner = `
/*! ${name} - v${version}
 * ${homepage}
 * Copyright (c) ${new Date().getFullYear()} - ${author};
 * Licensed ${license}
 */
`;

const plugins = [
  resolve(),
  commonjs(),
  typescript({
    tsconfig: path.join(__dirname, 'tsconfig.rollup.json'),
    typescript: require('typescript'),
    exclude: 'node_modules/**',
  }),
];

const cwd = process.cwd();
const file = (filepath) => path.resolve(cwd, filepath);
let pkg = {};

try {
  pkg = require(path.resolve(cwd, 'package.json'));
} catch (e) {
  console.warn(e);
}

const external = Object.keys(pkg.dependencies || {});

const output = (obj) =>
  Object.assign(
    {
      sourcemap: true,
      banner,
    },
    obj,
  );

module.exports = [
  {
    input: './src/index.ts',
    output: [
      output({ file: file(pkg.main), format: 'cjs' }),
      output({ file: file(pkg.module), format: 'esm' }),
    ],
    external,
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
      ...plugins,
      filesize(),
    ],
  },
  {
    input: './src/index.ts',
    output: output({
      file: file(pkg.unpkg),
      format: 'umd',
      name: pkg.amdName,
      extend: true,
      globals: {
        dush: 'dush',
      },
    }),
    external,
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      ...plugins,
      uglify({
        warnings: false,
        mangle: true,
        compress: {
          pure_funcs: ['warn'],
        },
        output: {
          comments: /^!/,
        },
      }),
      filesize(),
    ],
  },
];
