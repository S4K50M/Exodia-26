import { useRef, useEffect, useState } from 'react'

interface TeamMember {
  id: number
  name: string
  role: string
  bio: string
  image?: string
}

interface TeamCardsProps {
  members: TeamMember[]
}

// Define corner paths - each goes along an edge
// 0: top-left → top-right (along top edge)
// 1: top-right → bottom-right (along right edge)
// 2: bottom-right → bottom-left (along bottom edge)
// 3: bottom-left → top-left (along left edge)
const EDGE_PATHS = [
  { start: { x: 15, y: 15 }, end: { x: 85, y: 15 }, bulgeDir: { x: 0, y: 1 } },   // Top edge, bulge down
  { start: { x: 85, y: 15 }, end: { x: 85, y: 85 }, bulgeDir: { x: -1, y: 0 } },  // Right edge, bulge left
  { start: { x: 85, y: 85 }, end: { x: 15, y: 85 }, bulgeDir: { x: 0, y: -1 } },  // Bottom edge, bulge up
  { start: { x: 15, y: 85 }, end: { x: 15, y: 15 }, bulgeDir: { x: 1, y: 0 } },   // Left edge, bulge right
]

// Calculate semicircular path along edge
// t: 0 = start corner, 0.5 = center of edge, 1 = end corner
// cornerIndex: which edge path to use (0-3)
function getSemicirclePath(t: number, cornerIndex: number) {
  const path = EDGE_PATHS[cornerIndex]
  
  // Calculate angle for semicircle (0 to PI)
  const angle = t * Math.PI
  
  // Linear interpolation along the edge
  const linearX = path.start.x + (path.end.x - path.start.x) * t
  const linearY = path.start.y + (path.end.y - path.start.y) * t
  
  // Add semicircular bulge perpendicular to edge
  const bulgeMagnitude = Math.sin(angle) * 15 // Bulge amount
  const x = linearX + path.bulgeDir.x * bulgeMagnitude
  const y = linearY + path.bulgeDir.y * bulgeMagnitude
  
  return { x, y }
}

export function TeamCards({ members }: TeamCardsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const trigger = document.querySelector('.team-scroll-trigger')
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const scrollHeight = trigger.scrollHeight
      const viewHeight = window.innerHeight
      const totalScroll = scrollHeight - viewHeight
      if (totalScroll <= 0) {
        setScrollProgress(1)
        return
      }
      // Cards appear after clouds shrink (assume clouds animation is 0-30%)
      const rawProgress = Math.max(0, -rect.top / totalScroll)
      const cardPhaseStart = 0.3
      const cardPhaseEnd = 1
      const cardProgress = Math.max(
        0,
        Math.min(1, (rawProgress - cardPhaseStart) / (cardPhaseEnd - cardPhaseStart))
      )
      setScrollProgress(cardProgress)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const n = members.length

  // Slower endless loop
  const cycles = 1.5 // Lower value = slower movement
  const totalProgress = (scrollProgress * cycles) % 1
  
  // Spacing between cards - lower value means cards are closer together
  const cardSpacing = 0.25 // Each card starts when previous is 25% through its journey

  return (
    <div className="team-cards-container" ref={containerRef}>
      {members.map((member, index) => {
        // Calculate progress for this specific card
        const cardStartOffset = index * cardSpacing
        const rawProgress = totalProgress - cardStartOffset
        
        // Wrap progress to create endless loop
        const cardProgress = ((rawProgress % 1) + 1) % 1
        
        // Only show card when it's in the active portion of its cycle
        const isVisible = cardProgress >= 0 && cardProgress <= 1
        
        // Determine which edge this card travels along (cycles through 4 edges)
        const cornerIndex = index % 4
        
        if (!isVisible) {
          return (
            <div
              key={member.id}
              className="team-card"
              style={{ opacity: 0, pointerEvents: 'none' }}
            />
          )
        }

        // Calculate position on semicircular path along edge
        const pos = getSemicirclePath(cardProgress, cornerIndex)
        
        // Card is centered when cardProgress is around 0.5
        const isCenter = cardProgress > 0.45 && cardProgress < 0.55
        
        // Fade in at start, fade out at end
        let opacity = 1
        if (cardProgress < 0.1) opacity = cardProgress / 0.1
        else if (cardProgress > 0.9) opacity = (1 - cardProgress) / 0.1

        // Scale up when centered - smooth transition
        let scale = 1
        if (cardProgress >= 0.4 && cardProgress <= 0.6) {
          // Create smooth scale curve: peaks at 0.5
          const centerDist = Math.abs(cardProgress - 0.5)
          scale = 1 + (1 - centerDist / 0.1) * 0.3 // Scale up to 1.3x at center
        }

        return (
          <div
            key={member.id}
            className={`team-card ${isCenter ? 'center' : ''}`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              filter: isCenter ? 'blur(0)' : 'blur(5px)',
              opacity,
              pointerEvents: 'auto',
            }}
          >
            {member.image && (
              <div className="team-card-img">
                <img src={member.image} alt={member.name} />
              </div>
            )}
            <div className="team-card-inner">
              <h3>{member.name}</h3>
              <span className="team-card-role">{member.role}</span>
              <p>{member.bio}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
