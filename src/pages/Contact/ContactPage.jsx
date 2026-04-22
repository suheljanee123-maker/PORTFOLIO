import React from 'react';
import PageHero from '../../components/PageHero/PageHero';
import Contact from '../../components/Contact/Contact';
import './ContactPage.css';

export default function ContactPage() {
  return (
    <div className="contact-page">
      <PageHero
        eyebrow="Get In Touch"
        title="Let's"
        accent="Collaborate"
        description="Have a project in mind? I'm currently accepting new projects and would love to hear from you."
        breadcrumb="Contact"
      />
      <Contact />
    </div>
  );
}
