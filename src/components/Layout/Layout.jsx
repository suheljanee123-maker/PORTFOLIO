import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PillNav from '../PillNav/PillNav';
import Footer from '../Footer/Footer';
import './Layout.css';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Feedback', href: '/feedback' },
  { label: 'Contact', href: '/contact' }
];

export default function Layout() {
  const { pathname } = useLocation();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="app-layout">
      <PillNav items={navItems} logoAlt="SUHEL." baseColor="var(--accent)" />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
