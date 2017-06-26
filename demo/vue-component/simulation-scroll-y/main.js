import Vue from 'vue'
import App from 'demo/simulation-scroll-y/app'

Vue.config.productionTip = false

new Vue({
    el: '#box',
    template: '<app/>',
    components: {
        App
    }
})