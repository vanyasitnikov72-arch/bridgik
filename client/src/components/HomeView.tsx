import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, Zap, HardDrive, Wifi, Sparkles } from 'lucide-react';

interface HomeViewProps {
  onCreateRoom: () => void;
  onJoinRoom: (pinOrId: string) => void;
  isLoading: boolean;
  errorMessage?: string;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onCreateRoom,
  onJoinRoom,
  isLoading,
  errorMessage,
}) => {
  const [pin, setPin] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim()) {
      onJoinRoom(pin.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      {/* Hero Badge */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#222222] border border-[#3a3a3a] text-[#9ac43e] text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Мгновенный P2P-мост без регистрации и VPN</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#ededed] mb-4 leading-tight">
          Обмен файлами и текстом{' '}
          <span className="text-[#9ac43e]">
            напрямую между устройствами
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[#aaaaaa] max-w-2xl mx-auto mb-10 leading-relaxed">
          Передавайте файлы любого размера (10 ГБ, 50 ГБ+), ссылки и текст напрямую по P2P. Сервер не сохраняет ни единого байта.
        </p>

        {errorMessage && (
          <div className="mb-6 p-3 rounded-md bg-[#ef9282]/10 border border-[#ed2b3b]/30 text-[#ef9282] text-sm max-w-md mx-auto">
            {errorMessage}
          </div>
        )}

        {/* Action Panel */}
        <div className="bg-[#222222] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 max-w-lg mx-auto shadow-xl">
          {/* Create Button */}
          <button
            onClick={onCreateRoom}
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-md bg-[#789d2a] hover:bg-[#8cb632] text-white font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>{isLoading ? 'Создаем комнату...' : 'Создать комнату в 1 клик'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#3a3a3a]"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#222222] px-3 text-[#999999] font-medium">
                или введите 4-значный код
              </span>
            </div>
          </div>

          {/* Join Form */}
          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              type="text"
              pattern="[0-9a-zA-Z]*"
              inputMode="numeric"
              maxLength={12}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Код (напр. 4819)"
              className="flex-1 bg-[#171717] border border-[#3a3a3a] rounded-md px-4 py-2.5 text-[#ededed] placeholder-[#999999] font-mono text-center tracking-widest text-lg outline-none focus:border-[#789d2a] transition-all"
            />
            <button
              type="submit"
              disabled={!pin.trim() || isLoading}
              className="px-5 py-2.5 bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] font-semibold rounded-md transition-colors disabled:opacity-50 cursor-pointer text-sm shrink-0 flex items-center gap-1.5"
            >
              <span>Войти</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-14">
        <div className="bg-[#222222] border border-[#3a3a3a] rounded-xl p-5 hover:border-[#4a4a4a] transition-colors">
          <div className="w-9 h-9 rounded-md bg-[#2d2d2d] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] mb-3">
            <Wifi className="w-4 h-4" />
          </div>
          <h3 className="text-[#ededed] font-bold text-sm mb-1.5">Прямой P2P (WebRTC)</h3>
          <p className="text-xs text-[#aaaaaa] leading-relaxed">
            Данные идут прямо между браузерами. В локальной сети Wi-Fi скорость достигает максимума адаптера.
          </p>
        </div>

        <div className="bg-[#222222] border border-[#3a3a3a] rounded-xl p-5 hover:border-[#4a4a4a] transition-colors">
          <div className="w-9 h-9 rounded-md bg-[#2d2d2d] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] mb-3">
            <HardDrive className="w-4 h-4" />
          </div>
          <h3 className="text-[#ededed] font-bold text-sm mb-1.5">Без лимитов (15–50+ ГБ)</h3>
          <p className="text-xs text-[#aaaaaa] leading-relaxed">
            Потоковая запись сразу на SSD через File System Streams исключает переполнение памяти вкладки.
          </p>
        </div>

        <div className="bg-[#222222] border border-[#3a3a3a] rounded-xl p-5 hover:border-[#4a4a4a] transition-colors">
          <div className="w-9 h-9 rounded-md bg-[#2d2d2d] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] mb-3">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-[#ededed] font-bold text-sm mb-1.5">Нулевое хранение</h3>
          <p className="text-xs text-[#aaaaaa] leading-relaxed">
            На сервере не хранится ни одного файла. При закрытии вкладки комната стирается навсегда.
          </p>
        </div>
      </div>
    </div>
  );
};
