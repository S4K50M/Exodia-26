import { useEffect, useRef, useState, useMemo } from 'react'
import { Search, Filter, X } from 'lucide-react'

import bg from '../assets/events/bg.webp'
import leftDragon from '../assets/events/left_dragon.webp'
import rightDragon from '../assets/events/right_dragon.webp'
import leftSword from '../assets/events/left_sword.webp'
import rightSword from '../assets/events/right_sword.webp'

import { EventCards } from '../components/EventCards'
import EventsRaw from '../data/events.json'
import '../styles/events.css'

import { LoadingScreen } from '../components/LoadingScreen'
import { EventsSVG } from '../assets/loading/EventsSVG'
import { useLenisScroll } from '../utils/useLenisScroll'

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
  const filterWrapRef = useRef<HTMLDivElement | null>(null)

  const shouldAnimate = useMemo(() => {
    if (typeof window === 'undefined') return false

    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduceMotion) return false

    const connection = (navigator as any).connection
    const saveData = connection?.saveData === true
    const effectiveType = String(connection?.effectiveType ?? '')
    const slowNetwork = /(^|-)2g$/.test(effectiveType) || effectiveType === 'slow-2g'

    return !saveData && !slowNetwork
  }, [])

  useLenisScroll({ smoothWheel: true, lerp: 0.1 }, shouldAnimate)

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
    if (!shouldAnimate) return

    const trigger = scrollTriggerRef.current
    if (!trigger) return

    let cancelled = false
    let ctx: any = null

    ;(async () => {
      try {
        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
        ])

        if (cancelled) return

        gsap.registerPlugin(ScrollTrigger)

        ctx = gsap.context(() => {
          if (headingRef.current) {
            gsap.fromTo(
              headingRef.current,
              { opacity: 1, y: 0 },
              {
                opacity: 0,
                y: -100,
                ease: 'power1.inOut',
                scrollTrigger: { trigger, start: 'top top', end: '20% top', scrub: 1 },
              }
            )
          }

          if (leftSwordRef.current) {
            gsap.to(leftSwordRef.current, {
              x: '-100%',
              opacity: 0,
              scrollTrigger: { trigger, start: 'top top', end: '30% top', scrub: 2 },
            })
          }

          if (rightSwordRef.current) {
            gsap.to(rightSwordRef.current, {
              x: '100%',
              opacity: 0,
              scrollTrigger: { trigger, start: 'top top', end: '30% top', scrub: 2 },
            })
          }

          if (leftDragonRef.current) {
            gsap.to(leftDragonRef.current, {
              x: '-20%',
              y: '50%',
              rotate: -10,
              scrollTrigger: { trigger, start: 'top top', end: '50% top', scrub: 1.5 },
            })
          }
          if (rightDragonRef.current) {
            gsap.to(rightDragonRef.current, {
              x: '20%',
              y: '50%',
              rotate: 10,
              scrollTrigger: { trigger, start: 'top top', end: '50% top', scrub: 1.5 },
            })
          }

          if (controlsRef.current) {
            gsap.fromTo(
              controlsRef.current,
              { y: 50, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                ease: 'none',
                scrollTrigger: { trigger, start: '15% top', end: '40% top', scrub: 1 },
              }
            )
          }

          if (cardsWrapRef.current) {
            gsap.fromTo(
              cardsWrapRef.current,
              { yPercent: 100, opacity: 0, scale: 0.9 },
              {
                yPercent: 0,
                opacity: 1,
                scale: 1,
                ease: 'none',
                scrollTrigger: { trigger, start: '15% top', end: '40% top', scrub: 1 },
              }
            )
          }
        }, containerRef)
      } catch {
        // Ignore dynamic import failures
      }
    })()

    return () => {
      cancelled = true
      ctx?.revert()
      ctx = null
    }
  }, [shouldAnimate])

  useEffect(() => {
    if (!isFilterOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFilterOpen(false)
    }

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (!filterWrapRef.current) return
      if (filterWrapRef.current.contains(target)) return
      setIsFilterOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [isFilterOpen])

  const loadingAssets = [bg]

  return (
    <LoadingScreen
      svg={<EventsSVG />}
      assets={loadingAssets}
    >
      <div className={`events-page${shouldAnimate ? '' : ' events-static'}`} ref={containerRef}>
        <div className="events-scroll-trigger" ref={scrollTriggerRef}>
          <div className="events-stage">
            <div className="events-bg">
              <img src={bg} alt="" decoding="async" fetchPriority="high" />
            </div>

            {/* --- NEW: Search & Filter Controls --- */}
            <div className="events-controls" ref={controlsRef}>
              <div className="events-search-bar">
                <Search size={18} color="#fbbf24" />
                <input 
                  type="text" 
                  aria-label="Search events"
                  placeholder="Search events..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="events-search-clear"
                    onClick={() => setSearchTerm('')}
                    aria-label="Clear search"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="events-filter-wrap" ref={filterWrapRef}>
                <button 
                  className="events-filter-btn"
                  type="button"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  aria-haspopup="menu"
                  aria-expanded={isFilterOpen}
                  aria-controls="events-filter-menu"
                >
                  <Filter size={18} />
                  <span>{activeFilter}</span>
                </button>

                {isFilterOpen && (
                  <div
                    id="events-filter-menu"
                    className="events-filter-dropdown"
                    role="menu"
                    aria-label="Event type filter"
                  >
                    {eventTypes.map(type => (
                      <button 
                        type="button"
                        key={type} 
                        role="menuitemradio"
                        aria-checked={activeFilter === type}
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
            {shouldAnimate && (
              <div
                ref={headingRef}
                className="events-heading-container"
                style={{
                  position: 'absolute',
                  top: '45%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  zIndex: 20,
                }}
              >
                <h1
                  style={{
                    fontFamily: "'Brush Script MT', cursive",
                    fontSize: 'clamp(3rem, 8vw, 6rem)',
                    color: '#e4d5b7',
                    textShadow: '0 0 20px rgba(0,0,0,0.8)',
                  }}
                >
                  Events
                </h1>
              </div>
            )}

            {shouldAnimate && (
              <>
                <img
                  ref={leftSwordRef}
                  src={leftSword}
                  className="event-asset sword-left"
                  alt=""
                  decoding="async"
                  fetchPriority="low"
                />
                <img
                  ref={rightSwordRef}
                  src={rightSword}
                  className="event-asset sword-right"
                  alt=""
                  decoding="async"
                  fetchPriority="low"
                />

                <div className="events-dragon events-dragon-left">
                  <img ref={leftDragonRef} src={leftDragon} alt="" decoding="async" fetchPriority="low" />
                </div>
                <div className="events-dragon events-dragon-right">
                  <img ref={rightDragonRef} src={rightDragon} alt="" decoding="async" fetchPriority="low" />
                </div>
              </>
            )}

            {/* Cards Wrap */}
            <div className="events-cards-wrap" ref={cardsWrapRef}>
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
