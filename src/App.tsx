import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import bg from './assets/home/bg.png'
import exodia from './assets/home/exodia.png'
import hut from './assets/home/hut.png'
import leftMountain from './assets/home/left_mountain.png'
import rightMountain from './assets/home/right_mountain.png'

import './App.css'

gsap.registerPlugin(ScrollTrigger)

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">Exodia</div>
      <ul className="navbar-links">
        <li>
          <button type="button">Home</button>
        </li>
        <li>
          <button type="button">Events</button>
        </li>
        <li>
          <button type="button">Team</button>
        </li>
        <li>
          <button type="button">Merchandise</button>
        </li>
      </ul>
    </nav>
  )
}

function App() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollTriggerRef = useRef<HTMLDivElement | null>(null)
  const bgRef = useRef<HTMLDivElement | null>(null)
  const exodiaRef = useRef<HTMLImageElement | null>(null)
  const hutRef = useRef<HTMLImageElement | null>(null)
  const leftMountRef = useRef<HTMLImageElement | null>(null)
  const rightMountRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.1,
    })

    lenis.on('scroll', () => ScrollTrigger.update())

    let frameId: number
    const raf = (time: number) => {
      lenis.raf(time)
      frameId = requestAnimationFrame(raf)
    }
    frameId = requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      cancelAnimationFrame(frameId)
    }
  }, [])

  useEffect(() => {
    const trigger = scrollTriggerRef.current
    if (!trigger) return

    const isMobile = window.matchMedia('(max-width: 720px)').matches

    const ctx = gsap.context(() => {
      // bg: zoom in, move slow, offset to right
      if (bgRef.current) {
        gsap.fromTo(
          bgRef.current,
          { y: 0, scale: 1, x: 0 },
          {
            y: '-35vh',
            scale: 1.25,
            x: '-4%',
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 3,
            },
          }
        )
      }

      // mountains: bigger by default, zoom in more and more on scroll
      if (leftMountRef.current) {
        gsap.fromTo(
          leftMountRef.current,
          { yPercent: isMobile ? 0 : 28, scale: isMobile ? 1.5 : 1 },
          {
            yPercent: 0,
            scale: 2.5,
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1.5,
            },
          }
        )
      }
      if (rightMountRef.current) {
        gsap.fromTo(
          rightMountRef.current,
          { yPercent: isMobile ? 0 : 28, scale: isMobile ? 1.5 :1 },
          {
            yPercent: 0,
            scale: 2.1,
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1.5,
            },
          }
        )
      }

      // exodia: moves further up and out of screen as camera moves down
      if (exodiaRef.current) {
        gsap.fromTo(
          exodiaRef.current,
          { yPercent: 0, scale: 1.2 },
          {
            yPercent: -180,
            scale: 0.9,
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
            },
          }
        )
      }

      // hut: moves down and out of screen as camera moves down
      if (hutRef.current) {
        gsap.fromTo(
          hutRef.current,
          { yPercent: 0, scale: 1 },
          {
            yPercent: 120,
            scale: 0.9,
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1,
            },
          }
        )
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="app" ref={containerRef}>
      <Navbar />

      <main className="parallax-page">
        <div className="scroll-trigger" ref={scrollTriggerRef}>
          <div className="parallax-stage">
            {/* 1. bg - bottom layer */}
            <div className="layer layer-bg" ref={bgRef}>
              <img src={bg} alt="" />
            </div>

            {/* 2. exodia - above bg */}
            <div className="layer layer-exodia">
              <img ref={exodiaRef} src={exodia} alt="Exodia" />
            </div>

            {/* 3. mountains - above exodia */}
            <div className="layer layer-mountains">
              <div className="mountain-left" ref={leftMountRef}>
                <img src={leftMountain} alt="" />
              </div>
              <div className="mountain-right" ref={rightMountRef}>
                <img src={rightMountain} alt="" />
              </div>
            </div>

            {/* 4. hut - above mountains, starts mostly below */}
            <div className="layer layer-hut">
              <img ref={hutRef} src={hut} alt="" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
