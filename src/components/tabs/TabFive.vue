<template>
  <v-container>
    <v-text-field
        placeholder="Name"
        outlined
        hide-details
        v-model="theName"
    ></v-text-field>
    <v-row>
      <v-col cols="6">
        <v-text-field
            placeholder="Email"
            outlined
            hide-details
            v-model="theEmail"
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
            placeholder="Phone"
            outlined
            hide-details
            v-model="thePhone"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row class="my-2">
      <v-text-field
          placeholder="Address"
          outlined
          hide-details
          v-model="theAddress"
      ></v-text-field>
    </v-row>
    <v-row class="my-2">
      <v-text-field
          placeholder="Contact person"
          outlined
          hide-details
          v-model="thePerson"
      ></v-text-field>
    </v-row>
  </v-container>
</template>

<script>

export default {
  name: 'TabTwo',
  props: [
    'name',
    'email',
    'phone',
    'address',
    'person'
  ],
  computed: {
    theName: {
      get () {
        return this.name
      },
      set (val) {
        this.$emit('update:name', val)
      }
    },
    theEmail: {
      get () {
        return this.email
      },
      set (val) {
        this.$emit('update:email', val)
      }
    },
    thePhone: {
      get () {
        return this.phone
      },
      set (val) {
        this.$emit('update:phone', val)
      }
    },
    theAddress: {
      get () {
        return this.address
      },
      set (val) {
        this.$emit('update:address', val)
      }
    },
    thePerson: {
      get () {
        return this.person
      },
      set (val) {
        this.$emit('update:person', val)
      }
    }
  }
}
</script>
