<template>
  <v-btn
        large
        dark
        :color="color || '#d32f2f'"
        @click.stop="$emit('update:clicked', true)"
        style="margin-right: 8px"
  >
    {{ text }}
  </v-btn>
</template>

<script>

import { VBtn } from 'vuetify/lib'

export default {
  name: 'Button',
  components: {
    VBtn
  },
  props: ['text', 'clicked', 'color'],
  watch: {
    clicked (val) {
      console.log(this.text, val)
    }
  }
}
</script>
