import { Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect, useState } from 'react';

import { Navbar } from './components/Navbar'
import { NotificationSidebar } from './components/NotifBar';
import { HomePage } from './pages/HomePage'
import { RegisterModal } from './components/RegisterModal'
import { prefetchAnimationLibs, runWhenIdle } from './utils/lazyAnimations'

const EventsPage = lazy(() => import('./pages/EventsPage').then((m) => ({ default: m.EventsPage })))
const TeamPage = lazy(() => import('./pages/TeamPage').then((m) => ({ default: m.TeamPage })))
const MerchandisePage = lazy(() => import('./pages/MerchandisePage').then((m) => ({ default: m.MerchandisePage })))
const MapPage = lazy(() => import('./pages/MapPage').then((m) => ({ default: m.MapPage })))
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

import './App.css'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isNotifyOpen,setIsNotifyOpen] = useState(false)

  useEffect(() => {
    runWhenIdle(() => {
      prefetchAnimationLibs()
      void import('./pages/EventsPage')
      void import('./pages/TeamPage')
      void import('./pages/MerchandisePage')
      void import('./pages/MapPage')
    })
  }, [])

  return (
    <>
      <ScrollToTop />
      <Navbar onRegisterClick={() => setIsRegisterOpen(true)} onNotifyClick={() => setIsNotifyOpen(true)} />
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      <NotificationSidebar isOpen={isNotifyOpen} onClose={()=> setIsNotifyOpen(false)} />
      <Suspense fallback={<div className="page-content">Loading…</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/merchandise" element={<MerchandisePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/admin" element={<AdminPage />}/>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
