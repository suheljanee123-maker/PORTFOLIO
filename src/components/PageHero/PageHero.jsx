import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PageHero.css';

/**
 * Reusable interior-page hero banner.
 * Props: eyebrow, title, accent (the highlighted word), description, breadcrumb, slideshowImages
 */
export default function PageHero({ eyebrow, title, accent, description, breadcrumb, slideshowImages }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (!slideshowImages || slideshowImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % slideshowImages.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(interval);
  }, [slideshowImages]);

  return (
    <div className={`page-hero ${slideshowImages && slideshowImages.length > 0 ? 'page-hero--has-slideshow' : 'page-hero--text-only'}`}>
      {/* Background decorations */}
      <div className="page-hero__grid" aria-hidden="true" />
      <div className="page-hero__orb"  aria-hidden="true" />

      <div className="container page-hero__inner">
        <div className="page-hero__content-wrap">
          {/* Text Content */}
          <div className="page-hero__text">
            <nav className="page-hero__breadcrumb" aria-label="Breadcrumb">
              <Link to="/" className="page-hero__bc-link">Home</Link>
              <span className="page-hero__bc-sep">/</span>
              <span className="page-hero__bc-current">{breadcrumb || title}</span>
            </nav>

            <span className="eyebrow page-hero__eyebrow">{eyebrow}</span>
            <h1 className="display-md page-hero__title">
              {title}{' '}
              {accent && <span className="accent-text">{accent}</span>}
            </h1>
            <div className="divider" />
            {description && (
              <p className="body-md page-hero__desc">{description}</p>
            )}
          </div>

          {/* Floating Slideshow Frame */}
          {slideshowImages && slideshowImages.length > 0 && (
            <div className="page-hero__frame-wrap">
              <div className="page-hero__frame">
                <div className="page-hero__frame-inner">
                  {slideshowImages.map((img, i) => (
                    <div
                      key={i}
                      className={`page-hero__slide ${i === currentIdx ? 'active' : ''}`}
                      style={{ backgroundImage: `url(${img})` }}
                    />
                  ))}
                  <div className="page-hero__frame-overlay" />
                </div>
                {/* Decorative corners */}
                <div className="page-hero__frame-corner page-hero__frame-corner--tl" />
                <div className="page-hero__frame-corner page-hero__frame-corner--br" />
                <div className="page-hero__frame-glow" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="page-hero__fade" aria-hidden="true" />
    </div>
  );
}
