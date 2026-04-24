import React from 'react';
import PageHero from '../../components/PageHero/PageHero';
import Work from '../../components/Work/Work';
import { useArtStation } from '../../hooks/useArtStation';
import './WorkPage.css';

export default function WorkPage() {
  const { projects } = useArtStation({ perPage: 10 });
  
  // Fallback images if ArtStation is slow or blocked
  const fallbackImages = [
    'https://cdnb.artstation.com/p/assets/images/images/062/716/163/large/suhel-jarahman-stylized-gun-low-poly.jpg',
    'https://cdna.artstation.com/p/assets/images/images/062/716/092/large/suhel-jarahman-high-poly-sculpt.jpg',
    'https://cdnb.artstation.com/p/assets/images/images/062/716/167/large/suhel-jarahman-stylized-sword.jpg'
  ];

  const slideshowImages = projects.length > 0 
    ? projects.map(p => p.image).filter(Boolean)
    : fallbackImages;

  return (
    <div className="work-page">
      <PageHero
        eyebrow="My Portfolio"
        title="Selected"
        accent="Work"
        description="A curated collection of 3D modeling, texturing, and environment design projects crafted with cinematic precision."
        breadcrumb="Work"
        slideshowImages={slideshowImages}
      />
      <Work />
    </div>
  );
}
