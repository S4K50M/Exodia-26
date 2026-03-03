import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import gsap from 'gsap'
import supabase from '../utils/supabase'

import background from '../assets/merchendise/background.png'

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

export function MerchModal({ isOpen, onClose }: MerchModalProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

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

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      gsap.set(overlayRef.current, { display: 'flex' })
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.4, ease: 'power2.out' })
      gsap.fromTo(
        contentRef.current,
        { y: 40, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.2)', delay: 0.15 }
      )
    } else {
      gsap.to(contentRef.current, { y: 30, opacity: 0, scale: 0.95, duration: 0.3, ease: 'power2.in' })
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.35,
        delay: 0.1,
        ease: 'power2.in',
        onComplete: () => {
          if (overlayRef.current) overlayRef.current.style.display = 'none'
          document.body.style.overflow = ''
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
      // 1. Stop wheel and touch events from bubbling up to the parallax background
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Background image layer */}
      <div className="merch-bg-layer" style={{ backgroundImage: `url(${background})` }} />

      {/* Toast Notification */}
      {toast && (
        <div className={`merch-toast merch-toast-${toast.type}`}>
          {toast.msg}
        </div>
      )}

      {/* Content */}
      <div 
        ref={contentRef} 
        className="merch-content"
        // 2. Tell Lenis natively to ignore this scrollable container
        data-lenis-prevent="true" 
      >
        <button className="merch-close-btn" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <h1 className="merch-title">Buy Merchandise</h1>

        <div className="merch-body">
          {/* QR Section */}
          <div className="merch-qr-section">
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=example@upi&pn=Exodia"
              alt="Payment QR Code"
              className="merch-qr-img"
            />
            <p className="merch-qr-label">Scan to Pay</p>
            <div className="merch-fee-box">
              <p className="merch-fee-label">Total Payable:</p>
              <p className="merch-fee-amount">₹{totalAmount}</p>
            </div>
            <p className="merch-qr-note">Please select your items and complete the payment before submitting.</p>
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

              {/* Merch Selection */}
              <div className="merch-field merch-field-full">
                <label>Select Merchandise</label>
                <div className="merch-selection-list">
                  {MERCH_OPTIONS.map((option) => {
                    const isSelected = selectedItems.includes(option.id)
                    return (
                      <div key={option.id} className="merch-item-row">
                        <label className="merch-checkbox-label">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleMerchToggle(option.id)}
                          />
                          <span className="merch-item-name">{option.name}</span>
                          <span className="merch-item-price">₹{option.price}</span>
                        </label>
                        
                        {/* Dynamic Size Dropdowns */}
                        {isSelected && option.type === 'single' && (
                          <select 
                            className="merch-size-select"
                            value={itemSizes[option.id]?.size1 || ''}
                            onChange={(e) => handleSizeChange(option.id, 'size1', e.target.value)}
                          >
                            <option value="" disabled>Select Size</option>
                            {SIZES.map(size => <option key={size} value={size}>{size}</option>)}
                          </select>
                        )}

                        {isSelected && option.type === 'combo' && option.sizeLabels && (
                          <div className="merch-combo-sizes">
                            <select 
                              className="merch-size-select"
                              value={itemSizes[option.id]?.size1 || ''}
                              onChange={(e) => handleSizeChange(option.id, 'size1', e.target.value)}
                            >
                              <option value="" disabled>{option.sizeLabels[0]}</option>
                              {SIZES.map(size => <option key={size} value={size}>{size}</option>)}
                            </select>
                            
                            <select 
                              className="merch-size-select"
                              value={itemSizes[option.id]?.size2 || ''}
                              onChange={(e) => handleSizeChange(option.id, 'size2', e.target.value)}
                            >
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