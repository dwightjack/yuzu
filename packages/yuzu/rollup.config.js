const pkg = require('./package.json');
const globals = {
  'yuzu-utils': 'YZ.Utils',
};
module.exports = require('../../config/rollup.config')(pkg, globals);
