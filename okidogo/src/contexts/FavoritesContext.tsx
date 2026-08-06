import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { RadioStation } from '../types/radioStation';

interface FavoritesContextType {
  favorites: RadioStation[];
  addFavorite: (station: RadioStation) => void;
  removeFavorite: (stationId: string) => void;
  isFavorite: (stationId: string) => boolean;
  toggleFavorite: (station: RadioStation) => void;
}

// Storage key for localStorage
const STORAGE_KEY = 'okidogo-favorites';

// Create a composite key for a station that's more stable across sessions
const getStationKey = (station: RadioStation): string => {
  return `${station.name}::${station.url || station.url_resolved || ''}`.toLowerCase();
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<RadioStation[]>([]);
  // Store station keys for quick lookup
  const [favoriteKeys, setFavoriteKeys] = useState<Set<string>>(new Set());
  // Track if initial loading has occurred
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  
  // Load favorites from localStorage on mount
  useEffect(() => {
    console.log('Loading favorites from localStorage');
    const storedFavorites = localStorage.getItem(STORAGE_KEY);
    if (storedFavorites) {
      try {
        const parsed = JSON.parse(storedFavorites);
        console.log(`Loaded ${parsed.length} favorites from localStorage`);
        
        // Generate keys for all loaded favorites
        const keys = new Set<string>(parsed.map((station: RadioStation) => getStationKey(station)));
        
        // Set both state updates at once to prevent an extra render cycle
        setFavorites(parsed);
        setFavoriteKeys(keys);
      } catch (error) {
        console.error('Failed to parse favorites from localStorage:', error);
      }
    }
    
    // Mark initial loading as complete
    setInitialLoadDone(true);
  }, []);
  
  // Save favorites to localStorage whenever they change, but only after initial load
  useEffect(() => {
    // Skip the first render/effect after initial loading
    if (!initialLoadDone) return;
    
    console.log(`Saving ${favorites.length} favorites to localStorage`);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    
    // Update keys when favorites change
    setFavoriteKeys(new Set<string>(favorites.map(station => getStationKey(station))));
  }, [favorites, initialLoadDone]);
  
  const addFavorite = (station: RadioStation) => {
    const stationKey = getStationKey(station);
    
    setFavorites(prev => {
      // Check if already in favorites by composite key
      if (favoriteKeys.has(stationKey)) {
        console.log(`Station "${station.name}" already in favorites`);
        return prev;
      }
      console.log(`Adding "${station.name}" to favorites`);
      return [...prev, station];
    });
  };
  
  const removeFavorite = (stationId: string) => {
    setFavorites(prev => {
      const stationToRemove = prev.find(s => s.id === stationId);
      if (stationToRemove) {
        console.log(`Removing "${stationToRemove.name}" from favorites`);
      }
      return prev.filter(station => station.id !== stationId);
    });
  };
  
  // Helper function to check if the favorites list contains a station
  // with name+url matching the provided station name+url
  const hasMatchingFavorite = (name: string, url: string) => {
    // Create a normalized key from the station properties
    const stationKey = `${name}::${url}`.toLowerCase();
    
    // Check if any favorite matches this key
    for (const favorite of favorites) {
      const favKey = getStationKey(favorite);
      if (favKey === stationKey) {
        return true;
      }
    }
    
    // Also check the favoriteKeys Set for the same key
    return favoriteKeys.has(stationKey);
  };
  
  const isFavorite = (stationId: string) => {
    // First try direct ID matching (fastest method)
    const directMatch = favorites.some(station => station.id === stationId);
    if (directMatch) {
      console.log(`Found favorite by direct ID match: ${stationId}`);
      return true;
    }
    
    // Get station from MiniPlayer component's passed currentStation
    // We need to check the DOM to find the currently selected station
    const stationElements = document.querySelectorAll('[data-station-id]');
    for (const element of stationElements) {
      const id = element.getAttribute('data-station-id');
      const name = element.getAttribute('data-station-name');
      const url = element.getAttribute('data-station-url');
      
      if (id === stationId && name && url) {
        // We found the station in the DOM, check if it matches any favorite by name+url
        const isMatch = hasMatchingFavorite(name, url);
        if (isMatch) {
          console.log(`Found favorite by composite key for DOM element: ${name}`);
          return true;
        }
      }
    }
    
    return false;
  };
  
  const toggleFavorite = (station: RadioStation) => {
    if (!station) return;
    
    const stationKey = getStationKey(station);
    if (favoriteKeys.has(stationKey) || favorites.some(s => s.id === station.id)) {
      console.log(`Toggling OFF favorite for "${station.name}"`);
      removeFavorite(station.id);
    } else {
      console.log(`Toggling ON favorite for "${station.name}"`);
      addFavorite(station);
    }
  };
  
  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        toggleFavorite
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
