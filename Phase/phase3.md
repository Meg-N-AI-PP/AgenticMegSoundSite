# Phase 3 — Supabase Backend & Real Audio

> **Project:** Meg — Agentic Music Portfolio  
> **Phase:** 3 — Replace draft data with real Supabase backend  
> **Date:** February 10, 2026  
> **Status:** 🔄 In Progress  
> **Prereq:** Phase 2 completed (music page with draft data)

---

## Table of Contents

1. [Overview](#overview)
2. [Supabase Setup](#supabase-setup)
3. [Environment Configuration](#environment-configuration)
4. [Implementation Checklist](#implementation-checklist)
5. [Step 1 — Install Supabase SDK](#step-1--install-supabase-sdk)
6. [Step 2 — Create Supabase Client](#step-2--create-supabase-client)
7. [Step 3 — Create Music Service](#step-3--create-music-service)
8. [Step 4 — Update MusicTrack Interface](#step-4--update-musictrack-interface)
9. [Step 5 — Update MusicPage to Fetch from Supabase](#step-5--update-musicpage-to-fetch-from-supabase)
10. [Step 6 — Update MusicPlayer for Real Audio](#step-6--update-musicplayer-for-real-audio)
11. [Step 7 — Update MusicCard for New Image URLs](#step-7--update-musiccard-for-new-image-urls)
12. [Step 8 — Vector Embeddings (For Agentic Search)](#step-8--vector-embeddings-for-agentic-search)
13. [Step 9 — Loading States & Error Handling](#step-9--loading-states--error-handling)
14. [Step 10 — Polish & Optimize](#step-10--polish--optimize)
15. [Supabase Keys Reference](#supabase-keys-reference)

---

## Overview

Phase 3 transforms the music page from hardcoded draft data to a **live Supabase backend**:

| Before (Phase 2) | After (Phase 3) |
|-------------------|-----------------|
| 20 hardcoded tracks in `musicData.ts` | Tracks fetched from Supabase PostgreSQL |
| Placeholder images from picsum.photos | Real cover art from Supabase Storage CDN |
| No audio (simulated visualizer) | Real MP3 streaming with Web Audio API |
| Random shuffle in JavaScript | `ORDER BY random()` in PostgreSQL |
| No play count | Play count tracked per track |
| No similar tracks | Vector similarity for "Up Next" playlist |

---

## Supabase Setup

> **Note:** The Supabase project and `tracks` table have already been created.  
> See [prepare-phase3.md](prepare-phase3.md) for the full schema, INSERT statements, and Storage bucket setup.

### What's Already Done ✅

- [x] Supabase project created
- [x] `tracks` table created with schema from prepare-phase3.md
- [x] Some track data inserted manually

### What Still Needs to Be Done

- [ ] Create `audio` storage bucket (Public)
- [ ] Create `images` storage bucket (Public)
- [ ] Upload MP3 files to `audio` bucket
- [ ] Upload cover art images to `images` bucket
- [ ] Insert remaining track data (use SQL from prepare-phase3.md Section 3.5)
- [ ] Generate vector embeddings (see Step 8)

---

## Environment Configuration

### How to Get Your Supabase Keys

1. Go to [supabase.com](https://supabase.com) → sign in → open your project
2. Click **Settings** (gear icon) → **API** in the left sidebar
3. You'll see:

| Key | Where to Find | What It Is |
|-----|--------------|------------|
| **Project URL** | Settings → API → "Project URL" | `https://xxxxxxxx.supabase.co` |
| **Anon Key** | Settings → API → "Project API keys" → `anon` `public` | `eyJhbGciOi...` (long JWT token) |
| **Service Role Key** | Settings → API → "Project API keys" → `service_role` `secret` | ⚠️ **Never use in frontend** — only for server-side scripts |

### Create `.env` File

Create the file `Src/.env` (this is already gitignored):

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Important:** 
> - The `VITE_` prefix is required — Vite only exposes env vars with this prefix to the browser
> - The **anon key** is safe for frontend use — it's a public key with Row Level Security (RLS)
> - **Never** commit `.env` to git. Add it to `.gitignore`
> - The **service_role key** is secret — only use in Node.js scripts (e.g., seeding), never in the React app

### How to Verify Keys Work

After setting up `.env`, you can test in browser console or a quick script:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const { data, error } = await supabase.from('tracks').select('title').limit(1);
console.log(data); // Should show [{ title: "Neon Dreams" }] or similar
```

---

## Implementation Checklist

### Phase 3A — Connect to Supabase
- [ ] Install `@supabase/supabase-js`
- [ ] Create `.env` with Supabase URL and Anon Key
- [ ] Create `src/services/supabaseClient.ts`
- [ ] Create `src/services/musicService.ts`

### Phase 3B — Update Frontend Components
- [ ] Update `MusicTrack` interface for Supabase fields
- [ ] Update `MusicPage.tsx` — fetch tracks from Supabase instead of `musicData.ts`
- [ ] Update `MusicCard.tsx` — use Supabase Storage URLs for images
- [ ] Update `MusicPlayer.tsx` — play real audio with Web Audio API
- [ ] Connect real frequency data to existing 5 visualizer effects

### Phase 3C — Upload Media Files
- [ ] Upload MP3 files to `audio` bucket
- [ ] Upload cover art to `images` bucket
- [ ] Update `audio_path` and `image_path` in database to match file names

### Phase 3D — Vector Embeddings (Agentic Search)
- [ ] Get HuggingFace API token (free)
- [ ] Run embedding generation script for all tracks
- [ ] Update playlist logic to use `find_similar_tracks()` instead of random

### Phase 3E — Polish
- [ ] Add loading skeleton while fetching tracks
- [ ] Add error state if Supabase is unreachable
- [ ] Add audio prefetching (preload next track)
- [ ] Keep `musicData.ts` as offline fallback
- [ ] Test on mobile (audio autoplay policies)

---

## Step 1 — Install Supabase SDK

```bash
cd Src
npm install @supabase/supabase-js
```

---

## Step 2 — Create Supabase Client

Create `Src/src/services/supabaseClient.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using offline mode.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## Step 3 — Create Music Service

Create `Src/src/services/musicService.ts`:

```typescript
import { supabase } from './supabaseClient';
import { MusicTrack } from '../data/musicData';

// Fetch random tracks from Supabase
export async function fetchRandomTracks(count = 12): Promise<MusicTrack[]> {
  const { data, error } = await supabase.rpc('get_random_tracks', { count });
  if (error) throw error;

  return data.map((track: any) => ({
    id: track.id,
    title: track.title,
    artist: track.artist,
    genre: track.genre,
    duration: track.duration,
    color: track.color,
    tags: track.tags || [],
    imageUrl: supabase.storage.from('images').getPublicUrl(track.image_path).data.publicUrl,
    audioUrl: supabase.storage.from('audio').getPublicUrl(track.audio_path).data.publicUrl,
  }));
}

// Fetch similar tracks by vector similarity
export async function fetchSimilarTracks(trackId: string, count = 6): Promise<MusicTrack[]> {
  const { data, error } = await supabase.rpc('find_similar_tracks', {
    track_id: trackId,
    match_count: count,
  });
  if (error) throw error;
  return data;
}

// Increment play count
export async function incrementPlayCount(trackId: string) {
  const { error } = await supabase
    .from('tracks')
    .update({ play_count: supabase.rpc('increment', { x: 1 }) })
    .eq('id', trackId);
  if (error) console.error('Failed to increment play count:', error);
}
```

---

## Step 4 — Update MusicTrack Interface

Update `Src/src/data/musicData.ts` — keep the interface but add optional new fields:

```typescript
export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  imageUrl: string;
  audioUrl: string;      // Will now contain real Supabase Storage CDN URL
  color: string;
  tags?: string[];       // NEW — from Supabase
  play_count?: number;   // NEW — from Supabase
}
```

Keep the hardcoded `allTracks` array as offline fallback.

---

## Step 5 — Update MusicPage to Fetch from Supabase

Replace `getRandomTracks()` call with `fetchRandomTracks()`:

```typescript
// Import the service
import { fetchRandomTracks } from '../services/musicService';
import { getRandomTracks } from '../data/musicData'; // fallback

const loadRandomCards = useCallback(async () => {
  try {
    const tracks = await fetchRandomTracks(CARD_COUNT);
    // ... rest of the card setup
  } catch (error) {
    console.warn('Supabase unavailable, using offline data:', error);
    const tracks = getRandomTracks(CARD_COUNT); // fallback
    // ... rest of the card setup
  }
}, []);
```

---

## Step 6 — Update MusicPlayer for Real Audio

Replace `generateFakeAudioData()` with the **Web Audio API** analyzing real MP3 streams:

```typescript
// Create audio context and analyser
const audioCtx = useRef<AudioContext | null>(null);
const analyser = useRef<AnalyserNode | null>(null);
const audioElement = useRef<HTMLAudioElement | null>(null);
const sourceNode = useRef<MediaElementAudioSourceNode | null>(null);

useEffect(() => {
  if (!track.audioUrl) return; // No real audio, keep fake data

  // Create audio pipeline
  audioCtx.current = new AudioContext();
  analyser.current = audioCtx.current.createAnalyser();
  analyser.current.fftSize = 128; // 64 frequency bins

  audioElement.current = new Audio(track.audioUrl);
  audioElement.current.crossOrigin = 'anonymous';
  sourceNode.current = audioCtx.current.createMediaElementSource(audioElement.current);
  sourceNode.current.connect(analyser.current);
  analyser.current.connect(audioCtx.current.destination);

  audioElement.current.play();

  return () => {
    audioElement.current?.pause();
    audioCtx.current?.close();
  };
}, [track.audioUrl]);

// Get real frequency data for visualizer
const getRealAudioData = (): number[] => {
  if (!analyser.current) return generateFakeAudioData(timeRef.current);
  const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
  analyser.current.getByteFrequencyData(dataArray);
  return Array.from(dataArray).map(v => v / 255); // Normalize 0-1
};
```

All 5 visualizer effects (bars, wave, circles, particles, spectrum) will now react to **real audio**.

---

## Step 7 — Update MusicCard for New Image URLs

No code changes needed — `MusicCard` already uses `track.imageUrl`. The URL will just change from `https://picsum.photos/...` to `https://yourproject.supabase.co/storage/v1/object/public/images/...`.

---

## Step 8 — Vector Embeddings (For Agentic Search)

### Why

Embeddings power:
- **Smart "Up Next" playlist** — similar tracks instead of random
- **Future agentic search** — "find me chill night vibes" → vector similarity

### How to Generate

1. **Sign up** at [huggingface.co](https://huggingface.co) → Settings → Access Tokens → New token (free)

2. **Run this script** (create `Src/scripts/generate-embeddings.ts`):

```typescript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_ROLE_KEY'; // secret key, not anon
const HF_TOKEN = 'hf_xxxxx';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch(
    'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs: text }),
    }
  );
  return await res.json();
}

async function main() {
  const { data: tracks } = await supabase
    .from('tracks')
    .select('id, title, artist, genre, tags')
    .is('embedding', null);

  for (const t of tracks!) {
    const text = `${t.title} by ${t.artist}. Genre: ${t.genre}. Tags: ${(t.tags || []).join(', ')}`;
    const embedding = await getEmbedding(text);
    await supabase.from('tracks').update({ embedding }).eq('id', t.id);
    console.log(`✅ ${t.title}`);
    await new Promise(r => setTimeout(r, 500)); // rate limit
  }
  console.log('Done!');
}

main();
```

3. **Run it**: `npx tsx scripts/generate-embeddings.ts`

4. **Verify**: `SELECT id, title, (embedding IS NOT NULL) as has_vector FROM tracks;`

### Fields Used for Embedding

| Field | Included | Why |
|-------|---------|-----|
| title | ✅ | Carries mood meaning ("Neon Dreams") |
| artist | ✅ | Groups same-artist tracks |
| genre | ✅ | Most important for similarity |
| tags | ✅ | Most descriptive ("chill, night, neon") |
| duration | ❌ | "3:42" has no semantic meaning |
| color | ❌ | "#00e5ff" means nothing to AI |

Combined format: `"Neon Dreams by Agentic Beats. Genre: Synthwave. Tags: synthwave, neon, retro, chill"`

---

## Step 9 — Loading States & Error Handling

Add loading skeletons while tracks load:

```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// In loadRandomCards:
setLoading(true);
try {
  const tracks = await fetchRandomTracks(CARD_COUNT);
  setCards(/* ... */);
  setError(null);
} catch (err) {
  setError('Could not load tracks');
  // Fall back to offline data
} finally {
  setLoading(false);
}
```

---

## Step 10 — Polish & Optimize

| Task | Details |
|------|---------|
| **Audio prefetch** | When track starts, prefetch next track's audio |
| **WebP images** | Convert all cover art to WebP before uploading |
| **Offline fallback** | If Supabase fails, use hardcoded `musicData.ts` |
| **Mobile audio** | Handle autoplay restrictions (require user tap) |
| **Crossfade** | Smooth 1s crossfade between tracks |
| **Progress bar** | Real progress from `audio.currentTime / audio.duration` |
| **Seek** | Click on progress bar to seek (range requests supported) |

---

## Supabase Keys Reference

### Where Each Key Is Used

| Key | Used In | Purpose |
|-----|---------|---------|
| `VITE_SUPABASE_URL` | `.env` → React app | Connects to your Supabase project |
| `VITE_SUPABASE_ANON_KEY` | `.env` → React app | Public read access (safe for frontend) |
| `Service Role Key` | Scripts only (never in `.env`) | Full admin access for seeding/embeddings |
| `HuggingFace Token` | Embedding script only | Generates vector embeddings (free) |

### Security Notes

- ✅ `anon key` is safe in the browser — it respects Row Level Security (RLS)
- ❌ `service_role key` bypasses RLS — **never expose in frontend code**
- Enable RLS on the `tracks` table with a "read-only for anon" policy:

```sql
-- Allow anyone to read tracks
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON tracks FOR SELECT USING (true);
```

---

## File Structure After Phase 3

```
Src/
├── .env                             ← Supabase URL + Anon Key
├── src/
│   ├── services/
│   │   ├── supabaseClient.ts        ← NEW: Supabase client instance
│   │   └── musicService.ts          ← NEW: fetchRandomTracks, fetchSimilarTracks
│   ├── components/
│   │   ├── MusicPage.tsx             ← UPDATED: fetch from Supabase
│   │   ├── MusicPlayer.tsx           ← UPDATED: real audio + Web Audio API
│   │   ├── MusicCard.tsx             ← No changes (uses imageUrl)
│   │   └── ...
│   ├── data/
│   │   └── musicData.ts             ← KEPT: offline fallback
│   └── ...
├── scripts/
│   └── generate-embeddings.ts       ← NEW: one-time embedding script
```
