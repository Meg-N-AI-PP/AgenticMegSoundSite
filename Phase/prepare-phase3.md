# Phase 3 — Backend, Database & Real Audio

## Overview

Phase 2 built the music page with draft data (20 hardcoded tracks, placeholder images from picsum.photos, no real audio). Phase 3 replaces all of that with a real backend — a database that stores music metadata + vector embeddings for similarity search, cloud storage for MP3 and image files, and an API layer that feeds data to the React frontend.

---

## 1. What We Need to Store

| Data Type | Description | Size Estimate |
|-----------|-------------|---------------|
| **Metadata** | title, artist, genre, duration, color, tags, created_at | ~1 KB per track |
| **Vector Embedding** | 384–1536 dim float array for similarity/recommendation | ~2–6 KB per track |
| **MP3 Audio** | The actual music file | 3–8 MB per track |
| **Cover Image** | Album art / anime-style image (jpg/webp) | 50–300 KB per track |

Key requirements:
- Fast metadata queries (filter by genre, random selection, search)
- Vector similarity search (find similar tracks by mood/sound)
- Efficient audio streaming with range requests (seek support)
- CDN-cached image delivery
- Easy to seed with draft/anime data initially

---

## 2. Recommended Stack — Supabase (Best Fit)

### Why Supabase?

**Supabase** is the best all-in-one solution for this project because it provides every layer we need under one platform:

| Need | Supabase Feature |
|------|-----------------|
| Metadata DB | **PostgreSQL** — full relational DB with JSON support |
| Vector search | **pgvector** extension — native vector similarity built into Postgres |
| File storage (MP3 + images) | **Supabase Storage** — S3-compatible object storage with CDN |
| API layer | **Auto-generated REST API** (PostgREST) + **Edge Functions** (Deno) |
| Auth (future) | **Supabase Auth** — if we ever need user accounts |
| Real-time (future) | **Supabase Realtime** — live subscriptions for collaborative features |
| Free tier | **Generous** — 500 MB database, 1 GB storage, 2 GB bandwidth, unlimited API calls |

### Alternative Options Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **Pinecone + Cloudflare R2** | Best-in-class vector search, R2 is cheap | Two services to manage, Pinecone free tier is limited (1 index), no relational DB | ❌ Overkill, need separate DB for metadata |
| **Weaviate Cloud + S3** | Multimodal vectors, stores objects with vectors | Heavier setup, steeper learning curve, free tier limited to 14 days | ❌ Too complex for our scale |
| **Qdrant + Railway + S3** | Fast Rust-based vector DB | Need to self-host or pay, plus separate DB + storage | ❌ Too many moving parts |
| **PlanetScale + Pinecone + R2** | MySQL + vectors + storage | Three services, MySQL has no native vector support | ❌ Over-engineered |
| **Supabase (pgvector)** | All-in-one: Postgres + vectors + storage + API + auth | Vector search not as specialized as Pinecone at massive scale | ✅ **Perfect for our scale** |

> At our scale (20–500 tracks), pgvector in Supabase performs identically to specialized vector DBs. We'd only need Pinecone/Weaviate if we hit 1M+ vectors.

---

## 3. Database Schema

```sql
-- Enable vector extension
create extension if not exists vector;

-- Main tracks table
create table tracks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  artist        text not null,
  genre         text not null,
  duration      text not null,          -- "3:42" format
  duration_sec  integer not null,       -- 222 (for sorting/filtering)
  color         text not null,          -- "#00e5ff" accent color
  tags          text[] default '{}',    -- ["chill", "night", "anime"]
  
  -- File references (Supabase Storage paths)
  audio_path    text not null,          -- "audio/neon-dreams.mp3"
  image_path    text not null,          -- "images/neon-dreams.webp"
  
  -- Vector embedding for similarity search
  embedding     vector(384),            -- all-MiniLM-L6-v2 output dimension
  
  -- Metadata
  play_count    integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Indexes for performance
create index idx_tracks_genre on tracks(genre);
create index idx_tracks_created on tracks(created_at desc);

-- Vector similarity index (IVFFlat for fast approximate search)
create index idx_tracks_embedding on tracks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 10);

-- Function: get random tracks (replaces client-side shuffle)
create or replace function get_random_tracks(count integer default 12)
returns setof tracks as $$
  select * from tracks order by random() limit count;
$$ language sql;

-- Function: find similar tracks by vector
create or replace function find_similar_tracks(
  track_id uuid,
  match_count integer default 6
)
returns table (
  id uuid,
  title text,
  artist text,
  genre text,
  similarity float
) as $$
  select
    t.id,
    t.title,
    t.artist,
    t.genre,
    1 - (t.embedding <=> (select embedding from tracks where id = track_id)) as similarity
  from tracks t
  where t.id != track_id
  order by t.embedding <=> (select embedding from tracks where id = track_id)
  limit match_count;
$$ language sql;
```

### Storage Buckets

```
supabase-storage/
├── audio/          ← MP3 files (public bucket, CDN-cached)
│   ├── neon-dreams.mp3
│   ├── digital-horizon.mp3
│   └── ...
├── images/         ← Cover art (public bucket, CDN-cached)
│   ├── neon-dreams.webp
│   ├── digital-horizon.webp
│   └── ...
```

Both buckets set to **public** with aggressive caching headers for CDN performance.

---

## 3.5 How to Insert Data

You can insert data in **3 ways** — pick whichever you prefer:

### Method 1: SQL Editor (Quickest — Paste & Run)

Go to **Supabase Dashboard → SQL Editor → New Query** and paste:

```sql
-- Insert all 20 draft tracks
-- (audio_path and image_path will be updated once you upload files to Storage)

INSERT INTO tracks (title, artist, genre, duration, duration_sec, color, tags, audio_path, image_path) VALUES
('Neon Dreams',        'Agentic Beats',    'Synthwave',    '3:42', 222, '#00e5ff', '{"synthwave","neon","retro","chill"}',        'audio/neon-dreams.mp3',        'images/neon-dreams.webp'),
('Digital Horizon',    'Cyber Pulse',      'Electronic',   '4:15', 255, '#7c3aed', '{"electronic","cyber","upbeat"}',             'audio/digital-horizon.mp3',    'images/digital-horizon.webp'),
('Midnight Protocol',  'Ghost Signal',     'Ambient',      '5:08', 308, '#ff6b35', '{"ambient","night","mysterious"}',            'audio/midnight-protocol.mp3',  'images/midnight-protocol.webp'),
('Neural Cascade',     'Deep Circuit',     'Techno',       '3:55', 235, '#00e676', '{"techno","deep","neural","dark"}',           'audio/neural-cascade.mp3',     'images/neural-cascade.webp'),
('Sakura Rain',        'Miku Waves',       'Lo-fi',        '4:30', 270, '#ff69b4', '{"lofi","anime","sakura","chill"}',           'audio/sakura-rain.mp3',        'images/sakura-rain.webp'),
('Void Walker',        'Binary Shade',     'Dark Synth',   '3:18', 198, '#8b5cf6', '{"darksynth","void","intense"}',              'audio/void-walker.mp3',        'images/void-walker.webp'),
('Electric Garden',    'Pixel Flora',      'Chillstep',    '4:52', 292, '#10b981', '{"chillstep","garden","peaceful"}',           'audio/electric-garden.mp3',    'images/electric-garden.webp'),
('Starlight Express',  'Cosmo Drift',      'Future Bass',  '3:38', 218, '#f59e0b', '{"futurebass","cosmic","bright"}',            'audio/starlight-express.mp3',  'images/starlight-express.webp'),
('Crystal Memory',     'Echo Glass',       'Dream Pop',    '5:22', 322, '#06b6d4', '{"dreampop","crystal","dreamy"}',             'audio/crystal-memory.mp3',     'images/crystal-memory.webp'),
('Phantom Code',       'Hex Runner',       'Cyberpunk',    '4:05', 245, '#ef4444', '{"cyberpunk","phantom","dark","code"}',       'audio/phantom-code.mp3',       'images/phantom-code.webp'),
('Ocean of Data',      'Wave Function',    'Trance',       '6:10', 370, '#3b82f6', '{"trance","ocean","deep","epic"}',            'audio/ocean-of-data.mp3',      'images/ocean-of-data.webp'),
('Firefly Network',    'Lumina AI',        'Electronica',  '3:48', 228, '#eab308', '{"electronica","firefly","warm"}',            'audio/firefly-network.mp3',    'images/firefly-network.webp'),
('Silent Algorithm',   'Zero Noise',       'Minimal',      '4:42', 282, '#64748b', '{"minimal","silent","clean"}',                'audio/silent-algorithm.mp3',   'images/silent-algorithm.webp'),
('Astral Projection',  'Nebula Drive',     'Psytrance',    '7:15', 435, '#a855f7', '{"psytrance","astral","epic","space"}',       'audio/astral-projection.mp3',  'images/astral-projection.webp'),
('Ruby Storm',         'Crimson Beat',     'Drum & Bass',  '4:20', 260, '#dc2626', '{"dnb","ruby","intense","fast"}',             'audio/ruby-storm.mp3',         'images/ruby-storm.webp'),
('Frost Byte',         'Arctic Pulse',     'Ambient',      '5:55', 355, '#22d3ee', '{"ambient","frost","cold","chill"}',          'audio/frost-byte.mp3',         'images/frost-byte.webp'),
('Solar Flare',        'Helio Beat',       'House',        '3:30', 210, '#f97316', '{"house","solar","energy","warm"}',           'audio/solar-flare.mp3',        'images/solar-flare.webp'),
('Quantum Leap',       'Particle Groove',  'Progressive',  '6:42', 402, '#14b8a6', '{"progressive","quantum","deep"}',            'audio/quantum-leap.mp3',       'images/quantum-leap.webp'),
('Twilight Sync',      'Dusk Module',      'Downtempo',    '4:58', 298, '#6366f1', '{"downtempo","twilight","mellow"}',            'audio/twilight-sync.mp3',      'images/twilight-sync.webp'),
('Emerald Circuit',    'Jade Machine',     'Tech House',   '5:15', 315, '#059669', '{"techhouse","emerald","groovy"}',             'audio/emerald-circuit.mp3',    'images/emerald-circuit.webp');
```

After running, verify with:
```sql
SELECT id, title, artist, genre, duration, color FROM tracks ORDER BY created_at;
```

### Method 2: Table Editor (GUI — No SQL needed)

1. Go to **Supabase Dashboard → Table Editor → tracks**
2. Click **"Insert Row"** (top right)
3. Fill in the fields:
   - `title`: Neon Dreams
   - `artist`: Agentic Beats
   - `genre`: Synthwave
   - `duration`: 3:42
   - `duration_sec`: 222
   - `color`: #00e5ff
   - `tags`: `{synthwave,neon,retro,chill}` (curly braces, no quotes)
   - `audio_path`: audio/neon-dreams.mp3
   - `image_path`: images/neon-dreams.webp
   - Leave `embedding` empty (we'll add later)
   - Leave `play_count`, `created_at`, `updated_at` as defaults
4. Click **Save**
5. Repeat for each track (or just use Method 1, it's faster 😄)

### Method 3: Supabase JavaScript Client (From your app or a script)

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://YOUR_PROJECT.supabase.co', 'YOUR_ANON_KEY');

// Insert a single track
const { data, error } = await supabase
  .from('tracks')
  .insert({
    title: 'Neon Dreams',
    artist: 'Agentic Beats',
    genre: 'Synthwave',
    duration: '3:42',
    duration_sec: 222,
    color: '#00e5ff',
    tags: ['synthwave', 'neon', 'retro', 'chill'],
    audio_path: 'audio/neon-dreams.mp3',
    image_path: 'images/neon-dreams.webp',
  });

// Insert multiple tracks at once
const { data: allData, error: allError } = await supabase
  .from('tracks')
  .insert([
    {
      title: 'Neon Dreams',
      artist: 'Agentic Beats',
      genre: 'Synthwave',
      duration: '3:42',
      duration_sec: 222,
      color: '#00e5ff',
      tags: ['synthwave', 'neon', 'retro', 'chill'],
      audio_path: 'audio/neon-dreams.mp3',
      image_path: 'images/neon-dreams.webp',
    },
    {
      title: 'Digital Horizon',
      artist: 'Cyber Pulse',
      genre: 'Electronic',
      duration: '4:15',
      duration_sec: 255,
      color: '#7c3aed',
      tags: ['electronic', 'cyber', 'upbeat'],
      audio_path: 'audio/digital-horizon.mp3',
      image_path: 'images/digital-horizon.webp',
    },
    // ... more tracks
  ]);
```

### Upload Files to Storage (Before or After Insert)

#### Via Dashboard (Easiest):
1. Go to **Storage** → Click **"New Bucket"** → Name it `audio` → Toggle **Public** → Create
2. Same for `images` bucket
3. Click into `audio` bucket → **Upload** → drag your MP3 files
4. Click into `images` bucket → **Upload** → drag your cover art images

#### Via JavaScript:
```typescript
// Upload an MP3
const audioFile = /* File or Blob */;
await supabase.storage
  .from('audio')
  .upload('neon-dreams.mp3', audioFile, { contentType: 'audio/mpeg' });

// Upload a cover image
const imageFile = /* File or Blob */;
await supabase.storage
  .from('images')
  .upload('neon-dreams.webp', imageFile, { contentType: 'image/webp' });

// Get the public URL
const { data } = supabase.storage
  .from('audio')
  .getPublicUrl('neon-dreams.mp3');
console.log(data.publicUrl);
// → https://YOUR_PROJECT.supabase.co/storage/v1/object/public/audio/neon-dreams.mp3
```

### Quick Checklist

- [ ] Run the INSERT SQL in SQL Editor (Method 1) — takes 10 seconds
- [ ] Verify: `SELECT count(*) FROM tracks;` → should return 20
- [ ] Create `audio` and `images` storage buckets (set to Public)
- [ ] Upload your MP3 files to `audio` bucket
- [ ] Upload your cover art to `images` bucket
- [ ] Verify a public URL works: open `https://YOUR_PROJECT.supabase.co/storage/v1/object/public/audio/neon-dreams.mp3` in browser

---

## 4. Backend API Layer

### Option A: Direct Supabase Client (Recommended for simplicity)

Use the `@supabase/supabase-js` client directly from the React app. No separate backend server needed.

```
React App → Supabase Client SDK → Supabase (Postgres + Storage)
```

**Pros**: Zero backend code, instant setup, auto-generated TypeScript types
**Cons**: Database credentials exposed in client (Row Level Security mitigates this)

### Option B: Supabase Edge Functions (Recommended if we need custom logic)

Deno-based serverless functions running on Supabase's edge network.

```
React App → Supabase Edge Functions → Supabase (Postgres + Storage)
```

Use this for:
- Generating vector embeddings on upload (call OpenAI/Hugging Face API)
- Custom recommendation logic
- Incrementing play counts
- Admin-only operations

### Recommendation

**Start with Option A** (direct client) for reading tracks. Add **Edge Functions** only for write operations (seeding data, incrementing play count, generating embeddings).

---

## 5. Frontend Integration Plan

### New Dependencies

```json
{
  "@supabase/supabase-js": "^2.x"
}
```

### Updated Data Flow

```
Current (Phase 2):
  musicData.ts (hardcoded) → getRandomTracks() → MusicPage

Phase 3:
  Supabase DB → supabase.rpc('get_random_tracks') → MusicPage
  Supabase Storage → CDN URL for audio/images → MusicPlayer
```

### Updated MusicTrack Interface

```typescript
export interface MusicTrack {
  id: string;             // uuid from Supabase
  title: string;
  artist: string;
  genre: string;
  duration: string;       // "3:42"
  duration_sec: number;   // 222
  color: string;          // "#00e5ff"
  tags: string[];         // ["chill", "night"]
  audio_url: string;      // Supabase Storage CDN URL
  image_url: string;      // Supabase Storage CDN URL
  play_count: number;
}
```

### New Service Layer: `src/services/musicService.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Get random tracks for the music page
export async function fetchRandomTracks(count = 12): Promise<MusicTrack[]> {
  const { data, error } = await supabase.rpc('get_random_tracks', { count });
  if (error) throw error;
  return data.map(track => ({
    ...track,
    audio_url: supabase.storage.from('audio').getPublicUrl(track.audio_path).data.publicUrl,
    image_url: supabase.storage.from('images').getPublicUrl(track.image_path).data.publicUrl,
  }));
}

// Get similar tracks for the playlist
export async function fetchSimilarTracks(trackId: string, count = 6) {
  const { data, error } = await supabase.rpc('find_similar_tracks', {
    track_id: trackId,
    match_count: count,
  });
  if (error) throw error;
  return data;
}

// Increment play count
export async function incrementPlayCount(trackId: string) {
  await supabase.rpc('increment_play_count', { track_id: trackId });
}
```

### MusicPage Changes

```typescript
// Before (Phase 2):
const tracks = getRandomTracks(12); // from hardcoded data

// After (Phase 3):
const tracks = await fetchRandomTracks(12); // from Supabase
```

### MusicPlayer Changes — Real Audio

Replace the fake audio data generator with the **Web Audio API** analyzing real MP3 streams:

```typescript
// Create audio context + analyser
const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();
const audio = new Audio(track.audio_url);
const source = audioCtx.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioCtx.destination);

// Get real frequency data for visualizer
const dataArray = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteFrequencyData(dataArray);
// Normalize to 0-1 range and feed to existing drawVisualization()
```

This means all 5 visualization effects (bars, wave, circles, particles, spectrum) will react to **real audio** instead of simulated data.

---

## 6. Draft Data Seeding Plan

### Anime-Style Images

Use free anime/art image sources for draft cover art:
- **Waifu.pics API** — free anime images
- **Picsum with anime seeds** — generic placeholders  
- **Unsplash** — search "anime art", "cyberpunk", "neon"
- **Self-generated** — use AI image generators (Stable Diffusion, DALL-E) for unique covers

### Draft MP3 Audio

Free music sources for draft/demo tracks:
- **Suno AI** — Generate custom tracks (you already have a Suno account @megssrare)
- **Pixabay Music** — Free royalty-free tracks
- **Free Music Archive** — CC-licensed music
- **Incompetech** — Kevin MacLeod royalty-free library

### Seeding Script

Create a Node.js script that:
1. Reads a CSV/JSON file with track metadata
2. Uploads MP3 files to Supabase Storage `audio/` bucket
3. Uploads image files to Supabase Storage `images/` bucket
4. Generates vector embeddings via Hugging Face API (free inference)
5. Inserts rows into the `tracks` table

```
scripts/
├── seed-tracks.ts        ← Main seeding script
├── generate-embeddings.ts ← Call HuggingFace for embeddings
└── draft-data/
    ├── tracks.json       ← Metadata for all draft tracks
    ├── audio/            ← MP3 files to upload
    └── images/           ← Cover art to upload
```

---

## 7. Vector Embeddings Strategy

### What to Embed

Combine text metadata into a single string for embedding:

```
"Neon Dreams by Agentic Beats. Genre: Synthwave. Tags: chill, night, neon, retro."
```

### Embedding Model

**all-MiniLM-L6-v2** via Hugging Face Inference API (free tier):
- 384 dimensions
- Fast inference
- Good quality for text similarity
- Free API access

### Use Cases

1. **"Similar tracks" playlist**: When user plays a track, find 5-6 most similar tracks by vector distance → auto-populate the "Up Next" playlist
2. **Mood-based browsing** (future): Search "chill night vibes" → embed the query → find closest tracks
3. **Smart shuffle** (future): Instead of pure random, bias toward tracks similar to what user has been playing

---

## 8. Performance Optimizations

| Optimization | How |
|-------------|-----|
| **Audio streaming** | Supabase Storage supports HTTP range requests → seeking works natively |
| **Image CDN** | Supabase Storage has built-in CDN with edge caching |
| **Image format** | Convert all images to WebP (50-70% smaller than JPEG) |
| **Preload next track** | When a track starts, prefetch the next track's audio via `<link rel="prefetch">` |
| **Lazy load images** | Already implemented with `loading="lazy"` on card images |
| **Connection pooling** | Supabase uses PgBouncer → handles concurrent requests efficiently |
| **Database indexes** | IVFFlat index on vectors, B-tree on genre/created_at |
| **Client-side cache** | Cache fetched tracks in React state, only re-fetch on 5-min refresh |
| **Audio buffer** | Use Web Audio API `decodeAudioData` for gapless playback between tracks |

---

## 9. Environment & Config

### `.env` file (Src/.env)

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

### Supabase Project Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Enable the `vector` extension in SQL Editor
3. Run the schema SQL from Section 3
4. Create `audio` and `images` storage buckets (public)
5. Set CORS policy to allow our domain
6. Copy project URL and anon key to `.env`

---

## 10. Implementation Phases (Sub-steps)

### Phase 3A — Supabase Setup & Schema
- [ ] Create Supabase project
- [ ] Run schema migration (tracks table, indexes, functions)
- [ ] Create storage buckets (audio, images)
- [ ] Configure RLS policies (read-only for anon)
- [ ] Test with SQL Editor

### Phase 3B — Seed Draft Data
- [ ] Collect 20 anime cover art images (WebP)
- [ ] Collect/generate 20 MP3 tracks (Suno / Pixabay)
- [ ] Create seeding script
- [ ] Upload files to Supabase Storage
- [ ] Insert metadata into tracks table
- [ ] Generate and store vector embeddings

### Phase 3C — Frontend Integration
- [ ] Install `@supabase/supabase-js`
- [ ] Create `musicService.ts` with Supabase queries
- [ ] Update `MusicPage.tsx` to fetch from Supabase instead of hardcoded data
- [ ] Update `MusicPlayer.tsx` to use real `<audio>` element + Web Audio API
- [ ] Connect real audio to the 5 visualization effects
- [ ] Update playlist to use vector similarity ("Up Next" = similar tracks)
- [ ] Add play count tracking

### Phase 3D — Polish & Optimize
- [ ] Add loading states / skeleton screens while fetching
- [ ] Add error handling / retry logic
- [ ] Implement audio prefetching (preload next track)
- [ ] Add smooth crossfade between tracks
- [ ] Test on mobile (audio autoplay policies)
- [ ] Performance audit (Lighthouse)

---

## 11. Cost Estimate (Supabase Free Tier)

| Resource | Free Tier Limit | Our Usage Estimate |
|----------|----------------|-------------------|
| Database | 500 MB | ~5 MB (500 tracks max) |
| Storage | 1 GB | ~200 MB (20 tracks × ~5 MB MP3 + images) |
| Bandwidth | 2 GB / month | Depends on visitors |
| API Requests | Unlimited | Low traffic portfolio site |
| Edge Functions | 500K invocations | Minimal |

**We'll be well within the free tier** for a portfolio project. If traffic grows, Supabase Pro is $25/month with 8 GB database, 100 GB storage, and 250 GB bandwidth.

---

## 12. Folder Structure After Phase 3

```
Src/
├── .env                          ← Supabase credentials
├── src/
│   ├── services/
│   │   └── musicService.ts       ← Supabase client + queries
│   ├── hooks/
│   │   ├── useAudioPlayer.ts     ← Web Audio API hook
│   │   └── useTracks.ts          ← Data fetching hook
│   ├── components/
│   │   ├── MusicPage.tsx          ← Updated to use Supabase
│   │   ├── MusicPlayer.tsx        ← Updated with real audio
│   │   ├── MusicCard.tsx          ← No changes needed
│   │   └── ...
│   ├── data/
│   │   └── musicData.ts          ← Keep as fallback / offline mode
│   └── types/
│       └── database.types.ts     ← Auto-generated Supabase types
├── scripts/
│   ├── seed-tracks.ts
│   ├── generate-embeddings.ts
│   └── draft-data/
│       ├── tracks.json
│       ├── audio/
│       └── images/
```

---

## Summary

| Decision | Choice | Reason |
|----------|--------|--------|
| **Database** | Supabase (PostgreSQL + pgvector) | All-in-one, free tier, vector search built-in |
| **File Storage** | Supabase Storage | S3-compatible, CDN, same platform |
| **Vector Embeddings** | all-MiniLM-L6-v2 via HuggingFace | Free, 384 dims, good quality |
| **API Layer** | Supabase Client SDK + Edge Functions | Zero backend code for reads, serverless for writes |
| **Audio Playback** | Web Audio API + HTML5 Audio | Real frequency data for visualizer |
| **Performance** | CDN + prefetch + WebP + indexes | Fast loading, smooth playback |
| **Cost** | $0 (free tier) | More than enough for portfolio scale |
