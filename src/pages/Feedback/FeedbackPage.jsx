import React from 'react';
import PageHero from '../../components/PageHero/PageHero';
import Feedback from '../../components/Feedback/Feedback';
import './FeedbackPage.css';

export default function FeedbackPage() {
  return (
    <div className="feedback-page">
      <PageHero
        eyebrow="Testimonials"
        title="USER "
        accent="IMPRESSIONS"
        description="Give your feedback and be part of the creative journey."
        breadcrumb="Feedback"
      />
      <Feedback />
    </div>
  );
}
