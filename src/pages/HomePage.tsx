import { useEffect, useRef } from 'react'
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
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollTriggerRef = useRef<HTMLDivElement | null>(null)
  const bgRef = useRef<HTMLDivElement | null>(null)
  const exodiaRef = useRef<HTMLImageElement | null>(null)
  const hutRef = useRef<HTMLImageElement | null>(null)
  const leftMountRef = useRef<HTMLImageElement | null>(null)
  const rightMountRef = useRef<HTMLImageElement | null>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const scrollCtxRef = useRef<gsap.Context | null>(null)

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
    if (!trigger || !leftMountRef.current || !rightMountRef.current || !exodiaRef.current) return

    const lenis = lenisRef.current

    // Lock scroll for the duration of the intro
    lenis?.stop()

    // ── INTRO START STATES ────────────────────────────────────────────────────
    // Each mountain wrapper is 50% wide × 85% tall, anchored at its bottom corner.
    // Scale from that corner so it expands inward and upward to fill the screen.
    gsap.set(leftMountRef.current, {
      scale: 3.2,
      xPercent: 0,
      yPercent: 0,
      transformOrigin: 'bottom left',
    })
    gsap.set(rightMountRef.current, {
      scale: 3.2,
      xPercent: 0,
      yPercent: 0,
      transformOrigin: 'bottom right',
    })
    // Exodia hidden behind the mountain curtain
    gsap.set(exodiaRef.current, { opacity: 0, scale: 0.85, yPercent: 10 })

    // Intro timeline
    const tl = gsap.timeline({
      delay: 0.2,
      onComplete: () => {
        lenis?.start()

        // Wire up scroll-driven parallax only AFTER the intro finishes so
        // the fromTo start values match the post-intro element positions
        const ctx = gsap.context(() => {
          if (bgRef.current) {
            gsap.fromTo(bgRef.current,
              { y: 0, scale: 1, x: 0 },
              { y: '-35vh', scale: 1.25, x: '-4%', ease: 'none',
                scrollTrigger: { trigger, start: 'top top', end: 'bottom bottom', scrub: 3 } })
          }
          if (leftMountRef.current) {
            gsap.fromTo(leftMountRef.current,
              { xPercent: 0, yPercent: 28, scale: 1 },
              { yPercent: 0, scale: 2.5, ease: 'none',
                scrollTrigger: { trigger, start: 'top top', end: 'bottom bottom', scrub: 1.5 } })
          }
          if (rightMountRef.current) {
            gsap.fromTo(rightMountRef.current,
              { xPercent: 0, yPercent: 28, scale: 1 },
              { yPercent: 0, scale: 2.1, ease: 'none',
                scrollTrigger: { trigger, start: 'top top', end: 'bottom bottom', scrub: 1.5 } })
          }
          if (exodiaRef.current) {
            gsap.fromTo(exodiaRef.current,
              { yPercent: 0, scale: 1.2 },
              { yPercent: -180, scale: 0.9, ease: 'none',
                scrollTrigger: { trigger, start: 'top top', end: 'bottom bottom', scrub: 1 } })
          }
          if (hutRef.current) {
            gsap.fromTo(hutRef.current,
              { yPercent: 0, scale: 1 },
              { yPercent: 120, scale: 0.9, ease: 'none',
                scrollTrigger: { trigger, start: 'top top', end: 'bottom bottom', scrub: 1 } })
          }
        }, containerRef)

        scrollCtxRef.current = ctx
      },
    })

    // Mountains shrink back to natural size/position from their screen-filling state
    tl.to(leftMountRef.current, {
        scale: 1,
        yPercent: 28,
        transformOrigin: 'bottom left',
        duration: 1.6,
        ease: 'power3.inOut',
      })
      .to(rightMountRef.current, {
        scale: 1,
        yPercent: 28,
        transformOrigin: 'bottom right',
        duration: 1.6,
        ease: 'power3.inOut',
      }, '<')
      // Exodia rises in as the mountains pull back
      .to(exodiaRef.current, {
        opacity: 1,
        scale: 1.2,
        yPercent: 0,
        duration: 1.1,
        ease: 'power2.out',
      }, '-=1.0')
      // Reset transformOrigin to bottom center so scroll parallax scaling looks right
      .set(leftMountRef.current,  { transformOrigin: 'bottom center' })
      .set(rightMountRef.current, { transformOrigin: 'bottom center' })

    return () => {
      tl.kill()
      lenis?.start()
      scrollCtxRef.current?.revert()
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
            <div className="layer layer-exodia">
              <img ref={exodiaRef} src={exodia} alt="Exodia" />
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
