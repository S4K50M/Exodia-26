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

import '../styles/team.css'

import { LoadingScreen } from '../components/LoadingScreen'
import { TeamSVG } from '../assets/loading/TeamSVG'

gsap.registerPlugin(ScrollTrigger)

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

interface TeamSection {
  title: string
  members: TeamMember[]
}

// Helper: convert Google Drive share link to direct thumbnail URL
const gdrive = (id: string) => `https://drive.google.com/thumbnail?id=${id}`

const TEAM_SECTIONS: TeamSection[] = [
  {
    title: 'Overall Coordinator',
    members: [
      { id: 1, name: 'Hardeep Gupta', role: 'Overall Coordinator', bio: '', image: gdrive('1vO-r3coAjZG79ZFE70Cth8r2Qob5B_Ni') },
    ],
  },
  {
    title: 'Planning & Management',
    members: [
      { id: 2, name: 'Priyanka', role: 'Head', bio: '', image: gdrive('1LxVMVfVN-HJrJr_7doa31WnqVHQJ_dBH') },
      { id: 3, name: 'Aditya', role: 'Head', bio: '', image: gdrive('10zZSYs7v9ryc2AwVHW7P2kEawp2ujbDr'), instagram: 'https://www.instagram.com/adityaaaaaaa.k', linkedin: 'https://www.linkedin.com/in/aditya-kumar-53473831a' },
      { id: 4, name: 'Abhinn Goyal', role: 'Head', bio: '', image: gdrive('1kF7fRa7TYBR2TyANvQTS1Gj8-ZrL1eR_'), instagram: 'https://www.instagram.com/abhinn_14', linkedin: 'https://www.linkedin.com/in/abhinn-goyal' },
      { id: 5, name: 'Shivam Rawat', role: 'Head', bio: '', image: gdrive('1C2MVNsw4GSNiS7GcL2UDyk4xyuswfPRO') },
    ],
  },
  {
    title: 'Content',
    members: [
      { id: 6, name: 'Radhika', role: 'Head', bio: '', image: gdrive('1FcGfxJMKNLIyiWGfSdeSFf30J6GASRxK'), instagram: 'https://www.instagram.com/radhee29_', linkedin: 'https://www.linkedin.com/in/radhika-dwivedi-bb39b9320' },
      { id: 7, name: 'Samridhi', role: 'Head', bio: '', image: gdrive('1_n-2uCoZXbN8BcZVFqmHVY7ChUhRFkYc'), instagram: 'https://www.instagram.com/_samridhi_._singh_' },
      { id: 8, name: 'Aakansha', role: 'Head', bio: '', image: gdrive('1w_invUV9iGvtT0l1zZPHjtOQiWRFhU1q'), linkedin: 'https://www.linkedin.com/in/aakansha-sehrawat-141526315/' },
    ],
  },
  {
    title: 'Design',
    members: [
      { id: 9, name: 'Ansh Vyas', role: 'Head', bio: '', image: gdrive('1J8R6sWMB93qVUdQ8gWg2ISLIO9Dsjo2R'), instagram: 'https://www.instagram.com/titan_ansh/', linkedin: 'https://www.linkedin.com/in/ansh-vyas-b74396323/' },
      { id: 10, name: 'Pratibha', role: 'Head', bio: '', image: gdrive('1f817ZucVZdiuN56Ro39EVUlFBw10n_-a'), instagram: 'https://www.instagram.com/pratibha_bt', linkedin: 'https://www.linkedin.com/in/pratibha-bharti-thapliyal-117805324' },
    ],
  },
  {
    title: 'Media',
    members: [
      { id: 11, name: 'Vidisha Thokal', role: 'Head', bio: '', image: gdrive('1xnCPuFIia4v_P0OPYvsuVSavjNgkl7v9'), instagram: 'https://www.instagram.com/vidishaaa_04', linkedin: 'https://www.linkedin.com/in/vidisha-thokal-8a16a5323' },
    ],
  },
  {
    title: 'Publicity',
    members: [
      { id: 12, name: 'Himanshi Namdev', role: 'Head', bio: '', image: gdrive('1OPl1kVmKpw8wi6ak2RQaglDfSKfy_XnH'), linkedin: 'https://www.linkedin.com/in/himanshi-namdev-640595320/' },
      { id: 13, name: 'Suman Chauhan', role: 'Head', bio: '', image: gdrive('1xS3wnLO7ByjglalgcztxHGPAIZ_at5Ri') },
      { id: 14, name: 'Ayush Chauhan', role: 'Head', bio: '', image: gdrive('1ZabuNpwbHNjk0Sik8NqEqKwIQnHqv-xI'), instagram: 'https://www.instagram.com/a_chauhan117' },
    ],
  },
  {
    title: 'Photography & Videography',
    members: [
      { id: 15, name: 'Ishaan Sharma', role: 'Head', bio: '', image: gdrive('1SAW40dVfuge2_pAB8ncaO-4Cklp8agKF'), instagram: 'https://www.instagram.com/ishaannnn.10', linkedin: 'https://www.linkedin.com/in/ishaan-sharma-025bb524b' },
      { id: 16, name: 'Yash Vardhan Chaudhary', role: 'Head', bio: '', image: gdrive('17r_tkqDOZw4Mu9-kaQUqo8toEYwq9Do-'), instagram: 'https://www.instagram.com/yash_vc__', linkedin: 'https://www.linkedin.com/in/yash-vardhan-chaudhary-a1bb2431b' },
    ],
  },
  {
    title: 'Hospitality',
    members: [
      { id: 17, name: 'Chirag', role: 'Head', bio: '', image: gdrive('129gaYHGrFR9PWg9dEFFu2OTYYnjhKjBG'), instagram: 'https://www.instagram.com/chirag_._n' },
      { id: 18, name: 'Vaishnavi Garg', role: 'Head', bio: '', image: gdrive('1ihdXEkFAcNKO4qz_0kdVmBto-PCXjiK8'), instagram: 'https://www.instagram.com/vaishnavi.garg07', linkedin: 'https://www.linkedin.com/in/vaishnavi-garg-592a6b31b' },
      { id: 19, name: 'Chetan', role: 'Head', bio: '', image: gdrive('15JA9dYp05cLyl-Wvh8hNDHnWr2zHHtgU'), linkedin: 'https://www.linkedin.com/in/chetan-meena-65b336324' },
    ],
  },
  {
    title: 'Sponsorship',
    members: [
      { id: 20, name: 'Aadi Baraiya', role: 'Head', bio: '', image: gdrive('1UUWg5cy4H-DXsSomKnYwjf_gBeFIjElJ'), instagram: 'https://www.instagram.com/aadi_jain_baraiya', linkedin: 'https://www.linkedin.com/in/aadi-jain-baraiya-a25b6b337' },
      { id: 21, name: 'Shakshi Sharma', role: 'Head', bio: '', image: gdrive('176DI-qQy7p8_NhRoBEy14e6EC5xgn1QQ') },
    ],
  },
  {
    title: 'Decor',
    members: [
      { id: 22, name: 'Aashvi Garg', role: 'Head', bio: '', image: gdrive('1BGE_Ci1ll_3NFPTx5tPw1DeLG0GkRyYL') },
    ],
  },
]

export function TeamPage() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollTriggerRef = useRef<HTMLDivElement | null>(null)
  const cloudTLRef = useRef<HTMLDivElement | null>(null)
  const cloudTRRef = useRef<HTMLDivElement | null>(null)
  const cloudBLRef = useRef<HTMLDivElement | null>(null)
  const cloudBRRef = useRef<HTMLDivElement | null>(null)
  const sectionsRef = useRef<HTMLDivElement | null>(null)

  // ── Lenis smooth scroll ────────────────────────────────────────────────────
  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true, lerp: 0.1 })
    lenis.on('scroll', () => ScrollTrigger.update())

    let frameId: number
    const raf = (time: number) => { lenis.raf(time); frameId = requestAnimationFrame(raf) }
    frameId = requestAnimationFrame(raf)

    return () => { lenis.destroy(); cancelAnimationFrame(frameId) }
  }, [])

  // ── Animations ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const trigger = scrollTriggerRef.current
    if (!trigger) return

    const ctx = gsap.context(() => {
      // Clouds recede on scroll
      const cloudRefs = [cloudTLRef, cloudTRRef, cloudBLRef, cloudBRRef]
      cloudRefs.forEach((ref) => {
        if (ref.current) {
          gsap.fromTo(ref.current, { scale: 1, opacity: 1 }, {
            scale: 0.5, opacity: 0, ease: 'none',
            scrollTrigger: { trigger, start: 'top top', end: '15% top', scrub: 1.5 },
          })
        }
      })

      // Animate each section as it enters the viewport
      const sectionEls = sectionsRef.current?.querySelectorAll('.team-section')
      sectionEls?.forEach((section) => {
        // Section title
        const title = section.querySelector('.team-section-title')
        if (title) {
          gsap.fromTo(title, { y: 40, opacity: 0 }, {
            y: 0, opacity: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: section, start: 'top 85%', toggleActions: 'play none none reverse' },
          })
        }

        // Member cards stagger in
        const cards = section.querySelectorAll('.team-member-card')
        if (cards.length) {
          gsap.fromTo(cards, { y: 60, opacity: 0, scale: 0.9 }, {
            y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.4)', stagger: 0.12,
            scrollTrigger: { trigger: section, start: 'top 80%', toggleActions: 'play none none reverse' },
          })
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <LoadingScreen svg={<TeamSVG />}>
    <div className="team-page" ref={containerRef}>
      <div className="team-scroll-trigger" ref={scrollTriggerRef}>
        {/* ── Sticky hero with background & clouds ── */}
        <div className="team-stage">
          <div className="team-bg">
            <div className="team-bg-left"><img src={bgLeft} alt="" /></div>
            <div className="team-bg-right"><img src={bgRight} alt="" /></div>
          </div>

          <div className="team-cloud team-cloud-tl" ref={cloudTLRef}><img src={cloudLeft} alt="" /></div>
          <div className="team-cloud team-cloud-tr" ref={cloudTRRef}><img src={cloudRight} alt="" /></div>
          <div className="team-cloud team-cloud-bl" ref={cloudBLRef}><img src={cloudBLeft} alt="" /></div>
          <div className="team-cloud team-cloud-br" ref={cloudBRRef}><img src={cloudBRight} alt="" /></div>

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
                  <div key={member.id} className="team-member-card">
                    <div className="team-member-avatar">
                      {member.image ? (
                        <img src={member.image} alt={member.name} />
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
    </div>
    </LoadingScreen>
  )
}
