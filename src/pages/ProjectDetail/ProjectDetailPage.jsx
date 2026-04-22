import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useArtStation, sanitizeHtml } from '../../hooks/useArtStation';
import Model3DViewer from '../../components/Model3DViewer/Model3DViewer';
import './ProjectDetail.css';

/* ══════════════════════════════════════════════════
   FULL-SCREEN IMAGE LIGHTBOX
══════════════════════════════════════════════════ */
function GalleryLightbox({ images, index, onClose, onNav }) {
  const img = images[index];

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNav(1);
      if (e.key === 'ArrowLeft') onNav(-1);
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose, onNav]);

  return (
    <div className="gl-modal" onClick={onClose}>
      <div className="gl-modal__inner" onClick={e => e.stopPropagation()}>
        <button className="gl-modal__close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <button className="gl-modal__nav gl-modal__nav--prev" onClick={() => onNav(-1)} disabled={images.length <= 1}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>

        <div className="gl-modal__img-wrap">
          <img key={index} src={img} alt={`Image ${index + 1}`} className="gl-modal__img" />
        </div>

        <button className="gl-modal__nav gl-modal__nav--next" onClick={() => onNav(1)} disabled={images.length <= 1}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
        </button>

        <div className="gl-modal__footer">
          <span className="gl-modal__counter">{index + 1} / {images.length}</span>
          <div className="gl-modal__strip">
            {images.map((src, i) => (
              <button key={i} className={`gl-modal__strip-thumb ${i === index ? 'active' : ''}`} onClick={() => onNav(i - index)}>
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   STAT CHIP
══════════════════════════════════════════════════ */
function StatChip({ icon, value, label }) {
  if (!value && value !== 0) return null;
  return (
    <div className="pd-stat">
      <span className="pd-stat__icon">{icon}</span>
      <span className="pd-stat__value">{Number(value).toLocaleString()}</span>
      <span className="pd-stat__label">{label}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   PROJECT DETAIL PAGE
══════════════════════════════════════════════════ */
export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const contentRef = useRef(null);

  /* ArtStation live data only */
  const { projects, loading, synced } = useArtStation({ perPage: 20 });

  const project = projects.find(p => p.id === id);
  const projectIndex = projects.findIndex(p => p.id === id);
  const prevProject = projects[projectIndex - 1] || null;
  const nextProject = projects[projectIndex + 1] || null;

  /* Gallery images (array of URLs for lightbox) */
  const galleryUrls = project?.galleryUrls || (project?.gallery
    ? project.gallery.map(g => typeof g === 'string' ? g : g.url)
    : (project ? [project.image] : []));

  /* Lightbox state */
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const openLightbox = useCallback((i) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const navLightbox = useCallback((dir) => {
    setLightboxIndex(prev => (prev + dir + galleryUrls.length) % galleryUrls.length);
  }, [galleryUrls.length]);

  /* Scroll to top on project change */
  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  /* Parallax for image-fallback hero */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onScroll = () => {
      hero.style.transform = `scale(1.08) translateY(${window.scrollY * 0.25}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Scroll-reveal */
  useEffect(() => {
    const els = contentRef.current?.querySelectorAll('.pd-reveal');
    if (!els) return;
    const io = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.06 }
    );
    els.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.06}s`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, [id]);

  /* ── Loading state (ArtStation still syncing) ── */
  if (loading || (!synced && !project)) {
    return (
      <div className="pd-loading-state">
        <div className="pd-loading-spinner" />
        <p>Loading from ArtStation…</p>
      </div>
    );
  }

  /* ── Not found (synced but ID doesn't exist) ── */
  if (!project) {
    return (
      <div className="pd-not-found">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <h2>Project not found</h2>
        <p>This project may have been removed from ArtStation.</p>
        <Link to="/work" className="btn btn-primary"><span>← Back to Work</span></Link>
      </div>
    );
  }

  const hasEmbed3D = Boolean(project.embed3d);
  const hasLocalModel = Boolean(project.model);
  const has3DModel = hasEmbed3D || hasLocalModel;
  const hasHtmlDesc = Boolean(project.descriptionHtml?.trim());
  const hasStats = (project.likesCount > 0 || project.viewsCount > 0);
  const moreProjects = project.moreByArtist || [];
  const fullGallery = project.gallery || galleryUrls.map(u => ({ url: u }));

  return (
    <div className="project-detail">

      {/* ══════════════════════════════════════════
          HERO — 3D Model or parallax image
      ══════════════════════════════════════════ */}
      <div className={`pd-hero ${has3DModel ? 'pd-hero--3d' : ''}`}>
        <div className="pd-hero__media">
          {hasEmbed3D ? (
            <div key={project.id} className="pd-hero__embed" dangerouslySetInnerHTML={{ __html: project.embed3d }} />
          ) : hasLocalModel ? (
            <Model3DViewer key={project.id} url={project.model} fallbackImage={project.image} alt={project.title} />
          ) : (
            <img key={project.id} ref={heroRef} src={project.image} alt={project.title} className="pd-hero__image" />
          )}
          {!hasEmbed3D && <div className="pd-hero__overlay" />}
        </div>

        <div className="pd-hero__content container">
          <button className="pd-back" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" />
            </svg>
            <span>Back to Work</span>
          </button>

          <div className="pd-hero__meta">
            <span className="eyebrow pd-hero__eyebrow">{project.category}</span>
            <h1 className="pd-hero__title display-lg">{project.title}</h1>
            <div className="pd-hero__badges">
              <span className="pd-hero__year">{project.year}</span>
              {project.tags.slice(0, 4).map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            {has3DModel && (
              <div className="pd-hero__model-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                Interactive 3D Model
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ARTSTATION-STYLE BODY LAYOUT
          Left: stacked images + description
          Right: sticky sidebar
      ══════════════════════════════════════════ */}
      <div className="pd-body container" ref={contentRef}>

        {/* ── LEFT: images + description ── */}
        <div className="pd-main">

          {/* Stats bar (likes / views / comments) */}
          {hasStats && (
            <div className="pd-stats-bar pd-reveal">
              <StatChip
                icon={<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>}
                value={project.likesCount}
                label="Likes"
              />
              <StatChip
                icon={<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>}
                value={project.viewsCount}
                label="Views"
              />
              {project.commentsCount > 0 && (
                <StatChip
                  icon={<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg>}
                  value={project.commentsCount}
                  label="Comments"
                />
              )}
              <a href={project.permalink || `https://www.artstation.com/suhel`} target="_blank" rel="noopener noreferrer" className="pd-stats-bar__link">
                View on ArtStation
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            </div>
          )}

          {/* ── Stacked full-width assets (Images + Videos) ── */}
          <div className="pd-image-stack">
            {fullGallery.map((asset, i) => {
              const isVideo = asset.type === 'video' && asset.embed;
              const url = typeof asset === 'string' ? asset : asset.url;
              const caption = typeof asset === 'object' && asset.title ? asset.title : null;

              if (isVideo) {
                return (
                  <div key={i} className="pd-video-block">
                    <div className="pd-video-block__inner" dangerouslySetInnerHTML={{ __html: asset.embed }} />
                    {caption && <div className="pd-image-block__caption">{caption}</div>}
                  </div>
                );
              }

              return (
                <div
                  key={i}
                  className="pd-image-block"
                  onClick={() => openLightbox(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && openLightbox(i)}
                >
                  <img
                    src={url}
                    alt={caption || `${project.titleRaw || project.title} — asset ${i + 1}`}
                    className="pd-image-block__img"
                    loading="lazy"
                  />
                  <div className="pd-image-block__expand">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                    <span>Expand</span>
                  </div>
                  {caption && <div className="pd-image-block__caption">{caption}</div>}
                </div>
              );
            })}
          </div>

          {/* ── Full description ── */}
          {(hasHtmlDesc || project.description) && (
            <div className="pd-description-block pd-reveal">
              <span className="pd-label eyebrow">Description</span>
              {hasHtmlDesc ? (
                <div
                  className="pd-full-description"
                  dangerouslySetInnerHTML={{ __html: project.descriptionHtml }}
                />
              ) : (
                <p className="pd-description">{project.description}</p>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Sticky sidebar ── */}
        <aside className="pd-sidebar">

          {/* Artist card */}
          <div className="pd-sidebar__card pd-artist-card">
            <div className="pd-artist-card__avatar">
              {project.artist?.avatarUrl ? (
                <img src={project.artist.avatarUrl} alt={project.artist.fullName} />
              ) : (
                <div className="pd-artist-card__avatar-placeholder">
                  {(project.artist?.fullName || 'S')[0]}
                </div>
              )}
            </div>
            <div className="pd-artist-card__info">
              <div className="pd-artist-card__name">{project.artist?.fullName || 'SUHEL J. RAHMAN'}</div>
              <div className="pd-artist-card__headline">{project.artist?.headline || '3D Artist & Digital Creator'}</div>
            </div>
            <a
              href={project.artist?.profileUrl || 'https://www.artstation.com/suhel'}
              target="_blank"
              rel="noopener noreferrer"
              className="pd-artist-card__follow"
            >
              Follow
            </a>
          </div>

          {/* Project info */}
          <div className="pd-sidebar__card">
            <h3 className="pd-sidebar__heading">Project Info</h3>
            {project.publishedLabel && (
              <div className="pd-meta-row">
                <span className="pd-meta-label">Published</span>
                <span className="pd-meta-value">{project.publishedLabel}</span>
              </div>
            )}
            <div className="pd-meta-row">
              <span className="pd-meta-label">Category</span>
              <span className="pd-meta-value">{project.category}</span>
            </div>
            <div className="pd-meta-row">
              <span className="pd-meta-label">Images</span>
              <span className="pd-meta-value">{galleryUrls.length}</span>
            </div>

          </div>

          {/* Software */}
          {project.software?.length > 0 && (
            <div className="pd-sidebar__card">
              <h3 className="pd-sidebar__heading">Software Used</h3>
              <div className="pd-sw-list">
                {project.software.map(s => (
                  <div key={s} className="pd-sw-item">
                    <div className="pd-sw-dot" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {project.tags?.length > 0 && (
            <div className="pd-sidebar__card">
              <h3 className="pd-sidebar__heading">Tags</h3>
              <div className="pd-tag-list">
                {project.tags.map(t => (
                  <span key={t} className="tag">#{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* More by SUHEL */}
          {moreProjects.length > 0 && (
            <div className="pd-sidebar__card">
              <h3 className="pd-sidebar__heading">More by SUHEL</h3>
              <div className="pd-more-grid">
                {moreProjects.map(p => (
                  <a
                    key={p.hashId}
                    href={p.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pd-more-thumb"
                    title={p.title}
                  >
                    <img src={p.cover} alt={p.title} />
                    <div className="pd-more-thumb__overlay">
                      <span>{p.title}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* View on ArtStation CTA */}
          <a
            href={project.permalink || `https://www.artstation.com/suhel`}
            target="_blank"
            rel="noopener noreferrer"
            className="pd-cta-btn"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
            View on ArtStation
          </a>
        </aside>
      </div>

      {/* ══════════════════════════════════════════
          PREV / NEXT NAVIGATION
      ══════════════════════════════════════════ */}
      <div className="pd-nav-projects container">
        {prevProject ? (
          <Link to={`/work/${prevProject.id}`} className="pd-nav-link pd-nav-link--prev">
            <div className="pd-nav-link__label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M5 12l7-7M5 12l7 7" />
              </svg>
              Previous
            </div>
            <div className="pd-nav-link__thumb" style={{ backgroundImage: `url('${prevProject.image}')` }} />
          </Link>
        ) : <div />}

        {nextProject ? (
          <Link to={`/work/${nextProject.id}`} className="pd-nav-link pd-nav-link--next">
            <div className="pd-nav-link__thumb" style={{ backgroundImage: `url('${nextProject.image}')` }} />
            <div className="pd-nav-link__label">
              Next
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M14 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ) : <div />}
      </div>

      {/* ══════════════════════════════════════════
          FULLSCREEN LIGHTBOX
      ══════════════════════════════════════════ */}
      {lightboxIndex !== null && (
        <GalleryLightbox
          images={galleryUrls}
          index={lightboxIndex}
          onClose={closeLightbox}
          onNav={navLightbox}
        />
      )}
    </div>
  );
}
