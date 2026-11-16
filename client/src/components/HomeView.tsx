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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-400 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AirDrop прямо в браузере для любых платформ</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Мгновенный обмен между устройствами{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400">
            без ограничений
          </span>
        </h1>

        <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Передавайте файлы любого объема (10 ГБ+), ссылки и текст напрямую по P2P. Без регистрации, без мессенджеров, без проводов и без VPN.
        </p>

        {errorMessage && (
          <div className="mb-6 p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-sm max-w-md mx-auto">
            {errorMessage}
          </div>
        )}

        {/* Action Panel */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-lg mx-auto shadow-2xl backdrop-blur-xl">
          {/* Create Button */}
          <button
            onClick={onCreateRoom}
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-5 h-5 fill-white group-hover:animate-bounce" />
            <span>{isLoading ? 'Создаем комнату...' : 'Создать комнату в 1 клик'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-neutral-900 px-3 text-neutral-400 font-medium">
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
              placeholder="Код комнаты (напр. 4819)"
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder-neutral-400 font-mono text-center tracking-widest text-lg outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            <button
              type="submit"
              disabled={!pin.trim() || isLoading}
              className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer text-sm shrink-0 flex items-center gap-1.5"
            >
              <span>Войти</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
        <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-5 hover:border-neutral-700 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-3.5">
            <Wifi className="w-5 h-5" />
          </div>
          <h3 className="text-white font-semibold text-base mb-1.5">Прямой P2P (WebRTC)</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Данные передаются напрямую между браузерами. В одной Wi-Fi сети скорость достигает 1 Гбит/с.
          </p>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-5 hover:border-neutral-700 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400 mb-3.5">
            <HardDrive className="w-5 h-5" />
          </div>
          <h3 className="text-white font-semibold text-base mb-1.5">Без лимитов на размер</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Передавайте 10 ГБ, 30 ГБ или 100 ГБ видеомонтажа или архивов. Никаких искусственных ограничений.
          </p>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-5 hover:border-neutral-700 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mb-3.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-white font-semibold text-base mb-1.5">Нулевое хранение</h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Сервер не хранит ни байта. При закрытии вкладки комната и временные данные стираются навсегда.
          </p>
        </div>
      </div>
    </div>
  );
};
