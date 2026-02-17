import { Link, useLocation } from 'react-router-dom'

export function Navbar() {
  const location = useLocation()

  return (
    <nav className="navbar">
      <Link
        to="/"
        className={`navbar-brand ${location.pathname === '/' ? 'active' : ''}`}
      >
        Exodia
      </Link>
      <ul className="navbar-links">
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
      </ul>
    </nav>
  )
}
