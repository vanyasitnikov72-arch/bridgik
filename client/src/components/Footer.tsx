import React, { useState } from 'react';
import { X } from 'lucide-react';
import { sound } from '../utils/sound.js';

interface FooterProps {
  onOpenAbout?: () => void;
  onOpenLegal?: (doc: 'rules' | 'privacy' | 'terms') => void;
  onOpenPricing?: () => void;
}

type ModalType = 'rules' | 'privacy' | 'terms' | null;

export const Footer: React.FC<FooterProps> = ({ onOpenAbout: _onOpenAbout, onOpenLegal, onOpenPricing }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [pcClicked, setPcClicked] = useState(false);
  const [phoneClicked, setPhoneClicked] = useState(false);

  const closeModal = () => {
    setActiveModal(null);
    sound.playClick();
  };

  const handlePcClick = () => {
    sound.playClick();
    setPcClicked(true);
    setTimeout(() => setPcClicked(false), 700);
  };

  const handlePhoneClick = () => {
    sound.playConnect();
    setPhoneClicked(true);
    setTimeout(() => setPhoneClicked(false), 700);
  };

  return (
    <footer className="mt-auto border-t border-white/[0.08] bg-[#141414] pt-9 pb-8 relative overflow-hidden select-none">
      {/* Scalloped Pixel Ground Terrain / Clouds along bottom (matching eblo.id style) */}
      <div className="absolute inset-x-0 bottom-0 h-9 sm:h-11 flex items-end overflow-hidden pointer-events-none opacity-50">
        <svg
          className="w-full h-11"
          preserveAspectRatio="none"
          viewBox="0 0 1200 40"
          shapeRendering="crispEdges"
        >
          {/* Back darker cloud mounds */}
          <path
            d="M0 40 V 20 Q 30 6 60 20 Q 90 4 120 20 Q 150 8 180 20 Q 210 4 240 20 Q 270 10 300 20 Q 330 4 360 20 Q 390 8 420 20 Q 450 4 480 20 Q 510 8 540 20 Q 570 4 600 20 Q 630 8 660 20 Q 690 4 720 20 Q 750 8 780 20 Q 810 4 840 20 Q 870 8 900 20 Q 930 4 960 20 Q 990 8 1020 20 Q 1050 4 1080 20 Q 1110 8 1140 20 Q 1170 4 1200 20 V 40 Z"
            fill="#1c1c1c"
          />
          {/* Middle cloud mounds */}
          <path
            d="M0 40 V 25 Q 40 10 80 25 Q 120 12 160 25 Q 200 10 240 25 Q 280 12 320 25 Q 360 10 400 25 Q 440 12 480 25 Q 520 10 560 25 Q 600 12 640 25 Q 680 10 720 25 Q 760 12 800 25 Q 840 10 880 25 Q 920 12 960 25 Q 1000 10 1040 25 Q 1080 12 1120 25 Q 1160 10 1200 25 V 40 Z"
            fill="#232323"
          />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center text-center relative z-10">
        {/* Top Credits in eblo.id style: Архитектура / Протокол */}
        {/* Top Credits in eblo.id style: Архитектура / Протокол / Разработка */}
        <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 md:gap-24 mb-5 text-center">
          <div>
            <p className="text-xs sm:text-sm text-[#888888] font-bold uppercase tracking-wider mb-0.5">
              Архитектура
            </p>
            <p className="font-extrabold text-xl sm:text-2xl text-[#ededed]">
              Zero-Storage (0 байт)
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
          <div>
            <p className="text-xs sm:text-sm text-[#888888] font-bold uppercase tracking-wider mb-0.5">
              Разработка
            </p>
            <a
              href="https://t.me/IvanchesskO"
              target="_blank"
              rel="noopener noreferrer"
              className="font-extrabold text-xl sm:text-2xl text-[#ededed] hover:text-[#9ac43e] transition-colors inline-block cursor-pointer hover:underline"
              title="Telegram разработчика: @IvanchesskO"
            >
              tyypicall
            </a>
          </div>
        </div>

        {/* Horizontal tabs matching eblo.id style: Правила сайта · Конфиденциальность · Оферта · Тарифы */}
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-9 md:gap-11 text-base sm:text-xl text-[#999999] mb-3 font-semibold">
          <button
            onClick={() => {
              if (onOpenLegal) {
                onOpenLegal('rules');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setActiveModal('rules');
              }
              sound.playClick();
            }}
            className="hover:text-[#ededed] cursor-pointer transition-colors"
          >
            Правила сайта
          </button>
          <button
            onClick={() => {
              if (onOpenLegal) {
                onOpenLegal('privacy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setActiveModal('privacy');
              }
              sound.playClick();
            }}
            className="hover:text-[#ededed] cursor-pointer transition-colors"
          >
            Конфиденциальность
          </button>
          <button
            onClick={() => {
              if (onOpenLegal) {
                onOpenLegal('terms');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                setActiveModal('terms');
              }
              sound.playClick();
            }}
            className="hover:text-[#ededed] cursor-pointer transition-colors"
          >
            Оферта
          </button>
          <button
            onClick={() => {
              if (onOpenPricing) {
                onOpenPricing();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
              sound.playClick();
            }}
            className="hover:text-[#ededed] cursor-pointer transition-colors"
          >
            Тарифы
          </button>
        </div>
      </div>

      {/* Left Machine: Big Detailed Retro Workstation PC (Экран 1) */}
      <div
        onClick={handlePcClick}
        className={`hidden md:flex items-end absolute left-4 lg:left-8 bottom-1 z-10 select-none cursor-pointer transition-transform ${
          pcClicked ? '-translate-y-2 scale-105' : 'hover:-translate-y-1'
        }`}
        title="Экран 1: Компьютер (нажмите для клика!)"
      >
        <svg
          width="112"
          height="102"
          viewBox="0 0 50 46"
          shapeRendering="crispEdges"
          className="drop-shadow-lg"
        >
          {/* Steaming Coffee Mug on desk (left of PC) */}
          <rect x="2" y="36" width="6" height="7" fill="#292929" />
          <rect x="2" y="36" width="6" height="1" fill="#444444" />
          <rect x="3" y="37" width="4" height="2" fill="#d97706" />
          <rect x="8" y="38" width="2" height="4" fill="#292929" />
          <rect x="8" y="39" width="1" height="2" fill="#141414" />
          {/* Rising Steam Wisps from Coffee */}
          <rect x="4" y="32" width="1" height="2" fill="#fbbf24" opacity="0.8" className="animate-pulse" />
          <rect x="5" y="30" width="1" height="2" fill="#fbbf24" opacity="0.5" />
          <rect x="4" y="28" width="1" height="2" fill="#fbbf24" opacity="0.3" />

          {/* CRT Monitor Outer Plastic Housing */}
          <rect x="12" y="4" width="34" height="26" fill="#2d2d2d" />
          <rect x="12" y="4" width="34" height="1" fill="#484848" />
          <rect x="12" y="4" width="1" height="26" fill="#3c3c3c" />
          <rect x="45" y="5" width="1" height="25" fill="#1c1c1c" />
          <rect x="12" y="29" width="34" height="1" fill="#181818" />

          {/* CRT Bezel Inner Frame */}
          <rect x="15" y="7" width="28" height="19" fill="#1c1c1c" />
          <rect x="16" y="8" width="26" height="17" fill="#0d1508" />

          {/* CRT Phosphor Screen Face */}
          {/* Left Eye */}
          <rect x="20" y="13" width="2" height="3" fill="#9ac43e" />
          <rect x="21" y="12" width="3" height="1" fill="#9ac43e" />
          <rect x="23" y="13" width="2" height="3" fill="#9ac43e" />
          {/* Right Eye */}
          <rect x="31" y="13" width="2" height="3" fill="#9ac43e" />
          <rect x="32" y="12" width="3" height="1" fill="#9ac43e" />
          <rect x="34" y="13" width="2" height="3" fill="#9ac43e" />
          {/* Smiling Mouth \___/ */}
          <rect x="26" y="18" width="1" height="2" fill="#9ac43e" />
          <rect x="27" y="20" width="4" height="1" fill="#9ac43e" />
          <rect x="31" y="18" width="1" height="2" fill="#9ac43e" />
          {/* Terminal prompt >_ in upper corner */}
          <rect x="18" y="10" width="1" height="1" fill="#789d2a" />
          <rect x="19" y="10" width="2" height="1" fill="#bbf348" className="animate-pulse" />

          {/* Monitor Bottom Controls */}
          <rect x="15" y="27" width="28" height="2" fill="#252525" />
          <rect x="39" y="27" width="2" height="1" fill="#789d2a" className="animate-beacon" />
          <rect x="42" y="27" width="2" height="1" fill="#3a3a3a" />

          {/* Monitor Swivel Stand */}
          <rect x="25" y="30" width="8" height="3" fill="#202020" />
          <rect x="23" y="32" width="12" height="1" fill="#1c1c1c" />

          {/* Desktop Chassis Unit */}
          <rect x="10" y="33" width="38" height="8" fill="#2d2d2d" />
          <rect x="10" y="33" width="38" height="1" fill="#444444" />
          <rect x="47" y="34" width="1" height="7" fill="#181818" />
          <rect x="10" y="40" width="38" height="1" fill="#151515" />

          {/* 3.5" Floppy Drive Slot & LED */}
          <rect x="14" y="35" width="13" height="2" fill="#161616" />
          <rect x="28" y="35" width="2" height="1" fill="#789d2a" />

          {/* CD-ROM Drive Slot */}
          <rect x="32" y="35" width="13" height="2" fill="#161616" />
          <rect x="42" y="36" width="2" height="1" fill="#444444" />

          {/* Mechanical Keyboard with individual keys */}
          <rect x="12" y="42" width="24" height="4" fill="#262626" />
          <rect x="13" y="43" width="2" height="1" fill="#383838" />
          <rect x="16" y="43" width="2" height="1" fill="#383838" />
          <rect x="19" y="43" width="2" height="1" fill="#383838" />
          <rect x="22" y="43" width="2" height="1" fill="#383838" />
          <rect x="25" y="43" width="2" height="1" fill="#383838" />
          <rect x="28" y="43" width="2" height="1" fill="#383838" />
          <rect x="20" y="44" width="8" height="1" fill="#789d2a" />

          {/* Roller-Ball Mouse with button */}
          <rect x="38" y="42" width="5" height="4" rx="1" fill="#262626" />
          <rect x="39" y="42" width="3" height="1" fill="#3a3a3a" />
        </svg>
      </div>

      {/* Right Machine: Big Detailed Cyber Handheld Communicator / Phone (Экран 2) */}
      <div
        onClick={handlePhoneClick}
        className={`hidden md:flex items-end absolute right-4 lg:right-8 bottom-1 z-10 select-none cursor-pointer transition-transform ${
          phoneClicked ? '-translate-y-2 scale-105' : 'hover:-translate-y-1'
        }`}
        title="Экран 2: Смартфон (нажмите для звонка!)"
      >
        <svg
          width="82"
          height="106"
          viewBox="0 0 32 46"
          shapeRendering="crispEdges"
          className="drop-shadow-lg"
        >
          {/* Antenna with Animated Radar Waves */}
          <rect x="7" y="2" width="3" height="7" fill="#333333" />
          <rect x="7" y="1" width="3" height="1" fill="#484848" />
          <rect x="8" y="1" width="1" height="1" fill="#789d2a" className="animate-beacon" />
          {/* Signal wave arcs */}
          <rect x="12" y="1" width="1" height="2" fill="#9ac43e" opacity="0.8" className="animate-ping" />
          <rect x="14" y="0" width="1" height="4" fill="#789d2a" opacity="0.6" />
          <rect x="16" y="0" width="1" height="5" fill="#789d2a" opacity="0.3" />

          {/* Rugged Smartphone Body */}
          <rect x="4" y="9" width="24" height="36" rx="2" fill="#2a2a2a" />
          <rect x="4" y="9" width="24" height="1" fill="#484848" />
          <rect x="4" y="9" width="1" height="36" fill="#3c3c3c" />
          <rect x="27" y="10" width="1" height="35" fill="#181818" />
          <rect x="4" y="44" width="24" height="1" fill="#151515" />

          {/* Rubber Corner Bumpers */}
          <rect x="3" y="10" width="1" height="4" fill="#1e1e1e" />
          <rect x="28" y="10" width="1" height="4" fill="#1e1e1e" />
          <rect x="3" y="40" width="1" height="4" fill="#1e1e1e" />
          <rect x="28" y="40" width="1" height="4" fill="#1e1e1e" />

          {/* Earpiece Grille & Front Camera LED */}
          <rect x="12" y="11" width="8" height="1" fill="#161616" />
          <rect x="22" y="11" width="1" height="1" fill="#789d2a" />

          {/* Phosphor Screen Display */}
          <rect x="6" y="13" width="20" height="26" fill="#0d1508" />

          {/* Wi-Fi / Battery Status Bar */}
          <rect x="8" y="15" width="1" height="1" fill="#789d2a" />
          <rect x="10" y="15" width="1" height="2" fill="#789d2a" />
          <rect x="12" y="15" width="1" height="3" fill="#9ac43e" />
          <rect x="21" y="15" width="3" height="2" fill="#9ac43e" />
          <rect x="24" y="15.5" width="1" height="1" fill="#789d2a" />

          {/* Cute Matching Phosphor Smile Face ^ _ ^ */}
          <rect x="10" y="24" width="2" height="2" fill="#9ac43e" />
          <rect x="11" y="23" width="2" height="1" fill="#9ac43e" />
          <rect x="12" y="24" width="2" height="2" fill="#9ac43e" />

          <rect x="18" y="24" width="2" height="2" fill="#9ac43e" />
          <rect x="19" y="23" width="2" height="1" fill="#9ac43e" />
          <rect x="20" y="24" width="2" height="2" fill="#9ac43e" />

          {/* Smile Mouth \__/ */}
          <rect x="14" y="28" width="1" height="1" fill="#9ac43e" />
          <rect x="15" y="29" width="2" height="1" fill="#9ac43e" />
          <rect x="17" y="28" width="1" height="1" fill="#9ac43e" />

          {/* Live Data Transfer Packet Pill on screen */}
          <rect x="9" y="33" width="14" height="4" fill="#182512" />
          <rect x="11" y="34" width="6" height="2" fill="#9ac43e" className="animate-pulse" />
          <rect x="18" y="34" width="3" height="2" fill="#789d2a" />

          {/* Hardware Home Button */}
          <rect x="13" y="41" width="6" height="2" rx="1" fill="#202020" />
          <rect x="15" y="41" width="2" height="1" fill="#333333" />
        </svg>
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
                    <strong className="text-white">4. Контакты и обратная связь.</strong> По всем вопросам и предложениям обращайтесь в Telegram: <a href="https://t.me/IvanchesskO" target="_blank" rel="noopener noreferrer" className="text-[#9ac43e] hover:underline font-bold">@IvanchesskO</a>.
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
