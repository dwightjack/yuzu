const pkg = require('./package.json');
const globals = {
  '@yuzu/utils': 'YZ.Utils',
  '@yuzu/core': 'YZ',
};
module.exports = require('../../config/rollup.config')(pkg, globals);
