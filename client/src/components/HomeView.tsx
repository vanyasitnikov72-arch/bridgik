import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

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
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
      {/* Title section in Handjet font */}
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#ededed] mb-2 leading-none">
          Обмен файлами и текстом
        </h1>
        <p className="text-lg text-[#aaaaaa] leading-relaxed">
          Прямой P2P-мост между устройствами. Без регистрации, без мессенджеров и без ограничений по объему.
        </p>
      </div>

      {/* Info Callout Banner (Styled exactly like Image 1) */}
      <div className="mb-8 p-4 rounded-xl bg-[#1c2214] border border-[#789d2a]/30 text-[#9ac43e] text-base flex items-start gap-3">
        <span className="font-bold text-lg leading-none shrink-0 mt-0.5">ⓘ</span>
        <div className="space-y-1 text-sm sm:text-base leading-snug">
          <p>
            Сервер выполняет роль сигнального узла. Данные передаются напрямую по зашифрованному WebRTC-каналу (браузер ↔ браузер).
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3.5 rounded-lg bg-[#ef9282]/10 border border-[#ed2b3b]/30 text-[#ef9282] text-sm">
          {errorMessage}
        </div>
      )}

      {/* Main Action Card */}
      <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 mb-10 shadow-lg">
        {/* Create Button */}
        <button
          onClick={onCreateRoom}
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-lg bg-[#789d2a] hover:bg-[#8cb632] text-white font-bold text-xl tracking-wide transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
        >
          <span>{isLoading ? 'Создаем комнату...' : 'Создать комнату в 1 клик'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#3a3a3a]"></div>
          </div>
          <div className="relative flex justify-center text-sm uppercase">
            <span className="bg-[#202020] px-3 text-[#999999] font-semibold tracking-wider">
              или подключитесь по 4-значному коду
            </span>
          </div>
        </div>

        {/* Join Form */}
        <form onSubmit={handleJoin} className="flex gap-2.5">
          <input
            type="text"
            pattern="[0-9a-zA-Z]*"
            inputMode="numeric"
            maxLength={12}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Код комнаты (напр. 4819)"
            className="flex-1 bg-[#171717] border border-[#3a3a3a] rounded-lg px-4 py-2.5 text-[#ededed] placeholder-[#999999] font-mono text-center tracking-widest text-xl outline-none focus:border-[#789d2a] transition-colors"
          />
          <button
            type="submit"
            disabled={!pin.trim() || isLoading}
            className="px-6 py-2.5 bg-[#2d2d2d] hover:bg-[#3a3a3a] text-[#ededed] font-bold rounded-lg transition-colors disabled:opacity-50 cursor-pointer text-base shrink-0 flex items-center gap-1.5"
          >
            <span>Войти</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Feature list in eblo.id doc style (Image 2 style) */}
      <div id="features" className="space-y-4 pt-4 border-t border-white/[0.08]">
        <h2 className="text-2xl font-bold text-[#ededed] mb-2">
          Как это устроено
        </h2>

        <ul className="space-y-3 text-[#ededed] text-base list-none">
          <li className="flex items-start gap-2.5">
            <span className="text-[#9ac43e] font-bold">•</span>
            <span>
              <strong className="text-white">Прямой P2P без ограничений.</strong> Передавайте 10 ГБ, 20 ГБ, 50 ГБ архивов или видео без промежуточного сохранения в облаках.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-[#9ac43e] font-bold">•</span>
            <span>
              <strong className="text-white">Потоковая запись на диск.</strong> Для файлов больше 200 МБ браузер сразу сбрасывает данные на диск (SSD/HDD), не забивая оперативную память вкладки.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-[#9ac43e] font-bold">•</span>
            <span>
              <strong className="text-white">Мгновенный буфер и ссылки.</strong> Скопируйте текст или ссылку на одном устройстве — у собеседника сразу появится кнопка для копирования в 1 клик.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-[#9ac43e] font-bold">•</span>
            <span>
              <strong className="text-white">Полная анонимность.</strong> Без создания аккаунтов, номеров телефонов или авторизаций через соцсети. Закрыли вкладку — комната удалилась.
            </span>
          </li>
        </ul>

        {/* Small Tag Chips (Like Image 1 bottom row) */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <span className="px-3 py-1 rounded-full bg-[#222222] border border-[#3a3a3a] text-xs font-semibold text-[#aaaaaa]">
            P2P WebRTC
          </span>
          <span className="px-3 py-1 rounded-full bg-[#222222] border border-[#3a3a3a] text-xs font-semibold text-[#aaaaaa]">
            Direct-to-Disk
          </span>
          <span className="px-3 py-1 rounded-full bg-[#222222] border border-[#3a3a3a] text-xs font-semibold text-[#aaaaaa]">
            Zero-Storage
          </span>
          <span className="px-3 py-1 rounded-full bg-[#222222] border border-[#3a3a3a] text-xs font-semibold text-[#aaaaaa]">
            Без VPN
          </span>
        </div>
      </div>
    </div>
  );
};
