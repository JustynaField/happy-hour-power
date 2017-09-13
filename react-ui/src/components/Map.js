import React, { Component } from 'react';
import { withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import { DEFAULT_LOCATION } from '../utils/constants';

const BaseMap = withGoogleMap((props) => {
  const markers = props.locations.map((location) => (
    <Marker {...location.marker} onClick={props.handleMarkerClick}/>
  ));

  return (
    <GoogleMap
      ref={props.onMapLoad}
      defaultZoom={16}
      defaultCenter={DEFAULT_LOCATION.coordinates}
      onClick={props.onMapClick}
    >
      {markers}
    </GoogleMap>
  );
});

export class Map extends Component {
  constructor() {
    super();
    this.state = {
      markers: []
    };
    this.handleMapLoad = this.handleMapLoad.bind(this);
    this.handleMarkerClick = this.handleMarkerClick.bind(this);
  }

  handleMapLoad(googleMap) {
    if (!this.gmap) return;

    const { map } = this.gmap.state;
    const { lat, lng } = this.props.currentLocation;

    const request = {
      location: new window.google.maps.LatLng(
        lat || DEFAULT_LOCATION.coordinates.lat,
        lng || DEFAULT_LOCATION.coordinates.lng,
      ),
      radius: '500',
      type: ['restaurant'],
      openNow: true
    };

    const service = new window.google.maps.places.PlacesService(map);

    service.nearbySearch(request, (results, status) => {
      if (status === 'OK') {
        this.props.nearbyLocations(results);
        this.props.getLocations();
      }
    });
  }

  handleMarkerClick(a) {
    console.log('in handleCLick', a)
  }

  componentDidMount() {
    this.props.geolocate();
  }

  render() {
    return (
      <BaseMap
        ref={googleMap => (this.gmap = googleMap)}
        containerElement={<div className="map-container" />}
        mapElement={<div className="map-element" />}
        onMapLoad={this.handleMapLoad}
        handleMarkerClick={this.handleMarkerClick}
        locations={this.props.locations}
        onMapClick={this.handleMapClick}
        onMarkerRightClick={this.handleMarkerRightClick}
      />
    );
  }
}
