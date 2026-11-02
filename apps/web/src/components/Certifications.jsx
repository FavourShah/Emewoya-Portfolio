import React from 'react';
import RevealCard from './RevealCard.jsx';

export default function Certifications({ certGroups = [] }) {
  const renderBadge = (status) => {
    switch (status) {
      case 'passed':
        return (
          <span className="font-mono text-[11px] bg-accent text-surface rounded-full py-[3px] px-2.5 whitespace-nowrap">
            PASSED
          </span>
        );
      case 'planned':
        return (
          <span className="font-mono text-[11px] border border-accent-soft text-accent-soft rounded-full py-[3px] px-2.5 whitespace-nowrap">
            PLANNED
          </span>
        );
      case 'in_progress':
      default:
        return (
          <span className="font-mono text-[11px] border border-accent-soft text-accent-soft rounded-full py-[3px] px-2.5 whitespace-nowrap">
            IN PROGRESS
          </span>
        );
    }
  };

  return (
    <section id="certs" className="mt-16 md:mt-28 max-w-7xl mx-auto">
      <div className="lbl font-mono text-xs tracking-[0.1em] uppercase text-accent font-normal">
        03 · Certifications
      </div>

      <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-4">
        {certGroups.map((group, idx) => {
          const front = (
            <div className="p-5 sm:p-6 md:p-9 min-h-[250px] sm:min-h-[280px] md:min-h-[340px] box-border flex flex-col justify-between h-full">
              <span className="hint font-mono text-xs text-muted tracking-wider uppercase">
                HOVER OR TAP TO OPEN
              </span>
              <div>
                <div className="font-extrabold text-[clamp(28px,6vw,80px)] tracking-[-0.045em] leading-none text-ink">
                  {group.name}
                </div>
                <div className="mt-2 text-muted text-sm sm:text-base">
                  {group.subtitle}
                </div>
              </div>
            </div>
          );

          const reveal = (
            <div className="h-full flex flex-col justify-between">
              <div>
                <div className="k font-mono text-[11px] tracking-[0.1em] text-accent-soft uppercase">
                  {group.name} · CERTIFICATIONS
                </div>
                <div className="mt-4 divide-y divide-[#3A3F46]">
                  {(group.items || []).map((item, itemIdx) => (
                    <div
                      key={item.id || itemIdx}
                      className="py-3.5 flex justify-between gap-3 items-center text-sm"
                    >
                      <span>{item.title}</span>
                      {renderBadge(item.status)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );

          return (
            <RevealCard
              key={group.id || idx}
              front={front}
              reveal={reveal}
              minHeight="260px"
              ariaLabel={`${group.name} certifications`}
            />
          );
        })}
      </div>
    </section>
  );
}

