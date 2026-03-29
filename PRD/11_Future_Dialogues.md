# Future — Phase 2: Dialogues

## Overview

The Dialogues feature is fully specified in the PRD and deferred until Phase 1 is complete
and validated. Do not build any part of this during Phase 1. The schema is forward-compatible
(defined in `02_Database_Schema.md`) but the tables must not be created until Phase 2 begins.

This file is the complete Phase 2 implementation spec.

## Dependencies (Phase 2)

- `02_Database_Schema.md` — `dialogues` table, `dialogue_phrases` junction, script JSONB format
- `03_UI_Design_System.md` — all component specs apply unchanged
- `04_App_Shell_Navigation.md` — Dialogues nav item added to sidebar/tab bar at Phase 2 start
- `06_Phrases_Within_Seed.md` — Phrase selection flow originates here
- `07_Phrases_Global_View.md` — Phrase selection also available from global view

---

## What Dialogues Are

A scripted AI-generated conversation built from Phrases the user has already saved. Generated
once, stored, drilled repeatedly. The user is **not** interacting live with the AI — they are
reading and drilling a fixed script. This is Nation's fluency strand, not Swain's output strand
(that is Phase 3).

The key educational function: seeing saved Phrases used naturally in a realistic dialogue
context, with Speaker 2's lines always containing the selected Phrases organically.

---

## Phase 2 Setup Steps (Before Feature Build)

1. Create `dialogues` and `dialogue_phrases` tables in Supabase (see `02_Database_Schema.md`)
2. Add Dialogues nav item to the app shell
3. Add Settings screen with API key entry (see API Key section below)
4. Run `supabase gen types` to regenerate TypeScript types

---

## Dialogues List View (`/dialogues`)

- Page title "Dialogues" (h1) + "New Dialogue" primary button
- Dialogue cards ordered by: favourites first, then `created_at DESC`
- Tag filter pills (same pattern as Seeds and Phrases)
- Empty state: "Generate your first scripted dialogue from your Phrase library."

**Dialogue card:**
- Name (h3)
- Tag badge (amber, if present)
- Difficulty badge: "Simple" (grey) or "Intermediate" (primary-100/primary-700)
- Turn count (caption, grey-400): "8 turns"
- Favourite toggle (star icon, right-aligned) — filled primary-500 when favourited
- Kebab menu: Drill | Regenerate | Edit | Delete

---

## Create Dialogue Flow

Triggered by "New Dialogue" button. A multi-step modal or a dedicated creation page
(recommended: dedicated page at `/dialogues/new` given the complexity of Phrase selection).

**Step 1 — Dialogue settings:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| Name | text | Yes | |
| Tag | text | No | Free-text |
| Speaker 1 role | text | Yes | e.g. "Shopkeeper", "早餐店 owner" |
| Speaker 2 role | text | Yes | e.g. "Customer" — this is the learner's role |
| Difficulty | select | Yes | `simple` or `intermediate` |
| Turn count | number | Yes | Min 4, max 20, default 8 |

**Step 2 — Phrase selection:**

User selects Phrases via checkbox from either:
- A Seed view (Phrases grouped by their parent Seed)
- The global Phrases view (flat list with search/filter)

Both selection surfaces are available within the creation flow. Phrases from multiple Seeds
can be selected — no restriction. No hard cap on Phrase count, but if the assembled prompt
would exceed the Anthropic API context limit, display a warning and ask the user to reduce
their selection.

Selected Phrases are displayed as a summary before generation (name + Mandarin).

**Step 3 — Generate:**

"Generate Dialogue" primary button. On tap:
1. Assemble the prompt (see Prompt Specification below)
2. POST to Anthropic API with the user's key from localStorage
3. Show a loading state on the button ("Generating…" with spinner)
4. On success: store the returned JSON in `dialogues.script`, save junction rows, navigate
   to the Dialogue drill view
5. On failure: see Error Handling below

If the user has no API key stored, intercept at the Generate button tap — show a modal
directing them to Settings. Do not attempt the API call.

---

## Prompt Specification

The prompt is a fixed template owned by the app. Users do not see or edit it.

**System prompt:**
```
You are generating a scripted Taiwanese Mandarin dialogue for language learning.
Return ONLY a valid JSON array. No preamble, no explanation, no markdown code fences.

Rules:
- Speaker 2's lines MUST contain the provided Phrases used naturally in context
- Speaker 1's lines should be questions or comments that organically elicit the Phrases
  as a natural response — never force them
- Use vocabulary and phrasing natural to Taiwanese Mandarin (台灣國語):
    • Avoid erhua (兒化音)
    • Avoid 您 as a standard second-person pronoun
    • Avoid Beijing-specific slang and vocabulary
    • Prefer Taiwanese vocabulary where variants exist:
      機車 (not 摩托車), 便當 (not 盒飯), 捷運 (not 地鐵)
    • Neutral tone is less common in Taiwanese Mandarin — use full tones where natural
- Difficulty: [simple|intermediate]
    • Simple: ≤8 words per turn, vocabulary from the top 1,000 most frequent Mandarin words,
      no 把 constructions, aspect markers limited to 了 only
    • Intermediate: up to 15 words per turn, broader vocabulary, naturally occurring grammar
- Keep each turn to one or two sentences maximum
- Generate exactly [N] turns (one turn = one Speaker 1 line + one Speaker 2 line)
```

**User message:**
```
Speaker 1 role: [speaker_1_role]
Speaker 2 role: [speaker_2_role]

Phrases to include in Speaker 2's lines:
[For each selected Phrase: "- [mandarin] ([english])"]

Generate the dialogue now.
```

**Expected JSON format:**
```json
[
  {
    "speaker": "Speaker 1",
    "role": "早餐店 owner",
    "mandarin": "你好！今天想吃什麼？",
    "english": "Hello! What would you like to eat today?"
  },
  {
    "speaker": "Speaker 2",
    "role": "Customer",
    "mandarin": "我要一個蛋餅，不要蔥。",
    "english": "I'd like an egg crepe, no spring onions."
  }
]
```

**Model:** Use the latest Claude Sonnet model available at Phase 2 build time.
**Max tokens:** 2000 (sufficient for 20 turns at reasonable length).

---

## Dialogue Drill View (`/dialogues/:dialogueId`)

Displays the stored script line by line for reading and drilling.

- Dialogue name (h1)
- Difficulty badge + turn count (caption)
- Script lines in order: Speaker label (caption, grey-400) | Mandarin (body-lg) | English (body, grey-400)
- Play button per line (TTS, same pattern as Phrase cards — Web Speech API, zh-TW)
- "Favourite" toggle (star icon) in the header
- "Regenerate" and "Edit" actions in a header kebab menu

**Phase 2 sub-milestone — TTS per turn:** TTS is added to Dialogue lines as a sub-milestone
within Phase 2. The drill view is functional (readable) before TTS is wired up.

---

## Regenerate

Re-runs the API call with the same stored variables and Phrases. Permanently overwrites the
existing script. No version history. No recovery.

Confirmation dialog: "Regenerate this Dialogue? The current script will be permanently
replaced. This can't be undone." Cancel (Ghost) | Regenerate (Danger).

---

## Edit Dialogue Variables

Opens the creation flow pre-populated with current values (roles, difficulty, turn count,
selected Phrases). Changing values and saving triggers regeneration — the same confirmation
as above applies if a script already exists.

---

## Delete Dialogue

Hard delete. Confirmation dialog: "Delete this Dialogue? This can't be undone."
Cascade on `dialogue_phrases` junction via FK constraint.

---

## Error Handling

| Failure | Behaviour |
|---------|-----------|
| API call fails / times out | Error toast: "Dialogue generation failed. Check your API key in Settings and try again." Dialogue record not created. |
| Response is not valid JSON | Log raw API response. Error toast: same as above. |
| API key missing | Modal prompt to go to Settings. No API call attempted. |
| API key invalid (401) | Error toast: "Invalid API key. Update it in Settings." |

---

## API Key Storage

Key stored in `localStorage` under `huayu_anthropic_key`. Never sent to Supabase.
Read directly from localStorage before each Anthropic API call.

**Settings screen** (`/settings` — added in Phase 2):
- Single field: "Anthropic API Key" (password input, masked)
- "Save" button — writes to localStorage
- "Clear" button — removes from localStorage
- Brief explainer: "Your key is stored only on this device and used to generate Dialogues.
  It's never sent to our servers."

---

## Favouriting

`is_favourite` boolean on the `dialogues` row. Toggled by tapping the star icon on the
Dialogue card or drill view. No confirmation needed — easily reversible.
Favourited Dialogues surface at the top of the Dialogues list.

---

## Gaps & Assumptions

- The exact prompt structure above should be tested manually in the Anthropic Console against
  real Phrase sets before integration. Treat the prompt as a starting point, not a locked spec.
- Turn count validation: the API should return exactly N turns. If it returns fewer or more,
  store what was returned (don't error). Log a warning if the count doesn't match.
- Rate limiting on Anthropic API calls: implement a simple per-session counter or cooldown
  (e.g. max 10 generations per hour) to prevent runaway costs. Exact limit TBD at Phase 2.
- Multi-step creation flow (settings → Phrase selection → generate): dedicated page
  (`/dialogues/new`) preferred over a multi-step modal, given Phrase selection complexity.
