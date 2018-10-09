const path = require('path');
const commonjs = require('rollup-plugin-commonjs');
const resolve = require('rollup-plugin-node-resolve');
const typescript = require('rollup-plugin-typescript2');
const { uglify } = require('rollup-plugin-uglify');
const replace = require('rollup-plugin-replace');
const filesize = require('rollup-plugin-filesize');
const alias = require('rollup-plugin-alias');

const banner = (pkg) => `
/*! ${pkg.name} - v${pkg.version}
 * ${pkg.homepage}
 * Copyright (c) ${new Date().getFullYear()} - ${pkg.author};
 * Licensed ${pkg.license}
 */
`;

const cwd = process.cwd();

const tsconf = {
  tsconfig: path.join(__dirname, '../tsconfig.rollup.json'),
  typescript: require('typescript'),
  exclude: 'node_modules/**',
  useTsconfigDeclarationDir: true,
  tsconfigDefaults: {
    compilerOptions: {
      baseUrl: cwd,
      typeRoots: ['./types', path.resolve(cwd, '../../node_modules/@types')],
    },
  },
};

const plugins = [resolve(), commonjs(), typescript(tsconf)];

const tsconfNext = Object.assign(
  {
    tsconfigOverride: {
      compilerOptions: {
        target: 'ES2017',
      },
    },
  },
  tsconf,
);

const pluginsNext = [...plugins.slice(0, -1), typescript(tsconfNext)];

const file = (filepath) => path.resolve(cwd, filepath);
let pkg = {};

try {
  pkg = require(path.resolve(cwd, 'package.json'));
} catch (e) {
  console.warn(e);
}

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const output = (obj) =>
  Object.assign(
    {
      sourcemap: true,
    },
    obj,
  );

const toAlias = (version) => {
  const map = external.reduce((acc, name) => {
    if (name === 'yuzu') {
      acc['yuzu'] = path.resolve(cwd, `../yuzu/dist/index.${version}.js`);
    } else if (name.startsWith('yuzu-')) {
      const [, package] = name.match(/^yuzu-(.+)$/);
      acc[package] = path.resolve(
        cwd,
        `../${package}/dist/index.${version}.js`,
      );
    }
    return acc;
  }, {});
  return alias(map);
};

module.exports = (pkg, globals) => [
  {
    input: './src/index.ts',
    output: [
      output({ file: file(pkg.main), format: 'cjs', banner: banner(pkg) }),
      output({ file: file(pkg.module), format: 'esm', banner: banner(pkg) }),
    ],
    external,
    plugins: [...plugins, filesize(), toAlias('m')],
  },
  {
    input: './src/index.ts',
    output: [
      output({
        file: file(pkg.module.replace('.m.', '.next.')),
        format: 'esm',
        banner: banner(pkg),
      }),
    ],
    external,
    plugins: [...pluginsNext, filesize(), toAlias('m')],
  },
  {
    input: './src/index.ts',
    output: output({
      file: file(pkg.unpkg),
      format: 'umd',
      name: pkg.amdName,
      extend: true,
      banner: banner(pkg),
      globals,
    }),
    external,
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      toAlias('umd'),
      ...plugins,
      // uglify({
      //   warnings: false,
      //   mangle: true,
      //   keep_fnames: true,
      //   compress: {
      //     pure_funcs: ['warn'],
      //   },
      //   output: {
      //     comments: /^!/,
      //   },
      // }),
      filesize(),
    ],
  },
];
