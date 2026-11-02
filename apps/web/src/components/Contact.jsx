import React, { useState } from 'react';

function normalizeHref(val, isEmail = false) {
  if (!val || val.startsWith('[')) return null;
  const trimmed = val.trim();
  if (!trimmed) return null;
  if (isEmail) {
    const clean = trimmed.replace(/^mailto:/i, '');
    return `mailto:${clean}?subject=${encodeURIComponent('Hello Favour — Inquiry via Portfolio')}`;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export default function Contact({ settings = {} }) {
  const [copied, setCopied] = useState(false);

  const email = settings.email || '';
  const linkedin = settings.linkedinUrl || '';
  const twitter = settings.twitterUrl || '';
  const instagram = settings.instagramUrl || '';

  const emailHref = normalizeHref(email, true);
  const linkedinHref = normalizeHref(linkedin);
  const twitterHref = normalizeHref(twitter);
  const instagramHref = normalizeHref(instagram);

  const handleEmailClick = () => {
    if (email && !email.startsWith('[')) {
      const cleanEmail = email.replace(/^mailto:/i, '');
      navigator.clipboard?.writeText(cleanEmail).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }).catch(() => {});
    }
  };

  const iconBtnClass =
    'w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-surface text-ink hover:bg-ink hover:text-surface flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-surface focus:ring-offset-2 focus:ring-offset-accent';

  const placeholderBtnClass =
    'w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-surface/20 text-surface/70 border border-surface/30 flex items-center justify-center cursor-not-allowed';

  return (
    <section
      id="contact"
      className="mt-14 md:mt-28 mb-8 bg-accent text-surface rounded-2xl sm:rounded-[28px] md:rounded-[36px] p-6 sm:p-8 md:p-14 flex flex-col md:flex-row md:justify-between md:items-end gap-6 max-w-7xl mx-auto shadow-md"
    >
      <div>
        <span className="font-extrabold text-[clamp(28px,5.5vw,72px)] tracking-[-0.04em] leading-tight sm:leading-none block">
          Open a ticket
          <br />
          with me.
        </span>
        <p className="font-mono text-xs text-surface/80 mt-3">
          Reach out directly via email or connect on socials.
        </p>
      </div>

      {/* Social and Contact Icon Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Email Icon with instant mailto & copy fallback */}
        <div className="relative">
          {copied && (
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-ink text-surface text-[11px] font-mono py-1 px-2.5 rounded-lg whitespace-nowrap shadow-md animate-fade-in pointer-events-none z-10 border border-line">
              Copied to clipboard! ✓
            </span>
          )}

          {emailHref ? (
            <a
              href={emailHref}
              onClick={handleEmailClick}
              title={`Send email to ${email} (opens mail app and copies address)`}
              aria-label={`Send email to ${email}`}
              className={iconBtnClass}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </a>
          ) : (
            <div title="Email placeholder: [EMAIL] (update in CMS Settings)" className={placeholderBtnClass}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
          )}
        </div>

        {/* LinkedIn Icon */}
        {linkedinHref ? (
          <a
            href={linkedinHref}
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn Profile"
            aria-label="LinkedIn Profile"
            className={iconBtnClass}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v7.6h2.8v-7.6h-2.8m1.4-4.8c-.9 0-1.63.73-1.63 1.63s.73 1.63 1.63 1.63 1.63-.73 1.63-1.63-.73-1.63-1.63-1.63Z" />
            </svg>
          </a>
        ) : (
          <div title="LinkedIn placeholder: [LINKEDIN] (update in CMS Settings)" className={placeholderBtnClass}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v7.6h2.8v-7.6h-2.8m1.4-4.8c-.9 0-1.63.73-1.63 1.63s.73 1.63 1.63 1.63 1.63-.73 1.63-1.63-.73-1.63-1.63-1.63Z" />
            </svg>
          </div>
        )}

        {/* X / Twitter Icon */}
        {twitterHref ? (
          <a
            href={twitterHref}
            target="_blank"
            rel="noopener noreferrer"
            title="X (Twitter) Profile"
            aria-label="X (Twitter) Profile"
            className={iconBtnClass}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        ) : (
          <div title="X / Twitter placeholder: [X / TWITTER] (update in CMS Settings)" className={placeholderBtnClass}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
        )}

        {/* Instagram Icon */}
        {instagramHref ? (
          <a
            href={instagramHref}
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram Profile"
            aria-label="Instagram Profile"
            className={iconBtnClass}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>
        ) : (
          <div title="Instagram placeholder: [INSTAGRAM] (update in CMS Settings)" className={placeholderBtnClass}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}
