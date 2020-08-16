<template>
  <v-card v-if="marker">
      <v-card-text>
        <h3>Actual</h3>
      </v-card-text>
      <v-card-text :style="{ color: validated ? '#090' : '#333'}">
        {{ marker.address }}
      </v-card-text>
    <v-row justify="center">
      <v-simple-table dense>
        <template v-slot:default>
          <tbody>
            <tr>
              <td class="text-left"><b>lat:</b></td>
              <td class="text-right">{{ marker.coordinates[1] }}</td>
              <td class="text-left"><b>lng:</b></td>
              <td class="text-right">{{ marker.coordinates[0] }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-row>
    <v-row>
      <v-card-text>
        <h3>Formatted</h3>
      </v-card-text>
    </v-row>
    <v-row>
      <v-card-text :style="{ color: error ? '#a00' : '#09b' }">
        {{ formattedAddress }}
      </v-card-text>
    </v-row>
    <v-row justify="center">
      <v-simple-table dense>
        <template v-slot:default>
          <tbody>
            <tr>
              <td class="text-left"><b>lat:</b></td>
              <td class="text-right">{{ formattedCoordinates[1] }}</td>
              <td class="text-left"><b>lng:</b></td>
              <td class="text-right">{{ formattedCoordinates[0] }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-row>
    <v-row justify="center">
      <!-- <v-card> -->
        <v-card-text>
          <h3>Details for search:</h3>
        </v-card-text>
        <v-simple-table dense dark>
          <template v-slot:default>
            <tbody>
              <tr>
                <td class="text-left">Route</td>
                <td class="text-right">{{ properties.street }}</td>
              </tr>
              <tr>
                <td class="text-left">Locality</td>
                <td class="text-right">{{ properties.locality }}</td>
              </tr>
              <tr>
                <td class="text-left">Administrative area (level 2)</td>
                <td class="text-right">{{ properties.admin2 }}</td>
              </tr>
              <tr>
                <td class="text-left">Administrative area (level 1)</td>
                <td class="text-right">{{ properties.admin1 }}</td>
              </tr>
              <tr>
                <td class="text-left">Postal code</td>
                <td class="text-right">{{ properties.postCode }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      <!-- </v-card> -->
    </v-row>
    <v-row>
      <v-card-text>
        <Button
              text="Replace"
              color="#fa0"
              :clicked.sync="replace"
              v-if="!updateAll && !finished && marker.address !== formattedAddress"
        />
        <Button
              text="Next"
              color="#09b"
              :clicked.sync="nextStep"
              v-if="!updateAll && !finished"
        />
        <Button
              text="Replace all"
              color="#f50"
              :clicked.sync="updateAll"
              v-if="!finished && !updateAll"
        />
        <Button
              text="Cancel"
              color="#777"
              :clicked.sync="close"
        />
      </v-card-text>
    </v-row>
  </v-card>
</template>

<script>

import { VCard, VRow, VCardText } from 'vuetify/lib'

import Button from '@/components/Button.vue'

export default {
  name: 'Diagnostics',
  components: {
    VCard,
    VRow,
    VCardText,
    Button
  },
  props: ['types', 'finished', 'opened'],
  data () {
    return {
      markerId: '',
      marker: null,
      properties: {
        street: '',
        locality: '',
        admin1: '',
        admin2: '',
        postCode: ''
      },
      replace: false,
      ready: false,
      nextStep: false,
      updateAll: false,
      close: false,
      formattedAddress: '',
      formattedCoordinates: ['', ''],
      syncIterator: null,
      asyncIterator: null,
      error: null
    }
  },
  computed: {
    validated () {
      return !!this.marker.properties
    }
  },
  watch: {
    replace (val) {
      if (!val) return
      console.log('OLD:\n', localStorage.getItemByName(this.markerId))
      this.updateMarkerData()
      console.log('NEW:\n', localStorage.getItemByName(this.markerId))
      this.replace = false
    },
    nextStep (val) {
      if (!val && !this.updateAll) return
      this.step()
      this.nextStep = false
    },
    updateAll (val) {
      if (val) this.replaceAll()
    },
    close (val) {
      if (val) {
        this.$emit('update:opened', false)
      }
    }
  },
  methods: {
    async replaceAll () {
      do {
        if (this.close) break
        var { value, done } = await this.asyncIterator.next()
        if (value) {
          this.markerId = value.markerId
          this.marker = value.marker
          if (this.marker.properties) {
            console.log(this.marker.properties)
            this.formattedAddress = this.marker.address
            this.formattedCoordinates = this.marker.coordinates
            this.properties = this.marker.properties
            continue
          }
          try {
            console.log('OLD:\n', this.marker.address)
            const { formattedAddress, formattedCoordinates, properties } = await this.validateAddress()
            this.formattedAddress = formattedAddress
            this.formattedCoordinates = formattedCoordinates
            this.properties = properties
            this.updateMarkerData()
            console.log('NEW:\n', this.marker.address)
          } catch (err) {
            console.warn(err)
            this.error = true
            this.formattedAddress = err
            this.formattedCoordinates = ''
            this.properties = {
              street: '',
              locality: '',
              admin1: '',
              admin2: '',
              postCode: ''
            }
            break
          }
        }
      } while (!done)
      this.$emit('update:finished', true)
    },
    step () {
      const { value, done } = this.syncIterator.next()
      if (done) this.$emit('update:finished', true)
      this.marker = value
      this.validateAddress()
        .then((result) => {
          this.formattedAddress = result.formattedAddress
          this.formattedCoordinates = result.formattedCoordinates
          this.properties = result.properties
        })
    },
    updateMarkerData () {
      this.marker = {
        address: this.formattedAddress,
        coordinates: this.formattedCoordinates,
        type: this.marker.type,
        properties: this.properties
      }
      localStorage.setItemByName(this.markerId, this.marker)
    },
    validateAddress () {
      const geocode = this.$parent.map.__geoCoder.geocode
      const address = this.marker.address
      return new Promise(function (resolve, reject) {
        geocode({ address }, function (results, status) {
          this.ready = status === 'OK'
          if (status === 'OK') {
            const latLng = results[0].geometry.location
            const route = results[0].address_components.find(item => item.types[0] === 'route')
            const locality = results[0].address_components.find(item => item.types[0] === 'locality')
            const admin1 = results[0].address_components.find(item => item.types[0] === 'administrative_area_level_1')
            const admin2 = results[0].address_components.find(item => item.types[0] === 'administrative_area_level_2')
            const postalCode = results[0].address_components.find(item => item.types[0] === 'postal_code')
            resolve({
              formattedAddress: results[0].formatted_address,
              formattedCoordinates: [latLng.lng(), latLng.lat()],
              properties: {
                street: route ? route.short_name : '',
                locality: locality ? locality.short_name : '',
                admin1: admin1 ? admin1.short_name : '',
                admin2: admin2 ? admin2.short_name : '',
                postCode: postalCode ? postalCode.short_name : ''
              }
            })
          } else reject(status)
        })
      })
    }
  },
  mounted () {
    this.test = this.$parent.map.__geocode
    this.syncIterator = (function * () {
      for (const type of this.types) {
        const collection = localStorage.getItemByName(type)
        for (const markerId of collection) {
          this.markerId = markerId
          yield localStorage.getItemByName(markerId)
        }
      }
    }.bind(this))()

    this.asyncIterator = (async function * () {
      for (const type of this.types) {
        const collection = localStorage.getItemByName(type)
        for (const markerId of collection) {
          // this.markerId = markerId
          yield new Promise(function (resolve) {
            setTimeout(() => resolve({ markerId, marker: localStorage.getItemByName(markerId) }), 1000)
          })
        }
      }
    }.bind(this))()

    this.nextStep = true
  }
}
</script>
