import { Play, Pause, Square, SkipBack, SkipForward, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DrillMode } from '@/features/drilling/useDrilling'
import { cn } from '@/lib/utils'

interface DrillingControlsProps {
  mode: DrillMode
  currentIndex: number
  totalPhrases: number
  onPlay: () => void
  onPause: () => void
  onResume: () => void
  onStop: () => void
  onNext: () => void
  onPrevious: () => void
  onSpeak: () => void
  disabled?: boolean
}

export function DrillingControls({
  mode,
  currentIndex,
  totalPhrases,
  onPlay,
  onPause,
  onResume,
  onStop,
  onNext,
  onPrevious,
  onSpeak,
  disabled,
}: DrillingControlsProps) {
  const isIdle = mode === 'idle'
  const isPlaying = mode === 'playing'
  const isPaused = mode === 'paused'

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Progress */}
      {!isIdle && (
        <p className="text-sm text-grey-500 dark:text-grey-400">
          {currentIndex + 1} / {totalPhrases}
        </p>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous phrase"
          disabled={disabled || currentIndex === 0 || isPlaying}
          onClick={onPrevious}
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        {isIdle || isPaused ? (
          <Button
            size="icon"
            aria-label={isIdle ? 'Start auto-play' : 'Resume auto-play'}
            disabled={disabled || totalPhrases === 0}
            onClick={isIdle ? onPlay : onResume}
            className="h-11 w-11"
          >
            <Play className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            size="icon"
            aria-label="Pause auto-play"
            disabled={disabled}
            onClick={onPause}
            className="h-11 w-11"
          >
            <Pause className="h-5 w-5" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          aria-label="Next phrase"
          disabled={disabled || currentIndex >= totalPhrases - 1 || isPlaying}
          onClick={onNext}
        >
          <SkipForward className="h-4 w-4" />
        </Button>

        {!isIdle && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Stop and reset"
            disabled={disabled}
            onClick={onStop}
          >
            <Square className="h-4 w-4" />
          </Button>
        )}

        {isIdle && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Speak current phrase"
            disabled={disabled || totalPhrases === 0}
            onClick={onSpeak}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Progress bar */}
      {!isIdle && totalPhrases > 1 && (
        <div
          role="progressbar"
          aria-valuenow={currentIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalPhrases}
          className="h-1 w-48 overflow-hidden rounded-full bg-grey-200 dark:bg-grey-700"
        >
          <div
            className={cn('h-full rounded-full bg-primary-500 transition-all dark:bg-primary-400')}
            style={{ width: `${((currentIndex + 1) / totalPhrases) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
