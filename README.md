
<p align="center"><a href="https://fmover.hcysun.me" target="_blank"><img width="400" src="https://fmover.hcysun.me/asset/big.png"></a></p>

<p align="center">
<a href="https://www.npmjs.com/package/finger-mover"><img src="https://img.shields.io/npm/v/finger-mover.svg"/></a>
<a href="https://www.npmjs.com/package/finger-mover"><img src="https://img.shields.io/npm/dt/finger-mover.svg"/></a>
<a href="https://www.npmjs.com/package/finger-mover"><img src="https://img.shields.io/npm/l/finger-mover.svg"/></a>
<a href="https://circleci.com/gh/HcySunYang/finger-mover/tree/dev"><img src="https://img.shields.io/circleci/project/HcySunYang/finger-mover/dev.svg"/></a>
<a href="https://codecov.io/github/HcySunYang/finger-mover?branch=dev"><img src="https://img.shields.io/codecov/c/github/HcySunYang/finger-mover/dev.svg"/></a>
</p>

## Intro

`finger-mover` is a motion effect library that integrates
[Fingerd (a development kit for finger unit event management in mobile development)](https://fmover.hcysun.me/#/package/fingerd)
and
[Moved (a micro movement framework)](https://fmover.hcysun.me/#/package/moved). `finger-mover` provides many useful plugins, such as [Vertical scroll simulation (simulation-scroll-y.js)](https://fmover.hcysun.me/#/plugins/simulation-scroll-y), [Horizontal scroll simulation (simulation-scroll-x.js)](https://fmover.hcysun.me/#/plugins/simulation-scroll-x) and so on.

## Docs

[English](https://fmover.hcysun.me/#/home) • [中文文档](https://fmover.hcysun.me/#/zh-cn/)

## Features

* Just 11.12KB after compression

* Plugin support, motion components are available as plug-ins, thsi is a plug-in list：
    * [Vertical scroll simulation](https://fmover.hcysun.me/#/plugins/simulation-scroll-y)
    * [Horizontal scroll simulation](https://fmover.hcysun.me/#/plugins/simulation-scroll-x)
    * [2D scrolling](https://fmover.hcysun.me/#/plugins/2d-scroll)
    * [Horizontal slide show](https://fmover.hcysun.me/#/plugins/fmover-slide-x)
    * [Vertical slide show](https://fmover.hcysun.me/#/plugins/fmover-slide-y)

## Install

#### NPM

```
npm install --save finger-mover
```

#### yarn

```
yarn add finger-mover
```

`finger-mover` released as a `umd` module. You can use it in any way for your favorite. You can get global variable `Fmover` by serving as `<script>` tag.

## Usage

```js
// Import finger-mover
import Fmover from 'finger-mover'
// Import vertical scroll simulation plugin simulation-scroll-y
import simulationScrollY from 'simulation-scroll-y'
// Import horizontal scroll simulation plugin simulation-scroll-x
import simulationScrollX from 'simulation-scroll-x'

// While using both simulation-scroll-y and simulation-scroll-x plugins to implement 2D scrolling
let fm = new Fmover({
    el: '#scroll-box',
    plugins: [
        simulationScrollX(),
        simulationScrollY()
    ]
})
```

## package

###### [Fingerd](https://fmover.hcysun.me/#/package/fingerd)

> `Fingerd` is a development kit for finger unit event management in mobile development

###### [Moved](https://fmover.hcysun.me/#/package/moved)

> `Moved` is a micro movement framework.

## Contribution

Contributions are welcome! Open a pull request to fix a bug, or open an issue to discuss a new feature or change.

## Credits

Thanks [Ri Xu](https://xuri.me) provides web hosting service and doc translation.

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2017, HcySunYang