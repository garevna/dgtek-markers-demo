<template>
  <v-card>
    <!-- <v-card-text>
      <h3>{{ header }}</h3>
    </v-card-text> -->

    <v-select
            :options="types"
            v-model="localType"
    ></v-select>

    <v-simple-table
          dense
          fixed-header
          height="550"
    >
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-center">#</th>
            <th class="text-center">Lng</th>
            <th class="text-center">Lat</th>
          </tr>
        </thead>
        <tbody>
          <tr
                v-for="(point, index) in points"
                :key="index"
                @mouseover="$emit('update:markerIndex', index)"
          >
            <td>{{ index }}</td>
            <td>
              <v-text-field
                  v-model="points[index][0]"
                  @input="inputHandler(index, 0, $event)">
              </v-text-field>
            </td>
            <td>
              <v-text-field
                  v-model="points[index][1]"
                  @input="inputHandler(index, 1, $event)">
              </v-text-field>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
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

import { VCard, VSimpleTable, VTextField } from 'vuetify/lib'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  name: 'SelectedPolygon',
  components: {
    VCard,
    vSelect,
    VSimpleTable,
    VTextField
  },
  props: ['type', 'coordinates', 'markerIndex', 'markerCoordinates'],
  data () {
    return {
      points: null,
      types: [
        'ServiceAvailable',
        'BuildCommenced',
        'ComingSoon'
      ],
      localType: null
    }
  },
  computed: {
    typeOfPolygon: {
      get () {
        return this.type
      },
      set (val) {
        console.log(val)
        this.$emit('update:type', val)
      }
    }
  },
  watch: {
    coordinates: {
      deep: true,
      immediate: true,
      handler (val) {
        this.points = val
      }
    },
    markerCoordinates: {
      deep: true,
      handler (val) {
        if (this.markerIndex >= 0) this.points.splice(this.markerIndex, 1, val)
      }
    },
    type: {
      immediate: true,
      handler (val) {
        this.localType = val
      }
    },
    localType (val) {
      this.$emit('update:type', val)
    }
  },
  methods: {
    inputHandler (pointIndex, coord, val) {
      this.points[pointIndex][coord] = parseFloat(val)
      this.$emit('update:markerCoordinates', this.points[pointIndex])
    }
  }
}
</script>
