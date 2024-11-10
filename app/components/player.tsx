'use client'
import { useState, useRef, useEffect } from 'react'
import YouTube from 'react-youtube'
import { motion, AnimatePresence } from 'framer-motion'
import * as Slider from '@radix-ui/react-slider'
import { Play, Pause,  Rewind, FastForward } from 'lucide-react'

type YouTubePlayerProps = {
  videoId: string
  thumbnailUrl: string
}

export default function YouTubeAudioPlayer({ videoId, thumbnailUrl }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const playerRef = useRef<YouTube>(null)
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

  const togglePlayPause = () => {
    if (isPlaying) {
      playerRef.current?.internalPlayer.pauseVideo()
    } else {
      playerRef.current?.internalPlayer.playVideo()
    }
    setIsPlaying(!isPlaying)
  }

  const seekForward = () => {
    if (playerRef.current?.internalPlayer) {
      playerRef.current.internalPlayer.seekTo(currentTime + 5, true)
    }
  }

  const seekBackward = () => {
    if (playerRef.current?.internalPlayer) {
      playerRef.current.internalPlayer.seekTo(currentTime - 5, true)
    }
  }

  const onReady = (event: { target: any }) => {
    setDuration(event.target.getDuration())
  }

  const onStateChange = (event: { target: any, data: number }) => {
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
  if(!videoId){
    return <div>
      <h1>Video not found</h1>
    </div>
  }
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="relative">
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
              <Play className="w-16 h-16 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="p-4">
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[currentTime]}
          max={duration}
          step={1}
          aria-label="Time"
          onValueChange={(value) => {
            if (playerRef.current?.internalPlayer) {
              playerRef.current.internalPlayer.seekTo(value[0], true)
            }
          }}
        >
          <Slider.Track className="bg-gray-200 relative grow rounded-full h-1">
            <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb className="block w-5 h-5 bg-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </Slider.Root>
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="flex justify-center items-center mt-4 space-x-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={seekBackward}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Seek backward 5 seconds"
          >
            <Rewind />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={togglePlayPause}
            className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={seekForward}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Seek forward 5 seconds"
          >
            <FastForward />
          </motion.button>
        </div>
      </div>
      <div className="hidden">
        <YouTube
          videoId={videoId}
          opts={{
            height: '0',
            width: '0',
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
            },
          }}
          onReady={onReady}
          onStateChange={onStateChange}
          ref={playerRef}
        />
      </div>
    </div>
  )
}