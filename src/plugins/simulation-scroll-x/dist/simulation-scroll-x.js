/*!
 * simulation-scroll-x.js v1.0.2
 * (c) 2017 HcySunYang
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.simulationScrollX = factory());
}(this, (function () { 'use strict';

var simulationScrollX = function (options) {

    return function (Fmover) {
        var Moved = Fmover.Moved;
        var getStyle = Fmover.getStyle;
        var extend = Fmover.extend;
        var cssText = Fmover.cssText;
        var getRelativeRect = Fmover.getRelativeRect;
        var isInElement = Fmover.isInElement;
        var throwError = Fmover.throwError;
        var noop = function () {};

        var opa = extend({
            scrollBar: true,
            bounce: true,
            onTouchMove: noop,
            onTransMove: noop,
            onTransMoveEnd: noop
        }, options);

        var MIN_DISTANCE = 100;

        var el = null,
            wrapEl = null,
            elSize = 0,
            wrapSize = 0,
            proportion = 0,
            scrollBarDom = null,
            scrollBarSize = 0,
            barMinWidth = 7,
            leftLimit = 0,
            rightLimit = 0,
            barLeftLimit = 0,
            barRightLimit = 0,
            moved = new Moved(),
            currentX = 0,
            transTargetX = 0,
            moveType = 'easeOutStrong',
            moveTime = 0,
            borderBounce = false,
            isMoveOut = false;

        function createScrollBar (parent, width) {
            if (scrollBarDom) {
                cssText(scrollBarDom, ("width: " + width + "px;"));
                return
            }
            scrollBarDom = document.createElement('span');
            cssText(scrollBarDom, ("\n                position: absolute;\n                z-index: 10000000;\n                left:0;\n                bottom: 3px;\n                height: 3px; \n                width: " + width + "px; \n                background-color: #000;\n                opacity: 0;\n                border-radius: 1.5px;\n                transition: opacity .2s;\n                -webkit-transition: opacity .2s;\n            "));
            var parentPosition = getStyle(parent, 'position');
            if (parentPosition === 'static') {
                cssText(parent, 'position: relative;');
            }
            parent.appendChild(scrollBarDom);
        }
        function moveScrollBar (target) {
            var scrollBarTarget = target;
            var gain = 4;
            var shorten = 0;

            if (scrollBarTarget < barLeftLimit) {
                shorten = (barLeftLimit - scrollBarTarget) * gain;
                if (shorten > scrollBarSize - barMinWidth) {
                    shorten = scrollBarSize - barMinWidth;
                }
                scrollBarTarget = barLeftLimit;
            } else if (scrollBarTarget > barRightLimit) {
                shorten = (scrollBarTarget - barRightLimit) * gain;
                if (shorten > scrollBarSize - barMinWidth) {
                    shorten = scrollBarSize - barMinWidth;
                }
                scrollBarTarget = barRightLimit + shorten;
            }

            var barRealWidth = scrollBarSize - shorten;
            scrollBarDom.style.width = barRealWidth + "px";
            moved.transform(scrollBarDom, 'translateX', scrollBarTarget);
        }

        return {
            init: function init (fmover) {
                el = fmover.el;
                wrapEl = el.parentNode;
                this.refreshSize();
                
            },
            start: function start (fingerd) {
                var tev = fingerd.fingers[0];
                moveType = 'easeOutStrong';
                borderBounce = false;
                isMoveOut = false;

                moved.stop(function (currentPos) {
                    currentX = currentPos.translateX;
                });
            },
            move: function move (fingerd) {
                if (moved.moveStatus === 'start') {
                    return false
                }
                var tev = fingerd.fingers[0],
                    moveTarget = currentX + tev.distanceX,
                    fingerInElement = tev.fingerInElement;
                if (!fingerInElement) {
                    if (!isMoveOut) {
                        isMoveOut = true;
                        this.makeMove(tev);
                    }
                    return false
                }
                if (moveTarget > leftLimit || rightLimit > 0) {
                    moveTarget = opa.bounce ? moveTarget * 0.5 : leftLimit;
                } else if (moveTarget < rightLimit) {
                    moveTarget = opa.bounce ? (rightLimit + (moveTarget - rightLimit) * 0.5) : rightLimit;
                }
                
                moved.transform(tev.el, 'translateX', moveTarget);
                if (opa.scrollBar) {
                    cssText(scrollBarDom, 'opacity: .4;');
                    moveScrollBar(-(moveTarget * proportion));
                }
                opa.onTouchMove.call(this, fingerd);
                
            },
            end: function end (fingerd) {
                var tev = fingerd.fingers[0],
                    changeFingerIndex = fingerd.changeFingerIndex,
                    fingerNumber = fingerd.fingerNumber,
                    fingerInElement = tev.fingerInElement;

                if (changeFingerIndex === 0 && fingerNumber === 0 && fingerInElement) {
                    this.makeMove(tev);
                }

            },

            cancel: function cancel (fingerd) {
                var tev = fingerd.fingers[0],
                    changeFingerIndex = fingerd.changeFingerIndex,
                    fingerNumber = fingerd.fingerNumber,
                    fingerInElement = tev.fingerInElement;

                if (changeFingerIndex === 0 && fingerNumber === 0 && fingerInElement) {
                    currentX = currentX + tev.distanceX;
                }
            },

            makeMove: function makeMove (tev) {
                var tweenS;

                moveTime = tev.transTime;
                currentX = currentX + tev.distanceX;
                transTargetX = currentX + tev.transDistanceX;

                if (currentX > leftLimit || rightLimit > 0) {
                    transTargetX = leftLimit;
                    moveType = 'easeOutStrong';
                    moveTime = opa.bounce ? 500 : tev.transTime;
                    borderBounce = true;
                } else if (currentX < rightLimit) {
                    transTargetX = rightLimit;
                    moveType = 'easeOutStrong';
                    moveTime = opa.bounce ? 500 : tev.transTime;
                    borderBounce = true;
                } else if (transTargetX < rightLimit) {
                    if (opa.bounce) {
                        transTargetX = rightLimit;
                        moveType = 'backOut';
                        moveTime = wearTime(rightLimit);
                    } else {
                        moveType = 'easeOutStrong';
                    }
                } else if (transTargetX > leftLimit) {
                    if (opa.bounce) {
                        transTargetX = leftLimit;
                        moveType = 'backOut';
                        moveTime = wearTime(leftLimit);
                    } else {
                        moveType = 'easeOutStrong';
                    }
                }

                if (Math.abs(tev.transDistanceX) > MIN_DISTANCE || borderBounce) {
                    this.wrapMove(transTargetX, moveTime, moveType, tweenS);
                } else {
                    if (opa.scrollBar) {
                        cssText(scrollBarDom, 'opacity: 0;');
                    }
                }

                function wearTime (target) {
                    var weartime = (Math.abs(target - currentX) / Math.abs(tev.transDistanceY) * tev.transTime);
                    if (weartime < 500) {
                        weartime = 500;
                        tweenS = 2;
                    } else if (weartime > 2000) {
                        weartime = 2000;
                    }
                    return weartime
                }
            },

            wrapMove: function wrapMove (transTargetX, moveTime, moveType, tweenS) {
                moved.start({
                    el: el,
                    target: {
                        translateX: transTargetX
                    },
                    type: moveType,
                    time: moveTime,
                    s: tweenS,
                    inCallBack: function (currentPos) {
                        currentX = currentPos.translateX;
                        if (!opa.bounce) {
                            if (currentX >= leftLimit) {
                                moved.stop(function (currentPos) {
                                    currentX = leftLimit;
                                    moved.transform(el, 'translateY', currentX);
                                });
                            }
                            if (currentX <= rightLimit) {
                                moved.stop(function (currentPos) {
                                    currentX = rightLimit;
                                    moved.transform(el, 'translateY', rightLimit);
                                });
                            }
                        }
                        
                        if (opa.scrollBar) {
                            moveScrollBar(-(currentPos.translateX * proportion));
                        }
                        opa.onTransMove.call(this, currentX);
                    },
                    endCallBack: function (currentPos) {
                        currentX = currentPos.translateX;
                        opa.onTransMoveEnd.call(this, currentX);
                        if (opa.scrollBar) {
                            cssText(scrollBarDom, 'opacity: 0;');
                        }
                    }
                });
            },

            scrollTo: function scrollTo (target, time) {
                var child,
                    selector;
                if (typeof target === 'string') {
                    child = document.querySelector(target);
                } else if (target instanceof Element) {
                    child = target;
                }
                if (child) {
                    if (!isInElement(el, child)) {
                        throwError('ScrollTo function argument error, `child` must be a child of `parent`');
                    }
                    target = -getRelativeRect(el, child).left;
                }

                currentX = target;
                this.wrapMove(target, time, 'easeOutStrong');
            },

            refreshSize: function refreshSize () {
                elSize = parseFloat(getStyle(el, 'width'));
                wrapSize = wrapEl.clientWidth;
                rightLimit = wrapSize - elSize;
                leftLimit = 0;
                if (rightLimit > 0) {
                    opa.scrollBar = false;
                }
                if (opa.scrollBar) {
                    proportion = wrapSize / elSize;
                    scrollBarSize = wrapSize * proportion;
                    barMinWidth = scrollBarSize < barMinWidth ? scrollBarSize : barMinWidth;
                    barLeftLimit = -leftLimit * proportion;
                    barRightLimit = -rightLimit * proportion;
                    createScrollBar(wrapEl, scrollBarSize);
                }
            }

        }

    }

};

return simulationScrollX;

})));
