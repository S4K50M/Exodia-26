import { Link, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface NavbarProps {
  shouldAnimate?: boolean
}

export function Navbar({ shouldAnimate = false }: NavbarProps) {
  const location = useLocation()
  const navRef = useRef<HTMLElement>(null)
  const linksRef = useRef<HTMLUListElement>(null)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    if (shouldAnimate && !hasAnimatedRef.current && navRef.current && linksRef.current) {
      hasAnimatedRef.current = true
      const links = linksRef.current.querySelectorAll('a')
      
      // Set initial state: above page, half size, buttons invisible
      gsap.set(navRef.current, {
        y: -100,
        scale: 0.5,
        opacity: 1
      })
      
      gsap.set(links, {
        opacity: 0
      })

      // Create animation timeline with a small delay to ensure parent is visible
      const tl = gsap.timeline({ delay: 0.1 })
      
      // 1. Drop down and scale to full size
      tl.to(navRef.current, {
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'back.out(1.2)'
      })
      // 2. Fade in buttons with stagger
      .to(links, {
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out'
      }, '-=0.2') // Start slightly before navbar animation completes
    }
  }, [shouldAnimate])

  return (
    <nav ref={navRef} className="navbar flex items-center justify-between p-4">
      <Link
        to="/"
        className={`navbar-brand ${location.pathname === '/' ? 'active' : ''}`}
      >
        Exodia
      </Link>
      
      <ul ref={linksRef} className="navbar-links flex items-center gap-6">
        <li>
          <Link
            to="/events"
            className={location.pathname === '/events' ? 'active' : ''}
          >
            Events
          </Link>
        </li>
        <li>
          <Link
            to="/team"
            className={location.pathname === '/team' ? 'active' : ''}
          >
            Team
          </Link>
        </li>
        <li>
          <Link
            to="/merchandise"
            className={location.pathname === '/merchandise' ? 'active' : ''}
          >
            Merchandise
          </Link>
        </li>
        
        {/* --- ADDED REGISTER BUTTON HERE --- */}
        <li>
          <Link
            to="/register"
            className={`
              inline-block px-5 py-2 font-bold text-black rounded-lg
              bg-gradient-to-r from-yellow-500 to-yellow-400 
              shadow-[0_0_10px_rgba(234,179,8,0.4)]
              transition-all duration-300 transform 
              hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(234,179,8,0.8)] hover:from-yellow-400 hover:to-yellow-300
              ${location.pathname === '/register' ? 'ring-2 ring-white/50' : ''}
            `}
          >
            Register
          </Link>
        </li>
      </ul>
    </nav>
  )
}