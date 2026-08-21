import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import logo from '../assets/logo.svg';
import '../styles/header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);

  const isAdmin = user?.role === 'admin';

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('touchstart', onOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('touchstart', onOutside);
    };
  }, [open]);

  // Prevent body scroll while menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay behind the slide-in nav */}
      <div
        className={`nav-overlay ${open ? 'visible' : ''}`}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo-link" aria-label="Kainos home">
            <img src={logo} alt="Kainos" />
          </Link>

          <button
            className="menu-toggle"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            aria-controls="main-nav"
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {open ? (
                <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              )}
            </svg>
          </button>

          <nav
            id="main-nav"
            ref={navRef}
            className={`nav ${open ? 'open' : ''}`}
            aria-label="Main navigation"
          >
            {/* Mobile header row inside nav panel */}
            <div className="nav-close" aria-hidden="true">
              <span style={{ fontWeight: 700, color: 'var(--kainos-navy)', paddingLeft: 6 }}>Menu</span>
              <button className="nav-close-btn" onClick={() => setOpen(false)} aria-label="Close menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <Link to="/">Home</Link>
            {user && <Link to="/job-roles">Job Roles</Link>}
            {isAdmin && <Link to="/employees">Employees</Link>}

            {user ? (
              <>
                <div className="user-chip">
                  <span className="user-email" title={user.email}>{user.email}</span>
                  {isAdmin && <span className="admin-tag">ADMIN</span>}
                </div>
                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register" className="cta">Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
