### localStorage

#### updateMarkerCoordinates

This method should be called from **polygons** module

when the marker's coordinates changed through input field

This method dispatch event **_marker-coordinates-changed_**

The event handler for this event is **map.changeMarkerCoordinates**

#### updateMarkerPosition

This method should be called from **map** module

when the marker's position has been changed by dragging

This method dispatch event **_marker-position-changed_**

The event handler for this event is **markerPositionChangedHandler**

of **polygons** module
