import React from 'react';

export default function NetworkMap({ nodes = [] }) {
  const leftNodes = nodes.filter((n) => n.side === 'left');
  const rightNodes = nodes.filter((n) => n.side === 'right');

  // Labels with safe fallbacks from reference
  const l0 = leftNodes[0]?.label || 'Active Directory';
  const l1 = leftNodes[1]?.label || 'Microsoft 365';
  const l2 = leftNodes[2]?.label || 'Sophos';
  const l3 = leftNodes[3]?.label || 'Starlink · LAN/WAN';
  const l4 = leftNodes[4]?.label || 'Azure';

  const r0 = rightNodes[0]?.label || 'React';
  const r1 = rightNodes[1]?.label || 'Node · Express';
  const r2 = rightNodes[2]?.label || 'MongoDB · PostgreSQL';
  const r3 = rightNodes[3]?.label || 'JWT · RBAC';
  const r4 = rightNodes[4]?.label || 'Process improvement';

  return (
    <div
      className="bg-surface rounded-2xl sm:rounded-[32px] p-2.5 sm:p-5 shadow-sm border border-line overflow-hidden w-full"
      style={{
        backgroundImage: 'radial-gradient(#D5D9DE 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      }}
    >
      <svg
        viewBox="0 0 600 480"
        role="img"
        aria-label="Network map: infrastructure skills on the left, development skills on the right, Favour at the centre"
        className="w-full h-auto block"
      >
        {/* Connecting lines - left side dashed ink */}
        <g stroke="#0B0D10" strokeWidth="1" strokeDasharray="3 5" fill="none">
          <path d="M300 240L92 75M300 240L76 185M300 240L72 305M300 240L145 415" />
          <path d="M300 240L190 30" />
        </g>

        {/* Connecting lines - right side solid accent */}
        <g stroke="#2B50FF" strokeWidth="1.5" fill="none">
          <path d="M300 240L508 75M300 240L515 185M300 240L518 305M300 240L435 415" />
          <path d="M300 240L420 30" />
        </g>

        {/* Centre Pulsing Ring & Node */}
        <circle className="pl" cx="300" cy="240" r="52" fill="none" stroke="#2B50FF" strokeWidth="1" />
        <circle cx="300" cy="240" r="38" fill="#0B0D10" />
        <text
          x="300"
          y="247"
          textAnchor="middle"
          fontFamily="Bricolage Grotesque"
          fontWeight="800"
          fontSize="20"
          fill="#FFFFFF"
        >
          FE
        </text>

        {/* Left infrastructure nodes */}
        <g fontFamily="DM Mono" fontSize="12" textAnchor="middle" fill="#0B0D10">
          <rect x="24" y="60" width="136" height="30" rx="15" fill="#FFFFFF" stroke="#0B0D10" />
          <text x="92" y="79">{l0}</text>

          <rect x="19" y="170" width="114" height="30" rx="15" fill="#FFFFFF" stroke="#0B0D10" />
          <text x="76" y="189">{l1}</text>

          <rect x="38" y="290" width="68" height="30" rx="15" fill="#FFFFFF" stroke="#0B0D10" />
          <text x="72" y="309">{l2}</text>

          <rect x="69" y="400" width="152" height="30" rx="15" fill="#FFFFFF" stroke="#0B0D10" />
          <text x="145" y="419">{l3}</text>
        </g>

        {/* Right development nodes */}
        <g fontFamily="DM Mono" fontSize="12" textAnchor="middle" fill="#FFFFFF">
          <rect x="478" y="60" width="60" height="30" rx="15" fill="#2B50FF" />
          <text x="508" y="79">{r0}</text>

          <rect x="454" y="170" width="122" height="30" rx="15" fill="#2B50FF" />
          <text x="515" y="189">{r1}</text>

          <rect x="427" y="290" width="166" height="30" rx="15" fill="#2B50FF" />
          <text x="510" y="309">{r2}</text>

          <rect x="388" y="400" width="94" height="30" rx="15" fill="#2B50FF" />
          <text x="435" y="419">{r3}</text>
        </g>

        {/* Top diagonal nodes */}
        <g fontFamily="DM Mono" fontSize="12" textAnchor="middle">
          <rect x="158" y="15" width="64" height="30" rx="15" fill="#FFFFFF" stroke="#0B0D10" />
          <text x="190" y="34" fill="#0B0D10">{l4}</text>

          <rect x="341" y="15" width="158" height="30" rx="15" fill="#2B50FF" />
          <text x="420" y="34" fill="#FFFFFF">{r4}</text>
        </g>
      </svg>
    </div>
  );
}

