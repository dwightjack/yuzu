const pkg = require('./package.json');
const cfg = require('../../config/rollup.config')(pkg);

module.exports = cfg.map((c) => Object.assign(c, { external: [] }));
