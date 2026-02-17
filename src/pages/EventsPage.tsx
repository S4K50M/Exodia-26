import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import bg from '../assets/events/bg.png'
import leftDragon from '../assets/events/left_dragon.png'
import rightDragon from '../assets/events/right_dragon.png'

import { EventCards } from '../components/EventCards'

import '../styles/events.css'

gsap.registerPlugin(ScrollTrigger)

const EVENT_DATA = [
  { id: 1, title: 'Tech Talk', date: 'March 15', desc: 'Deep dive into modern web' },
  { id: 2, title: 'Hackathon', date: 'April 22', desc: '48-hour build challenge' },
  { id: 3, title: 'Workshop', date: 'May 10', desc: 'Hands-on learning session' },
  { id: 4, title: 'Meetup', date: 'June 5', desc: 'Community gathering' },
  { id: 5, title: 'Demo Day', date: 'July 20', desc: 'Showcase your projects' },
]

export function EventsPage() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollTriggerRef = useRef<HTMLDivElement | null>(null)
  const leftDragonRef = useRef<HTMLImageElement | null>(null)
  const rightDragonRef = useRef<HTMLImageElement | null>(null)
  const cardsWrapRef = useRef<HTMLDivElement | null>(null)

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

    const ctx = gsap.context(() => {
      // dragons: move up out of screen only (no scaling)
      if (leftDragonRef.current) {
        gsap.fromTo(
          leftDragonRef.current,
          { y: 0 },
          {
            y: '-180%',
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: 'top top',
              end: '25% top',
              scrub: 1.5,
            },
          }
        )
      }
      if (rightDragonRef.current) {
        gsap.fromTo(
          rightDragonRef.current,
          { y: 0 },
          {
            y: '-180%',
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: 'top top',
              end: '25% top',
              scrub: 1.5,
            },
          }
        )
      }

      // cards: emerge from bottom when dragons are gone
      if (cardsWrapRef.current) {
        gsap.fromTo(
          cardsWrapRef.current,
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: '20% top',
              end: '35% top',
              scrub: 1,
            },
          }
        )
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="events-page" ref={containerRef}>
      <div className="events-scroll-trigger" ref={scrollTriggerRef}>
        <div className="events-stage">
          {/* static bg - no animation */}
          <div className="events-bg">
            <img src={bg} alt="" />
          </div>

          {/* dragons - bottom corners, animate up and shrink */}
          <div className="events-dragon events-dragon-left">
            <img
              ref={leftDragonRef}
              src={leftDragon}
              alt=""
            />
          </div>
          <div className="events-dragon events-dragon-right">
            <img
              ref={rightDragonRef}
              src={rightDragon}
              alt=""
            />
          </div>

          {/* cards - emerge from below, parabolic path, magnetic */}
          <div className="events-cards-wrap" ref={cardsWrapRef}>
            <EventCards events={EVENT_DATA} />
          </div>
        </div>
      </div>
    </div>
  )
}
