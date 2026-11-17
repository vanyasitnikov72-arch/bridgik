import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { SEVEN_TV_EMOTES, EmoteItem } from '../utils/emotes.js';

interface EmotePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmote: (emote: EmoteItem) => void;
  positionClass?: string;
  title?: string;
}

export const EmotePicker: React.FC<EmotePickerProps> = ({
  isOpen,
  onClose,
  onSelectEmote,
  positionClass,
  title: _title,
}) => {
  const [search, setSearch] = useState('');
  const [hoveredEmote, setHoveredEmote] = useState<EmoteItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'pepe' | 'cats' | 'memes'>('all');
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch('');
      setHoveredEmote(null);
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
    let list = SEVEN_TV_EMOTES;
    if (selectedCategory === 'pepe') {
      list = list.filter((e) => e.name.toLowerCase().includes('pepe') || e.keywords.includes('pepe'));
    } else if (selectedCategory === 'cats') {
      list = list.filter((e) => e.name.toLowerCase().includes('cat') || e.keywords.includes('cat') || e.keywords.includes('кот'));
    } else if (selectedCategory === 'memes') {
      list = list.filter((e) => !e.name.toLowerCase().includes('pepe') && !e.name.toLowerCase().includes('cat'));
    }

    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.keywords.some((k) => k.toLowerCase().includes(q))
    );
  }, [search, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div
      ref={pickerRef}
      className={`absolute z-50 w-80 sm:w-96 bg-[#141416]/95 border border-[#353535] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-3.5 flex flex-col gap-2.5 animate-in slide-in-from-bottom-2 duration-150 backdrop-blur-xl select-none ${
        positionClass || 'bottom-14 right-2'
      }`}
    >
      {/* Header with Search */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-[#777777] absolute left-3 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск смайлика (pepe, cat, кек...)"
          className="w-full bg-[#1e1e22] border border-[#333338] rounded-xl pl-9 pr-8 py-2 text-sm text-[#ededed] placeholder-[#666666] outline-none focus:border-[#789d2a] transition-colors"
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

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 pb-1 border-b border-[#26262b] text-xs">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#789d2a] text-white'
              : 'text-[#888888] hover:text-white hover:bg-[#222226]'
          }`}
        >
          Все ({SEVEN_TV_EMOTES.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('pepe')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
            selectedCategory === 'pepe'
              ? 'bg-[#789d2a] text-white'
              : 'text-[#888888] hover:text-white hover:bg-[#222226]'
          }`}
        >
          Пепе
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('cats')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
            selectedCategory === 'cats'
              ? 'bg-[#789d2a] text-white'
              : 'text-[#888888] hover:text-white hover:bg-[#222226]'
          }`}
        >
          Котики
        </button>
        <button
          type="button"
          onClick={() => setSelectedCategory('memes')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
            selectedCategory === 'memes'
              ? 'bg-[#789d2a] text-white'
              : 'text-[#888888] hover:text-white hover:bg-[#222226]'
          }`}
        >
          Мемы
        </button>
      </div>

      {/* Emotes Grid */}
      <div className="max-h-64 sm:max-h-72 overflow-y-auto pr-1 grid grid-cols-6 sm:grid-cols-7 gap-2 select-none scrollbar-thin">
        {filteredEmotes.length > 0 ? (
          filteredEmotes.map((emote) => (
            <button
              key={emote.id}
              type="button"
              onClick={() => onSelectEmote(emote)}
              onMouseEnter={() => setHoveredEmote(emote)}
              onMouseLeave={() => setHoveredEmote(null)}
              title={emote.name}
              className="group p-1.5 rounded-xl bg-[#1d1d22]/80 hover:bg-[#2a2a32] border border-transparent hover:border-[#789d2a] flex flex-col items-center justify-center transition-all cursor-pointer hover:scale-115 active:scale-95 shadow-sm"
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
          <div className="col-span-full py-10 text-center text-xs text-[#777777]">
            Смайлик не найден
          </div>
        )}
      </div>

      {/* Footer Info & Hovered Emote Preview */}
      <div className="pt-2 border-t border-[#26262b] flex items-center justify-between text-xs text-[#888888] font-mono px-1 min-h-[28px]">
        {hoveredEmote ? (
          <div className="flex items-center gap-2 truncate">
            <span className="text-[#9ac43e] font-bold truncate">:{hoveredEmote.name}:</span>
            <span className="text-[10px] text-[#666666]">нажмите чтобы вставить</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-[#777777]">
            <Sparkles className="w-3.5 h-3.5 text-[#9ac43e]" />
            <span>7TV & Twitch мемы</span>
          </div>
        )}
        <span className="text-[#9ac43e] font-bold shrink-0">{filteredEmotes.length} шт.</span>
      </div>
    </div>
  );
};
