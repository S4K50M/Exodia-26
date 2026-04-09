import { useEffect, useState, type ReactNode } from 'react'
import '../styles/loading.css'

interface LoadingScreenProps {
  /** The SVG component to render (e.g. <HomeSVG />) */
  svg: ReactNode
  /** Minimum time (ms) the loader stays visible – lets the animation play out */
  minDuration?: number
  /** Optional list of image URLs to preload before hiding the loader */
  preloadImages?: string[]
  /** Optional callback fired when the loader finishes and is removed from DOM */
  onDone?: () => void
  children: ReactNode
}

export function LoadingScreen({
  svg,
  minDuration = 2400,
  preloadImages = [],
  onDone,
  children,
}: LoadingScreenProps) {
  const [showLoader, setShowLoader] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [minDelayDone, setMinDelayDone] = useState(false)
  const [assetsLoaded, setAssetsLoaded] = useState(preloadImages.length === 0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMinDelayDone(true)
    }, minDuration)
    return () => clearTimeout(timer)
  }, [minDuration])

  useEffect(() => {
    let cancelled = false
    const urls = Array.from(new Set(preloadImages.filter(Boolean)))

    if (urls.length === 0) {
      setAssetsLoaded(true)
      return
    }

    setAssetsLoaded(false)

    const loadImage = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image()
        let doneCalled = false

        const done = () => {
          if (doneCalled) return
          doneCalled = true
          window.clearTimeout(timeoutId)
          img.onload = null
          img.onerror = null
          resolve()
        }

        // Prevent the loader from hanging forever on stalled requests.
        const timeoutId = window.setTimeout(done, 15000)

        img.onload = done
        img.onerror = done
        img.src = src

        if (img.complete) {
          resolve()
        }
      })

    Promise.all(urls.map((url) => loadImage(url))).then(() => {
      if (!cancelled) {
        setAssetsLoaded(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [preloadImages])

  useEffect(() => {
    if (!showLoader || !minDelayDone || !assetsLoaded) return

    setFadeOut(true)

    // Remove loader from DOM after the fade-out transition ends.
    const fadeTimer = window.setTimeout(() => {
      setShowLoader(false)
      onDone?.()
    }, 600)

    return () => window.clearTimeout(fadeTimer)
  }, [showLoader, minDelayDone, assetsLoaded, onDone])

  return (
    <>
      {showLoader && (
        <div className={`loading-overlay${fadeOut ? ' loading-fade-out' : ''}`}>
          <div className="loading-svg-container">{svg}</div>
        </div>
      )}
      {children}
    </>
  )
}
