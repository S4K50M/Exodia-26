import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import '../styles/notfound.css'; // Make sure the path matches your structure

export function NotFoundPage() {
  return (
    <div className="not-found-container">
      {/* Background ambient glow */}
      <div className="not-found-glow"></div>

      <div className="not-found-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-title">Lost in the Void</h2>
        <p className="error-desc">
          The path you seek has dissolved into the elemental void. 
          Return to the home before you are lost forever.
        </p>
        
        {/* Link back to the home page */}
        <Link to="/" className="return-home-btn">
          <Compass size={22} className="btn-icon" />
          Return to the world
        </Link>
      </div>
    </div>
  );
}