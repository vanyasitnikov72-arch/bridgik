import React from 'react';

interface IconProps {
  className?: string;
}

export const RoomLoungeIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Голосовая волна и точка эфира над диваном */}
      <circle cx="12" cy="5.5" r="1.35" fill="currentColor" />
      <path
        d="M9.1 3.7a3.2 3.2 0 0 0 0 3.6M14.9 3.7a3.2 3.2 0 0 1 0 3.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Спинка дивана с мягкой заливкой */}
      <path
        d="M5.5 14v-2A1.5 1.5 0 0 1 7 10.5h10a1.5 1.5 0 0 1 1.5 1.5v2"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Подушка сиденья и подлокотники */}
      <path
        d="M3.5 14a1.5 1.5 0 0 1 1.5-1.5h.5V16h13v-3.5h.5a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17v-3Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Ножки дивана */}
      <path
        d="M6.5 18.5V20M17.5 18.5V20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
};