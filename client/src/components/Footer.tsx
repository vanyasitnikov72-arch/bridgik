import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { sound } from '../utils/sound.js';

interface FooterProps {
  onOpenAbout?: () => void;
}

type ModalType = 'rules' | 'privacy' | 'terms' | null;

export const Footer: React.FC<FooterProps> = ({ onOpenAbout: _onOpenAbout }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [ghostBounced, setGhostBounced] = useState(false);
  const [dinoBounced, setDinoBounced] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support@bridgik.ru').catch(() => {});
    setCopiedEmail(true);
    sound.playClick();
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const closeModal = () => {
    setActiveModal(null);
    sound.playClick();
  };

  const handleGhostClick = () => {
    sound.playMessage();
    setGhostBounced(true);
    setTimeout(() => setGhostBounced(false), 600);
  };

  const handleDinoClick = () => {
    sound.playConnect();
    setDinoBounced(true);
    setTimeout(() => setDinoBounced(false), 600);
  };

  return (
    <footer className="mt-auto border-t border-white/[0.08] bg-[#141414] pt-8 pb-7 relative overflow-hidden select-none">
      {/* Scalloped Pixel Ground Terrain / Clouds along bottom (matching eblo.id style) */}
      <div className="absolute inset-x-0 bottom-0 h-8 sm:h-10 flex items-end overflow-hidden pointer-events-none opacity-40">
        <svg
          className="w-full h-10"
          preserveAspectRatio="none"
          viewBox="0 0 1200 36"
          shapeRendering="crispEdges"
        >
          {/* Back darker cloud mounds */}
          <path
            d="M0 36 V 18 Q 30 6 60 18 Q 90 4 120 18 Q 150 8 180 18 Q 210 4 240 18 Q 270 10 300 18 Q 330 4 360 18 Q 390 8 420 18 Q 450 4 480 18 Q 510 8 540 18 Q 570 4 600 18 Q 630 8 660 18 Q 690 4 720 18 Q 750 8 780 18 Q 810 4 840 18 Q 870 8 900 18 Q 930 4 960 18 Q 990 8 1020 18 Q 1050 4 1080 18 Q 1110 8 1140 18 Q 1170 4 1200 18 V 36 Z"
            fill="#1c1c1c"
          />
          {/* Foreground cloud mounds */}
          <path
            d="M0 36 V 22 Q 40 10 80 22 Q 120 12 160 22 Q 200 10 240 22 Q 280 12 320 22 Q 360 10 400 22 Q 440 12 480 22 Q 520 10 560 22 Q 600 12 640 22 Q 680 10 720 22 Q 760 12 800 22 Q 840 10 880 22 Q 920 12 960 22 Q 1000 10 1040 22 Q 1080 12 1120 22 Q 1160 10 1200 22 V 36 Z"
            fill="#232323"
          />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center text-center relative z-10">
        {/* Credits in eblo.id style: Поддержка / Разработка */}
        <div className="flex items-center justify-center gap-12 sm:gap-24 mb-5 text-center">
          <div>
            <p className="text-xs sm:text-sm text-[#888888] font-bold uppercase tracking-wider mb-0.5">
              Архитектура
            </p>
            <p className="font-extrabold text-xl sm:text-2xl text-[#ededed]">
              Zero-Storage
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-[#888888] font-bold uppercase tracking-wider mb-0.5">
              Протокол
            </p>
            <p className="font-extrabold text-xl sm:text-2xl text-[#9ac43e]">
              WebRTC Direct P2P
            </p>
          </div>
        </div>

        {/* Horizontal tabs matching eblo.id style: Правила сайта · Конфиденциальность · Оферта · support@bridgik.ru */}
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-9 md:gap-11 text-base sm:text-xl text-[#999999] mb-3 font-semibold">
          <button
            onClick={() => {
              setActiveModal('rules');
              sound.playClick();
            }}
            className="hover:text-[#ededed] cursor-pointer transition-colors"
          >
            Правила сайта
          </button>
          <button
            onClick={() => {
              setActiveModal('privacy');
              sound.playClick();
            }}
            className="hover:text-[#ededed] cursor-pointer transition-colors"
          >
            Конфиденциальность
          </button>
          <button
            onClick={() => {
              setActiveModal('terms');
              sound.playClick();
            }}
            className="hover:text-[#ededed] cursor-pointer transition-colors"
          >
            Оферта
          </button>
          <button
            onClick={handleCopyEmail}
            className="hover:text-[#9ac43e] cursor-pointer transition-colors flex items-center gap-1.5"
            title="Нажмите, чтобы скопировать email"
          >
            {copiedEmail ? (
              <span className="text-[#9ac43e] font-bold flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>Скопировано!</span>
              </span>
            ) : (
              <span>support@bridgik.ru</span>
            )}
          </button>
        </div>

        {/* Sub-tagline */}
        <p className="text-sm sm:text-base text-[#666666] font-mono">
          bridgik — мост между вашими экранами · 0 байт на сервере
        </p>
      </div>

      {/* Left Mascot Group: Purple Pac-Man Ghost + Retro PC Terminal */}
      <div className="hidden lg:flex items-end gap-3 absolute left-6 bottom-2 z-10 select-none">
        {/* Purple Pac-Man Ghost (GhostRoom Mascot) */}
        <div
          onClick={handleGhostClick}
          className={`cursor-pointer transition-transform group animate-ghost ${
            ghostBounced ? '-translate-y-3 scale-110' : 'hover:-translate-y-1'
          }`}
          title="P2P Ghost (кликните меня!)"
        >
          <svg
            width="56"
            height="58"
            viewBox="0 0 16 16"
            shapeRendering="crispEdges"
            className="drop-shadow-md"
          >
            {/* Ghost Body (Purple #9333ea / #a855f7) */}
            <rect x="5" y="1" width="6" height="1" fill="#9333ea" />
            <rect x="3" y="2" width="10" height="1" fill="#a855f7" />
            <rect x="2" y="3" width="12" height="1" fill="#a855f7" />
            <rect x="1" y="4" width="14" height="7" fill="#a855f7" />
            {/* Bottom wavy skirts */}
            <rect x="1" y="11" width="14" height="2" fill="#9333ea" />
            <rect x="1" y="13" width="2" height="1" fill="#9333ea" />
            <rect x="5" y="13" width="2" height="1" fill="#9333ea" />
            <rect x="9" y="13" width="2" height="1" fill="#9333ea" />
            <rect x="13" y="13" width="2" height="1" fill="#9333ea" />
            <rect x="1" y="14" width="1" height="1" fill="#9333ea" />
            <rect x="6" y="14" width="1" height="1" fill="#9333ea" />
            <rect x="10" y="14" width="1" height="1" fill="#9333ea" />
            <rect x="14" y="14" width="1" height="1" fill="#9333ea" />

            {/* Eyes White */}
            <rect x="3" y="5" width="3" height="4" fill="#ffffff" />
            <rect x="9" y="5" width="3" height="4" fill="#ffffff" />
            {/* Pupils Looking right/center */}
            <rect x="4" y="6" width="2" height="3" fill="#1e1b4b" />
            <rect x="10" y="6" width="2" height="3" fill="#1e1b4b" />
          </svg>
        </div>

        {/* Retro PC Terminal */}
        <div className="opacity-80">
          <svg
            width="58"
            height="52"
            viewBox="0 0 34 31"
            shapeRendering="crispEdges"
            className="shrink-0 drop-shadow-sm"
          >
            <rect x="2" y="1" width="24" height="18" fill="#2d2d2d" />
            <rect x="2" y="1" width="24" height="1" fill="#444444" />
            <rect x="2" y="1" width="1" height="18" fill="#3a3a3a" />
            <rect x="25" y="2" width="1" height="17" fill="#1e1e1e" />
            <rect x="2" y="18" width="24" height="1" fill="#1a1a1a" />
            <rect x="4" y="3" width="20" height="13" fill="#1c1c1c" />
            <rect x="5" y="4" width="18" height="11" fill="#0d1408" />
            <rect x="6" y="5" width="1" height="1" fill="#789d2a" />
            <rect x="7" y="6" width="1" height="1" fill="#789d2a" />
            <rect x="6" y="7" width="1" height="1" fill="#789d2a" />
            <rect x="9" y="7" width="2" height="1" fill="#9ac43e" className="animate-pulse" />
            <rect x="9" y="8" width="1" height="2" fill="#9ac43e" />
            <rect x="10" y="7" width="2" height="1" fill="#9ac43e" />
            <rect x="12" y="8" width="1" height="2" fill="#9ac43e" />
            <rect x="16" y="8" width="1" height="2" fill="#9ac43e" />
            <rect x="17" y="7" width="2" height="1" fill="#9ac43e" />
            <rect x="19" y="8" width="1" height="2" fill="#9ac43e" />
            <rect x="13" y="11" width="1" height="1" fill="#9ac43e" />
            <rect x="14" y="12" width="2" height="1" fill="#9ac43e" />
            <rect x="16" y="11" width="1" height="1" fill="#9ac43e" />
            <rect x="20" y="16" width="1" height="1" fill="#789d2a" />
            <rect x="22" y="16" width="1" height="1" fill="#3a3a3a" />
            <rect x="12" y="19" width="4" height="2" fill="#222222" />
            <rect x="11" y="20" width="6" height="1" fill="#1e1e1e" />
            <rect x="1" y="21" width="26" height="6" fill="#2d2d2d" />
            <rect x="1" y="21" width="26" height="1" fill="#3d3d3d" />
            <rect x="26" y="22" width="1" height="5" fill="#1b1b1b" />
            <rect x="1" y="26" width="26" height="1" fill="#181818" />
            <rect x="4" y="23" width="9" height="1" fill="#141414" />
            <rect x="14" y="23" width="1" height="1" fill="#789d2a" />
            <rect x="2" y="28" width="14" height="2" fill="#242424" />
            <rect x="3" y="29" width="12" height="1" fill="#181818" />
            <rect x="19" y="28" width="3" height="2" fill="#242424" />
          </svg>
        </div>
      </div>

      {/* Right Mascot Group: Green Chrome Pixel Dino + Retro Smartphone */}
      <div className="hidden lg:flex items-end gap-3.5 absolute right-6 bottom-2 z-10 select-none">
        {/* Retro Smartphone */}
        <div className="opacity-80">
          <svg
            width="32"
            height="52"
            viewBox="0 0 18 31"
            shapeRendering="crispEdges"
            className="shrink-0 drop-shadow-sm"
          >
            <rect x="1" y="1" width="16" height="29" rx="2" fill="#2d2d2d" />
            <rect x="1" y="1" width="16" height="1" fill="#444444" />
            <rect x="1" y="1" width="1" height="29" fill="#3a3a3a" />
            <rect x="16" y="2" width="1" height="28" fill="#1a1a1a" />
            <rect x="1" y="29" width="16" height="1" fill="#151515" />
            <rect x="7" y="2" width="4" height="1" fill="#181818" />
            <rect x="2" y="4" width="14" height="23" fill="#0d1408" />
            <rect x="7" y="5" width="4" height="1" fill="#223315" />
            <rect x="5" y="12" width="1" height="2" fill="#9ac43e" />
            <rect x="6" y="11" width="2" height="1" fill="#9ac43e" />
            <rect x="8" y="12" width="1" height="2" fill="#9ac43e" />
            <rect x="10" y="12" width="1" height="2" fill="#9ac43e" />
            <rect x="11" y="11" width="2" height="1" fill="#9ac43e" />
            <rect x="13" y="12" width="1" height="2" fill="#9ac43e" />
            <rect x="8" y="15" width="2" height="1" fill="#9ac43e" />
            <rect x="6" y="21" width="6" height="3" fill="#182613" />
            <rect x="7" y="22" width="4" height="1" fill="#9ac43e" className="animate-pulse" />
            <rect x="7" y="28" width="4" height="1" fill="#222222" />
          </svg>
        </div>

        {/* Green Chrome Pixel Dinosaur (T-Rex) */}
        <div
          onClick={handleDinoClick}
          className={`cursor-pointer transition-transform group ${
            dinoBounced ? '-translate-y-3 scale-110' : 'hover:-translate-y-1'
          }`}
          title="Offline Dino (кликните меня!)"
        >
          <svg
            width="56"
            height="58"
            viewBox="0 0 20 20"
            shapeRendering="crispEdges"
            className="drop-shadow-md"
          >
            {/* Dino Head & Jaw */}
            <rect x="10" y="2" width="8" height="6" fill="#789d2a" />
            <rect x="10" y="2" width="7" height="1" fill="#9ac43e" />
            {/* Dino Eye */}
            <rect x="12" y="3" width="1" height="1" fill="#141414" />
            {/* Open mouth slit */}
            <rect x="14" y="6" width="4" height="1" fill="#141414" />
            <rect x="11" y="7" width="5" height="1" fill="#789d2a" />

            {/* Neck & Body */}
            <rect x="8" y="5" width="3" height="4" fill="#789d2a" />
            <rect x="6" y="8" width="5" height="6" fill="#789d2a" />
            <rect x="5" y="9" width="1" height="4" fill="#789d2a" />
            <rect x="4" y="10" width="1" height="2" fill="#789d2a" />

            {/* Tail */}
            <rect x="2" y="9" width="2" height="2" fill="#789d2a" />
            <rect x="1" y="8" width="2" height="1" fill="#789d2a" />
            <rect x="3" y="11" width="2" height="1" fill="#789d2a" />

            {/* Tiny Dino Arms */}
            <rect x="11" y="9" width="2" height="1" fill="#9ac43e" />
            <rect x="12" y="10" width="1" height="1" fill="#9ac43e" />

            {/* Legs & Feet */}
            <rect x="7" y="14" width="2" height="3" fill="#789d2a" />
            <rect x="7" y="17" width="3" height="1" fill="#9ac43e" />
            <rect x="10" y="14" width="2" height="2" fill="#789d2a" />
            <rect x="10" y="16" width="3" height="1" fill="#9ac43e" />
          </svg>
        </div>
      </div>

      {/* Legal Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#1c1c1c] border border-[#3a3a3a] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto text-left select-text">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#333333]">
              <h3 className="text-2xl font-extrabold text-[#ededed]">
                {activeModal === 'rules' && 'Правила сайта bridgik.ru'}
                {activeModal === 'privacy' && 'Политика конфиденциальности'}
                {activeModal === 'terms' && 'Пользовательское соглашение и оферта'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg bg-[#262626] hover:bg-[#333333] text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="py-5 space-y-4 text-base text-[#cccccc] leading-relaxed">
              {activeModal === 'rules' && (
                <>
                  <p>
                    <strong className="text-white">1. Общие положения.</strong> Веб-сервис bridgik.ru предназначен для прямого безопасного обмена файлами, текстом и аудиосвязью между браузерами пользователей по технологии WebRTC.
                  </p>
                  <p>
                    <strong className="text-white">2. Принцип Zero-Storage.</strong> Сервер bridgik выполняет исключительно функцию сигнального узла (handshake) для установления прямого p2p-соединения. Ваши файлы, текстовые сообщения и аудиопотоки не загружаются на сервер и не сохраняются в каких-либо базах данных.
                  </p>
                  <p>
                    <strong className="text-white">3. Ответственность пользователя.</strong> Пользователь несёт полную ответственность за передаваемый контент. Категорически запрещается использовать сервис для распространения вредоносного программного обеспечения, спама или материалов, нарушающих действующее законодательство.
                  </p>
                  <p>
                    <strong className="text-white">4. Условия доступа.</strong> Доступ к функционалу сервиса предоставляется на безвозмездной основе и без обязательной регистрации аккаунта.
                  </p>
                </>
              )}

              {activeModal === 'privacy' && (
                <>
                  <p>
                    <strong className="text-white">1. Нулевой сбор персональных данных.</strong> Сервис bridgik.ru принципиально не собирает персональные данные: мы не требуем email, телефон, ФИО или авторизацию через соцсети.
                  </p>
                  <p>
                    <strong className="text-white">2. Отсутствие трекеров и аналитики.</strong> Мы не используем сторонние трекеры (Яндекс.Метрика, Google Analytics, рекламные пиксели) и не сохраняем куки отслеживания.
                  </p>
                  <p>
                    <strong className="text-white">3. Сквозное шифрование (E2E).</strong> Все данные между участниками передаются в зашифрованном виде с использованием протоколов DTLS/SRTP (алгоритмы AES-128 / AES-256). Никакие промежуточные узлы не имеют доступа к ключам дешифрования.
                  </p>
                  <p>
                    <strong className="text-white">4. Мгновенное уничтожение сессии.</strong> При закрытии вкладки комната и эфемерные ключи безвозвратно удаляются из оперативной памяти браузера и сигнального сервера.
                  </p>
                </>
              )}

              {activeModal === 'terms' && (
                <>
                  <p>
                    <strong className="text-white">1. Предмет оферты.</strong> Настоящий документ регулирует условия безвозмездного использования веб-приложения bridgik.ru неограниченным кругом лиц.
                  </p>
                  <p>
                    <strong className="text-white">2. Отказ от гарантий.</strong> Сервис предоставляется на условиях «как есть» («as is»). Администрация не гарантирует бесперебойную работу при сбоях интернет-провайдеров, блокировках NAT/брандмауэров или нестабильности локальных Wi-Fi сетей.
                  </p>
                  <p>
                    <strong className="text-white">3. Ограничение ответственности.</strong> Администрация не несёт ответственности за прямой или косвенный ущерб, возникший в результате использования или невозможности использования сервиса.
                  </p>
                  <p>
                    <strong className="text-white">4. Контакты и обратная связь.</strong> По всем вопросам и предложениям обращайтесь на электронную почту: <strong className="text-[#9ac43e]">support@bridgik.ru</strong>.
                  </p>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-[#333333] flex justify-end">
              <button
                onClick={closeModal}
                className="px-5 py-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333333] text-[#ededed] text-base font-bold transition-colors cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
