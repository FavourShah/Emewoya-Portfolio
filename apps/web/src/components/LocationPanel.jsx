import React, { useState, useEffect } from 'react';
import { getTimeDetails } from '../utils/time.js';

export default function LocationPanel({ timezone = 'Africa/Lagos', location = 'Lagos, Nigeria' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeData, setTimeData] = useState(() => getTimeDetails(timezone));

  useEffect(() => {
    if (!isOpen) return;

    // Tick every second only while panel is open
    setTimeData(getTimeDetails(timezone));
    const interval = setInterval(() => {
      setTimeData(getTimeDetails(timezone));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timezone]);

  return (
    <div className="relative">
      <button
        type="button"
        id="locBtn"
        aria-expanded={isOpen}
        aria-controls="locPanel"
        onClick={() => setIsOpen((prev) => !prev)}
        className="chip font-mono text-xs tracking-[0.08em] uppercase text-ink bg-surface border border-ink rounded-full py-2 px-4 cursor-pointer inline-flex items-center gap-2 transition-colors hover:bg-accent hover:border-accent hover:text-surface"
      >
        {location} · tap me
      </button>

      {isOpen && (
        <div id="locPanel" className="mt-4 bg-ink text-surface rounded-2xl sm:rounded-3xl p-5 sm:p-7 w-full max-w-full sm:max-w-[440px] shadow-xl animate-fade-in">
          <div className="font-mono text-[11px] sm:text-xs text-[#C9CED2] tracking-[0.08em] sm:tracking-[0.1em] uppercase">
            LAGOS · WAT · UTC+1 · 6.52°N 3.38°E
          </div>
          <div className="font-mono text-4xl sm:text-5xl md:text-[52px] tracking-[-0.02em] leading-tight mt-2 font-normal">
            {timeData.targetTime}
          </div>
          <div className="mt-1.5 text-[#C9CED2] text-sm">
            {timeData.daytimeLabel}
          </div>
          <div className="mt-5 border-t border-[#3A3F46] pt-4 text-sm">
            <span className="font-mono text-accent-soft">{timeData.visitorTime}</span>{' '}
            where you are (<span className="text-sm">{timeData.visitorZone}</span>)
            <div className="mt-1 font-semibold text-white">
              {timeData.offsetMessage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

