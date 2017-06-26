const path = require('path')
const webpack = require('webpack')

let webpackConfig = {
    resolve: {
        alias: {
            Fmover: path.resolve(__dirname, '../src/index'),
            Moved: path.resolve(__dirname, '../src/moved/moved'),
            util: path.resolve(__dirname, '../src/shared/util')
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            options: {
                babel: {
                    plugins: [['istanbul', {
                        exclude: [
                            'test/',
                            'src/plugins',
                            'src/fingerd'
                        ]
                    }]]
                }
            }
        })
     ]
    
}

module.exports = {
    frameworks: ['jasmine'],
    files: [
        '../test/index.unit.js'
    ],
    preprocessors: {
        '../test/index.unit.js': ['webpack']
    },
    webpack: webpackConfig,
    webpackMiddleware: {
        noInfo: true
    }
}