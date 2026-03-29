# UI Design System

## Overview

Central design reference for all feature files. Every UI decision — colours, spacing, type,
component variants — should be implemented by referencing this file rather than making ad-hoc
choices. The design direction is **Structured Calm**: a quiet, intentional space for personal
language acquisition. Like a well-organised notebook — focused without being clinical, warm
without being playful.

## Dependencies

- `01_Project_Setup.md` — Tailwind and shadcn must be installed first

---

## Colour Tokens

Configure all tokens in `tailwind.config.js` and as CSS variables in `src/index.css`.
Never hardcode hex values anywhere in the codebase.

### Primary — Jade Teal

| Token | Hex | Tailwind Key | Usage |
|-------|-----|-------------|-------|
| primary-50 | `#f0faf8` | `primary-50` | Subtle tinted backgrounds, hover fills |
| primary-100 | `#d0f0ea` | `primary-100` | Active backgrounds, selected states |
| primary-200 | `#a3e0d4` | `primary-200` | Borders on tinted surfaces |
| primary-300 | `#6dc9b8` | `primary-300` | Decorative accents |
| primary-400 | `#3daf9c` | `primary-400` | Primary in dark mode |
| primary-500 | `#2a9484` | `primary-500` | **Primary in light mode — main CTA only** |
| primary-600 | `#1f7a6d` | `primary-600` | Hover on primary buttons |
| primary-700 | `#165f55` | `primary-700` | Active/pressed |
| primary-800 | `#0e4540` | `primary-800` | Dark text on light primary fills |

### Secondary — Warm Amber (Tags Only)

| Token | Hex | Usage |
|-------|-----|-------|
| secondary-100 | `#fef3c7` | Tag backgrounds |
| secondary-400 | `#e9a80b` | Tag text, badge fills |
| secondary-500 | `#c78a00` | Hover on secondary elements |

### Neutrals — Cool Grey

| Token | Hex | Light mode usage | Dark mode usage |
|-------|-----|-----------------|----------------|
| grey-50 | `#f9fafb` | Page background | — |
| grey-100 | `#f3f4f6` | Card backgrounds | — |
| grey-200 | `#e5e7eb` | Borders, dividers | — |
| grey-300 | `#d1d5db` | Placeholder text, disabled borders | — |
| grey-400 | `#9ca3af` | Muted text, icons | — |
| grey-500 | `#6b7280` | Secondary text | — |
| grey-600 | `#4b5563` | Body text | — |
| grey-700 | `#374151` | Strong text | Surface 2 (elevated) |
| grey-800 | `#1f2937` | — | Surface 1 (cards) |
| grey-900 | `#111827` | — | Page background |

### Semantic

| Role | Light bg | Light text | Dark bg | Dark text |
|------|----------|------------|---------|-----------|
| Success | `#d1fae5` | `#065f46` | `#065f46` | `#d1fae5` |
| Warning | `#fef3c7` | `#92400e` | `#92400e` | `#fef3c7` |
| Error | `#fee2e2` | `#991b1b` | `#991b1b` | `#fee2e2` |
| Info | `#dbeafe` | `#1e40af` | `#1e40af` | `#dbeafe` |

### Colour Rules

- `primary-500` is for the single main CTA per view only — it loses meaning if overused
- Amber tokens are for tags and categorisation only
- Semantic red for genuine errors only — never for cancel or destructive-but-not-dangerous actions
- In dark mode, shift primary to `primary-400`
- Never hardcode colour values — always use tokens

---

## Typography

**Latin:** `Inter` | **Chinese characters:** `Noto Sans TC`

```css
font-family: 'Inter', 'Noto Sans TC', system-ui, sans-serif;
```

Both fonts loaded via Google Fonts. Inter and Noto Sans TC are specified in the PRD design
system — do not substitute.

### Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| display | 36px | 500 | 1.2 | Page heroes, empty states |
| h1 | 28px | 500 | 1.3 | Page titles |
| h2 | 22px | 500 | 1.35 | Section headings |
| h3 | 18px | 500 | 1.4 | Card headings |
| body-lg | 16px | 400 | 1.6 | Default body |
| body | 14px | 400 | 1.6 | Secondary body, descriptions |
| label | 13px | 500 | 1.4 | Form labels, table headers |
| caption | 12px | 400 | 1.5 | Timestamps, metadata |

### Mandarin / Pinyin Sizing Rule

- Mandarin characters: use scale above as-is
- Pinyin: one step smaller than the Mandarin it labels (e.g. body-lg Mandarin → body Pinyin)
- English translation: same size as Pinyin, `grey-500`

### Typography Rules

- Two weights only: 500 for headings and labels, 400 for everything else
- Never use weight 600 or 700
- Minimum body text: 14px
- Never set caption below 12px
- Heading hierarchy must never skip levels

---

## Spacing

Base unit: 4px. All spacing is multiples of 4.

| Token | Value | Primary usage |
|-------|-------|---------------|
| space-1 | 4px | Tight internal gaps |
| space-2 | 8px | Compact internal padding |
| space-3 | 12px | Default internal padding |
| space-4 | 16px | Standard card padding |
| space-6 | 24px | Gap between cards |
| space-8 | 32px | Section padding |
| space-12 | 48px | Page vertical rhythm |

---

## Border Radius & Shadows

| Token | Value | Usage |
|-------|-------|-------|
| radius-sm | 4px | Badges, inline tags |
| radius-md | 6px | Inputs, buttons |
| radius-lg | 8px | **Default — cards, modals, panels** |
| radius-xl | 12px | Large containers |
| radius-full | 9999px | Pills, avatars |

| Token | Value | Usage |
|-------|-------|-------|
| shadow-sm | `0 1px 2px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.04)` | Cards (light mode) |
| shadow-md | `0 4px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)` | Dropdowns, tooltips |
| shadow-focus | `0 0 0 3px rgba(42,148,132,0.35)` | Focus ring — never remove |

In dark mode: use `border: 1px solid grey-700` instead of box shadows on cards.

---

## Component Specs

### Buttons

| Variant | Background | Text | Border | When to use |
|---------|------------|------|--------|-------------|
| Primary | primary-500 | white | none | Main CTA — one per view |
| Secondary | transparent | primary-500 | primary-500 1px | Supporting actions |
| Ghost | transparent | grey-600 | grey-200 1px | Tertiary, cancel |
| Danger | transparent | error-text | error-border 1px | Destructive actions |

| Size | Height | Horizontal padding | Font size |
|------|--------|--------------------|-----------|
| sm | 32px | 12px | 13px |
| md | 38px | 16px | 14px |
| lg | 44px | 20px | 15px |

States: hover primary → primary-600. Active/pressed → `scale(0.98)` 80ms. Disabled →
opacity 0.4, cursor not-allowed. Loading → spinner replaces label, width locked.

Rules: one primary button per view. Minimum 44px touch target on mobile. Never two primary
buttons competing. Never disable without nearby explanation.

### Form Inputs

| State | Border | Background |
|-------|--------|------------|
| Default | grey-300 | white |
| Hover | grey-400 | white |
| Focus | primary-500 2px + focus ring | white |
| Error | error-border 2px | error-bg subtle |
| Disabled | grey-200 | grey-50, opacity 0.6 |

Labels always above the input. Placeholder text is a hint, not a label. Single-line height
38px, textarea min 80px. Error messages below the field via aria-describedby.

### Cards

Default card: white bg (dark: grey-800), 1px solid grey-200 (dark: grey-700), radius-lg,
space-4 padding, shadow-sm (light) / border only (dark).

**Seed card**: Full-width, horizontal layout. Phrase count badge right-aligned. Tag below name.
Hover: grey-50 bg.

**Phrase card**: Three-line layout — Mandarin (body-lg), Pinyin (body, grey-500), English
(body, grey-400). Audio play button right-aligned. Min touch target 44px.

### Tags and Badges

**Seed tags (amber):** bg secondary-100, text secondary-500, radius-full, padding 2px 8px,
12px weight 500.

**Phrase count badge (neutral):** bg grey-100, text grey-600, same sizing.

### Toasts (sonner)

Position: bottom-centre on mobile, bottom-right on desktop. Auto-dismiss after 4 seconds;
error toasts persist until dismissed. Max message: ~60 characters. Always: icon + message
+ optional dismiss button.

### Confirmation Dialog

Single reusable component. Never use `window.confirm()`. Must display what will be destroyed
(e.g. "This will also delete 14 Phrases."). Two buttons: Ghost (cancel) + Danger (confirm
destructive action).

### Audio Play Button

Min 36×36px touch target. Three visual states: idle, playing, voice-unavailable. `aria-label`
must be "Play [Mandarin text]" when idle, "Pause" when playing.

---

## Motion

| Property | Duration |
|----------|----------|
| Default transition | 150ms ease-out |
| Modals, drawers | 250ms ease-out |
| Skeleton pulse | 1.5s ease-in-out infinite |
| Button press | 80ms |

Respect `prefers-reduced-motion` — disable animations when set.

---

## Responsive Breakpoints

| Name | Breakpoint | Layout |
|------|-----------|--------|
| mobile | < 640px | Single column, 16px page padding |
| tablet | 640px–1023px | 2-column grid available |
| desktop | 1024px+ | Full layout |

On mobile: nav collapses to bottom tab bar or hamburger. Full-width cards. Minimum 44px
touch targets on all interactive elements.

---

## Accessibility Checklist (Apply to Every Component)

- All text meets 4.5:1 contrast (3:1 for large text ≥18px)
- Focus ring visible on all interactive elements (shadow-focus token)
- Colour is never the only indicator of meaning
- Touch targets minimum 44×44px on mobile
- Text resizable to 200% without loss of content
- All icons have `aria-label` or adjacent visible label
- Error messages associated with fields via `aria-describedby`
- Modals trap focus when open
- Semantic HTML throughout — correct element choices

---

## Icons

Lucide React. Sizes: 16px (inline), 20px (default — buttons, inputs, nav), 24px (standalone,
empty states). Stroke: 1.5px. Colour: `currentColor`.

---

## Gaps & Assumptions

- Dark/light mode toggle: system preference detection is the default; manual toggle is in
  scope (Feature List specifies both) but toggle placement is unspecified — default to a
  button in the top-right of the nav bar.
- Specific shadcn components to install are determined per-feature file as they come up.
