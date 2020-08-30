<template>
  <v-row class="text-center mx-auto">
    <v-col cols="5">
      <div>
        <span class="caption text-uppercase">{{ label }}:</span>
        <span class="font-weight-bold">
          {{ level }}
        </span>
      </div>
      <v-slider
        v-model="level"
        color="blue darken-4"
        min="1"
        max="10"
      ></v-slider>
    </v-col>
    <v-col cols="7">
      <v-rating
            v-model="level"
            length="10"
            full-icon='mdi-hammer-screwdriver'
            empty-icon="mdi-hammer-screwdriver"
            color="red lighten-3"
            background-color="grey lighten-1"
            :label="label"
      ></v-rating>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'Difficulty',
  props: ['difficulty', 'label'],
  data () {
    return {
      level: this.difficulty || 1
    }
  },
  watch: {
    level (val) {
      this.$emit('update:difficulty', val)
    }
  },
  mounted () {
    this.level = this.difficulty
  }
}
</script>
