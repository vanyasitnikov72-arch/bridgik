import React, { useEffect, useState } from 'react';

export type MascotId = 'frog' | 'dino' | 'cat' | 'alien' | 'turtle' | 'crt' | 'hexa';
export type PaletteId = 'eblo_lime' | 'cyber_matrix' | 'synthwave' | 'ice_glacier';

export interface MascotInfo {
  id: MascotId;
  name: string;
  tagline: string;
  description: string;
}

export const MASCOT_LIST: MascotInfo[] = [
  {
    id: 'dino',
    name: 'Кибер-Динозаврик',
    tagline: '★ Основной логотип bridgik · Cyber-Dino',
    description: 'Зеленый динозаврик в бирюзовых кибер-очках с радиомаяком связи и невозмутимой хакерской улыбкой.',
  },
  {
    id: 'frog',
    name: 'Жабик Бриджик',
    tagline: 'Cyber-Toad · Амфибийный нетраннер',
    description: 'Оригинальный зеленый амфибийный нетраннер в бирюзовых кибер-очках с антенной прямого радиомоста.',
  },
  {
    id: 'cat',
    name: 'Зеленый Кибер-Кот',
    tagline: 'Green Cyber-Cat · Хитрый узел связи',
    description: 'Пиксельный зеленый кот в неоновых очках с антенной, раздающей Wi-Fi радиоволны прямого соединения.',
  },
  {
    id: 'alien',
    name: 'Кибер-Пришелец',
    tagline: 'Cyber-Alien · В духе eblo.id',
    description: 'Зеленый гуманоидный нетраннер с массивными бирюзовыми очками и маяком прямого P2P канала.',
  },
  {
    id: 'turtle',
    name: 'Кибер-Черепашка',
    tagline: 'Cyber-Turtle · Надежный радиомост',
    description: 'Невозмутимая зеленая черепашка с радиомаяком — спокойная и нерушимая связь 24/7.',
  },
  {
    id: 'crt',
    name: 'Мостик-Бот',
    tagline: 'CRT Node · Ретро-монитор',
    description: 'Олдскульный терминал с V-антеннами, транслирующий WebRTC пакеты напрямую между экранами.',
  },
  {
    id: 'hexa',
    name: 'Гекса-Дроид',
    tagline: 'Hexa-Node · Геометрический дроид',
    description: 'Геометрический кибер-персонаж с характерным силуэтом лица и маяком радиосвязи bridgik.',
  },
];

export const PALETTES: Record<PaletteId, { name: string; colors: Record<string, string> }> = {
  eblo_lime: {
    name: 'Eblo Lime (Оригинал)',
    colors: {
      '.': 'transparent',
      '#': '#000000',
      'G': '#58731d',
      'L': '#8dc63f',
      'H': '#b4ec4f',
      'Y': '#daf464',
      'C': '#00f0ff',
      'D': '#0284c7',
      'W': '#ffffff',
      'A': '#facc15',
    },
  },
  cyber_matrix: {
    name: 'Cyber Matrix',
    colors: {
      '.': 'transparent',
      '#': '#051307',
      'G': '#15803d',
      'L': '#22c55e',
      'H': '#4ade80',
      'Y': '#86efac',
      'C': '#eab308',
      'D': '#ca8a04',
      'W': '#ffffff',
      'A': '#22c55e',
    },
  },
  synthwave: {
    name: 'Synthwave Neon',
    colors: {
      '.': 'transparent',
      '#': '#15061e',
      'G': '#a21caf',
      'L': '#d946ef',
      'H': '#f0abfc',
      'Y': '#fbcfe8',
      'C': '#22d3ee',
      'D': '#0891b2',
      'W': '#ffffff',
      'A': '#f43f5e',
    },
  },
  ice_glacier: {
    name: 'Ice Cyan',
    colors: {
      '.': 'transparent',
      '#': '#081426',
      'G': '#0369a1',
      'L': '#0ea5e9',
      'H': '#7dd3fc',
      'Y': '#bae6fd',
      'C': '#f8fafc',
      'D': '#94a3b8',
      'W': '#ffffff',
      'A': '#38bdf8',
    },
  },
};

const GRIDS: Record<MascotId, string[]> = {
  frog: [
    "....................",
    ".........AA.........",
    ".........GG.........",
    "....####....####....",
    "...#HHHH#..#HHHH#...",
    "..#HLLLLH##HLLLLH#..",
    ".#LLLLLLLLLLLLLLLL#.",
    "#LCCCCCCCCCCCCCCCCL#",
    "#LCCWWCCCCCCWWCCCCL#",
    "#LDDCCDDCLLDDCCDDC#.",
    "#LLLLLLLLLLLLLLLLLL#",
    "#LLLYYYYYYYYYYYYLLL#",
    "#LLLY##########YLLL#",
    ".#LLYYYYYYYYYYYYLL#.",
    "..#LLLLGGGGGGLLLL#..",
    "...##############...",
    "....................",
    "....................",
    "....................",
    "....................",
  ],
  dino: [
    "..##.....AA.....##..",
    ".#LL#....GG....#LL#.",
    "..##..########..##..",
    "....##HHHHHHHH##....",
    "..##HLLLLLLLLLLH##..",
    ".#LLLLLLLLLLLLLLLL#.",
    "#LCCCCCCCCCCCCCCCCL#",
    "#LCCWWCCCCCCWWCCCCL#",
    "#LDDCCDDCLLDDCCDDC#.",
    "#LLLLLLLLLLLLLLLLLL#",
    "#LLLLLLLLLLLLLLLLLL#",
    "#LLLYYYYYYYYYYYYLLL#",
    "#LLLY##Y####Y##YLLL#",
    "#LLLY##########YLLL#",
    ".#LLYYYYYYYYYYYYLL#.",
    "..#LLLLGGGGGGLLLL#..",
    "...##############...",
    "....................",
    "....................",
    "....................",
  ],
  alien: [
    ".........AA.........",
    ".........GG.........",
    "......########......",
    "....##HHHHHHHH##....",
    "..##HLLLLLLLLLLH##..",
    ".#LLLLLLLLLLLLLLLL#.",
    "#LCCCCCCCCCCCCCCCCL#",
    "#LCCWWCCCCCCWWCCCCL#",
    "#LDDCCDDCLLDDCCDDC#.",
    ".#LLLLLLLLLLLLLLLL#.",
    "..#LLLLLLLLLLLLLL#..",
    "...#LLLYYYYYYLLL#...",
    "...#LLLY####YLLL#...",
    "....#LLYYYYYYLL#....",
    ".....#LLLLLLLL#.....",
    "......########......",
    "....................",
    "....................",
    "....................",
    "....................",
  ],
  turtle: [
    ".........AA.........",
    ".........GG.........",
    "....############....",
    "...#HHHHHHHHHHHH#...",
    "..#HLLLLLLLLLLLLH#..",
    ".#LLLLLLLLLLLLLLLL#.",
    "#LCCCCCCCCCCCCCCCCL#",
    "#LCCWWCCCCCCWWCCCCL#",
    "#LDDCCDDCLLDDCCDDC#.",
    "#LLLLLLLLLLLLLLLLLL#",
    "#LLLLYYYYYYYYYYLLLL#",
    "#LLLL#Y######Y#LLLL#",
    ".#LLLYYYYYYYYYYLLL#.",
    "..#LLLLLLLLLLLLLL#..",
    "...#LLLLGGGGLLLL#...",
    "....############....",
    "....................",
    "....................",
    "....................",
    "....................",
  ],
  cat: [
    "..##............##..",
    ".#HH#..........#HH#.",
    "#HLLH#...AA...#HLLH#",
    "#LLLLH#..GG..#HLLLL#",
    "#LLLLLL######LLLLLL#",
    "#LLLLLLLLLLLLLLLLLL#",
    "#LCCCCCCCCCCCCCCCCL#",
    "#LCCWWCCCCCCWWCCCCL#",
    "#LDDCCDDCLLDDCCDDC#.",
    "#LLLLLLLLLLLLLLLLLL#",
    "#L#LLLLLYYYYLLLLL#L#",
    "#LLLLLL######LLLLLL#",
    ".#LLLLYYYYYYYYLLLL#.",
    "..#LLLLGGGGGGLLLL#..",
    "...##############...",
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
  ],
  crt: [
    "...A............A...",
    "....G..........G....",
    ".....G..####..G.....",
    "......##GGGG##......",
    "....############....",
    "...#GGGGGGGGGGGG#...",
    "..#G############G#..",
    "..#G#CCCCCCCCCC#G#..",
    "..#G#CCWWCCWWCC#G#..",
    "..#G#CCCCCCCCCC#G#..",
    "..#G#..........#G#..",
    "..#G#..######..#G#..",
    "..#G############G#..",
    "...#GGGGGGGGGGGG#...",
    "....############....",
    ".......######.......",
    "......########......",
    "....................",
    "....................",
    "....................",
  ],
  hexa: [
    ".........AA.........",
    ".........GG.........",
    "......########......",
    "....##HHHHHHHH##....",
    "..##HLLLLLLLLLLH##..",
    ".#LLLLLLLLLLLLLLLL#.",
    "#LCCCCCCCCCCCCCCCCL#",
    "#LCCWWCCCCCCWWCCCCL#",
    "#LDDCCDDCLLDDCCDDC#.",
    ".#LLLLLLLLLLLLLLLL#.",
    "..#LLLYYYYYYYYLLL#..",
    "..#LLLY######YLLL#..",
    "...#LLYYYYYYYYLL#...",
    "....#LLLLLLLLLL#....",
    ".....##########.....",
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
  ],
};

interface PixelMascotProps {
  id?: MascotId;
  palette?: PaletteId;
  size?: number;
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

export const PixelMascot: React.FC<PixelMascotProps> = ({
  id = 'dino',
  palette = 'eblo_lime',
  size = 32,
  animated = true,
  className = '',
  onClick,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [beaconPulse, setBeaconPulse] = useState(false);

  useEffect(() => {
    if (!animated) return;

    // Periodic blink
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 4200);

    // Periodic antenna beacon pulse
    const beaconInterval = setInterval(() => {
      setBeaconPulse((prev) => !prev);
    }, 1100);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(beaconInterval);
    };
  }, [animated]);

  const rawGrid = GRIDS[id] || GRIDS.frog;
  const currentPalette = PALETTES[palette] || PALETTES.eblo_lime;
  const colors = currentPalette.colors;

  // Render 20x20 SVG rects
  const rects: React.ReactNode[] = [];
  const rows = rawGrid;

  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      let char = row[x];

      // Handle blink state on visor glare
      if (isBlinking && (y === 7 || y === 8)) {
        if (char === 'W' || char === 'C') {
          char = 'D'; // narrow shadow
        }
      }

      // Handle antenna pulse
      let fill = colors[char] || 'transparent';
      if (char === 'A') {
        fill = beaconPulse ? '#ffffff' : colors['A'];
      }

      if (fill !== 'transparent') {
        rects.push(
          <rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={1}
            height={1}
            fill={fill}
          />
        );
      }
    }
  }

  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className={`shrink-0 select-none ${className}`}
      style={{
        shapeRendering: 'crispEdges',
        imageRendering: 'pixelated',
      }}
      onClick={onClick}
    >
      {rects}
    </svg>
  );
};

export const getSavedMascot = (): { id: MascotId; palette: PaletteId } => {
  const savedId = (localStorage.getItem('bridgik_mascot') as MascotId) || 'dino';
  const savedPalette = (localStorage.getItem('bridgik_mascot_palette') as PaletteId) || 'eblo_lime';
  return {
    id: GRIDS[savedId] ? savedId : 'dino',
    palette: PALETTES[savedPalette] ? savedPalette : 'eblo_lime',
  };
};

export const saveMascotChoice = (id: MascotId, palette: PaletteId) => {
  localStorage.setItem('bridgik_mascot', id);
  localStorage.setItem('bridgik_mascot_palette', palette);
  window.dispatchEvent(new Event('bridgik_mascot_updated'));
};
