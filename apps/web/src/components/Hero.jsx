import React from 'react';
import LocationPanel from './LocationPanel.jsx';
import NetworkMap from './NetworkMap.jsx';

export default function Hero({ settings = {}, mapNodes = [] }) {
  const headline = settings.headline || 'Keeps systems up. Builds the ones that aren’t yet.';
  const subheadline =
    settings.subheadline ||
    'IT support, cloud, web development and business analysis. One map, and every node is something I’ve worked with or studied.';
  const location = settings.location || 'Lagos, Nigeria';
  const timezone = settings.timezone || 'Africa/Lagos';

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-8 lg:gap-12 items-center mt-8 sm:mt-12 lg:mt-14 max-w-7xl mx-auto">
      <div>
        <LocationPanel timezone={timezone} location={location} />

        <h1 className="mt-5 sm:mt-6 font-extrabold text-[clamp(32px,6.8vw,92px)] leading-[1] sm:leading-[0.96] tracking-[-0.04em] sm:tracking-[-0.045em] text-ink">
          {headline}
        </h1>

        <p className="mt-5 sm:mt-7 max-w-full sm:max-w-[470px] text-muted text-base sm:text-[19px] leading-relaxed">
          {subheadline}
        </p>
      </div>

      <div className="mt-4 lg:mt-0 w-full overflow-hidden">
        <NetworkMap nodes={mapNodes} />
      </div>
    </section>
  );
}

