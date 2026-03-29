import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchPhrasesBySeed } from '@/features/phrases/phrasesService'
import { speakMandarin } from '@/lib/tts'
import { useTts } from '@/context/TtsContext'
import type { Phrase } from '@/lib/database.types'

export type DrillMode = 'idle' | 'playing' | 'paused'

interface UseDrillingOptions {
  seedId: string | null
}

export function useDrilling({ seedId }: UseDrillingOptions) {
  const { voiceStatus, setCurrentlyPlaying } = useTts()
  const [phrases, setPhrases] = useState<Phrase[]>([])
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mode, setMode] = useState<DrillMode>('idle')
  const cancelRef = useRef<(() => void) | null>(null)
  const autoPlayRef = useRef(false)

  useEffect(() => {
    if (!seedId) return
    setLoading(true)
    fetchPhrasesBySeed(seedId)
      .then(data => {
        setPhrases(data)
        setCurrentIndex(0)
        setMode('idle')
      })
      .finally(() => setLoading(false))
  }, [seedId])

  const currentPhrase = phrases[currentIndex] ?? null

  const stopAudio = useCallback(() => {
    cancelRef.current?.()
    cancelRef.current = null
    setCurrentlyPlaying(null)
  }, [setCurrentlyPlaying])

  const speakCurrent = useCallback((phrase: Phrase, onDone: () => void) => {
    if (voiceStatus === 'unavailable') { onDone(); return }
    setCurrentlyPlaying(phrase.id)
    const cancel = speakMandarin(phrase.mandarin, () => {
      setCurrentlyPlaying(null)
      onDone()
    })
    cancelRef.current = cancel
  }, [voiceStatus, setCurrentlyPlaying])

  const advanceToNext = useCallback(() => {
    setCurrentIndex(prev => {
      const next = prev + 1
      if (next >= phrases.length) {
        setMode('idle')
        autoPlayRef.current = false
        return 0
      }
      return next
    })
  }, [phrases.length])

  // Auto-play effect: when mode is 'playing' and index changes, speak current phrase
  useEffect(() => {
    if (mode !== 'playing' || !currentPhrase) return
    autoPlayRef.current = true
    speakCurrent(currentPhrase, () => {
      if (autoPlayRef.current) {
        advanceToNext()
      }
    })
    return () => {
      stopAudio()
    }
  }, [mode, currentIndex]) // intentionally only index + mode, not the callbacks

  function play() {
    stopAudio()
    setMode('playing')
  }

  function pause() {
    autoPlayRef.current = false
    stopAudio()
    setMode('paused')
  }

  function resume() {
    setMode('playing')
  }

  function stop() {
    autoPlayRef.current = false
    stopAudio()
    setMode('idle')
    setCurrentIndex(0)
  }

  function next() {
    stopAudio()
    autoPlayRef.current = false
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(i => i + 1)
    }
  }

  function previous() {
    stopAudio()
    autoPlayRef.current = false
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1)
    }
  }

  function speakCurrentManually() {
    if (!currentPhrase) return
    stopAudio()
    speakCurrent(currentPhrase, () => {})
  }

  return {
    phrases,
    loading,
    currentPhrase,
    currentIndex,
    mode,
    play,
    pause,
    resume,
    stop,
    next,
    previous,
    speakCurrentManually,
  }
}
