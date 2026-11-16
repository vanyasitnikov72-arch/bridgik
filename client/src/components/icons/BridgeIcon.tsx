import React from 'react';

export const BridgeIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Road deck */}
    <path d="M2 16h20" />
    {/* Left pylon tower */}
    <path d="M6 20V5" />
    {/* Right pylon tower */}
    <path d="M18 20V5" />
    {/* Suspension cable curve */}
    <path d="M2 9.5c4 5.5 16 5.5 20 0" />
    {/* Vertical suspender cables */}
    <path d="M10 12.5v3.5" />
    <path d="M14 12.5v3.5" />
    {/* Tower finials */}
    <path d="M5.5 5h1" />
    <path d="M17.5 5h1" />
  </svg>
);
