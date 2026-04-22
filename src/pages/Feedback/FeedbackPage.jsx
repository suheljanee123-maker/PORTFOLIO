import React from 'react';
import PageHero from '../../components/PageHero/PageHero';
import Feedback from '../../components/Feedback/Feedback';
import './FeedbackPage.css';

export default function FeedbackPage() {
  return (
    <div className="feedback-page">
      <PageHero
        eyebrow="Testimonials"
        title="Client"
        accent="Feedback"
        description="What clients and collaborators say about working with me — 100% satisfaction rate."
        breadcrumb="Feedback"
      />
      <Feedback />
    </div>
  );
}
