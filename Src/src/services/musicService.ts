import { supabase, isSupabaseConfigured } from './supabaseClient';
import { MusicTrack, getRandomTracks as getOfflineTracks } from '../data/musicData';

/**
 * Database row shape returned by Supabase.
 * Supports both full URLs and relative storage paths in audio_path / image_path.
 */
interface TrackRow {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  color: string;
  tags: string[] | null;
  audio_path: string;
  image_path: string;
  play_count: number;
}

/**
 * Resolve a storage value to a full URL.
 * If it's already a full URL (https://...), return as-is.
 * Otherwise treat it as a relative path inside the given bucket.
 */
function resolveStorageUrl(value: string, bucket: string): string {
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  return supabase!
    .storage.from(bucket)
    .getPublicUrl(value).data.publicUrl;
}

/**
 * Convert a Supabase row into our frontend MusicTrack shape
 */
function mapRowToTrack(row: TrackRow): MusicTrack {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    genre: row.genre,
    duration: row.duration,
    color: row.color,
    imageUrl: resolveStorageUrl(row.image_path, 'Meg Sound'),
    audioUrl: resolveStorageUrl(row.audio_path, 'Meg Sound'),
    tags: row.tags || [],
    play_count: row.play_count ?? 0,
  };
}

/**
 * Fetch random tracks from Supabase via the `get_random_tracks` RPC function.
 * Falls back to offline data if Supabase is not configured.
 */
export async function fetchRandomTracks(count = 12): Promise<MusicTrack[]> {
  if (!isSupabaseConfigured) {
    console.log('📦 Using offline track data');
    return getOfflineTracks(count);
  }

  try {
    const { data, error } = await supabase!.rpc('get_random_tracks', { count });

    if (error) {
      console.error('Supabase RPC error:', error.message);
      throw error;
    }

    if (!data || data.length === 0) {
      console.warn('No tracks returned from Supabase, using offline data');
      return getOfflineTracks(count);
    }

    return (data as TrackRow[]).map(mapRowToTrack);
  } catch (err) {
    console.warn('⚠️ Supabase unavailable, falling back to offline data:', err);
    return getOfflineTracks(count);
  }
}

/**
 * Fetch all tracks ordered by creation date.
 */
export async function fetchAllTracks(): Promise<MusicTrack[]> {
  if (!isSupabaseConfigured) return getOfflineTracks(20);

  try {
    const { data, error } = await supabase!
      .from('tracks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as TrackRow[]).map(mapRowToTrack);
  } catch (err) {
    console.warn('⚠️ fetchAllTracks fallback:', err);
    return getOfflineTracks(20);
  }
}

/**
 * Find similar tracks using vector embeddings (pgvector).
 * Falls back to random tracks if embeddings aren't ready.
 */
export async function fetchSimilarTracks(
  trackId: string,
  count = 6
): Promise<MusicTrack[]> {
  if (!isSupabaseConfigured) return getOfflineTracks(count);

  try {
    const { data, error } = await supabase!.rpc('find_similar_tracks', {
      track_id: trackId,
      match_count: count,
    });

    if (error) throw error;
    if (!data || data.length === 0) return getOfflineTracks(count);

    // The RPC returns a slimmer shape — fetch full rows for the matched IDs
    const ids = data.map((d: { id: string }) => d.id);
    const { data: fullRows, error: fetchErr } = await supabase!
      .from('tracks')
      .select('*')
      .in('id', ids);

    if (fetchErr) throw fetchErr;
    return (fullRows as TrackRow[]).map(mapRowToTrack);
  } catch (err) {
    console.warn('⚠️ fetchSimilarTracks fallback:', err);
    return getOfflineTracks(count);
  }
}

/**
 * Fetch tracks filtered by genre (case-insensitive).
 * Falls back to tag-based search, then random tracks.
 */
export async function fetchTracksByGenre(
  genre: string,
  count = 6
): Promise<MusicTrack[]> {
  if (!isSupabaseConfigured) {
    const all = getOfflineTracks(20);
    const genreLower = genre.toLowerCase();
    const filtered = all.filter(
      t =>
        t.genre.toLowerCase().includes(genreLower) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(genreLower)))
    );
    return filtered.length > 0 ? filtered.slice(0, count) : getOfflineTracks(count);
  }

  try {
    // 1. Try genre column match
    const { data, error } = await supabase!
      .from('tracks')
      .select('*')
      .ilike('genre', `%${genre}%`)
      .limit(count);

    if (error) throw error;

    if (data && data.length > 0) {
      return (data as TrackRow[]).map(mapRowToTrack);
    }

    // 2. Fallback: try matching tags
    const { data: tagData, error: tagErr } = await supabase!
      .from('tracks')
      .select('*')
      .contains('tags', [genre.toLowerCase()])
      .limit(count);

    if (!tagErr && tagData && tagData.length > 0) {
      return (tagData as TrackRow[]).map(mapRowToTrack);
    }

    // 3. Final fallback: random tracks
    return fetchRandomTracks(count);
  } catch (err) {
    console.warn('⚠️ fetchTracksByGenre fallback:', err);
    return fetchRandomTracks(count);
  }
}

/**
 * Fetch distinct genre values from the tracks table.
 * Returns a sorted array of unique genre strings.
 * Falls back to offline data genres if Supabase is not configured.
 */
export async function fetchDistinctGenres(): Promise<string[]> {
  if (!isSupabaseConfigured) {
    const all = getOfflineTracks(50);
    const genres = [...new Set(all.map(t => t.genre))];
    return genres.sort();
  }

  try {
    const { data, error } = await supabase!
      .from('tracks')
      .select('genre');

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Extract unique genres (some rows may have compound genres like "Synthwave; Retrowave")
    const genreSet = new Set<string>();
    for (const row of data as { genre: string }[]) {
      // Split compound genres on ; or , and trim
      const parts = row.genre.split(/[;,]/).map(g => g.trim()).filter(Boolean);
      parts.forEach(g => genreSet.add(g));
    }
    return [...genreSet].sort();
  } catch (err) {
    console.warn('⚠️ fetchDistinctGenres fallback:', err);
    const all = getOfflineTracks(50);
    return [...new Set(all.map(t => t.genre))].sort();
  }
}

/**
 * Increment play count for a track (fire-and-forget).
 */
export async function incrementPlayCount(trackId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    // Use raw SQL increment to avoid race conditions
    const { error } = await supabase!.rpc('increment_play_count', {
      track_id: trackId,
    });
    if (error) {
      // If the RPC doesn't exist yet, try a simple update
      await supabase!
        .from('tracks')
        .update({ play_count: 1 }) // Will be overwritten when RPC exists
        .eq('id', trackId);
    }
  } catch (err) {
    console.error('Failed to increment play count:', err);
  }
}

/**
 * Universal natural-language music search.
 * Uses Supabase Edge Function → OpenAI embedding → pgvector cosine similarity.
 * Results are cached in-memory to avoid repeated API calls for the same query.
 * Falls back to random tracks only if the Edge Function is unavailable.
 */

const searchCache = new Map<string, { tracks: MusicTrack[]; method: string; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function searchTracksVector(
  query: string,
  count = 6
): Promise<{ tracks: MusicTrack[]; method: string }> {
  if (!isSupabaseConfigured) {
    const all = getOfflineTracks(20);
    const q = query.toLowerCase();
    const filtered = all.filter(
      t =>
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
    );
    return {
      tracks: filtered.length > 0 ? filtered.slice(0, count) : getOfflineTracks(count),
      method: filtered.length > 0 ? 'offline-text-match' : 'offline-random',
    };
  }

  // Check cache first (instant response for repeated queries)
  const cacheKey = `${query.toLowerCase().trim()}:${count}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return { tracks: cached.tracks, method: 'vector-search-cached' };
  }

  // Vector search via Edge Function — returns full track rows (single round-trip)
  try {
    const { data: fnData, error: fnError } = await supabase!.functions.invoke('smooth-handler', {
      body: { query, count },
    });

    if (!fnError && fnData && fnData.length > 0) {
      const tracks = (fnData as TrackRow[]).map(mapRowToTrack);
      searchCache.set(cacheKey, { tracks, method: 'vector-search', ts: Date.now() });
      return { tracks, method: 'vector-search' };
    }
  } catch (err) {
    console.warn('⚠️ Vector search failed:', err);
  }

  // Fallback: random tracks
  const random = await fetchRandomTracks(count);
  return { tracks: random, method: 'random-fallback' };
}
