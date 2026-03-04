export const loadHomePage = () => import('./pages/HomePage')
export const loadEventsPage = () => import('./pages/EventsPage')
export const loadTeamPage = () => import('./pages/TeamPage')
export const loadMerchandisePage = () => import('./pages/MerchandisePage')
export const loadMapPage = () => import('./pages/MapPage')
export const loadAdminPage = () => import('./pages/AdminPage')
export const loadNotFoundPage = () => import('./pages/NotFoundPage')

export const loadRegisterModal = () => import('./components/RegisterModal')
export const loadNotificationSidebar = () => import('./components/NotifBar')

export const routeChunkLoaders: Record<string, () => Promise<unknown>> = {
  '/': loadHomePage,
  '/events': loadEventsPage,
  '/team': loadTeamPage,
  '/merchandise': loadMerchandisePage,
  '/map': loadMapPage,
  '/admin': loadAdminPage,
}

function safePrefetch(loader?: () => Promise<unknown>) {
  loader?.().catch(() => {})
}

export function prefetchRoute(pathname: string) {
  safePrefetch(routeChunkLoaders[pathname])
}

export function prefetchRegisterModal() {
  safePrefetch(loadRegisterModal)
}

export function prefetchNotifications() {
  safePrefetch(loadNotificationSidebar)
}

