import React from 'react';
import CloudinaryImage from './CloudinaryImage.jsx';

export default function Journey({ bio, photoPublicId, journey = [] }) {
  const displayBio =
    bio ||
    'I’m Favour. I trained as an electrical and electronics engineer, spent time in broadcast and radio transmission, and now support users by day and build full-stack apps the rest of the time.';

  return (
    <section id="about" className="mt-16 md:mt-28 max-w-7xl mx-auto">
      <div className="lbl font-mono text-xs tracking-[0.1em] uppercase text-accent font-normal">
        02 · Journey
      </div>

      <div className="mt-7 flex flex-wrap gap-8 items-center">
        <div className="w-full sm:w-[260px] max-w-full flex-shrink-0">
          <CloudinaryImage
            publicId={photoPublicId}
            width={520}
            alt="Favour Ezechi-Oriaku portrait"
            placeholderText="[PHOTO FROM LINKEDIN]"
            className="w-full h-auto aspect-[4/5]"
          />
        </div>

        <p className="flex-1 min-w-[260px] m-0 font-semibold text-[clamp(18px,2.6vw,34px)] leading-[1.3] sm:leading-[1.2] tracking-[-0.02em] text-ink">
          {displayBio}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-line border border-line rounded-2xl sm:rounded-3xl overflow-hidden mt-7">
        {journey.map((step, idx) => (
          <div
            key={step.id || idx}
            className="cell bg-cell p-5 md:p-7 min-h-[180px] md:min-h-[210px] flex flex-col justify-between hover:bg-surface transition-colors"
          >
            <span className="mono font-mono text-xs text-muted uppercase tracking-wider">
              {step.label}
            </span>
            <div>
              <div className="font-extrabold text-2xl tracking-[-0.02em] leading-[1.1] text-ink">
                {step.title}
              </div>
              <div className="mono font-mono text-xs text-muted mt-2 leading-relaxed">
                {step.body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

