import { Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect, useState } from 'react'

import { Navbar } from './components/Navbar'
import {
  loadAdminPage,
  loadEventsPage,
  loadHomePage,
  loadMapPage,
  loadMerchandisePage,
  loadNotFoundPage,
  loadNotificationSidebar,
  loadRegisterModal,
  loadTeamPage,
  prefetchRoute,
} from './routes'

import './App.css'

const HomePage = lazy(() => loadHomePage().then((m) => ({ default: m.HomePage })))
const EventsPage = lazy(() => loadEventsPage().then((m) => ({ default: m.EventsPage })))
const TeamPage = lazy(() => loadTeamPage().then((m) => ({ default: m.TeamPage })))
const MerchandisePage = lazy(() =>
  loadMerchandisePage().then((m) => ({ default: m.MerchandisePage }))
)
const MapPage = lazy(() => loadMapPage().then((m) => ({ default: m.MapPage })))
const AdminPage = lazy(() => loadAdminPage().then((m) => ({ default: m.AdminPage })))
const NotFoundPage = lazy(() => loadNotFoundPage().then((m) => ({ default: m.NotFoundPage })))

const RegisterModal = lazy(() =>
  loadRegisterModal().then((m) => ({ default: m.RegisterModal }))
)
const NotificationSidebar = lazy(() =>
  loadNotificationSidebar().then((m) => ({ default: m.NotificationSidebar }))
)

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function RouteFallback() {
  return (
    <div className="route-fallback" role="status" aria-live="polite">
      <div className="route-fallback-inner">
        <span className="route-spinner" aria-hidden="true" />
        <span className="route-fallback-text">Loading…</span>
      </div>
    </div>
  )
}

function ModalFallback({ label }: { label: string }) {
  return (
    <div className="modal-fallback" role="status" aria-live="polite">
      <div className="route-fallback-inner">
        <span className="route-spinner" aria-hidden="true" />
        <span className="route-fallback-text">{label}</span>
      </div>
    </div>
  )
}

function App() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isNotifyOpen, setIsNotifyOpen] = useState(false)

  const [mountRegisterModal, setMountRegisterModal] = useState(false)
  const [mountNotificationSidebar, setMountNotificationSidebar] = useState(false)

  useEffect(() => {
    const warm = () => {
      prefetchRoute('/events')
      prefetchRoute('/team')
    }

    const scheduleWarm = () => {
      const win = window as any
      if (typeof win.requestIdleCallback === 'function') {
        const id = win.requestIdleCallback(warm, { timeout: 6000 })
        return () => win.cancelIdleCallback?.(id)
      }

      const t = window.setTimeout(warm, 2500)
      return () => window.clearTimeout(t)
    }

    let cancelScheduled: (() => void) | null = null
    const kick = () => {
      cancelScheduled?.()
      cancelScheduled = scheduleWarm()
    }

    if (document.readyState === 'complete') {
      kick()
      return () => cancelScheduled?.()
    }

    window.addEventListener('load', kick, { once: true })
    return () => {
      window.removeEventListener('load', kick)
      cancelScheduled?.()
    }
  }, [])

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
        <Suspense fallback={<ModalFallback label="Opening Register…" />}>
          <RegisterModal
            isOpen={isRegisterOpen}
            onClose={() => setIsRegisterOpen(false)}
          />
        </Suspense>
      )}
      {mountNotificationSidebar && (
        <Suspense fallback={<ModalFallback label="Opening Notifications…" />}>
          <NotificationSidebar
            isOpen={isNotifyOpen}
            onClose={() => setIsNotifyOpen(false)}
          />
        </Suspense>
      )}

      <Suspense fallback={<RouteFallback />}>
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
