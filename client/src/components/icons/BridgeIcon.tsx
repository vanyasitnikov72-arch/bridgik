import React from 'react';

interface IconProps {
  className?: string;
}

export const BridgeIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Мягкий объём под аркой */}
      <path
        d="M6 15V7.2Q12 13.5 18 7.2V15H6Z"
        fill="currentColor"
        fillOpacity="0.16"
      />

      {/* Боковые тросы */}
      <path
        d="M2.5 14Q4.5 11 6 7.2M18 7.2Q19.5 11 21.5 14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Главный подвесной трос между опорами */}
      <path
        d="M6 7.2Q12 13.6 18 7.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Вертикальные ванты */}
      <path
        d="M9 10.1V15M12 10.6V15M15 10.1V15"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.55"
      />

      {/* Опоры моста и маячки сверху */}
      <path
        d="M6 6.2V17.5M18 6.2V17.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="6" cy="5" r="1.4" fill="currentColor" />
      <circle cx="18" cy="5" r="1.4" fill="currentColor" />

      {/* Полотно моста */}
      <path
        d="M2 15H22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Волна передачи данных под мостом */}
      <path
        d="M4.5 19.2Q8.25 17.8 12 19.2T19.5 19.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
};