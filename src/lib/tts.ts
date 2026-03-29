export type VoiceAvailability = 'zh-TW' | 'zh-fallback' | 'unavailable'

/**
 * Speak Mandarin text using the Web Speech API with zh-TW locale.
 * Returns a cancel function for cleanup.
 */
export function speakMandarin(text: string, onEnd?: () => void): () => void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd?.()
    return () => {}
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-TW'
  utterance.rate = 0.9
  utterance.pitch = 1.0

  const voices = window.speechSynthesis.getVoices()
  const zhTWVoice = voices.find(v => v.lang === 'zh-TW')
  if (zhTWVoice) utterance.voice = zhTWVoice

  utterance.onend = () => onEnd?.()
  utterance.onerror = () => onEnd?.()

  window.speechSynthesis.speak(utterance)

  return () => window.speechSynthesis.cancel()
}

/**
 * Check zh-TW voice availability at app init.
 * Returns a promise that resolves once the voice list is populated.
 */
export function checkZhTWVoiceAvailability(): Promise<VoiceAvailability> {
  return new Promise(resolve => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve('unavailable')
      return
    }

    const check = () => {
      const voices = window.speechSynthesis.getVoices()
      const zhTW = voices.find(v => v.lang === 'zh-TW')
      if (zhTW) return resolve('zh-TW')
      const zhFallback = voices.find(v => v.lang.startsWith('zh'))
      if (zhFallback) return resolve('zh-fallback')
      resolve('unavailable')
    }

    if (window.speechSynthesis.getVoices().length > 0) {
      check()
    } else {
      window.speechSynthesis.addEventListener('voiceschanged', check, { once: true })
      // Timeout fallback — some browsers never fire voiceschanged
      setTimeout(() => check(), 1000)
    }
  })
}
