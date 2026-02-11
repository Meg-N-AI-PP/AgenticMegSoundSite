import { useEffect, useRef, useState, useCallback } from 'react';
import { CopilotKit } from '@copilotkit/react-core';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import { CopilotPopup } from '@copilotkit/react-ui';
import { usePlayer } from '../context/PlayerContext';
import { fetchRandomTracks, fetchSimilarTracks, searchTracksVector, fetchTracksByGenre, fetchDistinctGenres } from '../services/musicService';
import { MusicTrack } from '../data/musicData';

const IDLE_TIMEOUT = 2 * 60 * 1000; // 2 minutes

/** Emoji map for common genre keywords — adds visual flair to genre buttons */
const GENRE_EMOJI: Record<string, string> = {
  synthwave: '🌊', retrowave: '🌊', electronic: '🔮', techno: '⚡',
  ambient: '🌙', 'lo-fi': '🎧', lofi: '🎧', chillwave: '🌅',
  'future bass': '🎶', 'drum & bass': '🔥', trance: '🌀',
  downtempo: '🎹', house: '🏠', vaporwave: '💿', industrial: '⚙️',
  'trip-hop': '🎭', 'glitch hop': '✨', progressive: '🌈',
  idm: '🧠', 'nu-disco': '🪩', experimental: '🧪', 'dark synth': '🖤',
};
function genreEmoji(genre: string): string {
  const g = genre.toLowerCase();
  for (const [key, emoji] of Object.entries(GENRE_EMOJI)) {
    if (g.includes(key)) return emoji;
  }
  return '🎵';
}

/* ──────────────────────────────────────────────
   Generative UI components for the music chat
   ────────────────────────────────────────────── */

/** Extract a short genre label (first word / first segment before ; or ,) */
function shortGenre(genre: string): string {
  const seg = genre.split(/[;,]/)[0].trim();
  // If still long, take first 2 words
  const words = seg.split(/\s+/);
  return words.length > 2 ? words.slice(0, 2).join(' ') : seg;
}

function PlaylistCard({ tracks: initialTracks, title, onPlayAll }: {
  tracks: MusicTrack[];
  title: string;
  onPlayAll?: (tracks: MusicTrack[]) => void;
}) {
  const [tracks, setTracks] = useState(initialTracks);

  const removeTrack = (id: string) => {
    setTracks(prev => prev.filter(t => t.id !== id));
  };

  if (tracks.length === 0) {
    return (
      <div style={{
        background: 'rgba(15, 15, 30, 0.9)',
        border: '1px solid rgba(124, 58, 237, 0.2)',
        borderRadius: '12px',
        padding: '14px',
        marginTop: '8px',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center' }}>All tracks removed from this playlist.</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(15, 15, 30, 0.9)',
      border: '1px solid rgba(124, 58, 237, 0.2)',
      borderRadius: '12px',
      padding: '14px',
      marginTop: '8px',
    }}>
      <h4 style={{ color: '#b794f6', margin: '0 0 10px', fontSize: '13px' }}>🎵 {title}</h4>
      {tracks.map((t, i) => (
        <div key={t.id} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '5px 0',
          borderBottom: i < tracks.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
        }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', width: '14px', flexShrink: 0, textAlign: 'center' }}>{i + 1}</span>
          <img
            src={t.imageUrl}
            alt={t.title}
            style={{ width: 30, height: 30, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#fff', margin: 0, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', margin: '1px 0 0', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {t.artist}
              <span style={{
                background: `${t.color}18`,
                color: t.color,
                padding: '0px 4px',
                borderRadius: '3px',
                fontSize: '9px',
                marginLeft: '5px',
              }}>{shortGenre(t.genre)}</span>
            </p>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', flexShrink: 0 }}>{t.duration}</span>
          <button
            onClick={() => removeTrack(t.id)}
            title="Remove track"
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.2)',
              cursor: 'pointer',
              padding: '2px',
              fontSize: '13px',
              lineHeight: 1,
              flexShrink: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#ff5252')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
          >✕</button>
        </div>
      ))}
      {/* Play All button */}
      {onPlayAll && (
        <button
          onClick={() => onPlayAll(tracks)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            marginTop: '10px',
            padding: '8px 0',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(192,132,252,0.15))',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            borderRadius: '8px',
            color: '#c084fc',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.4), rgba(192,132,252,0.25))';
            e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(192,132,252,0.15))';
            e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)';
          }}
        >▶ Play All ({tracks.length} tracks)</button>
      )}
    </div>
  );
}

function NowPlayingCard({ track }: { track: MusicTrack }) {
  return (
    <div style={{
      background: 'rgba(15, 15, 30, 0.9)',
      border: `1px solid ${track.color}33`,
      borderRadius: '12px',
      padding: '14px',
      marginTop: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}>
      <img
        src={track.imageUrl}
        alt={track.title}
        style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
      />
      <div style={{ flex: 1 }}>
        <p style={{ color: '#fff', margin: 0, fontSize: '14px', fontWeight: 600 }}>{track.title}</p>
        <p style={{ color: 'rgba(255,255,255,0.5)', margin: '2px 0 0', fontSize: '12px' }}>{track.artist}</p>
        <span style={{
          background: `${track.color}20`,
          color: track.color,
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          marginTop: '4px',
          display: 'inline-block',
          maxWidth: '120px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>{shortGenre(track.genre)}</span>
      </div>
      <div style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: '#00e676',
        boxShadow: '0 0 8px #00e676',
        animation: 'pulse 1.5s ease-in-out infinite',
      }} />
    </div>
  );
}

/* ──────────────────────────────────────────────
   Outer wrapper — isolated CopilotKit provider
   Each page gets its own agent with separate
   conversation, actions, and readables.
   ────────────────────────────────────────────── */

export default function MusicAgent() {
  const copilotApiKey = import.meta.env.VITE_COPILOTKIT_PUBLIC_API_KEY;

  return (
    <CopilotKit publicApiKey={copilotApiKey} showDevConsole={false}>
      <MusicAgentInner />
    </CopilotKit>
  );
}

/* ──────────────────────────────────────────────
   Inner component — hooks, actions, popup
   ────────────────────────────────────────────── */

/** GenrePickerCard — shows clickable genre buttons fetched from the database */
function GenrePickerCard({ genres, onPick }: { genres: string[]; onPick: (genre: string) => void }) {
  if (genres.length === 0) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(192,132,252,0.06))',
        border: '1px solid rgba(124, 58, 237, 0.2)',
        borderRadius: '14px',
        padding: '16px',
        marginTop: '8px',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textAlign: 'center' }}>Loading genres...</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(192,132,252,0.06))',
      border: '1px solid rgba(124, 58, 237, 0.2)',
      borderRadius: '14px',
      padding: '16px',
      marginTop: '8px',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', margin: '0 0 12px' }}>
        Pick a vibe and I'll start the music 🎵
      </p>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        {genres.map(g => (
          <button
            key={g}
            onClick={() => onPick(g)}
            style={{
              background: 'rgba(124,58,237,0.15)',
              border: '1px solid rgba(124, 58, 237, 0.25)',
              borderRadius: '20px',
              padding: '6px 14px',
              color: '#d4b5ff',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(124,58,237,0.35)';
              e.currentTarget.style.borderColor = 'rgba(192, 132, 252, 0.5)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(124,58,237,0.15)';
              e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.25)';
              e.currentTarget.style.color = '#d4b5ff';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >{genreEmoji(g)} {g}</button>
        ))}
      </div>
    </div>
  );
}

function MusicAgentInner() {
  const player = usePlayer();
  const { state: playerState, activeTrack, play, togglePlay, next, prev, closePlayer } = player;
  const idleTimerRef = useRef<number | null>(null);
  const hasAutoPlayedRef = useRef(false);
  const [showGenrePicker, setShowGenrePicker] = useState(false);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const musicChatRef = useRef<HTMLDivElement>(null);
  const lastSearchResultRef = useRef<MusicTrack[]>([]);
  const lastSimilarResultRef = useRef<MusicTrack[]>([]);

  // ─── Fetch 5 random distinct genres from the database on mount ───
  useEffect(() => {
    fetchDistinctGenres()
      .then(genres => {
        // Shuffle and pick 5 so the user sees variety each session
        const shuffled = [...genres].sort(() => Math.random() - 0.5);
        setAvailableGenres(shuffled.slice(0, 5));
      })
      .catch(() => setAvailableGenres([]));
  }, []);

  // ─── Close genre picker when user starts typing in the chat input ───
  useEffect(() => {
    if (!showGenrePicker) return;

    const handleTyping = () => {
      setShowGenrePicker(false);
    };

    // Listen for input events on the chat textarea
    const textarea = musicChatRef.current?.querySelector('.copilotKitInput textarea') as HTMLTextAreaElement | null;
    if (textarea) {
      textarea.addEventListener('input', handleTyping);
      textarea.addEventListener('focus', handleTyping);
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener('input', handleTyping);
        textarea.removeEventListener('focus', handleTyping);
      }
    };
  }, [showGenrePicker]);

  // ─── User Activity Tracking (Issue #6 fix) ───
  const [userActivity, setUserActivity] = useState<string[]>([]);
  const prevTrackIdRef = useRef<string | null>(null);
  const prevIsPlayingRef = useRef<boolean>(false);

  // Track when the active track changes (user selected a new track)
  useEffect(() => {
    if (activeTrack && activeTrack.id !== prevTrackIdRef.current) {
      const wasFirst = prevTrackIdRef.current === null;
      prevTrackIdRef.current = activeTrack.id;
      setUserActivity(prev => [
        ...prev.slice(-14), // keep last 15 events
        `[${new Date().toLocaleTimeString()}] ${wasFirst ? 'Started playing' : 'Switched to'}: "${activeTrack.title}" by ${activeTrack.artist} (${activeTrack.genre})`,
      ]);
    }
  }, [activeTrack?.id, activeTrack?.title, activeTrack?.artist, activeTrack?.genre]);

  // Track play/pause state changes
  useEffect(() => {
    if (activeTrack && playerState.isPlaying !== prevIsPlayingRef.current) {
      prevIsPlayingRef.current = playerState.isPlaying;
      // Skip the initial "playing" event since track-change already logs it
      if (prevTrackIdRef.current) {
        setUserActivity(prev => [
          ...prev.slice(-14),
          `[${new Date().toLocaleTimeString()}] ${playerState.isPlaying ? '▶️ Resumed' : '⏸️ Paused'} "${activeTrack.title}"`,
        ]);
      }
    }
  }, [playerState.isPlaying, activeTrack?.title]);

  // ─── Feed player state as agent context ───

  useCopilotReadable({
    description: 'Current music player state — what is playing, paused, or stopped. This is the REAL-TIME state.',
    value: activeTrack
      ? {
          isPlaying: playerState.isPlaying,
          currentTrack: {
            title: activeTrack.title,
            artist: activeTrack.artist,
            genre: activeTrack.genre,
            duration: activeTrack.duration,
            color: activeTrack.color,
          },
          playlistLength: playerState.playlist.length,
          currentIndex: playerState.currentIndex + 1,
          repeatMode: playerState.repeat,
          progress: `${Math.round(playerState.progress)}%`,
        }
      : { isPlaying: false, currentTrack: null, message: 'No track is currently loaded. The player is idle.' },
  });

  // Feed actual playlist tracks so the agent knows EXACTLY what's loaded
  useCopilotReadable({
    description: 'The actual tracks loaded in the player playlist right now. These are the ONLY tracks the agent should reference when talking about what is playing or queued.',
    value: playerState.playlist.length > 0
      ? playerState.playlist.map((t, i) => ({
          position: i + 1,
          title: t.title,
          artist: t.artist,
          genre: t.genre,
          duration: t.duration,
          isCurrent: i === playerState.currentIndex,
        }))
      : 'No playlist loaded yet.',
  });

  // Feed user activity log
  useCopilotReadable({
    description: 'Recent user activity log — tracks the user selected, played, paused, or skipped. Use this to understand what the user has been doing.',
    value: userActivity.length > 0
      ? userActivity.join('\n')
      : 'User just arrived on the music page. No activity yet.',
  });

  useCopilotReadable({
    description: 'Available music genres in the database for playlist generation',
    value: 'Available genres include: Synthwave, Electronic, Ambient, Techno, Lo-Fi, Chillwave, Future Bass, Drum & Bass, Downtempo, Industrial, Vaporwave, Progressive, Trip-Hop, Glitch Hop, Trance, IDM, House, Retrowave, Experimental, Nu-Disco. The user can ask for playlists by any of these genres or moods like "chill", "energetic", "relaxing", "upbeat".',
  });

  // ─── Playback Control Action ───

  useCopilotAction({
    name: 'controlPlayback',
    description: 'Control music playback. Use this when the user asks to play, pause, stop, skip to next track, or go to previous track.',
    parameters: [
      {
        name: 'command',
        type: 'string',
        description: 'The playback command: "play", "pause", "next", "previous", or "stop"',
        required: true,
      },
    ],
    render: ({ args, status }) => {
      if (status === 'complete' && activeTrack && args.command !== 'stop') {
        return <NowPlayingCard track={activeTrack} />;
      }
      return <></>;
    },
    handler: async ({ command }) => {
      switch (command.toLowerCase()) {
        case 'play':
          if (!activeTrack) {
            const tracks = await fetchRandomTracks(6);
            if (tracks.length > 0) {
              play(tracks[0], tracks);
              return `▶️ Started playing "${tracks[0].title}" by ${tracks[0].artist} (${tracks[0].genre})`;
            }
            return 'No tracks available to play.';
          }
          if (!playerState.isPlaying) togglePlay();
          return `▶️ Resumed playing "${activeTrack.title}" by ${activeTrack.artist}`;

        case 'pause':
          if (playerState.isPlaying) togglePlay();
          return activeTrack
            ? `⏸️ Paused "${activeTrack.title}"`
            : '⏸️ Player paused.';

        case 'next':
          next();
          return '⏭️ Skipping to next track...';

        case 'previous':
          prev();
          return '⏮️ Going back to previous track...';

        case 'stop':
          closePlayer();
          return '⏹️ Music stopped and player closed.';

        default:
          return `Unknown command: "${command}". Try: play, pause, next, previous, or stop.`;
      }
    },
  });

  // ─── Music Search & Play Action (uses vector search → full-text → genre → random) ───

  useCopilotAction({
    name: 'searchAndPlayMusic',
    description: 'Search for music using natural language and start playing the results. ALWAYS use this tool when the user asks for any kind of music — by genre, mood, style, vibe, or description. This uses vector similarity search to find the best matches. Examples: "phonk style", "chill lo-fi beats", "dark electronic", "something energetic", "synthwave".',
    parameters: [
      {
        name: 'query',
        type: 'string',
        description: 'The natural language search query — genre, mood, style, or description (e.g. "phonk", "dark bass heavy", "chill vibes", "synthwave")',
        required: true,
      },
      {
        name: 'count',
        type: 'number',
        description: 'Number of tracks to include (default 6)',
        required: false,
      },
    ],
    render: ({ args, status }) => {
      if (status === 'complete' && lastSearchResultRef.current.length > 0) {
        return <PlaylistCard
          tracks={lastSearchResultRef.current}
          title={`${args.query} Playlist`}
          onPlayAll={(remaining) => { if (remaining.length > 0) play(remaining[0], remaining); }}
        />;
      }
      if (status === 'executing') {
        return <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>🔍 Searching for "{args.query}" tracks...</p>;
      }
      return <></>;
    },
    handler: async ({ query, count }) => {
      const trackCount = count || 6;
      try {
        const { tracks, method } = await searchTracksVector(query, trackCount);

        if (tracks.length > 0) {
          lastSearchResultRef.current = tracks;
          play(tracks[0], tracks);
          return `🎵 Found ${tracks.length} tracks matching "${query}" (via ${method})! Now playing: "${tracks[0].title}" by ${tracks[0].artist} (${tracks[0].genre}). Enjoy! 🎶`;
        }
        return `Couldn't find tracks matching "${query}". Try a different search term!`;
      } catch {
        return `Something went wrong searching for music. Please try again.`;
      }
    },
  });

  // ─── Recommend Similar Tracks Action (uses pgvector search) ───

  useCopilotAction({
    name: 'recommendSimilar',
    description: 'Find and play tracks similar to the currently playing track using vector similarity search. Use when the user says "more like this" or asks for similar music.',
    parameters: [],
    render: ({ status }) => {
      if (status === 'complete' && lastSimilarResultRef.current.length > 0) {
        return <PlaylistCard
          tracks={lastSimilarResultRef.current}
          title="Similar Tracks"
          onPlayAll={(remaining) => { if (remaining.length > 0) play(remaining[0], remaining); }}
        />;
      }
      if (status === 'executing') {
        return <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>🔍 Finding similar tracks via vector search...</p>;
      }
      return <></>;
    },
    handler: async () => {
      if (!activeTrack) return 'No track is currently playing. Play something first!';
      try {
        const similar = await fetchSimilarTracks(activeTrack.id, 6);
        if (similar.length > 0) {
          lastSimilarResultRef.current = similar;
          play(similar[0], similar);
          return `🎵 Found ${similar.length} tracks similar to "${activeTrack.title}" using vector similarity search! Now playing: "${similar[0].title}" by ${similar[0].artist}`;
        }
        return `Couldn't find similar tracks. Try playing a different track first.`;
      } catch {
        return 'Failed to find similar tracks. Please try again.';
      }
    },
  });

  // ─── Handle genre pick from the idle prompt ───
  const handleGenrePick = useCallback(async (genre: string) => {
    setShowGenrePicker(false);
    try {
      // Use exact genre match first (fetchTracksByGenre), which queries
      // the genre column directly — more accurate for known genres
      const tracks = await fetchTracksByGenre(genre, 6);
      if (tracks.length > 0) {
        play(tracks[0], tracks);
      }
    } catch (err) {
      console.warn('Genre pick play failed:', err);
    }
  }, [play]);

  // ─── 2-Minute Idle Auto-Open with Genre Picker ───

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    hasAutoPlayedRef.current = false;
  }, []);

  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    idleTimerRef.current = window.setTimeout(() => {
      if (hasAutoPlayedRef.current) return;
      hasAutoPlayedRef.current = true;

      // Click the popup open button programmatically
      const btn = musicChatRef.current?.querySelector('.copilotKitButton') as HTMLButtonElement | null;
      if (btn) btn.click();
      // Show genre picker after a short delay (allow popup to open)
      setTimeout(() => setShowGenrePicker(true), 300);
    }, IDLE_TIMEOUT);
  }, []);

  // Watch isPlaying to start/reset idle timer
  useEffect(() => {
    if (playerState.isPlaying) {
      resetIdleTimer();
    } else {
      startIdleTimer();
    }

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [playerState.isPlaying, resetIdleTimer, startIdleTimer]);

  // Reset idle timer on any user interaction
  useEffect(() => {
    const resetEvents = ['click', 'keydown', 'scroll', 'mousemove'];
    const handleInteraction = () => {
      if (!playerState.isPlaying) {
        hasAutoPlayedRef.current = false;
        startIdleTimer();
      }
    };

    resetEvents.forEach(evt => window.addEventListener(evt, handleInteraction, { passive: true }));

    const handleVisibility = () => {
      if (document.hidden && idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      } else if (!document.hidden && !playerState.isPlaying) {
        startIdleTimer();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      resetEvents.forEach(evt => window.removeEventListener(evt, handleInteraction));
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [playerState.isPlaying, startIdleTimer]);

  return (
    <div ref={musicChatRef}>
      <CopilotPopup
        className="music-chat"
        defaultOpen={false}
        onSetOpen={(open) => {
          setIsChatOpen(open);
          if (!open) setShowGenrePicker(false);
        }}
        instructions={`You are Meg Sound — a cool, music-savvy AI assistant on Meg's music streaming page.

CRITICAL RULES — ANTI-HALLUCINATION:
- You MUST ONLY reference tracks that actually exist in the provided player state, playlist data, or user activity log.
- NEVER make up, invent, or hallucinate track names, artists, albums, or genres that aren't in the provided context.
- If the user asks about a track not in the data, say "I don't have that in the library right now" honestly.
- When asked "what's playing?", ALWAYS check the current player state context — it has the real-time track info.
- When the user activity log shows they selected or played a track from the UI, acknowledge it naturally (e.g. "Nice choice! I see you're listening to...").

SEARCH & RETRIEVAL — ALWAYS USE VECTOR SEARCH:
- For ANY request about music the user wants to hear (genre, mood, style, vibe, description), ALWAYS use the searchAndPlayMusic tool.
- This tool uses vector similarity search (pgvector embeddings) to find the best semantic matches.
- It handles natural language: "phonk style", "dark bass heavy", "something groovy", "chill lo-fi" all work.
- It returns ONLY tracks that actually exist in the database.
- "Similar tracks" / "more like this" → use recommendSimilar tool (also vector-based).

PLAYBACK RULES:
- Play/pause/stop/skip requests → use controlPlayback tool
- Any music request by genre/mood/style/description → use searchAndPlayMusic tool
- "More like this" / similar music → use recommendSimilar tool
- If the user says just "play" with no context, use controlPlayback with "play"

PERSONALITY:
- Keep responses short, cool, and music-focused.
- Use 🎵 🎶 🎧 🔊 emoji naturally but don't overdo it.
- You're a smart AI music curator, not just a DJ.
- When idle-open triggers, warmly greet and let the genre picker do the work.`}
        labels={{
          title: "Meg Sound",
          initial: "Hey! 🎵 Wanna hear some sound? Type a vibe, genre, or mood and I'll play it for you...",
          placeholder: "Play something chill...",
        }}
        icons={{
          openIcon: (
            <span className="meg-sound-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="url(#megGrad)" opacity="0.15"/>
                <path d="M9 8l7 4-7 4V8z" fill="white" opacity="0.9"/>
                <path d="M3 12a9 9 0 0 1 .8-3.7" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
                <path d="M20.2 8.3A9 9 0 0 1 21 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
                <circle cx="12" cy="12" r="10" stroke="url(#megGrad)" strokeWidth="1" opacity="0.3"/>
                <defs><linearGradient id="megGrad" x1="2" y1="2" x2="22" y2="22"><stop stopColor="#7c3aed"/><stop offset="1" stopColor="#c084fc"/></linearGradient></defs>
              </svg>
            </span>
          ),
          headerCloseIcon: <span style={{ fontSize: '1rem' }}>✕</span>,
        }}
        clickOutsideToClose={!showGenrePicker}
      />
      {/* Floating "Click Me" label next to the trigger button */}
      {!isChatOpen && (
        <div className="meg-sound-click-label">
          <span className="meg-sound-click-label-text">✦ Click Me</span>
          <span className="meg-sound-click-label-arrow">▸</span>
        </div>
      )}

      {/* Genre picker overlay (rendered via portal-like positioning) */}
      {showGenrePicker && (
        <div className="meg-sound-genre-overlay">
          <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600, margin: '0 0 4px' }}>
            🎧 Hey! It's been quiet...
          </p>
          <GenrePickerCard genres={availableGenres} onPick={handleGenrePick} />
        </div>
      )}
    </div>
  );
}
