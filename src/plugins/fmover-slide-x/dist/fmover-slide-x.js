/*!
 * fmover-slide-x.js v1.0.2
 * (c) 2017 HcySunYang
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.fmoverSlideX = factory());
}(this, (function () { 'use strict';

var fmoverSlideX = function (options) {

    return function (Fmover) {
        var Moved = Fmover.Moved;
        var getStyle = Fmover.getStyle;
        var extend = Fmover.extend;
        var cssText = Fmover.cssText;
        var getRelativeRect = Fmover.getRelativeRect;
        var isInElement = Fmover.isInElement;
        var throwError = Fmover.throwError;
        var toArray = Fmover.toArray;
        var SPEED = 0.5;
        var AUTOPLAY_DIR = {
            left: 'left',
            right: 'right'
        };
        var el = null,
            parentEl = null,
            slideEls = null,
            slideNumber = 0,
            realSlideNumber = 0,
            slideWidth = 0,
            elWidth = 0,
            current = 0,
            target = 0,
            moved = new Moved(),
            leftLimit = 0,
            rightLimit = 0,
            isMoveOut = false,
            timer = null,
            lock = false,
            isChange = false;

        var noop = function () {};
        var opa = extend({
            startSlide: 1,
            autoplay: 0,
            autoplayDir: AUTOPLAY_DIR.left,
            loop: true,
            times: 500,
            bounce: true,
            touchable: true,
            onInit: noop,
            onTouchStart: noop,
            onTouchMove: noop,
            onTouchEnd: noop,
            onTransStart: noop,
            onTransMove: noop,
            onTransEnd: noop,
            onChangeStart: noop,
            onChange: noop,
            onChangeEnd: noop,
            onRefresh: noop
        }, options);
        
        return {
            index: 1,
            get slideIndex () {
                return this.redressIndex(this.index)
            },
            get slideNumber () {
                return slideNumber
            },
            init: function init (fmover) {
                el = fmover.el;
                parentEl = el.parentNode;
                this.refreshWrap(true);
                opa.onInit.call(this);
            },
            start: function start (fingerd) {
                if (fingerd.changeFingerIndex !== 0 || !opa.touchable) {
                    return false
                }
                isMoveOut = false;
                isChange = false;
                clearInterval(timer);
                moved.stop(function (currentPos) {
                    current = currentPos.translateX;
                });
                if (opa.autoplay) {
                    clearInterval(timer);
                }
                if (this.index > slideNumber) {
                    current = current + slideNumber * slideWidth;
                    this.index = 1;
                } else if (this.index === 0) {
                    this.index = slideNumber;
                    current = current - slideNumber * slideWidth;
                }
                moved.transform(el, 'translateX', current);
                opa.onTouchStart.call(this, current);
            },
            move: function move (fingerd) {
                var fg = fingerd.fingers[0];
                if (!opa.touchable) {
                    return false
                }
                if (!fg.fingerInElement) {
                    if (!isMoveOut) {
                        isMoveOut = true;
                        this.wrapMove(fg);
                        if (opa.autoplay) {
                            clearInterval(timer);
                            this.initAutoplay();
                        }
                        opa.onTouchEnd.call(this);
                    }
                    return false
                }
                target = current + fg.distanceX;
                if (!opa.loop) {
                    if (target > leftLimit) {
                        target = opa.bounce ? target * 0.5 : leftLimit;
                    } else if (target < rightLimit) {
                        target = opa.bounce ? (rightLimit + (target - rightLimit) * 0.5) : rightLimit;
                    }
                }
                moved.transform(el, 'translateX', target);
                opa.onTouchMove.call(this, target, slideWidth, this.slideNumber);
            },
            end: function end (fingerd) {
                var fg = fingerd.fingers[0];
                if (!fg.fingerInElement ||
                    fingerd.changeFingerIndex !== 0 ||
                    fingerd.fingerNumber !== 0 ||
                    !opa.touchable) {
                    return false
                }
                current = target;
                this.wrapMove(fg);
                if (opa.autoplay) {
                    clearInterval(timer);
                    this.initAutoplay();
                }
                opa.onTouchEnd.call(this);
            },
            cancel: function cancel (fingerd) {
                if (!opa.touchable) {
                    return false
                }
                if (opa.autoplay) {
                    clearInterval(timer);
                    this.initAutoplay();
                }
                this.makeMove();
            },
            refresh: function refresh (force) {
                this.refreshWrap(force);
                opa.onRefresh.call(this, slideNumber);
            },
            refreshWrap: function refreshWrap (force) {
                force && moved && moved.stop(function () {
                    lock = false;
                });
                var cloneNodes = toArray(document.querySelectorAll('[clone=true]'));
                cloneNodes.forEach(function (o) {
                    o.parentNode.removeChild(o);
                });
                slideEls = Array.prototype.slice.call(el.querySelectorAll('div'));
                slideNumber = slideEls.length;
                slideWidth = parseInt(getStyle(parentEl, 'width'));
                this.index = force
                                ? this.limitIndex(opa.startSlide)
                                : this.limitIndex(this.index);
                if (opa.loop) {
                    var firstSlideEl = slideEls[0];
                    var lastSlideEl = slideEls[slideNumber - 1];
                    var cloneFirst = firstSlideEl.cloneNode(true);
                    cloneFirst.setAttribute('clone', true);
                    var cloneLast = lastSlideEl.cloneNode(true);
                    cloneLast.setAttribute('clone', true);
                    el.appendChild(cloneFirst);
                    el.insertBefore(cloneLast, el.firstElementChild);
                    slideEls.push(cloneFirst);
                    slideEls.unshift(cloneLast);
                    current = -this.index * slideWidth;
                } else {
                    current = -(this.index - 1) * slideWidth;
                }
                
                realSlideNumber = slideEls.length;
                elWidth = slideWidth * realSlideNumber;
                if (!opa.loop) {
                    rightLimit = -(elWidth - slideWidth);
                }
                cssText(parentEl, 'overflow: hidden;');
                cssText(el, ("width: " + elWidth + "px; height: 100%; overflow: hidden;"));
                moved.transform(el, 'translateX', current);
                slideEls.forEach(function (o, i, a) {
                    cssText(o, ("height: 100%; width: " + slideWidth + "px; float: left;"));
                });

                if (opa.autoplay) {
                    clearInterval(timer);
                    this.initAutoplay();
                }
            },
            prev: function prev () {
                if (lock) {
                    return false
                }
                lock = true;
                this.index--;
                if (!opa.loop && this.index === 0) {
                    this.index = slideNumber;
                }
                this.onChangeStart(this.redressIndex(this.index), AUTOPLAY_DIR.left);
                this.makeMove();
            },
            next: function next () {
                if (lock) {
                    return false
                }
                lock = true;
                this.index++;
                if (!opa.loop && this.index > slideNumber) {
                    this.index = 1;
                }
                this.onChangeStart(this.redressIndex(this.index), AUTOPLAY_DIR.right);
                this.makeMove();
            },
            slideTo: function slideTo (index, times) {
                if (lock || this.slideIndex === index) {
                    return false
                }
                lock = true;
                if (this.index !== index) {
                    var dir = this.index > index ? AUTOPLAY_DIR.right : AUTOPLAY_DIR.left;
                    this.index = this.limitIndex(index);
                    this.onChangeStart(this.redressIndex(this.index), dir);
                    this.makeMove(times);
                }
            },
            initAutoplay: function initAutoplay () {
                var this$1 = this;

                timer = setInterval(function () {
                    if (opa.autoplayDir === AUTOPLAY_DIR.left) {
                        this$1.next();
                    } else {
                        this$1.prev();
                    }
                }, opa.autoplay);
            },
            wrapMove: function wrapMove (fg) {
                if ((fg.direction.left && Math.abs(fg.xv) > SPEED && fg.distanceX < 0) ||
                    fg.distanceX < -slideWidth / 2) {
                    this.index++;
                    this.onChangeStart(this.redressIndex(this.index), AUTOPLAY_DIR.left);
                } else if ((fg.direction.right && Math.abs(fg.xv) > SPEED && fg.distanceX > 0) ||
                            fg.distanceX > slideWidth / 2) {
                    this.index--;
                    this.onChangeStart(this.redressIndex(this.index), AUTOPLAY_DIR.right);
                }
                this.makeMove();
            },

            makeMove: function makeMove (times) {
                var that = this;
                opa.onTransStart.call(this, current);
                if (opa.loop) {
                    if (this.index < 0) {
                        this.index = 0;
                    } else if (this.index > slideNumber + 1) {
                        this.index = slideNumber + 1;
                    }
                    current = -this.index * slideWidth;
                } else {
                    if (this.index < 1) {
                        this.index = 1;
                    } else if (this.index > slideNumber) {
                        this.index = slideNumber;
                    }
                    current = -(this.index - 1) * slideWidth;
                }
                moved.start({
                    el: el,
                    target: {
                        translateX: current
                    },
                    inCallBack: function (currentPos) {
                        opa.onTransMove.call(that, currentPos.translateX, slideWidth, that.slideNumber);
                        if (isChange) {
                            opa.onChange.call(that, currentPos.translateX);
                        }
                    },
                    endCallBack: function (currentPos) {
                        lock = false;
                        if (opa.loop && that.index > slideNumber) {
                            current = current + slideNumber * slideWidth;
                            moved.transform(el, 'translateX', current);
                            that.index = 1;
                        } else if (opa.loop && that.index === 0) {
                            that.index = slideNumber;
                            current = current - slideNumber * slideWidth;
                            moved.transform(el, 'translateX', current);
                        }
                        opa.onTransEnd.call(that, currentPos.translateX);
                        if (isChange) {
                            opa.onChangeEnd.call(that, currentPos.translateX);
                        }
                    },
                    time: typeof times === 'undefined' ? opa.times : times
                });
            },

            onChangeStart: function onChangeStart (index, dir) {
                isChange = true;
                opa.onChangeStart.call(this, index, dir);
            },

            redressIndex: function redressIndex (index) {
                if (index === 0) {
                    return slideNumber
                }
                if (index > slideNumber) {
                    return 1
                }
                return index
            },

            limitIndex: function limitIndex (index) {
                return index > slideNumber 
                            ? slideNumber
                            : index < 1
                                ? 1
                                : index
            }

        }

    }

};

return fmoverSlideX;

})));
