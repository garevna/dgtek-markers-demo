import mapConfig from '@/config/map.js'

class Map {
  constructor (options) {
    /* PUBLIC PROPERTIES DESCRIPTION */
    this.map = null
    this.selectedMarkerId = null

    const { container, ...rest } = options

    if (container && container.nodeType === 1) this.container = container
    else {
      this.container = document.body.appendChild(document.createElement('div'))
      this.container.id = 'dgtek-container-for-map'
    }

    this.mapContainer = this.container.appendChild(document.createElement('div'))

    this.storage.constructor.prototype.eventHandler = this.container

    this.createMap()

    for (const option in rest) {
      this.options[option] = rest[option]
    }
    this.center = this.options.center

    this.setMapSize()
    // this.container.addEventListener('activate-marker', function (event) {
    //   if (event.details.marker) {
    //     event.details.marker.setOptions({
    //       icon: this.activeMarkerIcon
    //     })
    //   }
    // }.bind(this))
  }

  // changeMarkerPosition (markerCoordinates) {
  //   if (!this.selectedMarkerId) return
  //
  //   this[this.selectedMarkerId].setOptions({
  //     icon: this.options.icons[this[this.selectedMarkerId].type]
  //   })
  //
  //   const latLng = new window.google.maps.LatLng(markerCoordinates[1], markerCoordinates[0])
  //
  //   this[this.selectedMarkerId].setPosition(latLng)
  // }

  setSearchMarker (coordinates, address) {
    // const latLng = new window.google.maps.LatLng(coordinates[1], coordinates[0])
    if (this.searchMarker) {
      this.searchMarker.setOptions({
        map: this.map,
        position: { lat: coordinates[1], lng: coordinates[0] }
      })
    } else {
      this.searchMarker = new window.google.maps.Marker({
        map: this.map,
        position: { lat: coordinates[1], lng: coordinates[0] },
        icon: require('@/assets/magnify.svg'),
        draggable: false,
        raiseOnDrag: false,
        title: address || 'Search'
      })
    }
    this.map.setCenter({ lat: coordinates[1], lng: coordinates[0] })
  }

  resetSearchMarker () {
    if (!this.searchMarker) return
    this.searchMarker.setOptions({
      map: null
    })
  }

  changeMarkerCoordinates (event) {
    const latLng = new window.google.maps.LatLng(event.details.markerCoordinates[1], event.details.markerCoordinates[0])
    this[this.selectedMarkerId].setPosition(latLng)
  }

  changeMarkerType (event) {
    this[this.selectedMarkerId].setOptions({
      icon: this.options.markers[event.details.type]
    })
  }

  setMarkerActive (event) {
    this[this.selectedMarkerId].setOptions({
      icon: this.activeMarkerIcon,
      zIndex: 9999999
    })
    this.map.panTo(this[this.selectedMarkerId].position)
  }

  resetSelectedMarker () {
    this[this.selectedMarkerId].setOptions({
      icon: this.options.markers[this[this.selectedMarkerId].type]
    })
    // this.selectedMarker = this[this.selectedMarkerId]
    this.container.dispatchEvent(new Event('reset-selected-marker'))
  }

  mapClickEventHandler (event) {
    this.map.setCenter(event.latLng)
    if (this.selectedMarkerId) this.resetSelectedMarker()
    this.container.dispatchEvent(Object.assign(new Event('empty-field-click'), {
      details: {
        coordinates: [event.latLng.lat(), event.latLng.lng()]
      }
    }))
  }

  // testAddress (address) {
  //   const geocode = new window.google.maps.Geocoder().geocode
  //   return new Promise((resolve, reject) => {
  //     geocode({ address }, function (results, status) {
  //       status === 'OK'
  //         ? resolve([results[0].geometry.location.lng(), results[0].geometry.location.lat()])
  //         : reject(new Error(`Geocode fails: ${status}`))
  //     })
  //   })
  // }

  // testLocation (coordinates) {
  //   const location = { lat: coordinates[1], lng: coordinates[0] }
  //   const geocode = new window.google.maps.Geocoder().geocode
  //   return new Promise((resolve, reject) => {
  //     geocode({ location }, (results, status) => {
  //       status === 'OK' ? resolve(results[0].formatted_address) : reject(new Error(`Geocode fails: ${status}`))
  //     })
  //   })
  // }

  selectMarkerById (markerId) {
    this.selectedMarkerId = markerId
    setTimeout(this.setMarkerActive.bind(this))
  }

  placeMarker (markerData) {
    const marker = Object.assign(new window.google.maps.Marker({
      map: this.map,
      position: { lat: markerData.coordinates[1], lng: markerData.coordinates[0] },
      icon: this.options.markers[markerData.type],
      draggable: false,
      raiseOnDrag: false,
      title: markerData.address,
      type: markerData.type
    }), { id: markerData.id })
    const markerClickHandler = this.createMarkerClickHandler(markerData.id, marker)
    marker.addListener('click', markerClickHandler.bind(this))
    return marker
  }

  createMarkerClickHandler (markerId, marker) {
    return function (event) {
      // this.testMarkerAddress(marker.id)
      marker.setOptions({
        icon: this.activeMarkerIcon
      })
      if (this.selectedMarkerId && this.selectedMarkerId !== marker.id) {
        this[this.selectedMarkerId].setOptions({
          icon: this.options.markers[this[this.selectedMarkerId].type]
        })
      }
      this.selectedMarkerId = marker.id
      this.container.dispatchEvent(Object.assign(new Event('marker-selected'), {
        details: { id: markerId }
      }))
      setTimeout(this.setMarkerActive.bind(this))
    }.bind(this)
  }

  placeMarkers () {
    for (const type of this.options.markerTypes) {
      const collection = localStorage.getItemByName(type)
      collection.forEach(markerId => {
        const markerData = localStorage.getItemByName(markerId)
        markerData.id = markerId
        this[markerId] = this.placeMarker(markerData, type)
      })
    }
  }

  // changeMarkerAddress (markerId, address, location) {
  //   if (!this.selectedMarkerId) return
  //   if (this.selectedMarkerId !== markerId) return
  //   this[this.selectedMarkerId].address = address
  //   this[this.selectedMarkerId].setOptions({
  //     title: address,
  //     position: location
  //   })
  //   this.map.panTo(location)
  // }

  // testMarkerAddress (markerId) {
  //   const marker = localStorage.getItemByName(markerId)
  //   this.__geoCoder.geocode({ address: marker.address }, (results, status) => {
  //     if (status === 'OK') {
  //       const latLng = results[0].geometry.location
  //       console.log(results[0].formatted_address)
  //       console.log(latLng.lat(), latLng.lng())
  //     } else {
  //       console.log(results)
  //     }
  //   })
  // }

  removeMarker () {
    if (!this.selectedMarkerId) return
    this[this.selectedMarkerId].setOptions({
      map: null
    })
    this.selectedMarkerId = null
  }
}

Map.prototype.storage = localStorage

Map.prototype.options = {
  container: document.body,
  height: '700px',
  width: '100%',
  center: { lat: -37.87013628, lng: 144.963058 },
  markerTypes: ['LIT', 'Footprint'],
  markers: {}
}

Map.prototype.loadScript = function () {
  return new Promise((resolve) => {
    const script = document.body.appendChild(document.createElement('script'))
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBVql75Qc_Y5oGvrxdcNRNMhBlZEzTdk1o&libraries=geometry,drawing,places'
    script.onload = resolve.bind(null, true)
    script.onerror = resolve.bind(null, false)
  })
}

Map.prototype.createMap = async function () {
  if (!await this.loadScript()) return console.error('Error accessing Google Maps API')
  Map.prototype.__geo = window.google.maps
  Map.prototype.Polygon = window.google.maps.Polygon
  Map.prototype.__places = window.google.maps.places
  Map.prototype.__geoCoder = new window.google.maps.Geocoder()
  Map.prototype.Autocomplete = window.google.maps.places.Autocomplete
  Map.prototype.__geoLocation = window.google.maps.geometry.poly.containsLocation

  window.google.maps.SymbolPath.MARKER = 'M2.8,0C1.2,0,0,1.3,0,2.8c0,0.9,0.4,1.8,1.1,2.3L2.8,8l1.6-2.9c0.7-0.5,1.1-1.3,1.1-2.3C5.5,1.3,4.3,0,2.8,0z'

  Map.prototype.options.markers = {
    LIT: {
      path: window.google.maps.SymbolPath.MARKER,
      strokeColor: '#fff',
      strokeWeight: 1.2,
      strokeOpacity: 1,
      fillColor: '#090',
      fillOpacity: 1,
      scale: 4
    },
    Footprint: {
      path: window.google.maps.SymbolPath.MARKER,
      strokeColor: '#fff',
      strokeWeight: 1.2,
      strokeOpacity: 1,
      fillColor: '#09b',
      fillOpacity: 1,
      scale: 4
    }
  }
  Map.prototype.activeMarkerIcon = {
    path: window.google.maps.SymbolPath.MARKER,
    strokeColor: '#fff',
    strokeWeight: 1.3,
    strokeOpacity: 1,
    fillColor: '#f0f',
    fillOpacity: 1,
    scale: 5
  }

  this.map = new window.google.maps.Map(this.mapContainer, {
    center: this.center,
    zoom: 14,
    styles: mapConfig,
    disableDefaultUI: true
  })

  window.google.maps.event.addListener(this.map, 'click', this.mapClickEventHandler.bind(this))

  this.placeMarkers()

  this.container.dispatchEvent(new Event('map-is-ready'))
}

Map.prototype.setMapSize = function () {
  const box = this.container.getBoundingClientRect
  this.height = box && box.height ? box.height : typeof this.options.height === 'number' ? this.options.height : 400
  // this.width = box && box.width ? box.width : typeof this.options.width === 'number' ? this.options.width : window.innerWidth
  this.mapHeight = this.height + 'px'
  // this.mapWidth = this.width ? this.width + 'px' : '100%'
  this.mapWidth = '100%'
  this.mapContainer.style = `
    height: ${this.mapHeight};
    width: ${this.mapWidth};
  `
}

export default Map
