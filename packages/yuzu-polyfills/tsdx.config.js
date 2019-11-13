const { amdName } = require('./package.json');

module.exports = {
  rollup(config, { format }) {
    if (format === 'umd') {
      config.external = [];
    }
    return config; // always return a config.
  },
};
