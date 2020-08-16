import Vue from 'vue'
import Markers from './Markers.vue'

const Components = {
  Markers
}

Object.keys(Components).forEach(name => {
  Vue.component(name, Components[name])
})

export default Components
