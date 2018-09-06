export default function (options) {

    return function (Fmover) {
        const {
            Moved,
            getStyle,
            extend,
            cssText,
            getRelativeRect,
            isInElement,
            throwError,
            toArray
        } = Fmover
        const SPEED = 0.5
        const AUTOPLAY_DIR = {
            top: 'top',
            bottom: 'bottom'
        }
        let el = null,
            parentEl = null,
            slideEls = null,
            slideNumber = 0,
            realSlideNumber = 0,
            slideHeight = 0,
            elHeight = 0,
            current = 0,
            target = 0,
            moved = new Moved(),
            topLimit = 0,
            bottomLimit = 0,
            isMoveOut = false,
            timer = null,
            lock = false,
            isChange = false

        let noop = function () {}
        let opa = extend({
            startSlide: 1,
            autoplay: 0,
            autoplayDir: AUTOPLAY_DIR.top,
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
        }, options)
        
        return {
            index: 1,
            get slideIndex () {
                return this.redressIndex(this.index)
            },
            get slideNumber () {
                return slideNumber
            },
            init (fmover) {
                el = fmover.el
                parentEl = el.parentNode
                this.refreshWrap(true)
                opa.onInit.call(this)
            },
            start (fingerd) {
                if (fingerd.changeFingerIndex !== 0 || !opa.touchable) {
                    return false
                }
                isMoveOut = false
                isChange = false
                clearInterval(timer)
                moved.stop(function (currentPos) {
                    current = currentPos.translateY
                })
                if (opa.autoplay) {
                    clearInterval(timer)
                }
                if (this.index > slideNumber) {
                    current = current + slideNumber * slideHeight
                    this.index = 1
                } else if (this.index === 0) {
                    this.index = slideNumber
                    current = current - slideNumber * slideHeight
                }
                moved.transform(el, 'translateY', current)
                opa.onTouchStart.call(this, current)
            },
            move (fingerd) {
                let fg = fingerd.fingers[0]
                if (!opa.touchable) {
                    return false
                }
                if (!fg.fingerInElement) {
                    if (!isMoveOut) {
                        isMoveOut = true
                        this.wrapMove(fg)
                        if (opa.autoplay) {
                            clearInterval(timer)
                            this.initAutoplay()
                        }
                        opa.onTouchEnd.call(this)
                    }
                    return false
                }
                target = current + fg.distanceY
                if (!opa.loop) {
                    if (target > topLimit) {
                        target = opa.bounce ? target * 0.5 : topLimit
                    } else if (target < bottomLimit) {
                        target = opa.bounce ? (bottomLimit + (target - bottomLimit) * 0.5) : bottomLimit
                    }
                }
                
                moved.transform(el, 'translateY', target)
                opa.onTouchMove.call(this, target)
            },
            end (fingerd) {
                let fg = fingerd.fingers[0]
                if (!fg.fingerInElement ||
                    fingerd.changeFingerIndex !== 0 ||
                    fingerd.fingerNumber !== 0 ||
                    !opa.touchable) {
                    return false
                }
                current = target
                this.wrapMove(fg)
                if (opa.autoplay) {
                    clearInterval(timer)
                    this.initAutoplay()
                }
                opa.onTouchEnd.call(this)
            },
            cancel (fingerd) {
                if (!opa.touchable) {
                    return false
                }
                if (opa.autoplay) {
                    clearInterval(timer)
                    this.initAutoplay()
                }
                this.makeMove()
            },
            refresh (force) {
                this.refreshWrap(force)
                opa.onRefresh.call(this, slideNumber)
            },
            refreshWrap (force) {
                force && moved && moved.stop(() => {
                    lock = false
                })
                let cloneNodes = toArray(el.querySelectorAll('[clone=true]'))
                cloneNodes.forEach((o) => {
                    o.parentNode.removeChild(o)
                })
                slideEls = Array.prototype.slice.call(el.children)
                slideNumber = slideEls.length
                slideHeight = parseInt(getStyle(parentEl, 'height'))
                this.index = force
                                ? this.limitIndex(opa.startSlide)
                                : this.limitIndex(this.index)
                if (opa.loop) {
                    let firstSlideEl = slideEls[0]
                    let lastSlideEl = slideEls[slideNumber - 1]
                    let cloneFirst = firstSlideEl.cloneNode(true)
                    cloneFirst.setAttribute('clone', true)
                    let cloneLast = lastSlideEl.cloneNode(true)
                    cloneLast.setAttribute('clone', true)
                    el.appendChild(cloneFirst)
                    el.insertBefore(cloneLast, el.firstElementChild)
                    slideEls.push(cloneFirst)
                    slideEls.unshift(cloneLast)
                    current = -this.index * slideHeight
                } else {
                    current = -(this.index - 1) * slideHeight
                }
                
                realSlideNumber = slideEls.length
                elHeight = slideHeight * realSlideNumber
                if (!opa.loop) {
                    bottomLimit = -(elHeight - slideHeight)
                }
                cssText(parentEl, 'overflow: hidden;')
                cssText(el, `height: ${elHeight}px; width: 100%; overflow: hidden;`)
                moved.transform(el, 'translateY', current)
                slideEls.forEach((o, i, a) => {
                    cssText(o, `width: 100%; height: ${slideHeight}px;`)
                })

                if (opa.autoplay) {
                    clearInterval(timer)
                    this.initAutoplay()
                }
            },
            prev () {
                if (lock) {
                    return false
                }
                lock = true
                this.index--
                if (!opa.loop && this.index === 0) {
                    this.index = slideNumber
                }
                this.onChangeStart(this.redressIndex(this.index), AUTOPLAY_DIR.top)
                this.makeMove()
            },
            next () {
                if (lock) {
                    return false
                }
                lock = true
                this.index++
                if (!opa.loop && this.index > slideNumber) {
                    this.index = 1
                }
                this.onChangeStart(this.redressIndex(this.index), AUTOPLAY_DIR.bottom)
                this.makeMove()
            },
            slideTo (index, times) {
                if (lock || this.slideIndex === index) {
                    return false
                }
                lock = true
                if (this.index !== index) {
                    let dir = this.index > index ? AUTOPLAY_DIR.bottom : AUTOPLAY_DIR.top
                    this.index = this.limitIndex(index)
                    this.onChangeStart(this.redressIndex(this.index), dir)
                    this.makeMove(times)
                }
            },
            initAutoplay () {
                timer = setInterval(() => {
                    if (opa.autoplayDir === AUTOPLAY_DIR.top) {
                        this.next()
                    } else {
                        this.prev()
                    }
                }, opa.autoplay)
            },
            wrapMove (fg) {
                let forceStopTop = opa.loop || (!opa.loop && this.index !== slideNumber)
                let forceStopBottom = opa.loop || (!opa.loop && this.index !== 1)
                
                if (forceStopTop &&
                    (fg.direction.top && Math.abs(fg.yv) > SPEED && fg.distanceY < 0) ||
                    (forceStopTop && fg.distanceY < -slideHeight / 2)) {
                    this.index++
                    this.onChangeStart(this.redressIndex(this.index), AUTOPLAY_DIR.top)
                } else if (forceStopBottom &&
                            (fg.direction.bottom && Math.abs(fg.yv) > SPEED && fg.distanceY > 0) ||
                            (forceStopBottom && fg.distanceY > slideHeight / 2)) {
                    this.index--
                    this.onChangeStart(this.redressIndex(this.index), AUTOPLAY_DIR.bottom)
                }
                this.makeMove()
            },

            makeMove (times) {
                let that = this
                opa.onTransStart.call(this, current)
                if (opa.loop) {
                    if (this.index < 0) {
                        this.index = 0
                    } else if (this.index > slideNumber + 1) {
                        this.index = slideNumber + 1
                    }
                    current = -this.index * slideHeight
                } else {
                    if (this.index < 1) {
                        this.index = 1
                    } else if (this.index > slideNumber) {
                        this.index = slideNumber
                    }
                    current = -(this.index - 1) * slideHeight
                }
                moved.start({
                    el: el,
                    target: {
                        translateY: current
                    },
                    inCallBack: function (currentPos) {
                        opa.onTransMove.call(that, currentPos.translateY)
                        if (isChange) {
                            opa.onChange.call(that, currentPos.translateY)
                        }
                    },
                    endCallBack: function (currentPos) {
                        lock = false
                        if (opa.loop && that.index > slideNumber) {
                            current = current + slideNumber * slideHeight
                            moved.transform(el, 'translateY', current)
                            that.index = 1
                        } else if (opa.loop && that.index === 0) {
                            that.index = slideNumber
                            current = current - slideNumber * slideHeight
                            moved.transform(el, 'translateY', current)
                        }
                        opa.onTransEnd.call(that, currentPos.translateY)
                        if (isChange) {
                            opa.onChangeEnd.call(that, currentPos.translateY)
                        }
                    },
                    time: typeof times === 'undefined' ? opa.times : times
                })
            },

            onChangeStart (index, dir) {
                isChange = true
                opa.onChangeStart.call(this, index, dir)
            },

            redressIndex (index) {
                if (index === 0) {
                    return slideNumber
                }
                if (index > slideNumber) {
                    return 1
                }
                return index
            },

            limitIndex (index) {
                return index > slideNumber 
                            ? slideNumber
                            : index < 1
                                ? 1
                                : index
            },
            destroy () {
                clearInterval(timer)
            }

        }

    }

}