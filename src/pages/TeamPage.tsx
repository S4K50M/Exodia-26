import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import bgLeft from '../assets/team/bg_left.png'
import bgRight from '../assets/team/bg_right.png'
import cloudLeft from '../assets/team/cloud_left.png'
import cloudRight from '../assets/team/cloud_right.png'
import cloudBLeft from '../assets/team/cloud_bleft.png'
import cloudBRight from '../assets/team/cloud_bright.png'

import { TeamCards } from '../components/TeamCards'

import '../styles/team.css'

gsap.registerPlugin(ScrollTrigger)

const TEAM_DATA = [
  { id: 1, name: 'Alex Chen', role: 'Lead Developer', bio: 'Full-stack wizard with a passion for clean code' },
  { id: 2, name: 'Sam Rivera', role: 'UI/UX Designer', bio: 'Crafting beautiful experiences that users love' },
  { id: 3, name: 'Jordan Lee', role: 'Backend Engineer', bio: 'Building scalable systems at lightning speed' },
  { id: 4, name: 'Casey Morgan', role: 'DevOps Lead', bio: 'Keeping everything running smoothly 24/7' },
  { id: 5, name: 'Taylor Kim', role: 'Product Manager', bio: 'Turning ideas into reality one sprint at a time' },
]

export function TeamPage() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollTriggerRef = useRef<HTMLDivElement | null>(null)
  const cloudTLRef = useRef<HTMLDivElement | null>(null)
  const cloudTRRef = useRef<HTMLDivElement | null>(null)
  const cloudBLRef = useRef<HTMLDivElement | null>(null)
  const cloudBRRef = useRef<HTMLDivElement | null>(null)
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
      // Clouds: scale down and move back on scroll
      const cloudRefs = [cloudTLRef, cloudTRRef, cloudBLRef, cloudBRRef]
      
      cloudRefs.forEach((ref) => {
        if (ref.current) {
          gsap.fromTo(
            ref.current,
            { scale: 1, z: 0 },
            {
              scale: 0.6,
              z: -200,
              ease: 'none',
              scrollTrigger: {
                trigger,
                start: 'top top',
                end: '30% top',
                scrub: 1.5,
              },
            }
          )
        }
      })

      // Cards: emerge from bottom after clouds shrink
      if (cardsWrapRef.current) {
        gsap.fromTo(
          cardsWrapRef.current,
          { yPercent: 50, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: '25% top',
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
    <div className="team-page" ref={containerRef}>
      <div className="team-scroll-trigger" ref={scrollTriggerRef}>
        <div className="team-stage">
          {/* Background - left and right concatenated */}
          <div className="team-bg">
            <div className="team-bg-left">
              <img src={bgLeft} alt="" />
            </div>
            <div className="team-bg-right">
              <img src={bgRight} alt="" />
            </div>
          </div>

          {/* Clouds at corners - shrink and move back */}
          <div className="team-cloud team-cloud-tl" ref={cloudTLRef}>
            <img src={cloudLeft} alt="" />
          </div>
          <div className="team-cloud team-cloud-tr" ref={cloudTRRef}>
            <img src={cloudRight} alt="" />
          </div>
          <div className="team-cloud team-cloud-bl" ref={cloudBLRef}>
            <img src={cloudBLeft} alt="" />
          </div>
          <div className="team-cloud team-cloud-br" ref={cloudBRRef}>
            <img src={cloudBRight} alt="" />
          </div>

          {/* Cards - appear from behind cloud_bright, exit behind cloud_bleft */}
          <div className="team-cards-wrap" ref={cardsWrapRef}>
            <TeamCards members={TEAM_DATA} />
          </div>
        </div>
      </div>
    </div>
  )
}
