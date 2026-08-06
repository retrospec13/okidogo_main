import { useState } from 'react'
import Globe from './components/Globe'
import StationTest from './components/StationTest'
import MiniPlayer from './components/MiniPlayer'
import { CommandPalette } from './components/CommandPalette'
import CommandPaletteShortcut from './components/CommandPaletteShortcut'
import { motion } from 'framer-motion'
import { AudioPlayerProvider } from './contexts/AudioPlayerContext'
import { FavoritesProvider } from './contexts/FavoritesContext'

import './App.css'

function App() {
  const [showControls, setShowControls] = useState(true)
  const [showStationTest, setShowStationTest] = useState(true)
  
  return (
    <AudioPlayerProvider>
      <FavoritesProvider>
        <CommandPalette>
        <div className="relative h-screen w-full overflow-hidden">
          {/* Globe component takes full screen */}
          <Globe />
          
          {/* Command Palette Shortcut */}
          <CommandPaletteShortcut />
          
          {/* Overlay UI */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute top-0 left-0 p-4 z-10"
          >
            <h1 className="text-4xl font-bold text-white mb-6">okidogo</h1>
            
            {showControls && (
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-black bg-opacity-50 backdrop-blur-sm p-4 rounded-lg text-white max-w-xs"
              >
                <h2 className="text-xl font-semibold mb-2">Controls</h2>
                <ul className="text-sm space-y-1">
                  <li>• Drag to rotate the globe</li>
                  <li>• Scroll to zoom in/out</li>
                  <li>• Press +/- keys to zoom</li>
                  <li>• Press Cmd+K / Ctrl+K for commands</li>
                </ul>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button 
                    onClick={() => setShowControls(false)}
                    className="text-xs text-blue-300 hover:text-blue-100"
                  >
                    Hide Controls
                  </button>
                  <button 
                    onClick={() => setShowStationTest(!showStationTest)}
                    className="text-xs text-blue-300 hover:text-blue-100"
                  >
                    {showStationTest ? 'Hide' : 'Show'} Station Test
                  </button>
                </div>
              </motion.div>
            )}
            
            {!showControls && (
              <button 
                onClick={() => setShowControls(true)}
                className="mt-2 bg-black bg-opacity-50 backdrop-blur-sm px-3 py-1 rounded text-white text-sm"
              >
                Show Controls
              </button>
            )}
          </motion.div>
          
          {/* Station Test Component */}
          {showStationTest && <StationTest />}
          
          {/* Mini-Player */}
          <MiniPlayer />
        </div>
      </CommandPalette>
      </FavoritesProvider>
    </AudioPlayerProvider>
  )
}

export default App
