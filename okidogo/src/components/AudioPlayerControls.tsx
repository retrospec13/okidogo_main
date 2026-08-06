import { useState, useEffect } from 'react'
import { useRadioStations } from '../hooks/useRadioStations'
import { useAudioPlayer } from '../contexts/AudioPlayerContext'
import type { RadioStation } from '../types/radioStation'

/**
 * AudioPlayerControls component
 * Uses inline styles to ensure consistent rendering
 */
const AudioPlayerControls = () => {
  console.log('Rendering AudioPlayerControls')
  
  const { geoStations, isLoading: stationsLoading, error: stationsError } = useRadioStations()
  const {
    currentStation,
    isPlaying,
    volume,
    error: audioError,
    play,
    togglePlay,
    stop,
    setVolume,
  } = useAudioPlayer()

  const [sampleCount] = useState(5)
  
  // Debug logging
  useEffect(() => {
    console.log('AudioPlayerControls: Current station:', currentStation)
    console.log('AudioPlayerControls: isPlaying:', isPlaying)
    if (audioError) {
      console.log('AudioPlayerControls: audioError:', audioError)
    }
  }, [currentStation, isPlaying, audioError])

  // Handle station play
  const handleStationPlay = async (station: RadioStation) => {
    console.log('AudioPlayerControls: Play button clicked for station:', station.name, 'ID:', station.id);
    
    // Create a complete station object in case some properties are missing
    const stationToPlay = {
      ...station, 
      // Ensure critical fields exist
      url_resolved: station.url_resolved || station.url,
      url: station.url || '',
      id: station.id || '',
      name: station.name || 'Unknown'
    };
    
    try {
      console.log('AudioPlayerControls: Calling play() with:', stationToPlay.name, stationToPlay.url_resolved);
      await play(stationToPlay);
      console.log('AudioPlayerControls: Play function called');
    } catch (err) {
      console.error('AudioPlayerControls: Error playing station:', err);
    }
  };

  return (
    <div 
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        margin: '0',
        padding: '1.5rem',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        borderRadius: '0.5rem',
        color: 'white',
        minWidth: '300px',
        maxWidth: '500px',
        zIndex: 50,
        overflow: 'visible',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
        textAlign: 'center'
      }}
    >
      <h2 style={{ 
        fontSize: '1.25rem', 
        fontWeight: 'bold', 
        marginBottom: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        paddingBottom: '0.5rem'
      }}>
        Audio Player
      </h2>

      {stationsLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <div 
            style={{ 
              animation: 'spin 1s linear infinite',
              height: '1.25rem',
              width: '1.25rem',
              borderRadius: '50%',
              borderWidth: '2px',
              borderStyle: 'solid',
              borderColor: '#3b82f6',
              borderTopColor: 'transparent'
            }} 
          />
          <p>Loading stations…</p>
        </div>
      ) : stationsError ? (
        <div style={{ backgroundColor: 'rgba(127, 29, 29, 0.5)', padding: '1rem', borderRadius: '0.25rem' }}>
          <p style={{ color: '#fca5a5' }}>Error: {stationsError.message}</p>
        </div>
      ) : (
        <>
          {/* Playback status */}
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#d1d5db' }}>Current Station:</p>
            <p style={{ fontWeight: 600, fontSize: '1.125rem', margin: '0.5rem 0' }}>
              {currentStation ? currentStation.name : 'None selected'}
            </p>
            {currentStation && (
              <p style={{ fontSize: '0.875rem', color: '#d1d5db' }}>
                {currentStation.country}
              </p>
            )}
            <p style={{ 
              fontSize: '0.875rem', 
              marginTop: '0.5rem',
              padding: '0.25rem 0.5rem',
              display: 'inline-block',
              borderRadius: '1rem',
              backgroundColor: isPlaying ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'
            }}>
              Status: <span style={{ color: isPlaying ? '#4ade80' : '#fbbf24' }}>{isPlaying ? 'Playing' : 'Paused'}</span>
            </p>
            {audioError && (
              <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.25rem' }}>{audioError}</p>
            )}
          </div>

          {/* Global controls */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '1rem', 
            marginBottom: '1rem' 
          }}>
            <button
              onClick={togglePlay}
              style={{ 
                padding: '0.5rem 1.5rem', 
                backgroundColor: isPlaying ? '#4f46e5' : '#3b82f6', 
                borderRadius: '0.25rem',
                fontSize: '1rem',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={stop}
              style={{ 
                padding: '0.5rem 1.5rem', 
                backgroundColor: '#dc2626', 
                borderRadius: '0.25rem',
                fontSize: '1rem',
                cursor: 'pointer',
                border: 'none'
              }}
            >
              Stop
            </button>
          </div>

          {/* Volume control */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '0.5rem' 
          }}>
            <label htmlFor="vol" style={{ fontSize: '0.875rem' }}>
              Volume
            </label>
            <input
              id="vol"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ 
                width: '150px',
                height: '0.5rem',
                accentColor: '#3b82f6' 
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default AudioPlayerControls 