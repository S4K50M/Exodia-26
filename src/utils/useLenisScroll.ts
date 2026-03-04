import { useEffect, useRef } from 'react'

type LenisCtor = typeof import('lenis').default
type LenisOptions = ConstructorParameters<LenisCtor>[0]
type LenisInstance = InstanceType<LenisCtor>

export function useLenisScroll(options?: LenisOptions, enabled = true) {
  const lenisRef = useRef<LenisInstance | null>(null)
  const optionsRef = useRef(options)
  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return

    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduceMotion) return

    const connection = (navigator as any).connection
    const saveData = connection?.saveData === true
    const effectiveType = String(connection?.effectiveType ?? '')
    const slowNetwork = /(^|-)2g$/.test(effectiveType) || effectiveType === 'slow-2g'
    if (saveData || slowNetwork) return

    let cancelled = false
    let lenis: LenisInstance | null = null

    ;(async () => {
      try {
        const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] = await Promise.all([
          import('lenis'),
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ])
        if (cancelled) return

        gsap.registerPlugin(ScrollTrigger)

        lenis = new Lenis(optionsRef.current) as LenisInstance
        lenisRef.current = lenis

        lenis.on('scroll', () => ScrollTrigger.update())

        const raf = (time: number) => {
          lenis?.raf(time)
          rafIdRef.current = requestAnimationFrame(raf)
        }
        rafIdRef.current = requestAnimationFrame(raf)
      } catch {
        // Ignore (e.g. running in non-browser or module load failure)
      }
    })()

    return () => {
      cancelled = true
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null

      lenis?.destroy()
      lenis = null
      lenisRef.current = null
    }
  }, [enabled])

  return lenisRef
}
