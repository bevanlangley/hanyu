# Database Schema

## Overview

All structured data is stored in Supabase Postgres. No localStorage or IndexedDB for
structured data. No Supabase Storage in Phase 1. Phase 2 tables are defined here for
forward-compatibility but must not be created until Phase 2 build begins.

## Dependencies

- `01_Project_Setup.md` — Supabase client must be initialised first

---

## Phase 1 Tables (Create Now)

### `seeds`

Represents an external learning source. Parent of Phrases.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `name` | text | NOT NULL | |
| `source_url` | text | nullable | No format validation — any string |
| `tag` | text | nullable | Free-text in Phase 1; no taxonomy enforced |
| `created_at` | timestamptz | default `now()` | |

No additional indexes needed for Phase 1 scale.

---

### `phrases`

The core learning unit. Belongs to a Seed.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `seed_id` | uuid | NOT NULL, FK → `seeds.id` ON DELETE CASCADE | Cascade ensures Phrase deletion when parent Seed is deleted |
| `mandarin` | text | NOT NULL | Traditional Chinese characters |
| `english` | text | NOT NULL | |
| `pinyin` | text | NOT NULL | With tone marks |
| `created_at` | timestamptz | default `now()` | |

Index on `seed_id` for performant Phrase lookups by Seed.

**Full-text search** (for global Phrases view): Supabase's `ilike` across `mandarin`,
`english`, and `pinyin` columns is sufficient for Phase 1 scale. No dedicated FTS index needed.

---

## Phase 1 — No Authentication

All queries use the anon key. RLS is disabled. There is no `user_id` column on any table.

**Phase 2 migration path** (do not implement now):
- Enable RLS
- Add `user_id uuid NOT NULL references auth.users` to `seeds`, `phrases`, `dialogues`
- RLS policies: users can only read/write their own rows
- No data migration needed if Phase 1 data is test/personal data only

---

## Deletion Behaviour

All deletes are **hard deletes** in Phase 1 and Phase 2. No soft delete (`deleted_at` column)
is implemented.

- Deleting a Seed cascades to delete all its Phrases (enforced by FK constraint above)
- Deleting a Seed or Phrase does NOT affect any Dialogues generated from those Phrases —
  Dialogues are independent once generated (Phase 2)
- Deleting a Phrase does NOT cascade to the `dialogue_phrases` junction — junction rows
  become orphaned but the Dialogue script (stored as JSONB) is unaffected

---

## Phase 2 Tables (Define Now, Create Later)

Do not create these tables until Phase 2 build begins. Defined here so Phase 1 architecture
remains forward-compatible.

### `dialogues`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK | |
| `name` | text | NOT NULL | |
| `tag` | text | nullable | |
| `speaker_1_role` | text | NOT NULL | e.g. "Shopkeeper" |
| `speaker_2_role` | text | NOT NULL | e.g. "Customer" |
| `difficulty` | text | NOT NULL | `'simple'` or `'intermediate'` only |
| `turn_count` | integer | NOT NULL, check 4–20, default 8 | One turn = Speaker 1 line + Speaker 2 line |
| `script` | jsonb | nullable | Null until generated; see script format below |
| `is_favourite` | boolean | NOT NULL, default false | |
| `created_at` | timestamptz | default `now()` | |
| `updated_at` | timestamptz | default `now()` | Update via trigger or application logic |

### `dialogue_phrases` (junction)

| Column | Type | Constraints |
|--------|------|-------------|
| `dialogue_id` | uuid | FK → `dialogues.id` ON DELETE CASCADE |
| `phrase_id` | uuid | FK → `phrases.id` ON DELETE NO ACTION |

Composite PK on `(dialogue_id, phrase_id)`.

`phrase_id` FK is NO ACTION — orphaned junction rows are acceptable (Dialogue script is
the source of truth once generated, not the live Phrase rows).

### Dialogue Script JSON Format

The `script` column stores a JSONB array:

```json
[
  {
    "speaker": "Speaker 1",
    "role": "Shopkeeper",
    "mandarin": "你好！今天想買什麼？",
    "english": "Hello! What would you like to buy today?"
  },
  {
    "speaker": "Speaker 2",
    "role": "Customer",
    "mandarin": "我想看看你們的菜單。",
    "english": "I'd like to have a look at your menu."
  }
]
```

Speaker 2's lines always contain the selected Phrases. Speaker 1's lines are questions or
comments that organically evoke the selected Phrases as a response.

---

## TypeScript Types

After running `supabase gen types`, you'll have generated types for all tables. Use them
throughout. Do not write manual interface definitions for table rows — use the generated types.

Key derived types you'll use frequently:

```typescript
import type { Database } from '@/lib/database.types'

type Seed = Database['public']['Tables']['seeds']['Row']
type SeedInsert = Database['public']['Tables']['seeds']['Insert']
type Phrase = Database['public']['Tables']['phrases']['Row']
type PhraseInsert = Database['public']['Tables']['phrases']['Insert']
```

---

## Gaps & Assumptions

- `updated_at` on `dialogues` — trigger vs application-level update not specified. Default:
  update in application code on every write (simpler, sufficient for Phase 1 scale).
- No explicit ordering column on Phrases — results ordered by `created_at ASC` throughout.
  Phrase reordering is not in scope for any phase.
