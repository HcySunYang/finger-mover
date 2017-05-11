import Moved from 'Moved'
let moved
let dom
describe('Initialization Moved', () => {

    beforeEach(() => {
        moved = new Moved()
        dom = document.createElement('div')
        dom.id = 'moved-test'
        document.body.appendChild(dom)
    })

    afterEach(() => {
        dom.parentNode.removeChild(dom)
    })

    describe('Whether to use new', () => {
        it('Do not use new', () => {
            let isWarned = false
            try {
                Moved()
            } catch (e) {
                isWarned = true
            }
            expect(isWarned).toBe(true)
        })

        it('Use new', () => {
            moved = new Moved()
            expect(moved instanceof Moved).toBe(true)
        })
    })

    describe('Start moving(Tween = easeOutStrong)', () => {
        it('When moving to the end, the position should be in line with expectations', (done) => {
            moved.start({
                el: dom,
                target: {
                    translateX: 100,
                    translateY: 100,
                    rotateX: 10,
                    rotateY: 10,
                    rotateZ: 10,
                    scaleX: 10,
                    scaleY: 10,
                    scaleZ: 10,
                    skewX: 10,
                    skewY: 10
                },
                endCallBack: function (currentPos) {
                    console.log(currentPos)
                    expect(currentPos.translateX).toBe(100)
                    expect(currentPos.translateY).toBe(100)
                    expect(currentPos.rotateX).toBe(10)
                    expect(currentPos.rotateY).toBe(10)
                    expect(currentPos.rotateZ).toBe(10)
                    expect(currentPos.scaleX).toBe(10)
                    expect(currentPos.scaleY).toBe(10)
                    expect(currentPos.scaleZ).toBe(10)
                    expect(currentPos.skewX).toBe(10)
                    expect(currentPos.skewY).toBe(10)
                    done()
                },
                time: 1000
            })
        })
    })

    describe('Start moving(Tween = backOut)', () => {
        it('When moving to the end, the position should be in line with expectations', (done) => {
            moved.start({
                el: dom,
                type: 'backOut',
                target: {
                    translateX: 100
                },
                endCallBack: function (currentPos) {
                    expect(currentPos.translateX).toBe(100)
                    done()
                },
                time: 1000
            })
        })
    })

    describe('Stop motion', () => {
        it('The movement has stopped', (done) => {
            dom.style.cssText = 'width: 100px; height: 100px; background-color: red;'
            moved.start({
                el: dom,
                target: {
                    translateY: 100
                },
                time: 1000
            })

            setTimeout(() => {
                moved.stop(function () {
                    expect(moved.moveStatus).toBe('stop')
                    done()
                })
            }, 200)
        })
    })

    describe('Call stop before starting to run', () => {
        it('If the element has not started to move, then return directly', () => {
            let isCall = false
            moved.stop(function () {
                isCall = true
            })
            expect(isCall).toBe(false)
        })
    })

    describe('Call the transform method to manipulate the element', () => {
        it('The element should be rotated', () => {
            moved.transform(dom, 'rotateZ', 100)
            let attr = getComputedStyle(dom)['webkitTransform']
            expect(attr).toMatch(/matrix/)
        })
    })

    describe('Call the getPropFromMatrix method to get the value of the transform property of the element', () => {
        it('Before the element transforms, the attribute value should match the expected', () => {
            let transformAttr = moved.getPropFromMatrix(dom)
            expect(transformAttr.translateX).toBe(0)
            expect(transformAttr.translateY).toBe(0)
            expect(transformAttr.translateZ).toBe(0)
            expect(transformAttr.scaleX).toBe(1)
            expect(transformAttr.scaleY).toBe(1)
            expect(transformAttr.scaleZ).toBe(1)
            expect(transformAttr.rotateX).toBe(0)
            expect(transformAttr.rotateY).toBe(0)
            expect(transformAttr.rotateZ).toBe(0)
            expect(transformAttr.skewX).toBe(0)
            expect(transformAttr.skewY).toBe(0)
        })

        it('After the element is transformed, the attribute value should match the expectation', () => {
            moved.transform(dom, 'translateX', 100)
            moved.transform(dom, 'translateY', 100)
            moved.transform(dom, 'translateZ', 100)
            moved.transform(dom, 'scaleX', 100)
            moved.transform(dom, 'scaleY', 100)
            moved.transform(dom, 'scaleZ', 100)
            moved.transform(dom, 'rotateX', 100)
            moved.transform(dom, 'rotateY', 100)
            moved.transform(dom, 'rotateZ', 100)
            moved.transform(dom, 'skewX', 100)
            moved.transform(dom, 'skewY', 100)
            let transformAttr = moved.getPropFromMatrix(dom)
            expect(transformAttr.translateX).toBe(100)
            expect(transformAttr.translateY).toBe(100)
            expect(transformAttr.translateZ).toBe(100)
            expect(transformAttr.scaleX).toBe(100)
            expect(transformAttr.scaleY).toBe(100)
            expect(transformAttr.scaleZ).toBe(100)
            expect(transformAttr.rotateX).toBe(100)
            expect(transformAttr.rotateY).toBe(100)
            expect(transformAttr.rotateZ).toBe(100)
            expect(transformAttr.skewX).toBe(100)
            expect(transformAttr.skewY).toBe(100)
        })
    })
    
})