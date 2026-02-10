import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { MusicTrack } from '../data/musicData';
import { incrementPlayCount } from '../services/musicService';

/* ──────────────────────────────────────────────
   Shared player state that lives above the router
   so audio keeps playing across page navigations.
   ────────────────────────────────────────────── */

type RepeatMode = 'off' | 'all' | 'one';

interface PlayerState {
  playlist: MusicTrack[];
  currentIndex: number;
  isPlaying: boolean;
  progress: number;           // 0–100
  isPlayerOpen: boolean;
  repeat: RepeatMode;
}

interface PlayerAPI {
  state: PlayerState;
  activeTrack: MusicTrack | null;
  play: (track: MusicTrack, playlist: MusicTrack[]) => void;
  playFromPlaylist: (index: number) => void;
  next: () => void;
  prev: () => void;
  togglePlay: () => void;
  toggleRepeat: () => void;
  seek: (pct: number) => void;
  closePlayer: () => void;
  // Audio internals exposed for the visualizer
  analyserRef: React.RefObject<AnalyserNode | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerAPI | null>(null);

export function usePlayer(): PlayerAPI {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within <PlayerProvider>');
  return ctx;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [playlist, setPlaylist] = useState<MusicTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('all');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const playCountedRef = useRef<string | null>(null);

  // Keep a ref to repeat so the onEnd closure always reads the latest value
  const repeatRef = useRef(repeat);
  repeatRef.current = repeat;
  const playlistRef = useRef(playlist);
  playlistRef.current = playlist;
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const activeTrack = playlist.length > 0 ? playlist[currentIndex] : null;

  // ─── Setup / swap audio element when track changes ───
  useEffect(() => {
    if (!activeTrack?.audioUrl) return;

    // Tear down previous
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    // Create AudioContext once
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    const actx = audioCtxRef.current;

    const audio = new Audio(activeTrack.audioUrl);
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';
    audioRef.current = audio;

    const an = actx.createAnalyser();
    an.fftSize = 128;
    an.smoothingTimeConstant = 0.8;
    analyserRef.current = an;

    const src = actx.createMediaElementSource(audio);
    src.connect(an);
    an.connect(actx.destination);
    sourceRef.current = src;

    if (actx.state === 'suspended') actx.resume();
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));

    // Play count
    if (playCountedRef.current !== activeTrack.id) {
      playCountedRef.current = activeTrack.id;
      incrementPlayCount(activeTrack.id);
    }

    const onTime = () => {
      if (audio.duration && isFinite(audio.duration))
        setProgress((audio.currentTime / audio.duration) * 100);
    };

    const onEnd = () => {
      const mode = repeatRef.current;
      const pl = playlistRef.current;
      const idx = currentIndexRef.current;

      if (mode === 'one') {
        // Repeat the same track
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }

      const nextIdx = idx + 1;
      if (nextIdx < pl.length) {
        // More tracks ahead — advance
        setCurrentIndex(nextIdx);
        setProgress(0);
        setIsPlaying(true);
      } else if (mode === 'all') {
        // Wrap around to the beginning
        setCurrentIndex(0);
        setProgress(0);
        setIsPlaying(true);
      } else {
        // mode === 'off' and we're at the end — stop
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrack?.id]);

  // Sync play/pause state with the audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack?.audioUrl) return;
    if (isPlaying) {
      audioCtxRef.current?.resume();
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, activeTrack?.audioUrl]);

  // ── Public API ──

  const play = useCallback((track: MusicTrack, newPlaylist: MusicTrack[]) => {
    setPlaylist(newPlaylist);
    const idx = newPlaylist.findIndex(t => t.id === track.id);
    setCurrentIndex(idx >= 0 ? idx : 0);
    setIsPlayerOpen(true);
    setProgress(0);
    setIsPlaying(true);
  }, []);

  const playFromPlaylist = useCallback((index: number) => {
    setCurrentIndex(index);
    setProgress(0);
    setIsPlaying(true);
  }, []);

  const next = useCallback(() => {
    if (playlist.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % playlist.length);
    setProgress(0);
    setIsPlaying(true);
  }, [playlist.length]);

  const prev = useCallback(() => {
    if (playlist.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + playlist.length) % playlist.length);
    setProgress(0);
    setIsPlaying(true);
  }, [playlist.length]);

  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);

  const toggleRepeat = useCallback(() => {
    setRepeat(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
  }, []);

  const seek = useCallback((pct: number) => {
    const audio = audioRef.current;
    if (audio && isFinite(audio.duration)) {
      audio.currentTime = (pct / 100) * audio.duration;
    }
    setProgress(pct);
  }, []);

  const closePlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (sourceRef.current) { sourceRef.current.disconnect(); sourceRef.current = null; }
    if (analyserRef.current) { analyserRef.current.disconnect(); analyserRef.current = null; }
    setIsPlayerOpen(false);
    setIsPlaying(false);
    setPlaylist([]);
    setCurrentIndex(0);
    setProgress(0);
  }, []);

  const api: PlayerAPI = {
    state: { playlist, currentIndex, isPlaying, progress, isPlayerOpen, repeat },
    activeTrack,
    play,
    playFromPlaylist,
    next,
    prev,
    togglePlay,
    toggleRepeat,
    seek,
    closePlayer,
    analyserRef,
    audioRef,
  };

  return (
    <PlayerContext.Provider value={api}>
      {children}
    </PlayerContext.Provider>
  );
}
