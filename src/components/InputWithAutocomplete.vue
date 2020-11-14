<template>
  <v-card flat>
    <v-card-text v-if="search" class="text-center">
      <h3>Search</h3>
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
              <td><p>Coordinates:</p></td>
              <td>
                <!-- <v-text-field v-model="coordinates[0]"></v-text-field> -->
                <p>{{ coordinates[0] }}</p>
              </td>
              <td>
                <!-- <v-text-field v-model="coordinates[1]"></v-text-field> -->
                <p>{{ coordinates[1] }}</p>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card-text>
    <v-card-text>
      <span v-if="search">
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
        </svg>
      </span>
      <input
              id="autocompleteAddress"
              class="input-field"
              :style="{ borderColor: borderColor }"
              v-model="localAddress"
              placeholder="Address"
      />
      <v-card-text>
        <p style="color: #09b" v-if="address">{{ address }}</p>
        <p style="color: #f50" v-if="message">{{ message }}</p>
      </v-card-text>
    </v-card-text>
  </v-card>
</template>

<style>

.input-field {
  display: inline-block;
  outline: none;
  width: 85%;
  padding: 16px 32px;
  border: solid 1px #bbb;
  border-radius: 48px;
}
.input-field:focus {
  outline: none;
  border: solid 1px #09b;
}
</style>

<script>

export default {
  name: 'InputWithAutocomplete',
  props: ['address', 'coordinates', 'properties', 'search'],
  data () {
    return {
      borderColor: '#bbb',
      message: '',
      map: null
    }
  },
  computed: {
    localAddress: {
      get () {
        return this.address
      },
      set (val) {
        this.$emit('update:address', val)
      }
    }
  },
  methods: {
    initAutocomplete () {
      let counter = 0
      return new Promise(function recurse (resolve, reject) {
        if (counter++ === 30) reject(new Error('Error accessing Google maps API'))
        if (!window.google || !document.getElementById('autocompleteAddress')) setTimeout(() => recurse(resolve, reject), 100)
        else {
          resolve({
            inputElement: document.getElementById('autocompleteAddress'),
            Autocomplete: window.google.maps.places.Autocomplete
          })
        }
      })
    },

    getAddressComponents (place) {
      if (!place.geometry) {
        this.borderColor = '#900'
        this.message = 'Invalid address'
        return {
          street: '',
          locality: '',
          admin1: '',
          admin2: '',
          postCode: ''
        }
      }
      this.message = ''
      this.$emit('update:address', place.formatted_address)
      this.$emit('update:coordinates', [place.geometry.location.lng(), place.geometry.location.lat()])
      const number = place.address_components.find(item => item.types[0] === 'street_number')
      const street = place.address_components.find(item => item.types[0] === 'route')
      const city = place.address_components.find(item => item.types[0] === 'locality')
      const state = place.address_components.find(item => item.types[0] === 'administrative_area_level_1')
      const admin = place.address_components.find(item => item.types[0] === 'administrative_area_level_2')
      const postCode = place.address_components.find(item => item.types[0] === 'postal_code')
      const markerProperties = {
        number: number ? number.short_name : '',
        street: street ? street.short_name : '',
        city: city ? city.short_name : '',
        state: state ? state.short_name : '',
        admin: admin ? admin.short_name : '',
        postCode: postCode ? postCode.short_name : ''
      }
      this.$emit('update:properties', markerProperties)
      return markerProperties
    },

    async initAddressInputField () {
      try {
        var { inputElement, Autocomplete } = await this.initAutocomplete()
      } catch (err) {
        console.warn(err)
        return
      }
      this.autocomplete = new Autocomplete(inputElement, { componentRestrictions: { country: 'au' } })
      this.autocomplete.addListener('place_changed', function (event) {
        const place = this.autocomplete.getPlace()
        this.getAddressComponents(place)
        const location = place.geometry.location
        this.$emit('update:coordinates', [location.lng(), location.lat()])

        if (this.search) {
          const marker = localStorage.findMarker(place.formatted_address, [location.lng(), location.lat()])
          if (marker) {
            this.map.selectMarkerById(marker.id)
            this.$emit('update:markerId', marker.id)
          } else this.map.setSearchMarker([location.lng(), location.lat()], place.formatted_address)
        } else {
          if (!this.markerId) return
          this.$emit('update:address', this.localAddress)
          this.$emit('update:coordinates', [location.lng(), location.lat()])
          const properties = this.getAddressComponents(place)
          this.$emit('update:properties', properties)
          this.$parent.map.changeMarkerAddress(this.markerId, place.formatted_address, location)
        }
      }.bind(this))
    }
  },
  mounted () {
    setTimeout(this.initAddressInputField.bind(this), 1000)
    this.map = this.$parent.$parent.$parent.map
  }
}
</script>
