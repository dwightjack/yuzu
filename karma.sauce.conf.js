const baseConfig = require('./karma.conf').baseConfig;
const pkg = require('./package.json');

const customLaunchers = {
    sl_chrome: {
        base: 'SauceLabs',
        browserName: 'chrome',
        platform: 'Windows 10',
        version: 'latest'
    },
    sl_firefox: {
        base: 'SauceLabs',
        browserName: 'firefox',
        platform: 'Windows 10',
        version: 'latest'
    },

    sl_mac_safari: {
        base: 'SauceLabs',
        browserName: 'safari',
        platform: 'OS X 10.10'
    },

    sl_ie_9: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 7',
        version: '9'
    },
    sl_ie_11: {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 8.1',
        version: '11'
    },
    sl_edge: {
        base: 'SauceLabs',
        browserName: 'MicrosoftEdge',
        platform: 'Windows 10'
    },

    sl_android_5_1: {
        base: 'SauceLabs',
        browserName: 'android',
        version: '5.1'
    },
    sl_ios_safari_9: {
        base: 'SauceLabs',
        browserName: 'iphone',
        version: '9.3'
    }
};

module.exports = (config) => {

    if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
        console.log('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.'); //eslint-disable-line no-console
        process.exit(1);
    }

    config.set(Object.assign({}, baseConfig, {

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG

        logLevel: config.LOG_INFO,

        customLaunchers,

        browsers: Object.keys(customLaunchers),

        reporters: ['progress', 'saucelabs'],

        sauceLabs: {
            testName: 'vue-types',
            recordScreenshots: false,
            build: `${pkg.version}-${Date.now()}`
        },

        captureTimeout: 300000,
        browserNoActivityTimeout: 300000
    }));
};