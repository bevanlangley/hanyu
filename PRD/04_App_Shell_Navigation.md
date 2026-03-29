# App Shell & Navigation

## Overview

The structural wrapper for the entire app: routing, persistent navigation, global state
containers (toast, confirmation dialog), and all error/loading/empty shell components.
This is built before any feature work begins.

## Dependencies

- `01_Project_Setup.md` — React Router installed
- `03_UI_Design_System.md` — Design tokens and component specs

---

## Routing Structure

React Router 6. All routes are client-side. No SSR.

| Path | View | Notes |
|------|------|-------|
| `/` | Redirect → `/seeds` | |
| `/seeds` | Seeds list | Default landing view |
| `/seeds/:seedId` | Seed detail (Phrases list + drilling) | |
| `/seeds/:seedId/phrases/new` | Add Phrase modal trigger | Modal overlaid on Seed detail |
| `/seeds/:seedId/phrases/:phraseId/edit` | Edit Phrase modal trigger | Modal overlaid on Seed detail |
| `/phrases` | Global Phrases view | |
| `*` | 404 page | |

Seed create/edit are modals triggered from the Seeds list — no dedicated routes needed.
Phrase create/edit are modals triggered from the Seed detail view. The URL updates to
reflect the modal state (enables deep-linking and browser back to close).

---

## Navigation Structure

Two top-level sections in Phase 1: **Seeds** and **Phrases**.

The Dialogues nav item does not exist in Phase 1. It is added fresh when Phase 2 is built —
do not scaffold a disabled or hidden Dialogues link.

### Desktop (≥1024px)

Sidebar navigation, fixed left. Contains:
- App logo / name "華語" (top)
- Nav links: Seeds, Phrases
- Dark/light mode toggle (bottom of sidebar)

### Mobile/Tablet (<1024px)

Bottom tab bar with icons and labels: Seeds | Phrases.
Dark/light mode toggle moves to a top-right header button.

### Active State

Active nav item: `primary-100` background, `primary-700` text, `primary-500` left border
accent (desktop) or `primary-500` underline/indicator (mobile tab bar).

---

## App Shell Component Structure

```
<AppShell>
  <Sidebar /> or <BottomNav />       — persistent navigation
  <main>
    <Outlet />                        — React Router outlet
  </main>
  <Toaster />                         — sonner toast container (global)
  <ConfirmationDialog />              — global singleton modal
</AppShell>
```

The `ConfirmationDialog` is a singleton controlled by a global store (Zustand or React
context — either is fine). Any component triggers it by calling `openConfirmDialog({ title,
description, onConfirm })`. It is never instantiated per-feature.

---

## Global UI States

### Loading States

Every async operation shows a loading state. Two patterns:

- **Skeleton loaders** (preferred for list/card views): grey-100 animated pulse, matching
  the shape of the real content
- **Spinner** (for button actions): replaces button label, width locked to prevent layout
  shift

A reusable `<Skeleton>` component and a `<Spinner>` component are created in
`src/components/ui/` during shell setup.

### Error States

| Type | Component | Behaviour |
|------|-----------|-----------|
| Page-level (route fails to load) | `<ErrorPage>` | Full-page error with retry button |
| Widget-level (e.g. Phrases list fails) | `<InlineError>` | Inline error within the card/section |
| Form field | Inline below field | Via react-hook-form error state |
| Async action (e.g. delete fails) | Toast (error variant) | Via sonner |
| 404 | `<NotFoundPage>` | Full-page with link back to Seeds |

A React error boundary wraps the `<Outlet>` to catch unexpected render errors and show
`<ErrorPage>`. See `10_Foundations_Technical.md` for error boundary implementation.

### Empty States

Every list, grid, and data view has a designed empty state. Requirements:
- Illustration or icon (Lucide, 48px)
- Heading explaining the empty state
- One-sentence description
- Primary CTA button (e.g. "Create your first Seed")

The Seeds list empty state copy specifically should reference the core concept: something
along the lines of "YouTube gave you input. Anki gave you repetition. Nothing connected them.
That's what Seeds are for." — see User Journey for tone guidance.

---

## Theme Toggle (Dark / Light Mode)

System preference detection on load via `prefers-color-scheme`. Manual toggle stored in
`localStorage` under key `huayu_theme` (`'light'` | `'dark'`).

Apply the active theme as a class on `<html>`: `class="dark"` or `class="light"`. Tailwind
dark mode configured as `class` strategy (not `media`) to support manual override.

---

## Offline / Connectivity Detection

The app is intended for use on mobile in real-world environments. Handle network unavailability
gracefully:

- Listen to `navigator.onLine` and the browser's `online`/`offline` events
- When offline: show a persistent warning banner ("No connection — changes won't save until
  you're back online")
- TTS audio via Web Speech API is browser-native and does not require network — this remains
  functional offline
- Supabase reads/writes fail gracefully: show `<InlineError>` with a retry button, not a
  crash

---

## Favicon

Required per Feature List. Use a simple character-based favicon — the character 語 or 華 in
the primary-500 colour on a transparent background. SVG favicon preferred for sharpness across
resolutions.

---

## Page Structure Conventions

Applied consistently across all views:

- Page title (h1) at the top of the content area
- Primary action button right-aligned at the same level as the page title
- Content below
- Breadcrumb navigation on Seed detail view only: "Seeds › [Seed name]"

---

## Gaps & Assumptions

- The Confirmation Dialog global state manager: Zustand is cleaner but adds a dependency.
  React context is sufficient. Default: React context unless Zustand is already in the
  project for another reason.
- Sidebar vs top nav on desktop: sidebar is the default (specified implicitly by the two
  top-level sections and desktop layout description in the design system).
- No loading bar / route transition indicator specified — default: none (skeleton loaders
  per-view are sufficient).
