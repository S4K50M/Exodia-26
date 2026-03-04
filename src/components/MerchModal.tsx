import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import gsap from 'gsap'
import supabase from '../utils/supabase'
import { lockBodyScroll } from '../utils/bodyScrollLock'

import background from '../assets/merchendise/background.png'
import qr from '../assets/register/qr.png'

// Merch product images
import hoodieFront from '../assets/merch/final mockup collage front.webp'
import hoodieBack from '../assets/merch/final mockup collage back.webp'
import hoodieSide from '../assets/merch/final mockup collage side.webp'
import hoodieCollage from '../assets/merch/final mockup collage.webp'
import teeFront from '../assets/merch/mockup-tee-front.webp'
import teeBack from '../assets/merch/mockup-tee-back.webp'
import acidFront from '../assets/merch/acid-wash-front.webp'
import acidBack from '../assets/merch/acid-wash-back.webp'

import '../styles/merch-modal.css'

interface MerchModalProps {
  isOpen: boolean
  onClose: () => void
}

const MERCH_OPTIONS = [
  { id: 'hoodie', name: 'Oversized Hoodie', price: 669, type: 'single', sizeLabel: 'Size' },
  { id: 'tee', name: 'Oversized Tee', price: 349, type: 'single', sizeLabel: 'Size' },
  { id: 'acid_tee', name: 'Acid Wash Oversized Tee', price: 399, type: 'single', sizeLabel: 'Size' },
  { id: 'combo1', name: 'COMBO 1 [Oversized (Hoodie + Tee) + Key Chain + Pen]', price: 999, type: 'combo', sizeLabels: ['Hoodie Size', 'Tee Size'] },
  { id: 'combo2', name: 'COMBO 2 [Oversized (Hoodie + Acid Wash Tee) + Key Chain + Pen]', price: 1049, type: 'combo', sizeLabels: ['Hoodie Size', 'Acid Tee Size'] },
]

const SIZES = ['S', 'M', 'L', 'XL', 'XXL']

const MERCH_GALLERY = [
  { id: 'hoodie', name: 'Oversized Hoodie', price: 669, views: [
    { src: hoodieFront, label: 'Front' },
    { src: hoodieBack, label: 'Back' },
    { src: hoodieSide, label: 'Side' },
    { src: hoodieCollage, label: 'Collage' },
  ]},
  { id: 'tee', name: 'Oversized Tee', price: 349, views: [
    { src: teeFront, label: 'Front' },
    { src: teeBack, label: 'Back' },
  ]},
  { id: 'acid_tee', name: 'Acid Wash Tee', price: 399, views: [
    { src: acidFront, label: 'Front' },
    { src: acidBack, label: 'Back' },
  ]},
]

export function MerchModal({ isOpen, onClose }: MerchModalProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const unlockScrollRef = useRef<(() => void) | null>(null)
  const isOpenRef = useRef(isOpen)

  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

  useEffect(() => {
    return () => {
      unlockScrollRef.current?.()
      unlockScrollRef.current = null
    }
  }, [])

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    transactionId: '',
  })
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [itemSizes, setItemSizes] = useState<Record<string, { size1: string; size2?: string }>>({})
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Toast State
  const [toast, setToast] = useState<{ msg: string; type: 'error' | 'success' } | null>(null)

  // Per-card active view index (each product has its own carousel)
  const [activeViews, setActiveViews] = useState<number[]>(MERCH_GALLERY.map(() => 0))

  // Fullscreen viewer state
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerProduct, setViewerProduct] = useState(0)
  const [viewerIndex, setViewerIndex] = useState(0)
  const touchStartX = useRef(0)
  const touchDeltaX = useRef(0)

  // Per-card touch
  const cardTouchStart = useRef(0)
  const cardTouchDelta = useRef(0)
  const cardTouchProduct = useRef(0)

  const setCardView = (productIdx: number, viewIdx: number) => {
    setActiveViews(prev => { const n = [...prev]; n[productIdx] = viewIdx; return n })
  }

  const cardPrev = (pIdx: number) => {
    const views = MERCH_GALLERY[pIdx].views
    setActiveViews(prev => { const n = [...prev]; n[pIdx] = (n[pIdx] - 1 + views.length) % views.length; return n })
  }

  const cardNext = (pIdx: number) => {
    const views = MERCH_GALLERY[pIdx].views
    setActiveViews(prev => { const n = [...prev]; n[pIdx] = (n[pIdx] + 1) % views.length; return n })
  }

  const handleCardTouchStart = (e: React.TouchEvent, pIdx: number) => {
    cardTouchStart.current = e.touches[0].clientX; cardTouchDelta.current = 0; cardTouchProduct.current = pIdx
  }
  const handleCardTouchMove = (e: React.TouchEvent) => { cardTouchDelta.current = e.touches[0].clientX - cardTouchStart.current }
  const handleCardTouchEnd = () => {
    if (Math.abs(cardTouchDelta.current) > 40) {
      if (cardTouchDelta.current < 0) cardNext(cardTouchProduct.current)
      else cardPrev(cardTouchProduct.current)
    }
    cardTouchDelta.current = 0
  }

  const openViewer = (productIdx: number) => {
    setViewerProduct(productIdx)
    setViewerIndex(activeViews[productIdx])
    setViewerOpen(true)
  }

  const closeViewer = () => setViewerOpen(false)

  const currentProduct = MERCH_GALLERY[viewerProduct]
  const viewerPrev = () => setViewerIndex((i) => (i - 1 + currentProduct.views.length) % currentProduct.views.length)
  const viewerNext = () => setViewerIndex((i) => (i + 1) % currentProduct.views.length)

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; touchDeltaX.current = 0 }
  const handleTouchMove = (e: React.TouchEvent) => { touchDeltaX.current = e.touches[0].clientX - touchStartX.current }
  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 50) {
      if (touchDeltaX.current < 0) viewerNext()
      else viewerPrev()
    }
    touchDeltaX.current = 0
  }

  // Keyboard nav for viewer
  useEffect(() => {
    if (!viewerOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') viewerPrev()
      else if (e.key === 'ArrowRight') viewerNext()
      else if (e.key === 'Escape') closeViewer()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [viewerOpen, viewerProduct])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewerOpen) return
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose, viewerOpen])

  // Calculate dynamic total price
  const totalAmount = useMemo(() => {
    return selectedItems.reduce((total, itemId) => {
      const item = MERCH_OPTIONS.find((opt) => opt.id === itemId)
      return total + (item ? item.price : 0)
    }, 0)
  }, [selectedItems])

  // Animate in/out
  useEffect(() => {
    if (!overlayRef.current || !contentRef.current) return

    const reduceMotion =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    if (isOpen) {
      unlockScrollRef.current?.()
      unlockScrollRef.current = lockBodyScroll()
      gsap.set(overlayRef.current, { display: 'flex' })

      if (reduceMotion) {
        gsap.set(overlayRef.current, { opacity: 1 })
        gsap.set(contentRef.current, { y: 0, opacity: 1, scale: 1 })

        const cards = cardsRef.current.filter(Boolean)
        if (cards.length) {
          gsap.set(cards, { y: 0, opacity: 1, scale: 1 })
        }
      } else {
        gsap.to(overlayRef.current, { opacity: 1, duration: 0.4, ease: 'power2.out' })
        gsap.fromTo(
          contentRef.current,
          { y: 40, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.2)', delay: 0.15 }
        )
        // Stagger animate each product card
        const cards = cardsRef.current.filter(Boolean)
        if (cards.length) {
          gsap.fromTo(cards,
            { y: 60, opacity: 0, scale: 0.9 },
            { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.4)', stagger: 0.15, delay: 0.4 }
          )
        }
      }
    } else {
      if (reduceMotion) {
        gsap.set(contentRef.current, { y: 0, opacity: 0, scale: 0.95 })
        gsap.set(overlayRef.current, { opacity: 0 })
        if (!isOpenRef.current) overlayRef.current.style.display = 'none'

        if (!isOpenRef.current) {
          unlockScrollRef.current?.()
          unlockScrollRef.current = null
        }

        return
      }

      gsap.to(contentRef.current, { y: 30, opacity: 0, scale: 0.95, duration: 0.3, ease: 'power2.in' })
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.35,
        delay: 0.1,
        ease: 'power2.in',
        onComplete: () => {
          if (!isOpenRef.current) {
            if (overlayRef.current) overlayRef.current.style.display = 'none'
            unlockScrollRef.current?.()
            unlockScrollRef.current = null
          }
        },
      })
    }
  }, [isOpen])

  const showToast = (msg: string, type: 'error' | 'success' = 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000) // Hide after 4s
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleMerchToggle = (itemId: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        const newSizes = { ...itemSizes }
        delete newSizes[itemId]
        setItemSizes(newSizes)
        return prev.filter((id) => id !== itemId)
      } else {
        return [...prev, itemId]
      }
    })
  }

  const handleSizeChange = (itemId: string, sizeKey: 'size1' | 'size2', sizeValue: string) => {
    setItemSizes((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [sizeKey]: sizeValue,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validations (Triggering Toasts)
    if (!formData.fullName || !formData.email || !formData.phone || !formData.transactionId) {
      return showToast('Please fill out all personal details and transaction ID.')
    }
    if (selectedItems.length === 0) {
      return showToast('Please select at least one item.')
    }

    // Check sizes for all selected items
    for (const id of selectedItems) {
      const opt = MERCH_OPTIONS.find((o) => o.id === id)
      if (!opt) continue

      if (opt.type === 'single') {
        if (!itemSizes[id]?.size1) return showToast(`Please select a size for ${opt.name}`)
      } else if (opt.type === 'combo') {
        if (!itemSizes[id]?.size1 || !itemSizes[id]?.size2) {
          return showToast(`Please select both sizes for ${opt.name}`)
        }
      }
    }

    if (!file) {
      return showToast('Please upload a screenshot of your payment.')
    }

    // Passed validation, proceed with submission
    setIsSubmitting(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('payment_proofs').upload(fileName, file)
      if (uploadError) throw new Error('Image upload failed: ' + uploadError.message)

      const {
        data: { publicUrl },
      } = supabase.storage.from('payment_proofs').getPublicUrl(fileName)

      const formattedItems = selectedItems.map(id => {
         const itemData = MERCH_OPTIONS.find(m => m.id === id)
         return {
            item: itemData?.name,
            size1: itemSizes[id]?.size1,
            size2: itemSizes[id]?.size2 || null // Only present for combos
         }
      })

      const { error: dbError } = await supabase.from('merch_orders').insert([
        {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          items_ordered: formattedItems,
          total_amount: totalAmount,
          transaction_id: formData.transactionId,
          proof_url: publicUrl,
        },
      ])
      if (dbError) throw new Error('Database error: ' + dbError.message)

      showToast('Order placed successfully! We will verify your payment.', 'success')
      
      // Reset form
      setFormData({ fullName: '', email: '', phone: '', transactionId: '' })
      setSelectedItems([])
      setItemSizes({})
      setFile(null)
      const fileInput = document.getElementById('merch-file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      
      // Optional: Close modal automatically after success
      // setTimeout(() => onClose(), 2000)

    } catch (error: any) {
      showToast(error.message || 'Something went wrong.', 'error')
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
    <div 
      ref={overlayRef} 
      className="merch-overlay" 
      onClick={handleOverlayClick} 
      style={{ display: 'none', opacity: 0 }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="merch-bg-layer" style={{ backgroundImage: `url(${background})` }} />

      {toast && (
        <div className={`merch-toast merch-toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}

      {/* Fullscreen Viewer */}
      {viewerOpen && (
        <div className="merch-viewer-overlay" onClick={closeViewer}>
          <div className="merch-viewer-container" onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
          >
            <button type="button" className="merch-viewer-close" onClick={closeViewer}>&times;</button>
            <button type="button" className="merch-viewer-arrow merch-viewer-arrow-left" onClick={viewerPrev}>&#8249;</button>
            
            <div className="merch-viewer-img-wrap">
              <img
                src={currentProduct.views[viewerIndex].src}
                alt={currentProduct.views[viewerIndex].label}
                decoding="async"
              />
            </div>

            <button type="button" className="merch-viewer-arrow merch-viewer-arrow-right" onClick={viewerNext}>&#8250;</button>

            <div className="merch-viewer-info">
              <h3>{currentProduct.name} — ₹{currentProduct.price}</h3>
              <span className="merch-viewer-view-label">{currentProduct.views[viewerIndex].label} View</span>
              <div className="merch-viewer-dots">
                {currentProduct.views.map((_, i) => (
                  <span key={i} className={`merch-viewer-dot ${i === viewerIndex ? 'active' : ''}`} onClick={() => setViewerIndex(i)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div ref={contentRef} className="merch-content" data-lenis-prevent="true">
        <button type="button" className="merch-close-btn" onClick={onClose} aria-label="Close">&times;</button>

        <h1 className="merch-title">Exodia'26 Merchandise</h1>
        <p className="merch-subtitle">Grab your official fest gear — limited drops, unlimited vibes</p>

        {/* ─── HERO PRODUCT SHOWCASE ─── */}
        <div className="merch-hero-grid">
          {MERCH_GALLERY.map((product, pIdx) => (
            <div 
              key={product.id} 
              className="merch-product-card"
              ref={el => { cardsRef.current[pIdx] = el }}
            >
              {/* Image area with swipe */}
              <div 
                className="merch-card-img-area"
                onTouchStart={(e) => handleCardTouchStart(e, pIdx)}
                onTouchMove={handleCardTouchMove}
                onTouchEnd={handleCardTouchEnd}
                onClick={() => openViewer(pIdx)}
              >
                <img 
                  src={product.views[activeViews[pIdx]].src} 
                  alt={`${product.name} ${product.views[activeViews[pIdx]].label}`} 
                  className="merch-card-img"
                  decoding="async"
                />
                <span className="merch-card-expand-hint">Click to expand</span>
                
                {/* Mini arrows */}
                {product.views.length > 1 && (
                    <>
                      <button type="button" className="merch-card-arrow merch-card-arrow-l" onClick={(e) => { e.stopPropagation(); cardPrev(pIdx) }}>&#8249;</button>
                      <button type="button" className="merch-card-arrow merch-card-arrow-r" onClick={(e) => { e.stopPropagation(); cardNext(pIdx) }}>&#8250;</button>
                    </>
                  )}
              </div>

              {/* View dots */}
              <div className="merch-card-dots">
                {product.views.map((v, i) => (
                  <button 
                    type="button"
                    key={i} 
                    className={`merch-card-dot ${i === activeViews[pIdx] ? 'active' : ''}`}
                    onClick={() => setCardView(pIdx, i)}
                  >
                    {v.label}
                  </button>
                ))}
              </div>

              {/* Info */}
              <div className="merch-card-info">
                <h3 className="merch-card-name">{product.name}</h3>
                <span className="merch-card-price">₹{product.price}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ─── DIVIDER ─── */}
        <div className="merch-divider">
          <span>Place Your Order</span>
        </div>

        {/* ─── ORDER SECTION ─── */}
        <div className="merch-order-section">
          {/* QR */}
          <div className="merch-qr-section">
            <img
              src={qr}
              alt="Payment QR Code"
              className="merch-qr-img"
              decoding="async"
            />
            <div className="merch-qr-details">
              <p className="merch-qr-label">Scan to Pay</p>
              <div className="merch-fee-box">
                <p className="merch-fee-label">Total Payable</p>
                <p className="merch-fee-amount">₹{totalAmount}</p>
              </div>
              <p className="merch-qr-note">Select items below, pay, then submit.</p>
            </div>
          </div>

          {/* Form */}
          <form className="merch-form" onSubmit={handleSubmit}>
            <div className="merch-form-grid">
              <div className="merch-field merch-field-full">
                <label>Full Name</label>
                <input name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" placeholder="John Doe" />
              </div>
              <div className="merch-field">
                <label>Email Address</label>
                <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="john@example.com" />
              </div>
              <div className="merch-field">
                <label>Phone Number</label>
                <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="+91 98765 43210" />
              </div>

              <div className="merch-field merch-field-full">
                <label>Select Merchandise</label>
                <div className="merch-selection-list">
                  {MERCH_OPTIONS.map((option) => {
                    const isSelected = selectedItems.includes(option.id)
                    return (
                      <div key={option.id} className="merch-item-row">
                        <label className="merch-checkbox-label">
                          <input type="checkbox" checked={isSelected} onChange={() => handleMerchToggle(option.id)} />
                          <span className="merch-item-name">{option.name}</span>
                          <span className="merch-item-price">₹{option.price}</span>
                        </label>
                        
                        {isSelected && option.type === 'single' && (
                          <select className="merch-size-select" value={itemSizes[option.id]?.size1 || ''} onChange={(e) => handleSizeChange(option.id, 'size1', e.target.value)}>
                            <option value="" disabled>Select Size</option>
                            {SIZES.map(size => <option key={size} value={size}>{size}</option>)}
                          </select>
                        )}

                        {isSelected && option.type === 'combo' && option.sizeLabels && (
                          <div className="merch-combo-sizes">
                            <select className="merch-size-select" value={itemSizes[option.id]?.size1 || ''} onChange={(e) => handleSizeChange(option.id, 'size1', e.target.value)}>
                              <option value="" disabled>{option.sizeLabels[0]}</option>
                              {SIZES.map(size => <option key={size} value={size}>{size}</option>)}
                            </select>
                            <select className="merch-size-select" value={itemSizes[option.id]?.size2 || ''} onChange={(e) => handleSizeChange(option.id, 'size2', e.target.value)}>
                              <option value="" disabled>{option.sizeLabels[1]}</option>
                              {SIZES.map(size => <option key={size} value={size}>{size}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="merch-field merch-field-full">
                <label>Transaction ID</label>
                <input name="transactionId" value={formData.transactionId} onChange={handleInputChange} type="text" placeholder="UPI Ref / Transaction Number" style={{ fontFamily: 'monospace' }} />
              </div>
              <div className="merch-field merch-field-full">
                <label>Proof of Payment (Screenshot)</label>
                <input id="merch-file-upload" type="file" onChange={handleFileChange} accept="image/*" className="merch-file-input" />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className={`merch-submit-btn ${isSubmitting ? 'disabled' : ''}`}>
              {isSubmitting ? 'Placing Order...' : 'Complete Purchase'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
