import { useState, useEffect, useRef } from 'react'
import { useRadioStations } from '../hooks/useRadioStations'
import { useAudioPlayer } from '../contexts/AudioPlayerContext'

/**
 * Direct debug component for audio testing
 */
const AudioDebugTest = () => {
  console.log('Rendering AudioDebugTest component')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [localPlaying, setLocalPlaying] = useState(false)
  const [directUrl, setDirectUrl] = useState('')
  
  const { geoStations, isLoading } = useRadioStations()
  const {
    currentStation,
    isPlaying,
    error: contextError,
    play,
    togglePlay,
    stop
  } = useAudioPlayer()
  
  // Log important state changes
  useEffect(() => {
    console.log('AudioDebugTest: Current station:', currentStation)
    console.log('AudioDebugTest: Context isPlaying:', isPlaying)
    console.log('AudioDebugTest: Context error:', contextError)
  }, [currentStation, isPlaying, contextError])
  
  // Play first station directly through context
  const playFirstStation = async () => {
    if (geoStations.length > 0) {
      try {
        console.log('AudioDebugTest: Attempting to play first station via context:', geoStations[0])
        await play(geoStations[0])
        console.log('AudioDebugTest: Play called successfully')
      } catch (err) {
        console.error('AudioDebugTest: Error playing station via context:', err)
      }
    } else {
      console.error('AudioDebugTest: No stations available')
    }
  }
  
  // Play using direct audio element
  const playDirect = async () => {
    try {
      if (!audioRef.current) {
        console.error('AudioDebugTest: No audio element reference')
        return
      }
      
      console.log('AudioDebugTest: Playing directly with URL:', directUrl)
      setLocalError(null)
      
      if (localPlaying) {
        audioRef.current.pause()
        setLocalPlaying(false)
      } else {
        audioRef.current.src = directUrl
        try {
          await audioRef.current.play()
          setLocalPlaying(true)
          console.log('AudioDebugTest: Direct play successful')
        } catch (err: any) {
          console.error('AudioDebugTest: Direct play error:', err)
          setLocalError(`Play error: ${err.message}`)
        }
      }
    } catch (err: any) {
      setLocalError(`General error: ${err.message}`)
      console.error('AudioDebugTest: General error:', err)
    }
  }
  
  return (
    <div style={{
      position: 'absolute',
      top: '80px',
      left: '20px',
      zIndex: 999,
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '15px',
      borderRadius: '10px',
      border: '2px solid #ff5722',
      maxWidth: '300px',
      fontSize: '12px',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>
        🔊 Audio Debug Panel
      </h2>
      
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '5px' }}>Context Audio Status:</h3>
        <p>Current Station: {currentStation ? currentStation.name : 'None'}</p>
        <p>Playing: {isPlaying ? 'Yes' : 'No'}</p>
        {contextError && <p style={{ color: 'red' }}>Error: {contextError}</p>}
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button 
            onClick={playFirstStation}
            style={{
              backgroundColor: '#4CAF50',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Play First Station via Context
          </button>
          
          <button 
            onClick={togglePlay}
            style={{
              backgroundColor: '#2196F3',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Toggle Play
          </button>
          
          <button 
            onClick={stop}
            style={{
              backgroundColor: '#f44336',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Stop
          </button>
        </div>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '5px' }}>Direct Audio Test:</h3>
        <div style={{ marginBottom: '10px' }}>
          <input 
            type="text" 
            value={directUrl} 
            onChange={(e) => setDirectUrl(e.target.value)}
            placeholder="Enter station URL to test"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              marginBottom: '5px'
            }}
          />
          {geoStations.length > 0 && (
            <button
              onClick={() => setDirectUrl(geoStations[0].url_resolved || geoStations[0].url)}
              style={{
                backgroundColor: '#9c27b0',
                border: 'none',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Use First Station URL
            </button>
          )}
        </div>
        
        <p>Direct Status: {localPlaying ? 'Playing' : 'Stopped'}</p>
        {localError && <p style={{ color: 'red' }}>Error: {localError}</p>}
        
        <button 
          onClick={playDirect}
          disabled={!directUrl}
          style={{
            backgroundColor: directUrl ? '#ff9800' : '#cccccc',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: directUrl ? 'pointer' : 'not-allowed'
          }}
        >
          {localPlaying ? 'Pause' : 'Play'} Direct Audio
        </button>
      </div>
      
      <div>
        <h3 style={{ fontSize: '16px', marginBottom: '5px' }}>Station Data:</h3>
        <p>Total Stations: {geoStations.length}</p>
        {isLoading ? (
          <p>Loading stations...</p>
        ) : geoStations.length > 0 ? (
          <div>
            <p>First Station:</p>
            <pre style={{ 
              fontSize: '12px', 
              maxHeight: '100px', 
              overflow: 'auto',
              background: '#333',
              padding: '5px',
              borderRadius: '4px'
            }}>
              {JSON.stringify({
                name: geoStations[0].name,
                id: geoStations[0].id,
                url: geoStations[0].url,
                url_resolved: geoStations[0].url_resolved
              }, null, 2)}
            </pre>
          </div>
        ) : (
          <p>No stations loaded</p>
        )}
      </div>
      
      {/* Direct audio element for testing */}
      <audio 
        ref={audioRef}
        onError={(e) => {
          console.error('AudioDebugTest: Direct audio error:', e)
          setLocalError('Failed to play audio. Make sure the URL is correct and accessible.')
          setLocalPlaying(false)
        }}
        controls 
        style={{
          marginTop: '15px',
          width: '100%'
        }}
      />
    </div>
  )
}

export default AudioDebugTest 