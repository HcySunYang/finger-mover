const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

let baseConfig = {
    entry: {
        ssy: 'demo/simulation-scroll-y/main.js'
    },
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: '[name].js',
        publicPath: '/'
    },
    resolve: {
        extensions: ['.js', '.vue'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            'demo': path.resolve(__dirname, '../demo/vue-component'),
            'component': path.resolve(__dirname, '../src/vue-component'),
            'plugins': path.resolve(__dirname, '../src/plugins')
        }
    },
    module: {
        rules: [
            {
                test: /\.(js|vue)$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                include: [
                    path.resolve(__dirname ,'../demo/vue-component'),
                    path.resolve(__dirname, '../src')
                ],
                options: {
                    formatter: require('eslint-friendly-formatter')
                }
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [
                    path.resolve(__dirname ,'../demo/vue-component'),
                    path.resolve(__dirname, '../src')
                ]
            }
        ]
    },
    devtool: '#cheap-module-eval-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"development"'
        }),
        // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        // https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve(__dirname, '../demo/vue-component/simulation-scroll-y/index.html'),
            inject: true
        }),
        new FriendlyErrorsPlugin()
    ]
}

Object.keys(baseConfig.entry).forEach(name => {
    baseConfig.entry[name] = ['./build/dev-client'].concat(baseConfig.entry[name])
})

module.exports = baseConfig