const pkg = require('./package.json');
const configs = require('../../config/rollup.config')(pkg);

const umd = configs.pop();

umd.input = './src/index.umd.ts';

umd.external = [];

module.exports = [...configs, umd];
