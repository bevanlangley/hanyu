import React, { createContext, useContext, useEffect, useState } from 'react'
import { checkZhTWVoiceAvailability } from '@/lib/tts'
import type { VoiceAvailability } from '@/lib/tts'

interface TtsContextValue {
  voiceStatus: VoiceAvailability
  currentlyPlaying: string | null
  setCurrentlyPlaying: (id: string | null) => void
}

const TtsContext = createContext<TtsContextValue | null>(null)

export function TtsProvider({ children }: { children: React.ReactNode }) {
  const [voiceStatus, setVoiceStatus] = useState<VoiceAvailability>('zh-TW')
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)

  useEffect(() => {
    checkZhTWVoiceAvailability().then(setVoiceStatus)
  }, [])

  return (
    <TtsContext.Provider value={{ voiceStatus, currentlyPlaying, setCurrentlyPlaying }}>
      {children}
    </TtsContext.Provider>
  )
}

export function useTts() {
  const ctx = useContext(TtsContext)
  if (!ctx) throw new Error('useTts must be used within TtsProvider')
  return ctx
}
