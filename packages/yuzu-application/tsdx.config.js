const { amdName } = require('./package.json');
const pkgUtils = require('../yuzu-utils/package.json');
const pkgCore = require('../yuzu/package.json');

module.exports = {
  rollup(config, { format }) {
    if (format === 'umd') {
      config.output.name = amdName;
      config.output.globals = {
        'yuzu-utils': pkgUtils.amdName,
        yuzu: pkgCore.amdName,
      };
    }
    return config; // always return a config.
  },
};
