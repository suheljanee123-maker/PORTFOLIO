// ============================================================
// CMS Context — localStorage-based dynamic content store
// ============================================================
import React, { createContext, useContext, useState, useEffect } from 'react';

const defaultData = {
  hero: {
    eyebrow: 'AVAILABLE FOR FREELANCE',
    name: 'SUHEL J. RAHMAN',
    subtitle: '3D Modeling & Texturing Artist | Character Artist ',
    description:
      'Passionate 3D artist focused on modeling, sculpting, and texturing, creating optimized assets with clean topology and efficient workflows. Eager to learn and contribute to professional pipelines',
  },
  about: {
    bio: `I'm Suhel J. Rahman — a passionate 3D Modeling & Texturing Artist with over 5 years of experience creating cinematic assets for games, films, and visual effects.\n\nMy work blends technical precision with artistic vision, producing hyper-realistic models that tell compelling stories. From hard-surface mechs to organic environments, I bring concepts to life with meticulous detail.`,
    skills: [
      { name: 'Hard-Surface Modeling', level: 95 },
      { name: 'PBR Texturing & Materials', level: 92 },
      { name: 'Character Sculpting', level: 85 },
      { name: 'Environment Design', level: 88 },
      { name: 'Real-Time Optimization', level: 80 },
      { name: 'Rendering & Lighting', level: 87 },
    ],
    software: ['Blender', 'ZBrush', 'Maya', 'Substance 3D Painter', 'Marvelous Designer', 'Unreal Engine 5', 'Cinema 4D', 'KeyShot'],
    certifications: [
      { title: 'Autodesk Certified Professional', issuer: 'Autodesk', year: '2023' },
      { title: 'Unreal Engine 5 Certification', issuer: 'Epic Games', year: '2024' },
      { title: 'Advanced ZBrush Sculpting', issuer: 'Pixologic', year: '2022' },
    ],
    phone: '+91 6000925751',
    email: 'suheljanee123@gmail.com',
    whatsapp: '+91 6000925751',
    socials: {
      artstation: 'https://www.artstation.com/suhel',
      behance: 'https://www.behance.net/suheljarahman',
      instagram: 'https://www.instagram.com/_ri_shi_2.0/?hl=en',
      linkedin: 'https://www.linkedin.com/in/suhel-janee-rahman-348954253/',
      facebook: 'https://www.facebook.com/suhel.rahman.372/',
    },
  },
  projects: [],
  feedback: [],
};

const CMSContext = createContext(null);

export function CMSProvider({ children }) {
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem('portfolio_cms');
      return stored ? { ...defaultData, ...JSON.parse(stored) } : defaultData;
    } catch { return defaultData; }
  });

  useEffect(() => {
    // Load feedbacks from server on startup
    const loadFeedbacks = async () => {
      try {
        // Add cache-buster ?t= to prevent browser from showing old data
        const res = await fetch(`./feedback.php?t=${Date.now()}`);
        if (res.ok) {
          const feedbacks = await res.json();
          if (Array.isArray(feedbacks)) {
             setData(prev => ({ ...prev, feedback: feedbacks }));
          }
        }
      } catch (e) { console.error('[CMS] Failed to load server feedbacks', e); }
    };
    loadFeedbacks();
  }, []);

  const updateData = async (section, newValue) => {
    // 1. Update local state immediately for UI responsiveness
    setData(prev => {
      const updated = { ...prev, [section]: newValue };
      localStorage.setItem('portfolio_cms', JSON.stringify(updated));
      return updated;
    });

    // 2. If it's feedback, also save to server (GoDaddy)
    if (section === 'feedback' && Array.isArray(newValue)) {
      const latest = newValue[newValue.length - 1];
      if (latest) {
        try {
          const res = await fetch('./feedback.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(latest),
          });
          const result = await res.json();
          if (!res.ok) console.warn('[CMS] Server save failed:', result);
        } catch (e) { console.error('[CMS] Failed to save feedback to server', e); }
      }
    }
  };

  const resetData = () => {
    localStorage.removeItem('portfolio_cms');
    setData(defaultData);
  };

  return (
    <CMSContext.Provider value={{ data, updateData, resetData }}>
      {children}
    </CMSContext.Provider>
  );
}

export const useCMS = () => useContext(CMSContext);
export { defaultData };
