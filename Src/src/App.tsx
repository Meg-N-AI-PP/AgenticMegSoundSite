import { useState, useEffect, useRef, useCallback } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Experience from './components/Experience'
import Certifications from './components/Certifications'
import Footer from './components/Footer'
import AgenticBackground from './components/AgenticBackground'
import MusicPage from './components/MusicPage'
import MiniPlayer from './components/MiniPlayer'
import PortfolioAgent from './components/PortfolioAgent'
import MusicAgent from './components/MusicAgent'
import MovingAgent from './components/MovingAgent'
import MinAgent from './components/MinAgent'

/* ──────────────────────────────────────────────
   Portfolio layout (no agent — it's rendered in App)
   ────────────────────────────────────────────── */

interface PortfolioProps {
  onProjectHover: (title: string | null) => void;
  onProjectClick: (title: string | null) => void;
}

function Portfolio({ onProjectHover, onProjectClick }: PortfolioProps) {
  return (
    <div className="app">
      <AgenticBackground />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience onProjectHover={onProjectHover} onProjectClick={onProjectClick} />
        <Certifications />
      </main>
      <Footer />
    </div>
  )
}

/* ──────────────────────────────────────────────
   App — agents are always mounted so conversations
   persist across page navigations (Issue R2-#2).
   CSS display:none hides the wrong-page agent UI.
   ────────────────────────────────────────────── */

function App() {
  const location = useLocation();
  const onMusicPage = location.pathname === '/music';

  // Lifted state for portfolio agent communication
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [clickedProject, setClickedProject] = useState<string | null>(null);

  // Moving agent (Min walking sprite) state
  const [isMinChatOpen, setIsMinChatOpen] = useState(false);
  const [minHoverCount, setMinHoverCount] = useState(0);
  const hoverDecayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Decay hover count after 5 minutes of no hovering → Min calms down
  const handleHoverCountChange = useCallback((count: number) => {
    setMinHoverCount(count);
    // Reset/restart the 5-minute decay timer
    if (hoverDecayTimer.current) clearTimeout(hoverDecayTimer.current);
    hoverDecayTimer.current = setTimeout(() => {
      setMinHoverCount(0);
    }, 5 * 60 * 1000); // 5 minutes
  }, []);

  // Cleanup decay timer on unmount
  useEffect(() => {
    return () => {
      if (hoverDecayTimer.current) clearTimeout(hoverDecayTimer.current);
    };
  }, []);

  const handleAgentClick = () => {
    setIsMinChatOpen(true);
  };

  const handleMinChatClose = () => {
    setIsMinChatOpen(false);
  };

  return (
    <>
      <Routes>
        <Route path="/" element={
          <Portfolio onProjectHover={setActiveProject} onProjectClick={setClickedProject} />
        } />
        <Route path="/music" element={<MusicPage />} />
      </Routes>

      {/* Mini-player on every page except /music */}
      {!onMusicPage && <MiniPlayer />}

      {/* ── Moving Agent: only on portfolio page ── */}
      {!onMusicPage && (
        <MovingAgent
          onAgentClick={handleAgentClick}
          isChatOpen={isMinChatOpen}
          hoverCount={minHoverCount}
          onHoverCountChange={handleHoverCountChange}
        />
      )}

      {/* MinAgent: always mounted on portfolio for conversation persistence */}
      <div style={onMusicPage ? { visibility: 'hidden' as const, pointerEvents: 'none' as const, position: 'fixed' as const, top: 0, left: 0 } : undefined}>
        <MinAgent
          isOpen={isMinChatOpen}
          onClose={handleMinChatClose}
          hoverCount={minHoverCount}
          onResetHoverCount={() => setMinHoverCount(0)}
        />
      </div>

      {/* ── Agents: ALWAYS mounted (never unmount on navigation) ── */}
      {/* Hide via visibility + pointer-events instead of display:none
          to avoid textarea rendering bugs on page transition. */}
      <div style={onMusicPage ? { visibility: 'hidden' as const, pointerEvents: 'none' as const, position: 'fixed' as const, bottom: 0, right: 0 } : undefined}>
        <PortfolioAgent activeProject={activeProject} clickedProject={clickedProject} />
      </div>
      <div style={!onMusicPage ? { visibility: 'hidden' as const, pointerEvents: 'none' as const, position: 'fixed' as const, top: 0, right: 0 } : undefined}>
        <MusicAgent />
      </div>
    </>
  )
}

export default App
