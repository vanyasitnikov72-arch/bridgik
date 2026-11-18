import React, { useEffect } from 'react';
import { AlertCircle, LogOut, X } from 'lucide-react';
import { RoomMode } from '../types/index.js';
import { sound } from '../utils/sound.js';

interface LeaveConfirmModalProps {
  isOpen: boolean;
  roomMode: RoomMode;
  pin?: string;
  activeTransfersCount: number;
  otherPeersCount: number;
  isMicOrScreenActive: boolean;
  onStay: () => void;
  onConfirmLeave: () => void;
}

export const LeaveConfirmModal: React.FC<LeaveConfirmModalProps> = ({
  isOpen,
  roomMode,
  pin,
  activeTransfersCount,
  otherPeersCount,
  isMicOrScreenActive,
  onStay,
  onConfirmLeave,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onStay();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onStay]);

  if (!isOpen) return null;

  const isTransferring = activeTransfersCount > 0;
  const isMeeting = roomMode === 'meeting';
  const pinLabel = pin ? ` #${pin}` : '';

  const title = isTransferring
    ? 'Идёт передача файлов!'
    : isMeeting
    ? `Покинуть Комнату${pinLabel}?`
    : `Закрыть Мост${pinLabel}?`;

  const description = isTransferring
    ? `Сейчас активно передач: ${activeTransfersCount}. Если выйти сейчас, загрузка или отправка оборвётся.`
    : otherPeersCount > 0
    ? `В ${isMeeting ? 'комнате' : 'мосте'} сейчас есть собеседники (${otherPeersCount}). Вы действительно хотите отключиться?`
    : isMicOrScreenActive
    ? 'У вас сейчас активен микрофон или демонстрация экрана. Точно выйти на главную?'
    : `Открытый ${isMeeting ? 'зал' : 'мост'}${pinLabel} закроется, а текущая ссылка перестанет работать.`;

  return (
    <div
      className="fixed inset-0 z-[160] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onStay}
    >
      <div
        className={`w-full max-w-md rounded-2xl bg-[#1e1e1e] border shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden ${
          isTransferring ? 'border-amber-500/60' : 'border-white/[0.1]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${
                  isTransferring
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-[#283216] border-[#789d2a]/60 text-[#9ac43e]'
                }`}
              >
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#ededed] leading-tight">
                  {title}
                </h2>
                {isTransferring && (
                  <span className="inline-block mt-0.5 text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Передача будет прервана
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onStay}
              className="p-1.5 rounded-lg text-[#9a9a9a] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer shrink-0"
              title="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm sm:text-base text-[#c4c4c4] leading-relaxed">
            {description}
          </p>

          <p className="text-xs text-[#888888] bg-[#161616] border border-white/[0.05] rounded-xl px-3 py-2">
            Совет: вкладки «О сервисе», «Условия» и «Профиль» в шапке можно открывать без разрыва соединения.
          </p>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onConfirmLeave();
              }}
              className="sm:flex-1 py-2.5 px-4 rounded-xl bg-[#2a1a1a] hover:bg-[#ed2b3b] border border-[#ed2b3b]/35 text-[#ef9282] hover:text-white font-bold text-base transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{isTransferring ? 'Прервать и выйти' : 'Выйти'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onStay();
              }}
              autoFocus
              className="sm:flex-[1.3] py-2.5 px-4 rounded-xl bg-[#789d2a] hover:bg-[#8cb632] text-white font-extrabold text-base transition-colors cursor-pointer shadow-lg shadow-[#789d2a]/20"
            >
              {isTransferring ? 'Продолжить передачу' : 'Остаться'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};