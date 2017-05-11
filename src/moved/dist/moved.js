/*!
 * moved.js v0.0.24
 * (c) 2017 HcySunYang
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Moved = factory());
}(this, (function () { 'use strict';

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

var requestAnim = requestAnimationFrame || webkitRequestAnimationFrame;
var cancelAnim = cancelAnimationFrame || webkitCancelAnimationFrame;







function getStyle (el, prototype) {
    return document.defaultView.getComputedStyle(el, null)[prototype]
}

function now () {
    return Date.now()
}


function cssText (el, cssText) {
    el.style.cssText = el.style.cssText + ' ' + cssText;
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

return Moved;

})));
