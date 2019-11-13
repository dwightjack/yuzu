const { amdName } = require('./package.json');

module.exports = {
  rollup(config, { format }) {
    if (format === 'umd') {
      config.output.name = amdName;
    }
    return config; // always return a config.
  },
};
