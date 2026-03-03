import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import bg from '../assets/merchendise/bg.png'
import left from '../assets/merchendise/left.png'
import right from '../assets/merchendise/right.png'
import leftBg from '../assets/merchendise/left_bg.png'
import rightBg from '../assets/merchendise/right_bg.png'

import '../styles/merchandise.css'

import { LoadingScreen } from '../components/LoadingScreen'
import { MerchSVG } from '../assets/loading/MerchSVG'
import { MerchModal } from '../components/MerchModal' // Adjust path if necessary

gsap.registerPlugin(ScrollTrigger)

export function MerchandisePage() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scrollTriggerRef = useRef<HTMLDivElement | null>(null)
  const bgRef = useRef<HTMLDivElement | null>(null)
  const leftRef = useRef<HTMLDivElement | null>(null)
  const rightRef = useRef<HTMLDivElement | null>(null)
  const leftBgRef = useRef<HTMLDivElement | null>(null)
  const rightBgRef = useRef<HTMLDivElement | null>(null)

  // Add state for the modal
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.1,
    })
    lenis.on('scroll', () => ScrollTrigger.update())

    let frameId: number
    const raf = (time: number) => {
      lenis.raf(time)
      frameId = requestAnimationFrame(raf)
    }
    frameId = requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      cancelAnimationFrame(frameId)
    }
  }, [])

  useEffect(() => {
    const trigger = scrollTriggerRef.current
    if (!trigger) return

    const ctx = gsap.context(() => {
      // bg: move slowly
      if (bgRef.current) {
        gsap.fromTo(
          bgRef.current,
          { x: 0, scale: 1 },
          {
            x: '-5%',
            scale: 1.1,
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 3,
            },
          }
        )
      }

      // left_bg and right_bg: start further out, move forward but don't cross center
      if (leftBgRef.current) {
        gsap.fromTo(
          leftBgRef.current,
          { x: '-20%', z: 0 },
          {
            x: '20%',
            z: 50,
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1.5,
            },
          }
        )
      }

      if (rightBgRef.current) {
        gsap.fromTo(
          rightBgRef.current,
          { x: '20%', z: 0 },
          {
            x: '-20%',
            z: 50,
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1.5,
            },
          }
        )
      }

      // left and right: start off-screen, come into view
      if (leftRef.current) {
        gsap.fromTo(
          leftRef.current,
          { x: '-30%' },
          {
            x: '0%',
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 2,
            },
          }
        )
      }

      if (rightRef.current) {
        gsap.fromTo(
          rightRef.current,
          { x: '30%' },
          {
            x: '0%',
            ease: 'none',
            scrollTrigger: {
              trigger,
              start: 'top top',
              end: 'bottom bottom',
              scrub: 2,
            },
          }
        )
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <>
      <LoadingScreen svg={<MerchSVG />}>
        <div className="merchandise-page" ref={containerRef}>
          <div className="merchandise-scroll-trigger" ref={scrollTriggerRef}>
            <div className="merchandise-stage">
              {/* Background */}
              <div className="merchandise-bg" ref={bgRef}>
                <img src={bg} alt="" />
              </div>

              {/* Background elements - behind left/right, move forward on scroll */}
              <div className="merchandise-side-bg merchandise-side-bg-left" ref={leftBgRef}>
                <img src={leftBg} alt="" />
              </div>
              <div className="merchandise-side-bg merchandise-side-bg-right" ref={rightBgRef}>
                <img src={rightBg} alt="" />
              </div>

              {/* Foreground elements - left/right, slight movement */}
              <div className="merchandise-side merchandise-side-left" ref={leftRef}>
                <img src={left} alt="" />
              </div>
              <div className="merchandise-side merchandise-side-right" ref={rightRef}>
                <img src={right} alt="" />
              </div>

              {/* Centered Button Area */}
              <div className="merchandise-center-content">
                <button 
                  className="merchandise-buy-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  Buy Merchandise
                </button>
              </div>

            </div>
          </div>
        </div>
      </LoadingScreen>

      <MerchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}