/*!
 * finger-mover.js v1.0.2
 * (c) 2017 HcySunYang
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Fmover = factory());
}(this, (function () { 'use strict';

var requestAnim = requestAnimationFrame || webkitRequestAnimationFrame;
var cancelAnim = cancelAnimationFrame || webkitCancelAnimationFrame;

function throwError$1 (text) {
    throw new TypeError(text)
}

function toArray (data) {
    if (!Array.isArray(data)) {
        return Array.prototype.slice.call(data)
    }
    return data
}



function getStyle (el, prototype) {
    return document.defaultView.getComputedStyle(el, null)[prototype]
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
function cssText (el, cssText) {
    el.style.cssText = el.style.cssText + ' ' + cssText;
}

function getRelativeRect (parent, child) {
    var pos = {
        top: 0,
        left: 0
    };
    while (child !== parent) {
        pos.top += child.offsetTop;
        pos.left += child.offsetLeft;
        child = child.offsetParent;
    }
    return pos
}

function isInElement (parent, child) {
    var num = parent.compareDocumentPosition(child);

    if (num === 0 || num === 20) {
        return true
    }
    return false
}

function is3DMatrix (el) {
    var matrix = getStyle(el, 'WebkitTransform');
    if (matrix === 'none') {
        return false
    }
    var matrixArray = matrix.match(/[+-]?\d*[.]?\d+(?=,|\))/g);
    if (matrixArray.length > 6) {
        return true
    }
    return false
}

function transform (el, attr, val) {
    var transString = '';

    el.transform = el.transform ? el.transform : Object.create(null);
    el.transform[attr] = val;

    for (var a in el.transform) {
        switch (a) {
            case 'translateX':
            case 'translateY':
            case 'translateZ':
                transString += a + "(" + (el.transform[a]) + "px) ";
                break
            case 'scaleX':
            case 'scaleY':
            case 'scaleZ':
                transString += a + "(" + (el.transform[a]) + ") ";
                break
            case 'rotateX':
            case 'rotateY':
            case 'rotateZ':
            case 'skewX':
            case 'skewY':
                transString += a + "(" + (el.transform[a]) + "deg) ";
                break
        }
    }
    cssText(el, ("transform: " + transString + "; -webkit-transform: " + transString + ";"));
}

function getPropFromMatrix (el) {
    var matrix = getStyle(el, 'WebkitTransform');

    if (!matrix || matrix === 'none') {
        transform(el, 'translateZ', 0.01);
    }

    matrix = getStyle(el, 'WebkitTransform')
        .match(/[+-]?\d*[.]?\d+(?=,|\))/g)
        .map(function (o) {
            return parseInt(o)
        });
    var matrixLen = matrix.length;
    var matrixObject = {};
    var is3D = matrixLen > 6;

    matrixObject.translateX = is3D ? matrix[12] : matrix[4];
    matrixObject.translateY = is3D ? matrix[13] : matrix[5];
    matrixObject.translateZ = is3D ? matrix[14] : 0;

    matrixObject.scaleX = typeof el.transform['scaleX'] !== 'undefined' 
                            ? el.transform['scaleX']
                            : 1;
    matrixObject.scaleY = typeof el.transform['scaleY'] !== 'undefined'
                            ? el.transform['scaleY']
                            : 1;
    matrixObject.scaleZ = typeof el.transform['scaleZ'] !== 'undefined'
                            ? el.transform['scaleZ']
                            : 1;

    matrixObject.rotateX = typeof el.transform['rotateX'] !== 'undefined'
                            ? el.transform['rotateX'] : 0;
    matrixObject.rotateY = typeof el.transform['rotateY'] !== 'undefined'
                            ? el.transform['rotateY'] : 0;
    matrixObject.rotateZ = typeof el.transform['rotateZ'] !== 'undefined'
                            ? el.transform['rotateZ'] : 0;

    matrixObject.skewX = typeof el.transform['skewX'] !== 'undefined'
                            ? el.transform['skewX'] : 0;
    matrixObject.skewY = typeof el.transform['skewY'] !== 'undefined'
                            ? el.transform['skewY'] : 0;

    return matrixObject
}

function getAbsMaxFromArray (arr) {
    var tempArr = arr.map(function (o) {
        return Math.abs(o)
    });
    var maxIndex = tempArr.indexOf(Math.max.apply(null, tempArr));
    return arr[maxIndex]
}

var TW = {
    easeOutStrong: function (t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b
    },
    backOut: function (t, b, c, d, s) {
        if (typeof s === 'undefined') {
            s = 0.7;
        }
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b
    }
};

var Animationframe = function Animationframe (handle) {
    this.handle = handle;
    this.id = 0;
    this._init();
};

Animationframe.prototype._init = function _init () {
    this.start = now();
    this.request();
};

Animationframe.prototype._fakeHandle = function _fakeHandle () {
    var times = now() - this.start;

    this.handle(times);
};

Animationframe.prototype._requestAnimFn = function _requestAnimFn (handle) {
    if (requestAnim) {
        return requestAnim(handle)
    } else {
        return setTimeout(handle, 1000 / 60)
    }
};

Animationframe.prototype._cancelAnimFn = function _cancelAnimFn (id) {
    if (cancelAnim) {
        cancelAnim(id);
    } else {
        clearTimeout(id);
    }
};

Animationframe.prototype.request = function request () {
    this.id = this._requestAnimFn(this._fakeHandle.bind(this));
};

Animationframe.prototype.cancel = function cancel () {
    this._cancelAnimFn(this.id);
};

var MOVE_STATUS = {
    start: 'start',
    stop: 'stop'
};

var cid = 0;
var Moved = function Moved () {
    this.moveStatus = MOVE_STATUS.stop;
    this.isArrivals = false;
    /* istanbul ignore if */
    if (!(this instanceof Moved)) {
        throwError('Moved is a constructor and should be called with the `new` keyword');
    }
};

Moved.prototype.start = function start (options) {
        var this$1 = this;

    if (this.moveStatus === MOVE_STATUS.start) {
        return
    }
    options = options ? options : {};
    var el = options.el;
        var target = options.target;
        var type = options.type;
        var time = options.time;
        var endCallBack = options.endCallBack;
        var inCallBack = options.inCallBack;
        var s = options.s;
    this.isArrivals = false;
    this.id = cid++;
    this.el = el;
    this.target = target;
    this.type = type || 'easeOutStrong';
    this.time = time <= 1 ? 1 : time;
    this.endCallBack = endCallBack;
    this.inCallBack = inCallBack;
    this.currentPos = {};
    this.moveStatus = MOVE_STATUS.stop;

    this.b = {};
    this.c = {};
    this.d = this.time;
    this.s = s;
    for (var attr in this$1.target) {
        this$1.b[attr] = getPropFromMatrix(this$1.el)[attr];
        this$1.c[attr] = this$1.target[attr] - this$1.b[attr];
        if (this$1.c[attr] === 0) {
            this$1.isArrivals = true;
        }
    }
    if (this.isArrivals) {
        this.endCallBack && this.endCallBack(this.b);
        return false
    }

    this.anim = new Animationframe(this._moveHandle.bind(this));
};

Moved.prototype.stop = function stop (callback) {
        var this$1 = this;

    if (this.moveStatus === MOVE_STATUS.stop) {
        return this
    }
    this.moveStatus = MOVE_STATUS.stop;
    this.anim.cancel();
    for (var attr in this$1.target) {
        transform(this$1.el, attr, this$1.currentPos[attr]);
    }
    callback && callback(this.currentPos);
    return this
};

Moved.prototype.transform = function transform$1 (el, attr, val) {
    transform(el, attr, val);
};

Moved.prototype.getPropFromMatrix = function getPropFromMatrix$1 (el) {
    return getPropFromMatrix(el)
};

Moved.prototype._moveHandle = function _moveHandle (t) {
        var this$1 = this;

    t = t >= this.d ? this.d : t;
    for (var attr in this$1.target) {
        this$1.currentPos[attr] = Moved.Tween[this$1.type](t, this$1.b[attr], this$1.c[attr], this$1.d, this$1.s);
        transform(this$1.el, attr, this$1.currentPos[attr]);
    }
    this.moveStatus = MOVE_STATUS.start;
    this.inCallBack && this.inCallBack.call(this, this.currentPos);

    if (t >= this.d) {
        this.stop(this.endCallBack);
    } else {
        this.anim.request();
    }
};

Moved.Tween = TW;

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

var Fmover = function Fmover (options) {
    options = options ? options : {};
    /* istanbul ignore if */
    if (!(this instanceof Fmover)) {
        throwError$1('Fmover is a constructor and should be called with the `new` keyword');
    }
    this._init(options);
};

Fmover.prototype._init = function _init (options) {
    this.el = document.querySelector(options.el);
    if (!this.el) {
        throwError$1(("This is an invalid selector: " + (options.el)));
    }

    this.fingerd = new Fingerd({
        element: this.el
    });
    this.plugins = options.plugins || [];
    this.pluginsStorage = [];

    this._initPlugins();
    this._initStyle();
    this._initEvents();
};

Fmover.prototype._initPlugins = function _initPlugins () {
        var this$1 = this;

    var pluginLen = this.plugins.length;
    for (var i = 0; i < pluginLen; i++) {
        this$1[i] = this$1.plugins[i](Fmover);
        this$1.pluginsStorage.push(this$1[i]);
    }

    var pluginStorLen = this.pluginsStorage.length;
    for (var i$1 = 0; i$1 < pluginStorLen; i$1++) {
        this$1.pluginsStorage[i$1].init && this$1.pluginsStorage[i$1].init(this$1);
    }
};

Fmover.prototype._initStyle = function _initStyle () {
    if (!is3DMatrix(this.el)) {
        transform(this.el, 'translateZ', 0.01);
    }
};

Fmover.prototype._initEvents = function _initEvents () {
    var el = this.el;
 
    el.addEventListener('touchstart', this._start.bind(this), false);
    el.addEventListener('touchmove', this._move.bind(this), false);
    el.addEventListener('touchend', this._end.bind(this), false);
    el.addEventListener('touchcancel', this._cancel.bind(this), false);
};
/* istanbul ignore next */
Fmover.prototype._start = function _start (event) {
        var this$1 = this;

    var F = this.fingerd.injectEvent(event);
    var fingerLen = F.fingers.length;
    for (var i = 0; i < fingerLen; i++) {
        F.fingers[i].el = this$1.el;
    }

    var pluginLen = this.pluginsStorage.length;
    for (var i$1 = 0; i$1 < pluginLen; i$1++) {
        this$1.pluginsStorage[i$1].start && this$1.pluginsStorage[i$1].start(F);
    }

    event.preventDefault();
};
/* istanbul ignore next */
Fmover.prototype._move = function _move (event) {
        var this$1 = this;

    var F = this.fingerd.injectEvent(event);
    var returnVal;
    var pluginStorLen = this.pluginsStorage.length;
    for (var i = 0; i < pluginStorLen; i++) {
        returnVal = this$1.pluginsStorage[i].move && this$1.pluginsStorage[i].move(F);
    }

    if (typeof returnVal !== 'undefined' && !returnVal) {
        event.stopPropagation();
    }
    event.preventDefault();
};
/* istanbul ignore next */
Fmover.prototype._end = function _end (event) {
        var this$1 = this;

    var F = this.fingerd.injectEvent(event);

    var pluginStorLen = this.pluginsStorage.length;
    for (var i = 0; i < pluginStorLen; i++) {
        this$1.pluginsStorage[i].end && this$1.pluginsStorage[i].end(F);
    }

    event.preventDefault();
};
/* istanbul ignore next */
Fmover.prototype._cancel = function _cancel (event) {
        var this$1 = this;

    var F = this.fingerd.injectEvent(event);

    var pluginStorLen = this.pluginsStorage.length;
    for (var i = 0; i < pluginStorLen; i++) {
        this$1.pluginsStorage[i].cancel && this$1.pluginsStorage[i].cancel(F);
    }

    event.preventDefault();
};

installGlobal(Fmover);

function installGlobal (Fmover) {
    Fmover.Moved = Moved;
    Fmover.Fingerd = Fingerd;
    Fmover.extend = extend;
    Fmover.now = now;
    Fmover.getStyle = getStyle;
    Fmover.cssText = cssText;
    Fmover.getPropFromMatrix = getPropFromMatrix;
    Fmover.getRelativeRect = getRelativeRect;
    Fmover.isInElement = isInElement;
    Fmover.throwError = throwError$1;
    Fmover.toArray = toArray;
}

return Fmover;

})));
