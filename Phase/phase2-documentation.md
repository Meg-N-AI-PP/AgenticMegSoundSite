# Phase 2 — Music Page Documentation

> **Project:** Meg — Agentic Music Portfolio  
> **Phase:** 2 — Music Page with Visualizer & Auto-Refresh  
> **Date:** February 10, 2026  
> **Status:** ✅ Completed

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure (Phase 2 Additions)](#project-structure-phase-2-additions)
4. [Component Architecture](#component-architecture)
5. [Component Details](#component-details)
   - [MusicPage.tsx](#musicpagetsx)
   - [MusicCard.tsx](#musiccardtsx)
   - [MusicPlayer.tsx](#musicplayertsx)
6. [Data Layer](#data-layer)
7. [Routing](#routing)
8. [CTA — "Want to Hear Some Sound?"](#cta--want-to-hear-some-sound)
9. [Playlist Logic](#playlist-logic)
10. [Visualization System](#visualization-system)
11. [Animation System](#animation-system)
12. [Styling Architecture](#styling-architecture)
13. [Auto-Refresh Mechanism](#auto-refresh-mechanism)
14. [Responsive Design](#responsive-design)
15. [How to Run](#how-to-run)
16. [Known Limitations](#known-limitations)
17. [Future Considerations (Phase 3)](#future-considerations-phase-3)

---

## Overview

Phase 2 adds a **Music Station** page to the portfolio — a split-layout music discovery experience featuring:

- ✅ **12 compact track cards** on the left in a scrollable list
- ✅ **Inline player panel** on the right with album art–backed visualizer
- ✅ **5 visualization effects** (Bars, Wave, Circles, Particles, Spectrum)
- ✅ **Auto-generated playlist** (6 tracks: clicked + 5 random)
- ✅ **Silent auto-refresh** every 5 minutes (new random tracks, no visible timer)
- ✅ **Previous / Play-Pause / Next** controls with playlist cycling
- ✅ **"Up Next" mini-playlist** with clickable track items
- ✅ **"Want to hear some sound?"** CTA in the Hero section (links to `/music`)
- ✅ **20 draft tracks** with placeholder images (real audio in Phase 3)
- ✅ **8 card entrance animation presets** via anime.js
- ✅ **Responsive layout** — stacks vertically on mobile

### Design Philosophy

The music page continues the **agentic dark theme** from Phase 1 — dark backgrounds, cyan/purple accents, glass-morphism, and the same neural-network particle canvas (`AgenticBackground`). The visualizer features a blurred album-art background, vignette overlay, and pulsing glow border that matches each track's accent color.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **React** | ^18.3.1 | UI component framework |
| **TypeScript** | ^5.6.3 | Type-safe development |
| **Vite** | ^6.4.1 | Build tool & dev server |
| **anime.js** | ^3.2.2 | Card entrance/exit & header animations |
| **react-router-dom** | ^7.13.0 | Client-side routing (`/` ↔ `/music`) |
| **Canvas API** | — | Particle background + 5 music visualizations |
| **CSS3** | — | Custom styling (no UI framework) |

### Dependencies Added in Phase 2

| Package | Version | Purpose |
|---|---|---|
| `react-router-dom` | ^7.13.0 | Routing between Portfolio and Music page |

---

## Project Structure (Phase 2 Additions)

```
Src/src/
├── main.tsx                      # Updated: wraps App in BrowserRouter
├── App.tsx                       # Updated: Routes for / and /music
├── App.css                       # Updated: hero-sound-cta styles removed (moved to Music.css)
├── Music.css                     # NEW: all music page styles (~840 lines)
├── data/
│   └── musicData.ts              # NEW: 20 draft tracks, MusicTrack interface, utilities
└── components/
    ├── Hero.tsx                  # Updated: "Want to hear some sound?" CTA added
    ├── Navbar.tsx                # Updated: Music CTA removed (moved to Hero)
    ├── MusicPage.tsx             # NEW: main music page (split layout)
    ├── MusicCard.tsx             # NEW: compact horizontal track card
    └── MusicPlayer.tsx           # NEW: inline player with visualizer (420 lines)
```

---

## Component Architecture

```
App.tsx
├── Route "/" → Portfolio
│   ├── Navbar
│   ├── Hero                      ← "Want to hear some sound?" CTA
│   ├── About
│   ├── Skills
│   ├── Experience
│   ├── Certifications
│   └── Footer
│
└── Route "/music" → MusicPage
    ├── AgenticBackground         ← Same particle canvas from Phase 1
    ├── Header (title + subtitle + back link)
    └── music-split-layout
        ├── music-list-panel      ← Left: 12 × MusicCard
        └── music-player-panel    ← Right: MusicPlayer (appears on click)
            ├── Visualizer (canvas + album art background)
            ├── Track Info
            ├── Progress Bar
            ├── Controls (prev / play / next)
            └── Mini Playlist ("Up Next")
```

### Data Flow

```
musicData.ts
  ↓ getRandomTracks(12)
MusicPage (state: cards[], playlist[], currentIndex)
  ↓ cards → MusicCard[]              ← Left panel
  ↓ handlePlay(track) → buildPlaylist()
  ↓ playlist + currentIndex → MusicPlayer  ← Right panel
      ↓ onNext/onPrev → MusicPage updates currentIndex
      ↓ onTrackEnd → auto handleNext
      ↓ onPlayFromPlaylist(idx) → jump to track
```

---

## Component Details

### MusicPage.tsx

**File:** `Src/src/components/MusicPage.tsx` (210 lines)  
**Route:** `/music`

The main orchestrator component. Manages all state and coordinates the left card list with the right player panel.

#### State

| State | Type | Purpose |
|---|---|---|
| `cards` | `CardState[]` | 12 cards with track data + animation preset |
| `playlist` | `MusicTrack[]` | Current 6-track play queue |
| `currentIndex` | `number` | Active track index in playlist |
| `isPlayerOpen` | `boolean` | Whether right panel is visible |

#### Key Functions

| Function | Description |
|---|---|
| `loadRandomCards()` | Fetches 12 random tracks, assigns animations, triggers entrance |
| `buildPlaylist(track)` | Creates 6-track queue: clicked track + 5 random from current cards |
| `handlePlay(track)` | Opens player, builds playlist, sets index to 0 |
| `handleNext()` | Cycles `currentIndex` forward (wraps around) |
| `handlePrev()` | Cycles `currentIndex` backward (wraps around) |
| `handleClosePlayer()` | Closes player, clears playlist |
| `handlePlayFromPlaylist(idx)` | Jumps to specific playlist index |

#### Constants

```typescript
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const CARD_COUNT = 12;
const PLAYLIST_SIZE = 6;
```

---

### MusicCard.tsx

**File:** `Src/src/components/MusicCard.tsx` (55 lines)

A compact horizontal list item representing a single track.

#### Props

| Prop | Type | Description |
|---|---|---|
| `track` | `MusicTrack` | Track data (title, artist, image, etc.) |
| `animation` | `CardAnimation` | CSS animation class name |
| `onPlay` | `(track) => void` | Callback when card is clicked |
| `isActive` | `boolean` | Whether this card is the currently playing track |

#### Visual Elements

| Element | Details |
|---|---|
| Thumbnail | 44×44px rounded image (`music-card-thumb`) |
| EQ Bars | 3 animated cyan bars overlay when `isActive` (`music-card-eq`) |
| Title & Artist | Stacked text in `music-card-info` |
| Genre Badge | Small pill with genre text |
| Duration | Right-aligned time string |

#### Active State

When `isActive` is true:
- Card gets `music-card--active` class
- Left border accent glows in `--card-accent` color
- EQ bars overlay appears on thumbnail (CSS animated)

---

### MusicPlayer.tsx

**File:** `Src/src/components/MusicPlayer.tsx` (420 lines)

The most complex component — an inline player panel with a canvas-based visualizer, track controls, and mini playlist.

#### Props

| Prop | Type | Description |
|---|---|---|
| `track` | `MusicTrack` | Currently playing track |
| `playlist` | `MusicTrack[]` | Full 6-track queue |
| `currentIndex` | `number` | Active index in playlist |
| `onNext` | `() => void` | Go to next track |
| `onPrev` | `() => void` | Go to previous track |
| `onPlayFromPlaylist` | `(idx) => void` | Jump to specific track |
| `onClose` | `() => void` | Close the player |
| `onTrackEnd` | `() => void` | Called when simulated progress hits 100% |

#### State

| State | Type | Purpose |
|---|---|---|
| `isPlaying` | `boolean` | Play/pause toggle |
| `progress` | `number` | 0–100 simulated progress percentage |
| `vizEffect` | `VizEffect` | Current visualization effect name |

#### Visualizer Architecture

The visualizer canvas is layered with multiple background elements:

```
.inline-player-viz (container, aspect-ratio: 2/1)
├── .viz-bg-image        ← Blurred album art (background-image, filter: blur(35px))
├── .viz-bg-overlay      ← Semi-transparent dark overlay (#0a0a0f/80%)
├── canvas               ← The actual visualization canvas
├── .viz-vignette        ← Radial gradient edge darkening
└── .viz-cycle-btn       ← Button to cycle through 5 effects
```

The container also has a pulsing glow border (`viz-glow-pulse` animation) that uses the track's accent color.

#### Progress Simulation

Since Phase 2 has no real audio, progress is simulated:

```typescript
// Every 100ms, increment by 0.15%
setProgress(prev => prev + 0.15);
// At 100%, trigger onTrackEnd (auto-advances to next)
```

The `formatTime()` function converts progress percentage to `m:ss` format based on the track's `duration` string.

---

## Data Layer

### MusicTrack Interface

**File:** `Src/src/data/musicData.ts`

```typescript
export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;       // "3:42" format
  imageUrl: string;       // picsum.photos placeholder
  audioUrl: string;       // Empty string (no real audio in Phase 2)
  color: string;          // Hex accent color per track
}
```

### Track Library

20 draft tracks with themed names, diverse genres, and unique accent colors:

| # | Title | Artist | Genre | Color |
|---|---|---|---|---|
| 1 | Neon Dreams | Agentic Beats | Synthwave | `#00e5ff` |
| 2 | Digital Horizon | Cyber Pulse | Electronic | `#7c3aed` |
| 3 | Midnight Protocol | Ghost Signal | Ambient | `#ff6b35` |
| 4 | Neural Cascade | Deep Circuit | Techno | `#00e676` |
| 5 | Sakura Rain | Miku Waves | Lo-fi | `#ff69b4` |
| 6 | Void Walker | Binary Shade | Dark Synth | `#8b5cf6` |
| 7 | Electric Garden | Pixel Flora | Chillstep | `#10b981` |
| 8 | Starlight Express | Cosmo Drift | Future Bass | `#f59e0b` |
| 9 | Crystal Memory | Echo Glass | Dream Pop | `#06b6d4` |
| 10 | Phantom Code | Hex Runner | Cyberpunk | `#ef4444` |
| 11 | Ocean of Data | Wave Function | Trance | `#3b82f6` |
| 12 | Firefly Network | Lumina AI | Electronica | `#eab308` |
| 13 | Silent Algorithm | Zero Noise | Minimal | `#64748b` |
| 14 | Astral Projection | Nebula Drive | Psytrance | `#a855f7` |
| 15 | Ruby Storm | Crimson Beat | Drum & Bass | `#dc2626` |
| 16 | Frost Byte | Arctic Pulse | Ambient | `#22d3ee` |
| 17 | Solar Flare | Helio Beat | House | `#f97316` |
| 18 | Quantum Leap | Particle Groove | Progressive | `#14b8a6` |
| 19 | Twilight Sync | Dusk Module | Downtempo | `#6366f1` |
| 20 | Emerald Circuit | Jade Machine | Tech House | `#059669` |

### Utility Functions

| Function | Returns | Description |
|---|---|---|
| `getRandomTracks(count)` | `MusicTrack[]` | Shuffled subset of `allTracks` |
| `getAllTracks()` | `MusicTrack[]` | Full 20-track array |
| `getRandomAnimation()` | `CardAnimation` | Random animation preset string |

### Card Animation Presets

8 CSS animation classes assigned randomly to each card:

```typescript
const cardAnimations = [
  'float-up', 'float-down', 'sway-left', 'sway-right',
  'pulse-glow', 'tilt-rock', 'drift-diagonal', 'bounce-soft',
] as const;
```

---

## Routing

**Setup:** `react-router-dom` v7.13.0

### Entry Point (`main.tsx`)

```tsx
<BrowserRouter>
  <App />
</BrowserRouter>
```

### Routes (`App.tsx`)

```tsx
<Routes>
  <Route path="/" element={<Portfolio />} />
  <Route path="/music" element={<MusicPage />} />
</Routes>
```

| Path | Component | Description |
|---|---|---|
| `/` | `Portfolio` | Phase 1 portfolio (Navbar + Hero + sections + Footer) |
| `/music` | `MusicPage` | Phase 2 music page |

### Navigation

| From | To | Method |
|---|---|---|
| Portfolio → Music | Hero CTA button | `<Link to="/music">` |
| Music → Portfolio | Back arrow link | `<Link to="/">` |

---

## CTA — "Want to Hear Some Sound?"

### Location

The CTA button sits in `Hero.tsx`, below the profile image, inside `.hero-visual`:

```tsx
<Link to="/music" className="hero-sound-cta">
  <svg>/* speaker icon */</svg>
  Want to hear some sound?
  <svg>/* arrow icon */</svg>
</Link>
```

### Styling (in `Music.css`)

- Glass-morphism background (`rgba(0, 229, 255, 0.08)` + `backdrop-filter: blur(10px)`)
- Cyan border (`rgba(0, 229, 255, 0.3)`)
- Hover: background brightens, border glows, slight `translateY(-2px)` lift
- `::before` pseudo-element for extra glow effect on hover
- Speaker icon pulses on hover

### History

Originally in the Navbar as "Music" button → moved to Hero for better visual hierarchy.

---

## Playlist Logic

### How Playlists Are Built

When a user clicks any card:

1. **Clicked track** becomes index 0 (first in queue)
2. **5 random tracks** selected from remaining 11 visible cards
3. Total playlist = **6 tracks** (`PLAYLIST_SIZE`)

```typescript
const buildPlaylist = (clickedTrack: MusicTrack): MusicTrack[] => {
  const otherTracks = cards
    .map(c => c.track)
    .filter(t => t.id !== clickedTrack.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, PLAYLIST_SIZE - 1);   // 5 random others
  return [clickedTrack, ...otherTracks];
};
```

### Navigation

| Action | Behavior |
|---|---|
| **Next** | `(currentIndex + 1) % playlist.length` — wraps to start |
| **Previous** | `(currentIndex - 1 + playlist.length) % playlist.length` — wraps to end |
| **Track ends** | Auto-calls `handleNext` (continuous play) |
| **Click "Up Next" item** | Jumps to that index directly |
| **Click different card** | Rebuilds entire playlist with new track as index 0 |

---

## Visualization System

### 5 Effects

All effects use the same data pipeline: `generateFakeAudioData(time)` → 64-element `number[]` (0–1) → draw function.

| Effect | Description |
|---|---|
| **Bars** | 24 vertical bars, centered, gradient fill, reflection below |
| **Wave** | 3 layered sine waves modulated by data, peak dots |
| **Circles** | 4 concentric deforming rings, center glow orb |
| **Particles** | 48 orbiting dots with connecting lines, radius by data |
| **Spectrum** | Mirrored horizontal bars from center, pulsing orb, ring decorations |

### Fake Audio Data Generation

```typescript
const generateFakeAudioData = (time: number): number[] => {
  const data: number[] = [];
  for (let i = 0; i < 64; i++) {
    const base = Math.sin(time * 0.002 + i * 0.15) * 0.5 + 0.5;
    const harmonic = Math.sin(time * 0.004 + i * 0.3) * 0.3;
    const noise = Math.random() * 0.15;
    const beat = Math.sin(time * 0.008) > 0.7 ? 0.3 : 0;
    data.push(Math.min(1, Math.max(0, base + harmonic + noise + beat)));
  }
  return data;
};
```

Four components:
- **Base** — smooth sine wave (foundational shape)
- **Harmonic** — higher-frequency overlay (detail)
- **Noise** — small random jitter (organic feel)
- **Beat** — periodic spike simulating a kick drum

### Effect Cycling

The **cycle button** (🔄 icon in bottom-right of visualizer) advances through effects sequentially:

```typescript
const cycleViz = () => {
  const idx = VIZ_EFFECTS.indexOf(vizEffect);
  setVizEffect(VIZ_EFFECTS[(idx + 1) % VIZ_EFFECTS.length]);
};
```

A random effect is chosen on each track change.

### Canvas Rendering

- **DPR-aware**: `canvas.width = offsetWidth * devicePixelRatio`
- **requestAnimationFrame** loop (~60fps)
- Radial gradient background tinted with track's accent `color`
- Loop pauses when `isPlaying` is `false`

---

## Animation System

### Header Animations (anime.js)

On mount, the music page header elements animate in sequence:

| Target | Effect | Delay |
|---|---|---|
| `.music-page-back` | Fade in + slide from left | 200ms |
| `.music-page-title .char` | Per-character reveal with rotateX | Staggered 60ms |
| `.music-page-subtitle` | Fade in + slide up | 500ms |

### Card Animations

#### Entrance (on load / refresh)

```typescript
anime({
  targets: '.music-card',
  opacity: [0, 1],
  translateX: [-30, 0],
  delay: anime.stagger(60),    // 60ms between each card
  duration: 600,
  easing: 'easeOutExpo',
});
```

#### Exit (before refresh)

```typescript
anime({
  targets: '.music-card',
  opacity: [1, 0],
  translateX: [0, -20],
  delay: anime.stagger(40),
  duration: 400,
  easing: 'easeInExpo',
  complete: () => loadRandomCards(),  // Load new cards after exit
});
```

#### Idle Animations

Each card gets one of 8 random CSS animations applied as a class (`anim-float-up`, `anim-sway-left`, etc.). These are subtle continuous animations defined in `Music.css`.

### Player Entrance

```typescript
anime({
  targets: panelRef.current,
  opacity: [0, 1],
  translateX: [40, 0],
  duration: 500,
  easing: 'easeOutExpo',
});
```

---

## Styling Architecture

### Music.css (~840 lines)

All music-specific styles are in `Src/src/Music.css`, imported in `main.tsx`.

#### Key Layout Classes

| Class | Purpose |
|---|---|
| `.music-page` | Full-viewport container with dark background |
| `.music-page-content` | Centered content with max-width |
| `.music-page-header` | Title, subtitle, back link |
| `.music-split-layout` | Flexbox row: list + player |
| `.music-list-panel` | Left side (55% when player open) |
| `.music-player-panel` | Right side (42% fixed) |

#### Card Styles

| Class | Description |
|---|---|
| `.music-card` | Compact horizontal flex item (glass background) |
| `.music-card--active` | Left border glow + brighter background |
| `.music-card-thumb` | 44×44px rounded image container |
| `.music-card-eq` | Animated EQ bars overlay |
| `.music-card-genre` | Small pill badge |

#### Player Styles

| Class | Description |
|---|---|
| `.inline-player` | Glass-morphism panel with border glow |
| `.inline-player-viz` | Visualizer container with `aspect-ratio: 2/1` |
| `.viz-bg-image` | Blurred album art (`filter: blur(35px)`) |
| `.viz-bg-overlay` | Dark semi-transparent overlay |
| `.viz-vignette` | Radial gradient edge darkening |
| `.viz-cycle-btn` | Effect switcher button |
| `.inline-player-controls` | Prev / Play / Next button row |
| `.ip-playlist-*` | Mini "Up Next" playlist styles |

#### CTA Styles

| Class | Description |
|---|---|
| `.hero-sound-cta` | Glass-morphism button in Hero section |

#### Design Tokens Used

All from `App.css` root variables:

```css
--accent-cyan: #00e5ff;
--accent-purple: #7c3aed;
--bg-primary: #0a0a0f;
--bg-secondary: #12121a;
--bg-card: #1a1a2e;
--text-primary: #ffffff;
--text-secondary: #a0a0b0;
--glass-bg: rgba(26, 26, 46, 0.6);
--glass-border: rgba(255, 255, 255, 0.08);
```

---

## Auto-Refresh Mechanism

Every 5 minutes, the card list silently refreshes with new random tracks:

```typescript
// Setup (in useEffect)
timerRef.current = window.setInterval(() => {
  // 1. Exit animation (400ms)
  anime({
    targets: '.music-card',
    opacity: [1, 0],
    translateX: [0, -20],
    delay: anime.stagger(40),
    duration: 400,
    easing: 'easeInExpo',
    complete: () => loadRandomCards(),  // 2. Load new cards
  });
}, REFRESH_INTERVAL);   // 5 * 60 * 1000
```

### Key Design Decisions

- **No visible timer** — removed per user request (was previously shown)
- **No shuffle button** — removed per user request (auto-refresh handles it)
- **Smooth transition** — cards slide out left, then new cards slide in from left
- **Player unaffected** — if a track is playing, the playlist continues; only the card list refreshes

---

## Responsive Design

### Breakpoints

| Breakpoint | Layout Change |
|---|---|
| `> 1024px` | Split layout: 55% list / 42% player |
| `768px – 1024px` | Stacked: list above, player below |
| `< 768px` | Stacked, reduced padding, smaller controls |

### Key Mobile Adaptations

- Split layout switches to `flex-direction: column`
- Player panel becomes `100%` width below the list
- Inline player has smaller gap and padding
- CTA button reduces font size

---

## How to Run

```bash
cd Src
npm install
npm run dev
```

Dev server starts at **http://localhost:5174/** (port 5173 may be in use).

| Route | Page |
|---|---|
| `http://localhost:5174/` | Portfolio (Phase 1) |
| `http://localhost:5174/music` | Music Station (Phase 2) |

---

## Known Limitations

| Limitation | Notes |
|---|---|
| **No real audio** | `audioUrl` is empty; visualizer uses simulated data |
| **Progress is fake** | Increments linearly, doesn't match any audio |
| **Placeholder images** | Using `picsum.photos` random seeds |
| **No persistence** | Playlist resets on page refresh |
| **No search** | Cannot filter or search tracks |
| **No keyboard controls** | Space to play/pause not implemented |
| **No volume control** | No audio means no volume |

---

## Future Considerations (Phase 3)

Phase 3 will replace the draft data layer with a **Supabase backend**:

- Real MP3 streaming from Supabase Storage CDN
- Real cover art images from Supabase Storage
- PostgreSQL database for track metadata
- Web Audio API `AnalyserNode` for real frequency data → same 5 visualizer effects
- Vector embeddings (HuggingFace all-MiniLM-L6-v2) for smart "Up Next" playlists
- Loading skeletons and error states
- Play count tracking
- Offline fallback to `musicData.ts`

See **[phase3.md](phase3.md)** for the full implementation plan.