// c:\Dashboard\frontend\app\components\MapComponent.jsx
'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}


// --- Marker function ---
const addMarker = (map, L, latlng, deviceName, status) => {
    let iconUrl;
    // ENSURE these paths are correct relative to your `/public` folder
    const basePath = '/markers/'; // Example: if markers are in /public/markers/
    switch (status) {
        case 'Online': iconUrl = `${basePath}marker-green.png`; break;
        case 'Offline': iconUrl = `${basePath}marker-red.png`; break;
        case 'Warning': iconUrl = `${basePath}marker-yellow.png`; break;
        default: iconUrl = `${basePath}marker-blue.png`; break;
    }

    try {
        const markerIcon = L.icon({
            iconUrl: iconUrl,
            shadowUrl: `${basePath}marker-shadow.png`,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
            shadowAnchor: [12, 41]
        });

        L.marker(latlng, { icon: markerIcon }).addTo(map)
            .bindPopup(`<b>${deviceName}</b><br>Status: ${status}`);
    } catch (error) {
         console.error("Error creating marker icon or marker:", error, "Check L instance and icon paths:", iconUrl);
    }
};
// --- End of addMarker function ---


function MapComponent({ layoutReady }) {
    const mapRef = useRef(null);
    const mapContainerRef = useRef(null);
    const [isMapInitialized, setIsMapInitialized] = useState(false);
    const initTimeoutRef = useRef(null);
    const resizeObserverRef = useRef(null);
    const leafletRef = useRef(null); // Store Leaflet dynamic import

    // Callback to initialize map (to avoid redefining in effect)
    const initializeMap = useCallback((element, L) => {
        if (!element || mapRef.current || element._leaflet_id) {
            console.log("Map init skipped: Element missing, map exists, or already attached.", { hasElement: !!element, hasMapRef: !!mapRef.current, hasLeafletId: element?._leaflet_id });
            return;
        }
        try {
            console.log('Attempting L.map() initialization...');
            mapRef.current = L.map(element, {
                 center: [51.505, -0.09],
                 zoom: 14,
            });
            console.log('L.map() success. Instance:', mapRef.current);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19, // Optional: Good default
            }).addTo(mapRef.current);
            console.log('Tile layer added.');

             // Add Markers using the utility function
             addMarker(mapRef.current, L, [51.505, -0.09], 'Device 1', 'Online');
             addMarker(mapRef.current, L, [51.510, -0.10], 'Device 2', 'Offline');
             addMarker(mapRef.current, L, [51.495, -0.08], 'Device 3', 'Warning');
             console.log('Markers added.');

            setIsMapInitialized(true);
            // Remove debug background once map is loaded
            if(mapContainerRef.current) {
                mapContainerRef.current.style.backgroundColor = 'transparent';
            }

        } catch (error) {
            console.error('Error initializing Leaflet map:', error);
            // Clean up partial instance if error occurred mid-init
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
             setIsMapInitialized(false); // Ensure state reflects failure
        }
    }, []); // No dependencies, relies on arguments

    // Effect for setup and cleanup
    useEffect(() => {
        console.log('MapComponent Effect | layoutReady:', layoutReady);

        if (!layoutReady || !mapContainerRef.current) {
            console.log('MapComponent Effect: Waiting for layout, container ref, or Leaflet import.');
            return; // Wait until layout is ready and container exists
        }

        const mapElement = mapContainerRef.current;
        let currentObserver = null; // Store observer instance locally for cleanup
        let isMounted = true;

        // --- Import Leaflet ---
        if (!leafletRef.current) {
            import('leaflet')
                .then(module => {
                    const L = module.default || module;
                    if (!isMounted) return;
                    console.log('MapComponent Effect: Leaflet imported successfully.');
                    leafletRef.current = L; // Store the loaded module
                    setupObserver(L);
                })
                .catch(error => {
                    console.error('MapComponent Effect: Failed to import Leaflet:', error);
                });
        } else {
             // Leaflet already loaded, proceed with observer setup
             setupObserver(leafletRef.current);
        }


        // --- Function to Setup Resize Observer ---
        function setupObserver(L) {
            console.log('MapComponent Effect: Setting up ResizeObserver.');

            // Debounced invalidateSize function
            const debouncedInvalidateSize = debounce(() => {
                if (mapRef.current) {
                    console.log("ResizeObserver: Debounced invalidateSize triggered.");
                    mapRef.current.invalidateSize();
                }
            }, 150); // Adjust debounce delay as needed

            const resizeObserver = new ResizeObserver(entries => {
                if (!entries || entries.length === 0) return;
                const { width, height } = entries[0].contentRect;
                console.log(`ResizeObserver Callback | Dimensions: ${width} x ${height} | Map Initialized: ${isMapInitialized}`);

                // Clear previous init timeout if it exists
                if (initTimeoutRef.current) {
                    clearTimeout(initTimeoutRef.current);
                    initTimeoutRef.current = null;
                }

                if (width > 0 && height > 0) {
                    if (!mapRef.current && !isMapInitialized) {
                        console.log('ResizeObserver: Dimensions valid, scheduling map initialization.');
                        // Use timeout to ensure DOM is fully settled after resize event
                        initTimeoutRef.current = setTimeout(() => {
                            console.log('setTimeout: Initializing map now...');
                             // Check dimensions again *inside* timeout
                             if (mapElement.offsetWidth > 0 && mapElement.offsetHeight > 0) {
                                initializeMap(mapElement, L);
                             } else {
                                 console.log('setTimeout: Dimensions became invalid before init.');
                             }
                        }, 50); // Short delay after resize settles
                    } else if (mapRef.current) {
                        // If map exists and container is resized, invalidate size (debounced)
                        console.log('ResizeObserver: Map exists, queueing invalidateSize.');
                        debouncedInvalidateSize();
                    }
                } else {
                     console.log('ResizeObserver: Zero dimensions detected.');
                     // Optional: If map exists but container becomes zero, maybe destroy map?
                     // if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; setIsMapInitialized(false); }
                }
            });

            resizeObserver.observe(mapElement);
            currentObserver = resizeObserver; // Store for cleanup
            console.log('MapComponent Effect: ResizeObserver started.');
        }


        // --- Cleanup Function ---
        return () => {
            isMounted = false;
            console.log('MapComponent Cleanup: Running...');
            // Clear any pending initialization timeout
            if (initTimeoutRef.current) {
                clearTimeout(initTimeoutRef.current);
                console.log('MapComponent Cleanup: Cleared init timeout.');
            }
            // Disconnect the observer
            if (currentObserver) {
                currentObserver.disconnect();
                console.log('MapComponent Cleanup: Disconnected ResizeObserver.');
            } else if (resizeObserverRef.current){ // Fallback if setupObserver didn't assign currentObserver somehow
                 resizeObserverRef.current.disconnect();
                 console.log('MapComponent Cleanup: Disconnected ResizeObserver (fallback).');
            }
            // Remove the map instance
            if (mapRef.current) {
                console.log('MapComponent Cleanup: Removing map instance.');
                mapRef.current.remove();
                mapRef.current = null;
            }
            // Reset state on unmount
            setIsMapInitialized(false);
             // Don't reset leafletRef.current here, it might be needed if component re-mounts quickly
            console.log('MapComponent Cleanup: Finished.');
        };
    }, [layoutReady, initializeMap]); // Effect depends on layoutReady and the stable initializeMap callback

    // Use the ref. Add a temporary background color to visualize the container.
    // Ensure w-full, h-full to take space from parent. z-10 might be needed depending on overlays.
    return <div
        id="mapid"
        ref={mapContainerRef}
        className="w-full h-full z-10"
        style={{ backgroundColor: '#cbd5e1' }} // Debug bg color (slate-300) - removed on init
    />;
}

MapComponent.propTypes = {
  layoutReady: PropTypes.bool.isRequired,
};

export default MapComponent;