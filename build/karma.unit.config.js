var base = require('./karma.base.config.js')

module.exports = function (config) {
    config.set(Object.assign(base, {
        browsers: ['PhantomJS'],
        // browsers: ['Safari'],
        reporters: ['mocha', 'coverage'],
        coverageReporter: {
            reporters: [
                {
                    type: 'lcov',
                    dir: '../coverage',
                    subdir: '.' 
                },
                {
                    type: 'text-summary',
                    dir: '../coverage',
                    subdir: '.'
                }
            ]
        },
        singleRun: true
    }))
}