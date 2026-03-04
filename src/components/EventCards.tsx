import { useRef, useEffect, useState, useCallback, useLayoutEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'

export interface Event {
  id: string | number
  title: string
  desc?: string
  date?: string
  rulebook?: string
  eventType?: string
}

interface EventCardsProps {
  events: Event[]
}

const VISIBLE = 4 // rendered slots each side
const TWEEN_DURATION = 0.62
const SCROLL_COOLDOWN_MS = 650
const RENDER_RADIUS = VISIBLE + 2

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(query)
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)

    if (mql.addEventListener) mql.addEventListener('change', onChange)
    else mql.addListener(onChange)

    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange)
      else mql.removeListener(onChange)
    }
  }, [query])

  return matches
}

// --- arc helpers ---------------------------------------------------------------
// offset=0 → y=0 (centre), offset=±VISIBLE → y=max (outer)
function arcScale(offset: number): number {
  const a = Math.abs(offset)
  if (a === 0) return 1.45
  if (a === 1) return 0.82
  if (a === 2) return 0.62
  if (a === 3) return 0.48
  return 0.38
}
function arcOpacity(offset: number): number {
  const a = Math.abs(offset)
  if (a === 0) return 1
  if (a === 1) return 0.9
  if (a === 2) return 0.6
  if (a === 3) return 0.35
  return 0.15
}
function arcBlur(offset: number): number {
  const a = Math.abs(offset)
  if (a <= 1) return 0
  if (a === 2) return 3
  if (a === 3) return 7
  return 12
}
// -------------------------------------------------------------------------------

export function EventCards({ events }: EventCardsProps) {
  const n = events.length
  const enableVirtual = n > RENDER_RADIUS * 2 + 1
  const isMobile = useMediaQuery('(max-width: 720px)')
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const cardWidth = isMobile ? 160 : 280
  const cardHeight = isMobile ? 90 : 140
  const step = cardWidth + (isMobile ? 20 : 36) // horizontal gap between card centres
  const arcDip = isMobile ? 200 : 350 // px the outer cards sit BELOW centre
  const tweenDuration = reduceMotion ? 0 : TWEEN_DURATION

  // triple the array for seamless infinite buffering
  const extEvents = useMemo(() => [...events, ...events, ...events], [events])

  const [currentIndex, setCurrentIndex] = useState(n)   // start in middle copy
  const currentIndexRef = useRef(n)
  const cardRefs = useRef(new Map<number, HTMLDivElement>())
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const lastWheelTime = useRef(0)
  const lastSwipeTime = useRef(0)
  const touchStartX = useRef(0)
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  useEffect(() => { currentIndexRef.current = currentIndex }, [currentIndex])

  const arcX = useCallback((offset: number): number => offset * step, [step])
  const arcY = useCallback(
    (offset: number): number => {
      const t = Math.min(Math.abs(offset), VISIBLE) / VISIBLE
      return arcDip * Math.sin(t * (Math.PI / 2))
    },
    [arcDip]
  )

  // helper: snap all card transforms instantly (no tween) for a given centreIdx
  const snapAll = useCallback((centreIdx: number) => {
    for (const [i, el] of cardRefs.current) {
      const offset = i - centreIdx
      const abs = Math.abs(offset)
      gsap.set(el, {
        display: abs <= VISIBLE + 1 ? 'block' : 'none',
        x: arcX(offset),
        y: arcY(offset),
        scale: arcScale(offset),
        opacity: arcOpacity(offset),
        filter: `blur(${arcBlur(offset)}px)`,
        zIndex: 20 - abs,
      })
    }
  }, [arcX, arcY])

  const setCardRef = useCallback(
    (index: number, el: HTMLDivElement | null) => {
      if (!el) {
        cardRefs.current.delete(index)
        return
      }
      cardRefs.current.set(index, el)
      const offset = index - currentIndexRef.current
      const abs = Math.abs(offset)
      gsap.set(el, {
        display: abs <= VISIBLE + 1 ? 'block' : 'none',
        x: arcX(offset),
        y: arcY(offset),
        scale: arcScale(offset),
        opacity: arcOpacity(offset),
        filter: `blur(${arcBlur(offset)}px)`,
        zIndex: 20 - abs,
      })
    },
    [arcX, arcY]
  )

  // set initial positions instantly on mount
  useLayoutEffect(() => {
    snapAll(currentIndexRef.current)
  }, [snapAll])

  // tween all cards to their new arc positions when index changes
  useEffect(() => {
    for (const [i, el] of cardRefs.current) {
      const offset = i - currentIndex
      const abs = Math.abs(offset)
      const visible = abs <= VISIBLE + 1
      gsap.set(el, { display: visible ? 'block' : 'none', zIndex: 20 - abs })
      if (!visible) continue

      if (reduceMotion) {
        gsap.set(el, {
          x: arcX(offset),
          y: arcY(offset),
          scale: arcScale(offset),
          opacity: arcOpacity(offset),
          filter: `blur(${arcBlur(offset)}px)`,
        })
        continue
      }

      gsap.to(el, {
        x: arcX(offset),
        y: arcY(offset),
        scale: arcScale(offset),
        opacity: arcOpacity(offset),
        filter: `blur(${arcBlur(offset)}px)`,
        duration: tweenDuration,
        ease: 'power2.inOut',
        overwrite: 'auto',
      })
    }
  }, [arcX, arcY, currentIndex, reduceMotion, tweenDuration])

  // infinite-loop: silently jump back to middle copy after tween finishes
  useEffect(() => {
    if (currentIndex < n) {
      const t = setTimeout(() => {
        const next = currentIndex + n
        currentIndexRef.current = next
        setCurrentIndex(next)
        if (!enableVirtual) snapAll(next)
      }, tweenDuration * 1000 + 60)
      return () => clearTimeout(t)
    }
    if (currentIndex >= n * 2) {
      const t = setTimeout(() => {
        const next = currentIndex - n
        currentIndexRef.current = next
        setCurrentIndex(next)
        if (!enableVirtual) snapAll(next)
      }, tweenDuration * 1000 + 60)
      return () => clearTimeout(t)
    }
  }, [currentIndex, enableVirtual, n, snapAll, tweenDuration])

  const goNext = useCallback(() => {
    setCurrentIndex((i) => {
      const next = i + 1
      currentIndexRef.current = next
      return next
    })
  }, [])
  const goPrev = useCallback(() => {
    setCurrentIndex((i) => {
      const next = i - 1
      currentIndexRef.current = next
      return next
    })
  }, [])

  useEffect(() => {
    // Pause auto-scroll if the details modal is open
    if (openIdx !== null) return
    if (reduceMotion) return

    const autoPlay = setInterval(() => {
      goNext()
    }, 5000)

    // Cleanup interval on unmount or when modal opens
    return () => clearInterval(autoPlay)
  }, [goNext, openIdx, reduceMotion])
  
  // scroll down → next card
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY <= 0) return
      e.preventDefault()
      const now = Date.now()
      if (now - lastWheelTime.current < SCROLL_COOLDOWN_MS) return
      lastWheelTime.current = now
      goNext()
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [goNext])

  // swipe left/right → navigate carousel on mobile
  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
    }
    const onTouchEnd = (e: TouchEvent) => {
      const delta = touchStartX.current - e.changedTouches[0].clientX
      if (Math.abs(delta) < 40) return   // too small — treat as tap, not swipe
      const now = Date.now()
      if (now - lastSwipeTime.current < SCROLL_COOLDOWN_MS) return
      lastSwipeTime.current = now
      if (delta > 0) goNext()
      else goPrev()
    }
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [goNext, goPrev])

  // close with Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIdx(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const indicesToRender = useMemo(() => {
    const total = extEvents.length

    if (!enableVirtual) {
      const all: number[] = []
      for (let i = 0; i < total; i++) all.push(i)
      return all
    }

    const start = Math.max(0, currentIndex - RENDER_RADIUS)
    const end = Math.min(total - 1, currentIndex + RENDER_RADIUS)
    const windowed: number[] = []
    for (let i = start; i <= end; i++) windowed.push(i)
    return windowed
  }, [currentIndex, extEvents.length, n])

  return (
    <div className="events-carousel">
      <button type="button" className="events-carousel-btn events-carousel-btn-left" onClick={goPrev} aria-label="Previous event" />
      <button type="button" className="events-carousel-btn events-carousel-btn-right" onClick={goNext} aria-label="Next event" />

      <div ref={viewportRef} className="events-carousel-viewport">
        {/* arc-stage: cards are absolutely centred here; GSAP moves them */}
        <div className="events-carousel-arc-stage">
          {indicesToRender.map((index) => {
            const event = extEvents[index]
            if (!event) return null
            return (
              <div
                key={`${event.id}-${index}`}
                ref={(el) => setCardRef(index, el)}
                className="event-card events-carousel-card"
                data-offset={index - currentIndex}
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginLeft: -(cardWidth / 2),
                  marginTop: -(cardHeight / 2),
                }}
                onClick={() => setOpenIdx(index)}
              >
                <div
                  className="event-card-inner"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                  }}
                >
                  <h3 style={{ textAlign: 'center', padding: '0 1rem' }}>
                    {event.title}
                  </h3>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {/* Details overlay — rendered via portal so it escapes GSAP-transformed ancestors */}
      {openIdx !== null && extEvents[openIdx] && createPortal(
          <div className="event-details-overlay" onClick={() => setOpenIdx(null)}>
          <div className="event-details-modal" onClick={(e) => e.stopPropagation()}>
            
            <button
              type="button"
              onClick={() => setOpenIdx(null)}
              aria-label="Close"
              className="event-modal-close"
            >
              ✕
            </button>
            
            <h2 className="event-modal-title">
              {extEvents[openIdx].title}
            </h2>
            
            {extEvents[openIdx].desc && (
              <p className="event-modal-desc">{extEvents[openIdx].desc}</p>
            )}
            
            <div className="event-modal-meta">
              <p className="event-modal-pill">
                Dates: <span>{extEvents[openIdx].date ?? 'TBA'}</span>
              </p>
              <p className="event-modal-pill">
                Type: <span>{extEvents[openIdx].eventType ?? 'Event'}</span>
              </p>
            </div>
                        
            <div className="event-modal-actions">
              {extEvents[openIdx].rulebook && (
                <a href={extEvents[openIdx].rulebook} target="_blank" rel="noopener noreferrer">
                  <button className="event-modal-btn-primary">
                    Open Rulebook
                  </button>
                </a>
              )}
              <button type="button" onClick={() => setOpenIdx(null)} className="event-modal-btn-secondary">
                Close
              </button>
            </div>
            
          </div>
        </div>
      , document.body)}
    </div>
  )
}
