const { amdName } = require('./package.json');

module.exports = {
  rollup(config, { format }) {
    if (format === 'umd') {
      config.input = './src/index.umd.ts';
      config.external = [];
      config.output.name = amdName;
    }
    return config; // always return a config.
  },
};
