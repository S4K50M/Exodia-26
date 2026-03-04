import { Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect, useState } from 'react'

import { Navbar } from './components/Navbar'

import './App.css'

const HomePage = lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage }))
)
const EventsPage = lazy(() =>
  import('./pages/EventsPage').then((m) => ({ default: m.EventsPage }))
)
const TeamPage = lazy(() =>
  import('./pages/TeamPage').then((m) => ({ default: m.TeamPage }))
)
const MerchandisePage = lazy(() =>
  import('./pages/MerchandisePage').then((m) => ({ default: m.MerchandisePage }))
)
const MapPage = lazy(() =>
  import('./pages/MapPage').then((m) => ({ default: m.MapPage }))
)
const AdminPage = lazy(() =>
  import('./pages/AdminPage').then((m) => ({ default: m.AdminPage }))
)
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
)

const RegisterModal = lazy(() =>
  import('./components/RegisterModal').then((m) => ({ default: m.RegisterModal }))
)
const NotificationSidebar = lazy(() =>
  import('./components/NotifBar').then((m) => ({ default: m.NotificationSidebar }))
)

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function App() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isNotifyOpen, setIsNotifyOpen] = useState(false)

  const [mountRegisterModal, setMountRegisterModal] = useState(false)
  const [mountNotificationSidebar, setMountNotificationSidebar] = useState(false)

  return (
    <>
      <ScrollToTop />
      <Navbar
        onRegisterClick={() => {
          setMountRegisterModal(true)
          setIsRegisterOpen(true)
        }}
        onNotifyClick={() => {
          setMountNotificationSidebar(true)
          setIsNotifyOpen(true)
        }}
      />

      {mountRegisterModal && (
        <Suspense fallback={null}>
          <RegisterModal
            isOpen={isRegisterOpen}
            onClose={() => setIsRegisterOpen(false)}
          />
        </Suspense>
      )}
      {mountNotificationSidebar && (
        <Suspense fallback={null}>
          <NotificationSidebar
            isOpen={isNotifyOpen}
            onClose={() => setIsNotifyOpen(false)}
          />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/merchandise" element={<MerchandisePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
