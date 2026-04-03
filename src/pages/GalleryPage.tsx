import { useEffect, useRef, useState, useCallback } from 'react'
import { Camera, ImageOff } from 'lucide-react'

import galleryBg from '../assets/gallery/gallery_bg.png'
import leftCloud from '../assets/gallery/left_cloud.png'
import rightCloud from '../assets/gallery/right_cloud.png'

import { GallerySVG } from '../assets/loading/GallerySVG'
import { LoadingScreen } from '../components/LoadingScreen'
import { loadGsap } from '../utils/lazyAnimations'
import '../styles/gallery.css'

/* ─── Placeholder gallery data ────────────────────── */
const PLACEHOLDER_ITEMS = [
  { id: 1, title: 'Opening Ceremony', sub: 'The grand unveiling of Exodia 2026' },
  { id: 2, title: 'Robotics Arena', sub: 'Battle bots clash in the finals' },
  { id: 3, title: 'Hackathon Night', sub: '48 hours of relentless innovation' },
  { id: 4, title: 'Cultural Fest', sub: 'Dance, drama & music under the stars' },
  { id: 5, title: 'Tech Talks', sub: 'Industry leaders share their vision' },
  { id: 6, title: 'Gaming Tournament', sub: 'Esports arena lights up the night' },
  { id: 7, title: 'Workshop Zone', sub: 'Hands-on learning with cutting-edge tech' },
  { id: 8, title: 'Cosplay Parade', sub: 'Imagination brought to life' },
  { id: 9, title: 'Drone Racing', sub: 'High-speed aerial adrenaline' },
  { id: 10, title: 'Star Night', sub: 'A musical extravaganza to remember' },
  { id: 11, title: 'AI Exhibition', sub: 'The future of intelligence on display' },
  { id: 12, title: 'Closing Ceremony', sub: 'Celebrating the champions of Exodia' },
]

const GALLERY_PRELOAD_IMAGES = [galleryBg, leftCloud, rightCloud]

export function GalleryPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const leftCloudRef = useRef<HTMLDivElement>(null)
  const rightCloudRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const trackWrapperRef = useRef<HTMLDivElement>(null)

  const [lightboxItem, setLightboxItem] = useState<typeof PLACEHOLDER_ITEMS[0] | null>(null)
  const [introDone, setIntroDone] = useState(false)
  const [loaderDone, setLoaderDone] = useState(false)

  const closeLightbox = useCallback(() => setLightboxItem(null), [])

  const getChunkHeight = useCallback(() => {
    const wrapper = trackWrapperRef.current
    if (!wrapper) return 0
    const firstChunk = wrapper.querySelector<HTMLElement>('.gallery-track-chunk')
    return firstChunk?.offsetHeight ?? 0
  }, [])

  const centerLoopScroll = useCallback(() => {
    const wrapper = trackWrapperRef.current
    if (!wrapper) return

    const chunkHeight = getChunkHeight()
    if (!chunkHeight) return

    wrapper.scrollTop = chunkHeight
  }, [getChunkHeight])

  /* ─── Full auto-play animation timeline ──────── */
  useEffect(() => {
    if (!loaderDone) return

    let isCancelled = false
    let tl: any = null

    ;(async () => {
      const { gsap } = await loadGsap()
      if (isCancelled) return

      // Set initial states
      gsap.set(leftCloudRef.current, { x: '-110%', scale: 1, transformOrigin: 'center center' })
      gsap.set(rightCloudRef.current, { x: '110%', scale: 1, transformOrigin: 'center center' })
      gsap.set(titleRef.current, { scale: 0, opacity: 0 })
      gsap.set(scrollerRef.current, { opacity: 0, y: '40%' })

      tl = gsap.timeline({
        delay: 0.3,
        onComplete: () => setIntroDone(true),
      })

      /* ── Phase 1: Entrance (t=0 → t=1.4s) ── */

      // Clouds slide in simultaneously
      tl.to(leftCloudRef.current, {
        x: '0%',
        duration: 1.4,
        ease: 'power3.out',
      }, 0)

      tl.to(rightCloudRef.current, {
        x: '0%',
        duration: 1.4,
        ease: 'power3.out',
      }, 0)

      // Title pops in from center (starts at t=0.5s)
      tl.to(titleRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.9,
        ease: 'back.out(1.7)',
      }, 0.5)

      /* ── Phase 2: Hold / Breathe ── */
      // Nothing happens from t=1.4s → t=2.5s (implicit dead time)

      /* ── Phase 3: Everything moves UP (t=2.5s onwards) ── */

      // Title exits FASTEST (completely off screen)
      tl.to(titleRef.current, {
        y: '-120vh',
        opacity: 0,
        duration: 1.2,
        ease: 'power2.in',
      }, 2.5)

      // Clouds exit at MEDIUM speed (fully off screen, start slightly later)
      tl.to(leftCloudRef.current, {
        y: '-140vh',
        scale: 1.28,
        duration: 1.8,
        ease: 'power2.inOut',
      }, 2.65)

      tl.to(rightCloudRef.current, {
        y: '-140vh',
        scale: 1.28,
        duration: 1.8,
        ease: 'power2.inOut',
      }, 2.65)

      // BG stays in place — NO movement

      /* ── Phase 4: Scroller rises in from bottom (starts as clouds are leaving) ── */
      tl.to(scrollerRef.current, {
        opacity: 1,
        y: '0%',
        duration: 1.2,
        ease: 'power3.out',
      }, 3.4)
    })()

    return () => {
      isCancelled = true
      tl?.kill()
    }
  }, [loaderDone])

  /* ─── Close lightbox on Escape ────────────────── */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [closeLightbox])

  // Keep the gallery manually scrollable while looping seamlessly.
  useEffect(() => {
    const wrapper = trackWrapperRef.current
    if (!wrapper || !introDone) return

    let rafId = requestAnimationFrame(() => {
      centerLoopScroll()
    })

    const onScroll = () => {
      const chunkHeight = getChunkHeight()
      if (!chunkHeight) return

      // Recenter before reaching hard edges to preserve seamless infinite scrolling.
      if (wrapper.scrollTop < chunkHeight * 0.25) {
        wrapper.scrollTop += chunkHeight
      } else if (wrapper.scrollTop > chunkHeight * 1.75) {
        wrapper.scrollTop -= chunkHeight
      }
    }

    wrapper.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', centerLoopScroll)

    return () => {
      cancelAnimationFrame(rafId)
      wrapper.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', centerLoopScroll)
    }
  }, [introDone, centerLoopScroll, getChunkHeight])

  return (
    <LoadingScreen
      svg={<GallerySVG />}
      preloadImages={GALLERY_PRELOAD_IMAGES}
      onDone={() => setLoaderDone(true)}
    >
    <div className="gallery-page" ref={containerRef}>
      {/* Fixed BG — stays on screen always */}
      <div className="gallery-bg" ref={bgRef}>
        <img src={galleryBg} alt="" loading="eager" decoding="async" />
      </div>

      {/* Intro overlay — clouds + title */}
      <div className={`gallery-intro ${introDone ? 'done' : ''}`} ref={introRef}>
        {/* Left Cloud */}
        <div
          className="gallery-cloud gallery-cloud--left"
          ref={leftCloudRef}
        >
          <img src={leftCloud} alt="" loading="eager" decoding="async" />
        </div>

        {/* Right Cloud */}
        <div
          className="gallery-cloud gallery-cloud--right"
          ref={rightCloudRef}
        >
          <img src={rightCloud} alt="" loading="eager" decoding="async" />
        </div>

        {/* GALLERY Title */}
        <div className="gallery-title" ref={titleRef}>
          <h1>Gallery</h1>
        </div>
      </div>

      {/* Scrollable gallery grid */}
      <div className="gallery-scroller" ref={scrollerRef}>
        <div className="gallery-scroller-header">
          <h2>Moments of Exodia</h2>
          <p>Photos coming soon — stay tuned for the memories</p>
        </div>

        <div className="gallery-track-wrapper" ref={trackWrapperRef}>
          <div className="gallery-track">
            {[0, 1, 2].map((chunkIdx) => (
              <div key={chunkIdx} className="gallery-track-chunk">
                {PLACEHOLDER_ITEMS.map((item) => (
                  <div
                    key={`${chunkIdx}-${item.id}`}
                    className="gallery-card gallery-card--placeholder"
                    onClick={() => setLightboxItem(item)}
                    data-cursor="large"
                  >
                    <div className="placeholder-icon">
                      <Camera size={22} />
                    </div>
                    <span className="placeholder-title">{item.title}</span>
                    <span className="placeholder-sub">{item.sub}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox / Focus overlay */}
      <div
        className={`gallery-lightbox ${lightboxItem ? 'active' : ''}`}
        onClick={closeLightbox}
      >
        <button
          className="gallery-lightbox-close"
          onClick={closeLightbox}
          aria-label="Close lightbox"
        >
          ×
        </button>
        {lightboxItem && (
          <div
            className="gallery-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="gallery-lightbox-placeholder">
              <div className="lb-icon">
                <ImageOff size={48} />
              </div>
              <h3>{lightboxItem.title}</h3>
              <p>{lightboxItem.sub}</p>
              <p style={{ color: 'rgba(255,213,129,0.5)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                Photo will be added soon
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
    </LoadingScreen>
  )
}
