import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  KeyRound,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { AuthProvider } from '../types/index.js';
import { sound } from '../utils/sound.js';

interface AuthModalProps {
  isOpen: boolean;
  initialProvider?: AuthProvider;
  onClose: () => void;
  onAuthSuccess: (
    provider: AuthProvider,
    payload?: { key?: string; isNew?: boolean }
  ) => Promise<boolean | void> | boolean | void;
  onOpenLegal: (doc: 'privacy' | 'terms') => void;
}

function generateCryptoCode(length: number, alphabet: string): string {
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[arr[i] % alphabet.length];
  }
  return out;
}

function generateLicenseKey(): string {
  const alpha = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return `BRDG-${generateCryptoCode(4, alpha)}-${generateCryptoCode(4, alpha)}-${generateCryptoCode(4, alpha)}`;
}

export function formatLicenseKeyMask(val: string): string {
  let clean = val.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (clean.length === 12 && !clean.startsWith('BRDG')) {
    clean = 'BRDG' + clean;
  }
  clean = clean.slice(0, 16);
  const parts: string[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    parts.push(clean.slice(i, i + 4));
  }
  return parts.join('-');
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialProvider = 'twitch',
  onClose,
  onAuthSuccess,
  onOpenLegal,
}) => {
  const [tab, setTab] = useState<AuthProvider>(initialProvider);
  const [tgToken, setTgToken] = useState('');
  const [tgPinCode, setTgPinCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const [keyMode, setKeyMode] = useState<'create' | 'enter'>('create');
  const [generatedKey, setGeneratedKey] = useState(() => generateLicenseKey());
  const [inputKey, setInputKey] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTab(initialProvider);
    setTgToken(generateCryptoCode(12, 'abcdefghijklmnopqrstuvwxyz0123456789'));
    setTgPinCode(`${generateCryptoCode(3, '0123456789')}-${generateCryptoCode(3, '0123456789')}`);
    setKeyError('');
  }, [isOpen, initialProvider]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const tgResolveUrl = useMemo(
    () => `tg://resolve?domain=bridgik_bot&start=auth_${tgToken}`,
    [tgToken]
  );

  // Детерминированный пиксельный паттерн для превью QR до подключения реального QR-генератора
  const qrCells = useMemo(() => {
    const seed = tgToken || 'bridgikauth01';
    const cells: boolean[] = [];
    for (let i = 0; i < 49; i++) {
      const code = seed.charCodeAt(i % seed.length) + i * 17;
      cells.push(code % 3 !== 0);
    }
    return cells;
  }, [tgToken]);

  if (!isOpen) return null;

  const handleCopyTgCode = () => {
    navigator.clipboard.writeText(tgPinCode.replace('-', '')).catch(() => {});
    sound.playClick();
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(generatedKey).catch(() => {});
    sound.playClick();
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 1800);
  };

  const handleKeySubmit = async () => {
    setKeyError('');
    setIsSubmitting(true);
    try {
      if (keyMode === 'create') {
        const ok = await onAuthSuccess('key', { key: generatedKey, isNew: true });
        if (ok !== false) {
          sound.playConnect();
          onClose();
        }
        return;
      }
      const clean = inputKey.trim().toUpperCase();
      if (!/^BRDG-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(clean)) {
        setKeyError('Формат ключа: BRDG-XXXX-XXXX-XXXX');
        return;
      }
      const ok = await onAuthSuccess('key', { key: clean, isNew: false });
      if (ok !== false) {
        sound.playConnect();
        onClose();
      }
    } catch (err: any) {
      setKeyError(err?.message || 'Ошибка подключения');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[#1c1c1c] border border-white/[0.1] shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/[0.07] flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-[#9ac43e]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Добровольный профиль</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#ededed] leading-tight mt-0.5">
              Подключить аккаунт
            </h2>
            <p className="text-sm text-[#a8a8a8] mt-0.5">
              Для передачи файлов вход не нужен — профиль открывает Sticky Bridge и кастомизацию.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-[#a8a8a8] hover:text-white transition-colors cursor-pointer shrink-0"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Tabs */}
        <div className="px-5 pt-4">
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#141414] border border-white/[0.06]">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setTab('twitch');
              }}
              className={`py-2 px-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'twitch'
                  ? 'bg-[#9146FF] text-white shadow-md shadow-[#9146FF]/25'
                  : 'text-[#aaaaaa] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <TwitchIcon className="w-4 h-4 shrink-0" />
              <span>Twitch</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setTab('telegram');
              }}
              className={`py-2 px-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'telegram'
                  ? 'bg-[#229ED9] text-white shadow-md shadow-[#229ED9]/25'
                  : 'text-[#aaaaaa] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <TelegramIcon className="w-4 h-4 shrink-0" />
              <span>Telegram</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setTab('key');
              }}
              className={`py-2 px-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'key'
                  ? 'bg-[#283216] border border-[#789d2a] text-[#ededed]'
                  : 'text-[#aaaaaa] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <KeyRound className="w-4 h-4 shrink-0 text-[#9ac43e]" />
              <span>Ключ</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-5 space-y-4">
          {tab === 'twitch' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#222222] border border-white/[0.06] space-y-2">
                <p className="text-base font-bold text-[#ededed]">
                  Мгновенный вход в 1 клик (как на eblo.id)
                </p>
                <p className="text-sm text-[#a8a8a8]">
                  Подтянем твой ник и аватарку с Twitch, привяжем устройства и рамки. Работает стабильно без VPN.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playConnect();
                  onAuthSuccess('twitch');
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#9146FF] hover:bg-[#7e2ff2] text-white font-extrabold text-lg transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-lg shadow-[#9146FF]/25 active:scale-[0.99]"
              >
                <TwitchIcon className="w-5 h-5" />
                <span>Войти через Twitch</span>
              </button>

              <p className="text-xs text-center text-[#888888]">
                Позже в профиле можно допривязать Telegram для оплаты Stars и уведомлений.
              </p>
            </div>
          )}

          {tab === 'telegram' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-[#222222] border border-white/[0.06] flex items-center gap-3.5">
                {/* Compact QR Preview */}
                <div className="w-20 h-20 p-2 rounded-xl bg-white shrink-0 grid grid-cols-7 gap-0.5">
                  {qrCells.map((filled, idx) => (
                    <span
                      key={idx}
                      className={filled ? 'bg-[#171717] rounded-[1px]' : 'bg-transparent'}
                    />
                  ))}
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="text-base font-bold text-[#ededed] leading-tight">
                    Вход без VPN через @bridgik_bot
                  </p>
                  <p className="text-xs text-[#a8a8a8] leading-snug">
                    Открывает приложение Telegram напрямую, минуя заблокированный веб-виджет.
                  </p>
                </div>
              </div>

              <a
                href={tgResolveUrl}
                onClick={() => sound.playClick()}
                className="w-full py-3 px-4 rounded-xl bg-[#229ED9] hover:bg-[#1b8ec4] text-white font-extrabold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#229ED9]/20"
              >
                <TelegramIcon className="w-5 h-5" />
                <span>Открыть @bridgik_bot</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>

              {/* Fallback manual code */}
              <div className="p-3 rounded-xl bg-[#161616] border border-[#2d2d2d] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-[#888888]">
                    Не открылась кнопка? Отправь боту код:
                  </p>
                  <p className="text-xl font-extrabold tracking-widest text-[#ededed] font-mono">
                    {tgPinCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyTgCode}
                  className="px-3 py-2 rounded-lg bg-[#242424] hover:bg-[#303030] border border-white/[0.08] text-sm font-bold text-[#ededed] flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4 text-[#9ac43e]" />
                      <span className="text-[#9ac43e]">Скопирован</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Копировать</span>
                    </>
                  )}
                </button>
              </div>

              {/* UI Preview Simulation */}
              <button
                type="button"
                onClick={() => {
                  sound.playConnect();
                  onAuthSuccess('telegram');
                  onClose();
                }}
                className="w-full py-2 rounded-lg bg-[#283216]/70 hover:bg-[#283216] border border-[#789d2a]/50 text-[#9ac43e] text-sm font-bold transition-colors cursor-pointer"
              >
                UI-превью: завершить вход через Telegram
              </button>
            </div>
          )}

          {tab === 'key' && (
            <div className="space-y-3.5">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setKeyMode('create');
                    setKeyError('');
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border cursor-pointer transition-colors ${
                    keyMode === 'create'
                      ? 'bg-[#283216] border-[#789d2a] text-[#ededed]'
                      : 'bg-[#222222] border-[#333333] text-[#a8a8a8]'
                  }`}
                >
                  Создать новый
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setKeyMode('enter');
                    setKeyError('');
                  }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border cursor-pointer transition-colors ${
                    keyMode === 'enter'
                      ? 'bg-[#283216] border-[#789d2a] text-[#ededed]'
                      : 'bg-[#222222] border-[#333333] text-[#a8a8a8]'
                  }`}
                >
                  У меня есть ключ
                </button>
              </div>

              {keyMode === 'create' ? (
                <div className="p-3.5 rounded-xl bg-[#161616] border border-[#333333] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#a8a8a8]">
                      Анонимный пропуск (без соцсетей и почты)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setGeneratedKey(generateLicenseKey());
                      }}
                      className="text-xs text-[#9ac43e] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Сменить</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2 bg-[#222222] px-3 py-2 rounded-lg border border-white/[0.06]">
                    <span className="text-base sm:text-lg font-extrabold tracking-wider text-[#ededed] truncate">
                      {generatedKey}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="p-1.5 rounded-md hover:bg-white/10 text-[#9ac43e] cursor-pointer shrink-0"
                      title="Скопировать ключ"
                    >
                      {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-[#888888]">
                    Сохрани этот ключ — по нему ты восстановишь Sticky Bridge и покупки на любом устройстве.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#a8a8a8]">
                    <span>Формат: BRDG-XXXX-XXXX-XXXX</span>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          if (text) {
                            setInputKey(formatLicenseKeyMask(text));
                            setKeyError('');
                            sound.playClick();
                          }
                        } catch {}
                      }}
                      className="text-[#9ac43e] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <span>Вставить из буфера</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={inputKey}
                    onChange={(e) => {
                      setInputKey(formatLicenseKeyMask(e.target.value));
                      setKeyError('');
                    }}
                    maxLength={19}
                    placeholder="BRDG-XXXX-XXXX-XXXX"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-[#3a3a3a] focus:border-[#789d2a] outline-none text-[#ededed] font-mono font-bold tracking-wider text-base sm:text-lg uppercase"
                  />
                  {keyError && <p className="text-xs text-[#ef9282]">{keyError}</p>}
                </div>
              )}

              <button
                type="button"
                onClick={handleKeySubmit}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-[#789d2a] hover:bg-[#8cb632] disabled:opacity-50 text-white font-extrabold text-lg transition-colors cursor-pointer"
              >
                {isSubmitting
                  ? 'Подключение...'
                  : keyMode === 'create'
                  ? 'Сохранить и войти по ключу'
                  : 'Войти по ключу'}
              </button>
            </div>
          )}
        </div>

        {/* 152-FZ Footer */}
        <div className="px-5 py-3.5 bg-[#161616] border-t border-white/[0.06] flex items-start gap-2 text-xs text-[#888888]">
          <ShieldCheck className="w-4 h-4 text-[#789d2a] shrink-0 mt-0.5" />
          <p className="leading-snug">
            Входя в профиль, вы принимаете{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLegal('privacy');
              }}
              className="text-[#c4c4c4] hover:text-[#9ac43e] underline cursor-pointer"
            >
              Политику конфиденциальности
            </button>{' '}
            и{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLegal('terms');
              }}
              className="text-[#c4c4c4] hover:text-[#9ac43e] underline cursor-pointer"
            >
              Оферту
            </button>
            . Базы в РФ, файлы по P2P не хранятся.
          </p>
        </div>
      </div>
    </div>
  );
};

export function TwitchIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0 1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
    </svg>
  );
}

export function TelegramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M21.94 3.45a1.5 1.5 0 0 0-1.56-.21L2.63 10.61a1.35 1.35 0 0 0 .08 2.52l4.47 1.48 1.66 5.29a1.1 1.1 0 0 0 1.85.44l2.53-2.58 4.44 3.28a1.45 1.45 0 0 0 2.27-.88l2.54-15.1a1.5 1.5 0 0 0-.53-1.61ZM9.8 14.37l-.34 3.1-1.08-3.46 9.57-6.19-8.15 6.55Z" />
    </svg>
  );
}