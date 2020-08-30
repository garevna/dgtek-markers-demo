<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <v-checkbox v-model="fprint" label="Footprint"></v-checkbox>
      </v-col>
      <v-col cols="6">
        <NumberInput
              placeholder="Distance from the footprint"
              :value.sync="distance"
        />
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="4">
        <NumberInput
              placeholder="Number of Levels "
              :value.sync="levels"
        />
      </v-col>
      <v-col cols="4">
        <NumberInput
              placeholder="Number of dwellings"
              :value.sync="dwellings"
        />
      </v-col>
      <v-col cols="4">
        <NumberInput
              placeholder="Avg Height of each floor"
              :value.sync="floorHeight"
        />
      </v-col>
    </v-row>
    <v-select
        :items="buildingTypes"
        outlined
        hide-details
        class="combo-box-input"
        v-model="building"
        label="Building Type"
    ></v-select>

    <v-row>
      <v-col cols="6">
        <v-checkbox
              v-model="approvalRequired"
              label="Customer Install requires approval"
        ></v-checkbox>
      </v-col>
      <v-col cols="6">
        <v-checkbox
              v-model="inductionRequired"
              label="Induction required"
        ></v-checkbox>
      </v-col>
    </v-row>

    <Difficulty
          :difficulty.sync="leadInInstallation"
          label="Lead-In Installation Difficulty"
    />
    <Difficulty
          :difficulty.sync="backboneInstallation"
          label="Backbone Installation Difficulty"
    />
    <Difficulty
          :difficulty.sync="customerInstallation"
          label="Customer Installation Difficulty"
    />
  </v-container>
</template>

<script>

import NumberInput from '@/components/inputs/Number.vue'
import Difficulty from '@/components/inputs/Difficulty.vue'

export default {
  name: 'TabOne',
  components: {
    NumberInput,
    Difficulty
  },
  props: [
    'footprint',
    'distanceFromFootprint',
    'numberOfLevels',
    'numberOfDwellings',
    'avgFloorHeight',
    'buildingType',
    'approval',
    'induction',
    'leadInInstallationDifficulty',
    'backboneInstallationDifficulty',
    'customerInstallationDifficulty'
  ],
  data () {
    return {
      buildingTypes: ['Shopping center', 'High-rise building', 'Business park', 'Other']
    }
  },
  computed: {
    fprint: {
      get () {
        return this.footprint
      },
      set (val) {
        this.$emit('update:footprint', val)
      }
    },
    distance: {
      get () {
        return this.distanceFromFootprint
      },
      set (val) {
        this.$emit('update:distanceFromFootprint', val)
      }
    },
    levels: {
      get () {
        return this.numberOfLevels
      },
      set (val) {
        this.$emit('update:numberOfLevels', val)
      }
    },
    dwellings: {
      get () {
        return this.numberOfDwellings
      },
      set (val) {
        this.$emit('update:numberOfDwellings', val)
      }
    },
    floorHeight: {
      get () {
        return this.avgFloorHeight
      },
      set (val) {
        this.$emit('update:avgFloorHeight', val)
      }
    },
    building: {
      get () {
        return this.buildingType
      },
      set (val) {
        this.$emit('update:buildingType', val)
      }
    },
    approvalRequired: {
      get () {
        return this.approval
      },
      set (val) {
        this.$emit('update:approval', val)
      }
    },
    inductionRequired: {
      get () {
        return this.induction
      },
      set (val) {
        this.$emit('update:induction', val)
      }
    },
    leadInInstallation: {
      get () {
        return this.leadInInstallationDifficulty
      },
      set (val) {
        this.$emit('update:leadInInstallationDifficulty', val)
      }
    },
    backboneInstallation: {
      get () {
        return this.backboneInstallationDifficulty
      },
      set (val) {
        this.$emit('update:backboneInstallationDifficulty', val)
      }
    },
    customerInstallation: {
      get () {
        return this.customerInstallationDifficulty
      },
      set (val) {
        this.$emit('update:customerInstallationDifficulty', val)
      }
    }
  }
}
</script>
