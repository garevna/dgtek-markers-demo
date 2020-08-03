Storage.prototype.getItemByName = function (name) {
  return JSON.parse(this.getItem(name))
}
Storage.prototype.setItemByName = function (name, payload) {
  this.setItem(name, JSON.stringify(payload))
}

Storage.prototype.getFeatureById = function (featureId) {
  const feature = this.getItemByName(featureId)
  return {
    id: feature.properties.id,
    coordinates: feature.geometry.coordinates[0],
    type: feature.properties.typeOf
  }
}

Storage.prototype.getFeaturesByType = function (type) {
  return this.getItemByName(type)
    .map(id => this.getItemByName(id))
    .map(feature => ({
      id: feature.properties.id,
      coordinates: feature.geometry.coordinates[0],
      type: feature.properties.typeOf
    }))
}
Storage.prototype.getFeatureCoordinates = function (featureId) {
  return this.getFeatureById(featureId).coordinates
}
Storage.prototype.getFeatureType = function (featureId) {
  return this.getFeatureById(featureId).type
}

Storage.prototype.addFeature = function (featureId, feature) {
  this.setItemByName(featureId, feature)
  const collection = this.getItemByName(feature.properties.typeOf)
  collection.push(featureId)
  this.setItemByName(feature.properties.typeOf, collection)
  this.emit({
    eventType: 'new-feature-added',
    featureId,
    type: feature.properties.typeOf,
    coordinates: feature.geometry.coordinates[0]
  })
}

Storage.prototype.updateFeatureType = function (featureId, type) {
  const feature = this.getItemByName(featureId)
  const oldCollection = this.getItemByName(feature.properties.typeOf)
  oldCollection.splice(oldCollection.indexOf(featureId), 1)
  this.setItemByName(feature.properties.typeOf, oldCollection)
  const newCollection = this.getItemByName(type)
  newCollection.push(featureId)
  this.setItemByName(type, newCollection)
  feature.properties.typeOf = type
  this.setItemByName(featureId, feature)
  this.emit({
    eventType: 'polygon-type-changed',
    featureId,
    type
  })
}

Storage.prototype.updateMarker = function (featureId, markerIndex, markerCoordinates) {
  const feature = this.getItemByName(featureId)
  const [coordinates] = feature.geometry.coordinates
  coordinates.splice(markerIndex, 1, markerCoordinates)
  this.setItemByName(featureId, {
    geometry: {
      coordinates: [coordinates],
      type: 'Polygon'
    },
    properties: {
      id: featureId,
      typeOf: feature.properties.typeOf
    },
    type: 'Feature'
  })
}

Storage.prototype.updateMarkerPosition = function (featureId, markerIndex, markerCoordinates) {
  this.updateMarker(featureId, markerIndex, markerCoordinates)
  this.emit({
    eventType: 'marker-position-changed',
    featureId,
    markerIndex,
    markerCoordinates
  })
}
Storage.prototype.updateMarkerCoordinates = function (featureId, markerIndex, markerCoordinates) {
  this.updateMarker(featureId, markerIndex, markerCoordinates)
  this.emit({
    eventType: 'marker-coordinates-changed',
    featureId,
    markerIndex,
    markerCoordinates
  })
}

Storage.prototype.emit = function (data) {
  const { eventType, ...details } = data
  this.eventHandler.dispatchEvent(Object.assign(new Event(eventType), { details }))
}
