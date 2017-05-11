import * as util from 'util'
let dom = null
describe('Detection tool function', () => {

    beforeEach(() => {
        dom = document.createElement('div')
        document.body.appendChild(dom)
    })

    afterEach(() => {
        dom.parentNode.removeChild(dom)
    })

    describe('toArray', () => {
        it('If the argument is a array-like then the return value should also be an array', () => {
            let fakeArray = {
                0: 'a',
                1: 'b',
                2: 'c',
                length: 3
            }
            let val = util.toArray(fakeArray)
            expect(Array.isArray(val)).toBe(true)
        })

        it('If the argument is an array, the array is returned directly', () => {
            let arr = [1, 2, 3]
            let val = util.toArray(arr)
            expect(Array.isArray(val)).toBe(true)
        })
    })

    describe('parentNode', () => {
        it('Gets the parent of the element', () => {
            let val = util.parentNode(dom)
            expect((dom === null || dom instanceof Element)).toBe(true)
        })
    })

    describe('getAbsMaxFromArray', () => {
        it('Gets the maximum value in the array', () => {
            let arr = [1, 2, 3, 4, 5]
            let val = util.getAbsMaxFromArray(arr)
            expect(val).toBe(5)
        })
    })

    describe('is3DMatrix', () => {
        it('Determines whether the element applies the 3d transform', () => {
            let val

            dom.style.webkitTransform = 'rotateX(30deg)'
            val = util.is3DMatrix(dom)
            expect(val).toBe(true)

            dom.style.webkitTransform = 'rotateZ(30deg)'
            val = util.is3DMatrix(dom)
            expect(val).toBe(false)
        })
    })

    describe('getRelativeRect', () => {
        it('The distance from the element to the positioning parent should match the expectation', () => {
            dom.style.cssText = 'margin: 100px; width: 50px; height: 50px;'
            document.body.style.cssText = 'position: absolute;'
            let val = util.getRelativeRect(document.body, dom)
            expect(val.top).toBe(100)
            expect(val.left).toBe(100)
        })
    })

    describe('isInElement', () => {
        it('The positional relationship between elements should be in line with expectations', () => {
            let val

            val = util.isInElement(document.body, dom)
            expect(val).toBe(true)
            val = util.isInElement(dom, document.body)
            expect(val).toBe(false)
        })
    })
})