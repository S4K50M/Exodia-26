import { useEffect, useState, type ReactNode } from 'react'
import '../styles/loading.css'

interface LoadingScreenProps {
  /** The SVG component to render (e.g. <HomeSVG />) */
  svg: ReactNode
  /** Minimum time (ms) the loader stays visible – lets the animation play out */
  minDuration?: number
  children: ReactNode
}

export function LoadingScreen({
  svg,
  minDuration = 2400,
  children,
}: LoadingScreenProps) {
  const [showLoader, setShowLoader] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true)
      // Remove loader from DOM after the fade-out transition ends
      setTimeout(() => setShowLoader(false), 600)
    }, minDuration)
    return () => clearTimeout(timer)
  }, [minDuration])

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
