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

  return (
    <footer className="mt-auto border-t border-white/[0.08] bg-[#141414] py-8 relative overflow-hidden select-none">
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center text-center relative z-10">
        {/* Horizontal tabs matching eblo.id style: Правила сайта · Конфиденциальность · Оферта · support@bridgik.ru */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-12 text-base sm:text-xl text-[#999999] mb-3 font-semibold">
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

        {/* Minimal Sub-tagline */}
        <p className="text-sm sm:text-base text-[#666666] font-mono">
          bridgik — мост между вашими экранами · WebRTC Pure P2P · 0 байт на сервере
        </p>
      </div>

      {/* Thematic Pixel Art: Detailed Retro PC ↔ Floating Packet Bridge ↔ Detailed Retro Phone */}
      <div className="max-w-5xl mx-auto px-4 hidden sm:flex items-end justify-between absolute inset-x-0 bottom-1 pointer-events-none opacity-80">
        {/* Left Detailed Retro PC */}
        <div className="flex items-end gap-3 translate-y-0.5">
          <svg
            width="68"
            height="62"
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

        {/* Right Detailed Retro Smartphone */}
        <div className="flex items-end gap-3 translate-y-0.5">
          <svg
            width="36"
            height="62"
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
