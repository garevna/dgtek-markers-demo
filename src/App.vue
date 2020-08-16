<template>
  <v-app>
    <v-main id="dgtek-markers">
      <Markers :saveData.sync="saveData"/>
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
    saveData: false
  }),

  watch: {
    saveData (val) {
      console.log('App: saveData ', val)
      if (val) this.save()
    }
  },

  methods: {
    async save () {
      const markers = localStorage.getAllMarkers()
      console.log(markers)
      this.saveData = false
    }
  }
}
</script>
