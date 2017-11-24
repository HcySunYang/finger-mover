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
            this.fm[0].refresh(callBack)
        },
        refreshSize () {
            this.fm[0].refreshSize()
        }
    },
    updated () {
        this.fm = new Fmover({
            el: this.$el,
            plugins: [
                simulationScrollY({
                    scrollBar: this.scrollBar,
                    unidirectional: this.unidirectional,
                    bounce: this.bounce,
                    pullDown: this.pullDown,
                    loadMore: this.loadMore,

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
    }
}
</script>
