import React, { useEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import supabase from '../utils/supabase'

gsap.registerPlugin(ScrollTrigger)

import bg from '../assets/merchendise/bg.png'
import left from '../assets/merchendise/left.png'
import right from '../assets/merchendise/right.png'
import leftBg from '../assets/merchendise/left_bg.png'
import rightBg from '../assets/merchendise/right_bg.png'

import hoodieFront from '../assets/merch/final mockup collage front.png'
import hoodieBack from '../assets/merch/final mockup collage back.png'
import hoodieSide from '../assets/merch/final mockup collage side.png'
import hoodieCollage from '../assets/merch/final mockup collage.png'
import teeFront from '../assets/merch/mockup-tee-front.png'
import teeBack from '../assets/merch/mockup-tee-back.png'
import acidFront from '../assets/merch/acid-wash-front.png'
import acidBack from '../assets/merch/acid-wash-back.png'

import '../styles/merchandise.css'
import '../styles/merch-modal.css'

import { LoadingScreen } from '../components/LoadingScreen'
import { MerchSVG } from '../assets/loading/MerchSVG'

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

export function MerchandisePage() {
  /* ── Refs ───────────────────────────────────────────────────────────── */
  const containerRef = useRef<HTMLDivElement | null>(null)
  const bgRef = useRef<HTMLDivElement | null>(null)
  const leftRef = useRef<HTMLDivElement | null>(null)
  const rightRef = useRef<HTMLDivElement | null>(null)
  const leftBgRef = useRef<HTMLDivElement | null>(null)
  const rightBgRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLDivElement | null>(null)
  const heroContentRef = useRef<HTMLDivElement | null>(null)
  const cardsSectionRef = useRef<HTMLDivElement | null>(null)

  /* ── Merch state ───────────────────────────────────────────────────── */
  const [activeViews, setActiveViews] = useState<number[]>(MERCH_GALLERY.map(() => 0))

  // Fullscreen viewer
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewerProduct, setViewerProduct] = useState(0)
  const [viewerIndex, setViewerIndex] = useState(0)
  const touchStartX = useRef(0)
  const touchDeltaX = useRef(0)

  // Per-card touch
  const cardTouchStart = useRef(0)
  const cardTouchDelta = useRef(0)
  const cardTouchProduct = useRef(0)

  // Order modal
  const [orderOpen, setOrderOpen] = useState(false)

  // Form
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', transactionId: '' })
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [itemSizes, setItemSizes] = useState<Record<string, { size1: string; size2?: string }>>({})
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'error' | 'success' } | null>(null)

  const totalAmount = useMemo(() => {
    return selectedItems.reduce((total, itemId) => {
      const item = MERCH_OPTIONS.find((opt) => opt.id === itemId)
      return total + (item ? item.price : 0)
    }, 0)
  }, [selectedItems])

  /* ── GSAP entrance + scroll-triggered animation ─────────────────────── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Parallax BG entrance */
      if (bgRef.current) {
        gsap.fromTo(bgRef.current, { scale: 1.15 }, { scale: 1.05, duration: 2, ease: 'power2.out' })
        gsap.to(bgRef.current, { scale: 1.08, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 })
      }
      if (leftBgRef.current) {
        gsap.fromTo(leftBgRef.current, { x: '-100%' }, { x: '0%', duration: 1.8, ease: 'power3.out', delay: 0.2 })
      }
      if (rightBgRef.current) {
        gsap.fromTo(rightBgRef.current, { x: '100%' }, { x: '0%', duration: 1.8, ease: 'power3.out', delay: 0.2 })
      }
      if (leftRef.current) {
        gsap.fromTo(leftRef.current, { x: '-120%' }, { x: '0%', duration: 2, ease: 'power3.out', delay: 0.4 })
      }
      if (rightRef.current) {
        gsap.fromTo(rightRef.current, { x: '120%' }, { x: '0%', duration: 2, ease: 'power3.out', delay: 0.4 })
      }

      /* ScrollTrigger: pin hero and animate content from center → top */
      if (heroRef.current && heroContentRef.current) {
        const heroTl = gsap.timeline({
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: '+=60%',
            pin: true,
            scrub: 1,
          },
        })

        heroTl.to(heroContentRef.current, {
          y: '-30vh',
          scale: 0.85,
          duration: 1,
          ease: 'none',
        })
      }

      /* Cards section entrance */
      if (cardsSectionRef.current) {
        gsap.fromTo(
          cardsSectionRef.current,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: cardsSectionRef.current,
              start: 'top 90%',
              end: 'top 50%',
              scrub: 1,
            },
          }
        )
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  /* ── Card view helpers ────────────────────────────────────────────── */
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
  const handleCardTouchMove = (e: React.TouchEvent) => {
    cardTouchDelta.current = e.touches[0].clientX - cardTouchStart.current
  }
  const handleCardTouchEnd = () => {
    if (Math.abs(cardTouchDelta.current) > 40) {
      cardTouchDelta.current < 0 ? cardNext(cardTouchProduct.current) : cardPrev(cardTouchProduct.current)
    }
    cardTouchDelta.current = 0
  }

  /* ── Fullscreen viewer ─────────────────────────────────────────────── */
  const openViewer = (productIdx: number) => {
    setViewerProduct(productIdx)
    setViewerIndex(activeViews[productIdx])
    setViewerOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeViewer = () => {
    setViewerOpen(false)
    if (!orderOpen) document.body.style.overflow = ''
  }

  const currentProduct = MERCH_GALLERY[viewerProduct]
  const viewerPrev = () => setViewerIndex(i => (i - 1 + currentProduct.views.length) % currentProduct.views.length)
  const viewerNext = () => setViewerIndex(i => (i + 1) % currentProduct.views.length)

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; touchDeltaX.current = 0 }
  const handleTouchMove = (e: React.TouchEvent) => { touchDeltaX.current = e.touches[0].clientX - touchStartX.current }
  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 50) { touchDeltaX.current < 0 ? viewerNext() : viewerPrev() }
    touchDeltaX.current = 0
  }

  useEffect(() => {
    if (!viewerOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') viewerPrev()
      else if (e.key === 'ArrowRight') viewerNext()
      else if (e.key === 'Escape') closeViewer()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [viewerOpen, viewerProduct]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Order modal ───────────────────────────────────────────────────── */
  const openOrder = () => { setOrderOpen(true); document.body.style.overflow = 'hidden' }
  const closeOrder = () => { setOrderOpen(false); document.body.style.overflow = '' }

  useEffect(() => {
    if (!orderOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeOrder() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [orderOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Form helpers ──────────────────────────────────────────────────── */
  const showToast = (msg: string, type: 'error' | 'success' = 'error') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 4000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const handleMerchToggle = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        const ns = { ...itemSizes }; delete ns[itemId]; setItemSizes(ns)
        return prev.filter(id => id !== itemId)
      }
      return [...prev, itemId]
    })
  }

  const handleSizeChange = (itemId: string, sizeKey: 'size1' | 'size2', val: string) => {
    setItemSizes(prev => ({ ...prev, [itemId]: { ...prev[itemId], [sizeKey]: val } }))
  }

  /* ── Submit ────────────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.fullName || !formData.email || !formData.phone || !formData.transactionId)
      return showToast('Please fill out all personal details and transaction ID.')
    if (!selectedItems.length) return showToast('Please select at least one item.')
    for (const id of selectedItems) {
      const opt = MERCH_OPTIONS.find(o => o.id === id); if (!opt) continue
      if (opt.type === 'single' && !itemSizes[id]?.size1)
        return showToast(`Select a size for ${opt.name}`)
      if (opt.type === 'combo' && (!itemSizes[id]?.size1 || !itemSizes[id]?.size2))
        return showToast(`Select both sizes for ${opt.name}`)
    }
    if (!file) return showToast('Please upload a screenshot of your payment.')

    setIsSubmitting(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const { error: upErr } = await supabase.storage.from('payment_proofs').upload(fileName, file)
      if (upErr) throw new Error('Image upload failed: ' + upErr.message)
      const { data: { publicUrl } } = supabase.storage.from('payment_proofs').getPublicUrl(fileName)

      const items = selectedItems.map(id => {
        const d = MERCH_OPTIONS.find(m => m.id === id)
        return { item: d?.name, size1: itemSizes[id]?.size1, size2: itemSizes[id]?.size2 || null }
      })

      const { error: dbErr } = await supabase.from('merch_orders').insert([{
        full_name: formData.fullName, email: formData.email, phone: formData.phone,
        items_ordered: items, total_amount: totalAmount,
        transaction_id: formData.transactionId, proof_url: publicUrl,
      }])
      if (dbErr) throw new Error('Database error: ' + dbErr.message)

      showToast('Order placed successfully! We will verify your payment.', 'success')
      setFormData({ fullName: '', email: '', phone: '', transactionId: '' })
      setSelectedItems([]); setItemSizes({}); setFile(null)
      const fi = document.getElementById('merch-file-upload') as HTMLInputElement
      if (fi) fi.value = ''
    } catch (err: any) {
      showToast(err.message || 'Something went wrong.', 'error')
    } finally { setIsSubmitting(false) }
  }

  /* ── JSX ────────────────────────────────────────────────────────────── */
  return (
    <LoadingScreen svg={<MerchSVG />}>
      <div className="merchandise-page" ref={containerRef}>
        {/* Toast */}
        {toast && <div className={`merch-toast merch-toast-${toast.type}`}>{toast.msg}</div>}

        {/* Fullscreen Viewer */}
        {viewerOpen && (
          <div className="merch-viewer-overlay" onClick={closeViewer}>
            <div className="merch-viewer-container" onClick={e => e.stopPropagation()}
              onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
              <button className="merch-viewer-close" onClick={closeViewer}>&times;</button>
              <button className="merch-viewer-arrow merch-viewer-arrow-left" onClick={viewerPrev}>&#8249;</button>
              <div className="merch-viewer-img-wrap">
                <img src={currentProduct.views[viewerIndex].src} alt={currentProduct.views[viewerIndex].label} />
              </div>
              <button className="merch-viewer-arrow merch-viewer-arrow-right" onClick={viewerNext}>&#8250;</button>
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

        {/* ═══ Fixed Parallax Background — covers entire page ═══ */}
        <div className="merch-bg-fixed" ref={bgRef}><img src={bg} alt="" /></div>
        <div className="merch-side-fixed merch-side-left-bg" ref={leftBgRef}><img src={leftBg} alt="" /></div>
        <div className="merch-side-fixed merch-side-right-bg" ref={rightBgRef}><img src={rightBg} alt="" /></div>
        <div className="merch-side-fixed merch-side-left-fg" ref={leftRef}><img src={left} alt="" /></div>
        <div className="merch-side-fixed merch-side-right-fg" ref={rightRef}><img src={right} alt="" /></div>

        {/* ═══ Hero Section — centered buy button ═══ */}
        <section className="merch-hero" ref={heroRef}>
          <div className="merch-hero-content" ref={heroContentRef}>
            <h2 className="merch-page-title">Merchandise</h2>
            <p className="merch-page-subtitle">Official Exodia'26 Gear — Limited Drops</p>
            <button className="merch-buy-btn" onClick={openOrder}>
              Buy Merchandise
            </button>
          </div>
        </section>

        {/* ═══ Cards Section — revealed on scroll ═══ */}
        <section className="merch-cards-section" ref={cardsSectionRef}>
          <div className="merch-hscroll-wrap">
            <div className="merch-hscroll">
              {MERCH_GALLERY.map((product, pIdx) => (
                <div key={product.id} className="merch-hscroll-card">
                  <div className="merch-card-img-area"
                    onTouchStart={e => handleCardTouchStart(e, pIdx)}
                    onTouchMove={handleCardTouchMove}
                    onTouchEnd={handleCardTouchEnd}
                    onClick={() => openViewer(pIdx)}
                  >
                    <img
                      src={product.views[activeViews[pIdx]].src}
                      alt={`${product.name} ${product.views[activeViews[pIdx]].label}`}
                      className="merch-card-img"
                    />
                    <span className="merch-card-expand-hint">Click to expand</span>
                    {product.views.length > 1 && (
                      <>
                        <button className="merch-card-arrow merch-card-arrow-l"
                          onClick={e => { e.stopPropagation(); cardPrev(pIdx) }}>&#8249;</button>
                        <button className="merch-card-arrow merch-card-arrow-r"
                          onClick={e => { e.stopPropagation(); cardNext(pIdx) }}>&#8250;</button>
                      </>
                    )}
                  </div>

                  <div className="merch-card-dots">
                    {product.views.map((v, i) => (
                      <button
                        key={i}
                        className={`merch-card-dot ${i === activeViews[pIdx] ? 'active' : ''}`}
                        onClick={() => setCardView(pIdx, i)}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>

                  <div className="merch-card-info">
                    <h3 className="merch-card-name">{product.name}</h3>
                    <span className="merch-card-price">₹{product.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ Order Modal Overlay ═══ */}
        {orderOpen && (
          <div className="merch-overlay" onClick={closeOrder}>
            <div className="merch-content" onClick={e => e.stopPropagation()}>
              <button className="merch-close-btn" onClick={closeOrder}>&times;</button>
              <h2 className="merch-title">Place Your Order</h2>
              <p className="merch-subtitle">Select items, scan QR to pay, then submit the form.</p>

              <div className="merch-order-section">
                <div className="merch-qr-section">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=example@upi&pn=Exodia"
                    alt="Payment QR Code" className="merch-qr-img"
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
                        {MERCH_OPTIONS.map(option => {
                          const isSelected = selectedItems.includes(option.id)
                          return (
                            <div key={option.id} className="merch-item-row">
                              <label className="merch-checkbox-label">
                                <input type="checkbox" checked={isSelected} onChange={() => handleMerchToggle(option.id)} />
                                <span className="merch-item-name">{option.name}</span>
                                <span className="merch-item-price">₹{option.price}</span>
                              </label>
                              {isSelected && option.type === 'single' && (
                                <select className="merch-size-select" value={itemSizes[option.id]?.size1 || ''}
                                  onChange={e => handleSizeChange(option.id, 'size1', e.target.value)}>
                                  <option value="" disabled>Select Size</option>
                                  {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              )}
                              {isSelected && option.type === 'combo' && option.sizeLabels && (
                                <div className="merch-combo-sizes">
                                  <select className="merch-size-select" value={itemSizes[option.id]?.size1 || ''}
                                    onChange={e => handleSizeChange(option.id, 'size1', e.target.value)}>
                                    <option value="" disabled>{option.sizeLabels[0]}</option>
                                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                  <select className="merch-size-select" value={itemSizes[option.id]?.size2 || ''}
                                    onChange={e => handleSizeChange(option.id, 'size2', e.target.value)}>
                                    <option value="" disabled>{option.sizeLabels[1]}</option>
                                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
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
                      <input name="transactionId" value={formData.transactionId} onChange={handleInputChange}
                        type="text" placeholder="UPI Ref / Transaction Number" style={{ fontFamily: 'monospace' }} />
                    </div>
                    <div className="merch-field merch-field-full">
                      <label>Proof of Payment (Screenshot)</label>
                      <input id="merch-file-upload" type="file" onChange={handleFileChange} accept="image/*" className="merch-file-input" />
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmitting}
                    className={`merch-submit-btn ${isSubmitting ? 'disabled' : ''}`}>
                    {isSubmitting ? 'Placing Order...' : 'Complete Purchase'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </LoadingScreen>
  )
}
