/*!
 * fingerd.js v0.0.24
 * (c) 2017 HcySunYang
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Fingerd = factory());
}(this, (function () { 'use strict';

function toArray (data) {
    if (!Array.isArray(data)) {
        return Array.prototype.slice.call(data)
    }
    return data
}





function now () {
    return Date.now()
}

function extend (to) {
    var from = [], len = arguments.length - 1;
    while ( len-- > 0 ) from[ len ] = arguments[ len + 1 ];

    from.forEach(function (f) {
        for (var attr in f) {
            to[attr] = f[attr];
        }
    });
    
    return to
}




function isInElement (parent, child) {
    var num = parent.compareDocumentPosition(child);

    if (num === 0 || num === 20) {
        return true
    }
    return false
}







function getAbsMaxFromArray (arr) {
    var tempArr = arr.map(function (o) {
        return Math.abs(o)
    });
    var maxIndex = tempArr.indexOf(Math.max.apply(null, tempArr));
    return arr[maxIndex]
}

var MIN_INSTANT_TIME = 15;
var eventCid = 0;
var A = 0.001;


function fingerInElement (el, x, y) {
    var node = document.elementFromPoint(x, y);
    if (!node) {
        return false
    }
    return isInElement(el, node)
}
function computeAcceleration (t, v) {
    return v === 0 ? 0 : (-v / t) * 4
}
function computeTransDistance (a, v) {
    var acceleration = a || A;
    return v === 0 ? 0 : (v * v / -(2 * a))
}

var Tevent = function Tevent (options) {
    this.id = eventCid++;
    this._init(options);
};

Tevent.prototype._init = function _init (options) {
    var opa = extend({
        element: null,
        transTime: 3000
    }, options);
    this.element = opa.element;
    this.native = null;
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
    this.transDistanceY = 0;
    this.transTime = opa.transTime;

    this.direction = {
        top: false,
        bottom: false,
        left: false,
        right: false,
        topLeft: false,
        topRight: false,
        bottomLeft: false,
        bottomRight: false
    };

    this.fingerInElement = false;
    this.isMoveOut = false;

    this.velocityQueueX = [];
    this.velocityQueueY = [];
};

Tevent.prototype.start = function start (event) {
    if (this.element) {
        this.fingerInElement = fingerInElement(this.element, event.pageX, event.pageY);
    }
    this.native = event;
    this.isMoveOut = false;
    this.lastX = this.startX = event.pageX;
    this.lastY = this.startY = event.pageY;
    this.startTime = this.lastTime = now();
};

Tevent.prototype.move = function move (event) {
    if (this.element) {
        this.fingerInElement = fingerInElement(this.element, event.pageX, event.pageY);
        if (!this.fingerInElement) {
            if (!this.isMoveOut) {
                this.end(event);
                this.isMoveOut = true;
            }
            return false
        }
    }
    this.native = event;
    this.distanceX = event.pageX - this.startX;
    this.distanceY = event.pageY - this.startY;
    this.xs = event.pageX - this.lastX;
    this.lastX = event.pageX;
    this.ys = event.pageY - this.lastY;
    this.lastY = event.pageY;

    this.checkDirection();

    var timeNow = now();
    this.xt = this.yt = (timeNow - this.lastTime) || MIN_INSTANT_TIME;
    this.lastTime = timeNow;

    this.xv = this.xs / this.xt;
    this.yv = this.ys / this.yt;

    this.velocityBufferQueue();

    this.xv = getAbsMaxFromArray(this.velocityQueueX);
    this.yv = getAbsMaxFromArray(this.velocityQueueY);

    this.xa = computeAcceleration(this.transTime, this.xv);
    this.ya = computeAcceleration(this.transTime, this.yv);
};

Tevent.prototype.end = function end (event) {
    if (this.element) {
        this.fingerInElement = fingerInElement(this.element, event.pageX, event.pageY);
    }
    this.native = event;
    this.transDistanceX = computeTransDistance(this.xa, this.xv);
    this.transDistanceY = computeTransDistance(this.ya, this.yv);
};

Tevent.prototype.velocityBufferQueue = function velocityBufferQueue () {
    if (this.velocityQueueX.length > 1) {
        this.velocityQueueX.shift();
    }
    if (this.velocityQueueY.length > 1) {
        this.velocityQueueY.shift();
    }
    this.velocityQueueX.push(this.xv);
    this.velocityQueueY.push(this.yv);
};

Tevent.prototype.checkDirection = function checkDirection () {
    if (this.xs < 0) {
        this.direction.left = true;
        this.direction.right = false;
    }
    if (this.xs === 0) {
        this.direction.left = false;
        this.direction.right = false;
    }
    if (this.xs > 0) {
        this.direction.left = false;
        this.direction.right = true;
    }
    if (this.ys < 0) {
        this.direction.top = true;
        this.direction.bottom = false;
    }
    if (this.ys === 0) {
        this.direction.top = false;
        this.direction.bottom = false;
    }
    if (this.ys > 0) {
        this.direction.top = false;
        this.direction.bottom = true;
    }
    this.direction.topLeft = this.direction.top && this.direction.left;
    this.direction.topRight = this.direction.top && this.direction.right;
    this.direction.bottomLeft = this.direction.bottom && this.direction.left;
    this.direction.bottomRight = this.direction.bottom && this.direction.right;
};

Tevent.prototype.takeover = function takeover (prev) {
    var event = prev;
    this.distanceX = event.distanceX;
    this.distanceY = event.distanceY;
    this.startX = this.lastX - this.distanceX;
    this.startY = this.lastY - this.distanceY;

    this.lastTime = now();
};

var EVENT_TYPE = {
    touchstart: 'touchstart',
    touchmove: 'touchmove',
    touchend: 'touchend',
    touchcancel: 'touchcancel'
};

var Fingerd = function Fingerd (options) {
    this.options = extend({
        element: null,
        transTime: 3000
    }, options);
    this.fingers = [];
    this.changeFingerIndex = 0;
    this.fingerNumber = 0;
};

Fingerd.prototype.injectEvent = function injectEvent (event) {
        var this$1 = this;

    var eventType = event.type;
    var fingers = getTouches(event);
    var changeFingers = getChangedTouches(event);

    if (eventType === EVENT_TYPE.touchstart) {
        var changeFingerLen = changeFingers.length;
        for (var i = 0; i < changeFingerLen; i++) {
            var id = changeFingers[i].identifier,
                tevent = new Tevent(this$1.options);

            tevent.start(changeFingers[i]);

            if (this$1.fingerNumber === 0) {
                this$1.fingers.length = 0;
            }
            this$1.fingers.push(tevent);

            var fingerFromId = this$1.getFingerById(this$1.fingers, id),
                f = fingerFromId.finger,
                pos = fingerFromId.pos;

            this$1.fingerNumber = this$1.fingers.length;
            this$1.changeFingerIndex = pos;
        }
    }

    if (eventType === EVENT_TYPE.touchmove) {
        var changeFingerLen$1 = changeFingers.length;
        for (var i$1 = 0; i$1 < changeFingerLen$1; i$1++) {
            var id$1 = changeFingers[i$1].identifier,
                fingerFromId$1 = this$1.getFingerById(this$1.fingers, id$1),
                f$1 = fingerFromId$1.finger,
                pos$1 = fingerFromId$1.pos;

            if (!f$1.fingerInElement) {
                return this$1
            }
            this$1.fingerNumber = this$1.fingers.length;
            this$1.changeFingerIndex = pos$1;
            f$1.move(changeFingers[i$1]);

            if (!f$1.fingerInElement) {
                this$1.forceRemove(fingerFromId$1, changeFingers[i$1]);
            }
        }
    }

    if (eventType === EVENT_TYPE.touchend || eventType === EVENT_TYPE.touchcancel) {
        // The mobile end limits up to 5 fingers at the same time touch the screen
        if (this.fingerNumber >= 5 && eventType === EVENT_TYPE.touchcancel) {
            this.fingerNumber = 0;
            this.fingers.length = 0;
            return this
        }
        var changeFingerLen$2 = changeFingers.length;
        for (var i$2 = 0; i$2 < changeFingerLen$2; i$2++) {
            var id$2 = changeFingers[i$2].identifier,
                fingerFromId$2 = this$1.getFingerById(this$1.fingers, id$2),
                f$2 = fingerFromId$2.finger;

            if (!f$2.fingerInElement) {
                return this$1
            }
            this$1.forceRemove(fingerFromId$2, changeFingers[i$2]);
        }
    }
        
    return this
        
};

Fingerd.prototype.getFingerPicth = function getFingerPicth (f1, f2) {
    var p1 = {
        x: f1.native.clientX,
        y: f1.native.clientY
    };
    var p2 = {
        x: f2.native.clientX,
        y: f2.native.clientY
    };

    return getTowPointsDis(p1, p2)
};

Fingerd.prototype.getScale = function getScale (f1, f2) {
    var startP1 = {
        x: f1.startX,
        y: f1.startY
    };
    var startP2 = {
        x: f2.startX,
        y: f2.startY
    };
    var startDis = getTowPointsDis(startP1, startP2);
    var currentDis = this.getFingerPicth(f1, f2);
        
    return (currentDis / startDis)
};

Fingerd.prototype.getFingerById = function getFingerById (fingers, id) {
    var finger = null,
        pos = 0,
        fingersLen = fingers.length;

    for (var i = 0; i < fingersLen; i++) {
        if (fingers[i].native.identifier === id) {
            finger = fingers[i];
            pos = i;
            break
        }
    }
    return {
        finger: finger,
        pos: pos
    }
};

Fingerd.prototype.forceRemove = function forceRemove (fingerFromId, nativeEvent) {
    var f = fingerFromId.finger,
        pos = fingerFromId.pos,
        next = this.fingers[pos + 1],
        prev = this.fingers[pos - 1];

    this.changeFingerIndex = pos;
    f.end(nativeEvent);
    if (next) {
        next.takeover(f);
        this.fingers.splice(pos, 1);
        this.fingerNumber = this.fingers.length;
    } else if (prev) {
        this.fingers.splice(pos, 1);
        this.fingerNumber = this.fingers.length;
    } else {
        this.fingerNumber--;
    }
};

function getTowPointsDis (p1, p2) {
    var x = p1.x - p2.x,
        y = p1.y - p2.y;
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

return Fingerd;

})));
