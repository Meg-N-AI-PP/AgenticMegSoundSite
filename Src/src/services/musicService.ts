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
