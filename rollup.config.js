import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import bundlesize from 'rollup-plugin-bundle-size'

import { version, name, license, author, homepage } from './package.json';

const banner = `
/**!
 * ${name} - v${version}
 * ${homepage}
 * Copyright (c) ${(new Date().getFullYear())} - ${author};
 * @license Licensed ${license}
 */
`;

const plugins = [
    resolve({
        preferBuiltins: false
    }),
    commonjs(),
    babel({
        exclude: 'node_modules/**' // only transpile our source code
    })
];

const baseConfig = {
    entry: 'src/index.js',
    format: 'umd',
    moduleName: 'YZ',
    amd: { id: 'yuzu' },
    external: ['tsumami', 'tsumami/lib/events'],
    globals: {
        tsumami: 'tsumami.dom',
        'tsumami/lib/events': 'tsumami'
    },
    banner,
    sourceMap: true
};

export default [
    Object.assign({
        dest: 'umd/index.js',
        plugins: [...plugins, bundlesize()]
    }, baseConfig),
    Object.assign({
        dest: 'umd/index.min.js',
        plugins: [...plugins, uglify({
            warnings: false,
            mangle: true,
            compress: {
                pure_funcs: ['classCallCheck']
            },
            output: {
                beautify: false
            }
        }), bundlesize()]
    }, baseConfig)
];