# dgtek-polygons

### Install
```
yarn add dgtek-polygons
```

### Import

```
import 'dgtek-polygons'
import 'dgtek-polygons/dist/dgtek-polygons.css'
```

### Usage

```
<Polygons :saveData.sync="saveData" />
```

### App.vue

```
data: () => ({
  saveData: false
}),
watch: {
  saveData (val) {
    if (val) this.saveData()
  }
},
methods: {
  async saveData () {
    const polygons = {
      features: [],
      type: 'FeatureCollection'
    }
    polygons.features = ['ServiceAvailable', 'BuildCommenced', 'ComingSoon']
      .flatMap(collectionType => localStorage.getFeaturesByType(collectionType))

    await axios.post(..., { data: JSON.stringify(polygons) })
    this.saveData = false
  }
}
```
