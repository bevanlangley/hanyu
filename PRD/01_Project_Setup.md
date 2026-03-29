# Project Setup

## Overview

Everything that must exist before feature development begins. This file covers the scaffold,
environment configuration, Supabase connection, DX tooling, and the documentation structure
the AI coding assistant will use as memory across sessions.

## Dependencies

None — this is the foundation everything else depends on.

---

## 1. Prerequisites (Manual — Outside This Codebase)

These must be completed before running any scaffold commands:

- **Supabase project created** — note the project URL and anon key
- **GitHub repo created** — empty, with `main` as the default branch
- **Vercel account connected to GitHub** — auto-deploy configured for the repo
- **Anthropic Console account** — not needed until Phase 2, but create it now

---

## 2. Scaffold

```bash
npm create vite@latest huayu -- --template react-ts
cd huayu
npm install
```

Install all dependencies in one pass:

```bash
npm install react-router-dom @supabase/supabase-js react-hook-form zod \
  sonner clsx tailwind-merge lucide-react

npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p
```

Install shadcn/ui:
```bash
npx shadcn-ui@latest init
```

shadcn init choices: TypeScript yes, style Default, base colour Neutral, CSS variables yes,
global CSS at `src/index.css`, tailwind config at `tailwind.config.js`, components at
`@/components`, utils at `@/lib/utils`.

---

## 3. Environment Configuration

**`.env.local`** (never committed):
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**`.env.example`** (committed — documents all required vars):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
# Phase 2: Anthropic API key is stored in localStorage, NOT in env vars
```

Access in code via `import.meta.env.VITE_SUPABASE_URL`. Throw a clear error at app init if
either required var is missing — fail loudly, not silently.

---

## 4. Supabase Client

`src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types' // generated types

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) throw new Error('Missing Supabase environment variables')

export const supabase = createClient<Database>(url, key)
```

Generate TypeScript types after creating tables:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

Re-run this command whenever the schema changes.

---

## 5. .gitignore

Ensure these are excluded before the first commit:
```
.env
.env.local
.env.*.local
node_modules/
dist/
.DS_Store
*.log
.vercel/
```

---

## 6. CLAUDE.md Documentation Structure

The PRD specifies a tiered documentation system as the first build task. Create these files
before writing any feature code:

**`CLAUDE.md`** (root — primary context for the AI coding assistant):
- Project overview (1 paragraph)
- Stack summary (mirrored from `00_README.md`)
- Current build phase and target
- Link to MEMORY.md for session-specific state
- Link to sub-memory files for domain-specific context

**`docs/MEMORY.md`** (session state — updated frequently):
- What was last worked on
- Any decisions made in the last session
- Known broken things
- Next immediate task

**`docs/SCHEMA.md`** (database context):
- Current table definitions (mirrors `02_Database_Schema.md` but in plain language)
- Any pending migrations

**`docs/DECISIONS.md`** (architectural log):
- Key decisions made during build with brief rationale
- Things explicitly ruled out and why

Keep CLAUDE.md stable. Update MEMORY.md at the end of every significant session.

---

## 7. CI/CD

Vercel auto-deploys on push to `main`. No additional CI configuration required for Phase 1.

Preview deployments are created automatically for pull requests — useful for testing before
merging even in a solo build.

Confirm the first deploy works before writing any feature code:
1. Push the scaffold
2. Verify Vercel picks it up and deploys successfully
3. Confirm env vars are set in the Vercel dashboard (not just locally)

---

## 8. Testing Infrastructure

The PRD requires at least one passing test of each type before feature development.

**Unit tests** — Vitest (ships with Vite ecosystem):
```bash
npm install -D vitest @testing-library/react @testing-library/user-event jsdom
```

Add to `vite.config.ts`:
```typescript
test: { environment: 'jsdom', globals: true }
```

**E2E** — Playwright:
```bash
npm init playwright@latest
```

Write one trivial passing test of each type (e.g. "app renders without crashing" for unit,
"homepage loads" for E2E) before any feature work. The goal is a working test harness, not
coverage.

---

## Gaps & Assumptions

- Supabase project and Vercel/GitHub connection are assumed as manual prerequisites — no
  automation for these.
- CLAUDE.md structure above is a default; adjust file names and structure to match your
  actual working style. The key principle is: the AI assistant should always be able to read
  current project state from these files.
- `shadcn-ui` component additions happen on a per-feature basis as needed — not all installed
  upfront.
