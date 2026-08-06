import { useEffect, useState } from 'react'
import {
  AlarmClock,
  DollarSign,
  Link as LinkIcon,
  SunMedium,
  Maximize2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import { useAudioPlayer } from '../contexts/AudioPlayerContext'
import { useFavorites } from '../contexts/FavoritesContext'

const MiniPlayer: React.FC = () => {
  const {
    currentStation,
    isPlaying,
    togglePlay,
    mute,
    volume,
    setVolume,
  } = useAudioPlayer()
  const { isFavorite, toggleFavorite } = useFavorites()

  const [isMuted, setIsMuted] = useState(false)
  const [time, setTime] = useState<string>(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))

  // Update clock every minute
  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  const handleMuteToggle = () => {
    mute()
    setIsMuted(!isMuted)
  }

  const handleCopyUrl = () => {
    if (!currentStation?.url_resolved && !currentStation?.url) return
    const url = currentStation.url_resolved || currentStation.url
    navigator.clipboard.writeText(url).catch((err) => console.error('Copy failed', err))
  }

  const handleRefreshStations = () => {
    if (confirm('Clear station cache and reload fresh data from RadioBrowser API? This will reload the page.')) {
      // Delete IndexedDB directly and reload immediately to avoid race condition
      indexedDB.deleteDatabase('okidogo-radio')
      // Reload immediately - don't wait for async operations
      window.location.reload()
    }
  }

  return (
    <div 
      style={{
        position: 'fixed',
        left: '0',
        right: '0',
        bottom: '0',
        display: 'flex',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#a1a1aa' }}>
          <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlarmClock size={16} /> {time}
          </span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="icon-btn" onClick={handleCopyUrl} title="Copy stream URL">
              <LinkIcon size={16} />
            </button>
            <button className="icon-btn" onClick={handleRefreshStations} title="Refresh station database (fetch fresh data)">
              <RefreshCw size={16} style={{ color: '#eab308' }} />
            </button>
            <button className="icon-btn" title="Donate (coming soon)">
              <DollarSign size={16} style={{ color: '#10b981' }} />
            </button>
            <button className="icon-btn" title="Theme toggle (coming soon)">
              <SunMedium size={16} />
            </button>
            <button className="icon-btn" title="Expand (coming soon)">
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentStation ? currentStation.name : 'No Station Selected'}
          </h3>
          {currentStation?.country && (
            <p style={{ fontSize: '14px', color: '#38bdf8', marginTop: '4px' }}>
              {currentStation.country}
            </p>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#a1a1aa' }}>
          {/* Play / Pause */}
          <button 
            className="icon-btn"
            style={{ color: 'white' }}
            onClick={togglePlay} 
            disabled={!currentStation}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          {/* Volume slider + mute */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="icon-btn" onClick={handleMuteToggle} title="Mute">
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              style={{ width: '96px', accentColor: '#10b981' }}
            />
          </div>

          {/* Favorites button */}
          <button 
            className="icon-btn" 
            onClick={() => currentStation && toggleFavorite(currentStation)} 
            disabled={!currentStation}
            title={currentStation && isFavorite(currentStation.id) ? "Remove from favorites" : "Add to favorites"}
            style={{ color: currentStation && isFavorite(currentStation.id) ? '#ef4444' : '#a1a1aa' }}
            aria-label={currentStation && isFavorite(currentStation.id) ? "Remove from favorites" : "Add to favorites"}
            data-station-id={currentStation?.id}
            data-station-name={currentStation?.name}
            data-station-url={currentStation?.url || currentStation?.url_resolved}
          >
            <Heart size={20} />
          </button>

          {/* Map pin placeholder */}
          <button className="icon-btn" title="Locate on map (coming soon)">
            <MapPin size={20} />
          </button>

          {/* Expand placeholder */}
          <button className="icon-btn" title="Expand (coming soon)">
            <Maximize2 size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default MiniPlayer
