import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCMS } from '../../context/CMSContext';
import heroBg from '../../assets/images/hero_bg.png';
import profileImg from '../../assets/images/profile.png';
import './Hero.css';

export default function Hero() {
  const { data } = useCMS();
  const { hero } = data;
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const parallaxRef = useRef(null);
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const animFrameRef = useRef(null);

  // Parallax on mouse move
  const handleMouseMove = useCallback((e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      setMousePos({ x, y });
    });
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrameRef.current);
      clearTimeout(timer);
    };
  }, [handleMouseMove]);

  const bgX = mousePos.x * -18;
  const bgY = mousePos.y * -10;

  const scrollToWork = () => navigate('/work');

  return (
    <section id="hero" className="hero" ref={sectionRef}>

      {/* Parallax Background */}
      <div
        className="hero__bg"
        ref={parallaxRef}
        style={{
          backgroundImage: `url(${heroBg})`,
        }}
      />

      {/* Overlays */}
      <div className="hero__vignette" />
      <div className="hero__gradient-overlay" />
      <div className="hero__noise" />

      {/* Scanline FX */}
      <div className="hero__scanlines" />

      {/* Floating Orbs */}
      <div className="hero__orb hero__orb--1" />
      <div className="hero__orb hero__orb--2" />
      <div className="hero__orb hero__orb--3" />

      {/* Grid lines */}
      <div className="hero__grid" />

      {/* Content */}
      <div className="container hero__container" ref={contentRef}>

        {/* Left: Text Content */}
        <div className={`hero__content ${isVisible ? 'visible' : ''}`}>

          <span className="hero__eyebrow eyebrow">
            <span className="hero__eyebrow-dot" />
            {hero.eyebrow}
          </span>

          <h1 className="hero__name display-xl">
            <span className="hero__name-line hero__name-line--1">SUHEL</span>
            <span className="hero__name-line hero__name-line--2 accent-text">
              J. RAHMAN
            </span>
          </h1>

          <div className="hero__subtitle-wrap">
            <div className="hero__subtitle-bar" />
            <p className="hero__subtitle">{hero.subtitle}</p>
          </div>

          <p className="hero__description body-lg">
            {hero.description}
          </p>



          <div className="hero__buttons">
            <button className="btn btn-primary" onClick={scrollToWork}>
              <span>View Portfolio</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

          </div>
        </div>

        {/* Right: Profile Card */}
        <div className={`hero__profile-wrap ${isVisible ? 'visible' : ''}`}>
          <div
            className="hero__profile-card"
            style={{
              transform: `perspective(800px) rotateY(${mousePos.x * -5}deg) rotateX(${mousePos.y * 3}deg)`,
            }}
          >
            {/* Glow ring */}
            <div className="hero__profile-ring" />

            {/* Inner glow */}
            <div className="hero__profile-glow" />

            {/* Profile image */}
            <div className="hero__profile-img-wrap">
              <img
                src={profileImg}
                alt="Suhel J. Rahman — 3D Artist"
                className="hero__profile-img"
                onError={(e) => { e.target.src = 'https://www.artstation.com/assets/default_user.jpg'; }}
              />
            </div>



            {/* Corner decorations */}
            <div className="hero__corner hero__corner--tl" />
            <div className="hero__corner hero__corner--br" />
          </div>


        </div>
      </div>

      {/* Bottom fade */}
      <div className="hero__bottom-fade" />
    </section>
  );
}
