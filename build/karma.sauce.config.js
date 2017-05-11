var base = require('./karma.base.config.js')

var customLaunchers = {
    // Good browser
    // sl_chrome: {
    //     base: 'SauceLabs',
    //     browserName: 'chrome',
    //     platform: 'Windows 7'
    // },
    // sl_firefox: {
    //     base: 'SauceLabs',
    //     browserName: 'firefox'
    // },
    sl_mac_safari: {
        base: 'SauceLabs',
        browserName: 'safari',
        platform: 'OS X 10.10'
    }
    // IE
    // sl_ie_9: {
    //     base: 'SauceLabs',
    //     browserName: 'internet explorer',
    //     platform: 'Windows 7',
    //     version: '9'
    // },
    // sl_ie_10: {
    //     base: 'SauceLabs',
    //     browserName: 'internet explorer',
    //     platform: 'Windows 8',
    //     version: '10'
    // },
    // sl_ie_11: {
    //     base: 'SauceLabs',
    //     browserName: 'internet explorer',
    //     platform: 'Windows 8.1',
    //     version: '11'
    // },
    // sl_edge: {
    //     base: 'SauceLabs',
    //     browserName: 'MicrosoftEdge',
    //     platform: 'Windows 10'
    // },
    // // Mobile
    // sl_ios_safari_8: {
    //     base: 'SauceLabs',
    //     browserName: 'iphone',
    //     version: '8.4'
    // },
    // sl_ios_safari_9: {
    //     base: 'SauceLabs',
    //     browserName: 'iphone',
    //     version: '9.3'
    // },
    // sl_android_4_2: {
    //     base: 'SauceLabs',
    //     browserName: 'android',
    //     version: '4.2'
    // },
    // sl_android_5_1: {
    //     base: 'SauceLabs',
    //     browserName: 'android',
    //     version: '5.1'
    // }
}

module.exports = function (config) {
    config.set(Object.assign(base, {
        singleRun: true,
        browsers: Object.keys(customLaunchers),
        customLaunchers: customLaunchers,
        reporters: process.env.CI ? ['dots', 'saucelabs'] : ['progress', 'saucelabs'],
        sauceLabs: {
            testName: 'finger-mover unit tests',
            recordScreenshots: false,
            build: process.env.CIRCLE_BUILD_NUM || process.env.SAUCE_BUILD_ID || Date.now()
        },
        captureTimeout: 300000,
        browserNoActivityTimeout: 300000
    }))
}
