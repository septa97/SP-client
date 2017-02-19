import Vue from 'vue'
import VueRouter from 'vue-router'
import AppView from './App.vue'
import routes from './routes'

Vue.use(VueRouter)

const router = new VueRouter({
    routes
})

const app = new Vue({
    el: '#app',
    data: {
        backend_url: 'localhost:5000',
        frontend_url: 'localhost:8080'
    },
    render: h => h(AppView),
    router
})
