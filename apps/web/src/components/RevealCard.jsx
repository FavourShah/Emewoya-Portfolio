import React, { useState } from 'react';

export default function RevealCard({
  front,
  reveal,
  className = '',
  minHeight = '340px',
  ariaLabel,
}) {
  const [isTapped, setIsTapped] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsTapped((prev) => !prev);
    }
  };

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      onClick={() => setIsTapped((prev) => !prev)}
      className={`hc group cursor-pointer ${className}`}
      style={{ minHeight }}
    >
      {/* Front content */}
      <div
        className={`fr h-full ${isTapped ? '!opacity-0' : ''}`}
        aria-hidden={isTapped ? 'true' : 'false'}
      >
        {front}
      </div>

      {/* Reveal content */}
      <div
        className={`rv ${isTapped ? '!opacity-100 !transform-none !pointer-events-auto' : ''}`}
        aria-hidden={!isTapped ? 'false' : 'false'}
      >
        {reveal}
      </div>
    </div>
  );
}

