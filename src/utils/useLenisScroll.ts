import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type LenisOptions = ConstructorParameters<typeof Lenis>[0]

export function useLenisScroll(options?: LenisOptions, enabled = true) {
  const lenisRef = useRef<Lenis | null>(null)
  const optionsRef = useRef(options)
  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined') return

    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduceMotion) return

    const lenis = new Lenis(optionsRef.current)
    lenisRef.current = lenis

    lenis.on('scroll', () => ScrollTrigger.update())

    const raf = (time: number) => {
      lenis.raf(time)
      rafIdRef.current = requestAnimationFrame(raf)
    }
    rafIdRef.current = requestAnimationFrame(raf)

    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null

      lenis.destroy()
      lenisRef.current = null
    }
  }, [enabled])

  return lenisRef
}

