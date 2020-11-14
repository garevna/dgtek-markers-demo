import Vue from 'vue'
import Buildings from './Buildings.vue'

const Components = {
  Buildings
}

Object.keys(Components).forEach(name => {
  Vue.component(name, Components[name])
})

export default Components
