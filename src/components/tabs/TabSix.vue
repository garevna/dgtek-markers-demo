<template>
  <v-container>
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Name</th>
            <th class="text-left">exist and usable</th>
            <th class="text-left">planned</th>
            <th class="text-left">installed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <h4>Lead-In</h4>
            </td>
            <td></td>
            <td>
              <v-checkbox
                    v-model="infrastructure.leadIn.planned"
              ></v-checkbox>
            </td>
            <td>
              <v-checkbox
                    v-model="infrastructure.leadIn.installed"
              ></v-checkbox>
            </td>
          </tr>

          <tr>
            <td>
              <h4>Backbone</h4>
            </td>
            <td></td>
            <td>
              <v-checkbox
                    v-model="infrastructure.backbone.planned"
              ></v-checkbox>
            </td>
            <td>
              <v-checkbox
                    v-model="infrastructure.backbone.installed"
              ></v-checkbox>
            </td>
          </tr>

          <tr>
            <td>
              <h4>Customer Access cabling</h4>
            </td>
            <td></td>
            <td>
              <v-checkbox
                    v-model="infrastructure.customerAccessCabling.planned"
              ></v-checkbox>
            </td>
            <td>
              <v-checkbox
                    v-model="infrastructure.customerAccessCabling.installed"
              ></v-checkbox>
            </td>
          </tr>

          <tr>
            <td>
              <h4>GPO in MDF</h4>
            </td>
            <td>
              <v-checkbox
                    v-model="infrastructure.GPOinMDF.exist"
              ></v-checkbox>
            </td>
            <td>
              <v-checkbox
                    v-model="infrastructure.GPOinMDF.planned"
              ></v-checkbox>
            </td>
            <td>
              <v-checkbox
                    v-model="infrastructure.GPOinMDF.installed"
              ></v-checkbox>
            </td>
          </tr>

          <tr>
            <td>
              <h4>UPS in MDF</h4>
            </td>
            <td></td>
            <td>
              <v-checkbox
                    v-model="infrastructure.UPSinMDF.planned"
              ></v-checkbox>
            </td>
            <td>
              <v-checkbox
                    v-model="infrastructure.UPSinMDF.installed"
              ></v-checkbox>
            </td>
          </tr>

          <tr>
            <td>
              <h4>GPO in risers</h4>
            </td>
            <td>
              <v-checkbox
                    v-model="infrastructure.GPOinRisers.exist"
              ></v-checkbox>
            </td>
            <td>
              <v-checkbox
                    v-model="infrastructure.GPOinRisers.planned"
              ></v-checkbox>
            </td>
            <td>
              <v-checkbox
                    v-model="infrastructure.GPOinRisers.installed"
              ></v-checkbox>
            </td>
          </tr>

          <tr>
            <td>
              <h4>UPS in risers</h4>
            </td>
            <td></td>
            <td>
              <v-checkbox
                    v-model="infrastructure.UPSinRisers.planned"
              ></v-checkbox>
            </td>
            <td>
              <v-checkbox
                    v-model="infrastructure.UPSinRisers.installed"
              ></v-checkbox>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-container>
</template>

<script>

export default {
  name: 'TabSix',
  props: ['infrastructure']
}
</script>
