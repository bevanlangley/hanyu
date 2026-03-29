# Cross-Cutting Patterns — HuaYu

These patterns apply across the entire codebase. Apply them consistently in every feature.

## 1. Logging (`src/lib/logger.ts`)

In production, only `warn` and `error` emit. In dev, all levels active.

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error'
const isDev = import.meta.env.DEV

export const logger = {
  debug: (msg: string, data?: unknown) => isDev && console.debug(`[DEBUG] ${msg}`, data),
  info:  (msg: string, data?: unknown) => isDev && console.info(`[INFO] ${msg}`, data),
  warn:  (msg: string, data?: unknown) => console.warn(`[WARN] ${msg}`, data),
  error: (msg: string, error?: unknown) => console.error(`[ERROR] ${msg}`, error),
}
```

Apply to every Supabase operation:
```typescript
logger.info('Fetching seeds')
const { data, error } = await supabase.from('seeds').select('*')
if (error) { logger.error('Failed to fetch seeds', error); /* handle */ return }
logger.info('Seeds fetched', { count: data?.length })
```

## 2. Supabase Error Handling (Standard Pattern)

```typescript
const { data, error } = await supabase.from('seeds').select('*')
if (error) {
  logger.error('Operation name failed', error)
  toast.error('Human-readable message. Try again.')
  return // or throw, depending on context
}
```

**Never expose raw Supabase error messages to users.** Always use plain-language toast messages.

## 3. Form Validation (`react-hook-form` + `zod`)

Every form. No exceptions. Schemas in `src/lib/schemas/` — one file per entity.

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

- Use `mode: 'onBlur'` or `mode: 'onSubmit'` — never show errors before first blur/submit.
- Always `.trim()` string fields at schema level.
- Render errors below field via `aria-describedby`.

## 4. Error Boundary (`src/components/shared/ErrorBoundary.tsx`)

Wraps the router `<Outlet>`. Catches unexpected render errors, shows `<ErrorPage>`.

```typescript
componentDidCatch(error: Error, info: React.ErrorInfo) {
  logger.error('Unhandled render error', { error, componentStack: info.componentStack })
}
```

`<ErrorPage>`: brief message + technical detail (dev only) + "Reload page" button.

## 5. Confirm Dialog (Global Singleton)

Mounted once in `<AppShell>` via React context. **Never use `window.confirm()`.**

```typescript
const { openConfirmDialog } = useConfirmDialog()

openConfirmDialog({
  title: 'Delete this Seed?',
  description: 'This will permanently delete My Seed and its 14 Phrases. This can\'t be undone.',
  onConfirm: async () => { await deleteSeed(seedId) }
})
```

Dialog handles loading state on `onConfirm`. Errors inside `onConfirm` → error toast, dialog closes.

## 6. Pagination (`<Pagination>` component)

```typescript
interface PaginationProps {
  currentPage: number   // 1-indexed
  totalItems: number
  pageSize: number      // always 25
  onPageChange: (page: number) => void
}
```

Renders: Previous | "Page X of Y" | Next. Show pagination when `totalItems > 50` (threshold applied by parent). Page size: 25.

## 7. Skeleton Loader (`<Skeleton>` in `src/components/ui/`)

```typescript
interface SkeletonProps { className?: string }
// Seed card: <Skeleton className="h-20 w-full" /> repeated 3x
```

Uses `animate-pulse bg-grey-100`. Disable animation when `prefers-reduced-motion` is set.

## 8. TTS Audio Button

Three states: idle, playing, voice-unavailable. Min 36×36px touch target.
`aria-label="Play [Mandarin text]"` when idle, `"Pause"` when playing.
TTS locale: **always `zh-TW`**. Check voice availability at app load; set a global flag.

## 9. Accessibility (Enforce in Code)

- **Icon-only buttons**: must have `aria-label`
- **Modals**: `role="dialog"`, `aria-modal="true"`, focus trap (shadcn radix-dialog handles this)
- **Close buttons**: `aria-label="Close dialog"`
- **Dynamic content**: announce list changes via visually-hidden `aria-live="polite"` region
- **Non-button with onClick**:
  ```tsx
  role="button" tabIndex={0}
  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); action() } }}
  ```
- **Keyboard drilling shortcuts**: `keydown` on document, removed on cleanup

## 10. Environment Guard (`src/main.tsx`)

```typescript
const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
const missing = requiredEnvVars.filter(key => !import.meta.env[key])
if (missing.length > 0) {
  document.body.innerHTML = `<pre>Missing environment variables: ${missing.join(', ')}</pre>`
  throw new Error(`Missing env vars: ${missing.join(', ')}`)
}
```

Fail loudly at startup rather than producing cryptic runtime errors.

## 11. Standard Mutation Flow

(1) Validate via zod schema → (2) `logger.info` + call Supabase → (3) On error: `logger.error` + `toast.error` + return → (4) On success: update local state + `toast.success`
