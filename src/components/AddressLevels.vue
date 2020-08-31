<template>
  <v-dialog v-model="opened" fullscreen>
    <v-card flat class="mx-auto pa-4" max-width="100%">
      <v-card flat class="mx-auto" max-width="50">
        <v-text-field
          max-width="150"
          class="mx-auto"
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card>

    <v-data-table
        :headers="headers"
        :items="levels"
        class="elevation-1"
        multi-sort
      >
        <template v-slot:body="{ items }">
          <tbody>
            <tr v-for="item in items" :key="item.name">
              <td>
                <v-chip color="#888" dark>{{ item.name }}</v-chip>
              </td>
              <td>
                <v-simple-checkbox color="#09b" :value="item.plannedRouter">
                </v-simple-checkbox>
              </td>
              <td>
                <v-simple-checkbox color="#09b" :value="item.plannedSplicingBox">
                </v-simple-checkbox>
              </td>
              <td>
                <v-simple-checkbox color="#09b" :value="item.plannedSplitter">
                </v-simple-checkbox>
              </td>
              <td>
                <v-simple-checkbox color="#09b" :value="item.plannedOFTU">
                </v-simple-checkbox>
              </td>
              <td>
                <v-simple-checkbox color="#090" :value="item.installedRouter">
                </v-simple-checkbox>
              </td>
              <td>
                <v-simple-checkbox color="#090" :value="item.installedSplicingBox">
                </v-simple-checkbox>
              </td>
              <td>
                <v-simple-checkbox color="#090" :value="item.installedSplitter">
                </v-simple-checkbox>
              </td>
              <td>
                <v-simple-checkbox color="#090" :value="item.installedOFTU">
                </v-simple-checkbox>
              </td>
              <td style="width: 120px">
                  <v-icon
                    small
                    color="#090"
                    class="mr-2"
                    @click="editItem(item)"
                  >
                    mdi-pencil
                  </v-icon>
                  <v-icon
                    small
                    color="#900"
                    @click="deleteItem(item)"
                  >
                    mdi-delete
                  </v-icon>
              </td>
            </tr>
          </tbody>
        </template>

        <template v-slot:top>
          <v-toolbar flat color="white">
            <v-toolbar-title>{{ address }}</v-toolbar-title>
            <v-divider
              class="mx-4"
              inset
              vertical
            ></v-divider>
            <v-spacer></v-spacer>
            <v-dialog v-model="dialog" max-width="500px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="#333"
                  text
                  class="mb-2"
                  v-bind="attrs"
                  v-on="on"
                >Add level</v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12">
                        <v-text-field v-model="editedItem.name" label="Level"></v-text-field>
                      </v-col>
                      <v-col cols="6">
                        <v-checkbox
                                    v-model="editedItem.plannedRouter"
                                    label="Level Router is planned"
                                    color="#09b"
                        ></v-checkbox>
                      </v-col>
                      <v-col cols="6">
                        <v-checkbox
                                    v-model="editedItem.installedRouter"
                                    label="Router installed"
                                    color="#090"
                        ></v-checkbox>
                      </v-col>
                      <v-col cols="6">
                         <v-checkbox
                                    v-model="editedItem.plannedSplicingBox"
                                    label="Splicing Box is planned"
                                    color="#09b"
                        ></v-checkbox>
                      </v-col>
                      <v-col cols="6">
                        <v-checkbox
                                    v-model="editedItem.installedSplicingBox"
                                    label="Splicing Box installed"
                                    color="#090"
                        ></v-checkbox>
                      </v-col>
                      <v-col cols="6">
                        <v-checkbox
                                    v-model="editedItem.plannedSplitter"
                                    label="Splitter is planned"
                                    color="#09b"
                        ></v-checkbox>
                      </v-col>
                      <v-col cols="6">
                        <v-checkbox
                                    v-model="editedItem.installedSplitter"
                                    label="Splitter installed"
                                    color="#090"
                        ></v-checkbox>
                      </v-col>
                      <v-col cols="6">
                        <v-checkbox
                                    v-model="editedItem.plannedOFTU"
                                    label="OFTU is planned"
                                    color="#09b"
                        ></v-checkbox>
                      </v-col>
                      <v-col cols="6">
                        <v-checkbox
                                    v-model="editedItem.installedOFTU"
                                    label="OFTU installed"
                                    color="#090"
                        ></v-checkbox>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="#333" text @click="close">Cancel</v-btn>
                  <v-btn color="#333" text @click="save">Save</v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:no-data>
          <v-btn color="primary" @click="initialize">Reset</v-btn>
        </template>
    </v-data-table>
    </v-card>

    <v-bottom-navigation absolute>
      <!-- <Button
            :clicked.sync="save"
            text="SAVE CHANGES"
            color="#333"
      /> -->
      <Button
            :clicked.sync="hide"
            text="CLOSE"
            color="#333"
      />
    </v-bottom-navigation>
  </v-dialog>
</template>

<script>

import { VContainer, VDialog, VBottomNavigation, VBtn, VCard, VCardTitle, VCardText, VCardActions, VDataTable, VToolbar, VCheckbox, VRow, VCol, VDivider, VSpacer } from 'vuetify/lib'
import { ripple } from 'vuetify/lib/directives'

import Button from '@/components/Button.vue'

export default {
  name: 'AddressLevels',
  components: {
    VContainer,
    VDialog,
    VBottomNavigation,
    VBtn,
    VCard,
    VCardTitle,
    VCardText,
    VCardActions,
    VDataTable,
    VToolbar,
    VCheckbox,
    VRow,
    VCol,
    VDivider,
    VSpacer,
    Button
  },
  directives: {
    ripple
  },
  props: ['opened', 'address', 'addressLevels'],
  data () {
    return {
      search: '',
      dialog: false,
      hide: false,
      levels: [],
      headers: [
        {
          text: 'Levels',
          align: 'start',
          // sortable: true,
          // filterable: true,
          value: 'name'
        },
        { text: 'Planned Routers', value: 'plannedRouter' },
        { text: 'Planned Splicing Boxes', value: 'plannedSplicingBox' },
        { text: 'Planned Splitters', value: 'plannedSplitter' },
        { text: 'Planned OFTU', value: 'plannedOFTU' },
        { text: 'Installed Routers', value: 'installedRouter' },
        { text: 'Installed Splicing Boxes', value: 'installedSplicingBox' },
        { text: 'Installed Splitters', value: 'installedSplitter' },
        { text: 'Installed OFTU', value: 'installedOFTU' },
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      editedIndex: -1,
      editedItem: {
        name: '',
        plannedRouter: false,
        plannedSplicingBox: false,
        plannedSplitter: false,
        plannedOFTU: false,
        installedRouter: false,
        installedSplicingBox: false,
        installedSplitter: false,
        installedOFTU: false
      },
      defaultItem: {
        name: '',
        plannedRouter: false,
        plannedSplicingBox: false,
        plannedSplitter: false,
        plannedOFTU: false,
        installedRouter: false,
        installedSplicingBox: false,
        installedSplitter: false,
        installedOFTU: false
      }
    }
  },
  computed: {
    formTitle () {
      return this.editedIndex === -1 ? 'Add new level' : 'Edit level info'
    }
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
    hide (val) {
      if (val) this.$emit('update:opened', false)
      this.hide = false
    },
    save (val) {
      if (!val) return
      this.save()
      this.save = false
    }
  },
  methods: {
    editItem (item) {
      this.editedIndex = this.levels.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },

    deleteItem (item) {
      const index = this.levels.indexOf(item)
      confirm('Are you sure you want to delete this item?') && this.levels.splice(index, 1)
    },

    close () {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    save () {
      if (this.editedIndex > -1) {
        Object.assign(this.levels[this.editedIndex], this.editedItem)
      } else {
        this.levels.push(this.editedItem)
      }
      sessionStorage.setItemByName('description', Object.assign(sessionStorage.getItemByName('description'), {
        levels: JSON.parse(JSON.stringify(this.levels))
      }))
      this.close()
    },

    init () {
      this.levels = !this.addressLevels ? [] : this.addressLevels.map((item, index) => ({
        name: item.name,
        index,
        plannedRouter: item.planned.router,
        plannedSplicingBox: item.planned.splicingBox,
        plannedSplitter: item.planned.splitter,
        plannedOFTU: item.planned.oftu,
        installedRouter: item.installed.router,
        installedSplicingBox: item.installed.splicingBox,
        installedSplitter: item.installed.splitter,
        installedOFTU: item.installed.oftu
      }))
    }
  },
  mounted () {
    this.init()
  },
  save () {
    this.$emit('update:addressLevels', this.levels)
  }
}

</script>
