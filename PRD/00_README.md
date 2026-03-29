# HuaYu — Project README

## Overview

HuaYu is a personal Taiwanese Mandarin acquisition environment. It connects external learning
sources (Seeds) to a phrase library (Phrases) and deploys that library in AI-generated scripted
conversations (Dialogues — Phase 2). Built as a single-page React app with no custom backend;
all data goes directly from the browser to Supabase.

Phase 1 is the current build target. Every phase must be a fully working app before the next
phase begins. Do not scaffold Phase 2 or Phase 3 features during Phase 1 development — schema
definitions are provided for forward-compatibility only.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript 5 |
| Build tool | Vite 5 |
| Routing | React Router 6 |
| Styling | Tailwind CSS 3 + shadcn/ui |
| Icons | Lucide React |
| Forms | react-hook-form + zod |
| Toasts | sonner |
| Class utils | clsx + tailwind-merge |
| Database | Supabase (Postgres via JS client v2) |
| TTS | Web Speech API (browser-native, zh-TW) |
| AI (Phase 2) | Anthropic API (user-supplied key, localStorage) |
| Deployment | Vercel (auto-deploy on push) |
| Version control | GitHub |

No custom backend. No SSR. No API routes. Vercel serves the static build.

---

## File Structure (This Document Set)

| File | Description |
|------|-------------|
| `00_README.md` | This file — overview, stack, gaps summary |
| `01_Project_Setup.md` | Scaffold, env config, Supabase init, DX setup |
| `02_Database_Schema.md` | Supabase tables, types, deletion behaviour |
| `03_UI_Design_System.md` | Central design reference — colours, type, components |
| `04_App_Shell_Navigation.md` | Router, nav, global states, shell components |
| `05_Seeds_CRUD.md` | Seeds list, create, edit, delete |
| `06_Phrases_Within_Seed.md` | Phrases scoped to a Seed — CRUD, pagination |
| `07_Phrases_Global_View.md` | Global Phrases list — search, filter |
| `08_TTS_Audio.md` | Web Speech API integration, fallback, states |
| `09_Fluency_Drilling.md` | Auto-play, loop, drill prompt, step-through |
| `10_Foundations_Technical.md` | Logging, errors, validation pattern, a11y |
| `11_Future_Dialogues.md` | Phase 2 Dialogues — full spec, deferred |
| `12_Future_Phase3_And_Beyond.md` | Phase 3+ items — deferred parking lot |

---

## Build Sequence

Implement in this order:

1. Project setup and DX foundations (`01`)
2. Database schema — create tables in Supabase (`02`)
3. Design system — configure tokens, install shadcn components (`03`)
4. App shell and routing (`04`)
5. Technical foundations — logging, error boundaries, validation (`10`)
6. Seeds CRUD (`05`)
7. Phrases within Seed (`06`)
8. Global Phrases view (`07`)
9. TTS Audio (`08`)
10. Fluency Drilling (`09`)

Phase 2 (Dialogues) begins only after Phase 1 is complete and validated.

---

## Key Gaps (Flagged Across the Document Set)

These items are unresolved in the source PRD and will need decisions before or during build:

| Gap | Location | Default Applied |
|-----|----------|----------------|
| Routing path structure not specified | `04` | Conventional paths defined in `04` |
| Tag filter UI pattern unspecified | `05`, `07` | Pill/toggle selector |
| Pagination behaviour ambiguity (>50 triggers pagination — page size 25, but does page 1 show 25 or 50?) | `06` | Page 1 shows items 1–25 once count exceeds 50 |
| Add/Edit Phrase form — modal vs dedicated view | `06` | Modal |
| CLAUDE.md structure unspecified | `01` | Tiered structure defined in `01` |
| Supabase project and anon key are assumed to exist as external prerequisites | `01`, `02` | Noted as manual setup step |
| zh-TW voice availability varies by device — no pre-flight check specified | `08` | Check on app load, set global flag |

---

## Core Design Constraints (Non-Negotiable)

1. **Taiwanese Mandarin only** — all TTS must use `zh-TW` locale. All AI-generated content
   (Phase 2) must be prompted for Taiwanese vocabulary and phrasing. This is an architectural
   constraint, not a preference.

2. **The AI must not respond smoothly to broken Mandarin (Phase 3)** — comfortable responses
   teach nothing. This constraint must survive into Phase 3 prompt engineering.

3. **Each phase is a complete working app** — no half-built features, no scaffolded-but-broken
   Phase 2 code in a Phase 1 build.
