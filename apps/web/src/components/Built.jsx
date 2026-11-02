import React from 'react';
import RevealCard from './RevealCard.jsx';
import CloudinaryImage from './CloudinaryImage.jsx';

export default function Built({ projects = [], teaserCount = 3 }) {
  const publishedCount = projects.length;
  const totalCount = publishedCount + teaserCount;

  const renderSampleUi = (project, idx) => {
    const slug = project.slug || '';
    if (slug.includes('payroll')) {
      return (
        <div className="bg-bg rounded-2xl p-3.5 text-xs">
          <div className="flex justify-between font-semibold">
            <span>Payroll / overview</span>
            <span className="font-mono text-muted text-[11px]">SAMPLE UI</span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="bg-surface rounded-lg p-2.5 shadow-sm">
              <span className="text-[11px] text-muted">Employees</span>
              <div className="h-1.5 rounded-full bg-accent mt-2.5 w-[70%]" />
            </div>
            <div className="bg-surface rounded-lg p-2.5 shadow-sm">
              <span className="text-[11px] text-muted">Payroll run</span>
              <div className="h-1.5 rounded-full bg-accent mt-2.5 w-[45%]" />
            </div>
            <div className="bg-surface rounded-lg p-2.5 shadow-sm">
              <span className="text-[11px] text-muted">Payslips</span>
              <div className="h-1.5 rounded-full bg-accent mt-2.5 w-[85%]" />
            </div>
          </div>
        </div>
      );
    }

    if (slug.includes('leave')) {
      return (
        <div className="bg-bg rounded-2xl p-3.5 text-xs">
          <div className="flex justify-between font-semibold">
            <span>Leave / requests</span>
            <span className="font-mono text-muted text-[11px]">SAMPLE UI</span>
          </div>
          <div className="flex justify-between items-center bg-surface rounded-lg p-2.5 mt-3 shadow-sm">
            <span>Annual leave</span>
            <span className="text-accent font-semibold text-[11px]">Pending</span>
          </div>
          <div className="flex justify-between items-center bg-surface rounded-lg p-2.5 mt-1.5 shadow-sm">
            <span>Sick leave</span>
            <span className="text-muted font-semibold text-[11px]">Approved</span>
          </div>
        </div>
      );
    }

    // Default sample UI preview for newly added projects
    return (
      <div className="bg-bg rounded-2xl p-3.5 text-xs">
        <div className="flex justify-between font-semibold">
          <span>{project.title} / overview</span>
          <span className="font-mono text-muted text-[11px]">CASE STUDY</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-surface rounded-lg p-2.5">
            <span className="text-[11px] text-muted">Status</span>
            <div className="font-semibold text-accent mt-1">Operational</div>
          </div>
          <div className="bg-surface rounded-lg p-2.5">
            <span className="text-[11px] text-muted">Security</span>
            <div className="font-semibold text-ink mt-1">RBAC Active</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="work" className="mt-16 md:mt-28 max-w-7xl mx-auto">
      {/* Header with counter */}
      <div className="flex justify-between items-baseline gap-4 flex-wrap">
        <div className="lbl font-mono text-xs tracking-[0.1em] uppercase text-accent font-normal">
          04 · Built
        </div>
        <div className="hint font-mono text-xs text-muted">
          Showing {publishedCount} of {totalCount} · more case studies landing soon
        </div>
      </div>

      {/* Projects Grid */}
      <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project, idx) => {
          const front = (
            <div className="p-4 sm:p-6 md:p-9 min-h-[380px] sm:min-h-[440px] md:min-h-[540px] box-border flex flex-col justify-between gap-5 h-full">
              {renderSampleUi(project, idx)}
              <div>
                <div className="hint font-mono text-[11px] sm:text-xs text-muted uppercase">
                  {project.tagLine || 'FULL STACK WORKFLOW'}
                </div>
                <div className="font-extrabold text-2xl sm:text-3xl md:text-4xl tracking-[-0.03em] leading-[1.05] mt-1 text-ink">
                  {project.title}
                </div>
                <div className="hint font-mono text-[11px] sm:text-xs text-muted tracking-wider uppercase mt-2.5">
                  HOVER OR TAP FOR THE CASE
                </div>
              </div>
            </div>
          );

          const mediaItems = project.media && project.media.length > 0
            ? project.media.slice(0, 3)
            : [
                { alt: '[SCREENSHOT 1]' },
                { alt: '[SCREENSHOT 2]' },
                { alt: '[SCREENSHOT 3]' },
              ];

          const reveal = (
            <div className="h-full overflow-y-auto pr-1">
              <div className="k font-mono text-[11px] tracking-[0.1em] text-accent-soft uppercase">
                {project.title}
              </div>

              {/* Media screenshots */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                {mediaItems.map((item, mIdx) => {
                  const isRealImage = item.publicId && !item.publicId.startsWith('placeholder-');
                  if (isRealImage) {
                    return (
                      <CloudinaryImage
                        key={mIdx}
                        publicId={item.publicId}
                        width={280}
                        alt={item.alt || `${project.title} screenshot ${mIdx + 1}`}
                        className="aspect-[16/10] rounded-lg border border-[#3A3F46] object-cover"
                      />
                    );
                  }
                  return (
                    <div
                      key={mIdx}
                      className="shot aspect-[16/10] border border-[#3A3F46] rounded-lg bg-[#161A20] flex items-center justify-center font-mono text-[10px] text-[#C9CED2] text-center p-1"
                    >
                      {item.alt || `[SCREENSHOT ${mIdx + 1}]`}
                    </div>
                  );
                })}
              </div>

              {/* Case study narrative */}
              <div className="k font-mono text-[11px] tracking-[0.1em] text-accent-soft mt-3.5 uppercase">
                PROBLEM
              </div>
              <div className="text-sm mt-1 text-[#E0E4E8] leading-relaxed">
                {project.problem || '[CONFIRM] Details coming soon.'}
              </div>

              <div className="k font-mono text-[11px] tracking-[0.1em] text-accent-soft mt-3.5 uppercase">
                WHAT IT SOLVES
              </div>
              <div className="text-sm mt-1 text-[#E0E4E8] leading-relaxed">
                {project.solves || '[CONFIRM] Solution breakdown coming soon.'}
              </div>

              <div className="k font-mono text-[11px] tracking-[0.1em] text-accent-soft mt-3.5 uppercase">
                BUILT WITH, AND WHY
              </div>
              <div className="text-sm mt-1 text-[#E0E4E8] leading-relaxed">
                {project.stackBrief || '[CONFIRM] Architecture notes.'}
              </div>

              {(project.demoUrl || project.repoUrl) && (
                <div className="mt-4 pt-3 border-t border-[#3A3F46] flex gap-4 text-xs font-mono">
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-soft hover:underline"
                    >
                      Live Demo ↗
                    </a>
                  )}
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-soft hover:underline"
                    >
                      Source Code ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          );

          return (
            <RevealCard
              key={project.id || idx}
              front={front}
              reveal={reveal}
              minHeight="380px"
              ariaLabel={`${project.title} case study`}
            />
          );
        })}
      </div>

      {/* Teaser Rows */}
      {teaserCount > 0 && (
        <div className="mt-4 border border-dashed border-[#8A929B] rounded-[20px] py-2 px-4 md:px-6 bg-surface/50">
          {Array.from({ length: teaserCount }).map((_, tIdx) => {
            const indexNumber = String(publishedCount + tIdx + 1).padStart(2, '0');
            const isFirst = tIdx === 0;
            return (
              <div
                key={tIdx}
                className={`py-3.5 flex justify-between items-center text-sm text-muted ${
                  !isFirst ? 'border-t border-dashed border-[#8A929B]' : ''
                }`}
              >
                <span className="font-medium">
                  {indexNumber} · Next case study
                </span>
                <span className="font-mono text-xs text-muted tracking-wider uppercase">
                  CASE STUDY SOON
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

