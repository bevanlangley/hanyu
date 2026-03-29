# TTS Audio

## Overview

All Phrase audio in Phase 1 is generated on demand by the browser's Web Speech API using
the `zh-TW` locale. No audio is stored, fetched from an external service, or cached. Every
Play tap triggers a fresh synthesis call. This file covers the integration, playback state
management, fallback behaviour, and the pre-flight voice availability check.

## Dependencies

- `03_UI_Design_System.md` — Audio play button spec (36×36px min, three states, aria-label)
- `06_Phrases_Within_Seed.md` — Play button on Phrase cards in Seed detail view
- `07_Phrases_Global_View.md` — Play button on Phrase cards in global Phrases view

---

## Web Speech API Integration

The `SpeechSynthesisUtterance` API is browser-native — no install, no API key, no network
request.

**Core synthesis function:**

```typescript
export function speakMandarin(text: string, onEnd?: () => void): () => void {
  window.speechSynthesis.cancel() // Cancel any in-progress utterance first

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-TW'
  utterance.rate = 0.9  // Slightly slower than default for clarity
  utterance.pitch = 1.0

  // Prefer a zh-TW voice if available
  const voices = window.speechSynthesis.getVoices()
  const zhTWVoice = voices.find(v => v.lang === 'zh-TW')
  if (zhTWVoice) utterance.voice = zhTWVoice

  utterance.onend = () => onEnd?.()
  utterance.onerror = () => onEnd?.() // Reset state on error

  window.speechSynthesis.speak(utterance)

  // Return a cancel function for cleanup
  return () => window.speechSynthesis.cancel()
}
```

**Rate default of 0.9:** Slightly reduced for clarity at phrase level. This is adjustable
but not user-configurable in Phase 1.

---

## Pre-Flight Voice Check

On app initialisation (once, at the AppShell level), check whether a `zh-TW` voice is
available on the device. Store the result in a global React context or a simple module-level
variable accessible throughout the app.

The voice list may not be populated synchronously — use the `voiceschanged` event:

```typescript
export function checkZhTWVoiceAvailability(): Promise<'zh-TW' | 'zh-fallback' | 'unavailable'> {
  return new Promise((resolve) => {
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
    }
  })
}
```

---

## Playback State Per Phrase Card

Each Phrase card manages its own playback state independently. Only one Phrase can be
playing at a time (the `speechSynthesis.cancel()` call at the start of `speakMandarin`
ensures this).

**Three states:**

| State | Visual | aria-label |
|-------|--------|------------|
| Idle | Play icon (▶), primary-500 | "Play [Mandarin text]" |
| Playing | Pause icon (⏸) or Stop icon, animated | "Pause" |
| Unavailable | Disabled icon, greyed out, tooltip | "Voice unavailable" |

When the user taps Play on Phrase B while Phrase A is playing: Phrase A's state resets to
idle, Phrase B begins playing. This happens naturally because `cancel()` fires before the
new utterance.

Playback ends (state resets to idle) on: `utterance.onend`, `utterance.onerror`, or when
the user taps the playing Phrase's button again (which calls `speechSynthesis.cancel()`).

---

## Fallback Behaviour

Based on the pre-flight check result:

### `zh-TW` available (ideal)

Normal operation. No banner. Audio plays in Taiwanese Mandarin.

### `zh-fallback` (a `zh-` voice exists, but not `zh-TW`)

Show a **persistent warning banner** (not a toast — it must remain visible):

> "Taiwanese Mandarin voice not available on this device. Audio may use a different Mandarin
> variety. Consider using Chrome on desktop for best results."

Banner style: warning semantic colours, dismissible by the user, shown below the nav bar
above the page content. Once dismissed, store dismissal in `localStorage` under
`huayu_tts_warning_dismissed` — don't re-show on next session.

Audio playback continues using the best available `zh-` voice.

### `unavailable` (no `zh-` voice at all)

Warning banner (same position, same dismissal behaviour):

> "No Mandarin voice available on this device. Audio playback is disabled. Try Chrome on
> desktop for the best experience."

All play buttons are **disabled** and display "Voice unavailable" in place of the icon.
Use `aria-disabled="true"` and a tooltip explaining the issue.

---

## Auto-Play Mode Integration

During fluency drilling (see `09_Fluency_Drilling.md`), the TTS module is called sequentially
across all Phrases in a Seed. The `onEnd` callback is the mechanism that advances to the
next Phrase.

The same `speakMandarin` function is used — no separate auto-play audio API needed.

---

## Known Platform Behaviour

- **Chrome on desktop** is the most reliable for `zh-TW` voice availability. This is why
  the warning banner recommends Chrome.
- **iOS Safari** uses the system's installed voices — if the user has Chinese (Taiwan) enabled
  in iOS Settings → General → Language & Region, `zh-TW` will be available.
- **speechSynthesis.getVoices()** is asynchronous on Chrome (requires `voiceschanged`) but
  synchronous on Firefox. The pre-flight function above handles both.
- **Tab backgrounding** can cause speech synthesis to pause or stop on some browsers. This
  is a known limitation — do not attempt to work around it in Phase 1.

---

## Phase 2+ Upgrade Path

When persistent, higher-quality audio becomes a priority:

1. Add `audio_path` (nullable text) column to `phrases` table
2. Create a `phrase-audio` private bucket in Supabase Storage
3. Swap `speakMandarin` for a function that fetches from Supabase Storage if `audio_path`
   is set, falling back to Web Speech API if not
4. Generate audio via Google Cloud TTS `zh-TW-Wavenet-A` (or similar) on Phrase creation
5. Store the resulting file in Supabase Storage and save the path

No other schema or architectural changes required for this upgrade.

---

## Gaps & Assumptions

- Speech rate of 0.9 is a default. User-adjustable speed is not in Phase 1 scope.
- No pronunciation scoring or recording of user output — Phase 3+ only.
- The `speechSynthesis` API is assumed available (`typeof window.speechSynthesis !== 'undefined'`).
  If it's absent entirely (unlikely in modern browsers), treat as `unavailable`.
