import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize'

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
    babel({
        plugins: ['external-helpers', 'transform-flow-strip-types'],
        exclude: 'node_modules/**' // only transpile our source code
    }),
    resolve({
        preferBuiltins: false
    }),
    commonjs()
];

const baseConfig = {
    input: 'src/index.js',
    amd: { id: 'yuzu' },
    external: ['tsumami', 'tsumami/lib/events'],
    banner
};

const output = (file) => ({
    file,
    format: 'umd',
    sourcemap: true,
    name: 'YZ',
    globals: {
        tsumami: 'tsumami.dom',
        'tsumami/lib/events': 'tsumami'
    }
});

export default [
    Object.assign({
        output: output('umd/index.js'),
        plugins: [...plugins, filesize()]
    }, baseConfig),
    Object.assign({
        output: output('umd/index.min.js'),
        plugins: [...plugins, uglify({
            warnings: false,
            mangle: true,
            compress: {
                pure_funcs: ['classCallCheck']
            },
            output: {
                beautify: false
            }
        }), filesize()]
    }, baseConfig)
];