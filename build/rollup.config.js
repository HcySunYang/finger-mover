const eslint = require('rollup-plugin-eslint')
const buble = require('rollup-plugin-buble')
const pkg = require('../package.json')
const path = require('path')

const rollupPlugins = [
    eslint({
        useEslintrc: true,
        extensions: ['.js']
    }),
    buble()
]

function genMainConfig (mainName) {
    return {
        entry: path.resolve(__dirname, '../src/index.js'),
        dest: path.resolve(__dirname, `../dist/${mainName}.js`),
        banner: genBanner(mainName),
        format: 'umd',
        moduleName: 'Fmover',
        plugins:rollupPlugins
    }
}

function genPackageConfig (packageName) {
    let moduleName = packageName.replace(/\.min$/, ''),
        entryName = moduleName
    return {
        entry: path.resolve(__dirname, `../src/${entryName}/${entryName}.js`),
        dest: path.resolve(__dirname, `../src/${entryName}/dist/${packageName}.js`),
        banner: genBanner(packageName),
        format: 'umd',
        moduleName: initials(moduleName),
        plugins: rollupPlugins
    }
}

function genPluginConfig (pluginName) {
    let moduleName = pluginName.replace(/\.min$/, ''),
        entryName = moduleName
    return {
        entry: path.resolve(__dirname, `../src/plugins/${entryName}/${entryName}.js`),
        dest: path.resolve(__dirname, `../src/plugins/${entryName}/dist/${pluginName}.js`),
        banner: genBanner(pluginName),
        format: 'umd',
        moduleName: hyphenToCamel(moduleName),
        plugins:rollupPlugins
    }
}

function hyphenToCamel (str) {
    return str.replace(/-(\w)/g, function (all, letter) {
        return letter.toUpperCase()
    })
}
function initials (str) {
    return str.replace(/(^|\s+)\w/g, (s) => s.toUpperCase())
}
function genBanner (name) {
    return `/*!
 * ${name}.js v${pkg.version}
 * (c) ${new Date().getFullYear()} HcySunYang
 * Released under the MIT License.
 */`
}

if (process.env.TARGET === 'main') {
    module.exports = genMainConfig('finger-mover')
} else if (process.env.TARGET === 'plugin') {
    let pluginName = process.env.NAME
    module.exports = genPluginConfig(pluginName)
} else if (process.env.TARGET === 'package') {
    let packageName = process.env.PKGNAME
    module.exports = genPackageConfig(packageName)
} else {
    exports.genMainConfig = genMainConfig
    exports.genPackageConfig = genPackageConfig
    exports.genPluginConfig = genPluginConfig
}