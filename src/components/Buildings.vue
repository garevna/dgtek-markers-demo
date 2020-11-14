<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12" lg="7">
        <div id="dgtek-container-for-map"></div>
      </v-col>
      <v-col cols="12" lg="5" v-if="ready">
        <Diagnostics
              :types="types"
              :finished.sync="diagnosticsDone"
              :opened.sync="diagnostics"
              v-if="diagnostics && !diagnosticsDone"
        />
        <AddressInfo
              :markerId.sync="selectedMarkerId"
              :resellers="resellers"
              v-if="!diagnostics"
              :descriptionChanged.sync="descriptionChanged"
        />
      </v-col>
    </v-row>

    <AddressDescription
          :dialog.sync="addressDescriptionVisible"
          :markerId="selectedMarkerId"
          :descriptionChanged.sync="descriptionChanged"
    />
    <BuildingLevels
        :opened.sync="showAddressLevels"
        :address="description.address"
        :addressLevels.sync="description.levels"
    />

    <v-bottom-navigation
        app
        horizontal
        dark
      >
        <Button
              :clicked.sync="diagnostics"
              text="DIAGNOSTICS"
              v-if="!diagnosticsDone"
        />
        <Button
              :clicked.sync="search"
              text="SEARCH"
              v-if="selectedMarkerId"
        />
        <Button
              :clicked.sync="addressDescriptionVisible"
              text="Address description"
              v-if="selectedMarkerId"
        />
        <Button
              :clicked.sync="showAddressLevels"
              text="Address levels"
              v-if="selectedMarkerId"
        />
        <Button
              :clicked.sync="save"
              text="SAVE"
        />
    </v-bottom-navigation>
  </v-container>
</template>

<style scoped>

</style>

<script>

import '@/components/Storage.js'
import Map from '@/components/map.js'
import Diagnostics from '@/components/Diagnostics.vue'
import AddressInfo from '@/components/AddressInfo.vue'
import AddressDescription from '@/components/AddressDescription.vue'
import BuildingLevels from '@/components/BuildingLevels.vue'
import Button from '@/components/Button.vue'

export default {
  name: 'Markers',

  components: {
    Diagnostics,
    AddressInfo,
    AddressDescription,
    BuildingLevels,
    Button
  },

  props: ['saveData'],

  data: () => ({
    types: ['LIT', 'Footprint'],
    resellers: [],
    container: null,
    map: null,
    ready: false,
    diagnostics: false,
    diagnosticsDone: false,
    selectedMarkerId: null,
    selectedMarkerAddress: '',
    seachMarker: null,
    search: false,
    newMarker: false,
    description: null,
    addressDescriptionVisible: false,
    showAddressLevels: false,
    descriptionChanged: false
  }),

  computed: {
    save: {
      get () {
        return this.saveData
      },
      set (val) {
        this.$emit('update:saveData', val)
      }
    },
    mapIsReady () {
      return this.ready && this.map && this.Autocomplete
    }
  },

  watch: {
    search (val) {
      if (!val) return
      this.selectedMarkerId = null
      this.map.resetSelectedMarker()
      this.search = false
    },
    newMarker (val) {
      if (!val) return
      this.map.addNewMarker()
      this.newMarker = false
    },
    diagnosticsDone (val) {
      if (val) this.diagnostics = false
    },
    selectedMarkerId (val) {
      if (!val) return
      const data = localStorage.getItemByName(val)
      this.getAddressDescription(val, data.address, data.properties)
        .then(response => {
          this.description = response
        })
    },
    descriptionChanged (val) {
      if (!val) return
      const { description } = sessionStorage.getItemByName('description')
      this.description = description
      // this.descriptionChanged = false
      this.addressDescriptionChanged = false
    }
  },

  methods: {

    async getBuildingsList () {
      localStorage.clear()
      this.types.forEach(type => localStorage.setItemByName(type, []))
      const response = await (await fetch(process.env.VUE_APP_BUILDINGS_API_ENDPOINT, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `API_KEY=${process.env.VUE_APP_BUILDINGS_API_KEY}`
        }
      })).json()
      response.description.forEach((building, index) => {
        localStorage.setItemByName(building._id, building)
        localStorage.addMarkerToCollection(building.id, building.type)
      })
      window.dispatchEvent(new Event('data-ready'))
    },

    readyCallback (event) {
      this.ready = true
    },

    saveSelectedMarkerData () {
      localStorage.setItemByName(this.selectedMarkerId, {
        address: this.selectedMarkerAddress,
        coordinates: this.selectedMarkerCoordinates,
        type: this.selectedMarkerType,
        properties: this.selectedMarkerProperties
      })
      this.descriptionChanged = true
    },

    selectedMarkerCallback (event) {
      if (!event.details.id) return
      this.selectedMarkerId = event.details.id
      const markerData = localStorage.getItemByName(this.selectedMarkerId)
      this.selectedMarkerCoordinates = markerData.coordinates
      this.selectedMarkerAddress = markerData.address
      this.selectedMarkerType = markerData.type
      this.selectedMarkerProperties = markerData.properties
    },

    resetSelectedMarkerCallback (event) {
      this.selectedMarkerId = undefined
    },

    markerPositionChangedHandler (event) {
      this.coordinates[event.details.markerIndex] = event.details.markerCoordinates
      this.selectedMarkerIndex = event.details.markerIndex
      this.selectedMarkerCoordinates = event.details.markerCoordinates
    },

    emptySpaceClick (event) {
      this.selectedMarkerId = undefined
    },

    initMap () {
      const container = document.getElementById('dgtek-container-for-map')
      if (container) {
        this.container = container
      } else {
        this.container = document.body.appendChild(document.createElement('div'))
        this.container.id = 'dgtek-container-for-map'
      }

      this.container.addEventListener('map-is-ready', this.readyCallback.bind(this))
      this.container.addEventListener('marker-selected', this.selectedMarkerCallback.bind(this))
      this.container.addEventListener('reset-selected-marker', this.resetSelectedMarkerCallback.bind(this))
      // this.container.addEventListener('marker-position-changed', this.markerPositionChangedHandler.bind(this))
      this.container.addEventListener('empty-field-click', this.emptySpaceClick)
      this.container.addEventListener('new-marker', this.addNewMarker)

      this.map = new Map({
        container: this.container,
        width: window.innerWidth / 1.5,
        height: 700,
        center: { lat: -37.8357725, lng: 144.9738764 }
      })

      this.container.addEventListener('marker-type-changed', this.map.changeMarkerType.bind(this.map))
      this.container.addEventListener('marker-address-changed', this.map.changeMarkerAddress.bind(this.map))
      this.container.addEventListener('marker-coordinates-changed', this.map.changeMarkerCoordinates.bind(this.map))

      this.ready = true
    },

    async getResellers () {
      const response = await (await fetch('https://dka.dgtek.net/api/frontend/resellers')).json()
      this.resellers = response.data.map(item => item.site)
    },

    async getAddressDescription (markerId, address, addressComponents = sessionStorage.getItemByName('emptyProperties')) {
      const response = await (await fetch(`https://dgtek-staging.herokuapp.com/description/${markerId}`)).json()
      if (response.statusCode) {
        console.warn('Error reading address description: ', response.statusCode)
        response.description = sessionStorage.getItemByName('emptyDescription')
      }
      const description = Object.assign(response.description, {
        id: markerId,
        address,
        addressComponents
      })
      sessionStorage.setItem('description', JSON.stringify({
        id: markerId,
        description
      }))
      return description
    }
  },

  beforeMount () {
    this.getBuildingsList()
    this.description = require('@/components/inputs/dataStructure').default
    sessionStorage.setItemByName('emptyDescription', this.description)
    sessionStorage.setItemByName('emptyProperties', {
      number: '',
      street: '',
      city: '',
      state: '',
      postCode: '',
      admin: ''
    })
    sessionStorage.setItemByName('description', {
      id: '',
      description: this.description
    })
    this.getResellers()
  },

  mounted () {
    window.addEventListener('data-ready', this.initMap)
  }
}
</script>
