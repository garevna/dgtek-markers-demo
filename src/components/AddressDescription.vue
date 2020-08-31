<template>
  <v-dialog
        v-model="dialog"
        persistent
        light
        max-width="1000px"
        class="pa-10"
  >
    <v-card-text class="text-center">
      <h3>{{ description.address }}</h3>
    </v-card-text>

    <v-tabs
        v-model="tab"
        background-color="transparent"
        color="basil"
        grow
      >
        <v-tab>GENERAL</v-tab>
        <v-tab>OWNERS</v-tab>
        <v-tab>MANAGEMENT</v-tab>
        <v-tab>DOCS</v-tab>
        <v-tab>IMAGES</v-tab>
        <v-tab>INFRASTRUCTURE</v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item>
          <v-card flat>
            <TabOne
                :footprint.sync="description.footprint"
                :distanceFromFootprint.sync="description.distanceFromFootprint"
                :numberOfLevels.sync="description.numberOfLevels"
                :numberOfDwellings.sync="description.numberOfDwellings"
                :avgFloorHeight.sync="description.avgFloorHeight"
                :buildingType.sync="description.buildingType"
                :approval.sync="description.approval"
                :induction.sync="description.induction"
                :leadInInstallationDifficulty.sync="description.difficultyLevel.leadInInstallation"
                :backboneInstallationDifficulty.sync="description.difficultyLevel.backboneInstallation"
                :customerInstallationDifficulty.sync="description.difficultyLevel.customerInstallation"
            />
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card flat>
            <TabsTwoAndThree
                :name.sync="description.owner.name"
                :email.sync="description.owner.email"
                :phone.sync="description.owner.phone"
                :address.sync="description.owner.address"
                :person.sync="description.owner.contactPerson"
            />
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card flat>
            <TabsTwoAndThree
                :name.sync="description.management.name"
                :email.sync="description.management.email"
                :phone.sync="description.management.phone"
                :address.sync="description.management.address"
                :person.sync="description.management.contactPerson"
            />
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card flat>
            <TabFour
                :name.sync="description.management.name"
                :email.sync="description.management.email"
                :phone.sync="description.management.phone"
                :address.sync="description.management.address"
                :person.sync="description.management.contactPerson"
            />
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card flat>
            <TabFive
                :name.sync="description.management.name"
                :email.sync="description.management.email"
                :phone.sync="description.management.phone"
                :address.sync="description.management.address"
                :person.sync="description.management.contactPerson"
            />
          </v-card>
        </v-tab-item>

        <v-tab-item>
          <v-card flat>
            <TabSix
                :infrastructure.sync="description.infrastructure"
            />
          </v-card>
        </v-tab-item>
      </v-tabs-items>

    <v-bottom-navigation absolute>
      <Button
            :clicked.sync="close"
            text="CLOSE"
            color="#333"
      />
    </v-bottom-navigation>
  </v-dialog>
</template>

<style>

.v-dialog {
  padding: 48px!important;
  background: #fff!important;
}
</style>

<script>

import { VDialog, VCardText } from 'vuetify/lib'

import TabOne from '@/components/tabs/TabOne.vue'
import TabsTwoAndThree from '@/components/tabs/TabsTwoAndThree.vue'
import TabFour from '@/components/tabs/TabFour.vue'
import TabFive from '@/components/tabs/TabFive.vue'
import TabSix from '@/components/tabs/TabSix.vue'
import Button from '@/components/Button.vue'

export default {
  name: 'AddressDescription',
  components: {
    VDialog,
    VCardText,
    TabOne,
    TabsTwoAndThree,
    TabFour,
    TabFive,
    TabSix,
    Button
  },

  props: ['dialog', 'markerId', 'save', 'descriptionChanged'],

  data () {
    return {
      tab: null,
      ready: false,
      description: null,
      close: false,
      owners: false,
      management: false,
      levelsInfo: false
    }
  },
  watch: {
    descriptionChanged (val) {
      if (val) this.getAddressDescription()
      this.$emit('update:descriptionChanged', false)
    },
    description: {
      deep: true,
      handler (val) {
        this.ready = !!val
      }
    },
    close (val) {
      this.$emit('update:dialog', false)
      this.close = false
    }
  },
  methods: {
    async saveAddressDescription () {
      sessionStorage.setItem('description', JSON.stringify({
        id: this.markerId,
        description: this.description
      }))
      this.$emit('update:save', true)
    },
    getAddressDescription () {
      const data = require('@/components/inputs/dataStructure').default
      const description = sessionStorage.getItemByName('description').description
      Object.keys(data).forEach(prop => {
        if (!description[prop]) description[prop] = data[prop]
      })
      this.description = description
    }
  },
  beforeMount () {
    this.getAddressDescription()
    this.ready = true
  }
}
</script>
