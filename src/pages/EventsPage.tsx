import { useEffect, useRef, useState, useMemo } from 'react'
import type Lenis from 'lenis'
import { Search, Filter, X } from 'lucide-react'

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
import { loadGsap, loadLenis } from '../utils/lazyAnimations'

export function EventsPage() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollTriggerRef = useRef<HTMLDivElement | null>(null)
  const leftDragonRef = useRef<HTMLImageElement | null>(null)
  const rightDragonRef = useRef<HTMLImageElement | null>(null)
  const leftSwordRef = useRef<HTMLImageElement | null>(null)
  const rightSwordRef = useRef<HTMLImageElement | null>(null)
  const cardsWrapRef = useRef<HTMLDivElement | null>(null)
  const headingRef = useRef<HTMLDivElement | null>(null)

  const controlsRef = useRef<HTMLDivElement | null>(null)

  // 1. Filter & Search State
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('All')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // 2. Parse and format JSON Data
  const ALL_EVENTS = useMemo(() => {
    return Object.entries(EventsRaw.Exodia_2026_Events).flatMap(([key, arr]) => {
      const humanType = key
        .replace(/_/g, ' ')
        .replace(/Events?$/i, 'Event')
        .replace(/\b\w/g, (c) => c.toUpperCase())
      return (arr as any[])
        .map((e, i) => ({ raw: e, index: i }))
        .filter(({ raw }) => raw && raw.event_name) // Automatically ignores "General Rules" objects
        .map(({ raw, index }) => ({
          id: `${key}-${index}`,
          title: raw.event_name,
          desc: raw.description,
          date: raw.dates,
          rulebook: raw.rulebook_link,
          eventType: humanType,
        }))
    })
  }, [])

  // 3. Extract unique event types for the filter dropdown
  const eventTypes = useMemo(() => {
    const types = new Set(ALL_EVENTS.map(e => e.eventType))
    return ['All', ...Array.from(types)]
  }, [ALL_EVENTS])

  // 4. Compute the filtered list
  const filteredEvents = useMemo(() => {
    return ALL_EVENTS.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = activeFilter === 'All' || e.eventType === activeFilter
      return matchesSearch && matchesFilter
    })
  }, [ALL_EVENTS, searchTerm, activeFilter])


  useEffect(() => {
    let isCancelled = false
    let frameId: number | null = null
    let lenis: Lenis | null = null

    ;(async () => {
      const [{ ScrollTrigger }, LenisCtor] = await Promise.all([loadGsap(), loadLenis()])
      if (isCancelled) return

      lenis = new LenisCtor({ smoothWheel: true, lerp: 0.1 })
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
    }
  }, [])

  useEffect(() => {
    const trigger = scrollTriggerRef.current
    if (!trigger) return

    let isCancelled = false
    let ctx: { revert: () => void } | null = null

    ;(async () => {
      const { gsap } = await loadGsap()
      if (isCancelled) return

      ctx = gsap.context(() => {
        if (headingRef.current) {
          gsap.fromTo(
            headingRef.current,
            { opacity: 1, y: 0 },
            { opacity: 0, y: -100, ease: 'power1.inOut', scrollTrigger: { trigger, start: 'top top', end: '20% top', scrub: 1 } }
          )
        }
        gsap.to(leftSwordRef.current, { x: '-100%', opacity: 0, scrollTrigger: { trigger, start: 'top top', end: '30% top', scrub: 2 } })
        gsap.to(rightSwordRef.current, { x: '100%', opacity: 0, scrollTrigger: { trigger, start: 'top top', end: '30% top', scrub: 2 } })

        if (leftDragonRef.current) {
          gsap.to(leftDragonRef.current, { x: '-20%', y: '50%', rotate: -10, scrollTrigger: { trigger, start: 'top top', end: '50% top', scrub: 1.5 } })
        }
        if (rightDragonRef.current) {
          gsap.to(rightDragonRef.current, { x: '20%', y: '50%', rotate: 10, scrollTrigger: { trigger, start: 'top top', end: '50% top', scrub: 1.5 } })
        }

        if (controlsRef.current) {
          gsap.fromTo(
            controlsRef.current,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger, start: '15% top', end: '40% top', scrub: 1 } }
          )
        }

        if (cardsWrapRef.current) {
          gsap.fromTo(
            cardsWrapRef.current,
            { yPercent: 100, opacity: 0, scale: 0.9 },
            { yPercent: 0, opacity: 1, scale: 1, ease: 'none', scrollTrigger: { trigger, start: '15% top', end: '40% top', scrub: 1 } }
          )
        }
      }, containerRef)
    })()

    return () => {
      isCancelled = true
      ctx?.revert()
    }
  }, [])

  return (
    <LoadingScreen svg={<EventsSVG />}>
      <div className="events-page" ref={containerRef}>
        <div className="events-scroll-trigger" ref={scrollTriggerRef}>
          <div className="events-stage">
            <div className="events-bg">
              <img src={bg} alt="" loading="eager" decoding="async" />
            </div>

            {/* --- NEW: Search & Filter Controls --- */}
            <div className="events-controls" ref={controlsRef}>
              <div className="events-search-bar">
                <Search size={18} color="#fbbf24" />
                <input 
                  type="text" 
                  placeholder="Search events..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <X 
                    size={18} 
                    className="clear-icon" 
                    onClick={() => setSearchTerm('')} 
                  />
                )}
              </div>

              <div className="events-filter-wrap">
                <button 
                  className="events-filter-btn"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter size={18} />
                  <span>{activeFilter}</span>
                </button>

                {isFilterOpen && (
                  <div className="events-filter-dropdown">
                    {eventTypes.map(type => (
                      <button 
                        key={type} 
                        className={`filter-option ${activeFilter === type ? 'active' : ''}`}
                        onClick={() => {
                          setActiveFilter(type)
                          setIsFilterOpen(false)
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                color: '#ffd581',
                textShadow: '0 0 20px rgba(0,0,0,0.8)'
              }}>
                Events
              </h1>
            </div>

            <img ref={leftSwordRef} src={leftSword} className="event-asset sword-left" alt="" loading="eager" decoding="async" />
            <img ref={rightSwordRef} src={rightSword} className="event-asset sword-right" alt="" loading="eager" decoding="async" />

            <div className="events-dragon events-dragon-left">
              <img ref={leftDragonRef} src={leftDragon} alt="" loading="eager" decoding="async" />
            </div>
            <div className="events-dragon events-dragon-right">
              <img ref={rightDragonRef} src={rightDragon} alt="" loading="eager" decoding="async" />
            </div>

            {/* Cards Wrap */}
            <div className="events-cards-wrap font-serif" ref={cardsWrapRef}>
              {filteredEvents.length > 0 ? (
                // Important: Added a key so the carousel remounts and resets index when data length changes
                <EventCards key={`${activeFilter}-${searchTerm}`} events={filteredEvents} />
              ) : (
                <div className="no-events-message">
                  No events found.
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </LoadingScreen>
  )
}
