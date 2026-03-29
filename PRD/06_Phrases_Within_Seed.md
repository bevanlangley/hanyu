# Phrases Within a Seed

## Overview

The Seed detail view (`/seeds/:seedId`) lists all Phrases belonging to that Seed and serves
as the primary phrase management and fluency drilling environment. This file covers Phrase
CRUD, the Phrase card layout, pagination, and the Add/Edit modal. Fluency drilling (auto-play,
loop) is covered in `09_Fluency_Drilling.md`.

## Dependencies

- `02_Database_Schema.md` — `phrases` table, cascade delete behaviour
- `03_UI_Design_System.md` — Phrase card spec, form inputs, modal, toast, confirmation dialog
- `04_App_Shell_Navigation.md` — routing, breadcrumb, modal URL pattern
- `05_Seeds_CRUD.md` — Seed must exist before Phrases can be added
- `08_TTS_Audio.md` — play button on each Phrase card

---

## Seed Detail View (`/seeds/:seedId`)

**Header:**
- Breadcrumb: "Seeds › [Seed name]" (Seeds is a link back to `/seeds`)
- Page title: Seed name (h1)
- Source URL link (if present) — small, muted, below title
- "Add Phrase" primary button (right-aligned)
- "Start Drilling" secondary button (right-aligned, adjacent) — activates auto-play mode
  (see `09_Fluency_Drilling.md`)

**Body:** Phrase list (see below) or empty state.

**Data fetch:** Seed record + all its Phrases in one query:

```typescript
const { data } = await supabase
  .from('seeds')
  .select('*, phrases(*)')
  .eq('id', seedId)
  .order('created_at', { ascending: true }, { foreignTable: 'phrases' })
  .single()
```

If the `seedId` doesn't exist, show `<NotFoundPage>`.

---

## Phrase List & Pagination

Phrases ordered by `created_at ASC` (oldest first — reflects the order the user added them).

**Pagination rule:**
- If the Seed has ≤50 Phrases: show all, no pagination
- If the Seed has >50 Phrases: paginate at 25 per page (page 1 shows items 1–25)
- Pagination controls: previous / next buttons + "Page X of Y" indicator
- Pagination is client-side (all Phrases fetched on load, sliced for display) given expected
  scale — no server-side pagination needed in Phase 1

---

## Phrase Card

Three-line layout per design system:

```
不好意思，你說慢一點可以嗎？               [▶ Play]
Bù hǎo yì si, nǐ shuō màn yī diǎn kěyǐ ma?
Excuse me, can you speak a bit slower?   [⋮]
```

- Line 1: Mandarin (body-lg), play button right-aligned (see `08_TTS_Audio.md`)
- Line 2: Pinyin (body, grey-500)
- Line 3: English (body, grey-400), kebab menu (⋮) right-aligned with Edit | Delete actions

Phrase cards are not clickable as a whole — interaction is via explicit buttons only.

---

## Add Phrase (Modal)

Triggered by "Add Phrase" button. Opens a modal. URL updates to
`/seeds/:seedId/phrases/new` while open (browser back closes the modal).

**Form fields:**

| Field | Type | Required | Placeholder |
|-------|------|----------|-------------|
| Mandarin | textarea | Yes | "Paste or type traditional characters (e.g. 你好)" |
| Pinyin | text input | Yes | "With tone marks (e.g. nǐ hǎo) — paste from dictionary app" |
| English | text input | Yes | "English translation" |

All three fields required. Validation: trim all fields before check; reject if any are empty
after trimming.

**Field ordering in the form:** Mandarin → Pinyin → English. This matches the learning
direction: characters first, romanisation second, meaning last.

**No IME or tone-mark input helper is built.** Users paste from Pleco, Google Translate, or
any external source. Placeholder text makes this explicit.

**On submit:** Insert Phrase. Close modal. Scroll the new Phrase into view (it appends at
the bottom of the list / last page). Show success toast: "Phrase added."

**On error:** Error toast: "Couldn't add Phrase. Try again." Modal stays open.

---

## Edit Phrase (Modal)

Triggered by Edit in the Phrase card kebab menu. Opens the same modal, pre-populated.
URL updates to `/seeds/:seedId/phrases/:phraseId/edit`.

**On submit:** Update the `phrases` row. Close modal. Update the card in place. Show success
toast: "Phrase updated."

**Mandarin field edit behaviour:** If the Mandarin text changes, the TTS audio regenerates
automatically on the next Play tap — the Web Speech API always synthesises from the current
text, so no stale audio is possible. No special handling needed.

**On error:** Error toast: "Couldn't save changes. Try again." Modal stays open.

---

## Delete Phrase

Triggered by Delete in the Phrase card kebab menu.

**Flow:**
1. Open global Confirmation Dialog
2. Title: "Delete this Phrase?"
3. Description: "This will permanently delete this Phrase. This can't be undone."
   (No cascade consequences for Phrases — no need to mention downstream effects)
4. Cancel (Ghost) | Delete (Danger)
5. On confirm: `DELETE FROM phrases WHERE id = :phraseId`
6. Remove card from list. Show success toast: "Phrase deleted."

**On error:** Error toast: "Couldn't delete Phrase. Try again."

---

## Empty State (Seed Has No Phrases)

Shown when a Seed exists but has zero Phrases.

- Icon: Lucide `Plus` or `FileText`, 48px, grey-400
- Heading: "No Phrases yet"
- Body: "Add the chunks you want to learn from [Seed name] — paste the Mandarin characters,
  Pinyin, and English translation."
- CTA: "Add your first Phrase" (primary button, triggers Add Phrase modal)

---

## Supabase Queries Reference

```typescript
// Insert phrase
const { data, error } = await supabase
  .from('phrases')
  .insert({ seed_id: seedId, mandarin, pinyin, english })
  .select()
  .single()

// Update phrase
const { error } = await supabase
  .from('phrases')
  .update({ mandarin, pinyin, english })
  .eq('id', phraseId)

// Delete phrase
const { error } = await supabase
  .from('phrases')
  .delete()
  .eq('id', phraseId)
```

---

## Gaps & Assumptions

- Add Phrase modal vs dedicated page: **modal** (default applied — lower friction, consistent
  with the confirmation dialog pattern, better on mobile).
- No bulk add or import — one Phrase at a time only in Phase 1.
- No reordering of Phrases — `created_at ASC` is the only sort. If the user wants a Phrase
  at the top, they delete and re-add it.
- Phrase count on the parent Seed card (Seeds list) should update after add/delete. Simplest
  approach: refetch the Seeds list in the background after any Phrase mutation, or use
  optimistic count update on the cached Seed record.
