import Fmover from 'Fmover'

describe('Initialization', () => {
    describe('Whether to use new', () => {
        it('Do not use new', () => {
            let isWarned = false
            try { 
                Fmover()
            } catch (e) {
                if (e.toString() === 'TypeError: Cannot call a class as a function') {
                    isWarned = true
                }
            }
            expect(isWarned).toBe(true)
        })
        describe('Use new', () => {
            describe('parameter：opt.el', () => {
                it('The opt.el parameter is not passed', () => {
                    let isWarned = false
                    try {
                        new Fmover()
                    } catch (e) {
                        if (e.toString() === 'TypeError: This is an invalid selector: undefined') {
                            isWarned = true
                        }
                    }
                    expect(isWarned).toBe(true)
                })

                it('Pass the opt.el parameter', () => {
                    let isWarned = false
                    let dom = document.createElement('div')
                    dom.id = 'test'
                    document.body.appendChild(dom)
                    try {
                        new Fmover({
                            el: '#test'
                        })
                    } catch (e) {
                        isWarned = true
                    }
                    expect(isWarned).toBe(false)
                })
            })

            describe('parameter：opt.plugins', () => {
                it('Pass the opt.plugins parameter', () => {
                    let testPlugin = function () {
                        return function () {
                            return {
                                init: function (fmover) {
                                    expect(fmover instanceof Fmover).toBe(true)
                                }
                            }
                        }
                    }
                    let isWarned = false
                    let dom = document.createElement('div')
                    dom.id = 'test2'
                    document.body.appendChild(dom)

                    new Fmover({
                        el: '#test2',
                        plugins: [
                            testPlugin()
                        ]
                    })

                })

            })
        })
    })
    
})