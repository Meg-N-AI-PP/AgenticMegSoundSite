import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';

/**
 * Persistent mini-player bar fixed to the bottom of the screen.
 * Shows whenever music is playing, even on the portfolio page.
 * Clicking the track info navigates back to /music.
 */
const MiniPlayer = () => {
  const { state, activeTrack, togglePlay, toggleRepeat, next, prev, closePlayer } = usePlayer();
  const navigate = useNavigate();

  if (!state.isPlayerOpen || !activeTrack) return null;

  const handleGoToMusic = () => navigate('/music');

  return (
    <div className="mini-player">
      {/* Progress bar across the top edge */}
      <div className="mini-player-progress">
        <div
          className="mini-player-progress-fill"
          style={{
            width: `${state.progress}%`,
            background: activeTrack.color,
            boxShadow: `0 0 8px ${activeTrack.color}60`,
          }}
        />
      </div>

      {/* Track info — click to go to music page */}
      <div className="mini-player-info" onClick={handleGoToMusic} title="Go to player">
        <img src={activeTrack.imageUrl} alt={activeTrack.title} className="mini-player-thumb" />
        <div className="mini-player-text">
          <span className="mini-player-title">{activeTrack.title}</span>
          <span className="mini-player-artist">{activeTrack.artist}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="mini-player-controls">
        <button
          className={`mini-ctrl mini-repeat ${state.repeat !== 'off' ? 'mini-repeat--active' : ''}`}
          onClick={toggleRepeat}
          title={`Repeat: ${state.repeat}`}
        >
          {state.repeat === 'one' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 014-4h14"/>
              <path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 01-4 4H3"/>
              <text x="12" y="15" textAnchor="middle" fill="currentColor" stroke="none" fontSize="9" fontWeight="bold">1</text>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 014-4h14"/>
              <path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 01-4 4H3"/>
            </svg>
          )}
        </button>
        <button className="mini-ctrl" onClick={prev} title="Previous">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>
        <button className="mini-ctrl mini-play" onClick={togglePlay} title={state.isPlaying ? 'Pause' : 'Play'}>
          {state.isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6,3 20,12 6,21" />
            </svg>
          )}
        </button>
        <button className="mini-ctrl" onClick={next} title="Next">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>
      </div>

      {/* Close */}
      <button className="mini-ctrl mini-close" onClick={closePlayer} title="Close">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

export default MiniPlayer;
