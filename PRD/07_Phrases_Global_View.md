# Phrases — Global View

## Overview

A top-level navigation section (`/phrases`) that displays every Phrase across all Seeds in
a single flat list. Supports tag filtering (inherited from parent Seed) and full-text search
across all three Phrase fields. Read-only in this view — editing and deletion happen from
the Seed detail view.

## Dependencies

- `02_Database_Schema.md` — `phrases` + `seeds` tables, join behaviour
- `03_UI_Design_System.md` — Phrase card, tag pill, search input, empty state conventions
- `04_App_Shell_Navigation.md` — navigation, routing
- `08_TTS_Audio.md` — play button on each Phrase card

---

## View Layout (`/phrases`)

**Header:**
- Page title "Phrases" (h1)
- No primary action button — this view is read-only

**Controls row (below header):**
- Search input (left, full-width on mobile, ~300px on desktop)
- Tag filter pills (right, or below search on mobile)

**Body:** Phrase list, or empty state.

---

## Data Fetch

Fetch all Phrases with their parent Seed name in a single join:

```typescript
const { data } = await supabase
  .from('phrases')
  .select('*, seeds(name, tag)')
  .order('created_at', { ascending: false })
```

All filtering (search + tag) is performed client-side against this result set.
No server-side filtering is needed at Phase 1 scale.

---

## Phrase Card (Global View Variant)

Same three-line layout as the Seed detail view, with one addition:

```
不好意思，你說慢一點可以嗎？               [▶ Play]
Bù hǎo yì si, nǐ shuō màn yī diǎn kěyǐ ma?
Excuse me, can you speak a bit slower?
─────────────────────────────────────────
Mandarin Corner — Ordering Coffee  [café]
```

- Lines 1–3: identical to Seed detail Phrase card
- Line 4: Parent Seed name (caption, grey-400) + Seed tag badge (amber, if present)
- Parent Seed name is a link to `/seeds/:seedId`
- No Edit or Delete actions in this view — those are scoped to the Seed detail view

Play button behaviour is identical to the Seed detail view (see `08_TTS_Audio.md`).

---

## Tag Filter

Same pill toggle pattern as the Seeds list (`05_Seeds_CRUD.md`), but tags are sourced from
the **parent Seeds**, not from the Phrases themselves. A Phrase inherits its parent Seed's tag.

Fetch distinct tags: extract unique `seeds.tag` values from the joined result set (client-side,
no extra query). "All" pill is selected by default.

Selecting a tag shows only Phrases whose parent Seed has that tag. Phrases whose parent Seed
has no tag are only visible when "All" is selected.

---

## Search

Full-text search across `mandarin`, `pinyin`, and `english` fields simultaneously.
Client-side filtering against the fetched result set.

**Behaviour:**
- Search is case-insensitive
- Matches any substring in any of the three fields
- Search and tag filter compose: active tag filter + search string both apply simultaneously
- No debounce delay needed — filtering is synchronous against an in-memory array
- Clearing the search field returns to the full list (filtered by tag if a tag is active)

**Implementation:** A simple `Array.filter()` checking `phrase.mandarin.toLowerCase().includes(query)
|| phrase.pinyin.toLowerCase().includes(query) || phrase.english.toLowerCase().includes(query)`.

---

## Pagination

Same rule as Seed detail view:
- ≤50 Phrases total (after search/filter): show all, no pagination
- >50 Phrases (after search/filter): paginate at 25 per page
- Changing search or filter resets to page 1

---

## Empty States

**No Phrases exist at all (library is empty):**
- Icon: Lucide `BookOpen`, 48px, grey-400
- Heading: "Your phrase library is empty"
- Body: "Add Phrases from your Seeds to see them here."
- CTA: "Go to Seeds" (secondary button → `/seeds`)

**Search returns no results:**
- Icon: Lucide `SearchX`, 48px, grey-400
- Heading: "No Phrases match '[query]'"
- Body: "Try a different search, or clear it to browse all Phrases."
- CTA: "Clear search" (secondary button, clears search input)

**Tag filter active, no Phrases match:**
- Heading: "No Phrases tagged '[tag]'"
- Body: "Try a different tag, or clear the filter."
- CTA: "Clear filter" (secondary button)

---

## Navigation from This View

- Clicking the parent Seed name on a Phrase card navigates to `/seeds/:seedId`
- There is no way to add, edit, or delete Phrases from this view — intentional, to keep
  edit actions scoped to their parent Seed context

---

## Gaps & Assumptions

- Read-only view is an explicit PRD decision: "Each Phrase displays… and the parent Seed
  name." Editing is not mentioned for this view. Confirmed as intentional — users edit via
  the Seed detail view.
- No sorting controls specified — default is `created_at DESC` (newest first), which differs
  from the Seed detail view (oldest first). Newest-first makes more sense in a global browse
  context. Noted as a default, not a PRD-specified value.
- At large library scale (500+ Phrases), client-side filtering could become sluggish.
  Acceptable for Phase 1; server-side search (Supabase full-text search or `ilike`) is the
  Phase 2+ upgrade path.
