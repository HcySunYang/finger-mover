const rollup = require('rollup')
const fs = require('fs')
const path = require('path')
const uglify = require('uglify-js')
const {genMainConfig, genPackageConfig, genPluginConfig} = require('./rollup.config')
const pluginsList = [
    'simulation-scroll-x',
    'simulation-scroll-y',
    'fmover-slide-x',
    'fmover-slide-y'
]
const packageList = [
    'fingerd',
    'moved'
]
let allConfig = []
let allDevConfig = []
let allProdConfig = []

allDevConfig.push(genMainConfig('finger-mover'))
allProdConfig.push(genMainConfig('finger-mover.min'))
packageList.forEach((name) => {
    allDevConfig.push(genPackageConfig(name))
    allProdConfig.push(genPackageConfig(`${name}.min`))
})
pluginsList.forEach((name) => {
    allDevConfig.push(genPluginConfig(name))
    allProdConfig.push(genPluginConfig(`${name}.min`))
})

allConfig = allDevConfig.concat(allProdConfig)

if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist')
}

allConfig.forEach((config) => {
    rollup.rollup(config).then((bundle) => {
        let code = bundle.generate(config).code
        let isProd = /min\.js$/.test(config.dest)
        if (isProd) {
            code = config.banner + uglify.minify(code, {
                fromString: true,
                output: {
                    screw_ie8: true,
                    ascii_only: true
                },
                compress: {
                    pure_funcs: ['makeMap']
                }
            }).code
        }

        mkdirsSync(path.dirname(config.dest))
        fs.writeFileSync(config.dest, code, 'utf8')
        report(config.dest, code)
    }).catch((e) => {
        console.log(e)
    })
})

function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname)
            return true
        }
    }
}
function report (dest, code) {
    console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code))
}
function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}
function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}
