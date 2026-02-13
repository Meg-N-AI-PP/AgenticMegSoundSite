# Phase 4 — Agentic AI Chat Integration

> **Project:** Meg — Agentic Music Portfolio  
> **Phase:** 4 — Add AI Agent Chat to Portfolio & Music Pages  
> **Date:** February 11, 2026  
> **Status:** ✅ Completed  
> **Branch:** `meg`  
> **Prereq:** Phase 3 completed (Supabase backend, real audio, visualizers)

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Copilot Cloud Setup Guide](#copilot-cloud-setup-guide)
4. [Implementation Checklist](#implementation-checklist)
5. [Feature 1 — Portfolio Agent Chat](#feature-1--portfolio-agent-chat)
6. [Feature 2 — Music Agent (Meg Sound)](#feature-2--music-agent-meg-sound)
7. [Styling & Theme](#styling--theme)
8. [Bug Fixes & Iterations](#bug-fixes--iterations)
9. [Vector Search Architecture](#vector-search-architecture)
10. [Deployment](#deployment)

---

## Overview

Phase 4 adds **two AI agent chat experiences** powered by CopilotKit + Copilot Cloud:

| Feature | Page | What It Does |
|---------|------|-------------|
| **Portfolio Agent** | `/` | AI secretary chat where visitors ask about Meg's skills, projects, certifications. Responses stream with Generative UI cards. Detects click on project cards and proactively shares details. Includes resume download action. |
| **Meg Sound** (Music Agent) | `/music` | Floating AI music assistant positioned at top-right. Takes playback commands, generates playlists by genre/mood via **natural-language vector search** (Supabase Edge Function → OpenAI embeddings → pgvector), auto-opens with genre picker after 2 minutes idle, recommends similar tracks. |

### What Changed from Phase 3

| Before (Phase 3) | After (Phase 4) |
|-------------------|-----------------|
| Static portfolio sections | Agent-powered interactive Q&A with Generative UI cards |
| Manual music browsing only | Text commands for playback control + vector search |
| No idle detection | 2-min idle auto-open chat with dynamic genre picker |
| No recommendations | AI-driven playlist generation by natural language (OpenAI embeddings + pgvector cosine similarity) |
| No project card interactivity beyond display | Click triggers agent context about that project |
| No resume download | Resume download action with Generative UI button |
| Basic CV data | Full real CV data from Meg CV.md + my CV.md (19 projects, 4 employers) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| AI Chat SDK | CopilotKit (`@copilotkit/react-core`, `@copilotkit/react-ui`) |
| Backend Runtime | **Copilot Cloud** (hosted by CopilotKit — zero backend code) |
| LLM Model | Configured via Copilot Cloud dashboard (GPT-4o default, can switch to Azure OpenAI later) |
| Protocol | AG-UI (Agent↔User Interaction Protocol) |
| Frontend | React 18 + TypeScript (existing Vite app) |
| Vector Search | Supabase Edge Function (`smooth-handler`) → OpenAI `text-embedding-3-small` (384 dims) → pgvector cosine similarity |
| Embedding Model | OpenAI `text-embedding-3-small` with `dimensions: 384` |
| Vector DB | pgvector extension on Supabase PostgreSQL |

### How Copilot Cloud Works

```
User ↔ React App (CopilotKit Provider) ↔ Copilot Cloud (hosted runtime + LLM)
                                              ↕
                                        OpenAI / Azure OpenAI
```

- **No backend code needed** — Copilot Cloud hosts the CopilotKit runtime for you
- All tool definitions (`useCopilotAction`) live in the frontend
- Agent context (`useCopilotReadable`) is sent from the frontend to the cloud runtime
- Streaming is built-in

---

## Copilot Cloud Setup Guide

### Step 1: Get Your API Key
1. Go to [https://cloud.copilotkit.ai](https://cloud.copilotkit.ai)
2. Sign up / Sign in (free tier available)
3. Create a new project
4. Copy your **Public API Key** from the dashboard

### Step 2: Add to Environment
Add to your `.env` file in `Src/`:
```
VITE_COPILOTKIT_PUBLIC_API_KEY=ck_pub_xxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Install Packages
```bash
npm install @copilotkit/react-core @copilotkit/react-ui
```

### Step 4: Wrap App with CopilotKit Provider
In `main.tsx`, wrap the app with `<CopilotKit>` using the public API key.

### Upgrading to Azure AI Foundry Later
When you want to switch from Copilot Cloud to your own Azure OpenAI model:
1. Self-host the CopilotKit runtime as an Azure Function
2. Use `OpenAIAdapter` with your Azure OpenAI endpoint
3. Change `<CopilotKit publicApiKey="...">` to `<CopilotKit runtimeUrl="/api/copilotkit">`
4. See `phase4-agentic-planCheck.md` for the full Azure Foundry code sample

---

## Implementation Checklist

### Setup
- [x] Install `@copilotkit/react-core` and `@copilotkit/react-ui`
- [x] Add `VITE_COPILOTKIT_PUBLIC_API_KEY` to `.env`
- [x] Wrap each agent with its own `<CopilotKit>` provider (separate conversations)
- [x] Import CopilotKit CSS in `main.tsx`

### Feature 1: Portfolio Agent Chat
- [x] Create `PortfolioAgent.tsx` component (~695 lines)
- [x] Add `useCopilotReadable()` for About data (full personal info, hobbies, contact)
- [x] Add `useCopilotReadable()` for Skills data (4 categories)
- [x] Add `useCopilotReadable()` for Experience/Projects data (19 projects, 4 employers)
- [x] Add `useCopilotReadable()` for Certifications data (PL-400 + PL-200)
- [x] Create `useCopilotAction("showProjectDetail")` with Generative UI ProjectCard
- [x] Create `useCopilotAction("showSkillBreakdown")` with Generative UI SkillCategoryCard
- [x] Create `useCopilotAction("showCertification")` with Generative UI CertCard (both certs)
- [x] Create `useCopilotAction("downloadResume")` with Generative UI download button
- [x] Add project card click → silent agent trigger via `useCopilotChatInternal().sendMessage()`
- [x] MutationObserver to hide `[project-click:...]` trigger messages in chat
- [x] Add `<CopilotPopup>` with secretary persona
- [x] Style with cyan theme (`.portfolio-chat`)

### Feature 2: Music Agent (Meg Sound)
- [x] Create `MusicAgent.tsx` component (~713 lines)
- [x] Add `useCopilotReadable()` for current player state (real-time)
- [x] Add `useCopilotReadable()` for playlist tracks
- [x] Add `useCopilotReadable()` for user activity log
- [x] Add `useCopilotReadable()` for available genres
- [x] Create `useCopilotAction("controlPlayback")` — play/pause/next/prev/stop
- [x] Create `useCopilotAction("searchAndPlayMusic")` — vector search via `searchTracksVector`
- [x] Create `useCopilotAction("recommendSimilar")` — pgvector similarity
- [x] Generative UI: PlaylistCard (with delete per track + Play All), NowPlayingCard
- [x] Results stored in refs (`lastSearchResultRef`, `lastSimilarResultRef`) to avoid stale playlist display
- [x] Add 2-minute idle detection timer
- [x] Auto-open chat + dynamic genre picker (5 random genres from DB) on idle
- [x] Genre picker closes when user starts typing
- [x] `clickOutsideToClose` disabled when genre picker is visible
- [x] "✦ Click Me" floating label next to trigger button (hides when chat opens)
- [x] Add `<CopilotPopup>` positioned at top-right
- [x] Style with purple neon theme (`.music-chat`)
- [x] Custom SVG AI icon for trigger button

### Agent Architecture
- [x] Both agents always mounted in `App.tsx` (persist across navigation)
- [x] Hidden via `visibility: hidden` + `pointer-events: none` (not `display: none`)
- [x] Each agent has its own `<CopilotKit>` provider (isolated conversations)

### Polish
- [x] Custom CSS overrides for CopilotKit components (dark theme, glass effects)
- [x] Hide debug console, help modal, CopilotKit branding
- [x] Textarea text visibility fix (`-webkit-text-fill-color`, `caret-color`)
- [x] Genre label truncation via `shortGenre()` helper
- [x] Test streaming behavior
- [x] Resume button in Hero.tsx

---

## Feature 1 — Portfolio Agent Chat

### Components
| Component | Purpose |
|---|---|
| `PortfolioAgent.tsx` (~695 lines) | Wraps `<CopilotKit>` + `<CopilotPopup>`, registers all readables and actions |
| Generative UI renders | ProjectCard, SkillCategoryCard, CertCard, DownloadResumeCard |

### Agent Persona
```
Professional secretary / executive assistant for Meg's portfolio.
Non-technical, human-like. Refers to Meg in third person.
Answers about projects, skills, certifications, and provides resume downloads.
```

### Real CV Data Sources
- **Meg CV.md** — Full employment history (14 projects), personal info, hobbies, contact
- **my CV.md** — 5 additional projects (Education Platform, Contract Mgmt, Vehicle Lending, Document Approval, Copilot Studio)

### Readables (Context)
| Readable | Data |
|---|---|
| `aboutData` | Full personal info, hobbies, professional summary, contact details |
| `employmentData` | 4 employers: Swiss Post, Varkey Education, Freelancer, FPT Software |
| `skillsData` | 4 categories: Power Platform, D365 CE/CRM, Development, AI & Research |
| `projectsData` | 19 projects with role, tech stack, highlights, employer, client, location |
| `certificationData` | PL-400 Developer + PL-200 Functional Consultant |

### Actions (Tools with Generative UI)
| Action | Parameters | Renders |
|---|---|---|
| `showProjectDetail` | `projectTitle: string` | Styled ProjectCard with status, role, tech tags, highlights, employer |
| `showSkillBreakdown` | `category?: string` | SkillCategoryCard grid or single category |
| `showCertification` | none | CertCard showing both PL-400 and PL-200 side by side |
| `downloadResume` | none | Download button card linking to `/Meg-CV.pdf` |

### Project Card Click Interaction
1. User clicks a project card in Experience section
2. `clickedProject` state updates in App.tsx
3. PortfolioAgent sends silent `[project-click:ProjectName]` message via `useCopilotChatInternal().sendMessage()`
4. MutationObserver hides the trigger message from the chat UI
5. Agent responds with project details using `showProjectDetail` action

---

## Feature 2 — Music Agent (Meg Sound)

### Components
| Component | Purpose |
|---|---|
| `MusicAgent.tsx` (~713 lines) | Wraps `<CopilotKit>` + `<CopilotPopup>`, registers all readables and actions, manages idle timer, genre picker |
| GenrePickerCard | Clickable genre pill buttons (5 random from DB) shown on idle auto-open |
| PlaylistCard | Track list with album art, genre tags, delete per track, Play All button |
| NowPlayingCard | Currently playing track card with green pulse indicator |

### Agent Persona
```
Meg Sound — a cool, music-savvy AI assistant.
Short, casual responses. Uses 🎵 🎶 🎧 emoji naturally.
Smart AI music curator, not just a DJ.
Anti-hallucination rules: only reference tracks that exist in provided context.
```

### Readables (Context)
| Readable | Data |
|---|---|
| Player state | isPlaying, currentTrack (title/artist/genre/duration), playlist length, progress |
| Playlist tracks | Full track list with positions, isCurrent flag |
| User activity log | Last 15 events (played, paused, switched, resumed) |
| Available genres | Genre list from database |

### Actions (Tools with Generative UI)
| Action | Parameters | Renders | Search Method |
|---|---|---|---|
| `controlPlayback` | `command: string` | NowPlayingCard | N/A (PlayerContext) |
| `searchAndPlayMusic` | `query: string, count?: number` | PlaylistCard | `searchTracksVector()` — natural language vector search via Edge Function, fallback to random |
| `recommendSimilar` | none | PlaylistCard | `fetchSimilarTracks()` — pgvector similarity |

### Stale Playlist Fix
Search/similar results are stored in refs (`lastSearchResultRef`, `lastSimilarResultRef`) so the Generative UI `render` function always shows the correct tracks from the current search, not the previous `playerState.playlist`.

### 2-Minute Idle Auto-Open with Genre Picker
1. Timer starts when `isPlaying === false`
2. Resets on: user clicks, types, plays music, scrolls, mouse movement
3. Pauses when tab is hidden (`visibilitychange`)
4. When 2 minutes pass:
   - Programmatically clicks the popup open button via ref
   - Shows `GenrePickerCard` overlay with 5 random genres fetched from `fetchDistinctGenres()`
   - Genres are **dynamic from the database** (not hardcoded), shuffled each session
   - User picks a genre → `fetchTracksByGenre()` (exact match) → starts playing
   - Genre picker auto-closes when user starts typing in chat input
   - `clickOutsideToClose` disabled while genre picker is visible

### UI Enhancements
- **Position:** Top-right (CSS override `top: 1rem; bottom: auto;`)
- **Trigger button:** 3-color gradient (`#7c3aed → #a855f7 → #c084fc`), animated pulse glow
- **Custom SVG icon:** Play button with gradient circle + sound wave arcs
- **Header:** Gradient accent with shimmering `::after` line, ✦ sparkle prefix
- **"✦ Click Me" label:** Real DOM element floating left of trigger, animated pulse, hides when chat opens (React `isChatOpen` state)
- **Genre truncation:** `shortGenre()` helper extracts first meaningful segment

---

## Styling & Theme

All CopilotKit UI components are styled to match the existing dark agentic theme:

### Shared Base (both agents)
| Element | Style |
|---|---|
| Chat background | `#0a0a19` with backdrop blur |
| Window | `28rem` wide, `660px` tall, `20px` border-radius, glass shadow |
| Header | `rgba(12, 12, 30, 0.98)`, 60px height |
| User message | Rounded bubble with accent background |
| Agent message | Light text `rgba(255, 255, 255, 0.88)` |
| Input | Glass container, purple focus glow, white text |
| Font | `Inter` / system |
| Scrollbar | Custom 5px purple thumb |
| Hidden | Debug console, help modal, CopilotKit icon/branding |

### Portfolio Chat (`.portfolio-chat`)
| Element | Style |
|---|---|
| Primary color | Cyan `#00e5ff` |
| Button | Gradient `#0097a7 → #00e5ff` with cyan glow |
| User messages | Cyan-tinted background |

### Music Chat (`.music-chat`)
| Element | Style |
|---|---|
| Primary color | Purple `#b794f6` |
| Button | 3-gradient `#7c3aed → #a855f7 → #c084fc` with animated pulse |
| Position | Top-right (`top: 1rem`) |
| Header | Gradient accent, ✦ sparkle animation |
| Window border | Purple glow shadow |
| User messages | Purple-tinted background |
| "Click Me" label | Floating pill with pulse animation |

---

## Bug Fixes & Iterations

### Round 1 (Initial)
| # | Issue | Fix |
|---|---|---|
| 1 | CopilotKit default CSS too bright | Full CSS rewrite with dark theme, glass effects |
| 2 | Shared provider caused agent cross-talk | Separate `<CopilotKit>` provider per agent |
| 3 | Project click didn't auto-trigger detail | Silent `sendMessage()` via `useCopilotChatInternal` |
| 4 | Secretary persona too technical | Rewrote to non-technical, human-like persona |
| 5 | `fetchTracksByGenre` missing | Added to musicService.ts |
| 6 | Agent unaware of user activity | Added user activity tracking log |

### Round 2
| # | Issue | Fix |
|---|---|---|
| 1 | `sendMessage()` API wrong | Switched to `useCopilotChatInternal().sendMessage()` with AG-UI format |
| 2 | Agents unmounted on navigation | Lifted to App.tsx, always mounted with visibility toggle |
| 3 | Music search too rigid | Added `searchTracksVector()` with 4-level fallback (vector → full-text → genre → random) |

### Round 3
| # | Issue | Fix |
|---|---|---|
| 1 | Debug/help/icon visible | CSS `display: none` on debug console, help modal, header icon |
| 2 | Persona still too formal | Further secretary persona refinement |
| 3 | Project-click message visible in chat | MutationObserver hides `[project-click:...]` messages |
| 4 | Input text invisible | Fixed `color`, `-webkit-text-fill-color`, `caret-color` on textarea |
| 5 | Genre labels too long | `shortGenre()` helper for truncation |
| 6 | Playlist missing delete/play all | PlaylistCard with internal state, delete per track, Play All button |
| 7 | `display: none` caused textarea bug | Changed to `visibility: hidden` + `pointer-events: none` |

### Round 4 — CV Data Enrichment
| # | Issue | Fix |
|---|---|---|
| 1 | Portfolio data was placeholder | Full rewrite with real data from Meg CV.md |
| 2 | Missing 5 projects from my CV.md | Added Education Platform, Contract Mgmt, Vehicle Lending, Document Approval, Copilot Studio |
| 3 | Wrong employers | Fixed: Education Platform → Varkey Education, rest → Freelancer |
| 4 | Empty client/location crashed | `.filter(Boolean).join(' · ')` for graceful handling |
| 5 | No resume download | Added `downloadResume` action + resume button in Hero.tsx |
| 6 | PL-200 missing | Added alongside PL-400, side-by-side cert cards |

### Round 5 — Music Agent UX
| # | Issue | Fix |
|---|---|---|
| 1 | Name was "DJ Meg" | Renamed to "Meg Sound" everywhere |
| 2 | Chat at bottom-right | Moved to top-right via CSS |
| 3 | No AI icon | Custom SVG play icon with purple gradient |
| 4 | Idle auto-play was silent | Changed to auto-open chat + genre picker with 2-min timeout |
| 5 | Genre options hardcoded | Dynamic from DB via `fetchDistinctGenres()`, shuffled, limited to 5 |
| 6 | Genre picker click closed chat | Fixed `clickOutsideToClose={!showGenrePicker}` |
| 7 | "Click Me" label not visible | Changed from CSS `::before` pseudo-element to real DOM element |
| 8 | Genre picker stayed when typing | Added input/focus listener to auto-dismiss |
| 9 | Playlist card showed previous tracks | Stored results in refs (`lastSearchResultRef`) instead of reading stale `playerState.playlist` |
| 10 | Initial message too long | Shortened to "Hey! 🎵 Wanna hear some sound? Type a vibe, genre, or mood..." |

### Round 6 — Vector Search Implementation
| # | Issue | Fix |
|---|---|---|
| 1 | `search_tracks_by_text` RPC returned 404 | Supabase `ai` extension not available on Free plan; switched to Edge Function + OpenAI API approach |
| 2 | Edge Function CORS error (500) | Used `fetch()` instead of OpenAI SDK import; added CORS headers on all responses including errors |
| 3 | Edge Function name mismatch | Changed from `search-music` to `smooth-handler` to match deployed function name |
| 4 | `match_tracks` RPC not found | Created SQL function in Supabase with `security definer` + grants to anon/authenticated/service_role |
| 5 | Vector dimension mismatch (384 vs 1536) | Updated SQL function to `vector(384)` + added `dimensions: 384` to OpenAI embedding request |
| 6 | Two round-trips (IDs then full rows) | Updated `match_tracks` to return full track rows directly |
| 7 | Repeated queries hit OpenAI every time | Added in-memory cache (`Map`) with 5-minute TTL |
| 8 | Text fallback chain unnecessary | Removed ilike/tag/genre fallbacks — vector-only search with random fallback |

---

## Deployment

### GitHub Actions Workflow
The workflow at `.github/workflows/azure-static-web-apps-polite-dune-07f36da0f.yml` deploys to Azure Static Web Apps on push to `main`.

### Required GitHub Secrets
| Secret | Purpose |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN_POLITE_DUNE_07F36DA0F` | Azure SWA deployment token (existing) |
| `VITE_SUPABASE_URL` | Supabase project URL (existing) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (existing) |
| `VITE_COPILOTKIT_PUBLIC_API_KEY` | **NEW** — CopilotKit public API key from Copilot Cloud |

### Deploy Steps
1. Add `VITE_COPILOTKIT_PUBLIC_API_KEY` secret in GitHub repo settings
2. Merge `meg` branch into `main`
3. Push to `main` → GitHub Actions auto-deploys

---

## Vector Search Architecture

### Overview
All music search is **natural language only** — no text-based fallback chains. User queries like "dark phonk bass heavy" or "something chill to vibe to" are converted to vector embeddings and matched against track embeddings using cosine similarity.

### Pipeline
```
User types query (e.g., "chill lofi")
  → Frontend calls searchTracksVector()
    → supabase.functions.invoke('smooth-handler', { query, count })
      → Edge Function calls OpenAI text-embedding-3-small (384 dims)
        → Returns 384-dim vector
      → Edge Function calls match_tracks RPC with query vector
        → pgvector cosine similarity (1 - embedding <=> query_embedding)
        → Returns full track rows sorted by similarity
      → Frontend maps rows to MusicTrack[], starts playback
```

### Supabase Setup

#### 1. Extensions (SQL Editor)
```sql
create extension if not exists vector with schema extensions;
```

#### 2. Embedding Column
```sql
alter table tracks add column if not exists embedding vector(384);
```

#### 3. SQL Function — `match_tracks`
Returns **full track rows** (not just IDs) to eliminate a second round-trip:
```sql
create or replace function match_tracks(
  query_embedding vector(384),
  match_count int default 6
)
returns table (
  id uuid, title text, artist text, genre text,
  duration text, color text, tags text[],
  audio_path text, image_path text, play_count int,
  similarity float4
)
language plpgsql security definer
as $$
begin
  return query
    select t.id, t.title, t.artist, t.genre, t.duration, t.color,
           t.tags, t.audio_path, t.image_path, t.play_count,
           (1 - (t.embedding <=> query_embedding))::float4 as similarity
    from tracks t
    where t.embedding is not null
    order by t.embedding <=> query_embedding
    limit match_count;
end;
$$;
```

#### 4. Edge Function — `smooth-handler`
- **URL:** `https://<project>.supabase.co/functions/v1/smooth-handler`
- **Runtime:** Deno (Supabase Edge Functions)
- **Secrets required:** `OPENAI_API_KEY` (set in Supabase Dashboard → Edge Functions → Secrets)
- **Auto-available:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- Calls OpenAI `/v1/embeddings` with `model: text-embedding-3-small`, `dimensions: 384`
- Calls `match_tracks` RPC with the resulting vector
- Returns full track rows with CORS headers

#### 5. Populating Embeddings
Track embeddings are generated using OpenAI `text-embedding-3-small` by combining: `title + artist + genre + tags` into a single text string. Can be populated:
- **Manually** — paste vectors into the `embedding` column
- **Script** — Node.js script calling OpenAI API + Supabase update
- **Trigger** — auto-generate on insert/update via `generate_track_embedding()` trigger function

### Frontend Implementation

| Feature | Detail |
|---------|--------|
| **Function** | `searchTracksVector(query, count)` in `musicService.ts` |
| **Cache** | In-memory `Map` with 5-minute TTL — instant response for repeated queries |
| **Single round-trip** | Edge Function returns full track rows (no second `.select('*')` needed) |
| **Fallback** | Random tracks only (if Edge Function unavailable) |
| **Offline** | Fuzzy text search across title/artist/genre/tags when Supabase not configured |

### Performance Optimizations
| Optimization | Impact |
|-------------|--------|
| `match_tracks` returns full rows | Eliminates 1 round-trip (~200-400ms saved) |
| In-memory cache (5 min TTL) | Instant response for repeat queries (~1-2s saved) |
| `dimensions: 384` (not 1536) | Smaller vectors = faster cosine distance computation |
| Vector-only search (no text fallback) | Simpler code path, single API call |

---

### Key Files Changed
| File | Changes |
|---|---|
| `Src/src/components/PortfolioAgent.tsx` | **NEW** — ~695 lines, full portfolio agent |
| `Src/src/components/MusicAgent.tsx` | **NEW** — ~713 lines, full music agent |
| `Src/src/App.tsx` | Agent mounting, routing, visibility toggle |
| `Src/src/App.css` | ~1880 lines total — CopilotKit theme, music-chat, portfolio-chat |
| `Src/src/main.tsx` | CopilotKit CSS import |
| `Src/src/services/musicService.ts` | `searchTracksVector` (vector-only via Edge Function + cache), `fetchDistinctGenres`, `fetchTracksByGenre` |
| `Src/src/components/Hero.tsx` | Resume download button |
| `Src/src/components/About.tsx` | Real CV data, 19+ projects stat |
| `Src/src/components/Experience.tsx` | 19 projects grouped by 4 employers |
| `Src/src/components/Skills.tsx` | Real skill categories from CV |
| `Src/src/components/Certifications.tsx` | PL-400 + PL-200 side by side |
| `Src/package.json` | Added `@copilotkit/react-core`, `@copilotkit/react-ui` |
| `.github/workflows/*.yml` | Added `VITE_COPILOTKIT_PUBLIC_API_KEY` env |
