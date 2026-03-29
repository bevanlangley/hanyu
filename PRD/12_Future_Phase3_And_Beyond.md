# Future — Phase 3 & Beyond

## Overview

Deferred features beyond Phase 2. Nothing here is built until the preceding phase is
complete and validated. Items are grouped by phase and complexity. This file exists so
architectural decisions made now don't accidentally close off these paths later.

---

## Phase 3 — Live Voice Conversations

The most educationally significant feature in the entire product. Deferred because it is
also the most technically complex. Building Phase 1 and Phase 2 first means Phase 3 launches
into a user who already has a rich Phrase library and conversational context to draw from.

### What It Is

A live, real-time voice interaction with an AI conversation partner. The user speaks their
turns; the AI responds in real time using their Phrase library as context. Distinct from
Phase 2 Dialogues — this is unscripted, generative, and interactive.

### The Non-Negotiable Design Constraint

**The AI must not respond smoothly to broken or vague Mandarin.** This is the hardest prompt
engineering challenge in the entire project and the most important design constraint to protect.

Every other language app and chatbot infers what the user meant and responds helpfully. This
teaches nothing. Per Swain's research: the learning happens at the point of difficulty, not
the point of success. A clarification request from the AI is more valuable than a smooth
response.

This means the Phase 3 system prompt must instruct the AI to:
- Ask for clarification when the learner's Mandarin is unclear, incomplete, or grammatically
  broken — in Mandarin, not English
- Resist inferring intent from broken input
- Never switch to English or simplify its own output to compensate for the learner's errors
- Treat imprecision as a trigger for a follow-up question, not a reason to smooth over

This will feel like bad UX to anyone who hasn't read the SLA research. It must be protected
through every iteration of Phase 3 development.

### Technical Components Required

| Component | Technology Options | Notes |
|-----------|-------------------|-------|
| Speech input (STT) | Web Speech API (`webkitSpeechRecognition`) or Whisper API | Web Speech API is free/browser-native; Whisper is more accurate but costs money |
| Live AI response | Anthropic API (streaming) | Streaming reduces perceived latency |
| TTS playback for AI turns | Web Speech API (zh-TW) or ElevenLabs zh-TW | ElevenLabs is higher quality but adds cost |
| Latency management | Streaming + early TTS start | Key UX challenge — research before committing to an approach |

Phase 3 voice pipeline research is required before any build decisions are made. Latency
is the primary technical risk: STT → LLM → TTS in sequence produces noticeable delay.
Mitigation strategies (streaming, speculative TTS, turn-end detection) need evaluation.

### Phase 3 Prompt Engineering Starting Point

The Phase 2 SLA Playbook (already written) is a direct asset for Phase 3 prompt engineering.
The clarification-resistance behaviour is architecturally significant — it is not a parameter
to tune late in development; it must be designed in from the first prototype.

**Complexity:** High. Do not underestimate.

---

## Authentication & Multi-User Support

**What:** User accounts, login, per-user data isolation via Supabase RLS.

**Why deferred:** Phase 1 is single-user with no auth. Adding auth is a significant UX and
architectural change. The Phase 1 schema is structured correctly for auth addition (no
`user_id` columns exist yet; adding them is a clean migration).

**Migration path (already defined in `02_Database_Schema.md`):**
1. Enable Supabase Auth
2. Add `user_id uuid NOT NULL references auth.users` to `seeds`, `phrases`, `dialogues`
3. Enable RLS with per-user policies
4. Add login/signup screens

**Complexity:** Medium. Schema migration is the riskiest step.

---

## Supabase Storage & Persistent Audio

**What:** Store generated audio files (Google Cloud TTS zh-TW WaveNet) in Supabase Storage
rather than synthesising on demand via Web Speech API on every play.

**Why deferred:** Web Speech API is free, requires no storage, and is sufficient for Phase 1.
Quality is the eventual reason to upgrade, not functionality.

**Migration path (already defined in `08_TTS_Audio.md`):**
1. Add `audio_path` (nullable text) to `phrases`
2. Create `phrase-audio` private bucket in Supabase Storage
3. Swap TTS function to fetch from Storage if `audio_path` is set, fall back to Web Speech API

**Cost consideration:** Google Cloud TTS WaveNet is ~$16 per 1M characters. At ~20 characters
per Phrase and 500 Phrases, that's ~$0.16 per user for initial generation. Negligible.

**Complexity:** Low-Medium.

---

## Spaced Repetition (SRS)

**What:** Scheduling Phrases for review based on recall performance.

**Why deferred:** The PRD explicitly excludes SRS from Phase 1 and Phase 2. It requires
a review UI, a scheduling algorithm (SM-2 or similar), and performance tracking — a
meaningful scope addition.

**Note:** Per the SLA Playbook, SRS is a retention tool, not a learning tool. Phrases should
be genuinely learned in context before entering SRS. The sequencing matters: encounter in
context (Seeds) → use in Dialogue → SRS maintenance. Don't add SRS before Dialogues.

**Complexity:** Medium.

---

## Progress Tracking & Statistics

**What:** Metrics on Phrases learned, drilling sessions, Dialogues generated, streak tracking.

**Why deferred:** No progress data exists until users have used the app consistently. Building
a stats UI before there's meaningful data to display is premature.

**Complexity:** Low-Medium (data collection is the hard part; display is straightforward).

---

## Data Export (JSON / CSV)

**What:** Allow users to export their full Phrase library as JSON or CSV for backup or
migration.

**Why deferred:** Listed as a Tier 3 foundational feature in the PRD. Not critical until
users have accumulated a library worth protecting.

**Implementation:** A single export function that fetches all Seeds and Phrases and triggers
a browser file download. No backend needed.

**Complexity:** Low. Add this opportunistically when another feature touches the data layer.

---

## Automatic Chunk Extraction

**What:** Paste a transcript or YouTube URL; the AI identifies and suggests Phrases to add
to the library automatically.

**Why deferred:** Phase 3+ feature. Requires transcript access (YouTube API or manual paste),
AI extraction prompt, and a review UI for accepting/rejecting suggestions.

**Complexity:** Medium-High.

---

## Pronunciation Scoring

**What:** Record the user's spoken Mandarin and score it against a reference (tone accuracy,
fluency, etc.).

**Why deferred:** Phase 3+ feature. Requires audio recording, a scoring API (e.g. Azure
Cognitive Services Pronunciation Assessment), and a results UI.

**Complexity:** High. Also raises the question of which variety of Mandarin the scorer is
calibrated to — Taiwanese Mandarin-specific scoring is a hard problem.

---

## Mobile App (iOS / Android)

**Why deferred:** The web app is mobile-responsive and usable in a mobile browser from
Phase 1. A native app is a distribution and development overhead that is not justified until
the web app is validated.

**Note:** Voice features (Phase 3) may eventually push toward a native app for better
microphone access and background audio handling.

**Complexity:** High.

---

## Summary Table

| Feature | Phase | Complexity | Key Dependency |
|---------|-------|------------|----------------|
| Live voice conversations | 3 | High | Phase 2 complete; voice pipeline research |
| Auth & multi-user | Post-2 | Medium | Schema migration |
| Supabase Storage / quality TTS | Post-2 | Low-Med | Auth (for per-user storage paths) |
| Spaced repetition | Post-2 | Medium | Dialogues (learning sequence) |
| Progress tracking | Post-2 | Low-Med | Sufficient usage data |
| Data export | Post-1 | Low | Nothing — add opportunistically |
| Auto chunk extraction | Post-3 | Med-High | Phase 3 AI infrastructure |
| Pronunciation scoring | Post-3 | High | Phase 3 voice pipeline |
| Mobile app | Post-3 | High | Web app validated |
