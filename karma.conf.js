process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = (config) => {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    browsers: ['ChromeHeadless'],

    plugins: ['karma-*'],

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'karma-typescript'],

    files: ['src/*.ts', 'test/**/*.spec.ts'],

    preprocessors: {
      // add webpack as preprocessor
      '**/*.ts': 'karma-typescript',
    },

    karmaTypescriptConfig: {
      reports: {},
      tsconfig: './tsconfig.json',
      include: {
        mode: 'merge',
        values: ['./test/**/*'],
      },
      remapOptions: {
        //warnMissingSourceMaps: false //not supported by currently included remap-istanbul
        warn(warning) {
          if (
            warning &&
            !/^Could not find source map for/.test(warning.message)
          ) {
            console.warn(warning);
          }
        },
      },
      bundlerOptions: {
        transforms: [require('karma-typescript-es6-transform')()],
      },
    },

    reporters: ['progress', 'karma-typescript'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    concurrency: Infinity,

    logLevel: config.LOG_INFO,
  });
};
