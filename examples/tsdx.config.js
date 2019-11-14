module.exports = {
  rollup(config, { format }) {
    if (format === 'umd') {
      config.external = [];
      config.output.name = 'YUZUExample';
    }
    return config; // always return a config.
  },
};
