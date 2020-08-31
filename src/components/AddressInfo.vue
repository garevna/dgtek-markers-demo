<template>
  <v-card>
    <v-select
            :options="types"
            v-model="type"
            v-if="!search"
    ></v-select>

    <v-card-text class="mx-auto px-auto">
      <InputWithAutocomplete
            :address.sync="markerData.address"
            :coordinates.sync="markerData.coordinates"
            :properties.sync="markerData.properties"
            :resellers="resellers"
            :search="search"
      />
    </v-card-text>

    <v-card-text class="text-center">
      <h4>Address components</h4>
    </v-card-text>

    <AddressDetails
          :number="properties.number"
          :street="properties.street"
          :city="properties.city"
          :state="properties.state"
          :admin="properties.admin"
          :postCode="properties.postCode"
    />

    <v-card-text v-if="newMarkerButton">
      <Button
            :clicked.sync="newMarker"
            text="Add new address"
            color="#333"
      />
    </v-card-text>
    <v-card-text v-if="!search">
      <Button
            :clicked.sync="removeMarker"
            text="Remove marker"
            color="#333"
      />
    </v-card-text>
  </v-card>
</template>

<style>

.input-field-simple {
  outline: none;
  width: 100%;
  padding: 8px 16px;
  border: solid 1px #bbb;
  border-radius: 8px;
}
.input-field-simple:focus {
  outline: none;
  border: solid 1px #09b;
}

.text-left {
  text-align: left !important;
}
.text-right {
  text-align: right !important;
}

.vs__clear {
  display: none!important;
}

.vs--searchable .vs__dropdown-toggle {
    cursor: pointer!important;
    padding: 16px!important;
    background-color: #09b!important;
    color: #fff!important;
}

.vs--single .vs__selected {
    background-color: transparent;
    border-color: transparent;
    color: #fff;
}

#vs1__listbox {
  line-height:180%;
}

</style>

<script>

import { VCard, VCardText } from 'vuetify/lib'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

import InputWithAutocomplete from '@/components/InputWithAutocomplete.vue'
import AddressDetails from '@/components/AddressDetails.vue'
import Button from '@/components/Button.vue'

export default {
  name: 'AddressInfo',
  components: {
    Button,
    InputWithAutocomplete,
    VCard,
    VCardText,
    vSelect,
    AddressDetails
  },
  props: ['markerId', 'descriptionChanged', 'resellers'],
  data () {
    return {
      ready: false,
      removeMarker: false,
      newMarker: false,
      types: [
        'LIT',
        'Footprint'
      ],
      markerData: {
        address: '',
        coordinates: ['', ''],
        type: null,
        properties: sessionStorage.getItemByName('emptyProperties')
      },
      autocomplete: null,
      message: '',
      first: '',
      second: '',
      third: '',
      addressDescriptionVisible: false
    }
  },

  computed: {
    search () {
      return !this.markerId
    },
    newMarkerButton () {
      return !this.markerId && !!this.markerData.address && !!this.markerData.coordinates[0] && !!this.markerData.coordinates[1]
    },
    type: {
      get () {
        return this.markerId ? this.markerData.type : null
      },
      set (val) {
        if (!val) return
        this.markerData.type = val
        localStorage.updateMarkerType(this.markerId, val)
        this.$parent.map[this.markerId].type = val
        this.markerData.type = val
      }
    },
    properties: {
      get () {
        if (!this.markerData.properties) {
          return {
            number: '',
            street: '',
            city: '',
            state: '',
            postCode: '',
            admin: ''
          }
        }
        return {
          number: this.markerData.properties.number ? this.markerData.properties.number : '',
          street: this.markerData.properties.street ? this.markerData.properties.street : '',
          city: this.markerData.properties.city ? this.markerData.properties.city : '',
          postCode: this.markerData.properties.postCode ? this.markerData.properties.postCode : '',
          state: this.markerData.properties.state ? this.markerData.properties.state : '',
          admin: this.markerData.properties.admin ? this.markerData.properties.admin : ''
        }
      },
      set (val) {
        this.markerData.properties = val
      }
    }
  },

  watch: {
    markerData: {
      deep: true,
      handler (val) {
        localStorage.setItemByName(this.markerId, val)
        const { id, description } = sessionStorage.getItemByName('description')
        sessionStorage.setItemByName('description', {
          id,
          description: Object.assign(description, {
            address: val.address,
            addressComponents: JSON.parse(JSON.stringify(val.properties ? val.properties : this.properties))
          })
        })
        this.$emit('update:descriptionChanged', true)
      }
    },
    markerId: {
      immediate: true,
      handler (newVal, oldVal) {
        this.ready = false
        if (!newVal || !this.markerId) {
          this.markerData = {
            address: '',
            coordinates: ['', ''],
            type: null,
            properties: {
              number: '',
              street: '',
              city: '',
              state: '',
              admin: '',
              postCode: ''
            }
          }
          return
        }
        this.markerData = localStorage.getItemByName(newVal)
        this.ready = true
      }
    },

    newMarker (val) {
      if (!val) return
      const markerId = `pin${Date.now()}`
      const marker = {
        address: this.markerData.address,
        coordinates: this.markerData.coordinates,
        type: 'Footprint',
        properties: this.markerData.properties
      }
      localStorage.setItemByName(markerId, marker)
      Object.assign(this.$parent, {
        selectedMarkerId: markerId,
        selectedMarkerAddress: marker.address,
        selectedMarkerCoordinates: marker.coordinates,
        selectedMarkerType: 'Footprint'
      })
      this.$parent.map[markerId] = this.$parent.map.placeMarker(Object.assign(marker, { id: markerId }))
      this.$parent.map.selectedMarkerId = markerId
      setTimeout(this.$parent.map.setMarkerActive.bind(this.$parent.map))
      this.newMarker = false
    },
    removeMarker (val) {
      if (!val || !this.markerId) return
      this.$parent.map.removeMarker(this.markerId)
      localStorage.removeMarker(this.markerId)
      this.removeMarker = false
      this.$emit('update:markerId', undefined)
    }
  }
}
</script>
