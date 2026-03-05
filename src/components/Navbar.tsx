import { Link, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Bell } from 'lucide-react';
import { loadGsap, prefetchAnimationLibs } from '../utils/lazyAnimations'

interface NavbarProps {
  shouldAnimate?: boolean
  onRegisterClick?: () => void
  onNotifyClick?: () => void
}

export function Navbar({ shouldAnimate = false, onRegisterClick, onNotifyClick }: NavbarProps) {
  const location = useLocation()
  const navRef = useRef<HTMLElement>(null)
  const linksRef = useRef<HTMLUListElement>(null)
  const hasAnimatedRef = useRef(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const mobileTimelineRef = useRef<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // GSAP animation for mobile menu
  useEffect(() => {
    const menu = mobileMenuRef.current
    if (!menu) return

    // Make sure the menu is visible immediately on open (even before GSAP loads)
    if (menuOpen) {
      menu.style.display = 'flex'
    }

    let isCancelled = false
    let tl: any = null

    ;(async () => {
      const { gsap } = await loadGsap()
      if (isCancelled) return

      // Kill previous timeline
      mobileTimelineRef.current?.kill?.()

      const items = menu.querySelectorAll('.mobile-nav-item')
      tl = gsap.timeline({ paused: true })

      if (menuOpen) {
        gsap.set(menu, { display: 'flex' })
        tl.fromTo(
          menu,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }
        ).fromTo(
          items,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 0.3, stagger: 0.06, ease: 'power2.out' },
          '-=0.15'
        )
        tl.play()
      } else {
        tl.to(items, { opacity: 0, x: 20, duration: 0.2, stagger: 0.03, ease: 'power2.in' }).to(
          menu,
          {
            opacity: 0,
            y: -12,
            duration: 0.25,
            ease: 'power2.in',
            onComplete: () => {
              gsap.set(menu, { display: 'none' })
            },
          },
          '-=0.1'
        )
        tl.play()
      }

      mobileTimelineRef.current = tl
    })()

    return () => {
      isCancelled = true
      tl?.kill?.()
    }
  }, [menuOpen])

  // Desktop entrance animation
  useEffect(() => {
    if (shouldAnimate && !hasAnimatedRef.current && navRef.current && linksRef.current) {
      hasAnimatedRef.current = true
      const links = linksRef.current.querySelectorAll('li')
      
      let isCancelled = false
      let tl: any = null

      ;(async () => {
        const { gsap } = await loadGsap()
        if (isCancelled) return

        gsap.set(navRef.current, { y: -100, scale: 0.5, opacity: 1 })
        gsap.set(links, { opacity: 0 })

        tl = gsap.timeline({ delay: 0.1 })
        
        tl.to(navRef.current, {
          y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.2)'
        })
        .to(links, {
          opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out'
        }, '-=0.2')
      })()

      return () => {
        isCancelled = true
        tl?.kill?.()
      }
    }
  }, [shouldAnimate])

  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev)
  }, [])

  const handleMobileLinkClick = useCallback(() => {
    setMenuOpen(false)
  }, [])

  const prefetchRoute = useCallback((to: string) => {
    prefetchAnimationLibs()

    switch (to) {
      case '/events':
        void import('../pages/EventsPage')
        break
      case '/team':
        void import('../pages/TeamPage')
        break
      case '/merchandise':
        void import('../pages/MerchandisePage')
        break
      case '/map':
        void import('../pages/MapPage')
        break
      case '/admin':
        void import('../pages/AdminPage')
        break
      default:
        break
    }
  }, [])

  const navLinks = [
    { to: '/events', label: 'Events' },
    { to: '/team', label: 'Team' },
    { to: '/merchandise', label: 'Merchandise' },
    { to: '/map', label: 'Map' },
  ]

  return (
    <>
      <nav ref={navRef} className="navbar flex items-center justify-between p-4">
        <Link
          to="/"
          className={`navbar-brand ${location.pathname === '/' ? 'active' : ''}`}
        >
          Exodia
        </Link>

        {/* Hamburger button — mobile only */}
        <button
          className={`navbar-hamburger ${menuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line hamburger-line-1" />
          <span className="hamburger-line hamburger-line-2" />
          <span className="hamburger-line hamburger-line-3" />
        </button>
        
        {/* Desktop links */}
        <ul ref={linksRef} className="navbar-links flex items-center gap-6">
          {navLinks.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={location.pathname === to ? 'active' : ''}
                onMouseEnter={() => prefetchRoute(to)}
                onFocus={() => prefetchRoute(to)}
                onTouchStart={() => prefetchRoute(to)}
              >
                {label}
              </Link>
            </li>
          ))}
          
          {/* --- NOTIFICATION BUTTON --- */}
          <li>
            <button
              onClick={onNotifyClick}
              className="group relative flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-yellow-400 transition-all duration-300 font-medium cursor-pointer bg-transparent border-none"
            >
              <Bell 
                size={20} 
                className="group-hover:rotate-[15deg] transition-transform duration-300 text-yellow-500/80 group-hover:text-yellow-400" 
              />
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-yellow-600 to-transparent transition-all duration-300 group-hover:w-full"></span>
            </button>
          </li>

          {/* --- REGISTER BUTTON --- */}
          <li>
            <button
              onClick={onRegisterClick}
              className={`
                inline-block px-5 py-2 font-bold text-black rounded-lg
                bg-gradient-to-r from-yellow-500 to-yellow-400 
                shadow-[0_0_10px_rgba(234,179,8,0.4)]
                transition-all duration-300 transform cursor-pointer border-none
                hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(234,179,8,0.8)] hover:from-yellow-400 hover:to-yellow-300
              `}
            >
              Register
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile slide-down menu */}
      <div ref={mobileMenuRef} className="navbar-mobile-menu">
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`mobile-nav-item ${location.pathname === to ? 'active' : ''}`}
            onClick={handleMobileLinkClick}
            onMouseEnter={() => prefetchRoute(to)}
            onFocus={() => prefetchRoute(to)}
            onTouchStart={() => prefetchRoute(to)}
          >
            {label}
          </Link>
        ))}

        <button
          className="mobile-nav-item mobile-notify-btn"
          onClick={() => { onNotifyClick?.(); handleMobileLinkClick(); }}
        >
          <Bell size={18} />
          Notifications
        </button>

        <button
          className="mobile-nav-item mobile-register-btn"
          onClick={() => { onRegisterClick?.(); handleMobileLinkClick(); }}
        >
          Register
        </button>
      </div>

      {/* Backdrop overlay */}
      {menuOpen && (
        <div className="navbar-mobile-backdrop" onClick={() => setMenuOpen(false)} />
      )}
    </>
  )
}
