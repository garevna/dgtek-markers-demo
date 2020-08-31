<template>
  <v-dialog v-model="dialog">
    <v-file-input dark
          :label="label"
          prepend-icon="mdi-camera"
          @change="upload"
          v-model="img"
          :hint="setHint()"
          :error="error"
    >
    </v-file-input>
    <v-img :src="src" width="300" height="300" contain></v-img>
  </v-dialog>
</template>

<script>

import { VFileInput } from 'vuetify/lib'

export default {
  components: {
    VFileInput
  },
  props: {
    dialog: Boolean,
    apiURL: String,
    imageCounter: Number,
    markerId: String,
    file: File,
    label: String,
    source: String,
    src: String,
    url: String
  },
  data: () => ({
    img: null,
  }),
  computed: {
    error() {
      return Boolean(this.setHint())
    },
  },
  methods: {
    async upload() {
      if (!this.img || this.error) return
      this.$emit('update:file', this.img)
      this.$emit('update:source', 'client')
      this.$emit('update:src', URL.createObjectURL(this.img))
      this.$emit('update:url', `${this.apiURL}/files/${this.markerId}/img/image-${this.imageCounter}.${this.img.type.slice(6)}`)
    },
    setHint() {
      if (this.source !== 'client') return ''
      if (!this.file || !(this.file instanceof File)) return ''
      if (!this.file.type.match(/image/)) return 'Invalid file type'
      return ''
    },
  },
}
</script>
