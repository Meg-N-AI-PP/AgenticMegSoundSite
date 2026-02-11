import { useState } from 'react'
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
