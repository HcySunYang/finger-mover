import {
    now,
    getAbsMaxFromArray,
    extend,
    isInElement
} from '../shared/util'

const MIN_INSTANT_TIME = 15
let eventCid = 0
const A = 0.001

export function getTransTime (v, a) {
    let acceleration = a || A
    return v == 0 ? 0 : (Math.abs(v / acceleration) * 2.5)
}
export function fingerInElement (el, x, y) {
    let node = document.elementFromPoint(x, y)
    if (!node) {
        return false
    }
    return isInElement(el, node)
}
export function computeAcceleration (t, v) {
    return v === 0 ? 0 : (-v / t) * 4
}
export function computeTransDistance (a, v) {
    let acceleration = a || A
    return v === 0 ? 0 : (v * v / -(2 * a))
}

export default class Tevent {
    constructor (options) {
        this.id = eventCid++
        this._init(options)
    }

    _init (options) {
        let opa = extend({
            element: null,
            transTime: 3000
        }, options)
        this.element = opa.element
        this.native = null
        this.startTime =
        this.startX =
        this.startY =
        this.distanceX =
        this.distanceY =
        this.lastX =
        this.lastY =
        this.lastTime =
        this.xv =
        this.yv =
        this.xs =
        this.ys =
        this.xt =
        this.yt =
        this.xa =
        this.ya =
        this.transDistanceX =
        this.transDistanceY = 0
        this.transTime = opa.transTime

        this.direction = {
            top: false,
            bottom: false,
            left: false,
            right: false,
            topLeft: false,
            topRight: false,
            bottomLeft: false,
            bottomRight: false
        }

        this.fingerInElement = false
        this.isMoveOut = false

        this.velocityQueueX = []
        this.velocityQueueY = []
    }

    start (event) {
        if (this.element) {
            this.fingerInElement = fingerInElement(this.element, event.clientX, event.clientY)
        }
        this.native = event
        this.isMoveOut = false
        this.lastX = this.startX = event.pageX
        this.lastY = this.startY = event.pageY
        this.startTime = this.lastTime = now()
    }

    move (event) {
        if (this.element) {
            this.fingerInElement = fingerInElement(this.element, event.clientX, event.clientY)
            if (!this.fingerInElement) {
                if (!this.isMoveOut) {
                    this.end(event)
                    this.isMoveOut = true
                }
                return false
            }
        }
        this.native = event
        this.distanceX = event.pageX - this.startX
        this.distanceY = event.pageY - this.startY
        this.xs = event.pageX - this.lastX
        this.lastX = event.pageX
        this.ys = event.pageY - this.lastY
        this.lastY = event.pageY

        this.checkDirection()

        let timeNow = now()
        this.xt = this.yt = (timeNow - this.lastTime) || MIN_INSTANT_TIME
        this.lastTime = timeNow

        this.xv = this.xs / this.xt
        this.yv = this.ys / this.yt

        this.velocityBufferQueue()

        this.xv = getAbsMaxFromArray(this.velocityQueueX)
        this.yv = getAbsMaxFromArray(this.velocityQueueY)

        this.xa = computeAcceleration(this.transTime, this.xv)
        this.ya = computeAcceleration(this.transTime, this.yv)
    }

    end (event) {
        if (this.element) {
            this.fingerInElement = fingerInElement(this.element, event.clientX, event.clientY)
        }
        this.native = event
        this.transDistanceX = computeTransDistance(this.xa, this.xv)
        this.transDistanceY = computeTransDistance(this.ya, this.yv)
    }

    velocityBufferQueue () {
        if (this.velocityQueueX.length > 1) {
            this.velocityQueueX.shift()
        }
        if (this.velocityQueueY.length > 1) {
            this.velocityQueueY.shift()
        }
        this.velocityQueueX.push(this.xv)
        this.velocityQueueY.push(this.yv)
    }

    checkDirection () {
        if (this.xs < 0) {
            this.direction.left = true
            this.direction.right = false
        }
        if (this.xs === 0) {
            this.direction.left = false
            this.direction.right = false
        }
        if (this.xs > 0) {
            this.direction.left = false
            this.direction.right = true
        }
        if (this.ys < 0) {
            this.direction.top = true
            this.direction.bottom = false
        }
        if (this.ys === 0) {
            this.direction.top = false
            this.direction.bottom = false
        }
        if (this.ys > 0) {
            this.direction.top = false
            this.direction.bottom = true
        }
        this.direction.topLeft = this.direction.top && this.direction.left
        this.direction.topRight = this.direction.top && this.direction.right
        this.direction.bottomLeft = this.direction.bottom && this.direction.left
        this.direction.bottomRight = this.direction.bottom && this.direction.right
    }

    takeover (prev) {
        let event = prev
        this.distanceX = event.distanceX
        this.distanceY = event.distanceY
        this.startX = this.lastX - this.distanceX
        this.startY = this.lastY - this.distanceY

        this.lastTime = now()
    }
}