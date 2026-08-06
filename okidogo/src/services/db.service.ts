import type { StationCache } from '../types/radioStation';

const DB_NAME = 'okidogo-radio';
const DB_VERSION = 1;
const STATIONS_STORE = 'stations';

class DBService {
  private db: IDBDatabase | null = null;
  
  /**
   * Initialize the database
   */
  async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = (event) => {
        console.error('IndexedDB error:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };
      
      // Called when the database is created or version is upgraded
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(STATIONS_STORE)) {
          db.createObjectStore(STATIONS_STORE, { keyPath: 'id' });
        }
      };
    });
  }
  
  /**
   * Store stations cache in IndexedDB
   */
  async saveStations(cache: StationCache): Promise<void> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STATIONS_STORE], 'readwrite');
        const store = transaction.objectStore(STATIONS_STORE);
        
        // Clear existing data
        store.clear();
        
        // Store stations cache
        const request = store.put({
          id: 'stations-cache',
          ...cache
        });
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => {
          console.error('Error saving stations to IndexedDB:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error('Failed to save stations to IndexedDB:', error);
      throw error;
    }
  }
  
  /**
   * Get stations cache from IndexedDB
   */
  async getStations(): Promise<StationCache | null> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STATIONS_STORE], 'readonly');
        const store = transaction.objectStore(STATIONS_STORE);
        const request = store.get('stations-cache');
        
        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            // Remove the ID field we added for storage
            const { id, ...cache } = result;
            resolve(cache as StationCache);
          } else {
            resolve(null);
          }
        };
        
        request.onerror = (event) => {
          console.error('Error getting stations from IndexedDB:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error('Failed to get stations from IndexedDB:', error);
      return null;
    }
  }
  
  /**
   * Clear all cached data from IndexedDB
   */
  async clearCache(): Promise<void> {
    try {
      const db = await this.initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STATIONS_STORE], 'readwrite');
        const store = transaction.objectStore(STATIONS_STORE);
        const request = store.clear();
        
        request.onsuccess = () => {
          console.log('Cache cleared successfully from IndexedDB');
          resolve();
        };
        
        request.onerror = (event) => {
          console.error('Error clearing cache from IndexedDB:', (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error('Failed to clear cache from IndexedDB:', error);
      throw error;
    }
  }
}

// Export as singleton
export const dbService = new DBService(); 