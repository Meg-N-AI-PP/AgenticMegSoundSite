import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { MusicTrack } from '../data/musicData';
import { usePlayer } from '../context/PlayerContext';

interface MusicPlayerProps {
  track: MusicTrack;
  playlist: MusicTrack[];
  currentIndex: number;
  onClose: () => void;
}

const VIZ_EFFECTS = ['bars', 'wave', 'circles', 'particles', 'spectrum'] as const;
type VizEffect = typeof VIZ_EFFECTS[number];

/* ──────────────────────────────────────────────
   Color helper — normalise any CSS colour to #rrggbb hex
   so we can safely append alpha like `${hex}40`.
   ────────────────────────────────────────────── */
const _colorCanvas = typeof OffscreenCanvas !== 'undefined'
  ? new OffscreenCanvas(1, 1).getContext('2d')
  : null;
const _colorCache = new Map<string, string>();

function toHex6(color: string): string {
  if (/^#[0-9a-f]{6}$/i.test(color)) return color;          // already fine
  if (_colorCache.has(color)) return _colorCache.get(color)!;

  // Use a tiny canvas context to resolve any CSS colour name → rgba
  let hex = '#00e5ff';  // safe fallback (accent cyan)
  try {
    if (_colorCanvas) {
      _colorCanvas.fillStyle = '#000000';
      _colorCanvas.fillStyle = color;      // browser normalises it
      const resolved = _colorCanvas.fillStyle as string;
      if (resolved.startsWith('#')) {
        hex = resolved.length === 4
          ? `#${resolved[1]}${resolved[1]}${resolved[2]}${resolved[2]}${resolved[3]}${resolved[3]}`
          : resolved.slice(0, 7);          // strip possible alpha
      } else if (resolved.startsWith('rgb')) {
        const m = resolved.match(/(\d+)/g);
        if (m && m.length >= 3) {
          hex = '#' + m.slice(0, 3).map(n => parseInt(n).toString(16).padStart(2, '0')).join('');
        }
      }
    } else {
      // Fallback: build a temporary canvas
      const c = document.createElement('canvas');
      c.width = c.height = 1;
      const cx = c.getContext('2d');
      if (cx) {
        cx.fillStyle = color;
        cx.fillRect(0, 0, 1, 1);
        const [r, g, b] = cx.getImageData(0, 0, 1, 1).data;
        hex = '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('');
      }
    }
  } catch (_) { /* keep fallback */ }

  _colorCache.set(color, hex);
  return hex;
}

/* ──────────────────────────────────────────────
   Pure drawing helpers — no React, no closures
   ────────────────────────────────────────────── */

function drawBars(ctx: CanvasRenderingContext2D, w: number, h: number, data: number[], c: string) {
  const n = 24, bw = (w * 0.8) / n, gap = 2, sx = w * 0.1;
  for (let i = 0; i < n; i++) {
    const v = data[i * 2] || 0, bh = v * h * 0.7;
    const x = sx + i * (bw + gap), y = h / 2 - bh / 2;
    const g = ctx.createLinearGradient(x, y, x, y + bh);
    g.addColorStop(0, c); g.addColorStop(1, `${c}40`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(x, y, bw, bh, 2); ctx.fill();
    ctx.fillStyle = `${c}12`; ctx.beginPath();
    ctx.roundRect(x, h / 2 + bh / 2 + 3, bw, bh * 0.25, 2); ctx.fill();
  }
}

function drawWave(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, data: number[], c: string) {
  for (let wv = 0; wv < 3; wv++) {
    ctx.beginPath();
    ctx.strokeStyle = `${c}${wv === 0 ? 'cc' : wv === 1 ? '66' : '33'}`;
    ctx.lineWidth = 2.5 - wv * 0.5;
    for (let x = 0; x < w; x++) {
      const dv = data[Math.floor((x / w) * data.length)] || 0;
      const y = h / 2 + Math.sin(x * 0.025 + t * 0.003 + wv) * 40 * dv + Math.sin(x * 0.012 + t * 0.002) * 25 * dv;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  for (let i = 0; i < data.length; i++) {
    if (data[i] > 0.75) {
      const x = (i / data.length) * w;
      const y = h / 2 + Math.sin(x * 0.025 + t * 0.003) * 40 * data[i];
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill();
    }
  }
}

function drawCircles(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, data: number[], c: string) {
  const cx = w / 2, cy = h / 2;
  for (let r = 0; r < 4; r++) {
    const br = 25 + r * 28, pts = 28;
    const avg = data.slice(r * 16, (r + 1) * 16).reduce((a, b) => a + b, 0) / 16;
    ctx.beginPath();
    ctx.strokeStyle = `${c}${Math.floor((0.8 - r * 0.15) * 255).toString(16).padStart(2, '0')}`;
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= pts; i++) {
      const a = (i / pts) * Math.PI * 2 + t * 0.001 * (r % 2 === 0 ? 1 : -1);
      const di = Math.floor((i / pts) * data.length);
      const rad = br + (data[di] || 0) * 40 * avg;
      const x = cx + Math.cos(a) * rad, y = cy + Math.sin(a) * rad;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.stroke();
  }
  const av = data.reduce((a, b) => a + b, 0) / data.length;
  const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20 + av * 25);
  gg.addColorStop(0, `${c}60`); gg.addColorStop(1, 'transparent');
  ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(cx, cy, 20 + av * 25, 0, Math.PI * 2); ctx.fill();
}

function drawParticles(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, data: number[], c: string) {
  const cx = w / 2, cy = h / 2, n = 48;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + t * 0.0005;
    const v = data[i % data.length];
    const d = 40 + v * 100, s = 1.5 + v * 4;
    const x = cx + Math.cos(a + Math.sin(t * 0.001 + i) * 0.5) * d;
    const y = cy + Math.sin(a + Math.cos(t * 0.001 + i) * 0.5) * d;
    ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fillStyle = `${c}${Math.floor(v * 200 + 55).toString(16).padStart(2, '0')}`;
    ctx.fill();
    if (v > 0.5) {
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 40, cy + Math.sin(a) * 40); ctx.lineTo(x, y);
      ctx.strokeStyle = `${c}18`; ctx.lineWidth = 0.8; ctx.stroke();
    }
  }
}

function drawSpectrum(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, data: number[], c: string) {
  const cx = w / 2, cy = h / 2, n = data.length;
  for (let side = 0; side < 2; side++) {
    for (let i = 0; i < n; i++) {
      const x = side === 0 ? cx - (i / n) * (w * 0.4) : cx + (i / n) * (w * 0.4);
      const bh = data[i] * h * 0.45, y1 = cy - bh / 2;
      const g = ctx.createLinearGradient(x, y1, x, y1 + bh);
      g.addColorStop(0, `${c}dd`); g.addColorStop(0.5, `${c}88`); g.addColorStop(1, `${c}22`);
      ctx.fillStyle = g;
      const bw = Math.max(2, (w * 0.4) / n - 1);
      ctx.fillRect(x - bw / 2, y1, bw, bh);
    }
  }
  const av = data.reduce((a, b) => a + b, 0) / data.length;
  const or2 = 15 + av * 18;
  const og = ctx.createRadialGradient(cx, cy, 0, cx, cy, or2);
  og.addColorStop(0, '#ffffff'); og.addColorStop(0.3, c); og.addColorStop(1, 'transparent');
  ctx.fillStyle = og; ctx.beginPath(); ctx.arc(cx, cy, or2, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = `${c}25`; ctx.lineWidth = 0.8;
  for (let r = 0; r < 3; r++) {
    ctx.beginPath(); ctx.arc(cx, cy, 50 + r * 25 + Math.sin(t * 0.002 + r) * 8, 0, Math.PI * 2); ctx.stroke();
  }
}

function genFakeData(time: number): number[] {
  const d: number[] = [];
  for (let i = 0; i < 64; i++) {
    const b = Math.sin(time * 0.002 + i * 0.15) * 0.5 + 0.5;
    const h2 = Math.sin(time * 0.004 + i * 0.3) * 0.3;
    const n = Math.random() * 0.15;
    const bt = Math.sin(time * 0.008) > 0.7 ? 0.3 : 0;
    d.push(Math.min(1, Math.max(0, b + h2 + n + bt)));
  }
  return d;
}

function paintFrame(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, data: number[], fx: VizEffect, c: string) {
  ctx.clearRect(0, 0, w, h);

  const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
  bg.addColorStop(0, `${c}15`); bg.addColorStop(1, 'transparent');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  switch (fx) {
    case 'bars':      drawBars(ctx, w, h, data, c); break;
    case 'wave':      drawWave(ctx, w, h, t, data, c); break;
    case 'circles':   drawCircles(ctx, w, h, t, data, c); break;
    case 'particles': drawParticles(ctx, w, h, t, data, c); break;
    case 'spectrum':  drawSpectrum(ctx, w, h, t, data, c); break;
  }
}

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */

const MusicPlayer = ({
  track, playlist, currentIndex, onClose,
}: MusicPlayerProps) => {
  const player = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const [vizEffect, setVizEffect] = useState<VizEffect>(
    () => VIZ_EFFECTS[Math.floor(Math.random() * VIZ_EFFECTS.length)]
  );
  const timeRef = useRef(0);

  // Derive state from context
  const isPlaying = player.state.isPlaying;
  const progress = player.state.progress;
  const analyserRef = player.analyserRef;

  // ─ Mutable refs for the animation loop ─
  const stateRef = useRef({ isPlaying, vizEffect, color: toHex6(track.color) });
  stateRef.current = { isPlaying, vizEffect, color: toHex6(track.color) };

  // Reset viz effect on track change
  useEffect(() => {
    timeRef.current = 0;
    setVizEffect(VIZ_EFFECTS[Math.floor(Math.random() * VIZ_EFFECTS.length)]);
  }, [track.id]);

  // Entrance animation
  useEffect(() => {
    if (panelRef.current) {
      anime({ targets: panelRef.current, opacity: [0, 1], translateX: [40, 0], duration: 500, easing: 'easeOutExpo' });
    }
  }, []);

  // ─── Canvas animation loop ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let alive = true;

    const getData = (): number[] => {
      if (analyserRef.current) {
        try {
          const arr = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(arr);
          if (arr.reduce((a, b) => a + b, 0) > 0) return Array.from(arr).map(v => v / 255);
        } catch (_) { /* CORS or disconnected analyser */ }
      }
      const fake = genFakeData(timeRef.current);
      return stateRef.current.isPlaying ? fake : fake.map(v => v * 0.05);
    };

    const tick = () => {
      if (!alive) return;
      timeRef.current += 16;

      const rect = canvas.getBoundingClientRect();
      const cssW = Math.round(rect.width);
      const cssH = Math.round(rect.height);

      if (cssW > 0 && cssH > 0) {
        const dpr = window.devicePixelRatio || 1;
        const bufW = cssW * dpr;
        const bufH = cssH * dpr;
        if (canvas.width !== bufW || canvas.height !== bufH) {
          canvas.width = bufW;
          canvas.height = bufH;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        const data = getData();
        paintFrame(ctx, cssW, cssH, timeRef.current, data, stateRef.current.vizEffect, stateRef.current.color);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    // Start immediately — the canvas should have CSS dimensions from absolute positioning
    rafRef.current = requestAnimationFrame(tick);

    const onResize = () => {}; // tick handles resize automatically
    window.addEventListener('resize', onResize);

    return () => {
      alive = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const togglePlay = () => player.togglePlay();
  const cycleViz = () => { const i = VIZ_EFFECTS.indexOf(vizEffect); setVizEffect(VIZ_EFFECTS[(i + 1) % VIZ_EFFECTS.length]); };

  const formatTime = (pct: number) => {
    const audio = player.audioRef.current;
    let tot: number;
    if (audio && isFinite(audio.duration)) tot = audio.duration;
    else { const p = track.duration.split(':'); tot = parseInt(p[0]) * 60 + parseInt(p[1]); }
    const cur = Math.floor((pct / 100) * tot);
    return `${Math.floor(cur / 60)}:${(cur % 60).toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    player.seek(pct);
  };

  return (
    <div className="inline-player" ref={panelRef}>
      <button className="inline-player-close" onClick={onClose} title="Close player">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      <div className="inline-player-viz">
        <div className="viz-bg-image" style={{ backgroundImage: `url('${track.imageUrl}')` }} />
        <div className="viz-bg-overlay" />
        <canvas ref={canvasRef} className="inline-player-canvas" />
        <div className="viz-vignette" />
        <button className="viz-cycle-btn" onClick={cycleViz} title="Change effect">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2"/>
          </svg>
          {vizEffect.toUpperCase()}
        </button>
      </div>

      <div className="inline-player-track">
        <img src={track.imageUrl} alt={track.title} className="inline-player-thumb" />
        <div className="inline-player-text">
          <span className="inline-player-title">{track.title}</span>
          <span className="inline-player-artist">{track.artist}</span>
        </div>
      </div>

      <div className="inline-player-progress">
        <span className="inline-player-time">{formatTime(progress)}</span>
        <div className="inline-player-bar" onClick={handleSeek} style={{ cursor: 'pointer' }}>
          <div className="inline-player-bar-fill" style={{ width: `${progress}%`, background: track.color, boxShadow: `0 0 8px ${track.color}50` }} />
        </div>
        <span className="inline-player-time">{track.duration}</span>
      </div>

      <div className="inline-player-controls">
        <button
          className={`ip-ctrl-btn ip-repeat ${player.state.repeat !== 'off' ? 'ip-repeat--active' : ''}`}
          onClick={player.toggleRepeat}
          title={`Repeat: ${player.state.repeat}`}
        >
          {player.state.repeat === 'one' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 014-4h14"/>
              <path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 01-4 4H3"/>
              <text x="12" y="15" textAnchor="middle" fill="currentColor" stroke="none" fontSize="9" fontWeight="bold">1</text>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 014-4h14"/>
              <path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 01-4 4H3"/>
            </svg>
          )}
        </button>
        <button className="ip-ctrl-btn" onClick={player.prev} title="Previous">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
        </button>
        <button className="ip-ctrl-btn ip-play" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>
          )}
        </button>
        <button className="ip-ctrl-btn" onClick={player.next} title="Next">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>
      </div>

      <div className="inline-player-playlist">
        <div className="ip-playlist-header">
          <span>Up Next</span>
          <span className="ip-playlist-count">{playlist.length} tracks</span>
        </div>
        <div className="ip-playlist-list">
          {playlist.map((t, idx) => (
            <div key={t.id} className={`ip-playlist-item ${idx === currentIndex ? 'ip-playlist-item--active' : ''}`} onClick={() => player.playFromPlaylist(idx)}>
              <span className="ip-playlist-idx">{idx + 1}</span>
              <img src={t.imageUrl} alt={t.title} className="ip-playlist-img" />
              <div className="ip-playlist-info">
                <span className="ip-playlist-name">{t.title}</span>
                <span className="ip-playlist-art">{t.artist}</span>
              </div>
              <span className="ip-playlist-dur">{t.duration}</span>
              {idx === currentIndex && <div className="ip-playlist-playing"><span /><span /><span /></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
