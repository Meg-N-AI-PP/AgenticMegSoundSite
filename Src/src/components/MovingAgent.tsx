import { useState, useEffect, useRef, useCallback } from 'react';
import { requestHoverMessage, cancelPendingHover, getAggressionTier } from './MinAgent';
import './MovingAgent.css';

/*
 * meg-sprite.png — 1536×1024 (non-uniform grid)
 *
 * Walk row: y=215–425 (h=210), 9 frames
 * Idle row: y=685–903 (h=219), 9 frames
 */

const SHEET_W = 1536;
const SHEET_H = 1024;

const WALK_X = [53, 211, 374, 533, 694, 855, 1011, 1174, 1334];
const IDLE_X = [74, 234, 394, 553, 712, 875, 1033, 1195, 1353];

const ANIMATIONS = {
  walk: { framesX: WALK_X, y: 215, frames: 9, speed: 110 },
  idle: { framesX: IDLE_X, y: 685, frames: 9, speed: 250 },
};

const CELL_W = 160;
const CELL_H = 220;
const DISPLAY_H = 80;
const SCALE = DISPLAY_H / CELL_H;
const DISPLAY_W = CELL_W * SCALE;
const SPEED = 0.7;

interface MovingAgentProps {
  onAgentClick: () => void;
  isChatOpen: boolean;
  hoverCount?: number;
  onHoverCountChange?: (count: number) => void;
}

const MovingAgent = ({ onAgentClick, isChatOpen, hoverCount = 0, onHoverCountChange }: MovingAgentProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [facingRight, setFacingRight] = useState(true);
  const [frame, setFrame] = useState(0);
  const [initialised, setInitialised] = useState(false);
  const [visible, setVisible] = useState(true);
  const [speechText, setSpeechText] = useState('');

  const [isThinking, setIsThinking] = useState(false);

  const animRef = useRef<number | null>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const hoveredRef = useRef(false);
  const hoverCountRef = useRef(0);

  const getRandomTarget = useCallback(() => {
    const margin = DISPLAY_H;
    const pageW = Math.max(document.documentElement.scrollWidth, window.innerWidth);
    const pageH = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    return {
      x: margin + Math.random() * (pageW - margin * 2),
      y: margin + Math.random() * (pageH - margin * 2),
    };
  }, []);

  // Initialise position
  useEffect(() => {
    const timer = setTimeout(() => {
      const startPos = getRandomTarget();
      posRef.current = startPos;
      targetRef.current = getRandomTarget();
      setPosition(startPos);
      setInitialised(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [getRandomTarget]);

  // Pick new targets periodically
  useEffect(() => {
    if (!initialised) return;
    const pick = () => { targetRef.current = getRandomTarget(); };
    const id = setInterval(pick, 3000 + Math.random() * 4000);
    return () => clearInterval(id);
  }, [initialised, getRandomTarget]);

  // Random disappear/reappear
  useEffect(() => {
    if (!initialised) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      timer = setTimeout(() => {
        if (visible && !hoveredRef.current && !isChatOpen && Math.random() < 0.15) {
          setVisible(false);
        } else if (!visible && !isChatOpen && Math.random() < 0.3) {
          const newPos = getRandomTarget();
          posRef.current = newPos;
          targetRef.current = getRandomTarget();
          setPosition(newPos);
          setVisible(true);
        }
        tick();
      }, 1000);
    };
    tick();
    return () => clearTimeout(timer);
  }, [initialised, visible, getRandomTarget, isChatOpen]);

  // Movement loop
  useEffect(() => {
    if (!initialised) return;
    let running = true;
    const step = () => {
      if (!running) return;
      if (!hoveredRef.current && !isChatOpen) {
        const dx = targetRef.current.x - posRef.current.x;
        const dy = targetRef.current.y - posRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 2) {
          const vx = (dx / dist) * SPEED;
          const vy = (dy / dist) * SPEED;
          posRef.current = { x: posRef.current.x + vx, y: posRef.current.y + vy };
          setPosition({ ...posRef.current });
          setFacingRight(vx >= 0);
        } else {
          targetRef.current = getRandomTarget();
        }
      }
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => { running = false; if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [initialised, getRandomTarget, isChatOpen]);

  // Sprite frame ticker
  useEffect(() => {
    if (!initialised) return;
    const anim = isHovered || isChatOpen ? ANIMATIONS.idle : ANIMATIONS.walk;
    const id = setInterval(() => {
      setFrame(prev => (prev + 1) % anim.frames);
    }, anim.speed);
    setFrame(0);
    return () => clearInterval(id);
  }, [initialised, isHovered, isChatOpen]);

  // Sync hover ref
  useEffect(() => { hoveredRef.current = isHovered; }, [isHovered]);

  // Sync hoverCountRef when parent resets count (decay timer)
  useEffect(() => { hoverCountRef.current = hoverCount; }, [hoverCount]);

  // Hide when chat is open
  useEffect(() => {
    if (isChatOpen) {
      setIsHovered(false);
    }
  }, [isChatOpen]);

  // Handle hover — show thinking dots, then request message from Min's chat agent
  const handleMouseEnter = useCallback(() => {
    if (isChatOpen) return;
    setIsHovered(true);
    setIsThinking(true);
    setSpeechText('');
    const count = hoverCountRef.current;
    hoverCountRef.current = count + 1;
    onHoverCountChange?.(count + 1);
    // Request hover message from Min via CopilotKit chat agent
    requestHoverMessage(count + 1, (message) => {
      if (message) {
        setSpeechText(message);
      }
      setIsThinking(false);
    });
  }, [isChatOpen, onHoverCountChange]);

  const handleMouseLeave = useCallback(() => {
    if (isChatOpen) return;
    setIsHovered(false);
    setSpeechText('');
    setIsThinking(false);
    cancelPendingHover();
  }, [isChatOpen]);

  // Handle click
  const handleClick = useCallback(() => {
    onAgentClick();
  }, [onAgentClick]);

  if (!initialised) return null;

  // When chat opens, hide the sprite
  if (isChatOpen) return null;

  const anim = isHovered ? ANIMATIONS.idle : ANIMATIONS.walk;
  const frameX = anim.framesX[frame];
  const bgX = -(frameX * SCALE);
  const bgY = -(anim.y * SCALE);
  const currentTier = getAggressionTier(hoverCountRef.current);
  const isAggressive = currentTier === 'aggressive' || currentTier === 'rage';
  const isAnnoyed = currentTier === 'annoyed';
  const aggressionClass = isAggressive ? 'aggressive' : isAnnoyed ? 'annoyed' : '';

  return (
    <div
      className={`moving-agent-wrapper ${isHovered ? 'hovered' : ''} ${aggressionClass}`}
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) scaleX(${facingRight ? 1 : -1})`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="moving-agent-shadow" />

      <div
        className="moving-agent-sprite"
        style={{
          width: DISPLAY_W,
          height: DISPLAY_H,
          overflow: 'hidden',
          backgroundImage: 'url(/images/meg-sprite.png)',
          backgroundPosition: `${bgX}px ${bgY}px`,
          backgroundSize: `${SHEET_W * SCALE}px ${SHEET_H * SCALE}px`,
        }}
      />

      {isHovered && isThinking && (
        <div className={`moving-agent-speech thinking ${aggressionClass}`}>
          <span style={{ transform: `scaleX(${facingRight ? 1 : -1})`, display: 'inline-block' }}>
            <span className="thinking-dots">
              <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
            </span>
          </span>
        </div>
      )}

      {isHovered && !isThinking && speechText && (
        <div className={`moving-agent-speech ${aggressionClass}`}>
          <span style={{ transform: `scaleX(${facingRight ? 1 : -1})`, display: 'inline-block' }}>
            {speechText}
          </span>
        </div>
      )}
    </div>
  );
};

export default MovingAgent;
