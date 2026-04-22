import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCMS } from '../../context/CMSContext';
import './About.css';

/* ── Animated skill bar ──────────────────────── */
function SkillBar({ label, pct, delay = 0 }) {
  const [w, setW] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 300 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div className="ab-skill" ref={ref}>
      <div className="ab-skill__head">
        <span className="ab-skill__label">{label}</span>
        <span className="ab-skill__pct">{pct}%</span>
      </div>
      <div className="ab-skill__track">
        <div className="ab-skill__fill" style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}

const skills = [
  { label: 'Hard Surface Modeling', pct: 95 },
  { label: 'PBR Texturing', pct: 90 },
  { label: 'Retopology', pct: 85 },
  { label: 'UV Unwrapping', pct: 82 },
  { label: 'Digital Sculpting', pct: 80 },
  { label: 'Lighting & Rendering', pct: 78 },
];

const software3D = ['Autodesk Maya', '3ds Max', 'ZBrush', 'Substance Painter', 'Unreal Engine'];
const software2D = ['Adobe Photoshop', 'Adobe Illustrator', 'Adobe Premiere Pro', 'Adobe After Effects', 'Krita'];
const certs = ['Diploma in Painting (Fine Art)', '3D Animation & VFX Training'];

const education = [
  { title: '3D Animation & VFX', period: '2025 – Present' },
  { title: 'Diploma in Painting', period: '2021 – 2023' },
  { title: 'Higher Secondary (12th)', period: 'Science Stream' },
  { title: 'Schooling (10th)', period: 'SEBA Board' },
];

export default function About() {
  const { data } = useCMS();
  const { about } = data;
  const navigate = useNavigate();

  const socials = [
    { label: 'ArtStation', href: about?.socials?.artstation || '#', icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M0 17.723l2.027 3.505h.001a2.424 2.424 0 0 0 2.164 1.333h13.457l-2.792-4.838H0zm24 .025c0-.484-.143-.927-.388-1.3L15.728 2.728a2.424 2.424 0 0 0-2.164-1.333H9.419L21.598 22.54l1.92-3.325c.32-.55.482-1.16.482-1.467zm-11.129-3.462L7.428 4.858l-5.444 9.428h10.887z" /></svg> },
    { label: 'Behance', href: about?.socials?.behance || '#', icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.69.767-.64.168-1.31.254-2.01.254H0V4.53h6.938zm-.387 5.58c.585 0 1.063-.14 1.44-.418.376-.28.563-.722.563-1.33 0-.335-.06-.614-.18-.846-.12-.23-.3-.41-.51-.546-.21-.135-.45-.226-.72-.273-.27-.048-.56-.072-.86-.072H3.24v3.486h3.31zm.19 5.81c.32 0 .624-.03.908-.093.285-.06.535-.165.75-.31.21-.145.38-.35.51-.6.13-.247.196-.566.196-.955 0-.76-.21-1.307-.635-1.64-.424-.335-1-.504-1.73-.504H3.24v4.1h3.5zm8.45-5.06h5.97c-.1-.76-.4-1.35-.87-1.77-.48-.41-1.07-.62-1.78-.62-.43 0-.82.07-1.16.22-.34.15-.63.35-.87.6-.24.26-.43.56-.56.9zm6.01 3.6c-.35.6-.87 1.07-1.55 1.41-.68.34-1.45.52-2.3.52-.68 0-1.3-.11-1.86-.33-.56-.22-1.05-.53-1.45-.93-.4-.4-.71-.88-.93-1.44-.22-.56-.33-1.17-.33-1.84 0-.66.11-1.27.33-1.82.22-.55.53-1.03.93-1.43.4-.4.88-.71 1.44-.93.56-.22 1.17-.33 1.84-.33.7 0 1.32.12 1.87.37.54.25 1 .58 1.36 1 .36.42.63.91.8 1.47.18.56.27 1.15.27 1.77v.6h-8.31c.08.7.34 1.24.77 1.62.43.38.97.57 1.6.57.5 0 .93-.12 1.27-.35.34-.23.62-.52.82-.87l2.37.9zM21.59 5.5h-6.2v1.37h6.2V5.5z" /></svg> },
    { label: 'Instagram', href: about?.socials?.instagram || '#', icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg> },
    { label: 'LinkedIn', href: about?.socials?.linkedin || '#', icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.37 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 23.2 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
    { label: 'Facebook', href: about?.socials?.facebook || '#', icon: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> },
  ];

  return (
    <div className="ab-wrap">

      {/* ══ LEFT SIDEBAR ═══════════════════════════════ */}
      <aside className="ab-sidebar">

        <div className="ab-sb-block">
          <p className="ab-sb-label">Software</p>
          <div className="ab-sb-tags">
            {software3D.map(s => <span key={s} className="ab-tag">{s}</span>)}
          </div>
        </div>

        <div className="ab-sb-divider" />

        <div className="ab-sb-block">
          <p className="ab-sb-label">2D / Editing</p>
          <div className="ab-sb-tags">
            {software2D.map(s => <span key={s} className="ab-tag">{s}</span>)}
          </div>
        </div>

        <div className="ab-sb-divider" />

        <div className="ab-sb-block">
          <p className="ab-sb-label">Additional Skill</p>
          <span className="ab-tag">Fine Art (Painting)</span>
        </div>

        <div className="ab-sb-divider" />

        <div className="ab-sb-block">
          <p className="ab-sb-label">Certification</p>
          <div className="ab-sb-tags" style={{ flexDirection: 'column', gap: '5px' }}>
            {certs.map((c, i) => (
              <a key={c} href={`/assets/certs/cert-${i + 1}.pdf`} download className="ab-tag ab-cert-tag" title={`Download ${c}`}>
                <span>{c}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="ab-cert-icon">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="ab-sb-divider" />

        <div className="ab-sb-block">
          <p className="ab-sb-label">Address</p>
          <span className="ab-address">Tezpur, Assam, India</span>
        </div>

      </aside>

      {/* ══ RIGHT CONTENT ══════════════════════════════ */}
      <main className="ab-main">

        {/* ── Profile row ─────────────────────────── */}
        <div className="ab-profile">

          {/* Col 1: Image */}
          <div className="ab-profile__img-wrap">
            <img src="/assets/images/profile.png" alt="Suhel J. Rahman" className="ab-profile__img" />
          </div>

          {/* Col 2: Text stack */}
          <div className="ab-profile__info">
            <h1 className="ab-profile__name">
              SUHEL <span className="ab-acc">J. RAHMAN</span>
            </h1>
            <p className="ab-profile__title">3D Modeling &amp; Texturing Artist</p>
            <p className="ab-profile__bio">
              5+ years crafting hyper-realistic 3D assets for games, film &amp; visual effects.
              Blending technical precision with artistic vision — from hard-surface mechs to cinematic environments.
            </p>
            <div className="ab-socials">
              {socials.map(({ label, href, icon }) => (
                <a key={label} href={href} className="ab-social" aria-label={label} target="_blank" rel="noreferrer">
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Col 3: Buttons */}
          <div className="ab-profile__actions">
            <a href="/assets/cv.pdf" download className="ab-btn ab-btn--fill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Download CV
            </a>
            <button className="ab-btn ab-btn--ghost" onClick={() => navigate('/contact')}>
              Hire Me
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>

        </div>{/* end .ab-profile */}

        {/* ── Lower grid ─────────────────────────── */}

        <div className="ab-lower">

          {/* Skills */}
          <div className="ab-panel ab-skills-panel">
            <p className="ab-panel__label">Core Skills</p>
            <div className="ab-skills">
              {skills.map((s, i) => (
                <SkillBar key={s.label} label={s.label} pct={s.pct} delay={i * 60} />
              ))}
            </div>
          </div>

          {/* Right: Experience + Education stacked */}
          <div className="ab-right-col">

            <div className="ab-panel ab-exp-panel">
              <p className="ab-panel__label">Experience</p>
              <div className="ab-exp">
                <div className="ab-exp__dot" />
                <div>
                  <p className="ab-exp__role">3D Artist &amp; Texture Specialist</p>
                  <p className="ab-exp__sub">Freelance — 2021 to Present</p>
                  <p className="ab-exp__desc">
                    Delivered production-grade 3D models, PBR materials, and cinematic renders for global clients.
                  </p>
                </div>
              </div>
            </div>

            <div className="ab-panel ab-edu-panel">
              <p className="ab-panel__label">Education</p>
              <div className="ab-edu">
                {education.map((e, i) => (
                  <div key={i} className="ab-edu__item">
                    <span className="ab-edu__title">{e.title}</span>
                    <span className="ab-edu__period">{e.period}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
