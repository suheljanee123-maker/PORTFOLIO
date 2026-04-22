import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const footerLinks = [
  { label: 'Work',     to: '/work'     },
  { label: 'About',    to: '/about'    },
  { label: 'Feedback', to: '/feedback' },
  { label: 'Contact',  to: '/contact'  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="footer">
      <div className="footer__top-line" />
      <div className="container footer__inner">

        {/* Brand */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            SUHEL<span className="accent-text">.</span>
          </Link>
          <p className="footer__tagline">Crafting 3D worlds with cinematic precision.</p>
        </div>

        {/* Navigation */}
        <nav className="footer__nav" aria-label="Footer navigation">
          {footerLinks.map(link => (
            <Link key={link.to} to={link.to} className="footer__nav-link">
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <div className="footer__bottom">
          <p className="footer__copy">© {year} Suhel J. Rahman. All rights reserved.</p>
          <button className="footer__scroll-top" onClick={scrollToTop} aria-label="Scroll to top">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 15l-6-6-6 6"/>
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
