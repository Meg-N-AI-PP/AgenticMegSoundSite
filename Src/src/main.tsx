import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { PlayerProvider } from './context/PlayerContext'
import App from './App'
import './App.css'
import './Music.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <PlayerProvider>
      <App />
    </PlayerProvider>
  </BrowserRouter>,
)
