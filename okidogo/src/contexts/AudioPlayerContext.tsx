import { createContext, useContext, useRef, useState, type ReactNode, useEffect } from 'react'
import type { RadioStation } from '../types/radioStation'

interface AudioPlayerContextType {
  currentStation: RadioStation | null
  isPlaying: boolean
  volume: number
  error: string | null
  play: (station: RadioStation, skipAutoPlay?: boolean) => Promise<void>
  stop: () => void
  togglePlay: () => Promise<void>
  setVolume: (volume: number) => void
  mute: () => void
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined)

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(1)
  const [error, setError] = useState<string | null>(null)

  // Debug: log key state changes
  useEffect(() => {
    console.log('AudioPlayerContext: Current station changed:', currentStation?.name)
  }, [currentStation])

  useEffect(() => {
    console.log('AudioPlayerContext: isPlaying changed:', isPlaying)
  }, [isPlaying])

  useEffect(() => {
    if (error) {
      console.log('AudioPlayerContext: Error set:', error)
    }
  }, [error])

  const play = async (station: RadioStation, skipAutoPlay?: boolean) => {
    console.log('AudioPlayerContext: play() called with station:', station.name, skipAutoPlay ? '(selection only)' : '')
    
    try {
      setError(null)

      if (currentStation?.id === station.id) {
        console.log('AudioPlayerContext: Same station, toggling playback')
        if (isPlaying) {
          console.log('AudioPlayerContext: Pausing current station')
          audioRef.current?.pause()
          setIsPlaying(false)
        } else if (!skipAutoPlay) {
          console.log('AudioPlayerContext: Resuming current station')
          await audioRef.current?.play()
          setIsPlaying(true)
        }
        return
      }

      // Stop any currently playing audio when selecting a different station
      if (isPlaying) {
        console.log('AudioPlayerContext: Stopping current audio before loading new station')
        audioRef.current?.pause()
        setIsPlaying(false)
      }

      // Load new station
      console.log('AudioPlayerContext: Loading new station:', station.name, 'URL:', station.url_resolved || station.url)
      setCurrentStation(station)

      if (audioRef.current) {
        const sourceUrl = station.url_resolved || station.url
        console.log('AudioPlayerContext: Setting audio source to:', sourceUrl)
        audioRef.current.src = sourceUrl
        audioRef.current.volume = volume

        // Only try to play if we're not just selecting
        if (!skipAutoPlay) {
          try {
            console.log('AudioPlayerContext: Attempting to play audio')
            await audioRef.current.play()
            console.log('AudioPlayerContext: Play successful')
            setIsPlaying(true)
          } catch (err: any) {
            console.warn('AudioPlayerContext: Autoplay prevented or error:', err)
            setIsPlaying(false)
            setError('Click play to start audio (autoplay restricted)')
          }
        } else {
          // Ensure isPlaying is false when skipAutoPlay is true
          setIsPlaying(false)
        }
      } else {
        console.error('AudioPlayerContext: Audio element reference is null')
        setError('Audio player not initialized')
      }
    } catch (err: any) {
      console.error('AudioPlayerContext: Error playing station:', err)
      setError(`Failed to play station: ${err.message}`)
      setIsPlaying(false)
    }
  }

  const stop = () => {
    console.log('AudioPlayerContext: stop() called')
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const togglePlay = async () => {
    console.log('AudioPlayerContext: togglePlay() called')
    if (!currentStation) {
      console.log('AudioPlayerContext: No current station to toggle')
      return
    }

    try {
      if (isPlaying) {
        console.log('AudioPlayerContext: Pausing current station')
        audioRef.current?.pause()
        setIsPlaying(false)
      } else {
        console.log('AudioPlayerContext: Resuming current station')
        await audioRef.current?.play()
        setIsPlaying(true)
        setError(null)
      }
    } catch (err: any) {
      console.error('AudioPlayerContext: Playback error in togglePlay:', err)
      setError(`Playback error: ${err.message}`)
    }
  }

  const setVolume = (newVolume: number) => {
    const vol = Math.max(0, Math.min(1, newVolume))
    setVolumeState(vol)
    if (audioRef.current) {
      audioRef.current.volume = vol
    }
  }

  const mute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted
    }
  }

  // Debug: Log when the component mounts/unmounts
  useEffect(() => {
    console.log('AudioPlayerContext: Provider mounted')
    return () => console.log('AudioPlayerContext: Provider unmounted')
  }, [])

  return (
    <AudioPlayerContext.Provider
      value={{
        currentStation,
        isPlaying,
        volume,
        error,
        play,
        stop,
        togglePlay,
        setVolume,
        mute,
      }}
    >
      <audio
        ref={audioRef}
        onError={(e) => {
          console.error('AudioPlayerContext: Audio error event:', e)
          const audioElement = e.currentTarget
          let errorMessage = 'Failed to play this station.'
          
          // Provide more specific error messages based on error code
          if (audioElement.error) {
            switch (audioElement.error.code) {
              case MediaError.MEDIA_ERR_ABORTED:
                errorMessage = 'Playback was aborted. Try again.'
                break
              case MediaError.MEDIA_ERR_NETWORK:
                errorMessage = 'Network error - station may be offline or have an invalid URL.'
                break
              case MediaError.MEDIA_ERR_DECODE:
                errorMessage = 'Audio format not supported by your browser.'
                break
              case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMessage = 'Station stream format not supported. Try another station.'
                break
              default:
                errorMessage = 'Unknown playback error. Try another station.'
            }
          }
          
          setError(errorMessage)
          setIsPlaying(false)
          
          // Mark station as broken in localStorage for future filtering
          if (currentStation) {
            const brokenStations = JSON.parse(localStorage.getItem('broken-stations') || '{}')
            brokenStations[currentStation.id] = {
              url: currentStation.url_resolved || currentStation.url,
              timestamp: Date.now(),
              errorType: audioElement.error?.code || 'unknown'
            }
            localStorage.setItem('broken-stations', JSON.stringify(brokenStations))
            console.log(`Marked station as broken: ${currentStation.name}`)
          }
        }}
        onPlay={() => {
          console.log('AudioPlayerContext: Audio onPlay event fired')
          setError(null) // Clear errors on successful play
          
          // Remove station from broken list if it successfully plays
          if (currentStation) {
            const brokenStations = JSON.parse(localStorage.getItem('broken-stations') || '{}')
            if (brokenStations[currentStation.id]) {
              delete brokenStations[currentStation.id]
              localStorage.setItem('broken-stations', JSON.stringify(brokenStations))
              console.log(`Removed station from broken list: ${currentStation.name}`)
            }
          }
        }}
        onPause={() => console.log('AudioPlayerContext: Audio onPause event fired')}
        onLoadStart={() => console.log('AudioPlayerContext: Audio onLoadStart event fired')}
        onCanPlay={() => console.log('AudioPlayerContext: Audio onCanPlay event fired')}
        onStalled={() => {
          console.warn('AudioPlayerContext: Audio stream stalled')
          setError('Stream loading slowly - check your connection.')
        }}
        onSuspend={() => console.log('AudioPlayerContext: Audio loading suspended')}
        onWaiting={() => console.log('AudioPlayerContext: Audio buffering...')}
      />
      {children}
    </AudioPlayerContext.Provider>
  )
}

export const useAudioPlayer = (): AudioPlayerContextType => {
  const context = useContext(AudioPlayerContext)
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider')
  }
  return context
}
