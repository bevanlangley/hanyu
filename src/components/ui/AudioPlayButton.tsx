import { Volume2, VolumeX, Pause } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { speakMandarin } from '@/lib/tts'
import { useTts } from '@/context/TtsContext'

interface AudioPlayButtonProps {
  text: string
  id: string
  className?: string
}

export function AudioPlayButton({ text, id, className }: AudioPlayButtonProps) {
  const { voiceStatus, currentlyPlaying, setCurrentlyPlaying } = useTts()
  const [cancelFn, setCancelFn] = useState<(() => void) | null>(null)
  const isPlaying = currentlyPlaying === id
  const unavailable = voiceStatus === 'unavailable'

  useEffect(() => {
    if (!isPlaying && cancelFn) {
      cancelFn()
      setCancelFn(null)
    }
  }, [isPlaying])

  function handleClick() {
    if (unavailable) return

    if (isPlaying) {
      cancelFn?.()
      setCancelFn(null)
      setCurrentlyPlaying(null)
      return
    }

    // Stop anything else playing
    setCurrentlyPlaying(id)
    const cancel = speakMandarin(text, () => setCurrentlyPlaying(null))
    setCancelFn(() => cancel)
  }

  const label = unavailable
    ? 'TTS unavailable'
    : isPlaying
    ? 'Pause'
    : `Play ${text}`

  return (
    <button
      type="button"
      aria-label={label}
      disabled={unavailable}
      onClick={handleClick}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
        'text-grey-500 hover:bg-grey-100 hover:text-grey-700',
        'dark:text-grey-400 dark:hover:bg-grey-700 dark:hover:text-grey-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50',
        'disabled:cursor-not-allowed disabled:opacity-40',
        isPlaying && 'text-primary-500 dark:text-primary-400',
        className
      )}
    >
      {unavailable ? (
        <VolumeX className="h-4 w-4" />
      ) : isPlaying ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </button>
  )
}
