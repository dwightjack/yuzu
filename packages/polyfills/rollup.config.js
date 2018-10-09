const pkg = require('./package.json');
const config = require('../../config/rollup.config')(pkg);

module.exports = config;
