import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArtStation } from '../../hooks/useArtStation';
import './Work.css';

/* ── Skeleton card shown while loading ──────────── */
function SkeletonCard({ size }) {
  return (
    <div className={`project-card project-card--${size} project-card--skeleton`}>
      <div className="skeleton-shimmer" />
    </div>
  );
}

/* ── Project Card ───────────────────────────────── */
function ProjectCard({ project, index, onClick }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('visible'), index * 100);
          observer.unobserve(el);
        }
      }, { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={ref}
      className={`project-card project-card--${project.size} reveal`}
      onClick={() => onClick(project.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(project.id)}
    >
      {/* Background image */}
      <div
        className="project-card__bg"
        style={{
          backgroundImage: `url('${project.image}')`,
          transform: hovered ? 'scale(1.07)' : 'scale(1)',
        }}
      />

      {/* Overlays */}
      <div className="project-card__overlay" />
      <div className={`project-card__overlay-hover ${hovered ? 'active' : ''}`} />

      {/* Content */}
      <div className="project-card__content">
        <span className="project-card__category eyebrow">{project.category}</span>
        <h3 className="project-card__title">{project.title}</h3>
        <div className={`project-card__meta ${hovered ? 'visible' : ''}`}>
          <p className="project-card__desc">{project.description}</p>
          <div className="project-card__tags">
            {project.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        </div>
      </div>

      {/* Hover CTA */}
      <div className={`project-card__cta ${hovered ? 'active' : ''}`}>
        <div className="project-card__cta-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M14 5l7 7-7 7"/>
          </svg>
        </div>
        <span>View Project</span>
      </div>

      {/* Year tag */}
      <div className="project-card__year">{project.year}</div>

      {/* Orange glow border */}
      <div className={`project-card__border-glow ${hovered ? 'active' : ''}`} />
    </div>
  );
}

/* ── Work Section ───────────────────────────────── */
export default function Work() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');

  /* ArtStation live data only — no CMS fallback */
  const {
    projects: allProjects,
    loading,
    error,
    synced,
  } = useArtStation({ perPage: 20 });

  const categories = ['All', ...new Set(allProjects.map(p => p.category))];

  const filtered = filter === 'All'
    ? allProjects
    : allProjects.filter(p => p.category === filter);

  const handleCardClick = (id) => navigate(`/work/${id}`);

  /* Skeleton sizes while loading */
  const skeletonSizes = ['featured', 'medium', 'small', 'small', 'medium', 'small'];

  return (
    <section className="section work">
      <div className="container">

        {/* ── Sync status bar ── */}
        <div className="work__sync-bar">
          {loading && (
            <div className="work__sync-badge work__sync-badge--loading">
              <span className="work__sync-dot work__sync-dot--pulse" />
              Syncing with ArtStation…
            </div>
          )}
          {synced && !loading && (
            <div className="work__sync-badge work__sync-badge--live">
              <span className="work__sync-dot" />
              Live from ArtStation
              <span className="work__sync-count">{allProjects.length} projects</span>
            </div>
          )}
          {error && !loading && (
            <div className="work__sync-badge work__sync-badge--offline">
              <span className="work__sync-dot work__sync-dot--offline" />
              Could not reach ArtStation
            </div>
          )}
        </div>

        {/* ── Filter pills — only when data is loaded ── */}
        {synced && !loading && allProjects.length > 0 && (
          <div className="work__filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`work__filter-btn ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* ── Project grid ── */}
        {loading ? (
          /* Skeleton cards */
          <div className="work__grid">
            {skeletonSizes.map((size, i) => <SkeletonCard key={i} size={size} />)}
          </div>
        ) : error && allProjects.length === 0 ? (
          /* ArtStation fetch failed */
          <div className="work__error-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <h3>Could not load projects</h3>
            <p>ArtStation is currently unreachable. Please try again later.</p>
            <a
              href="https://www.artstation.com/suhel"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <span>View on ArtStation directly</span>
            </a>
          </div>
        ) : (
          /* Real ArtStation project cards */
          <div className="work__grid">
            {filtered.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onClick={handleCardClick}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
