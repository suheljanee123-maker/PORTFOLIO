import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './PillNav.css';

const PillNav = ({
  items = [],
  logo = '',
  logoAlt = 'Logo',
  baseColor = '#ff6000',
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const circleRefs = useRef([]);
  const logoImgRef = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;

        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;
        circle.style.left = `calc(50% - ${D / 2}px)`;
        circle.dataset.translateY = `${-h - delta}px`;
      });
    };

    layout();
    window.addEventListener('resize', layout);

    if (initialLoadAnimation && navItemsRef.current && logoRef.current) {
      logoRef.current.style.animation = 'pillNavFadeInX 0.6s cubic-bezier(0.2, 0, 0, 1) forwards';
      const items = navItemsRef.current.querySelectorAll('.pill-nav-item');
      items.forEach((item, i) => {
        item.style.opacity = '0';
        item.style.animation = `pillNavFadeInY 0.6s cubic-bezier(0.2, 0, 0, 1) forwards ${0.2 + (i * 0.1)}s`;
      });
    }

    return () => window.removeEventListener('resize', layout);
  }, [items, initialLoadAnimation]);

  const handleMouseEnter = (i) => {
    const circle = circleRefs.current[i];
    if (circle) {
      circle.style.transform = `translateY(${circle.dataset.translateY})`;
      circle.style.transition = 'transform 0.4s cubic-bezier(0.2, 0, 0, 1)';
    }
  };

  const handleMouseLeave = (i) => {
    const circle = circleRefs.current[i];
    if (circle) {
      circle.style.transform = `translateY(0)`;
      circle.style.transition = 'transform 0.4s cubic-bezier(0.2, 0, 0, 1)';
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (onMobileMenuClick) onMobileMenuClick(!isMobileMenuOpen);
  };

  return (
    <nav className="pill-nav-container" style={{ '--base': baseColor, '--pill-text': resolvedPillTextColor }}>
      <div className="pill-nav-inner">
        <Link to="/" className="pill-nav-logo" ref={logoRef} style={{ opacity: initialLoadAnimation ? 0 : 1 }}>
          {logo ? (
            <img src={logo} alt={logoAlt} ref={logoImgRef} />
          ) : (
            <span className="pill-nav-logo-text">
              {logoAlt.replace(/\.$/, '')}
              {logoAlt.endsWith('.') && <span className="pill-nav-logo-dot">.</span>}
            </span>
          )}
        </Link>

        <div className="pill-nav-items" ref={navItemsRef}>
          {items.map((item, i) => (
            <Link
              key={i}
              to={item.href}
              className="pill-nav-item"
              onMouseEnter={() => handleMouseEnter(i)}
              onMouseLeave={() => handleMouseLeave(i)}
            >
              <span className="pill-nav-label">{item.label}</span>
              <div className="pill-nav-circle" ref={(el) => (circleRefs.current[i] = el)} />
            </Link>
          ))}
        </div>

        <button 
          className={`pill-nav-hamburger ${isMobileMenuOpen ? 'active' : ''}`} 
          onClick={toggleMobileMenu}
          ref={hamburgerRef}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu-popover" ref={mobileMenuRef}>
          <ul className="mobile-menu-list">
            {items.map((item, i) => (
              <li key={i}>
                <Link to={item.href} className="mobile-menu-link" onClick={() => setIsMobileMenuOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default PillNav;
