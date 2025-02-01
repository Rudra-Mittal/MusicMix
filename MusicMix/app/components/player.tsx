'use client'

import { useState, useRef, useEffect, useCallback, MutableRefObject } from 'react'
import YouTube from 'react-youtube'
import { motion, AnimatePresence } from 'framer-motion'
import * as Slider from '@radix-ui/react-slider'
import { Play, Pause, Rewind, FastForward, Volume2, VolumeX } from 'lucide-react'
import { Socket } from 'socket.io-client'
import { DefaultEventsMap } from 'socket.io'
type YouTubePlayerProps = {
  videoId: string
  thumbnailUrl: string
  socket:MutableRefObject<Socket<DefaultEventsMap, DefaultEventsMap>>
}

const MusicBars = () => (
  <div className="flex justify-center space-x-1 h-4 mb-2">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-1 bg-primary"
        animate={{
          height: ['20%', '40%', '100%','40%','20%'],
        }}
        transition={{
          repeat: Infinity,
          repeatType: 'reverse',
          duration: 1,
          delay:i*0.3
        }}
      />
    ))}
  </div>
)

export default function YouTubeAudioPlayer({ videoId, thumbnailUrl,socket }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const playerRef = useRef<YouTube>(null)
  useEffect(()=>{
    console.log("socket",socket)
  },[])
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && playerRef.current?.internalPlayer) {
        playerRef.current.internalPlayer.getCurrentTime().then((time: number) => {          
          setCurrentTime(time)
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying])

  const togglePlayPause =useCallback (() => {
    console.log("togglePlayPause",isPlaying)
    socket?.current.emit("realTime", {seekTime:currentTime, isPlaying:!isPlaying})
  }, [isPlaying])

  const seekForward = useCallback(() => {
    if (playerRef.current?.internalPlayer) {
      playerRef.current.internalPlayer.seekTo(currentTime + 5, true)
      socket?.current.emit("realTime", {seekTime:currentTime + 5,isPlaying:isPlaying})
    }
  }, [currentTime])
  
  const seekBackward = useCallback(() => {
    if (playerRef.current?.internalPlayer) {
      playerRef.current.internalPlayer.seekTo(currentTime - 5, true)
      socket?.current.emit("realTime", {seekTime:currentTime - 5,isPlaying:isPlaying})
    }
  }, [currentTime])

  const onReady = (event: { target: any }) => {
    setDuration(event.target.getDuration())
  }

  const onStateChange = (event: { target: any, data: number }) => {
    console.log("state chnage",event.data)
    if (event.data === YouTube.PlayerState.PLAYING) {
      setIsPlaying(true)
    } else if (event.data === YouTube.PlayerState.PAUSED) {
      setIsPlaying(false)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  const toggleMute = useCallback(() => {
    if (playerRef.current?.internalPlayer) {
      if (isMuted) {
        playerRef.current.internalPlayer.unMute()
        playerRef.current.internalPlayer.setVolume(volume)
      } else {
        playerRef.current.internalPlayer.mute()
      }
      setIsMuted(!isMuted)
    }
  }, [isMuted, volume])

  const handleVolumeChange = useCallback((newVolume: number[]) => {
    if (playerRef.current?.internalPlayer) {
      playerRef.current.internalPlayer.setVolume(newVolume[0])
      setVolume(newVolume[0])
      if (newVolume[0] > 0 && isMuted) {
        setIsMuted(false)
        playerRef.current.internalPlayer.unMute()
      }
    }
  }, [isMuted])
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isPlaying) {
        playerRef.current?.internalPlayer.playVideo();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);
  useEffect(()=>{
    socket?.current.on("realTime", (data) => {
      if (playerRef.current?.internalPlayer) {
        playerRef.current.internalPlayer.seekTo(data.seekTime, true)
      }
      console.log("useEffect",data.isPlaying)
      setIsPlaying(data.isPlaying)   
      if (!data.isPlaying) {
        playerRef.current?.internalPlayer.pauseVideo()
      } else {
        playerRef.current?.internalPlayer.playVideo()
      }
    });
  },[])
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return // Ignore keypresses in input fields
      }
      switch (event.key.toLowerCase()) {
        case ' ':
          event.preventDefault()
          togglePlayPause()
          break
        case 'm':
          toggleMute()
          break
        case 'arrowleft':
          seekBackward()
          break
        case 'arrowright':
          seekForward()
          break
        case 'arrowup':
          handleVolumeChange([Math.min(volume + 5, 100)])
          break
        case 'arrowdown':
          handleVolumeChange([Math.max(volume - 5, 0)])
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [togglePlayPause, toggleMute, seekBackward, seekForward, handleVolumeChange, volume])

  if (!videoId) {
    return (
      <div className="flex items-center justify-center h-64 bg-background rounded-xl">
        <h1 className="text-2xl font-bold text-foreground">No Active Stream</h1>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto bg-background rounded-xl shadow-lg overflow-hidden"
    >
      <div className="relative">
        {isPlaying && <MusicBars />}
        <motion.img
          src={thumbnailUrl}
          alt="Video thumbnail"
          className="w-full h-48 object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        <AnimatePresence>
          {!isPlaying && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Play className="w-16 h-16 text-primary"  onClick={togglePlayPause}   />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
       </div>
      <div className="p-6">
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5 group"
          value={[currentTime]}
          max={duration}
          step={1}
          aria-label="Time"
          onValueChange={(value) => {
            if (playerRef.current?.internalPlayer) {
              socket?.current.emit("realTime", {seekTime:value[0],isPlaying:isPlaying})
              console.log(value[0])
            }
          }}
        >
          <Slider.Track className="bg-secondary relative grow rounded-full h-1 group-hover:h-2 transition-all">
            <Slider.Range className="absolute bg-primary rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="hidden group-hover:block w-4 h-4 bg-primary rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-transform duration-200 ease-out hover:scale-110" />
        </Slider.Root>
        <div className="flex justify-between text-sm text-foreground mt-1 font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="flex justify-between items-center mt-4 space-x-4">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={seekBackward}
              className="p-2 rounded-full bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
              aria-label="Seek backward 5 seconds"
            >
              <Rewind className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlayPause}
              className="p-4 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={seekForward}
              className="p-2 rounded-full bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
              aria-label="Seek forward 5 seconds"
            >
              <FastForward className="w-5 h-5" />
            </motion.button>
          </div>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMute}
              className="p-2 rounded-full bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </motion.button>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-24 h-5"
              value={[isMuted ? 0 : volume]}
              max={100}
              step={1}
              aria-label="Volume"
              onValueChange={handleVolumeChange}
            >
              <Slider.Track className="bg-secondary relative grow rounded-full h-1">
                <Slider.Range className="absolute bg-primary rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-3 h-3 bg-primary rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50" />
            </Slider.Root>
          </div>
        </div>
      </div>
      <div className="hidden">
        <YouTube
          videoId={videoId}
          opts={{
            height: '0',
            width: '0',
            playerVars: {
              autoplay: 1,
              
            },
          }}
          onReady={onReady}
          onStateChange={onStateChange}
          ref={playerRef}
        />
      </div>
    </motion.div>
  )
}

