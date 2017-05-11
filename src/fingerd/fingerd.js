import {
    toArray,
    extend
} from '../shared/util'
import Tevent from './tevent'

const EVENT_TYPE = {
    touchstart: 'touchstart',
    touchmove: 'touchmove',
    touchend: 'touchend',
    touchcancel: 'touchcancel'
}

export default class Fingerd {
    constructor (options) {
        this.options = extend({
            element: null,
            transTime: 3000
        }, options)
        this.fingers = []
        this.changeFingerIndex = 0
        this.fingerNumber = 0
    }

    injectEvent (event) {
        let eventType = event.type
        let fingers = getTouches(event)
        let changeFingers = getChangedTouches(event)

        if (eventType === EVENT_TYPE.touchstart) {
            let changeFingerLen = changeFingers.length
            for (let i = 0; i < changeFingerLen; i++) {
                let id = changeFingers[i].identifier,
                    tevent = new Tevent(this.options)

                tevent.start(changeFingers[i])

                if (this.fingerNumber === 0) {
                    this.fingers.length = 0
                }
                this.fingers.push(tevent)

                let fingerFromId = this.getFingerById(this.fingers, id),
                    f = fingerFromId.finger,
                    pos = fingerFromId.pos

                this.fingerNumber = this.fingers.length
                this.changeFingerIndex = pos
            }
        }

        if (eventType === EVENT_TYPE.touchmove) {
            let changeFingerLen = changeFingers.length
            for (let i = 0; i < changeFingerLen; i++) {
                let id = changeFingers[i].identifier,
                    fingerFromId = this.getFingerById(this.fingers, id),
                    f = fingerFromId.finger,
                    pos = fingerFromId.pos

                if (!f.fingerInElement) {
                    return this
                }
                this.fingerNumber = this.fingers.length
                this.changeFingerIndex = pos
                f.move(changeFingers[i])

                if (!f.fingerInElement) {
                    this.forceRemove(fingerFromId, changeFingers[i])
                }
            }
        }

        if (eventType === EVENT_TYPE.touchend || eventType === EVENT_TYPE.touchcancel) {
            // The mobile end limits up to 5 fingers at the same time touch the screen
            if (this.fingerNumber >= 5 && eventType === EVENT_TYPE.touchcancel) {
                this.fingerNumber = 0
                this.fingers.length = 0
                return this
            }
            let changeFingerLen = changeFingers.length
            for (let i = 0; i < changeFingerLen; i++) {
                let id = changeFingers[i].identifier,
                    fingerFromId = this.getFingerById(this.fingers, id),
                    f = fingerFromId.finger

                if (!f.fingerInElement) {
                    return this
                }
                this.forceRemove(fingerFromId, changeFingers[i])
            }
        }
        
        return this
        
    }

    getFingerPicth (f1, f2) {
        let p1 = {
            x: f1.native.clientX,
            y: f1.native.clientY
        }
        let p2 = {
            x: f2.native.clientX,
            y: f2.native.clientY
        }

        return getTowPointsDis(p1, p2)
    }

    getScale (f1, f2) {
        let startP1 = {
            x: f1.startX,
            y: f1.startY
        }
        let startP2 = {
            x: f2.startX,
            y: f2.startY
        }
        let startDis = getTowPointsDis(startP1, startP2)
        let currentDis = this.getFingerPicth(f1, f2)
        
        return (currentDis / startDis)
    }

    getFingerById (fingers, id) {
        let finger = null,
            pos = 0,
            fingersLen = fingers.length

        for (let i = 0; i < fingersLen; i++) {
            if (fingers[i].native.identifier === id) {
                finger = fingers[i]
                pos = i
                break
            }
        }
        return {
            finger: finger,
            pos: pos
        }
    }

    forceRemove (fingerFromId, nativeEvent) {
        let f = fingerFromId.finger,
            pos = fingerFromId.pos,
            next = this.fingers[pos + 1],
            prev = this.fingers[pos - 1]

        this.changeFingerIndex = pos
        f.end(nativeEvent)
        if (next) {
            next.takeover(f)
            this.fingers.splice(pos, 1)
            this.fingerNumber = this.fingers.length
        } else if (prev) {
            this.fingers.splice(pos, 1)
            this.fingerNumber = this.fingers.length
        } else {
            this.fingerNumber--
        }
    }
}

function radTodeg (rad) {
    return 180 / Math.PI * rad
}

function getTowPointsDis (p1, p2) {
    let x = p1.x - p2.x,
        y = p1.y - p2.y
    return Math.sqrt(x * x + y * y)
}

function getTouches (event, pos) {
    if (typeof pos !== 'undefined') {
        return event.touches[pos] || {}
    }
    return toArray(event.touches)
}

function getChangedTouches (event, pos) {
    if (typeof pos !== 'undefined') {
        return event.changedTouches[pos] || {}
    }
    return toArray(event.changedTouches)
}