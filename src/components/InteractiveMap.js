import React, { useEffect, useRef, useState } from 'react';
import Map, { Marker, Source, Layer, NavigationControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './InteractiveMap.css';

const InteractiveMap = ({ activeRoute }) => {
  const mapRef = useRef();
  const [viewport, setViewport] = useState({
    longitude: 78.1653,
    latitude: 16.9536,
    zoom: 10
  });

  // NMIMS Hyderabad Campus coordinates (Jadcherla)
  const nmimsLocation = {
    longitude: 78.1653,
    latitude: 16.9536
  };

  // Route starting points
  const routePoints = {
    airport: { longitude: 78.4294, latitude: 17.2403, name: 'Airport' },
    kacheguda: { longitude: 78.4813, latitude: 17.4035, name: 'Kacheguda Railway' },
    mgbs: { longitude: 78.4747, latitude: 17.3850, name: 'MGBS' },
    jbs: { longitude: 78.5034, latitude: 17.4399, name: 'Jubilee Bus Stand' },
    jadcherla_railway: { longitude: 78.1793, latitude: 16.9695, name: 'Jadcherla Railway' },
    jadcherla_bus: { longitude: 78.1800, latitude: 16.9750, name: 'Jadcherla Bus Stand' }
  };

  const currentPoint = routePoints[activeRoute];

  // Create route line data
  const routeData = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [
        [currentPoint.longitude, currentPoint.latitude],
        [nmimsLocation.longitude, nmimsLocation.latitude]
      ]
    }
  };

  const lineLayer = {
    id: 'route',
    type: 'line',
    source: 'route',
    paint: {
      'line-color': '#F97316',
      'line-width': 4,
      'line-opacity': 0.8
    }
  };

  useEffect(() => {
    // Fit map to show both points
    if (mapRef.current) {
      mapRef.current.fitBounds(
        [
          [currentPoint.longitude, currentPoint.latitude],
          [nmimsLocation.longitude, nmimsLocation.latitude]
        ],
        {
          padding: { top: 100, bottom: 100, left: 100, right: 100 },
          duration: 1000
        }
      );
    }
  }, [activeRoute]);

  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;

  // If no token, show a placeholder
  if (!mapboxToken) {
    return (
      <div className="map-placeholder">
        <div className="placeholder-content">
          <h3>🗺️ Interactive Map</h3>
          <p>
            To enable the interactive map, please add your Mapbox token to the <code>.env</code> file:
          </p>
          <code className="env-code">REACT_APP_MAPBOX_TOKEN=your_token_here</code>
          <p className="env-note">
            Get a free token from{' '}
            <a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer">
              mapbox.com
            </a>
          </p>
          <div className="route-preview">
            <div className="route-point start">
              <span className="point-icon">📍</span>
              <span className="point-name">{currentPoint.name}</span>
            </div>
            <div className="route-line"></div>
            <div className="route-point end">
              <span className="point-icon">🏀</span>
              <span className="point-name">NMIMS Hyderabad</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="interactive-map">
      <Map
        ref={mapRef}
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />

        {/* Route Line */}
        <Source id="route" type="geojson" data={routeData}>
          <Layer {...lineLayer} />
        </Source>

        {/* Start Point Marker */}
        <Marker
          longitude={currentPoint.longitude}
          latitude={currentPoint.latitude}
          anchor="bottom"
        >
          <div className="custom-marker start-marker">
            <div className="marker-icon">📍</div>
            <div className="marker-label">{currentPoint.name}</div>
          </div>
        </Marker>

        {/* NMIMS Campus Marker (Basketball themed) */}
        <Marker
          longitude={nmimsLocation.longitude}
          latitude={nmimsLocation.latitude}
          anchor="bottom"
        >
          <div className="custom-marker nmims-marker">
            <div className="marker-pulse"></div>
            <div className="marker-icon basketball">🏀</div>
            <div className="marker-label">NMIMS Jadcherla</div>
          </div>
        </Marker>
      </Map>
    </div>
  );
};

export default InteractiveMap;
