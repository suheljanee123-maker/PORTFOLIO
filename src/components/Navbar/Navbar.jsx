import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const navLinks = [
  { label: 'Home',     to: '/'         },
  { label: 'Work',     to: '/work'     },
  { label: 'About',    to: '/about'    },
  { label: 'Feedback', to: '/feedback' },
  { label: 'Contact',  to: '/contact'  },
];

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navRefs   = useRef([]);
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const totalH  = document.body.scrollHeight - window.innerHeight;
    setScrolled(scrollY > 40);
    setScrollPct(totalH > 0 ? (scrollY / totalH) * 100 : 0);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // init
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Pill Nav logic
  useEffect(() => {
    const updatePill = () => {
      const matchIndex = navLinks.findIndex(link => 
        link.to === '/' ? location.pathname === '/' : location.pathname.startsWith(link.to)
      );
      if (matchIndex !== -1 && navRefs.current[matchIndex]) {
        const el = navRefs.current[matchIndex];
        setPillStyle({
          left: el.offsetLeft,
          width: el.offsetWidth,
          opacity: 1
        });
      } else {
        setPillStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };
    updatePill();
    window.addEventListener('resize', updatePill);
    return () => window.removeEventListener('resize', updatePill);
  }, [location.pathname]);

  const getNavLinkClass = ({ isActive }) =>
    `navbar__link${isActive ? ' active' : ''}`;

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <div className="navbar__inner container">

          {/* Logo */}
          <NavLink to="/" className="navbar__logo">
            <span className="navbar__logo-text">SUHEL</span>
            <span className="navbar__logo-dot">.</span>
          </NavLink>

          {/* Desktop Links (Pill Nav) */}
          <ul className="navbar__links" style={{ position: 'relative' }}>
            <div className="navbar__pill" style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: pillStyle.left,
              width: pillStyle.width,
              opacity: pillStyle.opacity,
              backgroundColor: 'var(--accent-dim)',
              border: '1px solid rgba(255, 106, 0, 0.25)',
              borderRadius: '50px',
              transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
              zIndex: 0,
              pointerEvents: 'none'
            }} />
            {navLinks.map((link, i) => (
              <li key={link.to} ref={el => navRefs.current[i] = el} style={{ position: 'relative', zIndex: 1 }}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={getNavLinkClass}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <NavLink to="/contact" className="navbar__cta btn btn-primary">
            <span>Hire Me</span>
          </NavLink>

          {/* Hamburger */}
          <button
            className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Scroll progress bar */}
        <div className="navbar__progress" style={{ width: `${scrollPct}%` }} />
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
        <ul>
          {navLinks.map(link => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => isActive ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          <li>
            <NavLink
              to="/contact"
              className="mobile-menu__cta"
              onClick={() => setMenuOpen(false)}
            >
              Hire Me →
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
