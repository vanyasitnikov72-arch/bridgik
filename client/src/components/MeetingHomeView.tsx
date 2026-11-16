import React, { useState } from 'react';
import { ArrowRight, Mic, Monitor, FileText, Lock } from 'lucide-react';

interface MeetingHomeViewProps {
  onCreateMeeting: () => void;
  onJoinMeeting: (pinOrId: string) => void;
  isLoading: boolean;
  errorMessage?: string;
  myUserName: string;
  onOpenAbout?: () => void;
}

export const MeetingHomeView: React.FC<MeetingHomeViewProps> = ({
  onCreateMeeting,
  onJoinMeeting,
  isLoading,
  errorMessage,
  myUserName: _myUserName,
  onOpenAbout,
}) => {
  const [pin, setPin] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim()) {
      onJoinMeeting(pin.trim());
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
      {/* Title Section in Handjet Font */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1c2214] border border-[#789d2a]/40 text-[#9ac43e] text-sm font-mono font-bold mb-3">
          <span className="w-2 h-2 rounded-full bg-[#789d2a] animate-ping" />
          <span>P2P GhostRoom · Без регистрации и серверов</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#ededed] mb-3 leading-none">
          Комната <span className="text-[#9ac43e]">·</span> переговорная без следов
        </h1>
        <p className="text-xl sm:text-2xl text-[#bbbbbb] leading-relaxed">
          Приватная аудиосвязь, демонстрация экрана и совместный Канвас. Прямое зашифрованное P2P-соединение. Закрыли вкладку — ни следа.
        </p>
      </div>

      {/* Zero-Log Privacy Notice in eblo.id style */}
      <div className="mb-8 p-4 sm:p-5 rounded-xl bg-[#1c2214] border border-[#789d2a]/40 text-[#9ac43e] text-base sm:text-lg flex items-start gap-3.5">
        <span className="font-bold text-xl leading-none shrink-0 mt-0.5">ⓘ</span>
        <div className="space-y-1 leading-snug">
          <p className="text-[#d4e8a8]">
            Связь строится напрямую браузер ↔ браузер (WebRTC DTLS/SRTP). Разговоры не записываются, видеопоток не проходит через сторонние сервера, история переписки и Канвас очищаются при выходе.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-[#ef9282]/10 border border-[#ed2b3b]/30 text-[#ef9282] text-base font-semibold">
          {errorMessage}
        </div>
      )}

      {/* Main Action Card */}
      <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 mb-10 shadow-lg">
        {/* Create Meeting Button */}
        <button
          onClick={onCreateMeeting}
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white font-extrabold text-2xl tracking-wide transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          <Mic className="w-6 h-6" />
          <span>{isLoading ? 'Создаем переговорную...' : 'Создать переговорную комнату'}</span>
          <ArrowRight className="w-6 h-6" />
        </button>

        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#3a3a3a]"></div>
          </div>
          <div className="relative flex justify-center text-sm uppercase">
            <span className="bg-[#202020] px-4 text-[#999999] font-bold tracking-wider">
              или подключитесь к существующей по коду
            </span>
          </div>
        </div>

        {/* Join Meeting Form */}
        <form onSubmit={handleJoin} className="flex gap-2.5">
          <input
            type="text"
            pattern="[0-9a-zA-Z]*"
            inputMode="numeric"
            maxLength={12}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Код встречи (напр. 4819)"
            className="flex-1 bg-[#171717] border border-[#3a3a3a] rounded-lg px-4 py-3 text-[#ededed] placeholder-[#999999] font-mono text-center tracking-widest text-2xl outline-none focus:border-[#789d2a] transition-colors"
          />
          <button
            type="submit"
            disabled={!pin.trim() || isLoading}
            className="px-7 py-3 bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] font-extrabold rounded-lg transition-colors disabled:opacity-50 cursor-pointer text-lg shrink-0 flex items-center gap-2"
          >
            <span>Войти</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-10">
        <div className="p-5 rounded-xl bg-[#202020] border border-[#3a3a3a] flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#282828] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] shrink-0">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#ededed] mb-1">Голосовая P2P-связь</h3>
            <p className="text-base text-[#aaaaaa] leading-snug">
              Кристальный звук Opus без задержек серверов и без сжатия мессенджеров.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#202020] border border-[#3a3a3a] flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#282828] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] shrink-0">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#ededed] mb-1">Демонстрация экрана 60 FPS</h3>
            <p className="text-base text-[#aaaaaa] leading-snug">
              Показывайте браузер, презентации, макеты Figma или код коллегам в 1 клик.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#202020] border border-[#3a3a3a] flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#282828] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#ededed] mb-1">Канвас (Canvas)</h3>
            <p className="text-base text-[#aaaaaa] leading-snug">
              Совместный черновик заметок и тезисов встречи с синхронизацией в реальном времени.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#202020] border border-[#3a3a3a] flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#282828] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#ededed] mb-1">Нулевые следы</h3>
            <p className="text-base text-[#aaaaaa] leading-snug">
              Никаких аккаунтов, истории звонков, куки или логов. Закрыли вкладку — всё стёрто.
            </p>
          </div>
        </div>
      </div>

      {/* Link to About page in eblo.id style */}
      {onOpenAbout && (
        <div
          onClick={onOpenAbout}
          className="p-5 sm:p-6 rounded-xl bg-[#202020] border border-[#3a3a3a] hover:border-[#789d2a] flex items-center justify-between group transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-[#282828] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] group-hover:border-[#789d2a] shrink-0 font-bold text-xl">
              ?
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-[#ededed] group-hover:text-white transition-colors">
                Как устроен bridgik и протокол P2P?
              </p>
              <p className="text-base sm:text-lg text-[#aaaaaa]">
                Подробно: Direct-to-Disk, Zero-Storage, безопасность и отсутствие серверов
              </p>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-[#666666] group-hover:text-[#9ac43e] transition-colors shrink-0 ml-2" />
        </div>
      )}
    </div>
  );
};
