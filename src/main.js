import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false

console.log(process.env.VUE_APP_BUILDINGS_API_ENDPOINT)
console.log(process.env.VUE_APP_BUILDINGS_API_KEY)

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')
