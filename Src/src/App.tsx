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

function Portfolio() {
  return (
    <div className="app">
      <AgenticBackground />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Certifications />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  const location = useLocation();
  const onMusicPage = location.pathname === '/music';

  return (
    <>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/music" element={<MusicPage />} />
      </Routes>
      {/* Show mini-player on every page except /music (which has the full player) */}
      {!onMusicPage && <MiniPlayer />}
    </>
  )
}

export default App
