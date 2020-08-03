import mapConfig from '@/config/map.js'

class Map {
  constructor (options) {
    /* PUBLIC PROPERTIES DESCRIPTION */
    this.map = null
    this.drawLayer = null
    this.selectedPolygon = null
    this.selectedMarkerIndex = null
    this.drawingMode = false

    const { container, ...rest } = options

    if (container && container.nodeType === 1) this.container = container
    else this.container = document.body.appendChild(document.createElement('div'))

    this.storage.constructor.prototype.eventHandler = this.container

    this.createMap()

    for (const option in rest) {
      this.options[option] = rest[option]
    }
    this.center = this.options.center
    this.markerIcon = {
      strokeColor: '#FF00FF',
      strokeOpacity: 1,
      fillColor: '#FF00FF',
      fillOpacity: 1,
      scale: 4
    }
    this.markerIconActive = {
      path: 'M -1 -1 L 1 -1 L 1 1 L -1 1 z',
      strokeColor: '#FFFF00',
      strokeOpacity: 1,
      fillColor: '#FFAA00',
      fillOpacity: 1,
      scale: 4
    }

    this.map = this.container.appendChild(document.createElement('div'))
    this.setMapSize()
  }

  showMarker (event) {
    this.hideAllMarkers()
    if (!this.selectedPolygon || !event.markerIndex) return
    this.selectedMarkerIndex = event.markerIndex
    this.selectedPolygonMarkers[event.markerIndex].setIcon(this.markerIconActive)
  }

  hideAllMarkers (event) {
    if (!this.selectedPolygon) return
    this.selectedPolygonMarkers.forEach(marker => marker.setIcon(this.markerIcon))
  }

  changeMarkerPosition (markerCoordinates) {
    if (!this.selectedPolygon || typeof this.selectedMarkerIndex !== 'number' || !markerCoordinates) return

    const latLng = new this.__geo.LatLng(markerCoordinates[1], markerCoordinates[0])

    this.selectedPolygonMarkers[this.selectedMarkerIndex].setPosition(latLng)
    this.selectedPolygon.getPath().setAt(this.selectedMarkerIndex, latLng)
  }

  resetSelectedPolygon () {
    this.selectedPolygon.setOptions({
      fillColor: this.options.colors[this.selectedPolygon.type],
      strokeColor: this.options.colors[this.selectedPolygon.type]
    })

    this.selectedPolygonMarkers.forEach((marker, index) => {
      this.__geo.event.clearListeners(marker, 'drag')
      marker.setMap(null)
    })

    this.selectedPolygonMarkers = null
  }

  findPolygon (type, latLng) {
    return this[type].find(polygon => this.__geoLocation(latLng, polygon))
  }

  setSelectedPolygon (latLng) {
    this.selectedPolygon = this.findPolygon('ServiceAvailable', latLng) ||
      this.findPolygon('BuildCommenced', latLng) ||
      this.findPolygon('ComingSoon', latLng) || null
    if (this.selectedPolygon) {
      this.selectedPolygon.setOptions({
        fillColor: '#f0f',
        strokeColor: '#f0f'
      })
      this.createMarkers()
      this.container.dispatchEvent(Object.assign(new Event('polygon-selected'), {
        polygonId: this.selectedPolygon.id
      }))
    }
    return !!this.selectedPolygon
  }

  clickEventHandler (event) {
    this.map.setCenter(event.latLng)
    if (this.selectedPolygon) this.resetSelectedPolygon()
    if (this.setSelectedPolygon(event.latLng)) return
    this.container.dispatchEvent(Object.assign(new Event('empty-field-click'), {
      pointOnMap: [event.latLng.lat(), event.latLng.lng()],
      clickedAt: [event.clientX, event.clientY]
    }))
  }

  async createMap () {
    if (!await this.loadScript()) return console.error('Error accessing Google Maps API')
    Map.prototype.__geo = window.google.maps
    Map.prototype.Polygon = window.google.maps.Polygon
    Map.prototype.__places = window.google.maps.places
    Map.prototype.__geoCoder = new window.google.maps.Geocoder()
    Map.prototype.Autocomplete = window.google.maps.places.Autocomplete
    Map.prototype.__geoLocation = window.google.maps.geometry.poly.containsLocation

    this.map = new this.__geo.Map(this.map, {
      center: this.center,
      zoom: 13,
      styles: mapConfig,
      disableDefaultUI: true
    })

    this.markerIcon.path = this.__geo.SymbolPath.CIRCLE

    this.__geo.event.addListener(this.map, 'click', this.clickEventHandler.bind(this))

    this.buildPolygons()
  }

  createMarkers () {
    this.selectedPolygonMarkers = []
    const coordinates = this.storage.getFeatureById(this.selectedPolygon.id).coordinates
    coordinates.forEach((point, index) => {
      const coord = new this.__geo.LatLng(point[1], point[0])
      const marker = new this.__geo.Marker({
        map: this.map,
        position: coord,
        icon: this.markerIcon,
        draggable: true,
        raiseOnDrag: false,
        title: `${index}`
      })
      marker.addListener('dragend', this.changePolygonMarkerPosition(index))
      this.selectedPolygonMarkers.push(marker)
    })
  }

  changePolygonType (event) {
    ['ServiceAvailable', 'BuildCommenced', 'ComingSoon'].forEach((item) => {
      this[item].forEach(polygon => {
        polygon.setMap(null)
        polygon = null
      })
      this[item] = []
    })
    this.buildPolygons()
  }

  changePolygonMarkerPosition (markerIndex) {
    return function (event) {
      this.selectedPolygon.getPath().setAt(markerIndex, event.latLng)
      localStorage.updateMarkerPosition(this.selectedPolygon.id, markerIndex, [event.latLng.lng(), event.latLng.lat()])
    }.bind(this)
  }

  changeMarkerCoordinates (event) {
    const latLng = new this.__geo.LatLng(event.details.markerCoordinates[1], event.details.markerCoordinates[0])
    this.selectedPolygon.getPath().setAt(event.details.markerIndex, latLng)
    this.selectedPolygonMarkers[event.details.markerIndex].setPosition(latLng)
  }

  setMapSize () {
    const box = this.container.getBoundingClientRect
    this.height = box && box.height ? box.height : typeof this.options.height === 'number' ? this.options.height : 400
    // this.width = box && box.width ? box.width : typeof this.options.width === 'number' ? this.options.width : window.innerWidth
    this.mapHeight = this.height + 'px'
    // this.mapWidth = this.width ? this.width + 'px' : '100%'
    this.mapWidth = '100%'
    this.map.style = `
      height: ${this.mapHeight};
      width: ${this.mapWidth};
    `
  }

  setColors (ServiceAvailable = '#A00E0D', BuildCommenced = '#000000', ComingSoon = '#FFFF00') {
    this.colors = { ServiceAvailable, BuildCommenced, ComingSoon }
  }

  buildPolygon (feature, type) {
    const color = this.options.colors[type]
    const polygon = Object.assign(new this.__geo.Polygon({
      paths: feature.coordinates.map(point => ({ lat: point[1], lng: point[0] })),
      fillColor: color,
      strokeColor: color,
      strokeWeight: 0.5,
      clickable: false
    }), { type, id: feature.id })
    polygon.setMap(this.map)
    return polygon
  }

  buildPolygons () {
    for (const type of ['ServiceAvailable', 'BuildCommenced', 'ComingSoon']) {
      const features = localStorage.getFeaturesByType(type)
      const polygons = features.map(feature => this.buildPolygon(feature, type))
      this[type] = polygons
    }
  }

  createDrawLayer () {
    this.drawLayer = new this.__geo.Data({ map: this.map })
    this.drawLayer.setControls(['Polygon'])
    this.drawLayer.setStyle({
      editable: true,
      draggable: true,
      fillColor: '#f0f',
      strokeColor: '#f0f'
    })

    const self = this

    this.drawLayer.addListener('addfeature', function (event) {
      const featureId = Date.now().toString()
      event.feature.setProperty('id', featureId)
      event.feature.setProperty('typeOf', 'ComingSoon')
      this.toGeoJson(function (json) {
        json.features.forEach((feature) => {
          localStorage.addFeature(featureId, feature)
          self.ComingSoon.push(self.buildPolygon(localStorage.getFeatureById(featureId), 'ComingSoon'))
        })
        self.drawLayer.setMap(null)
        delete self.drawLayer
        self.drawingMode = false
        self.container.dispatchEvent(new Event('drawing-mode-off'))
      })
    })
  }

  switchToDrawingMode () {
    this.drawingMode = true
    this.container.dispatchEvent(new Event('drawing-mode-on'))
    if (!this.drawLayer) this.createDrawLayer()
    if (this.drawLayer.getMap()) return
    this.drawLayer.setMap(this.map)
  }

  removePolygon (type, id) {
    this.resetSelectedPolygon()
    const index = this[type].findIndex(polygon => polygon.id === id)
    this[type][index].setMap(null)
    this[type].splice(index, 1)
    this.selectedPolygon = null
  }

  loadScript () {
    return new Promise((resolve) => {
      const script = document.body.appendChild(document.createElement('script'))
      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBVql75Qc_Y5oGvrxdcNRNMhBlZEzTdk1o&libraries=geometry,drawing,places'
      script.onload = resolve.bind(null, true)
      script.onerror = resolve.bind(null, false)
    })
  }
}

Map.prototype.storage = localStorage

Map.prototype.markers = {
  blue: 'data:image/png;base64,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',
  green: 'data:image/png;base64,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',
  red: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAgCAYAAADnnNMGAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABJVJREFUeNqsV2tsFFUU/u6d2Ue3L1otoLSgIRDQSttQETAhMU2IRBIkakyIiWgwMfrLZ0yMJBqJPyrx3UZpQrSVqCE+WvBBI2I1qGmLlMag2FhatmXtdlv63N15Hc/so+x2t7vbyEnuzsyde893zjffOTOrYJFWKz3up9Wy62sVj9MPMzRKRtY9ItuC55RluFcpvtuAtdfG4FHOw2XfI2CcD386IDo6afbdZ/Qhr7lYkNfUG1fWyYL6IKz7BYSMOqbYxujW+DX/DvPcy/0U+nCvfimcE8hb6ortW5T8hhBodcZUKemKE6G2PtJ2P6oPZgZpcJSvq5aeFgO0MSvhlDKj8eRRL/SH92gDkQcm56845CjHbSLvgygAJXkj04RaVID8yrVw31zBu3k7paA4JcSOPMhd8YkUEAXyPkWINUkchIPw3LoWG9pbsGXkDGq6juH2899j60g3bjrwLISqRgKImwWUlEI9+JFzpSvqM8HuFAWok4UH84WsphiVZngGJXdtw5rGAyjaXMOBX41cupwo3roRzoobMPr5txCCtwgRj97BK/2fmFe6kjJ5SC0pu04q6y1QTDq2diws3bMLBVXrU+iPALLT0u3bsHzfgzCN2cTbLgViZwpdS6BUKSTc8WBNLYTi2k0orKmMe41GG1dN7Ny5vAxLH9jJ4eiJgTCJoioFhLkrYE9KRPsUrQG1dAmEx50cfZpzhQWhwA2RLITCCFrijA5McHymmFOFAv1fP6yp6aTI05kRGOciCUKKvMTpKymZBMg4y9INilgFSacLkz1nMdXZm7FUwl4fRo60sjNXIl0G+/o9BeQl4/L4EGm90lZhhC67eUj4P21joJ45iuIjcq0bCHzVDt+Rz6A4PInVHWYpt6ZIOMxu71GKxsqEo44XFNnsSNWJ4D8DGDvxEz+fEhRW3xKhzR7hIR/6X6zHwCtvM4BrTr6RNEB95yj4WLs1ldpWDjkqsE64v2YR75jfPogsuFetQN7qVTAmZxDquwh9nGmXypwjikY+5ofxyG6tv3XB3tXoKN9cIzwtmsjSHNP3LrtLdp6n4KYndC9S6IpbLwW9G6SncplQq8w0rSeT8WLfIGmP79MvXVywd9k2SDrGyWjjNL2LAeD1xM+1u5+0U/OA01s3ZtsCZP6q2B2GsPCIk85DFSLgJe3L/cZl5ATSbIzjnBV83QnRk2MWmCWr+2/SmtJQmJHfbj5coBxA+D0/eIHCb75q+LAokOeNYRy3JpoLIfuyiowwxBXcvkCwmW2GrDZ+z59IVCzNU7CTxPAvNNP4pJ72YyU7SL05gmPWxOkioQzbxEeesbhaYbYD7qhdGlFzBtqz2wysjzWyTgpKTccDGThtTp98galdyJRcQH6zZuERcvoOmV/LdVBGCa2Cjx1/UeipH6xp639lEvs46GDnZxLpyof0fmNNtuw3fEYWleZm7xj+8PuG/3ixUEbidDHOHyLWzq8JSOxVcJTHF3YieRDTrKjvDpuBqWsKctgc098zRn8sFZG39s99FG4a4D6XzdTF/nXggjvFxdnQZAWG3zD8U7ns+U+AAQCtEO+mXchSHAAAAABJRU5ErkJggg=='
}

Map.prototype.options = {
  container: document.body,
  height: '700px',
  width: '100%',
  center: { lat: -37.87013628, lng: 144.963058 },
  colors: {
    ServiceAvailable: '#A00E0D',
    BuildCommenced: '#000000',
    ComingSoon: '#FFBB00'
  }
}

export default Map
