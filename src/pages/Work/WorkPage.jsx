import React from 'react';
import PageHero from '../../components/PageHero/PageHero';
import Work from '../../components/Work/Work';
import { useArtStation } from '../../hooks/useArtStation';
import './WorkPage.css';

export default function WorkPage() {
  const { projects } = useArtStation({ perPage: 10 });
  const slideshowImages = projects.map(p => p.image).filter(Boolean);

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
