/*!
 * simulation-scroll-y.js v1.0.2
 * (c) 2017 HcySunYang
 * Released under the MIT License.
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.simulationScrollY = factory());
}(this, (function () { 'use strict';

var simulationScrollY = function (options) {

    return function (Fmover) {
        var Moved = Fmover.Moved;
        var transform = Fmover.transform;
        var getStyle = Fmover.getStyle;
        var extend = Fmover.extend;
        var cssText = Fmover.cssText;
        var getPropFromMatrix = Fmover.getPropFromMatrix;
        var getRelativeRect = Fmover.getRelativeRect;
        var isInElement = Fmover.isInElement;
        var throwError = Fmover.throwError;
        var noop = function () {};

        var opa = extend({
            scrollBar: true,
            bounce: true,
            unidirectional: false,
            pullDown: {
                use: false,
                distance: 50,
                onBegin: noop,
                onActive: noop,
                onAfter: noop
            },
            loadMore: {
                distance: 0,
                onLoadMore: noop
            },
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
            barMinHeight = 7,
            downLimit = 0,
            cacheDownLimit = 0,
            upLimit = 0,
            loadMorePoint = 0,
            barTopLimit = 0,
            barBottomLimit = 0,
            moved = new Moved(),
            currentY = 0,
            transTargetY = 0,
            moveType = 'easeOutStrong',
            moveTime = 0,
            borderBounce = false,
            isMoveOut = false,
            isTriggerOnActive = false,
            isTriggerOnAfter = false,
            wearDistance = 0.5,
            moveTarget = 0,
            lockPullDown = false,
            lockLoadmore = false,
            isMoving = false,
            moveStatusForStart = false,
            refreshDirty = false,
            refreshCallBack = noop,
            moveDirection = {},
            horizontal = false,
            vertical = false;

        function createScrollBar (parent, height) {
            if (scrollBarDom) {
                cssText(scrollBarDom, ("height: " + height + "px;"));
                return
            }
            scrollBarDom = document.createElement('span');
            cssText(scrollBarDom, ("\n                position: absolute;\n                z-index: 10000000;\n                top:0;\n                right: 3px;\n                width: 3px; \n                height: " + height + "px; \n                background-color: #000;\n                border-radius: 1.5px;\n                transition: opacity .2s;\n                -webkit-transition: opacity .2s;\n                transform: translateZ(0.01px);\n                opacity: 0;\n            "));
            parent.appendChild(scrollBarDom);
        }
        function moveScrollBar (target) {
            var scrollBarTarget = target;
            var gain = 4;
            var shorten = 0;

            if (scrollBarTarget < barTopLimit) {
                shorten = (barTopLimit - scrollBarTarget) * gain;
                if (shorten > scrollBarSize - barMinHeight) {
                    shorten = scrollBarSize - barMinHeight;
                }
                scrollBarTarget = barTopLimit;
            } else if (scrollBarTarget > barBottomLimit) {
                shorten = (scrollBarTarget - barBottomLimit) * gain;
                if (shorten > scrollBarSize - barMinHeight) {
                    shorten = scrollBarSize - barMinHeight;
                }
                scrollBarTarget = barBottomLimit + shorten;
            }

            var barRealHeight = scrollBarSize - shorten;
            scrollBarDom.style.height = barRealHeight + "px";
            moved.transform(scrollBarDom, 'translateY', scrollBarTarget);
            // Enables the z-index attribute to take effect
            moved.transform(scrollBarDom, 'translateZ', 0.01);
        }

        return {
            init: function init (fmover) {
                el = fmover.el;
                wrapEl = el.parentNode;
                var elPosition = getStyle(el, 'position');
                if (elPosition === 'static') {
                    cssText(el, 'position: relative; z-index: 10;');
                }
                var parentPosition = getStyle(wrapEl, 'position');
                if (parentPosition === 'static') {
                    cssText(wrapEl, 'position: relative;');
                }
                this.refreshSize();
            },
            start: function start (fingerd) {
                var tev = fingerd.fingers[0];
                moveType = 'easeOutStrong';
                isMoveOut = false;
                moveStatusForStart = moved.moveStatus === 'stop' ? false : true;
                isTriggerOnActive = false;
                isTriggerOnAfter = false;
                horizontal = false;
                vertical = false;
                moveDirection = {};

                if (currentY > downLimit) {
                    currentY = currentY / wearDistance;
                }
                moved.stop(function (currentPos) {
                    isMoving = false;
                    moveTarget = currentY = currentPos.translateY;
                });
            },
            move: function move (fingerd) {
                if (moved.moveStatus === 'start') {
                    return false
                }
                isMoving = true;
                var tev = fingerd.fingers[0],
                    fingerInElement = tev.fingerInElement;
                
                if (!fingerInElement) {
                    if (!isMoveOut) {
                        isMoveOut = true;
                        this.makeMove(tev);
                    }
                    return false
                }

                moveDirection = tev.direction;
                if ((moveDirection.top || moveDirection.bottom) &&
                    !horizontal &&
                    Math.abs(tev.distanceY) >= 10) {
                    vertical = true;
                }
                if ((moveDirection.left || moveDirection.right) &&
                    !vertical &&
                    Math.abs(tev.distanceX) >= 10) {
                    horizontal = true;
                }
                
                if (Math.abs(tev.distanceY) < 10 && Math.abs(tev.distanceX) < 10) {
                    return false
                }
                if (vertical || !opa.unidirectional) {
                    var disy = tev.distanceY > 0
                                ? tev.distanceY - 10
                                : tev.distanceY + 10;
                    moveTarget = currentY + disy;
                    
                    if (moveTarget > downLimit || upLimit > 0) {
                        moveTarget = opa.bounce ? downLimit + (moveTarget - downLimit) * wearDistance : downLimit;
                    } else if (moveTarget < upLimit) {
                        moveTarget = opa.bounce ? (upLimit + (moveTarget - upLimit) * wearDistance) : upLimit;
                    }

                    if (moveTarget <= loadMorePoint &&
                        !lockLoadmore &&
                        moveDirection.top) {

                        lockLoadmore = true;
                        opa.loadMore.onLoadMore.call(this);
                    }
                    moved.transform(tev.el, 'translateY', moveTarget);
                    if (opa.scrollBar) {
                        cssText(scrollBarDom, 'opacity: .4;');
                        moveScrollBar(-(moveTarget * proportion));
                    }
                    if (opa.pullDown &&
                        opa.pullDown.use &&
                        moveTarget > 0 &&
                        !lockPullDown) {
                        opa.pullDown.onBegin && opa.pullDown.onBegin.call(this, moveTarget);
                    }

                    opa.onTouchMove.call(this, moveTarget);
                }

                if (vertical && opa.unidirectional || moveStatusForStart) {
                    return false
                }
            },
            end: function end (fingerd) {
                if (horizontal && !borderBounce) {
                    return false
                }
                var tev = fingerd.fingers[0],
                    changeFingerIndex = fingerd.changeFingerIndex,
                    fingerNumber = fingerd.fingerNumber,
                    fingerInElement = tev.fingerInElement;

                isMoving = false;
                if (changeFingerIndex === 0 && 
                    fingerNumber === 0 && 
                    fingerInElement) {
                    this.makeMove(tev);
                }

            },

            cancel: function cancel (fingerd) {
                var tev = fingerd.fingers[0],
                    changeFingerIndex = fingerd.changeFingerIndex,
                    fingerNumber = fingerd.fingerNumber,
                    fingerInElement = tev.fingerInElement;
                    
                if (changeFingerIndex === 0 && fingerNumber === 0 && fingerInElement) {
                    currentY = currentY + tev.distanceY;
                }
            },

            makeMove: function makeMove (tev) {
                var tweenS;

                moveTime = tev.transTime;
                currentY = moveTarget;
                transTargetY = currentY + tev.transDistanceY;

                if (opa.pullDown &&
                    opa.pullDown.use &&
                    currentY >= opa.pullDown.distance &&
                    !lockPullDown) {

                    lockPullDown = true;
                    opa.pullDown.onActive && opa.pullDown.onActive.call(this);
                    downLimit = downLimit + opa.pullDown.distance;
                    this.scrollTo(opa.pullDown.distance, 300);
                    return
                }

                if (opa.pullDown &&
                    opa.pullDown.use &&
                    currentY > downLimit) {
                    isTriggerOnAfter = true;
                }
                if (currentY > downLimit || upLimit > 0) {
                    transTargetY = downLimit;
                    moveType = 'easeOutStrong';
                    moveTime = opa.bounce ? 500 : tev.transTime;
                    borderBounce = true;
                } else if (currentY < upLimit) {
                    transTargetY = upLimit;
                    moveType = 'easeOutStrong';
                    moveTime = opa.bounce ? 500 : tev.transTime;
                    borderBounce = true;
                } else if (transTargetY < upLimit) {
                    if (opa.bounce) {
                        transTargetY = upLimit;
                        moveType = 'backOut';
                        moveTime = wearTime(upLimit);
                    } else {
                        moveType = 'easeOutStrong';
                    }
                } else if (transTargetY > downLimit) {
                    if (opa.bounce) {
                        transTargetY = downLimit;
                        moveType = 'backOut';
                        moveTime = wearTime(downLimit);
                    } else {
                        moveType = 'easeOutStrong';
                    }
                }

                if (Math.abs(tev.transDistanceY) > MIN_DISTANCE || borderBounce) {
                    this.wrapMove(transTargetY, moveTime, moveType, tweenS);
                } else {
                    if (opa.scrollBar && moved.moveStatus !== 'start') {
                        cssText(scrollBarDom, 'opacity: 0;');
                    }
                    if (refreshDirty) {
                        this.refresh();
                    }
                }

                function wearTime (target) {
                    var weartime = (Math.abs(target - currentY) / Math.abs(tev.transDistanceY) * tev.transTime);
                    if (weartime < 500) {
                        weartime = 500;
                        tweenS = 2;
                    } else if (weartime > 2000) {
                        weartime = 2000;
                    }
                    return weartime
                }
            },

            wrapMove: function wrapMove (transTargetY, moveTime, moveType, tweenS) {
                var that = this;
                moved.start({
                    el: el,
                    target: {
                        translateY: transTargetY
                    },
                    type: moveType,
                    time: moveTime,
                    s: tweenS || 0.7,
                    inCallBack: function (currentPos) {
                        currentY = currentPos.translateY;
                        if (!opa.bounce) {
                            if (currentY >= downLimit) {
                                moved.stop(function (currentPos) {
                                    currentY = downLimit;
                                    moved.transform(el, 'translateY', currentY);
                                });
                            }
                            if (currentY <= upLimit) {
                                moved.stop(function (currentPos) {
                                    currentY = upLimit;
                                    moved.transform(el, 'translateY', upLimit);
                                });
                            }
                        }
                        if (currentY <= loadMorePoint &&
                            !lockLoadmore &&
                            moveDirection.top) {

                            lockLoadmore = true;
                            opa.loadMore.onLoadMore.call(that);
                        }
                        if (isTriggerOnAfter) {
                            opa.pullDown.onAfter(currentPos.translateY);
                        }
                        
                        if (opa.scrollBar) {
                            moveScrollBar(-(currentPos.translateY * proportion));
                        }
                        opa.onTransMove.call(this, currentY);
                    },
                    endCallBack: function (currentPos) {
                        currentY = currentPos.translateY;
                        if (refreshDirty) {
                            that.refresh();
                        }
                        if (opa.scrollBar) {
                            cssText(scrollBarDom, 'opacity: 0;');
                        }
                        opa.onTransMoveEnd.call(this, currentY);
                        moveStatusForStart = false;
                        borderBounce = false;
                    }
                });
            },

            scrollTo: function scrollTo (target, time, limit) {
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
                    target = -getRelativeRect(el, child).top;
                }
                if (limit && (target > downLimit || upLimit > 0)) {
                    target = downLimit;
                } else if (limit && target < upLimit) {
                    target = upLimit;
                }
                moveTarget = currentY = target;
                moved.stop();
                this.wrapMove(target, time, 'easeOutStrong');
            },

            loadEnd: function loadEnd () {
                lockLoadmore = false;
                this.refreshSize();
            },

            refresh: function refresh (callBack) {
                if (moved.moveStatus === 'start' || isMoving) {
                    refreshDirty = true;
                    refreshCallBack = callBack;
                    return false
                }
                
                var cb = callBack || refreshCallBack;
                cb();

                lockPullDown = false;
                refreshDirty = false;
                downLimit = cacheDownLimit;
                this.refreshSize();
                var matrixObj = getPropFromMatrix(el);
                if (matrixObj.translateY > downLimit) {
                    isTriggerOnAfter = true;
                    this.scrollTo(downLimit, 500);
                }
            },

            refreshSize: function refreshSize () {
                elSize = parseFloat(getStyle(el, 'height'));
                wrapSize = wrapEl.clientHeight;
                upLimit = wrapSize - elSize;
                cacheDownLimit = downLimit = 0;
                if (upLimit < 0) {
                    loadMorePoint = upLimit + opa.loadMore.distance;
                } else {
                    loadMorePoint = 0;
                }
                if (upLimit > 0) {
                    opa.scrollBar = false;
                }
                if (opa.scrollBar) {
                    proportion = wrapSize / elSize;
                    scrollBarSize = wrapSize * proportion;
                    barMinHeight = scrollBarSize < barMinHeight ? scrollBarSize : barMinHeight;
                    barTopLimit = -downLimit * proportion;
                    barBottomLimit = -upLimit * proportion;
                    createScrollBar(wrapEl, scrollBarSize);
                }
            }

        }

    }

};

return simulationScrollY;

})));
