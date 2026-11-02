import React, { useEffect } from 'react';
import { useSiteStore } from '../stores/useSiteStore.js';
import Nav from '../components/Nav.jsx';
import Hero from '../components/Hero.jsx';
import Roles from '../components/Roles.jsx';
import Journey from '../components/Journey.jsx';
import Certifications from '../components/Certifications.jsx';
import Built from '../components/Built.jsx';
import Latest from '../components/Latest.jsx';
import Contact from '../components/Contact.jsx';

export default function PublicSite() {
  const { data, load } = useSiteStore();

  useEffect(() => {
    load();
  }, [load]);

  const {
    settings = {},
    roles = [],
    mapNodes = [],
    journey = [],
    certGroups = [],
    projects = [],
    teaserCount = 3,
    latestPost = null,
  } = data || {};

  return (
    <div className="bg-bg text-ink font-sans leading-[1.55] py-3 sm:py-6 pb-16 px-3.5 sm:px-6 md:px-[5vw] box-border min-h-screen selection:bg-accent selection:text-surface overflow-x-hidden">
      <Nav fullName={settings.fullName} />
      <Hero settings={settings} mapNodes={mapNodes} />
      <Roles statement={settings.statement} roles={roles} />
      <Journey
        bio={settings.bio}
        photoPublicId={settings.photoPublicId}
        journey={journey}
      />
      <Certifications certGroups={certGroups} />
      <Built projects={projects} teaserCount={teaserCount} />
      <Latest settings={settings} />
      <Contact settings={settings} />
    </div>
  );
}

