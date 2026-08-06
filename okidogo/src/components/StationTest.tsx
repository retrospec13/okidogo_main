import { useRadioStations } from '../hooks/useRadioStations';
import { motion } from 'framer-motion';

const StationTest = () => {
  const { 
    stations, 
    geoStations, 
    isLoading, 
    error, 
    refreshStations 
  } = useRadioStations();

  return (
    <motion.div 
      className="absolute top-0 right-0 m-4 p-6 bg-black bg-opacity-70 backdrop-blur-sm rounded-lg text-white max-w-md z-20 overflow-auto max-h-[90vh]"
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-bold mb-4">Radio Station Service Test</h2>
      
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          <p>Loading stations...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900 bg-opacity-50 p-4 rounded">
          <p className="text-red-300">Error: {error.message}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between">
            <div>
              <span className="text-xs text-gray-400">All Stations</span>
              <p className="text-2xl font-bold">{stations.length}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">With Geo Location</span>
              <p className="text-2xl font-bold">{geoStations.length}</p>
            </div>
            <button 
              onClick={refreshStations}
              className="px-3 py-1 bg-blue-700 hover:bg-blue-600 rounded text-sm"
            >
              Refresh
            </button>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Sample Stations (First 5):</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              {geoStations.slice(0, 5).map(station => (
                <li key={station.id} className="truncate">
                  <span className="font-medium">{station.name}</span>
                  <span className="text-gray-400"> ({station.country})</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="text-xs text-gray-400 mt-4">
            Data cached for 24 hours in memory and IndexedDB
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StationTest; 