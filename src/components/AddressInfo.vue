<template>
  <v-card>
    <v-select
            :options="types"
            v-model="type"
            v-if="!search"
    ></v-select>

    <v-card-text v-if="search" class="text-center">
      <h2>Search</h2>
    </v-card-text>
    <v-card-text class="text-center">
      <v-simple-table
            dense
            fixed-header
      >
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-center"></th>
              <th class="text-center">Lng</th>
              <th class="text-center">Lat</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Coordinates:</td>
              <td>
                <v-text-field v-model="coordinates[0]"></v-text-field>
              </td>
              <td>
                <v-text-field v-model="coordinates[1]"></v-text-field>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card-text>
    <v-card-text class="mx-auto px-auto">
      <span v-if="search">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
        </svg>
      </span>
      <v-text-field
            rounded
            outlined
            v-model="address"
            placeholder="Address"
            id="autocompleteAddress"
            style="display: inline-block; width: 90%"
      ></v-text-field>
    </v-card-text>

    <v-simple-table dense dark v-if="!search">
      <template v-slot:default>
        <tbody>
          <tr>
            <td class="text-left"><b>Route</b></td>
            <td class="text-right">{{ properties.street }}</td>
          </tr>
          <tr>
            <td class="text-left"><b>Locality</b></td>
            <td class="text-right">{{ properties.locality }}</td>
          </tr>
          <tr>
            <td class="text-left"><b>Administrative area (level 2)</b></td>
            <td class="text-right">{{ properties.admin2 }}</td>
          </tr>
          <tr>
            <td class="text-left"><b>Administrative area (level 1)</b></td>
            <td class="text-right">{{ properties.admin1 }}</td>
          </tr>
          <tr>
            <td class="text-left"><b>Postal code</b></td>
            <td class="text-right">{{ properties.postCode }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>

    <v-card-text>
      <Button
            :clicked.sync="newMarker"
            color="#09b"
            text="Add new marker (address)"
            v-if="newMarkerButton"
      />
    </v-card-text>
    <v-card-text>
      <Button
            :clicked.sync="removeMarker"
            v-if="!search"
            text="Remove marker"
      />
    </v-card-text>
  </v-card>
</template>

<style>

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

import { VCard, VCardText, VSimpleTable, VTextField } from 'vuetify/lib'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

import Button from '@/components/Button.vue'

export default {
  name: 'CurrentMarker',
  components: {
    Button,
    VCard,
    VCardText,
    vSelect,
    VSimpleTable,
    VTextField
  },
  props: ['markerId'],
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
        type: null
      }
    }
  },

  computed: {
    search () {
      return !this.markerId
    },
    newMarkerButton () {
      return !this.markerId && this.address && this.coordinates[0] && this.coordinates[1]
    },
    coordinates: {
      get () {
        return this.markerData.coordinates
      },
      set (val) {
        this.markerData.coordinates = val.map(item => parseFloat(item))
      }
    },
    address: {
      get () {
        return this.markerData.address
      },
      set (val) {
        this.markerData.address = val
      }
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
    properties () {
      if (!this.markerData.properties) {
        return {
          street: '',
          locality: '',
          postCode: '',
          admin1: '',
          admin2: ''
        }
      }
      return {
        street: this.markerData.properties.street ? this.markerData.properties.street : '',
        locality: this.markerData.properties.locality ? this.markerData.properties.locality : '',
        postCode: this.markerData.properties.postCode ? this.markerData.properties.postCode : '',
        admin1: this.markerData.properties.admin1 ? this.markerData.properties.admin1 : '',
        admin2: this.markerData.properties.admin2 ? this.markerData.properties.admin2 : ''
      }
    }
  },

  watch: {
    markerId: {
      immediate: true,
      handler (newVal, oldVal) {
        this.ready = false
        if (!newVal || !this.markerId) {
          this.markerData = {
            address: '',
            coordinates: ['', ''],
            type: null
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
        address: this.address,
        coordinates: this.coordinates,
        type: 'Footprint'
      }
      localStorage.setItemByName(markerId, marker)
      this.$parent.selectedMarkerId = markerId
      this.$parent.selectedMarkerAddress = marker.address
      this.$parent.selectedMarkerCoordinates = marker.coordinates
      this.$parent.selectedMarkerType = 'LIT'
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
  },

  methods: {
    initAddressInputField () {
      const inputElement = document.getElementById('autocompleteAddress')
      const autocomplete = new this.$parent.map.Autocomplete(inputElement, { componentRestrictions: { country: 'au' } })
      autocomplete.addListener('place_changed', function (event) {
        const place = autocomplete.getPlace()
        if (!place.geometry) {
          inputElement.value = 'Wrong address'
          return
        }
        inputElement.value = place.formatted_address
        this.address = place.formatted_address
        const location = place.geometry.location
        this.coordinates = [location.lng(), location.lat()]

        if (this.search) {
          const marker = localStorage.findMarker(place.formatted_address, [location.lng(), location.lat()])
          if (marker) {
            this.$parent.map.selectMarkerById(marker.id)
            this.$emit('update:markerId', marker.id)
          } else this.$parent.map.setSearchMarker([location.lng(), location.lat()], place.formatted_address)
        } else {
          if (!this.markerId) return
          this.markerData = {
            address: place.formatted_address,
            coordinates: [location.lng(), location.lat()],
            type: this.markerData.type
          }
          localStorage.setItemByName(this.markerId, this.markerData)
          this.$parent.map.changeMarkerAddress(this.markerId, place.formatted_address, location)
        }
      }.bind(this))
    }
  },
  mounted () {
    setTimeout(this.initAddressInputField.bind(this), 1000)
  }
}
</script>
