export default function (options) {

    return function (Fmover) {
        const {
            Moved,
            getStyle,
            extend,
            cssText,
            getRelativeRect,
            isInElement,
            throwError
        } = Fmover
        let noop = function () {}

        let opa = extend({
            scrollBar: true,
            bounce: true,
            onTouchMove: noop,
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
            barMinWidth = 7,
            leftLimit = 0,
            rightLimit = 0,
            barLeftLimit = 0,
            barRightLimit = 0,
            moved = new Moved(),
            currentX = 0,
            moveTarget = 0,
            transTargetX = 0,
            moveType = 'easeOutStrong',
            moveTime = 0,
            borderBounce = false,
            isMoveOut = false

        function createScrollBar (parent, width) {
            if (scrollBarDom) {
                cssText(scrollBarDom, `width: ${width}px;`)
                return
            }
            scrollBarDom = document.createElement('span')
            cssText(scrollBarDom, `
                position: absolute;
                z-index: 10000000;
                left:0;
                bottom: 3px;
                height: 3px; 
                width: ${width}px; 
                background-color: #000;
                opacity: 0;
                border-radius: 1.5px;
                transition: opacity .2s;
                -webkit-transition: opacity .2s;
            `)
            let parentPosition = getStyle(parent, 'position')
            if (parentPosition === 'static') {
                cssText(parent, 'position: relative;')
            }
            parent.appendChild(scrollBarDom)
        }
        function moveScrollBar (target) {
            let scrollBarTarget = target
            let gain = 4
            let shorten = 0

            if (scrollBarTarget < barLeftLimit) {
                shorten = (barLeftLimit - scrollBarTarget) * gain
                if (shorten > scrollBarSize - barMinWidth) {
                    shorten = scrollBarSize - barMinWidth
                }
                scrollBarTarget = barLeftLimit
            } else if (scrollBarTarget > barRightLimit) {
                shorten = (scrollBarTarget - barRightLimit) * gain
                if (shorten > scrollBarSize - barMinWidth) {
                    shorten = scrollBarSize - barMinWidth
                }
                scrollBarTarget = barRightLimit + shorten
            }

            let barRealWidth = scrollBarSize - shorten
            scrollBarDom.style.width = `${barRealWidth}px`
            moved.transform(scrollBarDom, 'translateX', scrollBarTarget)
        }

        return {
            init (fmover) {
                el = fmover.el
                wrapEl = el.parentNode
                let elPosition = getStyle(el, 'position')
                if (elPosition === 'static') {
                    cssText(el, 'position: relative; z-index: 10;')
                }
                this.refreshSize()
                
            },
            start (fingerd) {
                let tev = fingerd.fingers[0]
                moveType = 'easeOutStrong'
                borderBounce = false
                isMoveOut = false

                moved.stop((currentPos) => {
                    currentX = currentPos.translateX
                    opa.onMotionStop(currentX)
                })
            },
            move (fingerd) {
                if (moved.moveStatus === 'start') {
                    return false
                }
                let tev = fingerd.fingers[0],
                    fingerInElement = tev.fingerInElement

                moveTarget = currentX + tev.distanceX
                    
                if (!fingerInElement) {
                    if (!isMoveOut) {
                        isMoveOut = true
                        this.makeMove(tev)
                    }
                    return false
                }
                if (moveTarget > leftLimit || rightLimit > 0) {
                    moveTarget = opa.bounce ? moveTarget * 0.5 : leftLimit
                } else if (moveTarget < rightLimit) {
                    moveTarget = opa.bounce ? (rightLimit + (moveTarget - rightLimit) * 0.5) : rightLimit
                }
                
                moved.transform(tev.el, 'translateX', moveTarget)
                if (opa.scrollBar) {
                    cssText(scrollBarDom, 'opacity: .4;')
                    moveScrollBar(-(moveTarget * proportion))
                }
                opa.onTouchMove.call(this, fingerd)
                
            },
            end (fingerd) {
                let tev = fingerd.fingers[0],
                    changeFingerIndex = fingerd.changeFingerIndex,
                    fingerNumber = fingerd.fingerNumber,
                    fingerInElement = tev.fingerInElement

                if (changeFingerIndex === 0 && fingerNumber === 0 && fingerInElement) {
                    this.makeMove(tev)
                }

            },

            cancel (fingerd) {
                let tev = fingerd.fingers[0],
                    changeFingerIndex = fingerd.changeFingerIndex,
                    fingerNumber = fingerd.fingerNumber,
                    fingerInElement = tev.fingerInElement

                if (changeFingerIndex === 0 && fingerNumber === 0 && fingerInElement) {
                    currentX = currentX + tev.distanceX
                }
            },

            makeMove (tev) {
                let tweenS

                moveTime = tev.transTime
                currentX = moveTarget
                transTargetX = currentX + tev.transDistanceX

                if (currentX > leftLimit || rightLimit > 0) {
                    transTargetX = leftLimit
                    moveType = 'easeOutStrong'
                    moveTime = opa.bounce ? 500 : tev.transTime
                    borderBounce = true
                } else if (currentX < rightLimit) {
                    transTargetX = rightLimit
                    moveType = 'easeOutStrong'
                    moveTime = opa.bounce ? 500 : tev.transTime
                    borderBounce = true
                } else if (transTargetX < rightLimit) {
                    if (opa.bounce) {
                        transTargetX = rightLimit
                        moveType = 'backOut'
                        moveTime = wearTime(rightLimit)
                    } else {
                        moveType = 'easeOutStrong'
                    }
                } else if (transTargetX > leftLimit) {
                    if (opa.bounce) {
                        transTargetX = leftLimit
                        moveType = 'backOut'
                        moveTime = wearTime(leftLimit)
                    } else {
                        moveType = 'easeOutStrong'
                    }
                }

                if (Math.abs(tev.transDistanceX) > MIN_DISTANCE || borderBounce) {
                    this.wrapMove(transTargetX, moveTime, moveType, tweenS)
                } else {
                    if (opa.scrollBar) {
                        cssText(scrollBarDom, 'opacity: 0;')
                    }
                }

                function wearTime (target) {
                    let weartime = (Math.abs(target - currentX) / Math.abs(tev.transDistanceY) * tev.transTime)
                    if (weartime < 500) {
                        weartime = 500
                        tweenS = 2
                    } else if (weartime > 2000) {
                        weartime = 2000
                    }
                    return weartime
                }
            },

            wrapMove (transTargetX, moveTime, moveType, tweenS) {
                moved.start({
                    el: el,
                    target: {
                        translateX: transTargetX
                    },
                    type: moveType,
                    time: moveTime,
                    s: tweenS,
                    inCallBack: function (currentPos) {
                        currentX = currentPos.translateX
                        if (!opa.bounce) {
                            if (currentX >= leftLimit) {
                                moved.stop((currentPos) => {
                                    currentX = leftLimit
                                    moved.transform(el, 'translateX', currentX)
                                })
                            }
                            if (currentX <= rightLimit) {
                                moved.stop((currentPos) => {
                                    currentX = rightLimit
                                    moved.transform(el, 'translateX', rightLimit)
                                })
                            }
                        }
                        
                        if (opa.scrollBar) {
                            moveScrollBar(-(currentPos.translateX * proportion))
                        }
                        opa.onTransMove.call(this, currentX)
                    },
                    endCallBack: function (currentPos) {
                        currentX = currentPos.translateX
                        opa.onTransMoveEnd.call(this, currentX)
                        opa.onMotionStop(currentX)
                        if (opa.scrollBar) {
                            cssText(scrollBarDom, 'opacity: 0;')
                        }
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
                    target = -getRelativeRect(el, child).left
                }
                if (limit && target >= leftLimit) {
                    target = leftLimit
                } else if (limit && rightLimit < 0 && target < rightLimit) {
                    target = rightLimit
                } else if (limit && rightLimit >= 0) {
                    target = leftLimit
                }

                currentX = target
                this.wrapMove(target, time, 'easeOutStrong')
            },

            refreshSize () {
                elSize = parseFloat(getStyle(el, 'width'))
                wrapSize = wrapEl.clientWidth
                rightLimit = wrapSize - elSize
                leftLimit = 0
                if (rightLimit > 0) {
                    opa.scrollBar = false
                }
                if (opa.scrollBar) {
                    proportion = wrapSize / elSize
                    scrollBarSize = wrapSize * proportion
                    barMinWidth = scrollBarSize < barMinWidth ? scrollBarSize : barMinWidth
                    barLeftLimit = -leftLimit * proportion
                    barRightLimit = -rightLimit * proportion
                    createScrollBar(wrapEl, scrollBarSize)
                }
            }

        }

    }

}