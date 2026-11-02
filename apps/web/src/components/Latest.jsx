import React from 'react';

function normalizeHref(val) {
  if (!val || val.startsWith('[')) return null;
  const trimmed = val.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
}

export default function Latest({ settings = {} }) {
  const twitterUrl = normalizeHref(settings.twitterUrl);
  const linkedinUrl = normalizeHref(settings.linkedinUrl);
  const instagramUrl = normalizeHref(settings.instagramUrl);
  const githubUrl = normalizeHref(settings.githubUrl);

  return (
    <section id="latest" className="mt-14 md:mt-28 max-w-7xl mx-auto">
      <div className="lbl font-mono text-xs tracking-[0.1em] uppercase text-accent font-normal">
        05 · Follow Along
      </div>

      <div className="mt-7">
        <div className="bg-ink text-surface rounded-2xl sm:rounded-[28px] p-6 sm:p-8 md:p-12 min-h-[220px] flex flex-col justify-between gap-6 shadow-sm">
          <div>
            <div className="font-mono text-xs text-[#C9CED2] tracking-wider uppercase">
              FOLLOW ALONG
            </div>
            <p className="mt-3 font-extrabold text-[clamp(24px,4vw,38px)] tracking-[-0.03em] leading-[1.1] sm:leading-[1.05] max-w-2xl">
              Catch up with what I’m learning and building.
            </p>
          </div>

          <div className="flex gap-6 flex-wrap items-center">
            {linkedinUrl && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent-soft hover:text-white hover:underline text-sm transition-colors"
              >
                LinkedIn ↗
              </a>
            )}
            {twitterUrl && (
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent-soft hover:text-white hover:underline text-sm transition-colors"
              >
                X / Twitter ↗
              </a>
            )}
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent-soft hover:text-white hover:underline text-sm transition-colors"
              >
                Instagram ↗
              </a>
            )}
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-accent-soft hover:text-white hover:underline text-sm transition-colors"
              >
                GitHub ↗
              </a>
            )}
            {!linkedinUrl && !twitterUrl && !instagramUrl && !githubUrl && (
              <span className="font-mono text-xs text-[#C9CED2]">
                Configure social links in CMS Settings
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
