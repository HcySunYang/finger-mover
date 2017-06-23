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
    mounted () {
        console.log(this.$el)
        new Fmover({
            el: this.$el,
            plugins: [
                simulationScrollY()
            ]
        })
    }
}
</script>
