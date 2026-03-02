import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import bg from '../assets/events/bg.png'
import leftDragon from '../assets/events/left_dragon.png'
import rightDragon from '../assets/events/right_dragon.png'
import leftSword from '../assets/events/left_sword.png'
import rightSword from '../assets/events/right_sword.png'

import { EventCards } from '../components/EventCards'
import EventsRaw from '../data/events.json'
import '../styles/events.css'

import { LoadingScreen } from '../components/LoadingScreen'
import { EventsSVG } from '../assets/loading/EventsSVG'

gsap.registerPlugin(ScrollTrigger)

export function EventsPage() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollTriggerRef = useRef<HTMLDivElement | null>(null)
  const leftDragonRef = useRef<HTMLImageElement | null>(null)
  const rightDragonRef = useRef<HTMLImageElement | null>(null)
  const leftSwordRef = useRef<HTMLImageElement | null>(null)
  const rightSwordRef = useRef<HTMLImageElement | null>(null)
  const cardsWrapRef = useRef<HTMLDivElement | null>(null)
  const headingRef = useRef<HTMLDivElement | null>(null)

  // Flatten the complex JSON structure for the EventCards component
  // Attach a human-friendly `eventType` so the card overlay can show it.
  const ALL_EVENTS = Object.entries(EventsRaw.Exodia_2026_Events).flatMap(([key, arr]) => {
    const humanType = key
      .replace(/_/g, ' ')
      .replace(/Events?$/i, 'Event')
      .replace(/\b\w/g, (c) => c.toUpperCase())
    return (arr as any[])
      .map((e, i) => ({ raw: e, index: i }))
      .filter(({ raw }) => raw && raw.event_name)
      .map(({ raw, index }) => ({
        id: `${key}-${index}`,
        title: raw.event_name,
        desc: raw.description,
        date: raw.dates,
        rulebook: raw.rulebook_link,
        eventType: humanType,
      }))
  })


  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true, lerp: 0.1 })
    lenis.on('scroll', () => ScrollTrigger.update())
    const raf = (time: number) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
    return () => lenis.destroy()
  }, [])

  useEffect(() => {
    const trigger = scrollTriggerRef.current
    if (!trigger) return

    const ctx = gsap.context(() => {
      // 1. Heading Fade Animation
      if (headingRef.current) {
        gsap.fromTo(headingRef.current,
          { opacity: 1, y: 0 },
          {
            opacity: 0,
            y: -100,
            ease: 'power1.inOut',
            scrollTrigger: {
              trigger,
              start: 'top top',
              end: '20% top',
              scrub: 1
            }
          }
        )
      }

      // 2. Horizontal Sword Parallax
      gsap.to(leftSwordRef.current, {
        x: '-100%',
        opacity: 0,
        scrollTrigger: {
          trigger,
          start: 'top top',
          end: '30% top',
          scrub: 2
        }
      })
      gsap.to(rightSwordRef.current, {
        x: '100%',
        opacity: 0,
        scrollTrigger: {
          trigger,
          start: 'top top',
          end: '30% top',
          scrub: 2
        }
      })

      // 3. Diagonal Dragon Parallax (Moves down and out)
      if (leftDragonRef.current) {
        gsap.to(leftDragonRef.current, {
          x: '-20%',
          y: '50%',
          rotate: -10,
          scrollTrigger: {
            trigger,
            start: 'top top',
            end: '50% top',
            scrub: 1.5,
          }
        })
      }
      if (rightDragonRef.current) {
        gsap.to(rightDragonRef.current, {
          x: '20%',
          y: '50%',
          rotate: 10,
          scrollTrigger: {
            trigger,
            start: 'top top',
            end: '50% top',
            scrub: 1.5,
          }
        })
      }

      // 4. Cards Emergence
      if (cardsWrapRef.current) {
        gsap.fromTo(cardsWrapRef.current,
          { yPercent: 100, opacity: 0, scale: 0.9 },
          {
            yPercent: 0,
            opacity: 1,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: '15% top',
              end: '40% top',
              scrub: 1,
            }
          }
        )
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <LoadingScreen svg={<EventsSVG />}>
      <div className="events-page" ref={containerRef}>
        <div className="events-scroll-trigger" ref={scrollTriggerRef}>
          <div className="events-stage">
            <div className="events-bg">
              <img src={bg} alt="" />
            </div>

            {/* Heading Section */}
            <div
              ref={headingRef}
              className="events-heading-container"
              style={{
                position: 'absolute',
                top: '45%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                zIndex: 20
              }}
            >
              <h1 style={{ 
                fontFamily: "'Brush Script MT', cursive", 
                fontSize: 'clamp(3rem, 8vw, 6rem)',
                color: '#e4d5b7',
                textShadow: '0 0 20px rgba(0,0,0,0.8)'
              }}>
                Events
              </h1>
            </div>

            {/* Swords (Behind Dragons) */}
            <img ref={leftSwordRef} src={leftSword} className="event-asset sword-left" alt="" />
            <img ref={rightSwordRef} src={rightSword} className="event-asset sword-right" alt="" />

            {/* Dragons */}
            <div className="events-dragon events-dragon-left">
              <img ref={leftDragonRef} src={leftDragon} alt="" />
            </div>
            <div className="events-dragon events-dragon-right">
              <img ref={rightDragonRef} src={rightDragon} alt="" />
            </div>

            {/* Cards */}
            <div className="events-cards-wrap" ref={cardsWrapRef}>
              <EventCards events={ALL_EVENTS} />
            </div>
          </div>
        </div>
      </div>
    </LoadingScreen>
  )
}