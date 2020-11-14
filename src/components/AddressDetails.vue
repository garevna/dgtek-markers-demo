<template>
  <v-simple-table dense dark>
    <template v-slot:default>
      <tbody>
        <tr>
          <td class="text-left"><b>Street</b></td>
          <td class="text-right">{{ number }} {{ street }}</td>
        </tr>
        <tr>
          <td class="text-left"><b>City</b></td>
          <td class="text-right">{{ city }}</td>
        </tr>
        <tr>
          <td class="text-left"><b>State</b></td>
          <td class="text-right">{{ state }}</td>
        </tr>
        <tr>
          <td class="text-left"><b>Administrative area</b></td>
          <td class="text-right">{{ admin }}</td>
        </tr>
        <tr>
          <td class="text-left"><b>Postal code</b></td>
          <td class="text-right">{{ postCode }}</td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<style scoped>
</style>

<script>

export default {
  name: 'AddressDetails',
  props: ['number', 'street', 'city', 'state', 'postCode', 'admin']
}

</script>
