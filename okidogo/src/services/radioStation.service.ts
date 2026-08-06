import type { RadioStation, StationCache, StationFilters } from '../types/radioStation';
import { CACHE_DURATION } from '../types/radioStation';
import { dbService } from './db.service';

/**
 * Base URL for the Radio Browser API
 * Using the recommended approach of multiple server hostnames
 */
const API_ENDPOINTS = [
  'de1.api.radio-browser.info',
  'fr1.api.radio-browser.info',
  'nl1.api.radio-browser.info'
];

// Fallback mock data in case the API is unreachable
const MOCK_STATIONS: RadioStation[] = [
  {
    id: 'mock-1',
    name: 'BBC Radio 1',
    url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
    url_resolved: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
    homepage: 'https://www.bbc.co.uk/radio1',
    favicon: 'https://ichef.bbci.co.uk/images/ic/256x256/p08b23c8.png',
    tags: ['public radio', 'music', 'pop'],
    country: 'United Kingdom',
    countrycode: 'GB',
    state: 'London',
    language: 'english',
    codec: 'MP3',
    bitrate: 128,
    votes: 500,
    lastcheckok: true,
    lastchecktime: '2023-01-01T00:00:00Z',
    lastcheckoktime: '2023-01-01T00:00:00Z',
    clickcount: 10000,
    clicktrend: 100,
    geo_lat: 51.5074,
    geo_long: -0.1278
  },
  {
    id: 'mock-2',
    name: 'KEXP Seattle',
    url: 'https://kexp.streamguys1.com/kexp64.aac',
    url_resolved: 'https://kexp.streamguys1.com/kexp64.aac',
    homepage: 'https://kexp.org',
    favicon: 'https://kexp.org/favicon.ico',
    tags: ['alternative', 'indie', 'seattle'],
    country: 'United States',
    countrycode: 'US',
    state: 'Washington',
    language: 'english',
    codec: 'AAC',
    bitrate: 64,
    votes: 400,
    lastcheckok: true,
    lastchecktime: '2023-01-01T00:00:00Z',
    lastcheckoktime: '2023-01-01T00:00:00Z',
    clickcount: 8000,
    clicktrend: 80,
    geo_lat: 47.6062,
    geo_long: -122.3321
  },
  {
    id: 'mock-3',
    name: 'Radio France Culture',
    url: 'https://icecast.radiofrance.fr/franceculture-midfi.mp3',
    url_resolved: 'https://icecast.radiofrance.fr/franceculture-midfi.mp3',
    homepage: 'https://www.radiofrance.fr/',
    favicon: 'https://www.radiofrance.fr/favicon.ico',
    tags: ['culture', 'public', 'talk'],
    country: 'France',
    countrycode: 'FR',
    state: 'Paris',
    language: 'french',
    codec: 'MP3',
    bitrate: 128,
    votes: 300,
    lastcheckok: true,
    lastchecktime: '2023-01-01T00:00:00Z',
    lastcheckoktime: '2023-01-01T00:00:00Z',
    clickcount: 6000,
    clicktrend: 60,
    geo_lat: 48.8566,
    geo_long: 2.3522
  },
  {
    id: 'mock-4',
    name: 'Radio Japan',
    url: 'https://example.com/radio-japan',
    url_resolved: 'https://example.com/radio-japan',
    homepage: 'https://www3.nhk.or.jp/nhkworld/',
    favicon: 'https://www3.nhk.or.jp/favicon.ico',
    tags: ['news', 'world', 'japan'],
    country: 'Japan',
    countrycode: 'JP',
    state: 'Tokyo',
    language: 'japanese',
    codec: 'MP3',
    bitrate: 96,
    votes: 200,
    lastcheckok: true,
    lastchecktime: '2023-01-01T00:00:00Z',
    lastcheckoktime: '2023-01-01T00:00:00Z',
    clickcount: 4000,
    clicktrend: 40,
    geo_lat: 35.6762,
    geo_long: 139.6503
  },
  {
    id: 'mock-5',
    name: 'ABC Radio Australia',
    url: 'https://live-radio01.mediahubaustralia.com/RAEW/aac/',
    url_resolved: 'https://live-radio01.mediahubaustralia.com/RAEW/aac/',
    homepage: 'https://www.abc.net.au/radio/',
    favicon: 'https://www.abc.net.au/favicon.ico',
    tags: ['news', 'public', 'australia'],
    country: 'Australia',
    countrycode: 'AU',
    state: 'Sydney',
    language: 'english',
    codec: 'AAC',
    bitrate: 64,
    votes: 150,
    lastcheckok: true,
    lastchecktime: '2023-01-01T00:00:00Z',
    lastcheckoktime: '2023-01-01T00:00:00Z',
    clickcount: 3000,
    clicktrend: 30,
    geo_lat: -33.8688,
    geo_long: 151.2093
  },
  // Additional stations for different continents
  {
    id: 'mock-6',
    name: 'Radio Africa',
    url: 'https://example.com/radio-africa',
    url_resolved: 'https://example.com/radio-africa',
    homepage: 'https://example.com',
    favicon: 'https://example.com/favicon.ico',
    tags: ['africa', 'news', 'music'],
    country: 'South Africa',
    countrycode: 'ZA',
    state: 'Cape Town',
    language: 'english',
    codec: 'MP3',
    bitrate: 96,
    votes: 120,
    lastcheckok: true,
    lastchecktime: '2023-01-01T00:00:00Z',
    lastcheckoktime: '2023-01-01T00:00:00Z',
    clickcount: 2500,
    clicktrend: 25,
    geo_lat: -33.9249,
    geo_long: 18.4241
  },
  {
    id: 'mock-7',
    name: 'Radio Brasil',
    url: 'https://example.com/radio-brasil',
    url_resolved: 'https://example.com/radio-brasil',
    homepage: 'https://example.com',
    favicon: 'https://example.com/favicon.ico',
    tags: ['brasil', 'samba', 'mpb'],
    country: 'Brazil',
    countrycode: 'BR',
    state: 'Rio de Janeiro',
    language: 'portuguese',
    codec: 'MP3',
    bitrate: 128,
    votes: 180,
    lastcheckok: true,
    lastchecktime: '2023-01-01T00:00:00Z',
    lastcheckoktime: '2023-01-01T00:00:00Z',
    clickcount: 3800,
    clicktrend: 38,
    geo_lat: -22.9068,
    geo_long: -43.1729
  }
];

// List of known Radio-Browser mirrors ordered by reliability.
// We will attempt them in this order until one responds.
const RADIO_BROWSER_MIRRORS = [
  'de1', // Germany – tends to be the most reliable
  'nl1', // Netherlands
  'fr1', // France
  'us1', // United States
  'ru1'  // Russia
];

// Helper to build the full URL for a given mirror sub-domain
const buildSearchUrl = (mirror: string) =>
  `https://${mirror}.api.radio-browser.info/json/stations/search`;

// The first mirror in the list will act as the default when we just need a base
const PUBLIC_API_ENDPOINT = buildSearchUrl(RADIO_BROWSER_MIRRORS[0]);

// Remove CORS proxies as they often have access restrictions
// const CORS_PROXIES = [
//   'https://corsproxy.io/?',
//   'https://cors-anywhere.herokuapp.com/'
// ];

// How many stations to request per API call. The Radio-Browser API supports up to 50000,
// Using 5000 as a balance between coverage and performance.
// With proper filters, 5000 high-quality stations is better than 10000 mixed-quality ones.
const STATION_LIMIT = 5000;

class RadioStationService {
  private apiBase: string | null = null;
  private memoryCache: StationCache | null = null;
  private useMock: boolean = false;
  // private corsProxyIndex: number = 0; // Track which proxy to use
  
  constructor() {
    // Use a fixed reliable endpoint instead of random selection
    this.apiBase = `https://${RADIO_BROWSER_MIRRORS[0]}.api.radio-browser.info/json`;
    
    // Use real API data, not mock
    this.useMock = false;
    console.log('RadioStation service initialized with real API mode');
  }
  
  /**
   * Get all stations, first trying cache then falling back to API
   */
  async getAllStations(): Promise<RadioStation[]> {
    try {
      // If mock data is enabled, return mock stations immediately
      if (this.useMock) {
        console.log('Mock mode enabled - returning mock stations directly');
        return this.getMockStations();
      }
      
      // Try to get from memory cache first (fastest)
      if (this.isMemoryCacheValid()) {
        console.log('Using in-memory cache for stations');
        return this.memoryCache!.stations;
      }
      
      // Try to get from IndexedDB cache next
      const dbCache = await this.getFromIndexedDB();
      if (dbCache) {
        console.log('Using IndexedDB cache for stations');
        // Update memory cache
        this.memoryCache = dbCache;
        return dbCache.stations;
      }
      
      // If no cache or expired, fetch from API
      console.log('No valid cache found, fetching stations from API');
      try {
        // Try the public API endpoint first (most reliable, no CORS issues)
        console.log('Attempting to fetch from public API endpoint...');
        const stations = await this.fetchFromPublicAPI();
        console.log(`Successfully fetched ${stations.length} stations from public API endpoint`);
        
        // Save to both caches
        const cache: StationCache = {
          timestamp: Date.now(),
          stations
        };
        
        this.memoryCache = cache;
        await this.saveToIndexedDB(cache);
        
        return stations;
      } catch (apiError) {
        console.error('Public API fetch failed, error details:', apiError);
        console.log('Trying alternate API endpoint...');
        
        try {
          // Try the regular API as fallback
          const stations = await this.fetchFromAPI();
          console.log(`Successfully fetched ${stations.length} stations from alternate API endpoint`);
          
          // Save to both caches
          const cache: StationCache = {
            timestamp: Date.now(),
            stations
          };
          
          this.memoryCache = cache;
          await this.saveToIndexedDB(cache);
          
          return stations;
        } catch (secondApiError) {
          console.error('All API attempts failed! Falling back to mock data:', secondApiError);
          console.log('Falling back to mock data due to API failures');
          
          // Use mock data as last resort
          const mockStations = this.getMockStations();
          
          // Save mock data to caches too for consistency
          const mockCache: StationCache = {
            timestamp: Date.now(),
            stations: mockStations
          };
          
          this.memoryCache = mockCache;
          await this.saveToIndexedDB(mockCache);
          
          return mockStations;
        }
      }
    } catch (error) {
      console.error('Critical error in getAllStations:', error);
      
      // Ultimate fallback - return mock data directly
      console.log('Using mock data due to critical error');
      return this.getMockStations();
    }
  }
  
  /**
   * Filter stations based on provided criteria
   */
  async getFilteredStations(filters: StationFilters): Promise<RadioStation[]> {
    const stations = await this.getAllStations();
    
    return stations.filter(station => {
      // Apply each filter if it exists
      if (filters.country && station.country.toLowerCase() !== filters.country.toLowerCase()) {
        return false;
      }
      
      if (filters.language && station.language.toLowerCase() !== filters.language.toLowerCase()) {
        return false;
      }
      
      if (filters.tag && !station.tags.some(tag => 
        tag.toLowerCase().includes(filters.tag!.toLowerCase())
      )) {
        return false;
      }
      
      if (filters.name && !station.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }
  
  /**
   * Get a single station by ID
   */
  async getStationById(id: string): Promise<RadioStation | null> {
    const stations = await this.getAllStations();
    return stations.find(station => station.id === id) || null;
  }
  
  /**
   * Clear all cached station data and force fresh fetch on next request
   */
  async clearCache(): Promise<void> {
    console.log('Clearing all station caches...');
    
    // Clear memory cache
    this.memoryCache = null;
    
    // Clear IndexedDB cache
    await dbService.clearCache();
    
    console.log('All caches cleared. Next fetch will be fresh from API.');
  }
  
  /**
   * Get stations with geo coordinates for mapping
   */
  async getGeoStations(): Promise<RadioStation[]> {
    console.log('Fetching stations with geo coordinates...');
    const stations = await this.getAllStations();
    console.log(`Got ${stations.length} total stations, filtering for those with coordinates`);
    
    // If using mock mode by choice, return mock stations
    if (this.useMock) {
      console.log('Using mock data, returning all mock stations for testing');
      return MOCK_STATIONS;
    }
    
    const stationsWithGeo = stations.filter(station => 
      station.geo_lat != null && 
      station.geo_long != null && 
      station.geo_lat !== 0 && 
      station.geo_long !== 0
    );
    
    console.log(`Found ${stationsWithGeo.length} stations with valid coordinates`);
    
    // If no stations with coordinates, fall back to mock data
    if (stationsWithGeo.length === 0) {
      console.log('No stations with coordinates found, falling back to mock data');
      return MOCK_STATIONS;
    }
    
    return stationsWithGeo;
  }
  
  /**
   * Check if memory cache is valid (exists and not expired)
   */
  private isMemoryCacheValid(): boolean {
    if (!this.memoryCache) return false;
    
    const now = Date.now();
    return (now - this.memoryCache.timestamp) < CACHE_DURATION;
  }
  
  /**
   * Get cache from IndexedDB
   */
  private async getFromIndexedDB(): Promise<StationCache | null> {
    try {
      const cache = await dbService.getStations();
      
      if (!cache) return null;
      
      // Check if cache is expired
      const now = Date.now();
      if ((now - cache.timestamp) > CACHE_DURATION) {
        return null;
      }
      
      return cache;
    } catch (error) {
      console.error('Error getting cached stations from IndexedDB:', error);
      return null;
    }
  }
  
  /**
   * Save cache to IndexedDB
   */
  private async saveToIndexedDB(cache: StationCache): Promise<void> {
    try {
      await dbService.saveStations(cache);
    } catch (error) {
      console.error('Error saving stations to IndexedDB:', error);
    }
  }
  
  /**
   * Get mock station data 
   * This is useful for development or when the API is unreachable
   */
  private getMockStations(): RadioStation[] {
    console.log('Using mock station data');
    return MOCK_STATIONS;
  }
  
  /**
   * Fetch from the public API which should work without CORS issues
   */
  private async fetchFromPublicAPI(): Promise<RadioStation[]> {
    console.log('Trying public API mirrors in order...');
    try {
      let stations: RadioStation[] | null = null;
      let lastError: any = null;
      // iterate through mirrors until one succeeds
      for (const mirror of RADIO_BROWSER_MIRRORS) {
        // Strict filters for high-quality, working stations:
        // - lastcheckok=true: Recently verified as working
        // - order=clickcount&reverse=true: Most popular first (more reliable)
        // - has_geo_info: Must have location data for map display
        const apiUrl = `${buildSearchUrl(mirror)}?limit=${STATION_LIMIT}&has_geo_info=true&lastcheckok=true&order=clickcount&reverse=true`;
        console.log(`Fetching from mirror: ${mirror} → ${apiUrl}`);
        try {
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          if (!response.ok) {
            throw new Error(`Mirror ${mirror} responded with status ${response.status}`);
          }
          stations = (await response.json()) as any;
          console.log(`Mirror ${mirror} succeeded with ${(stations as any).length} stations`);
          break; // exit loop on success
        } catch (err) {
          console.warn(`Mirror ${mirror} failed:`, err);
          lastError = err;
          continue; // try next mirror
        }
      }

      if (!stations) {
        // all mirrors failed
        throw lastError || new Error('All Radio-Browser mirrors failed');
      }

      // TypeScript: stations is guaranteed to be non-null beyond this point
      const availableStations: RadioStation[] = (stations ?? []);
      const mappedStations = availableStations.map((raw: any) => {
        const mapped: RadioStation = {
          id: raw.stationuuid || raw.id || raw.uuid || raw.name, // fallback values
          name: raw.name,
          url: raw.url || raw.url_resolved,
          url_resolved: raw.url_resolved || raw.url,
          homepage: raw.homepage || raw.homepageurl || '',
          favicon: raw.favicon || '',
          tags: raw.tags ? raw.tags.split(',').map((t: string) => t.trim()) : [],
          country: raw.country || '',
          countrycode: raw.countrycode || '',
          state: raw.state || '',
          language: raw.language || '',
          codec: raw.codec || '',
          bitrate: raw.bitrate ? Number(raw.bitrate) : 0,
          votes: raw.votes ? Number(raw.votes) : 0,
          lastcheckok: raw.lastcheckok ?? true,
          lastchecktime: raw.lastchecktime || '',
          lastcheckoktime: raw.lastcheckoktime || '',
          clickcount: raw.clickcount ? Number(raw.clickcount) : 0,
          clicktrend: raw.clicktrend ? Number(raw.clicktrend) : 0,
          geo_lat: raw.geo_lat ?? raw.latitude ?? null,
          geo_long: raw.geo_long ?? raw.longitude ?? null
        };
        return mapped;
      });

      console.log(`Received ${mappedStations.length} stations from RadioBrowser API`);
      
      // Basic validation and cleanup - only include stations likely to work
      const validStations = mappedStations.filter(station => {
        // Must have basic required fields
        if (!station || !station.id || !station.name || !station.url) {
          return false;
        }
        
        // Must have valid coordinates
        if (station.geo_lat == null || station.geo_long == null || 
            station.geo_lat === 0 || station.geo_long === 0) {
          return false;
        }
        
        // Only include stations that were last checked as OK
        if (station.lastcheckok === false) {
          return false;
        }
        
        // Prefer stations with known working codecs
        const supportedCodecs = ['MP3', 'AAC', 'OGG', 'OPUS'];
        if (station.codec && !supportedCodecs.includes(station.codec.toUpperCase())) {
          return false;
        }
        
        // Filter out very low bitrate stations (likely dead or poor quality)
        // Stations with 0 bitrate or below 32kbps are often broken
        if (station.bitrate > 0 && station.bitrate < 32) {
          return false;
        }
        
        // Skip stations with obviously invalid URLs
        const url = station.url_resolved || station.url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          return false;
        }
        
        return true;
      });
      
      console.log(`After validation, ${validStations.length} stations remain with valid coordinates and working status`);
      
      // If we got no valid stations, use mock data
      if (validStations.length === 0) {
        console.log('No valid stations found, using mock data');
        return this.getMockStations();
      }
      
      return validStations;
    } catch (error) {
      console.error('Error fetching from public API:', error);
      throw error; // Re-throw to let the caller handle it
    }
  }
  
  /**
   * Fetch stations from API
   */
  private async fetchFromAPI(): Promise<RadioStation[]> {
    if (!this.apiBase) {
      throw new Error('API endpoint not initialized');
    }
    
    // Use mock data if specified
    if (this.useMock) {
      return this.getMockStations();
    }
    
    console.log('Fetching from standard API endpoint...');
    try {
      // Construct the API URL with strict filters for working stations
      const apiUrl = `${this.apiBase}/stations/search?limit=${STATION_LIMIT}&has_geo_info=true&lastcheckok=true&order=clickcount&reverse=true`;
      console.log(`Fetching from alternate endpoint: ${apiUrl}`);
      
      // Direct API call with CORS headers
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Okidogo/1.0',
          'Origin': window.location.origin,
          'Referer': window.location.origin,
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/json'
        },
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const stations: RadioStation[] = await response.json() as any;
      console.log(`Received ${stations.length} stations from standard API endpoint raw`);
      
      const mappedStations = stations.map((raw: any) => {
        const mapped: RadioStation = {
          id: raw.stationuuid || raw.id || raw.uuid || raw.name,
          name: raw.name,
          url: raw.url || raw.url_resolved,
          url_resolved: raw.url_resolved || raw.url,
          homepage: raw.homepage || raw.homepageurl || '',
          favicon: raw.favicon || '',
          tags: raw.tags ? raw.tags.split(',').map((t: string) => t.trim()) : [],
          country: raw.country || '',
          countrycode: raw.countrycode || '',
          state: raw.state || '',
          language: raw.language || '',
          codec: raw.codec || '',
          bitrate: raw.bitrate ? Number(raw.bitrate) : 0,
          votes: raw.votes ? Number(raw.votes) : 0,
          lastcheckok: raw.lastcheckok ?? true,
          lastchecktime: raw.lastchecktime || '',
          lastcheckoktime: raw.lastcheckoktime || '',
          clickcount: raw.clickcount ? Number(raw.clickcount) : 0,
          clicktrend: raw.clicktrend ? Number(raw.clicktrend) : 0,
          geo_lat: raw.geo_lat ?? raw.latitude ?? null,
          geo_long: raw.geo_long ?? raw.longitude ?? null
        };
        return mapped;
      });
      console.log(`Mapped to ${mappedStations.length} stations`);
      
      // Basic validation and cleanup - only include stations likely to work
      const validStations = mappedStations.filter(station => {
        // Must have basic required fields
        if (!station || !station.id || !station.name || !station.url) {
          return false;
        }
        
        // Must have valid coordinates
        if (station.geo_lat == null || station.geo_long == null || 
            station.geo_lat === 0 || station.geo_long === 0) {
          return false;
        }
        
        // Only include stations that were last checked as OK
        if (station.lastcheckok === false) {
          return false;
        }
        
        // Prefer stations with known working codecs
        const supportedCodecs = ['MP3', 'AAC', 'OGG', 'OPUS'];
        if (station.codec && !supportedCodecs.includes(station.codec.toUpperCase())) {
          return false;
        }
        
        // Filter out very low bitrate stations (likely dead or poor quality)
        // Stations with 0 bitrate or below 32kbps are often broken
        if (station.bitrate > 0 && station.bitrate < 32) {
          return false;
        }
        
        // Skip stations with obviously invalid URLs
        const url = station.url_resolved || station.url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          return false;
        }
        
        return true;
      });
      
      console.log(`After validation, ${validStations.length} stations remain with working status`);
      return validStations;
    } catch (error) {
      console.error('Error fetching from standard API:', error);
      throw error; // Re-throw to let the caller handle it
    }
  }
}

// Export as singleton
export const radioStationService = new RadioStationService(); 