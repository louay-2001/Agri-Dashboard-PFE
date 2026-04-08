'use client';

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const DEFAULT_CENTER = [36.8065, 10.1815];

const buildIcon = (L, status) => {
  const basePath = '/markers/';
  let iconUrl = `${basePath}marker-blue.png`;

  if (status === 'Online') {
    iconUrl = `${basePath}marker-green.png`;
  } else if (status === 'Warning') {
    iconUrl = `${basePath}marker-yellow.png`;
  } else if (status === 'Offline') {
    iconUrl = `${basePath}marker-red.png`;
  }

  return L.icon({
    iconUrl,
    shadowUrl: `${basePath}marker-shadow.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    shadowAnchor: [12, 41]
  });
};

function MapComponent({ layoutReady, markers }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersLayerRef = useRef(null);
  const leafletRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const markersRef = useRef(markers);

  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      if (!layoutReady || !mapContainerRef.current || mapRef.current) {
        return;
      }

      const module = await import('leaflet');
      const L = module.default || module;

      if (!isMounted || !mapContainerRef.current || mapRef.current) {
        return;
      }

      leafletRef.current = L;
      const initialMarkers = markersRef.current;
      const initialCenter = initialMarkers.length
        ? [initialMarkers[0].latitude, initialMarkers[0].longitude]
        : DEFAULT_CENTER;

      mapRef.current = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialMarkers.length ? 10 : 8,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);

      resizeObserverRef.current = new ResizeObserver(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      });

      resizeObserverRef.current.observe(mapContainerRef.current);
    };

    initializeMap();

    return () => {
      isMounted = false;

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      markersLayerRef.current = null;
    };
  }, [layoutReady]);

  useEffect(() => {
    if (!mapRef.current || !leafletRef.current || !markersLayerRef.current) {
      return;
    }

    const L = leafletRef.current;
    markersLayerRef.current.clearLayers();

    markers.forEach((marker) => {
      if (marker.latitude == null || marker.longitude == null) {
        return;
      }

      const markerIcon = buildIcon(L, marker.status);
      L.marker([marker.latitude, marker.longitude], { icon: markerIcon })
        .addTo(markersLayerRef.current)
        .bindPopup(
          `<b>${marker.name}</b><br/>Type: ${marker.kind}<br/>Status: ${marker.status}${marker.location ? `<br/>Location: ${marker.location}` : ''}`
        );
    });
  }, [markers]);

  return (
    <div
      id="mapid"
      ref={mapContainerRef}
      className="w-full h-full z-10"
      style={{ backgroundColor: '#cbd5e1' }}
    />
  );
}

MapComponent.propTypes = {
  layoutReady: PropTypes.bool.isRequired,
  markers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    kind: PropTypes.string,
    name: PropTypes.string,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
    status: PropTypes.string,
    location: PropTypes.string,
  })),
};

MapComponent.defaultProps = {
  markers: [],
};

export default MapComponent;
