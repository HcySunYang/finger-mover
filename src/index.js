import {
    throwError,
    getStyle,
    now as timeNow,
    extend,
    is3DMatrix,
    cssText,
    getRelativeRect,
    isInElement,
    transform,
    getPropFromMatrix,
    toArray
} from './shared/util'
import Moved from './moved/moved'
import Animationframe from './moved/animationframe'
import TW from './moved/tw'
import Fingerd from './fingerd/fingerd'

export default class Fmover {
    constructor (options) {
        options = options ? options : {}
        /* istanbul ignore if */
        if (!(this instanceof Fmover)) {
            throwError('Fmover is a constructor and should be called with the `new` keyword')
        }
        this._init(options)
    }

    _init (options) {
        this.el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
        if (!this.el) {
            throwError(`This is an invalid selector: ${options.el}`)
        }

        this.fingerd = new Fingerd({
            element: this.el
        })
        this.plugins = options.plugins || []
        this.pluginsStorage = []

        this._initPlugins()
        this._initStyle()
        this._initEvents()
    }

    _initPlugins () {
        let pluginLen = this.plugins.length
        for (let i = 0; i < pluginLen; i++) {
            this[i] = this.plugins[i](Fmover)
            this.pluginsStorage.push(this[i])
        }

        let pluginStorLen = this.pluginsStorage.length
        for (let i = 0; i < pluginStorLen; i++) {
            this.pluginsStorage[i].init && this.pluginsStorage[i].init(this)
        }
    }

    _initStyle () {
        if (!is3DMatrix(this.el)) {
            transform(this.el, 'translateZ', 0.01)
        }
    }

    _initEvents () {
        const el = this.el
 
        el.addEventListener('touchstart', this._start.bind(this), false)
        el.addEventListener('touchmove', this._move.bind(this), false)
        el.addEventListener('touchend', this._end.bind(this), false)
        el.addEventListener('touchcancel', this._cancel.bind(this), false)
    }
    /* istanbul ignore next */
    _start (event) {
        const F = this.fingerd.injectEvent(event)
        let fingerLen = F.fingers.length
        for (let i = 0; i < fingerLen; i++) {
            F.fingers[i].el = this.el
        }

        let pluginLen = this.pluginsStorage.length
        for (let i = 0; i < pluginLen; i++) {
            this.pluginsStorage[i].start && this.pluginsStorage[i].start(F)
        }
    }
    /* istanbul ignore next */
    _move (event) {
        const F = this.fingerd.injectEvent(event)
        let returnVal
        let pluginStorLen = this.pluginsStorage.length
        for (let i = 0; i < pluginStorLen; i++) {
            returnVal = this.pluginsStorage[i].move && this.pluginsStorage[i].move(F)
        }

        if (typeof returnVal !== 'undefined' && !returnVal) {
            event.stopPropagation()
        }
        event.preventDefault()
    }
    /* istanbul ignore next */
    _end (event) {
        const F = this.fingerd.injectEvent(event)

        let pluginStorLen = this.pluginsStorage.length
        for (let i = 0; i < pluginStorLen; i++) {
            this.pluginsStorage[i].end && this.pluginsStorage[i].end(F)
        }
    }
    /* istanbul ignore next */
    _cancel (event) {
        const F = this.fingerd.injectEvent(event)

        let pluginStorLen = this.pluginsStorage.length
        for (let i = 0; i < pluginStorLen; i++) {
            this.pluginsStorage[i].cancel && this.pluginsStorage[i].cancel(F)
        }

        event.preventDefault()
    }

}

installGlobal(Fmover)

function installGlobal (Fmover) {
    Fmover.Moved = Moved
    Fmover.Fingerd = Fingerd
    Fmover.extend = extend
    Fmover.now = timeNow
    Fmover.getStyle = getStyle
    Fmover.cssText = cssText
    Fmover.getPropFromMatrix = getPropFromMatrix
    Fmover.getRelativeRect = getRelativeRect
    Fmover.isInElement = isInElement
    Fmover.throwError = throwError
    Fmover.toArray = toArray
}