<template>
  <v-app>
    <v-main id="dgtek-markers">
      <Markers
            :saveData.sync="saveData"
            :saveAddressDescription.sync="saveAddressDescription"
      />
    </v-main>
  </v-app>
</template>

<script>

import Markers from '@/components/Markers.vue'

export default {
  name: 'App',

  components: {
    Markers
  },

  data: () => ({
    saveData: false,
    saveAddressDescription: false
  }),

  watch: {
    saveData (val) {
      console.log('App: saveData ', val)
      if (val) this.saveMarkers()
    },
    saveAddressDescription (val) {
      console.log('App: saveDescription ', val)
      if (val) this.saveDescription()
    }
  },

  methods: {
    async saveMarkers () {
      const markers = localStorage.getAllMarkers()
      console.log(markers)
      /* POST (PUT) REQUEST HERE */
      this.saveData = false
    },
    async saveDescription () {
      const { id, description } = JSON.parse((sessionStorage.getItem('description')))
      console.log(id, description)
      /* POST (PUT) REQUEST HERE */
      this.saveAddressDescription = false
    }
  }
}
</script>
