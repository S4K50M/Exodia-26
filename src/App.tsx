import { Routes, Route, useLocation } from 'react-router-dom'
import { useRef, useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { Navbar } from './components/Navbar'
import { HomePage } from './pages/HomePage'
import { EventsPage } from './pages/EventsPage'
import { TeamPage } from './pages/TeamPage'
import { MerchandisePage } from './pages/MerchandisePage'

import './App.css'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
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
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/merchandise" element={<MerchandisePage />} />
      </Routes>
    </>
  )
}

export default App