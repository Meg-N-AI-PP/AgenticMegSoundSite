import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import anime from 'animejs';
import { MusicTrack, getRandomAnimation, CardAnimation } from '../data/musicData';
import { fetchRandomTracks } from '../services/musicService';
import MusicCard from './MusicCard';
import MusicPlayer from './MusicPlayer';
import AgenticBackground from './AgenticBackground';
import { usePlayer } from '../context/PlayerContext';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const CARD_COUNT = 12;
const PLAYLIST_SIZE = 6;

interface CardState {
  track: MusicTrack;
  animation: CardAnimation;
}

const MusicPage = () => {
  const [cards, setCards] = useState<CardState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const bgImgRef = useRef<HTMLImageElement>(null);
  const rafRef = useRef<number>(0);

  const player = usePlayer();
  const { state: playerState, activeTrack, analyserRef } = player;

  /* ── Audio-reactive background image animation ── */
  useEffect(() => {
    let prev = { scale: 1.05, x: 0, y: 0, rot: 0 };
    const smooth = 0.12;

    function tick() {
      const img = bgImgRef.current;
      const an = analyserRef.current;
      if (!img) { rafRef.current = requestAnimationFrame(tick); return; }

      let bass = 0, mid = 0, high = 0;

      if (an) {
        const buf = new Uint8Array(an.frequencyBinCount);
        an.getByteFrequencyData(buf);
        const len = buf.length;
        const third = Math.floor(len / 3);
        for (let i = 0; i < third; i++)           bass += buf[i];
        for (let i = third; i < third * 2; i++)   mid  += buf[i];
        for (let i = third * 2; i < len; i++)      high += buf[i];
        bass /= (third * 255);
        mid  /= (third * 255);
        high /= ((len - third * 2) * 255);
      }

      const t = Date.now();
      const tScale = 1.05 + bass * 0.18;
      const tX     = Math.sin(t * 0.0005) * 20 + mid * 40;
      const tY     = Math.cos(t * 0.0004) * 18 + bass * 30;
      const tRot   = Math.sin(t * 0.0003) * 3 + high * 6;

      prev.scale += (tScale - prev.scale) * smooth;
      prev.x     += (tX - prev.x) * smooth;
      prev.y     += (tY - prev.y) * smooth;
      prev.rot   += (tRot - prev.rot) * smooth;

      img.style.transform =
        `translate(-50%, -50%) scale(${prev.scale}) translate(${prev.x}px, ${prev.y}px) rotate(${prev.rot}deg)`;

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [activeTrack, analyserRef]);

  const loadRandomCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tracks = await fetchRandomTracks(CARD_COUNT);
      const newCards = tracks.map(track => ({
        track,
        animation: getRandomAnimation(),
      }));
      setCards(newCards);

      // Animate cards entrance
      setTimeout(() => {
        anime({
          targets: '.music-card',
          opacity: [0, 1],
          translateX: [-30, 0],
          delay: anime.stagger(60),
          duration: 600,
          easing: 'easeOutExpo',
        });
      }, 50);
    } catch (err) {
      console.error('Failed to load tracks:', err);
      setError('Could not load tracks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + 5-min refresh
  useEffect(() => {
    loadRandomCards();

    timerRef.current = window.setInterval(() => {
      anime({
        targets: '.music-card',
        opacity: [1, 0],
        translateX: [0, -20],
        delay: anime.stagger(40),
        duration: 400,
        easing: 'easeInExpo',
        complete: () => loadRandomCards(),
      });
    }, REFRESH_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loadRandomCards]);

  // Header animation
  useEffect(() => {
    anime({
      targets: '.music-page-title .char',
      opacity: [0, 1],
      translateY: [40, 0],
      rotateX: [90, 0],
      duration: 1000,
      delay: anime.stagger(60),
      easing: 'easeOutExpo',
    });

    anime({
      targets: '.music-page-subtitle',
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 700,
      delay: 500,
      easing: 'easeOutExpo',
    });

    anime({
      targets: '.music-refresh-bar',
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 700,
      delay: 700,
      easing: 'easeOutExpo',
    });

    anime({
      targets: '.music-page-back',
      opacity: [0, 1],
      translateX: [-20, 0],
      duration: 700,
      delay: 200,
      easing: 'easeOutExpo',
    });
  }, []);

  const buildPlaylist = (clickedTrack: MusicTrack): MusicTrack[] => {
    const otherTracks = cards
      .map(c => c.track)
      .filter(t => t.id !== clickedTrack.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, PLAYLIST_SIZE - 1);
    return [clickedTrack, ...otherTracks];
  };

  const handlePlay = (track: MusicTrack) => {
    const newPlaylist = buildPlaylist(track);
    player.play(track, newPlaylist);
  };

  const handleClosePlayer = () => {
    player.closePlayer();
  };

  const titleText = "Meg Sound";
  const titleChars = titleText.split('').map((char, i) => (
    <span key={i} className="char">{char === ' ' ? '\u00A0' : char}</span>
  ));

  return (
    <div className="music-page">
      {/* Dynamic album art background that moves with music */}
      {activeTrack ? (
        <div className="music-page-bg" key={activeTrack.id}>
          <img
            ref={bgImgRef}
            className="music-page-bg__img"
            src={activeTrack.imageUrl}
            alt=""
            draggable={false}
          />
          <div className="music-page-bg__overlay" />
        </div>
      ) : (
        <AgenticBackground />
      )}
      <div className="music-page-content">
        <header className="music-page-header">
          <Link to="/" className="music-page-back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Portfolio
          </Link>
          <h1 className="music-page-title">{titleChars}</h1>
          <p className="music-page-subtitle">
            Suno AI Generated Sound
          </p>
        </header>

        <div className={`music-split-layout ${playerState.isPlayerOpen ? 'player-open' : ''}`}>
          {/* Left: Music List */}
          <div className="music-list-panel" ref={listRef}>
            <div className="music-list-header">
              <span className="music-list-count">
                {loading ? 'Loading...' : `${cards.length} tracks`}
              </span>
            </div>

            {error && (
              <div className="music-list-error">
                <p>{error}</p>
                <button onClick={loadRandomCards} className="music-retry-btn">
                  Try Again
                </button>
              </div>
            )}

            {loading && cards.length === 0 && (
              <div className="music-list-loading">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="music-card-skeleton">
                    <div className="skeleton-thumb" />
                    <div className="skeleton-info">
                      <div className="skeleton-line skeleton-title" />
                      <div className="skeleton-line skeleton-artist" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="music-list">
              {cards.map(({ track, animation }) => (
                <MusicCard
                  key={track.id}
                  track={track}
                  animation={animation}
                  onPlay={handlePlay}
                  isActive={activeTrack?.id === track.id}
                />
              ))}
            </div>
          </div>

          {/* Right: Player Panel */}
          {playerState.isPlayerOpen && activeTrack && (
            <div className="music-player-panel">
              <MusicPlayer
                key={activeTrack.id}
                track={activeTrack}
                playlist={playerState.playlist}
                currentIndex={playerState.currentIndex}
                onClose={handleClosePlayer}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicPage;
