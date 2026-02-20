import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import bg from '../assets/home/bg.png'
import exodia from '../assets/home/exodia.png'
import hut from '../assets/home/hut.png'
import leftMountain from '../assets/home/left_mountain.png'
import rightMountain from '../assets/home/right_mountain.png'

gsap.registerPlugin(ScrollTrigger)

export function HomePage() {
  const [daysRemaining, setDaysRemaining] = useState(0)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollTriggerRef = useRef<HTMLDivElement | null>(null)
  const bgRef = useRef<HTMLDivElement | null>(null)
  const exodiaRef = useRef<HTMLImageElement | null>(null)
  const countdownRef = useRef<HTMLDivElement | null>(null)
  const hutRef = useRef<HTMLImageElement | null>(null)
  const leftMountRef = useRef<HTMLImageElement | null>(null)
  const rightMountRef = useRef<HTMLImageElement | null>(null)
  const lenisRef = useRef<Lenis | null>(null)
  
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
    const lenis = new Lenis({ smoothWheel: true, lerp: 0.1 })
    lenisRef.current = lenis
    lenis.on('scroll', () => ScrollTrigger.update())

    let frameId: number
    const raf = (time: number) => { lenis.raf(time); frameId = requestAnimationFrame(raf) }
    frameId = requestAnimationFrame(raf)

    return () => { lenis.destroy(); cancelAnimationFrame(frameId) }
  }, [])

  // ── Intro + scroll parallax ──────────────────────────────────────────────────
  useEffect(() => {
    const trigger = scrollTriggerRef.current
    if (!trigger || !leftMountRef.current || !rightMountRef.current || !exodiaRef.current || !countdownRef.current) return

    const lenis = lenisRef.current
    const mm = gsap.matchMedia()

    mm.add({
      isMobile: "(max-width: 768px)",
      isDesktop: "(min-width: 769px)"
    }, (context) => {
      const { isMobile } = context.conditions as { isMobile: boolean, isDesktop: boolean }

      // ── DYNAMIC VARIABLES BASED ON SCREEN SIZE ──
      // Bumped mobile scale way up to 5.5 so it fills the tall vertical space
      const initMountScale = isMobile ? 5.5 : 3.2 
      // Reduced gap on mobile so mountains don't spread too far off-screen
      const gapX = isMobile ? 6 : 22 
      const mountY = isMobile ? 15 : 28
      const exodiaFinalScale = isMobile ? 0.9 : 1.2

      if (!hasIntroPlayed.current) {
        lenis?.stop()
        
        // ── INTRO START STATES ────────────────────────────────────────────────────
        gsap.set(leftMountRef.current, { scale: initMountScale, xPercent: 0, yPercent: 0, transformOrigin: 'bottom left' })
        gsap.set(rightMountRef.current, { scale: initMountScale, xPercent: 0, yPercent: 0, transformOrigin: 'bottom right' })
        gsap.set(exodiaRef.current, { opacity: 0, scale: 0.85, yPercent: 10 })
        gsap.set(countdownRef.current, { opacity: 0, y: 15 }) // Countdown starts hidden slightly lower
      }

      // ── MASTER TIMELINE ────────────────────────────────────────────────────────
      const tl = gsap.timeline({
        delay: hasIntroPlayed.current ? 0 : 0.2,
        onComplete: () => {
          hasIntroPlayed.current = true
          lenis?.start()

          if (bgRef.current) {
            gsap.fromTo(bgRef.current,
              { y: 0, scale: 1, x: 0 },
              { y: isMobile ? '-20vh' : '-35vh', scale: 1.25, x: '-4%', ease: 'none',
                scrollTrigger: { trigger, start: 'top top', end: 'bottom bottom', scrub: 3 } })
          }
          if (leftMountRef.current) {
            gsap.fromTo(leftMountRef.current,
              { xPercent: -gapX, yPercent: mountY, scale: 1 },
              { xPercent: -(gapX + 15), yPercent: 0, scale: 2.5, ease: 'none',
                scrollTrigger: { trigger, start: 'top top', end: 'bottom bottom', scrub: 1.5 } })
          }
          if (rightMountRef.current) {
            gsap.fromTo(rightMountRef.current,
              { xPercent: gapX, yPercent: mountY, scale: 1 },
              { xPercent: gapX + 15, yPercent: 0, scale: 2.1, ease: 'none',
                scrollTrigger: { trigger, start: 'top top', end: 'bottom bottom', scrub: 1.5 } })
          }
          if (exodiaRef.current) {
            gsap.fromTo(exodiaRef.current,
              { yPercent: 0, scale: exodiaFinalScale },
              { yPercent: -180, scale: exodiaFinalScale * 0.75, ease: 'none',
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
            scale: 1, xPercent: -gapX, yPercent: mountY, transformOrigin: 'bottom left', duration: 1.6, ease: 'power3.inOut'
          })
          .to(rightMountRef.current, {
            scale: 1, xPercent: gapX, yPercent: mountY, transformOrigin: 'bottom right', duration: 1.6, ease: 'power3.inOut'
          }, '<')
          .to(exodiaRef.current, {
            opacity: 1, scale: exodiaFinalScale, yPercent: 0, duration: 1.1, ease: 'power2.out'
          }, '-=1.0')
          // Fade in countdown right after Exodia appears
          .to(countdownRef.current, {
            opacity: 1, y: 0, duration: 0.8, ease: 'power2.out'
          }, '-=0.6')
          .set(leftMountRef.current,  { transformOrigin: 'bottom center' })
          .set(rightMountRef.current, { transformOrigin: 'bottom center' })
      } else {
         gsap.set(leftMountRef.current, { scale: 1, xPercent: -gapX, yPercent: mountY, transformOrigin: 'bottom center' })
         gsap.set(rightMountRef.current, { scale: 1, xPercent: gapX, yPercent: mountY, transformOrigin: 'bottom center' })
         gsap.set(exodiaRef.current, { opacity: 1, scale: exodiaFinalScale, yPercent: 0 })
         gsap.set(countdownRef.current, { opacity: 1, y: 0 })
      }

      return () => {
        tl.kill()
      }
    }, containerRef)

    return () => {
      mm.revert()
      lenis?.start()
    }
  }, [])

  return (
    <div className="app" ref={containerRef}>
      <main className="parallax-page">
        <div className="scroll-trigger" ref={scrollTriggerRef}>
          <div className="parallax-stage">
            <div className="layer layer-bg" ref={bgRef}>
              <img src={bg} alt="" />
            </div>
            
            {/* Grouped Exodia and Countdown together */}
            <div className="layer layer-exodia" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <img ref={exodiaRef} src={exodia} alt="Exodia" style={{ position: 'relative', zIndex: 10 }} />
              
              <div 
                ref={countdownRef} 
                style={{
                  fontFamily: "'Brush Script MT', 'Caveat', 'Pacifico', cursive",
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', // Responsive font size
                  color: '#e4d5b7', // Matches the Exodia aesthetic
                  textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
                  marginTop: '-4%', // Pulls it slightly closer to the logo
                  position: 'relative',
                  zIndex: 10
                }}
              >
                {daysRemaining} days to go....
              </div>
            </div>

            <div className="layer layer-mountains">
              <div className="mountain-left" ref={leftMountRef}>
                <img src={leftMountain} alt="" />
              </div>
              <div className="mountain-right" ref={rightMountRef}>
                <img src={rightMountain} alt="" />
              </div>
            </div>
            <div className="layer layer-hut">
              <img ref={hutRef} src={hut} alt="" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}