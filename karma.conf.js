process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = (config) => {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',

    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '–disable-setuid-sandbox'],
      },
    },

    browsers: ['ChromeHeadless'],

    plugins: ['karma-*'],

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'karma-typescript'],

    files: [
      'shared/utils.ts',
      'shared/__fixtures__/*.html',
      'packages/*/src/*.ts',
      'packages/*/test/*.spec.ts',
    ],

    exclude: ['packages/polyfills/**/*'],

    html2JsPreprocessor: {
      processPath: function(filePath) {
        return (filePath.match(/.+?\/__fixtures__\/(.+)/) || [])[1];
      },
    },

    preprocessors: {
      '**/*.ts': 'karma-typescript',
      '**/*.html': 'html2js',
    },

    karmaTypescriptConfig: {
      reports: process.env.CIRCLECI
        ? {
            lcovonly: {
              directory: 'coverage',
              filename: 'lcov.info',
            },
          }
        : {
            text: '',
          },
      tsconfig: './tsconfig.json',
      include: {
        mode: 'merge',
        values: ['packages/*/test/*.spec.ts'],
      },
      remapOptions: {
        //warnMissingSourceMaps: false //not supported by currently included remap-istanbul
        warn: function(warning) {
          if (
            warning &&
            !/^Could not find source map for/.test(warning.message)
          ) {
            console.warn(warning);
          }
        },
      },
      bundlerOptions: {
        exclude: ['yuzu/types'],
        transforms: [require('karma-typescript-es6-transform')()],
        entrypoints: /\.spec\.ts$/,
      },

      compilerOptions: {
        sourceMap: true,
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
