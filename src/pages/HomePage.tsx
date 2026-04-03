import { useEffect, useRef, useState } from 'react'
import type Lenis from 'lenis'

import bg from '../assets/home/bg.png'
import exodia from '../assets/home/exodia.png'
import hut from '../assets/home/hut.png'
import leftMountain from '../assets/home/left_mountain.png'
import rightMountain from '../assets/home/right_mountain.png'

import '../styles/home.css'

import { LoadingScreen } from '../components/LoadingScreen'
import { HomeSVG } from '../assets/loading/HomeSVG'
import { loadGsap, loadLenis } from '../utils/lazyAnimations'
import { AdvertisementOverlay } from '../components/AdvertisementOverlay'

const HOME_PRELOAD_IMAGES = [bg, exodia, hut, leftMountain, rightMountain]

export function HomePage() {
  const [daysRemaining, setDaysRemaining] = useState(0)
  const [loaderDone, setLoaderDone] = useState(false)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollTriggerRef = useRef<HTMLDivElement | null>(null)
  const bgRef = useRef<HTMLDivElement | null>(null)
  const exodiaRef = useRef<HTMLImageElement | null>(null)
  const countdownRef = useRef<HTMLDivElement | null>(null)
  const hutRef = useRef<HTMLImageElement | null>(null)
  const leftMountRef = useRef<HTMLImageElement | null>(null)
  const rightMountRef = useRef<HTMLImageElement | null>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const aboutRef = useRef<HTMLDivElement | null>(null)
  
  const hasIntroPlayed = useRef(false)

  // ── Calculate days remaining until April 11 ──────────────────────────────────
  useEffect(() => {
    // Note: Assuming year 2026 based on the logo in the image! Adjust if needed.
    const targetDate = new Date('2026-04-11T00:00:00').getTime()
    const now = new Date().getTime()
    const difference = targetDate - now
    const days = Math.ceil(difference / (1000 * 60 * 60 * 24))
    setDaysRemaining(Math.max(0, days)) // Ensures it doesn't go negative
  }, [])

  // ── Lenis smooth scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    let isCancelled = false
    let frameId: number | null = null
    let lenis: Lenis | null = null

    ;(async () => {
      const [{ ScrollTrigger }, LenisCtor] = await Promise.all([loadGsap(), loadLenis()])
      if (isCancelled) return

      lenis = new LenisCtor({ smoothWheel: true, lerp: 0.1 })
      lenisRef.current = lenis
      if (!hasIntroPlayed.current) lenis.stop()
      lenis.on('scroll', () => ScrollTrigger.update())

      const raf = (time: number) => {
        lenis?.raf(time)
        frameId = requestAnimationFrame(raf)
      }
      frameId = requestAnimationFrame(raf)
    })()

    return () => {
      isCancelled = true
      if (frameId) cancelAnimationFrame(frameId)
      lenis?.destroy()
      lenisRef.current = null
    }
  }, [])

  // ── Intro + scroll parallax ──────────────────────────────────────────────────
  useEffect(() => {
    const trigger = scrollTriggerRef.current
    if (!trigger || !leftMountRef.current || !rightMountRef.current || !exodiaRef.current || !countdownRef.current) return

    let isCancelled = false
    let mm: ReturnType<(typeof import('gsap').default)['matchMedia']> | null = null

    ;(async () => {
      const { gsap } = await loadGsap()
      if (isCancelled) return

      mm = gsap.matchMedia()

      mm.add({
        isMobile: "(max-width: 768px)",
        isTablet: "(min-width: 769px) and (max-width: 1199px)",
        isDesktop: "(min-width: 1200px)"
      }, (context: { conditions?: unknown }) => {
        const { isMobile, isTablet } = context.conditions as { isMobile: boolean, isTablet: boolean, isDesktop: boolean }

      // ── DYNAMIC VARIABLES BASED ON SCREEN SIZE ──
      const initMountScale = isMobile ? 5.5 : isTablet ? 4.0 : 3.2
      const mountScale     = isMobile ? 1.5 : isTablet ? 1.4 : 1.3   // resting size after intro
      const gapX = isMobile ? 145 : isTablet ? 45 : 10
      const mountY = isMobile ? 10 : isTablet ? 16 : 22
      const exodiaFinalScale = isMobile ? 0.9 : isTablet ? 1.0 : 1.2
      const originL = isMobile || isTablet ? 'bottom left' : 'bottom center'
      const originR = isMobile || isTablet ? 'bottom right' : 'bottom center'

      if (!hasIntroPlayed.current) {
        lenisRef.current?.stop()
        
        // ── INTRO START STATES ────────────────────────────────────────────────────
        gsap.set(leftMountRef.current, { scale: initMountScale, xPercent: 0, yPercent: 0, transformOrigin: originL })
        gsap.set(rightMountRef.current, { scale: initMountScale, xPercent: 0, yPercent: 0, transformOrigin: originR })
        gsap.set(exodiaRef.current, { opacity: 0, scale: 0.85, yPercent: 10 })
        gsap.set(countdownRef.current, { opacity: 0, y: 15 }) // Countdown starts hidden slightly lower
      }

      // ── MASTER TIMELINE ────────────────────────────────────────────────────────
      const tl = gsap.timeline({
        delay: hasIntroPlayed.current ? 0 : 0.2,
        onComplete: () => {
          hasIntroPlayed.current = true
          lenisRef.current?.start()

          if (bgRef.current) {
            gsap.fromTo(bgRef.current,
              { y: 0, scale: 1, x: 0 },
              { y: isMobile ? '-20vh' : isTablet ? '-28vh' : '-35vh', scale: 1.25, x: '-4%', ease: 'none',
                scrollTrigger: { trigger, start: 'top top', end: 'bottom bottom', scrub: 3 } })
          }
          if (leftMountRef.current) {
            gsap.fromTo(leftMountRef.current,
              { xPercent: -gapX, yPercent: mountY, scale: mountScale, transformOrigin: originL },
              { xPercent: -(gapX + (isMobile ? 70 : isTablet ? 20 : 10)), yPercent: 0, scale: isMobile ? 2.2 : isTablet ? 2.4 : 2.7, ease: 'none',
                scrollTrigger: { trigger, start: 'top top', end: 'bottom bottom', scrub: 1.5 } })
          }
          if (rightMountRef.current) {
            gsap.fromTo(rightMountRef.current,
              { xPercent: gapX, yPercent: mountY, scale: mountScale, transformOrigin: originR },
              { xPercent: gapX + (isMobile ? 70 : isTablet ? 20 : 10), yPercent: 0, scale: isMobile ? 2.0 : isTablet ? 2.2 : 2.4, ease: 'none',
                scrollTrigger: { trigger, start: 'top top', end: 'bottom bottom', scrub: 1.5 } })
          }
          if (exodiaRef.current) {
            gsap.fromTo(exodiaRef.current,
              { yPercent: 0, scale: exodiaFinalScale, opacity: 1 },
              { yPercent: isMobile ? -350 : isTablet ? -220 : -180, scale: exodiaFinalScale * 0.75, opacity: 0, ease: 'none',
                scrollTrigger: { trigger, start: 'top top', end: 'bottom bottom', scrub: 1 } })
          }
          // Fade countdown out rapidly as soon as user scrolls
          if (countdownRef.current) {
            gsap.fromTo(countdownRef.current,
              { opacity: 1, y: 0 },
              { opacity: 0, y: -40, ease: 'none',
                scrollTrigger: { trigger, start: 'top top', end: '15% top', scrub: 0.5 } })
          }
          if (hutRef.current) {
            gsap.fromTo(hutRef.current,
              { yPercent: 0, scale: 1 },
              { yPercent: 120, scale: 0.9, ease: 'none',
                scrollTrigger: { trigger, start: 'top top', end: 'bottom bottom', scrub: 1 } })
          }
        },
      })

      // ── INTRO ANIMATION (Only runs once) ──────────────────────────────────────
      if (!hasIntroPlayed.current) {
        tl.to(leftMountRef.current, {
            scale: mountScale, xPercent: -gapX, yPercent: mountY, transformOrigin: originL, duration: 1.6, ease: 'power3.inOut'
          })
          .to(rightMountRef.current, {
            scale: mountScale, xPercent: gapX, yPercent: mountY, transformOrigin: originR, duration: 1.6, ease: 'power3.inOut'
          }, '<')
          .to(exodiaRef.current, {
            opacity: 1, scale: exodiaFinalScale, yPercent: 0, duration: 1.1, ease: 'power2.out'
          }, '-=1.0')
          // Fade in countdown right after Exodia appears
          .to(countdownRef.current, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power2.out'
          }, '-=0.6')
          .set(leftMountRef.current,  { transformOrigin: originL })
          .set(rightMountRef.current, { transformOrigin: originR })
      } else {
         gsap.set(leftMountRef.current, { scale: mountScale, xPercent: -gapX, yPercent: mountY, transformOrigin: originL })
         gsap.set(rightMountRef.current, { scale: mountScale, xPercent: gapX, yPercent: mountY, transformOrigin: originR })
         gsap.set(exodiaRef.current, { opacity: 1, scale: exodiaFinalScale, yPercent: 0 })
         gsap.set(countdownRef.current, { opacity: 1, y: 0 })
      }

      return () => {
        tl.kill()
      }
    }, containerRef)
    })()

    return () => {
      isCancelled = true
      mm?.revert()
      lenisRef.current?.start()
    }
  }, [])

  // ── About Us fade-in animation ───────────────────────────────────────────────
  useEffect(() => {
    if (!aboutRef.current || !scrollTriggerRef.current) return

    let isCancelled = false
    let ctx: { revert: () => void } | null = null

    ;(async () => {
      const { gsap } = await loadGsap()
      if (isCancelled) return

      const aboutEl = aboutRef.current
      const trigger = scrollTriggerRef.current
      if (!aboutEl || !trigger) return

      ctx = gsap.context(() => {
        const isMobile = window.matchMedia('(max-width: 720px)').matches
        const start = isMobile ? '35% top' : '50% top'
        const end = isMobile ? '75% top' : '65% top'

        gsap.fromTo(
          aboutEl,
          { opacity: 0, yPercent: isMobile ? 20 : 30 },
          {
            opacity: 1,
            yPercent: 0,
            ease: 'power2.out',
            scrollTrigger: {
              trigger,
              start,
              end,
              scrub: 1,
              onEnter: () => { aboutEl.style.pointerEvents = 'auto' },
              onEnterBack: () => { aboutEl.style.pointerEvents = 'auto' },
              onLeaveBack: () => { aboutEl.style.pointerEvents = 'none' },
            },
          }
        )
      }, containerRef)
    })()

    return () => {
      isCancelled = true
      ctx?.revert()
    }
  }, [])

  return (
    <LoadingScreen
      svg={<HomeSVG />}
      preloadImages={HOME_PRELOAD_IMAGES}
      onDone={() => setLoaderDone(true)}
    >
    <AdvertisementOverlay loaderDone={loaderDone} />
    <div className="app" ref={containerRef}>
      <main className="parallax-page">
        <div className="scroll-trigger" ref={scrollTriggerRef}>
          <div className="parallax-stage">
            <div className="layer layer-bg" ref={bgRef}>
              <img src={bg} alt="" loading="eager" decoding="async" />
            </div>
            
            {/* Grouped Exodia and Countdown together */}
            <div className="layer layer-exodia" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <img ref={exodiaRef} src={exodia} alt="Exodia" loading="eager" decoding="async" style={{ position: 'relative', zIndex: 10 }} />
              
              <div 
                ref={countdownRef} 
                className="countdown-text"
              >
                {daysRemaining} days to go....
              </div>
            </div>

            <div className="layer layer-mountains">
              <div className="mountain-left" ref={leftMountRef}>
                <img src={leftMountain} alt="" loading="eager" decoding="async" />
              </div>
              <div className="mountain-right" ref={rightMountRef}>
                <img src={rightMountain} alt="" loading="eager" decoding="async" />
              </div>
            </div>
            <div className="layer layer-hut">
              <img ref={hutRef} src={hut} alt="" loading="eager" decoding="async" />
            </div>

            {/* About Us - overlaid on top of parallax stage */}
            <div className="about-us-overlay" ref={aboutRef}>
              <div className="about-us-content">
                <h2 className="about-us-title font-serif">About Us</h2>
                <p className="about-us-text font-serif">
                  With a thunderbolt of lightning and mountains that have witnessed millennia, Exodia returns to you. Exodia'26 is IIT Mandi's celebration of creativity, innovation and culture right in the heart of Himalayas. This year, Exodia brings together the binding forces of the nature: Ethereal Earth, Fiery Fire, ever-wandering Air, Water and boundless Ether. Exodia'26 unites cultural performances, unique artistic installations and the nightly showcase of our diverse and vibrant community energy. Here nature awaits your creativity and memories that will find their way to your heart again and again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </LoadingScreen>
  )
}