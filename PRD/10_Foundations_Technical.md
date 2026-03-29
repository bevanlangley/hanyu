# Technical Foundations

## Overview

Cross-cutting technical patterns applied throughout the entire codebase. These are not
features — they are the structural layer every feature file depends on. Set up before
feature development begins. All patterns here are referenced by name in other files rather
than re-specified per feature.

## Dependencies

- `01_Project_Setup.md` — project scaffold, testing infrastructure
- `03_UI_Design_System.md` — error state and skeleton component specs
- `04_App_Shell_Navigation.md` — error boundary wraps the router outlet

---

## 1. Logging Utility

A thin wrapper around `console` with environment-aware log levels. Applied to every function
entry/exit, every Supabase call and response, and every error with full context.

```typescript
// src/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isDev = import.meta.env.DEV

export const logger = {
  debug: (msg: string, data?: unknown) => isDev && console.debug(`[DEBUG] ${msg}`, data),
  info:  (msg: string, data?: unknown) => isDev && console.info(`[INFO] ${msg}`, data),
  warn:  (msg: string, data?: unknown) => console.warn(`[WARN] ${msg}`, data),
  error: (msg: string, error?: unknown) => console.error(`[ERROR] ${msg}`, error),
}
```

In production, only `warn` and `error` are emitted. In development, all levels are active.

**Usage pattern** (apply consistently across all Supabase operations):
```typescript
logger.info('Fetching seeds')
const { data, error } = await supabase.from('seeds').select('*')
if (error) {
  logger.error('Failed to fetch seeds', error)
  // handle error
}
logger.info('Seeds fetched', { count: data?.length })
```

---

## 2. Error Boundary

A React error boundary wrapping the router `<Outlet>` in the app shell. Catches unexpected
render errors and displays `<ErrorPage>` instead of a blank screen.

```typescript
// src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('Unhandled render error', { error, componentStack: info.componentStack })
  }

  render() {
    if (this.state.hasError) return <ErrorPage error={this.state.error} />
    return this.props.children
  }
}
```

`<ErrorPage>` shows: a brief message ("Something went wrong"), an optional technical detail
(dev only), and a "Reload page" button.

---

## 3. Form Validation Pattern

Every form in the app uses `react-hook-form` + `zod`. No exceptions.

**Standard pattern:**

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const seedSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  source_url: z.string().optional(),
  tag: z.string().optional(),
})

type SeedFormValues = z.infer<typeof seedSchema>

const form = useForm<SeedFormValues>({ resolver: zodResolver(seedSchema) })
```

Install the resolver: `npm install @hookform/resolvers`.

Schema files live in `src/lib/schemas/` — one file per domain entity (seeds, phrases,
dialogues). Schemas are imported by both form components and any server-side validation
if added in future phases.

**Field-level error display:** Error message rendered below the field, associated via
`aria-describedby`. Never show errors before the user has attempted to submit or blur the
field (`mode: 'onBlur'` or `mode: 'onSubmit'`).

---

## 4. Standard Supabase Error Handling

All Supabase operations follow this pattern:

```typescript
const { data, error } = await supabase.from('seeds').select('*')

if (error) {
  logger.error('Operation name failed', error)
  toast.error('Human-readable message. Try again.')
  return // or throw, depending on context
}
```

**Do not expose raw Supabase error messages to users.** Always use a plain-language toast
message. Log the full error for debugging.

**Network failures** surface as Supabase errors with `error.message` containing fetch-related
text. These are handled by the same pattern — no special-casing needed.

---

## 5. Pagination Component

A reusable `<Pagination>` component used by both `06_Phrases_Within_Seed.md` and
`07_Phrases_Global_View.md`. Accepts:

```typescript
interface PaginationProps {
  currentPage: number      // 1-indexed
  totalItems: number
  pageSize: number         // always 25
  onPageChange: (page: number) => void
}
```

Displays: Previous button | "Page X of Y" | Next button. Previous disabled on page 1.
Next disabled on the last page. No ellipsis or page number list — simple prev/next only.

The pagination threshold (show pagination when `totalItems > 50`) is applied by the parent
component, not by `<Pagination>` itself. `<Pagination>` renders whenever it's mounted.

---

## 6. Skeleton Loader Component

A reusable `<Skeleton>` component for loading states. Renders a grey-100 animated pulse
block matching the dimensions of the real content it replaces.

```typescript
// src/components/ui/Skeleton.tsx
interface SkeletonProps {
  className?: string  // Width and height set by consumer via className
}
```

Usage: render N `<Skeleton>` blocks matching the shape of the list items while data loads.
For Seed cards: `<Skeleton className="h-20 w-full" />` repeated 3 times.

Animation: `animate-pulse` (Tailwind built-in) on a `bg-grey-100` div. Respect
`prefers-reduced-motion` — disable animation when set.

---

## 7. Confirmation Dialog (Global Singleton)

A single modal instance controlled by React context. Mounted once in `<AppShell>`.

```typescript
// Context API
interface ConfirmDialogOptions {
  title: string
  description: string       // Must include what will be destroyed and that it's permanent
  confirmLabel?: string     // Default: "Delete"
  onConfirm: () => void | Promise<void>
}

// Usage from any component
const { openConfirmDialog } = useConfirmDialog()

openConfirmDialog({
  title: 'Delete this Seed?',
  description: 'This will permanently delete My Seed and its 14 Phrases. This can\'t be undone.',
  onConfirm: async () => { await deleteSeed(seedId) }
})
```

The dialog handles its own loading state during async `onConfirm` — the Danger button shows
a spinner and is disabled while the operation runs. Errors inside `onConfirm` are caught and
surfaced as an error toast; the dialog closes.

Never use `window.confirm()` anywhere in the codebase.

---

## 8. Input Validation & Sanitisation

- **Frontend:** All user inputs validated via zod schemas before submission (see §3)
- **Trim all string inputs** before insert/update — enforced at the schema level
  (`z.string().trim()`) so trimming is consistent and never forgotten
- **Never trust client data** as a principle — even though Phase 1 has no backend, all
  data written to Supabase should have passed through zod validation first

---

## 9. Accessibility Checklist (Implementation Notes)

Beyond the design system spec in `03_UI_Design_System.md`, enforce these in code:

- **Icon-only buttons** must have `aria-label` — Lucide icons render as SVG with no text
- **Modals** must trap focus when open (`@radix-ui/react-dialog` via shadcn handles this)
- **Dynamic content** (list updates after add/delete) should announce changes via a
  visually-hidden `aria-live="polite"` region if the change isn't visually obvious
- **Keyboard navigation:** All interactive elements reachable by Tab. Drilling mode keyboard
  shortcuts (see `09_Fluency_Drilling.md`) use `keydown` listeners on the document, removed
  on cleanup

---

## 10. Environment Guard (App Init)

In `src/main.tsx`, before rendering the app, validate required environment variables:

```typescript
const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
const missing = requiredEnvVars.filter(key => !import.meta.env[key])
if (missing.length > 0) {
  document.body.innerHTML = `<pre>Missing environment variables: ${missing.join(', ')}</pre>`
  throw new Error(`Missing env vars: ${missing.join(', ')}`)
}
```

Fail loudly at startup rather than producing cryptic Supabase errors at runtime.

---

## Gaps & Assumptions

- Rate limiting: Phase 1 Supabase queries are governed by Supabase's own limits. No
  additional middleware. Rate limiting is introduced in Phase 2 for Anthropic API calls.
- Data export (JSON/CSV) is in the Feature List as a Tier 3 foundational feature. It is not
  implemented in Phase 1 — included in `12_Future_Phase3_And_Beyond.md`.
- No centralised state management library (Zustand etc.) is added in Phase 1 unless the
  Confirmation Dialog context becomes unwieldy. React context is sufficient.
