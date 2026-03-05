import { useEffect, useRef, useState, type ReactNode } from 'react'
import '../styles/loading.css'

let hasShownGlobalLoader = false

interface LoadingScreenProps {
  svg: ReactNode
  minDuration?: number
  assets?: string[]
  maxWaitMs?: number
  delayMs?: number
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
  maxWaitMs = 350,
  delayMs = 120,
  showOnce = true,
  children,
}: LoadingScreenProps) {
  const shouldShow = !showOnce || !hasShownGlobalLoader
  const [showLoader, setShowLoader] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)
  const showTimerRef = useRef<number | null>(null)
  const hideTimerRef = useRef<number | null>(null)
  const assetsRef = useRef<string[]>(assets)
  const assetsKey = assets.join('|')
  const fadeMs = 300
  const didShowRef = useRef(false)
  const doneRef = useRef(false)

  useEffect(() => {
    assetsRef.current = assets
  }, [assetsKey])

  useEffect(() => {
    if (!shouldShow) return

    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const duration = reduceMotion ? 0 : minDuration
    const showDelay = reduceMotion ? 0 : delayMs

    const connection = (navigator as any).connection
    const saveData = connection?.saveData === true
    const effectiveType = String(connection?.effectiveType ?? '')
    const slowNetwork = /(^|-)2g$/.test(effectiveType) || effectiveType === 'slow-2g'
    const shouldPreload = !saveData && !slowNetwork

    let cancelled = false
    doneRef.current = false
    didShowRef.current = showDelay === 0

    setFadeOut(false)
    setShowLoader(showDelay === 0)

    if (showDelay > 0) {
      showTimerRef.current = window.setTimeout(() => {
        if (cancelled) return
        if (doneRef.current) return
        didShowRef.current = true
        setShowLoader(true)
      }, showDelay)
    }

    const start = Date.now()
    const waitForAssets = shouldPreload ? preloadImages(assetsRef.current) : Promise.resolve()
    const waitForMin = new Promise<void>((resolve) => {
      const remaining = Math.max(0, duration - (Date.now() - start))
      window.setTimeout(resolve, remaining)
    })
    const waitForMax =
      maxWaitMs > 0
        ? new Promise<void>((resolve) => {
            window.setTimeout(resolve, maxWaitMs)
          })
        : null

    const gate = waitForMax ? Promise.race([waitForAssets, waitForMax]) : waitForAssets

    Promise.all([gate, waitForMin]).then(() => {
      if (cancelled) return

      doneRef.current = true
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current)
        showTimerRef.current = null
      }

      if (showOnce) hasShownGlobalLoader = true

      if (!didShowRef.current) {
        setShowLoader(false)
        setFadeOut(false)
        return
      }

      setFadeOut(true)
      hideTimerRef.current = window.setTimeout(() => {
        setShowLoader(false)
        setFadeOut(false)
      }, fadeMs)
    })

    return () => {
      cancelled = true
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current)
        showTimerRef.current = null
      }
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }
  }, [assetsKey, delayMs, maxWaitMs, minDuration, shouldShow, showOnce])

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
