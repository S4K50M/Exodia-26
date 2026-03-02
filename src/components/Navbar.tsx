import { Link, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Bell } from 'lucide-react';

interface NavbarProps {
  shouldAnimate?: boolean
  onRegisterClick?: () => void
  onNotifyClick?: () => void // 1. Added to Interface
}

// 2. Added to the destructured arguments
export function Navbar({ shouldAnimate = false, onRegisterClick, onNotifyClick }: NavbarProps) {
  const location = useLocation()
  const navRef = useRef<HTMLElement>(null)
  const linksRef = useRef<HTMLUListElement>(null)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    if (shouldAnimate && !hasAnimatedRef.current && navRef.current && linksRef.current) {
      hasAnimatedRef.current = true
      const links = linksRef.current.querySelectorAll('li') // Select 'li' to animate the whole nav item
      
      gsap.set(navRef.current, {
        y: -100,
        scale: 0.5,
        opacity: 1
      })
      
      gsap.set(links, {
        opacity: 0
      })

      const tl = gsap.timeline({ delay: 0.1 })
      
      tl.to(navRef.current, {
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'back.out(1.2)'
      })
      .to(links, {
        opacity: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out'
      }, '-=0.2')
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
            {/* <span className="absolute top-1.5 left-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-600"></span>
            </span> */}
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
  )
}