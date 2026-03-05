export type LoadedGsap = {
  gsap: typeof import('gsap').default
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger
}

let gsapPromise: Promise<LoadedGsap> | null = null

export async function loadGsap(): Promise<LoadedGsap> {
  if (gsapPromise) return gsapPromise

  gsapPromise = (async () => {
    const gsapModule = await import('gsap')
    const scrollTriggerModule = await import('gsap/ScrollTrigger')

    const gsap = gsapModule.default
    const ScrollTrigger = scrollTriggerModule.ScrollTrigger

    gsap.registerPlugin(ScrollTrigger)

    return { gsap, ScrollTrigger }
  })()

  return gsapPromise
}

type Lenis = typeof import('lenis').default

let lenisPromise: Promise<Lenis> | null = null

export async function loadLenis(): Promise<Lenis> {
  if (lenisPromise) return lenisPromise

  lenisPromise = import('lenis').then((m) => m.default)
  return lenisPromise
}

export function prefetchGsap() {
  void loadGsap().catch(() => {})
}

export function prefetchLenis() {
  void loadLenis().catch(() => {})
}

export function prefetchAnimationLibs() {
  prefetchGsap()
  prefetchLenis()
}

export function runWhenIdle(work: () => void, timeoutMs = 1200) {
  if (typeof window === 'undefined') return

  const ric = (window as any).requestIdleCallback as
    | ((cb: () => void, opts?: { timeout: number }) => number)
    | undefined

  if (ric) {
    ric(work, { timeout: timeoutMs })
    return
  }

  window.setTimeout(work, 1)
}

