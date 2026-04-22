import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="notfound">
      <div className="notfound__bg-grid" aria-hidden="true" />
      <div className="notfound__orb"     aria-hidden="true" />

      <div className="container notfound__inner">
        <div className="notfound__code">404</div>
        <h1 className="notfound__title">
          Page <span className="accent-text">Not Found</span>
        </h1>
        <p className="notfound__desc body-lg">
          Looks like this page wandered off into a black hole.<br />
          Let's get you back to the studio.
        </p>
        <div className="notfound__actions">
          <Link to="/" className="btn btn-primary">
            <span>Back to Home</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
          <Link to="/work" className="btn btn-outline">View Portfolio</Link>
        </div>
      </div>
    </div>
  );
}
