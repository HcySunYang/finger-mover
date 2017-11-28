<template>
    <div>
        <slot name="pulldown"></slot>
        <slot></slot>
        <slot name="loadmore"></slot>
    </div>
</template>

<script>
import Fmover from '../index'
import simulationScrollY from 'plugins/simulation-scroll-y/simulation-scroll-y'

export default {
    name: 'simulationScrollY',
    props: {
        scrollBar: {
            type: Boolean,
            default: true
        },
        unidirectional: {
            type: Boolean,
            default: false
        },
        bounce: {
            type: Boolean,
            default: true
        },
        pullDown: {
            type: Object,
            default: function () {
                return {
                    use: false,
                    distance: 50,
                    onBegin: function (currentY) {},
                    onActive: function () {},
                    onAfter: function (currentY) {}
                }
            }
        },
        loadMore: {
            type: Object,
            default: function () {
                return {
                    distance: 0,
                    onLoadMore: function () {}
                }
            }
        }
    },
    methods: {
        scrollTo (target, time, limit) {
            this.fm[0].scrollTo(target, time, limit)
        },
        loadEnd () {
            this.fm[0].loadEnd()
        },
        refresh (callBack) {
            this.delayed(this.fm[0].refresh, callBack)
        },
        refreshSize () {
            this.delayed(this.fm[0].refreshSize)
        },
        createInstance () {
            if (this.fm) {
                this.fm[0].refreshSize()
                return
            }
            this.fm = new Fmover({
                el: this.$el,
                plugins: [
                    simulationScrollY({
                        scrollBar: this.scrollBar,
                        unidirectional: this.unidirectional,
                        bounce: this.bounce,
                        onTouchMove: (currentY) => {
                            this.$emit('on-touchmove', currentY)
                        },
                        onTransMove: (currentY) => {
                            this.$emit('on-transmove', currentY)
                        },
                        onTransMoveEnd: (currentY) => {
                            this.$emit('on-transmove-end', currentY)
                        }
                    })
                ]
            })
        },
        delayed (fn, arg) {
            setTimeout(fn.bind(this, arg), 0)
        }
    },
    mounted () {
        this.delayed(this.createInstance)
    },
    updated () {
        this.delayed(this.createInstance)
    }
}
</script>
