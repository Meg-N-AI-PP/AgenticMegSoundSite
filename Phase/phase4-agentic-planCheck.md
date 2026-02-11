# Structure
- Phase folder: contains phase and requirement for each phase
- Src folder: where you put all source code there

# This is phase 4 agentic plan/requirement/possible/check
- Here are some idea and you can check if any of these can be built, for the main goal is to involve agentic agent into my porforlio page, you can check phase 1, 2 and 3 for documentation about what in web already.

- Here are what I want at the moment:
1. In the portfolio page, I want a mordern agent chat that user can ask the agent about my portfolio with more details, the response from agent can be a beautiful gen UI based on the context of the question they are asked. and its stream the response, not return all as one.
    - When user click or hover on a project card information, the agent known that event and then response to user more detail about that project and ask if they have any question on it

2. In the Music Page there will be a live agent (will have an icon for that agent) and a chat. 
 - User can ask the agent to send a random playlist based on style they want, or command to stop the music, next or previous,....
 - When user stay in the page for 3 mins and no music playing, the agent automatically pick a music and play, and response to them that music genre and if they want to hear more music like it

That is all I want for know, please check if its possible and how and put the plan here.

---

# ✅ Phase 4 — Feasibility Check & Implementation Plan

> **Reviewed by:** GitHub Copilot  
> **Date:** February 11, 2026  
> **Verdict:** ✅ **Both features are fully achievable** with the current stack + CopilotKit

---

## Current Stack Context (from Phase 1–3)
| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite 6 |
| Routing | react-router-dom (2 routes: `/` portfolio, `/music` music station) |
| Animations | anime.js + native Canvas |
| Styling | Pure CSS (dark agentic theme) |
| Audio | Web Audio API via PlayerContext (analyser, frequency data, visualizers) |
| Data | Supabase (PostgreSQL + Storage + pgvector RPCs) + offline fallback |
| Hosting | Azure Static Web Apps |

---

## Recommended Agentic Stack for Phase 4

### CopilotKit (open-source, MIT)
- **Why:** First-class React SDK, supports Generative UI, streaming responses, shared state, human-in-the-loop — all out of the box
- **Frontend:** `@copilotkit/react-core` + `@copilotkit/react-ui` (chat UI components with streaming)
- **Backend:** CopilotKit runtime (can run as a lightweight Node.js server or serverless function)
- **Model:** ✅ **Azure AI Foundry (Azure OpenAI)** — natively supported via `OpenAIAdapter` (see details below). Also supports OpenAI direct, GitHub Models API, Anthropic, Google, Groq, or any LangChain-compatible model.
- **Protocol:** AG-UI (Agent↔User Interaction Protocol)

### ✅ Using Azure AI Foundry Models with CopilotKit

CopilotKit's `OpenAIAdapter` has **built-in Azure OpenAI support**. Azure AI Foundry deploys models (GPT-4o, GPT-4, GPT-3.5, etc.) as Azure OpenAI endpoints — and CopilotKit can connect to them directly.

**How it works:**
1. Deploy a model (e.g. GPT-4o) in Azure AI Foundry → you get an Azure OpenAI endpoint + API key
2. In the CopilotKit self-hosted runtime, use `OpenAIAdapter` with the Azure OpenAI client configuration
3. That's it — streaming, tool calls, Generative UI all work identically

**Backend code (Node.js / Azure Function):**
```typescript
import { CopilotRuntime, OpenAIAdapter } from "@copilotkit/runtime";
import OpenAI from "openai";

// Azure AI Foundry deployment details
const instance = "<your-azure-openai-instance-name>";  // e.g. "meg-foundry"
const model = "<your-deployment-name>";                // e.g. "gpt-4o"
const apiKey = process.env["AZURE_OPENAI_API_KEY"];

const openai = new OpenAI({
  apiKey,
  baseURL: `https://${instance}.openai.azure.com/openai/deployments/${model}`,
  defaultQuery: { "api-version": "2024-04-01-preview" },
  defaultHeaders: { "api-key": apiKey },
});

const serviceAdapter = new OpenAIAdapter({ openai });
const runtime = new CopilotRuntime();
```

**Required Azure resources:**
| Resource | Purpose |
|---|---|
| Azure AI Foundry project | Hosts the model deployment |
| Azure OpenAI resource | Provides the GPT-4o (or other) model endpoint |
| Model deployment (e.g. `gpt-4o`) | The actual deployed model your agent calls |

**Environment variables for Azure AI Foundry:**
```
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_INSTANCE=your-instance-name        # e.g. "meg-foundry"
AZURE_OPENAI_DEPLOYMENT=your-deployment-name     # e.g. "gpt-4o"
AZURE_OPENAI_API_VERSION=2024-04-01-preview
```

**Benefits of Azure AI Foundry over direct OpenAI:**
- Enterprise-grade security (Microsoft Entra ID, RBAC, virtual networks)
- Content safety filters built-in (prompt injection protection)
- Data stays in your Azure region (compliance/residency)
- Same Azure subscription as your Static Web App hosting
- Observability via Application Insights
- Cost management via Azure budgets & quotas

### Why NOT Microsoft Agent Framework for this project?
- MAF shines for enterprise multi-channel deployment (Teams, M365 Copilot) — overkill here
- The portfolio is a single React SPA hosted on Azure Static Web Apps
- CopilotKit alone covers everything needed and is lighter weight
- If later you want to expose the agent to Teams, you can add MAF on top via the AG-UI bridge

---

## Feature 1: Portfolio Agent Chat (on `/` route)

### 1.1 What the user described
- Modern agent chat on the portfolio page
- Agent knows about the portfolio content (about, skills, experience, certifications)
- Responses are **streamed** (not returned all at once)
- Responses use **Generative UI** — beautiful rendered cards/components based on context
- When user **clicks or hovers** on a project card → agent detects the event, provides details, and asks if user has questions

### 1.2 Feasibility: ✅ Fully Possible

| Requirement | CopilotKit Feature | How |
|---|---|---|
| Chat UI on portfolio page | `<CopilotChat />` or `<CopilotSidebar />` | Drop-in React component, styled to match dark agentic theme |
| Streaming responses | Built-in | CopilotKit streams by default via AG-UI protocol |
| Generative UI responses | `useCopilotAction()` with `render` | Agent calls tools that return React components (skill cards, project timelines, cert badges) |
| Agent knows portfolio data | `useCopilotReadable()` | Feed portfolio data (skills, experience, about, certifications) as context to the agent |
| Detect hover/click on project card | `useCopilotAction()` + frontend event | On hover/click, call a frontend action that pushes a system message to the agent |

### 1.3 Implementation Plan

#### Step 1: Install CopilotKit
```
npm install @copilotkit/react-core @copilotkit/react-ui
```

#### Step 2: Set up CopilotKit Runtime (backend with Azure AI Foundry)
- **Recommended: Self-hosted with Azure AI Foundry** — add an Azure Function (or Node.js Express endpoint) that uses `OpenAIAdapter` pointed at your Azure OpenAI deployment (see "Using Azure AI Foundry Models" section above)
- Alternative: Copilot Cloud (hosted, just an API key — but model stays on their infra, not your Azure)
- The runtime handles LLM calls, tool execution, and streaming
- Since you already host on Azure Static Web Apps, an Azure Function is the natural fit (same subscription, same region, no cold-start on Premium plan)

#### Step 3: Wrap the app with `<CopilotKit>` provider
- Add `<CopilotKit runtimeUrl="/api/copilotkit">` around the router in `App.tsx`
- This sits alongside the existing `PlayerProvider`

#### Step 4: Feed portfolio context with `useCopilotReadable()`
- In each portfolio section (About, Skills, Experience, Certifications), use `useCopilotReadable()` to expose that section's data as agent context
- Example: Skills component tells the agent about all 20 skills across 4 categories
- Example: Experience component tells the agent about all 5 projects with roles, tech, and highlights

#### Step 5: Add `<CopilotSidebar>` or `<CopilotChat>` to the portfolio page
- Position as a floating chat bubble (bottom-right) that expands into a sidebar
- Style with CSS custom properties to match the dark glassmorphism theme
- Streaming is enabled by default

#### Step 6: Create Generative UI tool actions
- Define `useCopilotAction()` hooks that render custom React components:
  - `showProjectDetail` → renders a styled project card with timeline, tech tags, role
  - `showSkillBreakdown` → renders a skill category grid
  - `showCertification` → renders the PL-400 badge card
  - `showContactInfo` → renders contact links
- These render **inside the chat** as rich UI, not plain text

#### Step 7: Project card interaction → agent event
- In `Experience.tsx`, add `onMouseEnter` / `onClick` handlers on project cards
- When triggered, use CopilotKit's message API to send a system-level event:
  ```
  "User is looking at project: Enterprise Education Platform (Current) — Role: Technical Lead — Tech: React, D365, Power Platform"
  ```
- Agent responds with details + "Would you like to know more about this project?"

#### Step 8: Agent system prompt
- Define the agent persona: "You are Meg's portfolio assistant. You help visitors learn about Meg's experience, skills, and projects. You respond in a friendly, professional tone. Use Generative UI components when showing project details, skills, or certifications."

### 1.4 Complexity Estimate
| Task | Effort |
|---|---|
| CopilotKit setup + provider | ~1 hour |
| Backend runtime (Cloud or self-hosted) | ~1–2 hours |
| Feed portfolio data as readables | ~1 hour |
| Chat UI + styling | ~2–3 hours |
| Generative UI components (4 tool renders) | ~3–4 hours |
| Project card interaction events | ~1–2 hours |
| Testing + polish | ~2 hours |
| **Total** | **~11–15 hours** |

---

## Feature 2: Music Page Live Agent (on `/music` route)

### 2.1 What the user described
- Agent with a visible icon + chat on the music page
- User can ask for a **random playlist by style/genre**
- User can **command the agent** to stop, play, next, previous
- When user is idle for **3 minutes with no music playing**, agent auto-picks a track, plays it, describes the genre, and asks if they want more

### 2.2 Feasibility: ✅ Fully Possible

| Requirement | CopilotKit Feature | How |
|---|---|---|
| Agent icon + chat on music page | `<CopilotChat />` or custom headless UI | Render a chat panel or floating agent icon in MusicPage |
| Ask for playlist by style | `useCopilotAction("generatePlaylist")` | Agent calls a tool that filters tracks by genre from Supabase, builds a playlist, and calls `setPlaylist()` from PlayerContext |
| Playback commands (stop, next, prev) | `useCopilotAction("controlPlayback")` | Agent calls frontend tools that invoke `togglePlayPause()`, `playNext()`, `playPrevious()` from PlayerContext |
| 3-min idle auto-play | Timer + `useCopilotAction()` | A `useEffect` timer watches `isPlaying` state — after 3 min idle, triggers agent to pick & play a random track |
| Agent describes genre | Streaming text response | After auto-play, agent sends a streaming chat message: "I picked 'Neon Dreams' for you — it's Electronic/Synthwave. Want to hear more like this?" |

### 2.3 Implementation Plan

#### Step 1: CopilotKit is already set up (from Feature 1)
- The `<CopilotKit>` provider wraps the entire app, so it's available on `/music` too

#### Step 2: Add music context with `useCopilotReadable()`
- Expose current player state: current track, playlist, isPlaying, progress, repeat mode
- Expose available tracks/genres so the agent knows what's in the library

#### Step 3: Define playback control actions
```
useCopilotAction("controlPlayback")
```
- Parameters: `action` (play | pause | next | previous | stop)
- Handler: calls the corresponding `PlayerContext` method
- Agent can say "Sure, skipping to the next track!" and execute it

#### Step 4: Define playlist generation action
```
useCopilotAction("generatePlaylist")
```
- Parameters: `genre` or `mood` (string)
- Handler: queries Supabase for tracks matching the genre/mood, calls `setPlaylist()` + `playTrack()`
- Generative UI: renders a mini playlist card in chat showing the queued tracks
- Can also leverage `find_similar_tracks` (pgvector) for "more like this" recommendations

#### Step 5: Agent icon + chat UI on music page
- Add a floating agent avatar icon (bottom-left or top-right of the music page)
- Click to expand a compact chat panel
- Style to match the music page's dark/neon aesthetic
- The agent has a music-themed persona: "I'm your DJ assistant! Ask me to play something, skip tracks, or suggest a vibe."

#### Step 6: 3-minute idle auto-play
- In `MusicPage.tsx`, add a `useEffect` with a timer:
  - Start a 3-minute countdown when `isPlaying === false`
  - Reset the countdown if user interacts (plays music, clicks, types in chat)
  - When countdown expires:
    1. Pick a random track from the library
    2. Call `playTrack()` from PlayerContext
    3. Push a message to the agent chat:
       > "🎵 You've been quiet for a while! I picked **'Neon Dreams'** for you — it's an Electronic/Synthwave track. Want to hear more like this, or something different?"
- This uses CopilotKit's `appendMessage()` API to inject the agent message programmatically

#### Step 7: "More like this" follow-up
- When user responds "yes" or "more like this", the agent calls `find_similar_tracks` (pgvector RPC already exists in `musicService.ts`) to queue similar tracks
- Generative UI renders the recommendation as a styled playlist card

### 2.4 Complexity Estimate
| Task | Effort |
|---|---|
| Music context readables | ~1 hour |
| Playback control action (play/pause/next/prev/stop) | ~2 hours |
| Playlist generation action (by genre/mood) | ~2–3 hours |
| Agent chat UI + icon on music page | ~2–3 hours |
| 3-minute idle timer + auto-play logic | ~2 hours |
| "More like this" with pgvector | ~1–2 hours |
| Styling + animations | ~2 hours |
| Testing + edge cases | ~2 hours |
| **Total** | **~14–18 hours** |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React App (Vite)                      │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ CopilotKit   │  │ PlayerProvider│  │ BrowserRouter │  │
│  │  Provider     │  │ (Audio Ctx)  │  │              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│  ┌──────┴─────────────────┴──────────────────┴───────┐  │
│  │                                                   │  │
│  │  "/" Portfolio Page          "/music" Music Page   │  │
│  │  ├─ Hero                    ├─ MusicPage           │  │
│  │  ├─ About                   ├─ MusicPlayer         │  │
│  │  ├─ Skills                  ├─ MusicCard[]         │  │
│  │  ├─ Experience              ├─ 🤖 Music Agent Chat │  │
│  │  ├─ Certifications          │   (floating icon)    │  │
│  │  ├─ Footer                  │                      │  │
│  │  ├─ 🤖 Portfolio Agent Chat │                      │  │
│  │  │   (sidebar/bubble)       │                      │  │
│  │  └─ MiniPlayer              │                      │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                              │
│                          ▼                              │
│              CopilotKit Runtime (Azure Function)         │
│              ├─ Azure AI Foundry (Azure OpenAI GPT-4o)   │
│              ├─ OpenAIAdapter → Azure endpoint            │
│              ├─ Agent tools (portfolio, playback, etc.)  │
│              └─ Streaming via AG-UI protocol             │
│                          │                              │
│                          ▼                              │
│                  Supabase Backend                        │
│                  ├─ tracks table                         │
│                  ├─ get_random_tracks RPC                │
│                  ├─ find_similar_tracks RPC (pgvector)   │
│                  ├─ increment_play_count RPC             │
│                  └─ Storage (MP3s + covers)              │
└─────────────────────────────────────────────────────────┘
```

---

## Required New Dependencies

### Frontend (existing Vite/React app)
| Package | Purpose |
|---|---|
| `@copilotkit/react-core` | Core React hooks & provider |
| `@copilotkit/react-ui` | Pre-built chat UI components |

### Backend (Azure Function / Node.js server)
| Package | Purpose |
|---|---|
| `@copilotkit/runtime` | CopilotKit server-side runtime |
| `openai` | OpenAI SDK (works with Azure OpenAI endpoints) |

**Recommended approach:** Self-hosted Azure Function with Azure AI Foundry model
- Same Azure subscription as your Static Web App
- `OpenAIAdapter` pointed at your Azure OpenAI deployment
- Enterprise security, content filters, and data residency built in

## Environment Variables Needed

### Backend (Azure Function)
```
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_INSTANCE=meg-foundry              # your Azure OpenAI instance name
AZURE_OPENAI_DEPLOYMENT=gpt-4o                 # your model deployment name
AZURE_OPENAI_API_VERSION=2024-04-01-preview
```

### Frontend (Vite app)
```
VITE_COPILOTKIT_RUNTIME_URL=/api/copilotkit    # points to the Azure Function endpoint
```

---

## Risks & Considerations

| Risk | Mitigation |
|---|---|
| **LLM API cost** | Azure OpenAI pricing is pay-per-token. Use GPT-4o-mini deployment for lower cost (~$0.15/1M input tokens). Set Azure budget alerts. Free tier: GitHub Models API for dev/testing, Azure AI Foundry for production. |
| **Latency** | Streaming mitigates perceived latency. All tool calls (playback, playlist) execute locally — instant. |
| **Mobile UX** | Chat sidebar may be tight on mobile. Use a collapsible floating bubble that opens a full-screen chat on small screens. |
| **Token context size** | Portfolio data is small (~2K tokens). Music library metadata is also small. Well within GPT-4o's 128K context. |
| **3-min idle timer edge cases** | Reset on any user interaction (scroll, click, chat message, keyboard). Pause timer when tab is not visible (`visibilitychange` event). |
| **Supabase offline fallback** | Agent should gracefully handle offline mode — use hardcoded track data if Supabase is down (already implemented in musicService). |

---

## Summary

| Feature | Possible? | Complexity | Recommended Stack |
|---|---|---|---|
| Portfolio Agent Chat + Generative UI + Project Card Events | ✅ Yes | ~11–15 hrs | CopilotKit + Azure AI Foundry (GPT-4o) |
| Music Agent + Playback Control + Idle Auto-Play | ✅ Yes | ~14–18 hrs | CopilotKit + PlayerContext + Azure AI Foundry |
| **Total Phase 4** | ✅ | **~25–33 hrs** | CopilotKit (frontend) + Azure Function + Azure AI Foundry (backend) |

**Both features are a natural extension of the existing architecture.** The PlayerContext already exposes all playback controls, Supabase already has genre data + pgvector similarity search, and the portfolio data is already structured in each component. CopilotKit's `useCopilotReadable()` and `useCopilotAction()` hooks slot directly into the existing React component tree.

**Azure AI Foundry integration is first-class** — CopilotKit's `OpenAIAdapter` natively supports Azure OpenAI endpoints. You just point it at your Foundry deployment, and streaming, tool calls, and Generative UI all work identically to direct OpenAI. No extra adapters or workarounds needed.