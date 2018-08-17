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
    tsconfig: path.join(__dirname, 'tsconfig.json'),
    typescript: require('typescript'),
    exclude: 'node_modules/**',
    tsconfigOverride: {
      compilerOptions: {
        module: 'ES2015',
      },
    },
  }),
];

const output = (obj) =>
  Object.assign(
    {
      format: 'umd',
      name: 'MyLib',
      sourcemap: true,
      banner,
    },
    obj,
  );

module.exports = [
  {
    input: './src/index.ts',
    output: output({ file: './umd/index.js' }),
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
    output: output({ file: './umd/index.min.js' }),
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
