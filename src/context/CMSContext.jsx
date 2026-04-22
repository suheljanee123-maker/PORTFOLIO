// ============================================================
// CMS Context — localStorage-based dynamic content store
// ============================================================
import React, { createContext, useContext, useState, useEffect } from 'react';

const defaultData = {
  hero: {
    eyebrow: 'AVAILABLE FOR FREELANCE',
    name: 'SUHEL J. RAHMAN',
    subtitle: '3D Modeling & Texturing Artist',
    description:
      'Crafting hyper-realistic 3D worlds, characters, and cinematic environments. Specializing in PBR texturing, hard-surface modeling, and real-time assets for games and film.',
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
      behance: 'https://behance.net',
      instagram: 'https://www.instagram.com/?hl=en',
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

const updateData = (section, newValue) => {
  setData(prev => {
    const updated = { ...prev, [section]: newValue };
    localStorage.setItem('portfolio_cms', JSON.stringify(updated));
    return updated;
  });
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
