import { useRef, useEffect, useState, useCallback } from 'react'
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

const CARD_WIDTH = 280
const CARD_HEIGHT = 140
const STEP = CARD_WIDTH + 36           // horizontal gap between card centres
const ARC_DIP = -350                    // px the centre card sits BELOW side cards
const VISIBLE = 4                      // rendered slots each side
const TWEEN_DURATION = 0.62
const SCROLL_COOLDOWN_MS = 650

// --- arc helpers ---------------------------------------------------------------
// offset=0 → y=0 (bottom), offset=±VISIBLE → y=-ARC_DIP (top)
function arcY(offset: number): number {
  const t = Math.min(Math.abs(offset), VISIBLE) / VISIBLE
  return -ARC_DIP * Math.sin(t * (Math.PI / 2))
}
function arcX(offset: number): number { return offset * STEP }
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
  // triple the array for seamless infinite buffering
  const extEvents = [...events, ...events, ...events]

  const [currentIndex, setCurrentIndex] = useState(n)   // start in middle copy
  const currentIndexRef = useRef(n)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const lastWheelTime = useRef(0)
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  useEffect(() => { currentIndexRef.current = currentIndex }, [currentIndex])

  // helper: snap all card transforms instantly (no tween) for a given centreIdx
  const snapAll = useCallback((centreIdx: number) => {
    cardRefs.current.forEach((el, i) => {
      if (!el) return
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
    })
  }, [])

  // set initial positions instantly on mount
  useEffect(() => { snapAll(currentIndex) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // tween all cards to their new arc positions when index changes
  useEffect(() => {
    cardRefs.current.forEach((el, i) => {
      if (!el) return
      const offset = i - currentIndex
      const abs = Math.abs(offset)
      const visible = abs <= VISIBLE + 1
      gsap.set(el, { display: visible ? 'block' : 'none', zIndex: 20 - abs })
      if (!visible) return
      gsap.to(el, {
        x: arcX(offset),
        y: arcY(offset),
        scale: arcScale(offset),
        opacity: arcOpacity(offset),
        filter: `blur(${arcBlur(offset)}px)`,
        duration: TWEEN_DURATION,
        ease: 'power2.inOut',
        overwrite: 'auto',
      })
    })
  }, [currentIndex])

  // infinite-loop: silently jump back to middle copy after tween finishes
  useEffect(() => {
    if (currentIndex < n) {
      const t = setTimeout(() => {
        const next = currentIndex + n
        currentIndexRef.current = next
        setCurrentIndex(next)
        snapAll(next)
      }, TWEEN_DURATION * 1000 + 60)
      return () => clearTimeout(t)
    }
    if (currentIndex >= n * 2) {
      const t = setTimeout(() => {
        const next = currentIndex - n
        currentIndexRef.current = next
        setCurrentIndex(next)
        snapAll(next)
      }, TWEEN_DURATION * 1000 + 60)
      return () => clearTimeout(t)
    }
  }, [currentIndex, n, snapAll])

  const goNext = useCallback(() => setCurrentIndex((i) => i + 1), [])
  const goPrev = useCallback(() => setCurrentIndex((i) => i - 1), [])

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

  // close with Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIdx(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="events-carousel">
      <button type="button" className="events-carousel-btn events-carousel-btn-left" onClick={goPrev} aria-label="Previous event" />
      <button type="button" className="events-carousel-btn events-carousel-btn-right" onClick={goNext} aria-label="Next event" />

      <div ref={viewportRef} className="events-carousel-viewport">
        {/* arc-stage: cards are absolutely centred here; GSAP moves them */}
        <div className="events-carousel-arc-stage">
          {extEvents.map((event, index) => (
            <div
              key={`${event.id}-${index}`}
              ref={(el) => { cardRefs.current[index] = el }}
              className="event-card events-carousel-card"
              data-offset={index - currentIndex}
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                position: 'absolute',
                top: '40%',
                left: '50%',
                marginLeft: -(CARD_WIDTH / 2),
                marginTop: -(CARD_HEIGHT / 2),
              }}
              onClick={() => setOpenIdx(index)}
            >
              <div className="event-card-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <h3 style={{ textAlign: 'center', padding: '0 1rem' }}>{event.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Details overlay (click a card to open) */}
      {openIdx !== null && extEvents[openIdx] && (
        <div className="event-details-overlay" onClick={() => setOpenIdx(null)}>
          <div className="event-details-modal" onClick={(e) => e.stopPropagation()}>
            
            <button onClick={() => setOpenIdx(null)} aria-label="Close" style={{ position: 'absolute', top: '3rem', right: '3rem', background: 'transparent', border: 'none', color: '#fbbf24', fontSize: '2.5rem', cursor: 'pointer', transition: 'transform 0.2s' }}>✕</button>
            
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#e4d5b7', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 0 20px rgba(251,191,36,0.4)' }}>
              {extEvents[openIdx].title}
            </h2>
            
            <p style={{ color: 'rgba(200,230,250,0.9)', fontSize: '1.25rem', maxWidth: '800px', lineHeight: '1.6', margin: '0 0 2.5rem 0' }}>
              {extEvents[openIdx].desc}
            </p>
            
            <div style={{ display: 'flex', gap: '3rem', marginBottom: '3.5rem', justifyContent: 'center' }}>
              <p style={{ margin: 0, color: 'rgba(140,220,255,1)', fontSize: '1.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Dates: <span style={{ fontWeight: 400, color: '#e4d5b7' }}>{extEvents[openIdx].date}</span>
              </p>
              <p style={{ margin: 0, color: 'rgba(140,220,255,1)', fontSize: '1.2rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Type: <span style={{ fontWeight: 400, color: '#e4d5b7' }}>{extEvents[openIdx].eventType}</span>
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
              {extEvents[openIdx].rulebook && (
                <a href={extEvents[openIdx].rulebook} target="_blank" rel="noopener noreferrer">
                  <button style={{ background: '#e4d5b7', border: 'none', padding: '0.8rem 2.5rem', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 20px rgba(253, 247, 232, 0.4)' }}>
                    Open Rulebook
                  </button>
                </a>
              )}
              <button onClick={() => setOpenIdx(null)} style={{ background: 'rgba(207, 248, 255, 0.4)', color: '#e4d5b7', border: '2px solid #e4d5b7', padding: '0.8rem 2.5rem', borderRadius: '50px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', backdropFilter: 'blur(5px)' }}>
                Close
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  )
}
