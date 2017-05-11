import {
    requestAnim,
    cancelAnim,
    now
} from '../shared/util'

export default class Animationframe {
    constructor (handle) {
        this.handle = handle
        this.id = 0
        this._init()
    }

    _init () {
        this.start = now()
        this.request()
    }

    _fakeHandle () {
        let times = now() - this.start

        this.handle(times)
    }

    _requestAnimFn (handle) {
        if (requestAnim) {
            return requestAnim(handle)
        } else {
            return setTimeout(handle, 1000 / 60)
        }
    }

    _cancelAnimFn (id) {
        if (cancelAnim) {
            cancelAnim(id)
        } else {
            clearTimeout(id)
        }
    }

    request () {
        this.id = this._requestAnimFn(this._fakeHandle.bind(this))
    }

    cancel () {
        this._cancelAnimFn(this.id)
    }
}