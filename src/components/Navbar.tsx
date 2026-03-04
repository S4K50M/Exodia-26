import { Link, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Bell } from 'lucide-react';
import { prefetchNotifications, prefetchRegisterModal, prefetchRoute } from '../routes'
import { lockBodyScroll } from '../utils/bodyScrollLock'

interface NavbarProps {
  shouldAnimate?: boolean
  onRegisterClick?: () => void
  onNotifyClick?: () => void
}

export function Navbar({ shouldAnimate = false, onRegisterClick, onNotifyClick }: NavbarProps) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const unlockScrollRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      unlockScrollRef.current?.()
      unlockScrollRef.current = null
    }
  }, [])

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return

    unlockScrollRef.current?.()
    unlockScrollRef.current = lockBodyScroll()

    return () => {
      unlockScrollRef.current?.()
      unlockScrollRef.current = null
    }
  }, [menuOpen])

  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev)
  }, [])

  const handleMobileLinkClick = useCallback(() => {
    setMenuOpen(false)
  }, [])

  const navLinks = [
    { to: '/events', label: 'Events' },
    { to: '/team', label: 'Team' },
    { to: '/merchandise', label: 'Merchandise' },
    { to: '/map', label: 'Map' },
  ]

  return (
    <>
      <nav className={`navbar flex items-center justify-between p-4${shouldAnimate ? ' navbar-animate' : ''}`}>
        <Link
          to="/"
          className={`navbar-brand ${location.pathname === '/' ? 'active' : ''}`}
        >
          <img
            src="/exodia.png"
            alt=""
            className="navbar-logo"
            width={28}
            height={28}
            decoding="async"
            aria-hidden="true"
          />
          <span className="navbar-brand-text">Exodia</span>
        </Link>

        {/* Hamburger button — mobile only */}
        <button
          type="button"
          className={`navbar-hamburger ${menuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="navbar-mobile-menu"
        >
          <span className="hamburger-line hamburger-line-1" />
          <span className="hamburger-line hamburger-line-2" />
          <span className="hamburger-line hamburger-line-3" />
        </button>
        
        {/* Desktop links */}
          <ul className="navbar-links flex items-center gap-6">
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
               type="button"
               onClick={onNotifyClick}
               onMouseEnter={prefetchNotifications}
               onFocus={prefetchNotifications}
               onTouchStart={prefetchNotifications}
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
               type="button"
               onClick={onRegisterClick}
               onMouseEnter={prefetchRegisterModal}
               onFocus={prefetchRegisterModal}
               onTouchStart={prefetchRegisterModal}
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
       <div
         id="navbar-mobile-menu"
         className={`navbar-mobile-menu${menuOpen ? ' open' : ''}`}
         aria-hidden={!menuOpen}
       >
         {navLinks.map(({ to, label }) => (
           <Link
             key={to}
             to={to}
             className={`mobile-nav-item ${location.pathname === to ? 'active' : ''}`}
             onClick={handleMobileLinkClick}
             onMouseEnter={() => prefetchRoute(to)}
             onFocus={() => prefetchRoute(to)}
             onTouchStart={() => prefetchRoute(to)}
             tabIndex={menuOpen ? 0 : -1}
           >
             {label}
           </Link>
         ))}

        <button
          type="button"
          className="mobile-nav-item mobile-notify-btn"
          onClick={() => { onNotifyClick?.(); handleMobileLinkClick(); }}
          tabIndex={menuOpen ? 0 : -1}
        >
          <Bell size={18} />
          Notifications
        </button>

        <button
          type="button"
          className="mobile-nav-item mobile-register-btn"
          onClick={() => { onRegisterClick?.(); handleMobileLinkClick(); }}
          tabIndex={menuOpen ? 0 : -1}
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
