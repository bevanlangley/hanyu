import { Volume2 } from 'lucide-react'
import { useTts } from '@/context/TtsContext'

export function TtsWarningBanner() {
  const { voiceStatus } = useTts()

  if (voiceStatus === 'zh-TW') return null

  const message =
    voiceStatus === 'zh-fallback'
      ? 'A Taiwanese Mandarin (zh-TW) voice is not available on this device. A fallback Chinese voice is being used — pronunciation may differ.'
      : 'Text-to-speech is not available on this device. Audio playback is disabled.'

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-md border border-[#fef3c7] bg-[#fffbeb] px-3 py-2 text-xs text-[#92400e] dark:border-[#92400e] dark:bg-[#92400e]/20 dark:text-[#fef3c7]"
    >
      <Volume2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
