import { useEffect, useRef, useState, type ReactNode } from 'react'
import '../styles/loading.css'

let hasShownGlobalLoader = false

interface LoadingScreenProps {
  svg: ReactNode
  minDuration?: number
  assets?: string[]
  showOnce?: boolean
  children: ReactNode
}

function preloadImages(srcs: string[], timeoutMs = 12000): Promise<void> {
  const unique = Array.from(new Set(srcs.filter(Boolean)))
  if (unique.length === 0) return Promise.resolve()

  return new Promise((resolve) => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      resolve()
    }

    const timer = window.setTimeout(finish, timeoutMs)

    let remaining = unique.length
    const onOne = () => {
      remaining -= 1
      if (remaining <= 0) {
        window.clearTimeout(timer)
        finish()
      }
    }

    unique.forEach((src) => {
      const img = new Image()
      let settled = false
      const settle = () => {
        if (settled) return
        settled = true
        onOne()
      }

      img.onload = settle
      img.onerror = settle
      img.src = src

      img.decode?.().then(settle).catch(settle)
    })
  })
}

export function LoadingScreen({
  svg,
  minDuration = 0,
  assets = [],
  showOnce = true,
  children,
}: LoadingScreenProps) {
  const shouldShow = !showOnce || !hasShownGlobalLoader
  const [showLoader, setShowLoader] = useState(shouldShow)
  const [fadeOut, setFadeOut] = useState(false)
  const hideTimerRef = useRef<number | null>(null)
  const assetsRef = useRef<string[]>(assets)
  const assetsKey = assets.join('|')

  useEffect(() => {
    assetsRef.current = assets
  }, [assetsKey])

  useEffect(() => {
    if (!showLoader) return

    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const duration = reduceMotion ? 0 : minDuration

    const connection = (navigator as any).connection
    const saveData = connection?.saveData === true
    const effectiveType = String(connection?.effectiveType ?? '')
    const slowNetwork = /(^|-)2g$/.test(effectiveType) || effectiveType === 'slow-2g'
    const shouldPreload = !saveData && !slowNetwork

    let cancelled = false

    const start = Date.now()
    const waitForAssets = shouldPreload ? preloadImages(assetsRef.current) : Promise.resolve()
    const waitForMin = new Promise<void>((resolve) => {
      const remaining = Math.max(0, duration - (Date.now() - start))
      window.setTimeout(resolve, remaining)
    })

    Promise.all([waitForAssets, waitForMin]).then(() => {
      if (cancelled) return

      setFadeOut(true)
      hideTimerRef.current = window.setTimeout(() => {
        setShowLoader(false)
        if (showOnce) hasShownGlobalLoader = true
      }, 600)
    })

    return () => {
      cancelled = true
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }
  }, [assetsKey, minDuration, showLoader, showOnce])

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
