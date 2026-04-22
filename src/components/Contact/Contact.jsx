import React, { useState, useRef, useEffect } from 'react';
import { useCMS } from '../../context/CMSContext';
import './Contact.css';

function ContactItem({ icon, label, value, href, delay }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('visible'), delay);
          obs.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  const content = (
    <>
      <div className="contact-item__icon">{icon}</div>
      <div className="contact-item__info">
        <span className="contact-item__label">{label}</span>
        <span className="contact-item__value">{value}</span>
      </div>
      <div className="contact-item__arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </>
  );

  if (!href || href === '#') {
    return <div className="contact-item reveal no-link" ref={ref}>{content}</div>;
  }

  return (
    <a href={href} className="contact-item reveal" ref={ref} target="_blank" rel="noopener noreferrer">
      {content}
    </a>
  );
}

export default function Contact() {
  const { data } = useCMS();
  const { about } = data;
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);


  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate submission
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactItems = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.9l.27.02z"/>
        </svg>
      ),
      label: 'Phone',
      value: about?.phone || 'Not Provided',
      href: about?.phone ? `tel:${about.phone}` : '#',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      label: 'Email',
      value: about?.email || 'Not Provided',
      href: null,
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
      label: 'WhatsApp',
      value: about?.whatsapp || 'Not Provided',
      href: about?.whatsapp ? `https://wa.me/${about.whatsapp.replace(/\D/g, '')}` : '#',
    },
  ];

  return (
    <section className="section contact">
      {/* Background */}
      <div className="contact__bg" />

      <div className="container">

        {/* Centered layout */}
        <div className="contact__centered">
          
          {/* Top Strip: Contact Info & Socials */}
          <div className="contact__top-strip">
            <div className="contact__items-row">
              {contactItems.map((item, i) => (
                <ContactItem key={item.label} {...item} delay={i * 120} />
              ))}
            </div>
            
            <div className="contact__socials-row">
              {[
                { label: 'ArtStation', href: about?.socials?.artstation, initial: 'AS' },
                { label: 'Behance',    href: about?.socials?.behance,    initial: 'BE' },
                { label: 'LinkedIn',   href: about?.socials?.linkedin,   initial: 'IN' },
                { label: 'Facebook',   href: about?.socials?.facebook,   initial: 'FB' },
                { label: 'Instagram',  href: about?.socials?.instagram,  initial: 'IG' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`contact__social-btn ${!s.href ? 'disabled' : ''}`}
                  title={s.label}
                  onClick={(e) => !s.href && e.preventDefault()}
                >
                  <span className="contact__social-initial">{s.initial}</span>
                  <span className="contact__social-label">{s.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Bottom: 3D Inset Form */}
          <div className="contact__form-3d">
            {submitted ? (
              <div className="contact__success">
                <div className="contact__success-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out. I'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form className="contact__form" onSubmit={handleSubmit}>
                <div className="contact__form-row">
                  <div className="contact__field">
                    <label htmlFor="contact-name">Your Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="contact__field">
                    <label htmlFor="contact-email">Email Address</label>
                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="contact__field">
                  <label htmlFor="contact-subject">Subject</label>
                  <input
                    id="contact-subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="contact__field">
                  <label htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary contact__submit">
                  <span>Send Message</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
