import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

import { version, name, license, author, homepage } from './package.json';

const banner = `
/**!
 * ${name} - v${version}
 * ${homepage}
 * Copyright (c) ${(new Date().getFullYear())} - ${author};
 * @license Licensed ${license}
 */
`;

const baseConfig = {
    entry: 'src/index.js',
    format: 'umd',
    moduleName: 'YZ',
    amd: { id: 'yuzu' },
    plugins: [
        resolve({
            preferBuiltins: false
        }),
        commonjs(),
        babel({
            exclude: 'node_modules/**' // only transpile our source code
        })
    ],
    external: ['tsumami', 'tsumami/lib/events'],
    globals: {
        tsumami: 'tsumami.dom',
        'tsumami/lib/events': 'tsumami'
    },
    dest: 'umd/index.js',
    banner,
    sourceMap: true
};

export default [
    baseConfig,
    Object.assign({}, baseConfig, {
        dest: 'umd/index.min.js',
        plugins: baseConfig.plugins.concat([uglify()])
    })
];