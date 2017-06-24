<template>
    <div>
        <slot></slot>
    </div>
</template>

<script>
import Fmover from '../index'
import simulationScrollY from 'plugins/simulation-scroll-y/simulation-scroll-y'

export default {
    name: 'simulationScrollY',
    data () {
        return {

        }
    },
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
    mounted () {
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
                        this.$emit('onTouchMove', currentY)
                    },
                    onTransMove: (currentY) => {
                        this.$emit('onTransMove', currentY)
                    },
                    onTransMoveEnd: (currentY) => {
                        this.$emit('onTransMoveEnd', currentY)
                    }
                })
            ]
        })
    }
}
</script>
