import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { SEVEN_TV_EMOTES, EmoteItem } from '../utils/emotes.js';

interface EmotePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmote: (emote: EmoteItem) => void;
}

export const EmotePicker: React.FC<EmotePickerProps> = ({
  isOpen,
  onClose,
  onSelectEmote,
}) => {
  const [search, setSearch] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const filteredEmotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SEVEN_TV_EMOTES;
    return SEVEN_TV_EMOTES.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [search]);

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className="absolute bottom-14 right-2 z-50 w-72 sm:w-80 bg-[#161616] border border-[#333333] rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.85)] p-3 flex flex-col gap-2.5 animate-in slide-in-from-bottom-2 duration-150 backdrop-blur-md"
    >
      {/* Top Search Header */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-[#777777] absolute left-3 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск смайлика..."
          className="w-full bg-[#1e1e1e] border border-[#303030] rounded-xl pl-9 pr-8 py-2 text-sm text-[#ededed] placeholder-[#666666] outline-none focus:border-[#789d2a] transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2.5 text-[#777777] hover:text-[#ededed] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Emotes Grid */}
      <div className="max-h-60 overflow-y-auto pr-1 grid grid-cols-5 sm:grid-cols-6 gap-2 select-none scrollbar-thin">
        {filteredEmotes.length > 0 ? (
          filteredEmotes.map((emote) => (
            <button
              key={emote.id}
              type="button"
              onClick={() => onSelectEmote(emote)}
              title={emote.name}
              className="group p-1.5 rounded-xl bg-[#1e1e1e]/60 hover:bg-[#282828] border border-transparent hover:border-[#789d2a]/60 flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-110"
            >
              <img
                src={emote.url}
                alt={emote.name}
                loading="lazy"
                className="w-8 h-8 object-contain pointer-events-none"
              />
            </button>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-xs text-[#777777]">
            Смайлик не найден
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-[#262626] flex items-center justify-between text-[11px] text-[#777777] font-mono px-1">
        <span>7TV · Мемы комнаты</span>
        <span className="text-[#9ac43e] font-semibold">{filteredEmotes.length} шт.</span>
      </div>
    </div>
  );
};
