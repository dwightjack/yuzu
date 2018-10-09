const pkg = require('./package.json');
const globals = {
  'yuzu-utils': 'YZ.Utils',
};
const configs = require('../../config/rollup.config')(pkg, globals);

const umd = configs.pop();

// umd.external = [];

module.exports = [...configs, umd];
