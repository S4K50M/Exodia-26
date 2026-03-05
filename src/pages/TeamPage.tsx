import { useEffect, useRef, useState } from 'react'
import type Lenis from 'lenis'

import bgLeft from '../assets/team/bg_left.png'
import bgRight from '../assets/team/bg_right.png'
import cloudLeft from '../assets/team/cloud_left.png'
import cloudRight from '../assets/team/cloud_right.png'
import cloudBLeft from '../assets/team/cloud_bleft.png'
import cloudBRight from '../assets/team/cloud_bright.png'
import { TEAM_SECTIONS } from '../data/team'
import '../styles/team.css'

import { LoadingScreen } from '../components/LoadingScreen'
import { TeamSVG } from '../assets/loading/TeamSVG'
import { loadGsap, loadLenis } from '../utils/lazyAnimations'

// ── Team data organised by position ──────────────────────────────────────────
interface TeamMember {
  id: number
  name: string
  role: string
  bio: string
  image?: string
  instagram?: string
  linkedin?: string
}


// Helper: convert Google Drive share link to direct thumbnail URL

export function TeamPage() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null) 
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollTriggerRef = useRef<HTMLDivElement | null>(null)
  const cloudTLRef = useRef<HTMLDivElement | null>(null)
  const cloudTRRef = useRef<HTMLDivElement | null>(null)
  const cloudBLRef = useRef<HTMLDivElement | null>(null)
  const cloudBRRef = useRef<HTMLDivElement | null>(null)
  const sectionsRef = useRef<HTMLDivElement | null>(null)
  const lenisRef = useRef<Lenis | null>(null)

  const openMember = (member: TeamMember) => {
    lenisRef.current?.stop()
    setSelectedMember(member)
  }

  const closeMember = () => {
    setSelectedMember(null)
    lenisRef.current?.start()
  }

  // ── Lenis smooth scroll ────────────────────────────────────────────────────
  useEffect(() => {
    let isCancelled = false
    let frameId: number | null = null
    let lenis: Lenis | null = null

    ;(async () => {
      const [{ ScrollTrigger }, LenisCtor] = await Promise.all([loadGsap(), loadLenis()])
      if (isCancelled) return

      lenis = new LenisCtor({ smoothWheel: true, lerp: 0.1 })
      lenisRef.current = lenis
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
      lenisRef.current = null
    }
  }, [])

  // ── Animations ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const trigger = scrollTriggerRef.current
    if (!trigger) return

    let isCancelled = false
    let ctx: { revert: () => void } | null = null

    ;(async () => {
      const { gsap } = await loadGsap()
      if (isCancelled) return

      ctx = gsap.context(() => {
        // Clouds recede on scroll
        const cloudRefs = [cloudTLRef, cloudTRRef, cloudBLRef, cloudBRRef]
        cloudRefs.forEach((ref) => {
          if (ref.current) {
            gsap.fromTo(
              ref.current,
              { scale: 1, opacity: 1 },
              {
                scale: 0.5,
                opacity: 0,
                ease: 'none',
                scrollTrigger: { trigger, start: 'top top', end: '15% top', scrub: 1.5 },
              }
            )
          }
        })

        // Animate each section as it enters the viewport
        const sectionEls = sectionsRef.current?.querySelectorAll('.team-section')
        sectionEls?.forEach((section) => {
          // Section title
          const title = section.querySelector('.team-section-title')
          if (title) {
            gsap.fromTo(
              title,
              { y: 40, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: { trigger: section, start: 'top 85%', toggleActions: 'play none none reverse' },
              }
            )
          }

          // Member cards stagger in
          const cards = section.querySelectorAll('.team-member-card')
          if (cards.length) {
            gsap.fromTo(
              cards,
              { y: 60, opacity: 0, scale: 0.9 },
              {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.6,
                ease: 'back.out(1.4)',
                stagger: 0.12,
                scrollTrigger: { trigger: section, start: 'top 80%', toggleActions: 'play none none reverse' },
              }
            )
          }
        })
      }, containerRef)
    })()

    return () => {
      isCancelled = true
      ctx?.revert()
    }
  }, [])

  return (
    <LoadingScreen svg={<TeamSVG />}>
    <div className="team-page" ref={containerRef}>
      <div className="team-scroll-trigger" ref={scrollTriggerRef}>
        {/* ── Sticky hero with background & clouds ── */}
        <div className="team-stage">
            <div className="team-bg">
            <div className="team-bg-left"><img src={bgLeft} alt="" loading="eager" decoding="async" /></div>
            <div className="team-bg-right"><img src={bgRight} alt="" loading="eager" decoding="async" /></div>
          </div>

          <div className="team-cloud team-cloud-tl" ref={cloudTLRef}><img src={cloudLeft} alt="" loading="eager" decoding="async" /></div>
          <div className="team-cloud team-cloud-tr" ref={cloudTRRef}><img src={cloudRight} alt="" loading="eager" decoding="async" /></div>
          <div className="team-cloud team-cloud-bl" ref={cloudBLRef}><img src={cloudBLeft} alt="" loading="eager" decoding="async" /></div>
          <div className="team-cloud team-cloud-br" ref={cloudBRRef}><img src={cloudBRight} alt="" loading="eager" decoding="async" /></div>

          {/* Hero title */}
          <div className="team-hero-title">
            <h1>Our Team</h1>
            <p>The people behind Exodia&apos;26</p>
          </div>
        </div>

        {/* ── Sections (scroll naturally below sticky hero) ── */}
        <div className="team-sections" ref={sectionsRef}>
          {TEAM_SECTIONS.map((section) => (
            <div key={section.title} className="team-section">
              <h2 className="team-section-title">{section.title}</h2>
              <div className="team-section-grid">
                {section.members.map((member) => (
                  <div key={member.id} className="team-member-card" onClick={() => openMember(member)}>
                    <div className="team-member-avatar">
                      {member.image ? (
                        <img src={member.image} alt={member.name} loading="lazy" decoding="async" />
                      ) : (
                        <div className="team-member-avatar-placeholder">
                          {member.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                      )}
                    </div>
                    <h3 className="team-member-name">{member.name}</h3>
                    <span className="team-member-role">{member.role}</span>
                    <p className="team-member-bio">{member.bio}</p>
                    <div className="team-member-socials">
                      {member.instagram && (
                        <a href={member.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="team-social-link">
                          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                          </svg>
                        </a>
                      )}
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="team-social-link">
                          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMember && (
          <div 
            className="team-modal-overlay" 
            onClick={closeMember}
            onWheel={(e) => e.stopPropagation()} 
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="team-modal-card" onClick={(e) => e.stopPropagation()}>
              <button className="team-modal-close" onClick={closeMember}>
                &times;
              </button>
              
              <div className="team-modal-avatar">
                {selectedMember.image ? (
                  <img src={selectedMember.image} alt={selectedMember.name} loading="eager" decoding="async" />
                ) : (
                  <div className="team-member-avatar-placeholder">
                    {selectedMember.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                )}
              </div>
              
              <h2 className="team-modal-name">{selectedMember.name}</h2>
              <span className="team-modal-role">{selectedMember.role}</span>
              {selectedMember.bio && <p className="team-modal-bio">{selectedMember.bio}</p>}
              
              <div className="team-modal-socials">
                {selectedMember.instagram && (
                  <a href={selectedMember.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="team-social-link">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                )}
                {selectedMember.linkedin && (
                  <a href={selectedMember.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="team-social-link">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </LoadingScreen>
  )
}
