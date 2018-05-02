import TW from './tw'
import {
    getStyle,
    transform,
    getPropFromMatrix
} from '../shared/util'
import Animationframe from './animationframe'

const MOVE_STATUS = {
    start: 'start',
    stop: 'stop'
}

let cid = 0
export default class Moved {
    constructor () {
        this.moveStatus = MOVE_STATUS.stop
        this.isArrivals = false
        /* istanbul ignore if */
        if (!(this instanceof Moved)) {
            throwError('Moved is a constructor and should be called with the `new` keyword')
        }
    }

    start (options) {
        if (this.moveStatus === MOVE_STATUS.start) {
            return
        }
        options = options ? options : {}
        let {el, target, type, time, endCallBack, inCallBack, s} = options
        this.isArrivals = false
        this.id = cid++
        this.el = el
        this.target = target
        this.type = type || 'easeOutStrong'
        this.time = time <= 1 ? 1 : time
        this.endCallBack = endCallBack
        this.inCallBack = inCallBack
        this.currentPos = {}
        this.moveStatus = MOVE_STATUS.start

        this.b = {}
        this.c = {}
        this.d = this.time
        this.s = s
        for (let attr in this.target) {
            this.b[attr] = getPropFromMatrix(this.el)[attr]
            this.c[attr] = this.target[attr] - this.b[attr]
            if (this.c[attr] === 0) {
                this.isArrivals = true
            }
        }
        if (this.isArrivals) {
            this.endCallBack && this.endCallBack(this.b)
            this.moveStatus = MOVE_STATUS.stop
            return false
        }

        this.anim = new Animationframe(this._moveHandle.bind(this))
    }

    stop (callback) {
        if (this.moveStatus === MOVE_STATUS.stop || !this.anim) {
            return this
        }
        this.moveStatus = MOVE_STATUS.stop
        this.anim.cancel()
        for (let attr in this.target) {
            transform(this.el, attr, this.currentPos[attr])
        }
        callback && callback(this.currentPos)
        return this
    }

    transform (el, attr, val) {
        transform(el, attr, val)
    }

    getPropFromMatrix (el) {
        return getPropFromMatrix(el)
    }

    _moveHandle (t) {
        t = t >= this.d ? this.d : t
        for (let attr in this.target) {
            this.currentPos[attr] = Moved.Tween[this.type](t, this.b[attr], this.c[attr], this.d, this.s)
            transform(this.el, attr, this.currentPos[attr])
        }
        this.moveStatus = MOVE_STATUS.start
        this.inCallBack && this.inCallBack.call(this, this.currentPos)

        if (t >= this.d) {
            this.stop(this.endCallBack)
        } else {
            this.anim.request()
        }
    }
}

Moved.Tween = TW
