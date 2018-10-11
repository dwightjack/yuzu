const pkg = require('./package.json');
module.exports = require('../../config/rollup.config')(pkg);
