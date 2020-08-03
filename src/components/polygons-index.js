import Vue from 'vue'
import Polygons from './Polygons.vue'

const Components = {
  Polygons
}

Object.keys(Components).forEach(name => {
  Vue.component(name, Components[name])
})

export default Components
