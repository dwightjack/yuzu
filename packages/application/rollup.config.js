const pkg = require('./package.json');
const globals = {
  'yuzu-utils': 'YZ.Utils',
  yuzu: 'YZ',
};
module.exports = require('../../config/rollup.config')(pkg, globals);
