import React from 'react';

export default function Roles({ statement, roles = [] }) {
  const displayStatement =
    statement ||
    'I don’t just look at what is broken. I look at what can be built to make things work better.';

  // Highlight "what can be built" in accent blue if present in statement
  const renderFormattedStatement = (text) => {
    const target = 'what can be built';
    const index = text.toLowerCase().indexOf(target);
    if (index === -1) {
      return text;
    }
    const before = text.slice(0, index);
    const match = text.slice(index, index + target.length);
    const after = text.slice(index + target.length);
    return (
      <>
        {before}
        <span className="text-accent">{match}</span>
        {after}
      </>
    );
  };

  return (
    <section className="mt-16 md:mt-28 max-w-7xl mx-auto">
      <div className="lbl font-mono text-xs tracking-[0.1em] uppercase text-accent font-normal">
        01 · Roles I fit
      </div>

      <p className="mt-4 sm:mt-5 max-w-[900px] font-semibold text-[clamp(22px,4vw,56px)] leading-[1.15] sm:leading-[1.1] tracking-[-0.03em] sm:tracking-[-0.035em] text-ink">
        {renderFormattedStatement(displayStatement)}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-line border border-line rounded-2xl sm:rounded-3xl overflow-hidden mt-6 sm:mt-9">
        {roles.map((role, idx) => (
          <div
            key={role.id || idx}
            className="cell bg-cell p-5 md:p-7 min-h-[180px] md:min-h-[210px] flex flex-col justify-between hover:bg-surface transition-colors"
          >
            <span className="mono font-mono text-xs text-accent uppercase tracking-wider">
              {role.label}
            </span>
            <div>
              <div className="font-extrabold text-2xl tracking-[-0.02em] leading-[1.1] text-ink">
                {role.title}
              </div>
              <div className="mono font-mono text-xs text-muted mt-2 leading-relaxed">
                {role.evidence}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

