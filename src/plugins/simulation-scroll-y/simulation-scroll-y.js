export default function (options) {

    return function (Fmover) {
        const {
            Moved,
            transform,
            getStyle,
            extend,
            cssText,
            getPropFromMatrix,
            getRelativeRect,
            isInElement,
            throwError
        } = Fmover
        let noop = function () {}

        let opa = extend({
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
            onTouchStart: noop,
            onTouchMove: noop,
            onTouchEnd: noop,
            onTransMove: noop,
            onTransMoveEnd: noop,
            onMotionStop: noop
        }, options)

        const MIN_DISTANCE = 100

        let el = null,
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
            isMotion = false,
            refreshDirty = false,
            loadEndDirty = false,
            refreshCallBack = noop,
            loadMoreCallBack = noop,
            moveDirection = {},
            horizontal = false,
            vertical = false,
            cacheScrollBar = opa.scrollBar

        function createScrollBar (parent, height) {
            if (scrollBarDom) {
                cssText(scrollBarDom, `height: ${height}px;`)
                return
            }
            scrollBarDom = document.createElement('span')
            cssText(scrollBarDom, `
                position: absolute;
                z-index: 10000000;
                top:0;
                right: 3px;
                width: 3px; 
                height: ${height}px; 
                background-color: #000;
                border-radius: 1.5px;
                transition: opacity .2s;
                -webkit-transition: opacity .2s;
                transform: translateZ(0.01px);
                opacity: 0;
            `)
            parent.appendChild(scrollBarDom)
        }
        function moveScrollBar (target) {
            let scrollBarTarget = target
            let gain = 4
            let shorten = 0

            if (scrollBarTarget < barTopLimit) {
                shorten = (barTopLimit - scrollBarTarget) * gain
                if (shorten > scrollBarSize - barMinHeight) {
                    shorten = scrollBarSize - barMinHeight
                }
                scrollBarTarget = barTopLimit
            } else if (scrollBarTarget > barBottomLimit) {
                shorten = (scrollBarTarget - barBottomLimit) * gain
                if (shorten > scrollBarSize - barMinHeight) {
                    shorten = scrollBarSize - barMinHeight
                }
                scrollBarTarget = barBottomLimit + shorten
            }

            let barRealHeight = scrollBarSize - shorten
            scrollBarDom.style.height = `${barRealHeight}px`
            moved.transform(scrollBarDom, 'translateY', scrollBarTarget)
            // Enables the z-index attribute to take effect
            moved.transform(scrollBarDom, 'translateZ', 0.01)
        }

        return {
            init (fmover) {
                el = fmover.el
                wrapEl = el.parentNode
                let elPosition = getStyle(el, 'position')
                if (elPosition === 'static') {
                    cssText(el, 'position: relative; z-index: 10;')
                }
                let parentPosition = getStyle(wrapEl, 'position')
                if (parentPosition === 'static') {
                    cssText(wrapEl, 'position: relative;')
                }
                this.refreshSize()
            },
            start (fingerd) {
                let tev = fingerd.fingers[0]
                moveType = 'easeOutStrong'
                isMoveOut = false
                isMotion = moved.moveStatus === 'stop' ? false : true
                isTriggerOnActive = false
                isTriggerOnAfter = false
                horizontal = false
                vertical = false
                moveDirection = {}

                if (currentY > downLimit) {
                    currentY = currentY / wearDistance
                }
                if (!isMotion) opa.onTouchStart(isMotion)
                moved.stop((currentPos) => {
                    isMoving = false
                    moveTarget = currentY = currentPos.translateY
                    // Only when the movement, the callback function will be performed
                    // isMotion = true
                    opa.onTouchStart(true)
                    opa.onMotionStop(moveTarget)
                })
            },
            move (fingerd) {
                if (moved.moveStatus === 'start') {
                    return false
                }
                isMoving = true
                let tev = fingerd.fingers[0],
                    fingerInElement = tev.fingerInElement
                if (!fingerInElement) {
                    if (!isMoveOut) {
                        isMoveOut = true
                        this.makeMove(tev)
                    }
                    return false
                }

                moveDirection = tev.direction
                if ((moveDirection.top || moveDirection.bottom) &&
                    !horizontal &&
                    Math.abs(tev.distanceY) >= 10) {
                    vertical = true
                }
                if ((moveDirection.left || moveDirection.right) &&
                    !vertical &&
                    Math.abs(tev.distanceX) >= 10) {
                    horizontal = true
                }
                
                if (Math.abs(tev.distanceY) < 10 && Math.abs(tev.distanceX) < 10) {
                    return false
                }
                if (vertical || !opa.unidirectional) {
                    let disy = tev.distanceY > 0
                                ? tev.distanceY - 10
                                : tev.distanceY + 10
                    moveTarget = currentY + disy
                    
                    if (moveTarget > downLimit || upLimit > 0) {
                        moveTarget = opa.bounce ? downLimit + (moveTarget - downLimit) * wearDistance : downLimit
                    } else if (moveTarget < upLimit) {
                        moveTarget = opa.bounce ? (upLimit + (moveTarget - upLimit) * wearDistance) : upLimit
                    }

                    if (moveTarget <= loadMorePoint &&
                        !lockLoadmore &&
                        moveDirection.top) {

                        lockLoadmore = true
                        opa.loadMore.onLoadMore.call(this)
                    }
                    moved.transform(tev.el, 'translateY', moveTarget)
                    if (opa.scrollBar) {
                        cssText(scrollBarDom, 'opacity: .4;')
                        moveScrollBar(-(moveTarget * proportion))
                    }
                    if (opa.pullDown &&
                        opa.pullDown.use &&
                        moveTarget > 0 &&
                        !lockPullDown) {
                        opa.pullDown.onBegin && opa.pullDown.onBegin.call(this, moveTarget)
                    }

                    opa.onTouchMove.call(this, moveTarget)
                }

                if (vertical && opa.unidirectional || isMotion) {
                    return false
                }
            },
            end (fingerd) {
                if (horizontal && !borderBounce) {
                    opa.onTouchEnd(moved.moveStatus)
                    return false
                }
                let tev = fingerd.fingers[0],
                    changeFingerIndex = fingerd.changeFingerIndex,
                    fingerNumber = fingerd.fingerNumber,
                    fingerInElement = tev.fingerInElement

                isMoving = false
                if (changeFingerIndex === 0 && 
                    fingerNumber === 0 && 
                    fingerInElement) {
                    this.makeMove(tev)
                }
                opa.onTouchEnd(moved.moveStatus === 'start')
            },

            cancel (fingerd) {
                let tev = fingerd.fingers[0],
                    changeFingerIndex = fingerd.changeFingerIndex,
                    fingerNumber = fingerd.fingerNumber,
                    fingerInElement = tev.fingerInElement
                    
                if (changeFingerIndex === 0 && fingerNumber === 0 && fingerInElement) {
                    currentY = currentY + tev.distanceY
                }
            },

            makeMove (tev) {
                let tweenS

                moveTime = tev.transTime
                currentY = moveTarget
                transTargetY = currentY + tev.transDistanceY
                if (opa.pullDown &&
                    opa.pullDown.use &&
                    currentY >= opa.pullDown.distance &&
                    !lockPullDown) {

                    lockPullDown = true
                    opa.pullDown.onActive && opa.pullDown.onActive.call(this)
                    downLimit = downLimit + opa.pullDown.distance
                    this.scrollTo(opa.pullDown.distance, 300)
                    return
                }

                if (opa.pullDown &&
                    opa.pullDown.use &&
                    currentY > downLimit) {
                    isTriggerOnAfter = true
                }
                if (currentY > downLimit || upLimit > 0) {
                    transTargetY = downLimit
                    moveType = 'easeOutStrong'
                    moveTime = opa.bounce ? 500 : tev.transTime
                    borderBounce = true
                } else if (currentY < upLimit) {
                    transTargetY = upLimit
                    moveType = 'easeOutStrong'
                    moveTime = opa.bounce ? 500 : tev.transTime
                    borderBounce = true
                } else if (transTargetY < upLimit) {
                    if (opa.bounce) {
                        transTargetY = upLimit
                        moveType = 'backOut'
                        moveTime = wearTime(upLimit)
                    } else {
                        moveType = 'easeOutStrong'
                    }
                } else if (transTargetY > downLimit) {
                    if (opa.bounce) {
                        transTargetY = downLimit
                        moveType = 'backOut'
                        moveTime = wearTime(downLimit)
                    } else {
                        moveType = 'easeOutStrong'
                    }
                }

                if (Math.abs(tev.transDistanceY) > MIN_DISTANCE || borderBounce) {
                    this.wrapMove(transTargetY, moveTime, moveType, tweenS)
                } else {
                    if (opa.scrollBar && moved.moveStatus !== 'start') {
                        cssText(scrollBarDom, 'opacity: 0;')
                    }
                    if (refreshDirty) {
                        this.refresh()
                    }
                    if (loadEndDirty) {
                        this.loadEnd()
                    }
                }

                function wearTime (target) {
                    let weartime = (Math.abs(target - currentY) / Math.abs(tev.transDistanceY) * tev.transTime)
                    if (weartime < 500) {
                        weartime = 500
                        tweenS = 2
                    } else if (weartime > 2000) {
                        weartime = 2000
                    }
                    return weartime
                }
            },

            wrapMove (transTargetY, moveTime, moveType, tweenS) {
                let that = this
                moved.start({
                    el: el,
                    target: {
                        translateY: transTargetY
                    },
                    type: moveType,
                    time: moveTime,
                    s: tweenS || 0.7,
                    inCallBack: function (currentPos) {
                        currentY = currentPos.translateY
                        if (!opa.bounce) {
                            if (currentY >= downLimit) {
                                moved.stop((currentPos) => {
                                    currentY = downLimit
                                    moved.transform(el, 'translateY', currentY)
                                })
                            }
                            if (currentY <= upLimit) {
                                moved.stop((currentPos) => {
                                    currentY = upLimit
                                    moved.transform(el, 'translateY', upLimit)
                                })
                            }
                        }
                        if (currentY <= loadMorePoint &&
                            !lockLoadmore &&
                            moveDirection.top) {

                            lockLoadmore = true
                            opa.loadMore.onLoadMore.call(that)
                        }
                        if (isTriggerOnAfter) {
                            opa.pullDown.onAfter(currentPos.translateY)
                        }
                        
                        if (opa.scrollBar) {
                            moveScrollBar(-(currentPos.translateY * proportion))
                        }
                        opa.onTransMove.call(this, currentY)
                    },
                    endCallBack: function (currentPos) {
                        currentY = currentPos.translateY
                        if (refreshDirty) {
                            that.refresh()
                        }
                        if (loadEndDirty) {
                            that.loadEnd()
                        }
                        if (opa.scrollBar) {
                            cssText(scrollBarDom, 'opacity: 0;')
                        }
                        opa.onTransMoveEnd.call(this, currentY)
                        isMotion = false
                        borderBounce = false
                        opa.onMotionStop(currentY)
                    }
                })
            },

            scrollTo (target, time, limit) {
                let child,
                    selector
                if (typeof target === 'string') {
                    child = document.querySelector(target)
                } else if (target instanceof Element) {
                    child = target
                }
                if (child) {
                    if (!isInElement(el, child)) {
                        throwError('ScrollTo function argument error, `child` must be a child of `parent`')
                    }
                    target = -getRelativeRect(el, child).top
                }
                if (limit && (target > downLimit || upLimit > 0)) {
                    target = downLimit
                } else if (limit && target < upLimit) {
                    target = upLimit
                }
                moveTarget = currentY = target
                moved.stop()
                this.wrapMove(target, time, 'easeOutStrong')
            },

            loadEnd (callBack) {
                if (!isMoveOut && (moved.moveStatus === 'start' || isMoving)) {
                    loadEndDirty = true
                    loadMoreCallBack = callBack || noop
                    return false
                }

                let cb = callBack || loadMoreCallBack
                cb()

                loadEndDirty = false
                lockLoadmore = false
                this.refreshSize()
            },

            refresh (callBack) {
                if (!isMoveOut && (moved.moveStatus === 'start' || isMoving)) {
                    refreshDirty = true
                    refreshCallBack = callBack || noop
                    return false
                }
                
                let cb = callBack || refreshCallBack
                cb()

                lockPullDown = false
                refreshDirty = false
                downLimit = cacheDownLimit
                this.refreshSize()
                let matrixObj = getPropFromMatrix(el)
                if (matrixObj.translateY > downLimit) {
                    isTriggerOnAfter = true
                    this.scrollTo(downLimit, 500)
                }
            },

            refreshSize () {
                elSize = parseFloat(getStyle(el, 'height'))
                wrapSize = wrapEl.clientHeight
                upLimit = wrapSize - elSize
                cacheDownLimit = downLimit = 0
                if (upLimit < 0) {
                    loadMorePoint = upLimit + opa.loadMore.distance
                } else {
                    loadMorePoint = 0
                }
                if (upLimit >= 0) {
                    opa.scrollBar = false
                } else {
                    opa.scrollBar = cacheScrollBar
                }
                if (opa.scrollBar) {
                    proportion = wrapSize / elSize
                    scrollBarSize = wrapSize * proportion
                    barMinHeight = scrollBarSize < barMinHeight ? scrollBarSize : barMinHeight
                    barTopLimit = -downLimit * proportion
                    barBottomLimit = -upLimit * proportion
                    createScrollBar(wrapEl, scrollBarSize)
                }
            }

        }

    }

}