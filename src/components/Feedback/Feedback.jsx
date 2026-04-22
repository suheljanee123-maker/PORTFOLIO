import React, { useRef, useEffect, useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import './Feedback.css';

/* ─── Static star display ─────────────────────────────────────── */
function StarRating({ rating }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(star => (
        <svg
          key={star}
          className={`star ${star <= rating ? 'filled' : ''}`}
          viewBox="0 0 24 24"
          fill={star <= rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

/* ─── Interactive star picker ─────────────────────────────────── */
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="star-picker" role="group" aria-label="Rate your experience">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`star-picker__btn ${star <= (hovered || value) ? 'active' : ''}`}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <svg viewBox="0 0 24 24" fill={star <= (hovered || value) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

/* ─── Animated card ───────────────────────────────────────────── */
function FeedbackCard({ review, index, isNew }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isNew) {
      setTimeout(() => el.classList.add('visible'), 50);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('visible'), index * 120);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index, isNew]);

  return (
    <div className={`feedback-card reveal ${isNew ? 'feedback-card--new' : ''}`} ref={ref}>
      <div className="feedback-card__quote">"</div>
      
      <div className="feedback-card__top">
        <StarRating rating={review.rating} />
        <div className="feedback-card__date">{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
      </div>

      <p className="feedback-card__text">{review.text}</p>
      
      <div className="feedback-card__author">
        <div className="feedback-card__avatar">{review.avatar}</div>
        <div className="feedback-card__author-info">
          <p className="feedback-card__name">{review.name}</p>
          <p className="feedback-card__role">{review.role}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Compact feedback form ───────────────────────────────────── */
function FeedbackForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const initials = name.trim()
    ? name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  function handleSubmit(e) {
    e.preventDefault();
    if (!rating)      { setError('Please select a star rating.'); return; }
    if (!text.trim()) { setError('Please write something about your experience.'); return; }
    if (!name.trim()) { setError('Please enter your name.'); return; }
    setError('');
    onSubmit({ name: name.trim(), role: 'Client', text: text.trim(), rating, avatar: initials });
    setName(''); setText(''); setRating(0);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  }

  return (
    <form className="feedback-form" onSubmit={handleSubmit} noValidate>

      {/* Single compact row */}
      <div className="feedback-form__strip">

        {/* Title */}
        <div className="feedback-form__strip-label">
          <div className="feedback-form__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
          </div>
          <span className="feedback-form__title">Your Review</span>
        </div>

        {/* Stars */}
        <div className="feedback-form__strip-group">
          <label className="feedback-form__label">Rating</label>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        {/* Name */}
        <div className="feedback-form__strip-group">
          <label className="feedback-form__label" htmlFor="fb-name">Name</label>
          <input
            id="fb-name"
            className="feedback-form__input"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        {/* Message — grows to fill remaining space */}
        <div className="feedback-form__strip-group feedback-form__strip-grow">
          <label className="feedback-form__label" htmlFor="fb-text">Message</label>
          <textarea
            id="fb-text"
            className="feedback-form__textarea"
            placeholder="Share your experience…"
            value={text}
            onChange={e => setText(e.target.value)}
            rows={1}
          />
        </div>

        {/* Submit */}
        <button type="submit" className="feedback-form__btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
          Send
        </button>

      </div>

      {/* Inline messages */}
      <div className="feedback-form__messages">
        {error     && <p className="feedback-form__error"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> {error}</p>}
        {submitted && <div className="feedback-form__success"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Thank you! Your review is live below.</div>}
      </div>

    </form>
  );
}

/* ─── Main section ────────────────────────────────────────────── */
export default function Feedback() {
  const { data } = useCMS();
  const { feedback } = data;
  const [userReviews, setUserReviews] = useState([]);

  function handleNewReview(review) {
    setUserReviews(prev => [{ ...review, id: `user-${Date.now()}` }, ...prev]);
  }

  const allReviews = [...userReviews, ...feedback];

  return (
    <section className="section feedback">
      <div className="container">

        <div className="feedback__bg-orbs">
          <div className="feedback__bg-orb-1" />
          <div className="feedback__bg-orb-2" />
        </div>

        {/* 1 — Compact form */}
        <FeedbackForm onSubmit={handleNewReview} />

        <div className="section-header" style={{ marginTop: '100px', marginBottom: '40px' }}>
          <span className="eyebrow">Testimonials</span>
          <h2 className="display-md">Wall of <span className="accent-text">Love</span></h2>
        </div>

        {/* Unique 3D Perspective Marquee Wall */}
        <div className="feedback__marquee-perspective">
          <div className="feedback__marquee-wall">
            
            {/* Row 1 — Right */}
            <div className="feedback__marquee-row feedback__marquee-row--right">
              {[...allReviews, ...allReviews].map((review, i) => (
                <FeedbackCard key={`${review.id}-r1-${i}`} review={review} index={i} />
              ))}
            </div>

            {/* Row 2 — Left */}
            <div className="feedback__marquee-row feedback__marquee-row--left">
              {[...allReviews, ...allReviews].reverse().map((review, i) => (
                <FeedbackCard key={`${review.id}-r2-${i}`} review={review} index={i} />
              ))}
            </div>

            {/* Row 3 — Right */}
            <div className="feedback__marquee-row feedback__marquee-row--right">
              {[...allReviews, ...allReviews].map((review, i) => (
                <FeedbackCard key={`${review.id}-r3-${i}`} review={review} index={i} />
              ))}
            </div>

          </div>
          
          {/* Edge gradients for smooth fade */}
          <div className="feedback__marquee-fade feedback__marquee-fade--left" />
          <div className="feedback__marquee-fade feedback__marquee-fade--right" />
        </div>

      </div>
    </section>
  );
}
