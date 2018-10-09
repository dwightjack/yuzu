const pkg = require('./package.json');
const config = require('../../config/rollup.config')(pkg);

console.log(config[config.length - 1]);
module.exports = config;
