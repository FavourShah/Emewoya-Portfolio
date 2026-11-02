import React, { useState, useEffect } from 'react';

export default function Nav({ fullName = 'Favour Ezechi-Oriaku' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-3 z-40 max-w-7xl mx-auto w-full">
      {/* Main Nav Bar */}
      <div className="bg-surface/90 backdrop-blur-md rounded-full py-2.5 px-4 sm:px-6 md:pl-7 md:pr-3.5 shadow-sm border border-line flex justify-between items-center transition-all">
        {/* Logo / Name */}
        <a
          href="#"
          className="font-extrabold tracking-[-0.02em] text-ink text-sm sm:text-base truncate max-w-[200px] sm:max-w-none hover:text-accent transition-colors"
        >
          {fullName}
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex gap-6 lg:gap-8 text-sm items-center font-medium">
          <a href="#about" className="text-muted hover:text-accent transition-colors">
            Journey
          </a>
          <a href="#certs" className="text-muted hover:text-accent transition-colors">
            Certifications
          </a>
          <a href="#work" className="text-muted hover:text-accent transition-colors">
            Built
          </a>
          <a
            href="#contact"
            className="bg-ink text-surface rounded-full py-2 px-5 hover:bg-accent transition-colors font-medium text-xs uppercase tracking-wider"
          >
            Contact
          </a>
        </nav>

        {/* Mobile Action Buttons (Contact pill + Hamburger) */}
        <div className="flex md:hidden items-center gap-2">
          <a
            href="#contact"
            onClick={handleLinkClick}
            className="bg-ink text-surface rounded-full py-1.5 px-3.5 text-xs font-semibold hover:bg-accent transition-colors"
          >
            Contact
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="w-9 h-9 rounded-full bg-cell border border-line flex items-center justify-center text-ink hover:text-accent hover:border-accent transition-colors"
          >
            {mobileMenuOpen ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="13" y2="13" />
                <line x1="13" y1="1" x2="1" y2="13" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="2" y1="4" x2="14" y2="4" />
                <line x1="2" y1="8" x2="14" y2="8" />
                <line x1="2" y1="12" x2="14" y2="12" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Card */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-surface/95 backdrop-blur-md rounded-2xl border border-line shadow-lg p-3 animate-fade-in flex flex-col gap-1">
          <a
            href="#about"
            onClick={handleLinkClick}
            className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-ink hover:bg-cell hover:text-accent transition-colors"
          >
            <span>Journey</span>
            <span className="font-mono text-xs text-muted">02</span>
          </a>
          <a
            href="#certs"
            onClick={handleLinkClick}
            className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-ink hover:bg-cell hover:text-accent transition-colors"
          >
            <span>Certifications</span>
            <span className="font-mono text-xs text-muted">03</span>
          </a>
          <a
            href="#work"
            onClick={handleLinkClick}
            className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-ink hover:bg-cell hover:text-accent transition-colors"
          >
            <span>Built</span>
            <span className="font-mono text-xs text-muted">04</span>
          </a>
          <a
            href="#contact"
            onClick={handleLinkClick}
            className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-ink hover:bg-cell hover:text-accent transition-colors"
          >
            <span>Contact</span>
            <span className="font-mono text-xs text-accent">Open ticket ↗</span>
          </a>
        </div>
      )}
    </header>
  );
}
