import { useEffect, useRef, useState, useCallback } from 'react'
import { ImageOff, X } from 'lucide-react'

// Import your supabase client (adjust path if needed)
import supabase from '../utils/supabase'

import galleryBg from '../assets/gallery/gallery_bg.png'
import leftCloud from '../assets/gallery/left_cloud.png'
import rightCloud from '../assets/gallery/right_cloud.png'

import { GallerySVG } from '../assets/loading/GallerySVG'
import { LoadingScreen } from '../components/LoadingScreen'
import { loadGsap } from '../utils/lazyAnimations'
import '../styles/gallery.css'

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

  // Database State
  const [photos, setPhotos] = useState<any[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  
  const [lightboxItem, setLightboxItem] = useState<any | null>(null)
  const [introDone, setIntroDone] = useState(false)
  const [loaderDone, setLoaderDone] = useState(false)

  const closeLightbox = useCallback(() => setLightboxItem(null), [])

  /* ─── Fetch Data from Supabase ────────────────── */
  useEffect(() => {
    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from('photo_gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        setPhotos(data);
        
        // Extract unique tags for the filter UI
        const uniqueTags = new Set<string>();
        data.forEach(photo => {
          if (photo.tags && Array.isArray(photo.tags)) {
            photo.tags.forEach((tag: string) => uniqueTags.add(tag));
          }
        });
        setAllTags(Array.from(uniqueTags));
      }
    };
    fetchPhotos();
  }, []);

  /* ─── Filter Logic ────────────────────────────── */
  const filteredPhotos = selectedTag 
    ? photos.filter(p => p.tags && p.tags.includes(selectedTag))
    : photos;

  /* ─── Infinite Scroll Logic ───────────────────── */
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

      // Phase 1: Entrance
      tl.to(leftCloudRef.current, { x: '0%', duration: 1.4, ease: 'power3.out' }, 0)
      tl.to(rightCloudRef.current, { x: '0%', duration: 1.4, ease: 'power3.out' }, 0)
      tl.to(titleRef.current, { scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(1.7)' }, 0.5)

      // Phase 3: Everything moves UP (t=2.5s onwards)
      tl.to(titleRef.current, { y: '-120vh', opacity: 0, duration: 1.2, ease: 'power2.in' }, 2.5)
      tl.to(leftCloudRef.current, { y: '-140vh', scale: 1.28, duration: 1.8, ease: 'power2.inOut' }, 2.65)
      tl.to(rightCloudRef.current, { y: '-140vh', scale: 1.28, duration: 1.8, ease: 'power2.inOut' }, 2.65)

      // Phase 4: Scroller rises in
      tl.to(scrollerRef.current, { opacity: 1, y: '0%', duration: 1.2, ease: 'power3.out' }, 3.4)
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
  // We only run this if we actually have enough content to scroll.
  useEffect(() => {
    const wrapper = trackWrapperRef.current
    // Only enable infinite scroll math if we have content and intro is done
    if (!wrapper || !introDone || filteredPhotos.length === 0) return

    let rafId = requestAnimationFrame(() => {
      centerLoopScroll()
    })

    const onScroll = () => {
      const chunkHeight = getChunkHeight()
      if (!chunkHeight) return

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
  }, [introDone, centerLoopScroll, getChunkHeight, filteredPhotos.length])

  return (
    <LoadingScreen
      svg={<GallerySVG />}
      preloadImages={GALLERY_PRELOAD_IMAGES}
      onDone={() => setLoaderDone(true)}
    >
      <div className="gallery-page" ref={containerRef}>
        {/* Fixed BG */}
        <div className="gallery-bg" ref={bgRef}>
          <img src={galleryBg} alt="" loading="eager" decoding="async" />
        </div>

        {/* Intro overlay */}
        <div className={`gallery-intro ${introDone ? 'done' : ''}`} ref={introRef}>
          <div className="gallery-cloud gallery-cloud--left" ref={leftCloudRef}>
            <img src={leftCloud} alt="" loading="eager" decoding="async" />
          </div>
          <div className="gallery-cloud gallery-cloud--right" ref={rightCloudRef}>
            <img src={rightCloud} alt="" loading="eager" decoding="async" />
          </div>
          <div className="gallery-title" ref={titleRef}>
            <h1>Gallery</h1>
          </div>
        </div>

        {/* Scrollable gallery grid */}
        <div className="gallery-scroller flex flex-col h-full" ref={scrollerRef}>
          
          {/* Header & Filters */}
          <div className="gallery-scroller-header flex-shrink-0 z-10 relative pt-8 pb-4">
            <h2>Moments of Exodia</h2>
            <p>Relive the memories</p>
            
            {/* Tag Filter UI */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-4xl mx-auto px-4">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedTag === null 
                      ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  All
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      selectedTag === tag 
                        ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]' 
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Track Wrapper */}
          <div className="gallery-track-wrapper flex-grow" ref={trackWrapperRef}>
            {filteredPhotos.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 italic pb-32">
                No photos found for this category.
              </div>
            ) : (
              <div className="gallery-track">
                {/* 3 Chunks for Infinite Scroll effect */}
                {[0, 1, 2].map((chunkIdx) => (
                  <div key={chunkIdx} className="gallery-track-chunk">
                    {filteredPhotos.map((item) => (
                      <div
                        key={`${chunkIdx}-${item.id}`}
                        className="gallery-card relative overflow-hidden rounded-2xl cursor-pointer group"
                        onClick={() => setLightboxItem(item)}
                        data-cursor="large"
                      >
                        {/* Actual Image */}
                        <img 
                          src={item.image_url} 
                          alt={item.heading} 
                          className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                        
                        {/* Gradient Overlay & Text */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                          <span className="text-white font-bold text-lg translate-y-2 group-hover:translate-y-0 transition-transform">{item.heading}</span>
                          <span className="text-gray-300 text-sm mt-1 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all delay-75 line-clamp-2">{item.caption}</span>
                          
                          {/* Tags on card */}
                          {item.tags && item.tags.length > 0 && (
                            <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity delay-150">
                              {item.tags.slice(0, 3).map((t: string) => (
                                <span key={t} className="text-[10px] bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded backdrop-blur-sm">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lightbox */}
        <div
          className={`gallery-lightbox ${lightboxItem ? 'active' : ''} fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md transition-all duration-300`}
          onClick={closeLightbox}
          style={{ pointerEvents: lightboxItem ? 'auto' : 'none', opacity: lightboxItem ? 1 : 0 }}
        >
          <button
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            <X size={24} />
          </button>
          
          {lightboxItem && (
            <div
              className="gallery-lightbox-content relative max-w-5xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={lightboxItem.image_url.replace('thumbnail', 'view')} // Tries to get higher res if it's a drive thumbnail
                alt={lightboxItem.heading} 
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
                onError={(e) => {
                  // Fallback to exactly what is stored if string replacement breaks
                  (e.target as HTMLImageElement).src = lightboxItem.image_url; 
                }}
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 pt-12 rounded-b-lg text-center md:text-left">
                <h3 className="text-2xl font-bold text-white mb-2">{lightboxItem.heading}</h3>
                <p className="text-gray-300 mb-4 max-w-3xl">{lightboxItem.caption}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {lightboxItem.tags?.map((tag: string) => (
                    <span key={tag} className="text-xs bg-white/10 text-white px-3 py-1 rounded-full border border-white/20">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </LoadingScreen>
  )
}