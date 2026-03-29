# Seeds CRUD

## Overview

Seeds are the top-level organisational unit — each represents one external learning source.
This file covers the Seeds list view, Seed card design, create/edit/delete flows, tag
filtering, and empty state. Seeds are the first feature a user encounters and the entry
point to the Phrase library.

## Dependencies

- `02_Database_Schema.md` — `seeds` table
- `03_UI_Design_System.md` — card, badge, tag, button, toast, confirmation dialog specs
- `04_App_Shell_Navigation.md` — routing, empty state conventions, toast and dialog singletons

---

## Seeds List View (`/seeds`)

The default landing view. Displays all Seeds as a vertical list of cards.

**Layout:**
- Page title "Seeds" (h1, left) + "New Seed" primary button (right)
- Tag filter pill row below the header (hidden until at least one tag exists)
- Seed cards below, ordered by `created_at DESC`
- Empty state when no Seeds exist (see below)

**Data fetch:** `SELECT * FROM seeds ORDER BY created_at DESC`. No pagination — the number
of Seeds a single user accumulates is not expected to reach a scale requiring it.

---

## Seed Card

Full-width horizontal card per the design system spec.

**Left side (stacked):**
- Seed name (h3)
- Source URL — if present, rendered as a truncated clickable link (opens in new tab);
  if absent, omit the row entirely (don't show an empty/placeholder URL line)
- Tag badge (amber) — if present; omit if absent

**Right side:**
- Phrase count badge (neutral): "14 Phrases" / "1 Phrase" / "0 Phrases" (singular/plural)
- Vertical kebab menu (⋮) or inline icon buttons: Edit | Delete

**Hover state:** grey-50 background, 150ms ease-out.

**Click target:** Clicking anywhere on the card body (not the action buttons) navigates
to `/seeds/:seedId`.

---

## Tag Filter

Displayed as a horizontal scrollable row of pill toggles above the card list. One pill per
unique tag value currently in the `seeds` table, plus an "All" pill (selected by default).

- Selecting a tag pill filters the list to Seeds with that tag (client-side — no refetch)
- Only one tag can be active at a time
- "All" deselects any active tag filter
- If no Seeds have tags, the filter row is not rendered

Fetch all distinct tags: `SELECT DISTINCT tag FROM seeds WHERE tag IS NOT NULL`.

---

## Create Seed (Modal)

Triggered by the "New Seed" primary button. Opens a modal dialog.

**Form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Name | text input | Yes | Placeholder: "e.g. Mandarin Corner — Ordering Coffee" |
| Source URL | text input | No | Placeholder: "Paste a link to the video, podcast, or page" |
| Tag | text input | No | Placeholder: "e.g. café, social, mechanic" |

Validation: name must be non-empty (trim before check). URL and tag are optional — do not
validate URL format; accept any string. Tag is free-text with no autocomplete in Phase 1.

**On submit:** Insert into `seeds`. Close modal. Show success toast: "Seed created." Navigate
to the new Seed's detail view (`/seeds/:newSeedId`) — dropping the user directly into
adding Phrases is the intended UX flow.

**On error:** Error toast: "Couldn't create Seed. Try again."

---

## Edit Seed (Modal)

Triggered by the Edit action on a Seed card. Opens the same modal as Create, pre-populated
with current values.

**On submit:** Update the `seeds` row. Close modal. Update the Seed card in the list
optimistically or refetch. Show success toast: "Seed updated."

**On error:** Error toast: "Couldn't save changes. Try again."

---

## Delete Seed

Triggered by the Delete action on a Seed card.

**Flow:**
1. Open the global Confirmation Dialog
2. Title: "Delete this Seed?"
3. Description: "This will permanently delete **[Seed name]** and its **[N] Phrase[s]**.
   This can't be undone." (Phrase count must be accurate — fetch or use cached count before
   opening dialog)
4. Cancel (Ghost button) | Delete (Danger button)
5. On confirm: `DELETE FROM seeds WHERE id = :seedId` (cascade handles Phrases)
6. Close dialog. Navigate to `/seeds` if currently on the Seed detail view. Show success
   toast: "Seed and [N] Phrase[s] deleted."

**On error:** Error toast: "Couldn't delete Seed. Try again." Dialog closes; no data changed.

---

## Empty State (No Seeds)

Shown when `seeds` table returns zero rows and no tag filter is active.

- Icon: a stylised inbox or plant/seed icon (Lucide `Inbox` or `Sprout`, 48px, grey-400)
- Heading (h2): "Your phrase library starts here"
- Body: "Save a YouTube video, podcast, or anything you're learning from as a Seed. Then
  add the phrases you want to keep — and hear them in Taiwanese Mandarin."
- CTA: "Create your first Seed" (primary button)

**Empty state when tag filter is active but no Seeds match:**
- Heading: "No Seeds tagged '[tag]'"
- Body: "Try a different tag, or clear the filter."
- CTA: "Clear filter" (secondary button)

---

## Supabase Queries Reference

```typescript
// Fetch all seeds
const { data, error } = await supabase
  .from('seeds')
  .select('*')
  .order('created_at', { ascending: false })

// Fetch distinct tags
const { data } = await supabase
  .from('seeds')
  .select('tag')
  .not('tag', 'is', null)

// Insert
const { data, error } = await supabase
  .from('seeds')
  .insert({ name, source_url, tag })
  .select()
  .single()

// Update
const { error } = await supabase
  .from('seeds')
  .update({ name, source_url, tag })
  .eq('id', seedId)

// Delete (cascade handles phrases)
const { error } = await supabase
  .from('seeds')
  .delete()
  .eq('id', seedId)
```

---

## Gaps & Assumptions

- Phrase count on the Seed card: fetched as part of a join on initial load
  (`SELECT seeds.*, count(phrases.id) as phrase_count FROM seeds LEFT JOIN phrases...`) rather
  than a separate query per card. Simpler and avoids N+1.
- No reordering of Seeds — `created_at DESC` is the only sort order.
- Tag autocomplete (suggesting previously used tags as the user types) is a quality-of-life
  addition not specified in the PRD. Default: plain text input, no autocomplete in Phase 1.
