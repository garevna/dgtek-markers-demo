<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12" lg="7">
        <div id="dgtek-container-for-map"></div>
      </v-col>
      <v-col cols="12" lg="5">
        <SelectedPolygon
              v-if="selectedPolygonId"
              :coordinates="coordinates"
              :type.sync="polygonType"
              :markerIndex.sync="selectedMarkerIndex"
              :markerCoordinates.sync="selectedMarkerCoordinates"
        />
      </v-col>
    </v-row>
    <Button
          :clicked.sync="newPolygon"
          color="#09b"
          v-if="drawingModeAvailable"
          text="Create new polygon"
    />
    <Button
          :clicked.sync="removePolygon"
          v-if="selectedPolygonId"
          text="Remove polygon"
    />
    <Button
          :clicked.sync="save"
          text="SAVE"
    />
  </v-container>
</template>

<style scoped>

</style>

<script>

import '@/components/Storage.js'
import Map from '@/components/map.js'
import SelectedPolygon from '@/components/SelectedPolygon.vue'
import Button from '@/components/Button.vue'

export default {
  name: 'Polygons',

  components: {
    SelectedPolygon,
    Button
  },

  props: ['saveData'],

  data: () => ({
    container: null,
    map: null,
    selectedPolygonId: null,
    coordinates: null,
    indexes: {},
    selectedMarkerIndex: null,
    selectedMarkerCoordinates: null,
    showButton: true,
    newPolygon: false,
    removePolygon: false
  }),

  computed: {
    drawingModeAvailable () {
      return !!this.map && !this.map.drawingMode && !this.selectedPolygonId
    },
    polygonType: {
      get () {
        return localStorage.getFeatureType(this.selectedPolygonId)
      },
      set (val) {
        localStorage.updateFeatureType(this.selectedPolygonId, val)
      }
    },
    save: {
      get () {
        return this.saveData
      },
      set (val) {
        this.$emit('update:saveData', val)
      }
    }
  },

  watch: {
    selectedMarkerCoordinates: {
      deep: true,
      handler (val) {
        if (!val || !this.selectedMarkerIndex) return
        localStorage.updateMarkerCoordinates(this.selectedPolygonId, this.selectedMarkerIndex, val.map(item => parseFloat(item)))
      }
    },
    selectedMarkerIndex (val) {
      if (typeof val !== 'number') this.container.dispatchEvent(new Event('hide-all-markers'))
      else this.container.dispatchEvent(Object.assign(new Event('show-marker'), { markerIndex: val }))
    },
    newPolygon (val) {
      if (!val) return
      this.map.switchToDrawingMode()
      this.newPolygon = false
    },
    removePolygon (val) {
      if (!val) return
      this.deletePolygon()
      this.selectedPolygonId = undefined
      this.removePolygon = false
    }
  },

  methods: {

    async getData () {
      localStorage.clear();
      ['ServiceAvailable', 'BuildCommenced', 'ComingSoon'].forEach(item => localStorage.setItemByName(item, []))
      const response = await (await fetch('https://dka.dgtek.net/api/frontend/polygons')).json()
      response.features.forEach((feature, index) => {
        localStorage.setItemByName(feature.properties.id, feature)
        const featureCollection = localStorage.getItemByName(feature.properties.typeOf)
        featureCollection.push(feature.properties.id)
        localStorage.setItemByName(feature.properties.typeOf, featureCollection)
      })
      window.dispatchEvent(new Event('data-ready'))
    },

    selectedPolygonCallback (event) {
      if (!event.polygonId) return
      this.selectedPolygonId = event.polygonId
      this.coordinates = localStorage.getFeatureCoordinates(this.selectedPolygonId)
    },

    markerPositionChangedHandler (event) {
      this.coordinates[event.details.markerIndex] = event.details.markerCoordinates
      this.selectedMarkerIndex = event.details.markerIndex
      this.selectedMarkerCoordinates = event.details.markerCoordinates
    },

    emptySpaceClick (event) {
      this.selectedPolygonId = undefined
    },

    deletePolygon () {
      for (const type of ['ServiceAvailable', 'BuildCommenced', 'ComingSoon']) {
        const collection = localStorage.getItemByName(type)
        const index = collection.indexOf(this.selectedPolygonId)
        if (index < 0) continue
        collection.splice(index, 1)
        localStorage.setItemByName(type, collection)
        localStorage.removeItem(this.selectedPolygonId)
        this.map.removePolygon(type, this.selectedPolygonId)
      }
    },

    initMap () {
      const container = document.getElementById('dgtek-container-for-map')
      if (container) {
        this.container = container
      } else {
        this.container = document.body.appendChild(document.createElement('div'))
        this.container.id = 'dgtek-container-for-map'
      }

      this.container.addEventListener('polygon-selected', this.selectedPolygonCallback)
      this.container.addEventListener('marker-position-changed', this.markerPositionChangedHandler.bind(this))
      this.container.addEventListener('empty-field-click', this.emptySpaceClick)
      this.container.addEventListener('new-polygon', this.addNewPolygon)
      this.container.addEventListener('drawing-mode-on', this.switchDrawingMode.bind(this))
      this.container.addEventListener('drawing-mode-off', this.switchDrawingMode.bind(this))

      this.map = new Map({
        container: this.container,
        width: window.innerWidth / 2,
        height: 700,
        colors: {
          ServiceAvailable: '#090',
          BuildCommenced: '#09b',
          ComingSoon: '#fa0'
        },
        center: { lat: -37.8357725, lng: 144.9738764 }
      })

      this.container.addEventListener('polygon-type-changed', this.map.changePolygonType.bind(this.map))
      this.container.addEventListener('marker-coordinates-changed', this.map.changeMarkerCoordinates.bind(this.map))
      this.container.addEventListener('show-marker', this.map.showMarker.bind(this.map))
    },
    switchDrawingMode (event) {
      this.drawingMode = event.type === 'drawing-mode-on'
    }
  },

  beforeMount () {
    this.getData()
  },

  mounted () {
    window.addEventListener('data-ready', this.initMap)
    this.buttonText = 'Create new polygon'
  }
}
</script>
