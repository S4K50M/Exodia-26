import React, { useEffect, useState, useRef, useCallback } from 'react'
import supabase from '../utils/supabase'
import { loadGsap } from '../utils/lazyAnimations'

import background from '../assets/register/background.png'

import '../styles/register-modal.css'
import qr from '../assets/register/qr.png'
interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
}

// ── Particle system ──────────────────────────────────────────────────────────
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  life: number
  maxLife: number
}

function useParticles(canvasRef: React.RefObject<HTMLCanvasElement | null>, isOpen: boolean) {
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialize particles
    const PARTICLE_COUNT = 60
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -Math.random() * 0.8 - 0.2,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      life: Math.random() * 200,
      maxLife: 200 + Math.random() * 100,
    }))

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.life++

        if (p.life > p.maxLife || p.y < -10) {
          p.x = Math.random() * canvas.width
          p.y = canvas.height + 10
          p.life = 0
          p.opacity = Math.random() * 0.5 + 0.2
        }

        // Fade based on life
        const lifeRatio = p.life / p.maxLife
        const alpha = p.opacity * (lifeRatio < 0.1 ? lifeRatio / 0.1 : lifeRatio > 0.8 ? (1 - lifeRatio) / 0.2 : 1)

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(228, 213, 183, ${alpha})`
        ctx.fill()
      })

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [isOpen, canvasRef])
}

export function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    institute: '',
    contingentSize: '',
    amountPaid: '',
    transactionId: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' })

  useParticles(canvasRef, isOpen)

  // Animate in/out
  useEffect(() => {
    if (!overlayRef.current || !contentRef.current) return

    const overlay = overlayRef.current
    const content = contentRef.current

    // Immediate fallback (in case GSAP isn't loaded yet)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      overlay.style.display = 'flex'
      overlay.style.opacity = '1'
    } else {
      overlay.style.opacity = '0'
      overlay.style.display = 'none'
      document.body.style.overflow = ''
    }

    let isCancelled = false

    ;(async () => {
      const { gsap } = await loadGsap()
      if (isCancelled) return

      gsap.killTweensOf([overlay, content])

      if (isOpen) {
        document.body.style.overflow = 'hidden'
        gsap.set(overlay, { display: 'flex' })
        gsap.to(overlay, { opacity: 1, duration: 0.4, ease: 'power2.out' })
        gsap.fromTo(
          content,
          { y: 40, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.2)', delay: 0.15 }
        )
        return
      }

      gsap.to(content, { y: 30, opacity: 0, scale: 0.95, duration: 0.3, ease: 'power2.in' })
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.35,
        delay: 0.1,
        ease: 'power2.in',
        onComplete: () => {
          overlay.style.display = 'none'
          document.body.style.overflow = ''
        },
      })
    })()

    return () => {
      isCancelled = true
    }
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatusMsg({ text: '', type: '' })

    try {
      if (!file) throw new Error('Please upload a screenshot of your payment.')

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('payment_proofs').upload(fileName, file)
      if (uploadError) throw new Error('Image upload failed: ' + uploadError.message)

      const {
        data: { publicUrl },
      } = supabase.storage.from('payment_proofs').getPublicUrl(fileName)

      const { error: dbError } = await supabase.from('registrations').insert([
        {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          institute_name: formData.institute,
          contingent_size: parseInt(formData.contingentSize),
          total_amount: parseInt(formData.amountPaid),
          transaction_id: formData.transactionId,
          proof_url: publicUrl,
        },
      ])
      if (dbError) throw new Error('Database error: ' + dbError.message)

      setStatusMsg({ text: 'Registration successful! We will verify your payment.', type: 'success' })
      setFormData({ fullName: '', email: '', phone: '', institute: '', contingentSize: '', amountPaid: '', transactionId: '' })
      setFile(null)
      const fileInput = document.getElementById('modal-file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error: any) {
      setStatusMsg({ text: error.message || 'Something went wrong.', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose()
    },
    [onClose]
  )

  return (
    <div ref={overlayRef} 
      className="register-overlay" 
      onClick={handleOverlayClick} 
      style={{ display: 'none', opacity: 0 }}
      onWheel={(e) => e.stopPropagation()}   
      onTouchMove={(e) => e.stopPropagation()} 
    >
      {/* Particles canvas */}
      <canvas ref={canvasRef} className="register-particles" />

      {/* Background image layer */}
      <div className="register-bg-layer" style={{ backgroundImage: `url(${background})` }} />

      {/* Content */}
      <div ref={contentRef} className="register-content">
        {/* Close button */}
        <button className="register-close-btn" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <h1 className="register-title">Register for Exodia</h1>

        {statusMsg.text && (
          <div className={`register-status ${statusMsg.type === 'success' ? 'register-status-success' : 'register-status-error'}`}>
            {statusMsg.text}
          </div>
        )}

        <div className="register-body">
          {/* QR Section */}
          <div className="register-qr-section">
            <img
              src={qr}
              alt="Payment QR Code"
              className="register-qr-img"
              loading="lazy"
              decoding="async"
            />
            <p className="register-qr-label">Scan to Pay</p>
            <div className="register-fee-box">
              <p className="register-fee-label">Registration Fee:</p>
              <p className="register-fee-amount">₹2,600</p>
              <p className="register-fee-label">per person</p>
            </div>
            <p className="register-qr-note">Please complete the payment before filling out this form.</p>
          </div>

          {/* Form */}
          <form className="register-form" onSubmit={handleSubmit}>
            <div className="register-form-grid">
              <div className="register-field">
                <label>Full Name</label>
                <input name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" placeholder="John Doe" required />
              </div>
              <div className="register-field">
                <label>Email Address</label>
                <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="john@example.com" required />
              </div>
              <div className="register-field">
                <label>Phone Number</label>
                <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="+91 98765 43210" required />
              </div>
              <div className="register-field">
                <label>Institute Name</label>
                <input name="institute" value={formData.institute} onChange={handleInputChange} type="text" placeholder="XYZ College" required />
              </div>
              <div className="register-field">
                <label>Contingent Size</label>
                <input name="contingentSize" value={formData.contingentSize} onChange={handleInputChange} type="number" min="1" placeholder="e.g. 1" required />
              </div>
              <div className="register-field">
                <label>Total Amount Paid (₹)</label>
                <input name="amountPaid" value={formData.amountPaid} onChange={handleInputChange} type="number" placeholder="2600" required />
              </div>
              <div className="register-field register-field-full">
                <label>Transaction ID</label>
                <input name="transactionId" value={formData.transactionId} onChange={handleInputChange} type="text" placeholder="UPI Ref / Transaction Number" required style={{ fontFamily: 'monospace' }} />
              </div>
              <div className="register-field register-field-full">
                <label>Proof of Payment (Screenshot)</label>
                <input id="modal-file-upload" type="file" onChange={handleFileChange} accept="image/*" required className="register-file-input" />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className={`register-submit-btn ${isSubmitting ? 'disabled' : ''}`}>
              {isSubmitting ? 'Submitting Registration...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
