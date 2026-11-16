import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Copy, Sparkles, Eye, ExternalLink, Zap } from 'lucide-react';
import {
  PixelMascot,
  MascotId,
  PaletteId,
  MASCOT_LIST,
  PALETTES,
  getSavedMascot,
  saveMascotChoice,
} from './mascots/PixelMascot.js';
import { sound } from '../utils/sound.js';

interface BrandShowcaseViewProps {
  onBack: () => void;
}

export const BrandShowcaseView: React.FC<BrandShowcaseViewProps> = ({ onBack }) => {
  const [selectedMascot, setSelectedMascot] = useState<MascotId>('dino');
  const [selectedPalette, setSelectedPalette] = useState<PaletteId>('eblo_lime');
  const [appliedInHeader, setAppliedInHeader] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    const saved = getSavedMascot();
    setSelectedMascot(saved.id);
    setSelectedPalette(saved.palette);
  }, []);

  const handleApplyToHeader = () => {
    saveMascotChoice(selectedMascot, selectedPalette);
    sound.playMessage();
    setAppliedInHeader(true);
    setTimeout(() => setAppliedInHeader(false), 2500);
  };

  const handleCopySvg = () => {
    // Generate SVG string
    const svgEl = document.getElementById('studio-mascot-svg');
    if (svgEl) {
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgEl);
      navigator.clipboard.writeText(svgStr).then(() => {
        setCopiedSvg(true);
        sound.playClick();
        setTimeout(() => setCopiedSvg(false), 2000);
      });
    }
  };

  const currentMascotInfo = MASCOT_LIST.find((m) => m.id === selectedMascot) || MASCOT_LIST[0];

  const galleryItems = [
    {
      title: 'Кибер-Динозаврик · Горизонтальный логотип',
      desc: '★ Официальный логотип bridgik: зеленый динозаврик в кибер-очках с радиомаяком связи и пиксельным шрифтом',
      src: '/mascots/dino_horizontal.jpg',
      tag: '★ Главный выбор',
    },
    {
      title: 'Кибер-Динозаврик · 1:1 Аватар',
      desc: 'Четкий 16-bit аватар динозаврика с радиоволнами над головой для иконки и фавикона',
      src: '/mascots/dino_avatar.jpg',
      tag: '★ Основной аватар',
    },
    {
      title: 'Жабик Бриджик · Горизонтальный логотип',
      desc: 'Полноразмерный 16-bit пиксельный логотип с неоновым амфибийным маскотом',
      src: '/mascots/frog_horizontal.jpg',
      tag: 'Жабик · Лого',
    },
    {
      title: 'Жабик Бриджик · 1:1 Аватар',
      desc: 'Амфибийный нетраннер в бирюзовых кибер-очках с сигнальным маяком',
      src: '/mascots/frog_avatar.jpg',
      tag: 'Жабик · Аватар',
    },
    {
      title: 'Зеленый Кибер-Кот · Горизонтальный логотип',
      desc: 'Зеленый пиксельный кот с антенной Wi-Fi волн и неоновой надписью',
      src: '/mascots/green_cat_horizontal.jpg',
      tag: 'Новинка · Кот',
    },
    {
      title: 'Кибер-Пришелец · Горизонтальный логотип',
      desc: 'Зеленый гуманоидный нетраннер в массивных очках в духе eblo.id',
      src: '/mascots/alien_horizontal.jpg',
      tag: 'Новинка · Пришелец',
    },
    {
      title: 'Кибер-Пришелец · 1:1 Аватар',
      desc: 'Пиксельный аватар зеленого пришельца с радиомаяком связи',
      src: '/mascots/alien_avatar.jpg',
      tag: 'Аватар · Пришелец',
    },
    {
      title: 'Кибер-Черепашка · Надежный радиомост',
      desc: 'Зеленая черепашка-нода в бирюзовых очках — стабильный P2P канал',
      src: '/mascots/turtle_horizontal.jpg',
      tag: 'Новинка · Черепашка',
    },
    {
      title: 'Мостик-Бот · CRT Терминал',
      desc: 'Ретро-монитор с V-антеннами, транслирующий WebRTC радиомост',
      src: '/mascots/crt_robot_avatar.jpg',
      tag: 'Робот / Монитор',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12 pb-24">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-[#222222] border border-[#3a3a3a] text-[#aaaaaa] hover:text-[#ededed] hover:border-[#789d2a] transition-colors cursor-pointer"
            title="Вернуться на главную"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#ededed] tracking-tight">
                Брендинг & Маскот <span className="text-[#9ac43e]">bridgik</span>
              </h1>
              <span className="text-xs uppercase px-2 py-0.5 rounded bg-[#222222] text-[#9ac43e] border border-[#3a3a3a] font-bold">
                eblo.id vibe
              </span>
            </div>
            <p className="text-base sm:text-lg text-[#aaaaaa] mt-0.5">
              Экспериментальная лаборатория стиля: векторный 16-bit пиксель-арт, живые анимации и концепты
            </p>
          </div>
        </div>

        <button
          onClick={handleApplyToHeader}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-base transition-all cursor-pointer ${
            appliedInHeader
              ? 'bg-[#789d2a] text-white shadow-[0_0_20px_rgba(120,157,42,0.4)]'
              : 'bg-[#222222] hover:bg-[#2a2a2a] text-[#ededed] border border-[#3a3a3a] hover:border-[#789d2a]'
          }`}
        >
          {appliedInHeader ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Установлено в шапку!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#9ac43e]" />
              <span>Применить в шапку сайта</span>
            </>
          )}
        </button>
      </div>

      {/* SECTION 1: Interactive Mascot Studio */}
      <div className="bg-[#1f1f1f] rounded-2xl border border-white/[0.08] p-6 sm:p-8 space-y-8">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-[#ededed] flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-[#9ac43e]" />
              Интерактивный пиксельный маскот
            </h2>
            <span className="text-xs font-mono text-[#9ac43e] bg-[#2a2a2a] px-2.5 py-1 rounded-md border border-[#3a3a3a]">
              SVG 20x20 Vector Matrix
            </span>
          </div>
          <p className="text-[#aaaaaa] text-base mt-1">
            Кристально четкий пиксельный персонаж, моргающий в реальном времени и синхронизированный с P2P-маяком
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Big Stage / Mascot Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-xl bg-[#171717] border border-[#333333] relative overflow-hidden group">
            {/* Subtle retro scanline backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(#789d2a_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
            
            {/* Glow circle behind mascot */}
            <div className="absolute w-44 h-44 rounded-full bg-[#789d2a]/15 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center py-4">
              <div id="studio-mascot-svg">
                <PixelMascot
                  id={selectedMascot}
                  palette={selectedPalette}
                  size={160}
                  animated={true}
                  className="transition-transform duration-200 group-hover:scale-105"
                />
              </div>

              <div className="mt-6 text-center">
                <div className="text-2xl font-extrabold text-[#ededed]">
                  {currentMascotInfo.name}
                </div>
                <div className="text-sm font-mono text-[#9ac43e] mt-0.5">
                  {currentMascotInfo.tagline}
                </div>
              </div>
            </div>

            {/* Actions: Copy SVG & Sound */}
            <div className="flex items-center gap-3 mt-4 z-10">
              <button
                onClick={handleCopySvg}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222222] border border-[#3a3a3a] text-xs font-bold text-[#aaaaaa] hover:text-[#ededed] hover:border-[#789d2a] transition-colors cursor-pointer"
              >
                {copiedSvg ? <Check className="w-3.5 h-3.5 text-[#9ac43e]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSvg ? 'SVG скопирован!' : 'Скопировать SVG код'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Model Selector */}
            <div>
              <label className="block text-xs uppercase font-extrabold text-[#9ac43e] tracking-wider mb-2.5">
                1. Выберите персонажа
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {MASCOT_LIST.map((m) => {
                  const isSelected = selectedMascot === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedMascot(m.id);
                        sound.playClick();
                      }}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#283216]/60 border-[#789d2a] text-[#ededed] shadow-[0_0_15px_rgba(120,157,42,0.15)]'
                          : 'bg-[#1a1a1a] border-[#333333] text-[#aaaaaa] hover:text-[#ededed] hover:border-[#555555]'
                      }`}
                    >
                      <div className="p-1 rounded-lg bg-[#141414] border border-[#2a2a2a] shrink-0">
                        <PixelMascot id={m.id} palette={selectedPalette} size={32} animated={false} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-base leading-tight text-[#ededed]">
                          {m.name}
                        </div>
                        <div className="text-xs text-[#999999] truncate mt-0.5">
                          {m.tagline.split('·')[0]}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Palette Selector */}
            <div>
              <label className="block text-xs uppercase font-extrabold text-[#9ac43e] tracking-wider mb-2.5">
                2. Цветовая палитра
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(Object.keys(PALETTES) as PaletteId[]).map((palKey) => {
                  const isSelected = selectedPalette === palKey;
                  const pal = PALETTES[palKey];
                  return (
                    <button
                      key={palKey}
                      onClick={() => {
                        setSelectedPalette(palKey);
                        sound.playClick();
                      }}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#283216]/60 border-[#789d2a] text-[#ededed]'
                          : 'bg-[#1a1a1a] border-[#333333] text-[#aaaaaa] hover:text-[#ededed] hover:border-[#555555]'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/40"
                          style={{ backgroundColor: pal.colors['L'] }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/40"
                          style={{ backgroundColor: pal.colors['C'] }}
                        />
                      </div>
                      <span className="text-xs font-bold leading-tight truncate w-full">
                        {pal.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Real-time Header Simulation */}
            <div>
              <label className="block text-xs uppercase font-extrabold text-[#9ac43e] tracking-wider mb-2.5">
                3. Предпросмотр в шапке сайта (Navbar Live)
              </label>
              <div className="p-4 rounded-xl bg-[#171717] border border-[#333333] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-[#222222] border border-[#3a3a3a] shrink-0">
                    <PixelMascot id={selectedMascot} palette={selectedPalette} size={30} animated={true} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-3xl tracking-tight text-[#ededed]">
                      bridgik
                    </span>
                    <span className="text-xs uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-[#222222] text-[#9ac43e] border border-[#3a3a3a]">
                      p2p
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm font-bold text-[#aaaaaa]">
                  <span className="text-[#ededed] border-b-2 border-[#789d2a] pb-0.5">Главная</span>
                  <span className="hidden sm:inline">О сервисе</span>
                  <span className="text-[#9ac43e] text-xs font-mono font-bold hidden sm:inline">
                    · сеть активна
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Typography & Styling Variants */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-[#ededed]">
            Варианты оформления названия «bridgik»
          </h2>
          <p className="text-[#aaaaaa] text-base mt-1">
            Сравнение типографических стилей в духе eblo.id и кибер-радиомоста
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Variant A: Classic Eblo Style */}
          <div className="p-6 rounded-2xl bg-[#1f1f1f] border border-white/[0.08] hover:border-[#789d2a] transition-all space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#9ac43e]">
              <span>[ ВАРИАНТ А : КЛАССИКА EBLO.ID ]</span>
              <span className="px-2 py-0.5 rounded bg-[#2a2a2a] border border-[#3a3a3a]">Рекомендуемый</span>
            </div>
            <div className="flex items-center gap-3 py-2">
              <PixelMascot id={selectedMascot} palette={selectedPalette} size={42} animated={true} />
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-[#9ac43e] tracking-tight hover:brightness-110 transition-all">
                  bridgik
                </span>
                <span className="text-xs uppercase font-extrabold px-1.5 py-0.5 rounded bg-[#222222] text-[#bbf348] border border-[#3a3a3a]">
                  direct
                </span>
              </div>
            </div>
            <p className="text-sm text-[#aaaaaa]">
              Ярко-зеленый строчный пиксельный шрифт в одном ряду с маскотом. Максимально лаконично, чисто и узнаваемо.
            </p>
          </div>

          {/* Variant B: Glitch / Monospace Tag */}
          <div className="p-6 rounded-2xl bg-[#1f1f1f] border border-white/[0.08] hover:border-[#789d2a] transition-all space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#aaaaaa]">
              <span>[ ВАРИАНТ Б : РАДИОМОСТ P2P ]</span>
            </div>
            <div className="flex items-center gap-3 py-2">
              <PixelMascot id={selectedMascot} palette={selectedPalette} size={42} animated={true} />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-extrabold text-[#ededed] tracking-tight">
                    bridgik
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#263116] text-[#bbf348] border border-[#789d2a]">
                    8-bit p2p
                  </span>
                </div>
                <span className="text-xs font-mono text-[#789d2a] tracking-wider">
                  мост между экранами · 0 байт на сервере
                </span>
              </div>
            </div>
            <p className="text-sm text-[#aaaaaa]">
              Белое ядро логотипа с акцентным зеленым бейджем и поясняющим субтитром технологии соединения.
            </p>
          </div>

          {/* Variant C: Geometric Hex-Box */}
          <div className="p-6 rounded-2xl bg-[#1f1f1f] border border-white/[0.08] hover:border-[#789d2a] transition-all space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#aaaaaa]">
              <span>[ ВАРИАНТ В : ДВУХЦВЕТНЫЙ НЕОН ]</span>
            </div>
            <div className="flex items-center gap-3 py-2">
              <PixelMascot id={selectedMascot} palette={selectedPalette} size={42} animated={true} />
              <span className="text-3xl font-black tracking-wider">
                <span className="text-[#ededed]">bridg</span>
                <span className="text-[#00f0ff]">ik</span>
                <span className="text-[#9ac43e] ml-1">.p2p</span>
              </span>
            </div>
            <p className="text-sm text-[#aaaaaa]">
              Бирюзовый акцент на суффиксе «ik» перекликается с цветом кибер-очков маскота.
            </p>
          </div>

          {/* Variant D: Retro Cyber Tag */}
          <div className="p-6 rounded-2xl bg-[#1f1f1f] border border-white/[0.08] hover:border-[#789d2a] transition-all space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#aaaaaa]">
              <span>[ ВАРИАНТ Г : МИНИМАЛ-КОНТЕЙНЕР ]</span>
            </div>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-[#171717] border border-[#3a3a3a]">
              <PixelMascot id={selectedMascot} palette={selectedPalette} size={36} animated={true} />
              <span className="text-2xl font-black text-[#ededed] tracking-wider">
                [ bridgik ]
              </span>
              <span className="w-2 h-2 rounded-full bg-[#789d2a] animate-pulse" />
            </div>
            <p className="text-sm text-[#aaaaaa]">
              Оформление в виде терминальной скобочной ноды с мигающим зеленым индикатором онлайна.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Concept Art Gallery */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-[#ededed]">
            Галерея 16-bit концепт-артов
          </h2>
          <p className="text-[#aaaaaa] text-base mt-1">
            Полноразмерные пиксельные иллюстрации персонажей и логотипов. Нажмите на любую для полноэкранного просмотра
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setLightboxImage(item.src)}
              className="bg-[#1f1f1f] rounded-2xl border border-white/[0.08] hover:border-[#789d2a] transition-all overflow-hidden flex flex-col group cursor-pointer"
            >
              <div className="relative aspect-video bg-[#121212] overflow-hidden flex items-center justify-center p-2">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  style={{ imageRendering: 'pixelated' }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="p-2.5 rounded-full bg-[#222222]/90 text-white border border-white/20">
                    <Eye className="w-5 h-5" />
                  </span>
                </div>
                <span className="absolute top-2.5 right-2.5 text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/70 text-[#9ac43e] border border-white/10 backdrop-blur-sm">
                  {item.tag}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="font-extrabold text-lg text-[#ededed] group-hover:text-[#9ac43e] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#aaaaaa] mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-[#9ac43e] font-mono font-bold">
                  <span>16-bit Pixel Art</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Открыть <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[90vh] bg-[#1a1a1a] rounded-2xl border border-white/10 p-4 flex flex-col items-center space-y-4"
          >
            <div className="w-full flex items-center justify-between text-sm text-[#aaaaaa]">
              <span className="font-mono text-[#9ac43e]">Пиксельный концепт bridgik</span>
              <button
                onClick={() => setLightboxImage(null)}
                className="px-3 py-1 rounded-lg bg-[#2a2a2a] text-[#ededed] hover:bg-[#333333] transition-colors cursor-pointer"
              >
                Закрыть (Esc)
              </button>
            </div>
            <div className="overflow-auto max-h-[75vh] flex items-center justify-center p-2 bg-[#111111] rounded-xl border border-white/5">
              <img
                src={lightboxImage}
                alt="Enlarged Mascot Concept"
                className="max-w-full max-h-[70vh] object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
