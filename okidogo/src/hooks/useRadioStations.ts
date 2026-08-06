import { useState, useEffect, useCallback } from 'react';
import type { RadioStation, StationFilters } from '../types/radioStation';
import { radioStationService } from '../services/radioStation.service';

interface UseRadioStationsReturn {
  stations: RadioStation[];
  geoStations: RadioStation[];
  isLoading: boolean;
  error: Error | null;
  getFilteredStations: (filters: StationFilters) => Promise<RadioStation[]>;
  getStationById: (id: string) => Promise<RadioStation | null>;
  refreshStations: () => Promise<void>;
}

export function useRadioStations(): UseRadioStationsReturn {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [geoStations, setGeoStations] = useState<RadioStation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const loadStations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all stations
      const allStations = await radioStationService.getAllStations();
      console.log(`Loaded ${allStations.length} total stations`);
      setStations(allStations);
      
      // Get stations with geo coordinates
      const stationsWithGeo = await radioStationService.getGeoStations();
      console.log(`Loaded ${stationsWithGeo.length} stations with geo coordinates`);
      
      // Log a sample station to check coordinates
      if (stationsWithGeo.length > 0) {
        const sample = stationsWithGeo[0];
        console.log('Sample station with geo:', {
          name: sample.name,
          lat: sample.geo_lat,
          long: sample.geo_long
        });
      }
      
      setGeoStations(stationsWithGeo);
    } catch (err) {
      console.error('Error loading radio stations:', err);
      setError(err instanceof Error ? err : new Error('Failed to load radio stations'));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Load stations on component mount
  useEffect(() => {
    loadStations();
  }, [loadStations]);
  
  const getFilteredStations = useCallback(
    async (filters: StationFilters) => radioStationService.getFilteredStations(filters),
    []
  );
  
  const getStationById = useCallback(
    async (id: string) => radioStationService.getStationById(id),
    []
  );
  
  const refreshStations = useCallback(async () => {
    await loadStations();
  }, [loadStations]);
  
  return {
    stations,
    geoStations,
    isLoading,
    error,
    getFilteredStations,
    getStationById,
    refreshStations
  };
} 