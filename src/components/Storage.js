Storage.prototype.getItemByName = function (name) {
  return JSON.parse(this.getItem(name))
}
Storage.prototype.setItemByName = function (name, payload) {
  this.setItem(name, JSON.stringify(payload))
}

/* KEYS FOR SEARCH */

Storage.prototype.getAllKeys = function () {
  const streets = new Set()
  const cities = new Set()
  const postalCodes = new Set()
  const states = new Set()
  const admins = new Set()
  for (const type of ['LIT', 'Footprint']) {
    const collection = this.getItemByName(type)
    for (const markerId of collection) {
      const marker = this.getItemByName(markerId)
      if (marker.properties) {
        streets.add(marker.properties.street)
        cities.add(marker.properties.city)
        postalCodes.add(marker.properties.postCode)
        states.add(marker.properties.state)
        admins.add(marker.properties.admin)
      }
    }
  }
  return { streets, cities, postalCodes, states, admins }
}

/* SEARCH */

Storage.prototype.findMarkersByAddress = function (address) {
  let result = []
  for (const type of ['LIT', 'Footprint']) {
    const collection = this.getItemByName(type)
    result = result.concat(collection.filter(markerId => this.getItemByName(markerId).address === address))
  }
  return result
}

Storage.prototype.findMarkersByProperty = function (propName, propValue) {
  let result = []
  for (const type of ['LIT', 'Footprint']) {
    const collection = this.getItemByName(type)
    result = result.concat(collection.filter(markerId => {
      const marker = this.getItemByName(markerId)
      return marker.properties && marker.properties[propName] === propValue
    }))
  }
  return result
}

Storage.prototype.findMarkersByStreet = function (street) {
  return this.findMarkersByProperty('street', street)
}
Storage.prototype.findMarkersByCity = function (city) {
  return this.findMarkersByProperty('city', city)
}
Storage.prototype.findMarkersByState = function (state) {
  return this.findMarkersByProperty('state', state)
}
Storage.prototype.findMarkersByAdminArea = function (area) {
  return this.findMarkersByProperty('admin', area)
}
Storage.prototype.findMarkersByPostalCode = function (postCode) {
  return this.findMarkersByProperty('postCode', postCode)
}

Storage.prototype.findMarker = function (address, coordinates) {
  for (const type of ['LIT', 'Footprint']) {
    const collection = this.getItemByName(type)
    for (const markerId of collection) {
      const marker = this.getItemByName(markerId)
      if (marker.address === address) return Object.assign(marker, { id: markerId })
      if (marker.address.indexOf(address) >= 0) {
        console.warn('Partial consilience found')
      }
      if (JSON.stringify(marker.coordinates) === JSON.stringify(coordinates)) {
        this.setItemByName(markerId, {
          address,
          coordinates,
          type: marker.type
        })
        return Object.assign(marker, { id: markerId })
      }
    }
  }
  return null
}

Storage.prototype.getMarkerCoordinates = function (markerId) {
  return this.getItemByName(markerId).coordinates
}
Storage.prototype.setMarkerCoordinates = function (markerId, coordinates) {
  const marker = this.getItemByName(markerId)
  marker.coordinates = coordinates
  this.setItemByName(markerId, marker)
}

Storage.prototype.getMarkerType = function (markerId) {
  return this.getItemByName(markerId).type
}

Storage.prototype.addMarker = function (markerId, marker) {
  this.setItemByName(markerId, marker)
  const collection = this.getItemByName(marker.type)
  collection.push(markerId)
  this.setItemByName(marker.type, collection)
  this.emit({
    eventType: 'new-marker-added',
    markerId,
    type: marker.type,
    coordinates: marker.coordinates
  })
}

Storage.prototype.addMarkerToCollection = function (markerId, markerType) {
  const collection = this.getItemByName(markerType)
  collection.push(markerId)
  this.setItemByName(markerType, collection)
}
Storage.prototype.removeMarkerFromCollection = function (markerId, markerType) {
  const collection = this.getItemByName(markerType)
  collection.splice(collection.findIndex(item => item === markerId), 1)
  this.setItemByName(markerType, collection)
}

Storage.prototype.removeMarker = function (markerId) {
  this.removeMarkerFromCollection(markerId, this.getItemByName(markerId).type)
  this.removeItem(markerId)
}

Storage.prototype.updateMarkerType = function (markerId, type) {
  const marker = this.getItemByName(markerId)
  this.removeMarkerFromCollection(markerId, marker.type)
  this.addMarkerToCollection(markerId, type)
  marker.type = type
  this.setItemByName(markerId, marker)
  this.emit({
    eventType: 'marker-type-changed',
    markerId,
    type
  })
}

Storage.prototype.getAllMarkers = function () {
  const markers = {
    type: 'FeatureCollection',
    features: []
  }
  for (const type of ['LIT', 'Footprint']) {
    const collection = this.getItemByName(type)
    collection.forEach((markerId) => {
      const marker = this.getItemByName(markerId)
      markers.features.push({
        type: 'Feature',
        properties: Object.assign({ id: markerId, address: marker.address, type: marker.type }, marker.properties),
        geometry: {
          type: 'Point',
          coordinates: marker.coordinates
        }
      })
    })
  }
  return markers
}

Storage.prototype.emit = function (data) {
  const { eventType, ...details } = data
  this.eventHandler.dispatchEvent(Object.assign(new Event(eventType), { details }))
}
