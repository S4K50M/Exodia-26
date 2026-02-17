import { useRef, useEffect, useState } from 'react'

interface Event {
  id: number
  title: string
  date: string
  desc: string
}

interface EventCardsProps {
  events: Event[]
}

// Parabolic path: right-bottom -> center (peak) -> left-bottom
// pathT: 0 = right-bottom, 0.5 = center, 1 = left-bottom
// Allow pathT outside 0-1 so cards enter from right and exit to left off-screen
function getParabolaPosition(pathT: number) {
  const x = 85 - 70 * pathT // 85% -> 15%, pathT>1 goes off left, pathT<0 off right
  const y = 35 + 200 * (pathT - 0.5) ** 2 // parabola: peak 35%, sides 85%
  return { x, y }
}

export function EventCards({ events }: EventCardsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const trigger = document.querySelector('.events-scroll-trigger')
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const scrollHeight = trigger.scrollHeight
      const viewHeight = window.innerHeight
      const totalScroll = scrollHeight - viewHeight
      if (totalScroll <= 0) {
        setScrollProgress(1)
        return
      }
      // Dragons exit in first 25%, cards phase starts at 20%
      // Card scroll: from 35% of trigger to 100% - so we map scroll to 0..1 for cards
      const rawProgress = Math.max(0, -rect.top / totalScroll)
      const cardPhaseStart = 0.35
      const cardPhaseEnd = 1
      const cardProgress = Math.max(0, Math.min(1, (rawProgress - cardPhaseStart) / (cardPhaseEnd - cardPhaseStart)))
      setScrollProgress(cardProgress)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const n = events.length
  
  // spacing controls how far apart cards are on the parabola
  const spacing = 0.3
  // initialOffset: shifts the start so card 0 begins at right edge (pathT~0) instead of center
  const initialOffset = 0.5 / spacing
  
  // At scroll 0: card 0 enters from right
  // At scroll 1: last card is centered
  const centerValue = scrollProgress * (n - 1 + initialOffset) - initialOffset
  const centerIndex = Math.round(centerValue)

  return (
    <div className="event-cards-container" ref={containerRef}>
      {events.map((event, index) => {
        // offset: how far this card is from being centered
        // 0 = centered, negative = needs to come from right, positive = already passed center
        const offset = centerValue - index
        
        // pathT: 0.5 = center, <0.5 = right side, >0.5 = left side
        const pathT = 0.5 + offset * spacing
        
        const pos = getParabolaPosition(pathT)
        const isCenter = index === centerIndex

        // Only show cards that are within reasonable range of the parabola
        const isVisible = pathT >= -0.2 && pathT <= 1.2
        
        // Fade in/out at edges
        let opacity = 1
        if (pathT < 0) opacity = Math.max(0, 1 + pathT / 0.2)
        else if (pathT > 1) opacity = Math.max(0, 1 - (pathT - 1) / 0.2)

        return (
          <div
            key={event.id}
            className={`event-card ${isCenter ? 'center' : ''}`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
              filter: isCenter ? 'blur(0)' : 'blur(10px)',
              opacity: isVisible ? opacity : 0,
              pointerEvents: isVisible ? 'auto' : 'none',
            }}
          >
            <div className="event-card-inner">
              <h3>{event.title}</h3>
              <span className="event-card-date">{event.date}</span>
              <p>{event.desc}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
