# Phase 4 — Agentic AI Chat Integration

> **Project:** Meg — Agentic Music Portfolio  
> **Phase:** 4 — Add AI Agent Chat to Portfolio & Music Pages  
> **Date:** February 11, 2026  
> **Status:** 🔄 In Progress  
> **Prereq:** Phase 3 completed (Supabase backend, real audio, visualizers)

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Copilot Cloud Setup Guide](#copilot-cloud-setup-guide)
4. [Implementation Checklist](#implementation-checklist)
5. [Feature 1 — Portfolio Agent Chat](#feature-1--portfolio-agent-chat)
6. [Feature 2 — Music Page Agent](#feature-2--music-page-agent)
7. [Styling & Theme](#styling--theme)

---

## Overview

Phase 4 adds **two AI agent chat experiences** powered by CopilotKit + Copilot Cloud:

| Feature | Page | What It Does |
|---------|------|-------------|
| **Portfolio Agent** | `/` | Chat sidebar where visitors ask about Meg's skills, projects, certifications. Responses stream with Generative UI (styled cards). Detects hover/click on project cards and proactively shares details. |
| **Music Agent** | `/music` | Floating DJ agent that takes playback commands (play, pause, next, prev), generates playlists by genre/mood, auto-plays music after 3 minutes of idle, and recommends similar tracks. |

### What Changes from Phase 3

| Before (Phase 3) | After (Phase 4) |
|-------------------|-----------------|
| Static portfolio sections | Agent-powered interactive Q&A with Generative UI |
| Manual music browsing only | Voice/text commands for playback control |
| No idle detection | 3-min idle auto-play with agent notification |
| No recommendations | AI-driven playlist generation by genre/mood |
| No project card interactivity beyond display | Hover/click triggers agent context about that project |

---

## Tech Stack

| Layer | Technology |
|---|---|
| AI Chat SDK | CopilotKit (`@copilotkit/react-core`, `@copilotkit/react-ui`) |
| Backend Runtime | **Copilot Cloud** (hosted by CopilotKit — zero backend code) |
| LLM Model | Configured via Copilot Cloud dashboard (GPT-4o default, can switch to Azure OpenAI later) |
| Protocol | AG-UI (Agent↔User Interaction Protocol) |
| Frontend | React 18 + TypeScript (existing Vite app) |

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
- [ ] Install `@copilotkit/react-core` and `@copilotkit/react-ui`
- [ ] Add `VITE_COPILOTKIT_PUBLIC_API_KEY` to `.env`
- [ ] Wrap app with `<CopilotKit>` provider in `main.tsx`
- [ ] Import CopilotKit CSS

### Feature 1: Portfolio Agent Chat
- [ ] Create `PortfolioAgent.tsx` component
- [ ] Add `useCopilotReadable()` for About data
- [ ] Add `useCopilotReadable()` for Skills data
- [ ] Add `useCopilotReadable()` for Experience/Projects data
- [ ] Add `useCopilotReadable()` for Certifications data
- [ ] Create `useCopilotAction("showProjectDetail")` with Generative UI render
- [ ] Create `useCopilotAction("showSkillBreakdown")` with Generative UI render
- [ ] Create `useCopilotAction("showCertification")` with Generative UI render
- [ ] Add project card hover/click → agent context event
- [ ] Add `<CopilotPopup>` to Portfolio page
- [ ] Style to match dark agentic theme

### Feature 2: Music Page Agent
- [ ] Create `MusicAgent.tsx` component
- [ ] Add `useCopilotReadable()` for current player state
- [ ] Add `useCopilotReadable()` for available tracks/genres
- [ ] Create `useCopilotAction("controlPlayback")` — play/pause/next/prev/stop
- [ ] Create `useCopilotAction("generatePlaylist")` — by genre/mood
- [ ] Create `useCopilotAction("recommendSimilar")` — pgvector similarity
- [ ] Add 3-minute idle detection timer
- [ ] Auto-play + agent notification on idle
- [ ] Add `<CopilotPopup>` to Music page
- [ ] Style floating agent icon to match music theme

### Polish
- [ ] Custom CSS overrides for CopilotKit components
- [ ] Mobile responsive chat
- [ ] Test streaming behavior
- [ ] Test offline fallback (agent should still work, just without Supabase data)

---

## Feature 1 — Portfolio Agent Chat

### Components
| Component | Purpose |
|---|---|
| `PortfolioAgent.tsx` | Wraps `<CopilotPopup>`, registers all readables and actions |
| Generative UI renders | Inline React components returned by tool actions |

### Agent System Prompt
```
You are Meg's portfolio assistant. Help visitors learn about Meg's professional experience, skills, and projects. You are friendly, professional, and concise. When discussing projects or skills, use the available tools to show rich visual cards. Always be helpful and encourage visitors to explore.
```

### Readables (Context)
The agent sees all portfolio data via `useCopilotReadable()`:
- About section (bio, stats, highlights)
- Skills (4 categories, 20 skills)
- Experience (5 projects with roles, tech, descriptions, highlights)
- Certifications (PL-400)

### Actions (Tools with Generative UI)
| Action | Parameters | Renders |
|---|---|---|
| `showProjectDetail` | `projectTitle: string` | Styled project card with status, role, tech tags, highlights |
| `showSkillBreakdown` | `category?: string` | Skill grid or single category card |
| `showCertification` | none | PL-400 badge card |

### Project Card Interaction
When user hovers/clicks a project card in Experience section:
1. Event fires with project data
2. Agent receives context: "User is viewing project: {title}"
3. Agent proactively responds with project details + "Any questions about this project?"

---

## Feature 2 — Music Page Agent

### Components
| Component | Purpose |
|---|---|
| `MusicAgent.tsx` | Wraps `<CopilotPopup>`, registers all readables and actions, manages idle timer |

### Agent System Prompt
```
You are Meg's DJ assistant on the music page. Help users discover and control music playback. You can play/pause/skip tracks, generate playlists by genre or mood, and recommend similar tracks. Keep responses short and fun. Use music emoji. When auto-playing for idle users, be friendly and suggest they might enjoy the track.
```

### Readables (Context)
- Current player state (track name, artist, genre, isPlaying, progress)
- Available genres in the library
- Current playlist

### Actions (Tools)
| Action | Parameters | What It Does |
|---|---|---|
| `controlPlayback` | `command: "play" \| "pause" \| "next" \| "previous"` | Calls PlayerContext methods |
| `generatePlaylist` | `genre: string, count?: number` | Fetches tracks by genre from Supabase, builds playlist, starts playing |
| `recommendSimilar` | none | Uses pgvector `find_similar_tracks` for current track |

### 3-Minute Idle Auto-Play
1. Timer starts when `isPlaying === false`
2. Resets on: user clicks, types, plays music, scrolls
3. Pauses when tab is hidden (`visibilitychange`)
4. When 3 minutes pass:
   - Fetch a random track
   - Play it via PlayerContext
   - Agent sends message: "🎵 You've been quiet! I picked '{track}' for you — it's {genre}. Want more like this?"

---

## Styling & Theme

All CopilotKit UI components will be styled to match the existing dark agentic theme:

| Element | Style |
|---|---|
| Chat background | `rgba(10, 10, 20, 0.95)` with backdrop blur |
| User message | Cyan accent (`#00e5ff`) |
| Agent message | Light text on dark |
| Buttons/actions | Purple accent (`#7c3aed`) |
| Generative UI cards | Same glassmorphism as existing cards |
| Font | Inherit from app (`Inter` / system) |
| Border | `1px solid rgba(255, 255, 255, 0.06)` |
| Popup trigger button | Gradient border, glow effect |
