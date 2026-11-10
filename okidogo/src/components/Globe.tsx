import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'; // Import MapBox CSS
import { useRadioStations } from '../hooks/useRadioStations';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import type { RadioStation } from '../types/radioStation';

interface ClusterModalProps {
  isOpen: boolean;
  onClose: () => void;
  stations: RadioStation[];
  onStationSelect: (station: RadioStation) => void;
}

const Globe = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersAdded = useRef<boolean>(false);
  const { geoStations, isLoading } = useRadioStations();
  const { play, isPlaying, currentStation } = useAudioPlayer();
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [showClusterModal, setShowClusterModal] = useState<boolean>(false);
  const [clusterStations, setClusterStations] = useState<RadioStation[]>([]);
  
  useEffect(() => {
    if (map.current || !mapContainer.current) {
      console.log('Map already initialized or container not available');
      return;
    }
    
    try {
      // Vite exposes this value to browsers. Use a restricted public token only.
      const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim();
      if (!mapboxToken || !mapboxToken.startsWith('pk.')) {
        console.error('Set VITE_MAPBOX_ACCESS_TOKEN to your Mapbox public token in .env.local, then restart Vite.');
        return;
      }

      // Set the token
      mapboxgl.accessToken = mapboxToken;
      
      console.log('Initializing MapBox map with container:', mapContainer.current);
      
      // Most basic globe implementation with high contrast styling
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Streets style for better visibility 
        projection: 'globe', // Using the simple string format for projection
        zoom: 1.5,
        center: [0, 0],
        attributionControl: false,
        interactive: true, // Make sure interaction is enabled
        renderWorldCopies: true // Render multiple world copies
      });
      
      console.log('Map instance created successfully');
    } catch (error) {
      console.error('Error initializing MapBox map:', error);
    }
    
    // Add navigation controls if map was created successfully
    if (map.current) {
      console.log('Adding navigation controls to map');
      map.current.addControl(new mapboxgl.NavigationControl());
      
      // Setup event handlers for map interactions
      map.current.on('load', () => {
        console.log('Map loaded event triggered');
        
        // Add basic atmosphere effect (without terrain which can cause errors)
        if (map.current) {
          try {
            // Set simple fog/atmosphere effect
            map.current.setFog({
              color: 'rgb(186, 210, 235)', // Sky color
              'high-color': 'rgb(36, 92, 223)', // Upper atmosphere color
              'horizon-blend': 0.02, // Horizon blend
              'space-color': '#000000', // Space color
              'star-intensity': 0.6 // Star brightness
            });
            
            // Force a redraw to ensure the globe is visible
            map.current.resize();
            
            console.log('Globe atmosphere configured');
          } catch (err) {
            console.error('Error configuring globe effects:', err);
          }
        }
      });
    }
    
    // Cleanup function to remove map when component unmounts
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  // Implement keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!map.current) return;
      
      if (e.key === '=' || e.key === '+') {
        map.current.zoomIn();
      } else if (e.key === '-' || e.key === '_') {
        map.current.zoomOut();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Handle station selection
  const handleStationSelect = useCallback((station: RadioStation) => {
    setSelectedStation(station);
    console.log('Selected station:', station.name);
    
    // Create a complete station object matching the expected type
    const stationToPlay = {
      ...station, 
      // Ensure critical fields exist
      url_resolved: station.url_resolved || station.url,
      url: station.url || '',
      id: station.id || '',
      name: station.name || 'Unknown'
    };
    
    // Update the AudioPlayer context with the selected station without playing
    // This makes the station info immediately visible in the AudioPlayerControls
    play(stationToPlay, true); // Pass true as second argument to signify "don't autoplay"
  }, [play]);
  
  // Handle play button click
  const handlePlayStation = useCallback((station: RadioStation) => {
    console.log('Globe: Playing station:', station.name, 'with ID:', station.id);
    console.log('Globe: Station URL:', station.url_resolved || station.url);
    
    // Instead of using RadioStation directly, create a complete object matching the expected type
    const stationToPlay = {
      ...station, 
      // Ensure critical fields exist
      url_resolved: station.url_resolved || station.url,
      url: station.url || '',
      id: station.id || '',
      name: station.name || 'Unknown'
    };
    
    try {
      // Play the station through the audio context
      console.log('Globe: Calling play() with complete station object');
      play(stationToPlay);
    } catch (err) {
      console.error('Globe: Error in handlePlayStation:', err);
    }
  }, [play]);
  
  // Show cluster modal with list of stations
  const handleShowClusterModal = useCallback((stations: RadioStation[]) => {
    setClusterStations(stations);
    setShowClusterModal(true);
  }, []);
  
  // Log when geoStations change
  useEffect(() => {
    console.log(`GeoStations updated: ${geoStations.length} stations with coordinates`);
    
    // Debug: log the first few stations to check coordinates
    if (geoStations.length > 0) {
      console.log('First 3 geoStations:', geoStations.slice(0, 3).map(station => ({
        name: station.name,
        lat: station.geo_lat,
        long: station.geo_long
      })));
    }
  }, [geoStations]);
  
  // Add station markers when stations data is available
  useEffect(() => {
    // More explicit check for map and stations
    if (!map.current) {
      console.log('Map reference not available yet');
      return;
    }
    
    if (isLoading) {
      console.log('Still loading station data...');
      return;
    }
    
    if (geoStations.length === 0) {
      console.log('No stations with geo coordinates available');
      return;
    }
    
    if (markersAdded.current) {
      console.log('Markers already added to map');
      return;
    }
    
    console.log(`Attempting to add ${geoStations.length} station markers to the globe...`);
    
    // Create GeoJSON for stations with geo coordinates
    const createGeoJSON = () => {
      // Filter out any stations with invalid coordinates
      const validStations = geoStations.filter(station => {
        const lat = typeof station.geo_lat === 'string' 
          ? parseFloat(station.geo_lat) 
          : station.geo_lat;
          
        const long = typeof station.geo_long === 'string' 
          ? parseFloat(station.geo_long) 
          : station.geo_long;
          
        return lat != null && long != null && !isNaN(lat) && !isNaN(long);
      });
      
      console.log(`Creating GeoJSON with ${validStations.length} valid stations`);
      
      const geoJson = {
        type: 'FeatureCollection',
        features: validStations.map(station => {
          // Convert string coordinates to number if needed
          const long = typeof station.geo_long === 'string' 
            ? parseFloat(station.geo_long) 
            : station.geo_long!;
            
          const lat = typeof station.geo_lat === 'string' 
            ? parseFloat(station.geo_lat) 
            : station.geo_lat!;
          
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [long, lat]
            },
            properties: {
              id: station.id,
              name: station.name,
              url: station.url_resolved,
              favicon: station.favicon,
              country: station.country,
              language: station.language,
              tags: station.tags ? station.tags.join(',') : '',
              _station: JSON.stringify(station) // Store full station data
            }
          };
        })
      };
      
      console.log('Created GeoJSON with features:', geoJson.features.length);
      return geoJson;
    };
    
    // Wait for map to be fully loaded
    const addStationLayers = () => {
      if (!map.current || !map.current.isStyleLoaded()) {
        console.log('Map not fully loaded yet, waiting...');
        setTimeout(addStationLayers, 100);
        return;
      }
      
      try {
        console.log('Map loaded, adding station layers...');
        
        // Add source for station points
        map.current.addSource('stations', {
          type: 'geojson',
          data: createGeoJSON() as any,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        });
        
        console.log('Added GeoJSON source to map');
        
        // Add clusters layer
        map.current.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'stations',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#00FFFF', // Bright cyan for small clusters
              50,
              '#FFFF00', // Bright yellow for medium clusters
              200,
              '#FF00FF' // Bright magenta for large clusters
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              30, // Small clusters (increased from 25)
              50,
              40, // Medium clusters (increased from 35)
              200,
              50 // Large clusters (increased from 45)
            ],
            'circle-opacity': 1.0
          }
        });
        
        console.log('Added clusters layer');
        
        // Add cluster count labels
        map.current.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'stations',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 18 // Increased from 12
          },
          paint: {
            'text-color': '#000000' // Changed to black for better contrast
          }
        });
        
        console.log('Added cluster count layer');
        
        // Add unclustered points layer
        map.current.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'stations',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#FF0000', // Bright red for visibility
            'circle-radius': 15, // Increased from 12
            'circle-stroke-width': 3, // Increased from 2
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 1.0
          }
        });
        
        console.log('Added unclustered points layer');
        
        // Check if our layers were actually added
        setTimeout(() => {
          if (map.current) {
            const layers = map.current.getStyle().layers || [];
            const layerIds = layers.map(layer => layer.id);
            console.log('Current map layers:', layerIds);
            
            const hasClusterLayer = layerIds.includes('clusters');
            const hasPointsLayer = layerIds.includes('unclustered-point');
            
            console.log(`Verification - Cluster layer exists: ${hasClusterLayer}`);
            console.log(`Verification - Points layer exists: ${hasPointsLayer}`);
            
            if (!hasClusterLayer || !hasPointsLayer) {
              console.error('Some layers were not added properly to the map');
            }
          }
        }, 2000);
        
        // Click handler for clusters
        map.current?.on('click', 'clusters', (e) => {
          const features = map.current?.queryRenderedFeatures(e.point, { layers: ['clusters'] });
          if (!features || features.length === 0 || !map.current) return;
          
          const clusterId = features[0].properties?.cluster_id;
          if (!clusterId) return;
          
          // @ts-ignore - getClusterExpansionZoom is not in the type definitions
          (map.current.getSource('stations') as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
              if (err || !map.current) return;
              
              // Get all stations in this cluster
              const clusterFeatures = map.current.querySourceFeatures('stations', {
                filter: ['==', ['get', 'cluster_id'], clusterId]
              });
              
              // If there are too many stations, show modal instead of zooming
              if (clusterFeatures.length > 5) {
                // Extract station data and open modal
                const stations = clusterFeatures.map(feature => {
                  try {
                    return JSON.parse(feature.properties?._station as string) as RadioStation;
                  } catch (e) {
                    return null;
                  }
                }).filter(Boolean) as RadioStation[];
                
                handleShowClusterModal(stations);
              } else {
                // Otherwise zoom to the cluster
                const zoomLevel = typeof zoom === 'number' ? zoom : undefined;
                map.current.easeTo({
                  center: (features[0].geometry as any).coordinates,
                  zoom: zoomLevel
                });
              }
            }
          );
        });
        
        // Click handler for single points
        map.current?.on('click', 'unclustered-point', (e) => {
          const features = map.current?.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });
          if (!features || features.length === 0) return;
          
          const props = features[0].properties;
          if (!props?._station) return;
          
          try {
            console.log('Globe: Unclustered point clicked, properties:', props);
            const station = JSON.parse(props._station as string) as RadioStation;
            console.log('Globe: Parsed station data:', station.name, station.id);
            
            // Explicitly set the selected station to trigger popup rendering
            setSelectedStation(station);
            
            // Debug log to verify state update was called
            console.log('Globe: Selected station set to:', station.name);
            
            // Also update the AudioPlayerContext with the selected station, but don't start playback
            // This ensures the bottom-right player shows the selected station immediately
            const stationToPlay = {
              ...station, 
              url_resolved: station.url_resolved || station.url,
              url: station.url || '',
              id: station.id || '',
              name: station.name || 'Unknown'
            };
            
            play(stationToPlay, true); // true means don't autoplay, just update the context
            
            // Remove the automatic zoom/centering to preserve user's map view
            // Don't change the user's zoom level - it's bad UX
          } catch (err) {
            console.error('Error parsing station data:', err);
          }
        });
        
        // Change cursor when hovering over points or clusters
        map.current?.on('mouseenter', 'clusters', () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });
        
        map.current?.on('mouseleave', 'clusters', () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });
        
        map.current?.on('mouseenter', 'unclustered-point', () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });
        
        map.current?.on('mouseleave', 'unclustered-point', () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });
        
        // Mark as added to prevent re-adding
        markersAdded.current = true;
        
      } catch (error) {
        console.error('Error adding station layers:', error);
      }
    };
    
    // Initialize after map is loaded
    if (map.current.loaded()) {
      addStationLayers();
    } else {
      map.current.on('load', addStationLayers);
    }
    
  }, [geoStations, isLoading, handleStationSelect, handleShowClusterModal]);
  
  // Log when selected station changes
  useEffect(() => {
    console.log('🔍 Selected station changed:', selectedStation?.name);
    console.log('🔍 Popup should be visible:', !!selectedStation);
  }, [selectedStation]);
  
  return (
    <div className="relative w-full h-screen">
      {/* Map container - explicit inline styling required for MapBox globe rendering */}
      <div 
        id="map-container"
        ref={mapContainer} 
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#000000', // Black background for space
        }} 
      />
      
      {/* Station info popup */}
      {selectedStation && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 16px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          borderRadius: '20px', 
          color: 'white',
          zIndex: 40,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          Selected: {selectedStation.name}
        </div>
      )}
      
      {/* Cluster modal - also convert to inline styles for consistency */}
      {showClusterModal && (
        <div style={{
          position: 'fixed',
          inset: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 30
        }}>
          <div style={{
            backgroundColor: '#1f2937', // gray-800 equivalent
            borderRadius: '8px',
            maxWidth: '28rem',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            padding: '16px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ color: 'white', fontWeight: 'bold' }}>Stations in this area</h3>
              <button 
                onClick={() => setShowClusterModal(false)}
                style={{ color: '#9ca3af', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                ×
              </button>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {clusterStations.map(station => (
                <li key={station.id} style={{ 
                  padding: '8px', 
                  borderRadius: '4px',
                  transition: 'background-color 0.2s',
                  backgroundColor: '#374151' // gray-700 equivalent
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button 
                      style={{ 
                        textAlign: 'left', 
                        flexGrow: 1, 
                        color: 'white',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        handleStationSelect(station);
                        setShowClusterModal(false);
                      }}
                    >
                      <div style={{ fontWeight: '500' }}>{station.name}</div>
                      <div style={{ fontSize: '14px', color: '#9ca3af' }}>{station.country}</div>
                    </button>
                    <button
                      style={{
                        marginLeft: '8px',
                        backgroundColor: '#047857', // green-700 equivalent
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        border: 'none'
                      }}
                      onClick={() => {
                        handlePlayStation(station);
                        setShowClusterModal(false);
                      }}
                    >
                      Play
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Globe;
