<template>
  <v-btn
        large
        outlined
        retain-focus-on-click
        text
        :color="color || '#fff'"
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
  props: ['text', 'clicked', 'color']
}
</script>
