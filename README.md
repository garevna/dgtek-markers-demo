# dgtek-markers

### Install
```
yarn add dgtek-markers
```

### Import

```
import 'dgtek-markers'
import 'dgtek-markers/dist/dgtek-markers.css'
```

### Usage

```
<Markers :saveData.sync="saveData" />
```

### App.vue

```
data: () => ({
  saveData: false
}),
watch: {
  saveData (val) {
    if (val) this.saveMarkers()
  }
},
methods: {
  async saveMarkers () {
    const data = localStorage.getAllMarkers()

    await axios.post(..., { data: JSON.stringify(data) })
    this.saveData = false
  }
}
```

______________________________________________

## [Demo](https://garevna.github.io/dgtek-polygons-editor-demo/)
