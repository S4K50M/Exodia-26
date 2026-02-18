import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'

import { Navbar } from './components/Navbar'
import { HomePage } from './pages/HomePage'
import { EventsPage } from './pages/EventsPage'
import { TeamPage } from './pages/TeamPage'
import { MerchandisePage } from './pages/MerchandisePage'
import LoadingScreen from './components/OldLoader'

import './App.css'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (loading) {
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }

    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [loading])

  return (
    <>
      {/* Always render page content, but keep it behind loader initially */}
      <div style={{ 
        opacity: loading ? 0 : 1, 
        transition: 'opacity 0.5s ease-out',
        position: 'relative',
        zIndex: 1
      }}>
        <Navbar shouldAnimate={!loading} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/merchandise" element={<MerchandisePage />} />
        </Routes>
      </div>
      {/* Loader overlays on top and fades out */}
      {loading && (
        <LoadingScreen onLoadingComplete={() => setLoading(false)} />
      )}
    </>
  )
}

export default App
