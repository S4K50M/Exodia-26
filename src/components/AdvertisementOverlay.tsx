import { useEffect, useState } from 'react'
import supabase from '../utils/supabase'
import '../styles/advertisement.css'

interface AdData {
  id: string
  is_active: boolean
  shape: 'rectangle' | 'square' | 'portrait'
  has_button: boolean
  button_link: string | null
  image_url: string | null
  heading: string
  description: string
}

interface Props {
  loaderDone: boolean
}

export function AdvertisementOverlay({ loaderDone }: Props) {
  const [ad, setAd] = useState<AdData | null>(null)
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('advertisement')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (!cancelled && data && data.length > 0) {
          setAd(data[0] as AdData)
        }
      })
    return () => { cancelled = true }
  }, [])

  // Show after loader finishes — only once per browser session
  useEffect(() => {
    if (loaderDone && ad && ad.is_active) {
      const alreadySeen = sessionStorage.getItem('ad_seen') === '1'
      if (alreadySeen) return
      const t = setTimeout(() => setVisible(true), 200)
      return () => clearTimeout(t)
    }
  }, [loaderDone, ad])

  const handleClose = () => {
    sessionStorage.setItem('ad_seen', '1')
    setClosing(true)
    setTimeout(() => {
      setVisible(false)
      setClosing(false)
    }, 400)
  }

  if (!visible || !ad || !ad.is_active) return null

  return (
    <div
      className={`ad-backdrop${closing ? ' ad-closing' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className={`ad-card ad-shape-${ad.shape}${closing ? ' ad-card-closing' : ''}`}>

        {/* Close button */}
        <button
          className="ad-close-btn"
          onClick={handleClose}
          data-cursor="pointer"
          aria-label="Close advertisement"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Decorative top glow line */}
        <div className="ad-glow-line" />

        {/* Image */}
        {ad.image_url && (
          <div className="ad-image-wrap">
            <img src={ad.image_url} alt="Advertisement" className="ad-image" />
          </div>
        )}

        {/* Content */}
        <div className="ad-content">
          <p className="ad-eyebrow">Special Announcement</p>
          <h2 className="ad-heading font-serif">{ad.heading}</h2>
          <p className="ad-description">{ad.description}</p>

          {ad.has_button && ad.button_link && (
            <a
              href={ad.button_link}
              target="_blank"
              rel="noopener noreferrer"
              className="ad-btn"
              data-cursor="pointer"
            >
              <span>Learn More</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>

        {/* Bottom decoration */}
        <div className="ad-bottom-decoration">
          <span className="ad-dot" />
          <span className="ad-dot" />
          <span className="ad-dot" />
        </div>
      </div>
    </div>
  )
}
