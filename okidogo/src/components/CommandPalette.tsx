import { 
  KBarProvider, 
  KBarPortal, 
  KBarPositioner, 
  KBarAnimator, 
  KBarSearch, 
  KBarResults, 
  useMatches,
  ActionImpl
} from 'kbar';
import type { ActionId } from 'kbar';
import { useRadioStations } from '../hooks/useRadioStations';
import { useAudioPlayer } from '../contexts/AudioPlayerContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useMemo } from 'react';
import type { RadioStation } from '../types/radioStation';

export const CommandPalette: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { stations } = useRadioStations();
  const { play } = useAudioPlayer();
  const { favorites } = useFavorites();
  
  // Generate actions from stations
  const stationActions = useMemo(() => {
    if (!stations || !stations.length) return [];
    
    return stations.map(station => ({
      id: `station-${station.id}`,
      name: station.name,
      subtitle: `${station.country} • ${station.tags?.join(', ') || 'No tags'}`,
      keywords: `${station.name} ${station.country} ${station.tags?.join(' ') || ''}`.toLowerCase(),
      section: 'Stations',
      perform: () => play({
        id: station.id,
        name: station.name,
        url: station.url,
        url_resolved: station.url_resolved,
        country: station.country,
        favicon: station.favicon
      } as RadioStation)
    }));
  }, [stations, play]);
  
  // Generate actions from favorites
  const favoriteActions = useMemo(() => {
    if (!favorites || !favorites.length) return [];
    
    return favorites.map(station => ({
      id: `fav-${station.id}`,
      name: station.name,
      subtitle: `Favorite • ${station.country || 'Unknown'}`,
      keywords: `favorite ${station.name} ${station.country || ''}`.toLowerCase(),
      section: 'Favorites',
      perform: () => play(station)
    }));
  }, [favorites, play]);
  
  // Static actions
  const actions = [
    {
      id: 'search',
      name: 'Search Stations',
      shortcut: ['s'],
      keywords: 'find search stations radio',
      section: 'General'
    },
    {
      id: 'favorites',
      name: 'Show Favorites',
      shortcut: ['f'],
      keywords: 'favorites saved stations',
      section: 'General',
      perform: () => {
        // This action could filter or highlight favorites,
        // but since favorites are already shown in their own section,
        // this is just a placeholder for future enhancement
        console.log('Favorites section is already available');
      }
    },
    {
      id: 'sleep-timer',
      name: 'Set Sleep Timer',
      shortcut: ['t'],
      keywords: 'sleep timer countdown',
      section: 'General',
      perform: () => { /* Will implement in sleep timer task */ }
    },
    {
      id: 'toggle-theme',
      name: 'Toggle Dark/Light Mode',
      shortcut: ['d'],
      keywords: 'theme dark light mode',
      section: 'Settings',
      perform: () => { /* Will implement in theme toggle task */ }
    },
    {
      id: 'toggle-bandwidth',
      name: 'Toggle Low-Bandwidth Mode',
      shortcut: ['b'],
      keywords: 'bandwidth performance low high',
      section: 'Settings',
      perform: () => { /* Will implement in bandwidth toggle task */ }
    }
  ];
  
  // Pop genre filter actions
  const genreActions = [
    {
      id: 'genre-pop',
      name: 'Pop',
      keywords: 'pop music',
      section: 'Genres',
      perform: () => console.log('Filter by Pop genre')
    },
    {
      id: 'genre-rock',
      name: 'Rock',
      keywords: 'rock music',
      section: 'Genres',
      perform: () => console.log('Filter by Rock genre')
    },
    {
      id: 'genre-jazz',
      name: 'Jazz',
      keywords: 'jazz music',
      section: 'Genres',
      perform: () => console.log('Filter by Jazz genre')
    },
    {
      id: 'genre-classical',
      name: 'Classical',
      keywords: 'classical music',
      section: 'Genres',
      perform: () => console.log('Filter by Classical genre')
    }
  ];
  
  // Country filter actions
  const countryActions = [
    {
      id: 'country-us',
      name: 'United States',
      keywords: 'us usa united states america',
      section: 'Countries',
      perform: () => console.log('Filter by US stations')
    },
    {
      id: 'country-uk',
      name: 'United Kingdom',
      keywords: 'uk united kingdom britain england',
      section: 'Countries',
      perform: () => console.log('Filter by UK stations')
    },
    {
      id: 'country-japan',
      name: 'Japan',
      keywords: 'japan japanese',
      section: 'Countries',
      perform: () => console.log('Filter by Japan stations')
    }
  ];
  
  // Filter actions (parent actions) - simplified structure to avoid nesting issues
  const filterActions = [
    {
      id: 'filter-genre',
      name: 'Filter by Genre',
      keywords: 'filter genre music type',
      section: 'Filters',
      perform: () => console.log('Opening genre filters')
    },
    {
      id: 'filter-country',
      name: 'Filter by Country',
      keywords: 'filter country location',
      section: 'Filters',
      perform: () => console.log('Opening country filters')
    },
    {
      id: 'clear-filters',
      name: 'Clear All Filters',
      keywords: 'clear reset filters',
      section: 'Filters',
      perform: () => console.log('Clear all filters')
    }
  ];
  
  // Combine all actions - flattened structure to avoid nesting issues
  const allActions = [...actions, ...filterActions, ...genreActions, ...countryActions];
  
  // Add favorite actions if we have favorites
  if (favoriteActions.length > 0) {
    allActions.push(...favoriteActions);
  }
  
  // Only include station actions if we have stations data
  if (stationActions.length > 0) {
    allActions.push(...stationActions);
  }
  
  return (
    <KBarProvider actions={allActions}>
      <KBarPortal>
        <KBarPositioner className="z-50 bg-black/50 backdrop-blur-sm">
          <KBarAnimator className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl kbar-fade-in">
            <KBarSearch className="w-full px-4 py-3 text-gray-900 dark:text-white bg-transparent border-b border-gray-200 dark:border-gray-700 focus:outline-none kbar-search-input" />
            <div className="max-h-[60vh] overflow-y-auto">
              <RenderResults />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </KBarProvider>
  );
};

// Custom results renderer
const RenderResults = () => {
  const { results } = useMatches();
  
  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) => {
        if (typeof item === 'string') {
          return (
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
              {item}
            </div>
          );
        }
        
        const action = item as ActionImpl;
        
        return (
          <div
            className={`px-4 py-2 flex items-center justify-between cursor-pointer ${active ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
          >
            <div>
              <div className="text-gray-900 dark:text-white">{action.name}</div>
              {action.subtitle && (
                <div className="text-xs text-gray-500">{action.subtitle}</div>
              )}
            </div>
            {action.shortcut && action.shortcut.length > 0 && (
              <div className="flex space-x-1">
                {action.shortcut.map((sc) => (
                  <kbd key={sc} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                    {sc}
                  </kbd>
                ))}
              </div>
            )}
          </div>
        );
      }}
    />
  );
};

export default CommandPalette;
