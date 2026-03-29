# Fluency Drilling

## Overview

The fluency drilling environment lives inside the Seed detail view and allows users to step
through all Phrases in a Seed with audio playback in sequence. This maps to Nation's fluency
strand: known material, driven toward automatic retrieval through repetition. No new
vocabulary. No scoring. The only goal is speed and automaticity.

## Dependencies

- `03_UI_Design_System.md` — button variants, motion tokens, visual highlight spec
- `06_Phrases_Within_Seed.md` — Seed detail view structure, Phrase list
- `08_TTS_Audio.md` — `speakMandarin` function and playback state

---

## Entry Points

Fluency drilling mode is entered from the Seed detail view via the "Start Drilling" secondary
button in the page header. It is not a separate route — it is an overlay/mode state applied
to the existing Seed detail view.

Drilling mode can only be entered when the Seed has at least one Phrase. If the Seed has
zero Phrases, the "Start Drilling" button is disabled (with a tooltip: "Add Phrases to start
drilling").

---

## Drilling Mode UI

When drilling mode is active, the Seed detail view shifts into a focused state:

- The page header actions (Add Phrase, Start Drilling) are replaced by drilling controls:
  **Previous** (Ghost, icon only) | **Pause/Resume** | **Next** (Ghost, icon only) |
  **Stop Drilling** (Ghost, "✕ Stop")
- A **Loop toggle** button (icon + label "Loop") sits adjacent to the controls
- A **drill prompt** — a persistent, prominent visual cue — is displayed above the Phrase list:
  "Speak each Phrase aloud after you hear it" (body-lg, primary-500 colour, centred)
- The currently playing Phrase card is visually highlighted (primary-100 background,
  primary-500 left border accent, 2px)
- All other Phrase cards are visually de-emphasised (opacity 0.5) while drilling is active

Drilling mode does not scroll the view or hide other Phrases — the full list remains visible,
with the active Phrase highlighted in context.

---

## Auto-Play Sequence

Auto-play begins immediately when the user clicks "Start Drilling". Playback starts from the
first Phrase in the list (position 0).

**Sequence logic:**

1. Call `speakMandarin(currentPhrase.mandarin, onEnd)`
2. In `onEnd`: advance to the next Phrase and repeat
3. On reaching the last Phrase:
   - If Loop is off: stop drilling, exit drilling mode, show brief toast: "Drill complete."
   - If Loop is on: return to position 0 and continue; show a subtle "Lap 2" indicator
     (see below)

**Pause/Resume:**
- Pause: call `window.speechSynthesis.cancel()`. Store current position. Update button to
  "Resume". The highlighted card remains highlighted.
- Resume: call `speakMandarin` from the current position again (re-speak the paused Phrase
  from the beginning — do not attempt to resume mid-utterance).

**Stop Drilling:**
- Call `window.speechSynthesis.cancel()`. Exit drilling mode. Restore normal Seed detail
  view header. No toast needed.

---

## Manual Step-Through

The Previous and Next buttons allow the user to move through Phrases manually without waiting
for audio to complete.

- **Next:** Cancel current utterance. Advance position by 1. Begin speaking the new Phrase.
  Wraps from last → first only if Loop is on; otherwise Next is disabled on the last Phrase.
- **Previous:** Cancel current utterance. Move position back by 1. Begin speaking the new
  Phrase. Disabled on the first Phrase (no wrap-back).

Manual step-through works identically whether the session is paused or playing.

---

## Loop Mode

Toggled by the Loop button. Off by default.

- When off: drilling stops naturally after the last Phrase
- When on: drilling wraps from last Phrase back to first seamlessly
- Toggle is available during an active drilling session (changing it mid-session takes effect
  at the next loop boundary)

**Lap indicator:** When loop is on and the sequence wraps, show a brief, subtle "Lap [N]"
badge near the drill controls for 2 seconds (fade in → fade out, 250ms each). Lap count
starts at 2 on the first wrap. This gives the user a quiet confirmation the loop has cycled
without being disruptive.

---

## Drill Prompt

The drill prompt ("Speak each Phrase aloud after you hear it") is not scored, timed, or
validated in any way. It is purely a visual cue to prevent the user from passively listening
rather than actively producing.

The prompt must be visually prominent enough to be seen without searching for it. Persistent
for the duration of the drilling session — it does not disappear after the first Phrase.

---

## Phrase Highlighting

Only one Phrase is highlighted at a time — the one currently being spoken (or the one that
was active when the session was paused).

Highlight style:
- Card background: primary-100
- Left border: 2px solid primary-500
- Transition: 150ms ease-out (matches design system default)

When the session ends (either naturally or via Stop), all highlighting is cleared immediately.

---

## Drilling With Pagination

If the Seed has >50 Phrases and pagination is active, auto-play must continue across page
boundaries. The drilling state holds the full Phrase array (all pages) in memory — pagination
is a display concern only. The page scrolls/jumps to show the current Phrase as auto-play
advances, including switching to the next pagination page when the current page is exhausted.

Scroll the active Phrase card into view (`element.scrollIntoView({ behavior: 'smooth',
block: 'center' })`) each time the active Phrase changes.

---

## Keyboard Navigation

During drilling mode:

| Key | Action |
|-----|--------|
| Space | Pause / Resume |
| → (right arrow) | Next Phrase |
| ← (left arrow) | Previous Phrase |
| Escape | Stop Drilling |

Keyboard navigation requires that the drilling controls have focus management — ensure focus
is on the drilling controls container when drilling mode is entered.

---

## Gaps & Assumptions

- No per-Phrase pause between auto-play utterances is specified. Default: 800ms gap between
  `onEnd` and the next `speakMandarin` call — gives the user a beat to speak before the next
  Phrase begins. This is hardcoded in Phase 1; user-adjustable gap is a future feature.
- Drilling mode persistence (resuming from where you left off after closing the app) is not
  in scope. Each drilling session starts from Phrase 1.
- No playback speed control in Phase 1. The 0.9 rate set in `08_TTS_Audio.md` applies here.
