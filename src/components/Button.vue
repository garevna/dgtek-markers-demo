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

export default {
  name: 'Button',
  props: ['text', 'clicked', 'color']
}
</script>
