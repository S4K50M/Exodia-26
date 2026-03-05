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

function canPrefetch() {
  if (typeof navigator === 'undefined') return false
  const connection = (navigator as any).connection
  const saveData = connection?.saveData === true
  const effectiveType = String(connection?.effectiveType ?? '')
  const slowNetwork = /(^|-)2g$/.test(effectiveType) || effectiveType === 'slow-2g'
  if (saveData || slowNetwork) return false

  const deviceMemory = (navigator as any).deviceMemory as number | undefined
  if (typeof deviceMemory === 'number' && deviceMemory > 0 && deviceMemory <= 4) return false

  const hardwareConcurrency = (navigator as any).hardwareConcurrency as number | undefined
  if (
    typeof hardwareConcurrency === 'number' &&
    hardwareConcurrency > 0 &&
    hardwareConcurrency <= 4
  ) {
    return false
  }

  return true
}

const prefetched = new Set<string>()

function safePrefetch(key: string, loader?: () => Promise<unknown>) {
  if (!loader) return
  if (!canPrefetch()) return
  if (prefetched.has(key)) return

  prefetched.add(key)
  loader().catch(() => {
    prefetched.delete(key)
  })
}

export function prefetchRoute(pathname: string) {
  safePrefetch(`route:${pathname}`, routeChunkLoaders[pathname])
}

export function prefetchRegisterModal() {
  safePrefetch('modal:register', loadRegisterModal)
}

export function prefetchNotifications() {
  safePrefetch('modal:notifications', loadNotificationSidebar)
}
