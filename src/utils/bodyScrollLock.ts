let lockCount = 0
let prevOverflow: string | null = null

export function lockBodyScroll() {
  if (typeof document === 'undefined') return () => {}

  lockCount += 1

  if (lockCount === 1) {
    prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  return () => {
    if (typeof document === 'undefined') return

    lockCount = Math.max(0, lockCount - 1)
    if (lockCount === 0) {
      document.body.style.overflow = prevOverflow ?? ''
      prevOverflow = null
    }
  }
}

