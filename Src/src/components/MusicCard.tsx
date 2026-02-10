import { useEffect, useRef } from 'react';
import { MusicTrack, CardAnimation } from '../data/musicData';

interface MusicCardProps {
  track: MusicTrack;
  animation: CardAnimation;
  onPlay: (track: MusicTrack) => void;
  isActive?: boolean;
}

const MusicCard = ({ track, animation, onPlay, isActive }: MusicCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    card.classList.add(`anim-${animation}`);
    return () => {
      card.classList.remove(`anim-${animation}`);
    };
  }, [animation]);

  return (
    <div
      ref={cardRef}
      className={`music-card ${isActive ? 'music-card--active' : ''}`}
      style={{ '--card-accent': track.color } as React.CSSProperties}
      onClick={() => onPlay(track)}
    >
      <div className="music-card-thumb">
        <img src={track.imageUrl} alt={track.title} loading="lazy" />
        {isActive && (
          <div className="music-card-eq">
            <span /><span /><span />
          </div>
        )}
      </div>
      <div className="music-card-info">
        <span className="music-card-title">{track.title}</span>
        <span className="music-card-artist">{track.artist}</span>
      </div>
      <div className="music-card-right">
        <span className="music-card-genre">{track.genre}</span>
        <span className="music-card-duration">{track.duration}</span>
      </div>
    </div>
  );
};

export default MusicCard;
