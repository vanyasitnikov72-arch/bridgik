import React, { useState } from 'react';
import {
  ExternalLink,
  Play,
  Copy,
  Check,
  Image as ImageIcon,
  Globe,
  Lock,
  Tv,
  Send as TelegramIcon,
  Code2,
} from 'lucide-react';
import {
  findEmote,
  extractYouTubeId,
  extractTwitchChannel,
  extractTelegramInfo,
  extractGitHubInfo,
  isImageUrl,
  getDomainFromUrl,
  getFaviconUrl,
  EmoteItem,
} from '../utils/emotes.js';
import { getAvatarForName } from '../utils/device.js';

interface ChatMessageBubbleProps {
  senderName: string;
  text: string;
  isMe: boolean;
  time?: string;
  isSystem?: boolean;
  avatar?: string;
  isAdmin?: boolean;
  adminFrame?: 'gold' | 'rgb' | 'plasma' | 'none';
  senderStatusEmote?: string;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  senderName,
  text,
  isMe,
  time,
  isSystem,
  avatar,
  isAdmin,
  adminFrame = 'gold',
  senderStatusEmote,
}) => {
  if (isSystem || senderName === 'Система') {
    const isJoin = text.includes('присоединился');
    return (
      <div className="flex items-center justify-center my-2.5 w-full select-none animate-in fade-in duration-200">
        <div
          className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium flex items-center gap-2 border shadow-sm ${
            isJoin
              ? 'bg-[#182314]/90 border-[#789d2a]/50 text-[#bbf348]'
              : 'bg-[#261618]/90 border-[#ed2b3b]/50 text-[#ef9282]'
          }`}
        >
          <span>{text}</span>
          {time && <span className="opacity-50 text-[10px]">{time}</span>}
        </div>
      </div>
    );
  }

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [faviconFailed, setFaviconFailed] = useState<Record<string, boolean>>({});

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  const singleUrlRegex = /^https?:\/\/[^\s<]+[^<.,:;"')\]\s]$/i;
  const urls = text.match(urlRegex) || [];

  const trimmed = text.trim();
  const isPureLink = urls.length === 1 && trimmed === urls[0];

  const tokens = text.split(/(\s+)/);

  const nonWhitespaceTokens = tokens.filter((t) => t.trim().length > 0);
  const allTokensAreEmotes =
    nonWhitespaceTokens.length > 0 &&
    nonWhitespaceTokens.length <= 4 &&
    nonWhitespaceTokens.every((t) => Boolean(findEmote(t)));

  const renderedContent = tokens.map((token, idx) => {
    if (!token.trim()) {
      return <span key={idx}>{token}</span>;
    }

    if (singleUrlRegex.test(token)) {
      return (
        <a
          key={idx}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#9ac43e] hover:underline break-all inline-flex items-center gap-1 font-semibold"
        >
          <span>{token}</span>
          <ExternalLink className="w-3.5 h-3.5 inline-block opacity-70 shrink-0" />
        </a>
      );
    }

    const emote: EmoteItem | undefined = findEmote(token);
    if (emote) {
      if (allTokensAreEmotes) {
        return (
          <img
            key={idx}
            src={emote.url}
            alt={emote.name}
            title={emote.name}
            className="inline-block h-12 sm:h-14 w-auto object-contain align-middle mx-1.5 my-1 transition-transform hover:scale-110 select-none"
          />
        );
      }
      return (
        <img
          key={idx}
          src={emote.url}
          alt={emote.name}
          title={emote.name}
          className="inline-block h-6 sm:h-7 w-auto object-contain align-middle mx-0.5 -mt-0.5 select-none"
        />
      );
    }

    return <span key={idx}>{token}</span>;
  });

  const avatarSrc = avatar || getAvatarForName(senderName);

  const getAvatarFrameClass = () => {
    if (!isAdmin || adminFrame === 'none') {
      return 'border border-[#444444] shadow-md';
    }
    if (adminFrame === 'rgb') {
      return 'border-2 border-sky-400 animate-admin-rgb';
    }
    if (adminFrame === 'plasma') {
      return 'border-2 border-purple-400 animate-admin-plasma';
    }
    return 'border-2 border-amber-400 animate-admin-gold';
  };

  return (
    <div
      className={`flex items-end gap-2.5 max-w-full my-1.5 animate-in fade-in duration-150 ${
        isMe ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Peer's Round Avatar on Left (only for incoming messages) */}
      {!isMe && (
        <div
          className="relative shrink-0 mb-1 select-none"
          title={isAdmin ? `${senderName} (Создатель)` : senderName}
        >
          <img
            src={avatarSrc}
            alt={senderName}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover bg-[#1a1a1a] transition-transform hover:scale-105 ${getAvatarFrameClass()}`}
            style={{ imageRendering: 'pixelated' }}
          />
          {isAdmin && adminFrame !== 'none' && (
            <span className="absolute -top-1.5 -right-1 text-[11px] select-none filter drop-shadow-[0_0_4px_rgba(245,158,11,0.8)]">
              👑
            </span>
          )}
        </div>
      )}

      {/* Message Bubble + Header (for others: name + time; for me: only time) */}
      <div
        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[80%]`}
      >
        {isMe ? (
          time && (
            <div className="mb-1 px-1">
              <span className="text-[10px] text-[#666666] font-mono">{time}</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 mb-1 px-1">
            <div className="flex items-center gap-1.5">
              {isAdmin && (
                <span className="px-1 py-0.2 rounded text-[9px] font-mono font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider select-none shadow-[0_0_6px_rgba(245,158,11,0.3)]">
                  DEV
                </span>
              )}
              <span
                className={`text-xs font-bold ${
                  isAdmin ? 'admin-name-shimmer font-black' : 'text-[#aaaaaa]'
                }`}
              >
                {senderName}
              </span>
              {senderStatusEmote && (
                <img
                  src={senderStatusEmote}
                  alt="status"
                  className="w-4 h-4 object-contain inline-block select-none filter drop-shadow-sm"
                />
              )}
            </div>
            {time && <span className="text-[10px] text-[#666666] font-mono">{time}</span>}
          </div>
        )}

        <div
          className={`rounded-2xl text-base leading-relaxed break-words shadow-sm transition-all ${
            allTokensAreEmotes
              ? 'bg-transparent border-0 p-1'
              : isPureLink
              ? 'p-1.5 bg-transparent border-0'
              : isAdmin
              ? 'p-3.5 bg-gradient-to-br from-[#22180b] to-[#161616] border border-amber-500/50 text-[#fef08a] shadow-[0_0_12px_rgba(245,158,11,0.18)]'
              : isMe
              ? 'p-3.5 bg-[#1b2413] border border-[#789d2a]/50 text-[#d4e8a8]'
              : 'p-3.5 bg-[#252525] border border-[#383838] text-[#ededed]'
          }`}
        >
          {!isPureLink && <div className="leading-snug">{renderedContent}</div>}

          {urls.length > 0 && !allTokensAreEmotes && (
            <div
              className={`${
                isPureLink ? '' : 'mt-2.5 pt-2 border-t border-white/10'
              } space-y-2.5`}
            >
              {urls.slice(0, 2).map((url, uIdx) => {
                const ytId = extractYouTubeId(url);
                const twitchInfo = extractTwitchChannel(url);
                const tgInfo = extractTelegramInfo(url);
                const ghInfo = extractGitHubInfo(url);
                const isImg = isImageUrl(url);
                const domain = getDomainFromUrl(url);
                const faviconUrl = getFaviconUrl(url);

                if (ytId) {
                  const thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                  return (
                    <div
                      key={uIdx}
                      className="rounded-2xl overflow-hidden bg-[#141414] border border-[#3a3a3a] shadow-xl group hover:border-[#ff0000]/70 transition-all max-w-sm sm:max-w-md"
                    >
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative block aspect-video w-full overflow-hidden bg-black"
                      >
                        <img
                          src={thumbUrl}
                          alt="YouTube preview"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-[#ff0000] text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 fill-white ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-white text-[11px] font-bold font-mono flex items-center gap-1.5 border border-white/10">
                          <span className="w-2 h-2 rounded-full bg-[#ff0000]" />
                          <span>YouTube Video</span>
                        </div>
                      </a>

                      <div className="p-3 bg-[#181818] flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <p className="text-[#ededed] font-bold truncate">Видео на YouTube</p>
                          <p className="text-[#888888] text-[11px] font-mono truncate">{domain}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(url)}
                            className="p-1.5 rounded-lg bg-[#242424] hover:bg-[#303030] text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
                            title="Скопировать ссылку"
                          >
                            {copiedUrl === url ? (
                              <Check className="w-3.5 h-3.5 text-[#9ac43e]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[#ff0000] hover:bg-[#d60000] text-white font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-[#ff0000]/20"
                          >
                            <span>Смотреть</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (twitchInfo) {
                  return (
                    <div
                      key={uIdx}
                      className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#1b1424] via-[#161616] to-[#121212] border border-[#9146FF]/40 hover:border-[#9146FF] shadow-xl p-3.5 sm:p-4 transition-all max-w-sm sm:max-w-md"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#9146FF] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#9146FF]/30">
                            <Tv className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#9146FF]/20 text-[#bf94ff] border border-[#9146FF]/40 font-mono">
                                Twitch
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#bf94ff] animate-ping" />
                            </div>
                            <p className="text-sm font-extrabold text-[#ededed] truncate">
                              Канал {twitchInfo.channel}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(url)}
                            className="p-1.5 rounded-lg bg-[#242424] hover:bg-[#303030] text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
                            title="Скопировать ссылку"
                          >
                            {copiedUrl === url ? (
                              <Check className="w-3.5 h-3.5 text-[#9ac43e]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[#aaaaaa] mb-3 leading-snug">
                        Прямой эфир, стримы и трансляции на Twitch
                      </p>

                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-[#9146FF] hover:bg-[#772ce8] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-[#9146FF]/30"
                      >
                        <span>Смотреть стрим на Twitch</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                }

                if (tgInfo) {
                  return (
                    <div
                      key={uIdx}
                      className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#121c25] via-[#161616] to-[#121212] border border-[#229ED9]/40 hover:border-[#229ED9] shadow-xl p-3.5 transition-all max-w-sm sm:max-w-md"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[#229ED9] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#229ED9]/30">
                            <TelegramIcon className="w-4 h-4 ml-0.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#229ED9] font-mono">
                              Telegram
                            </span>
                            <p className="text-sm font-bold text-[#ededed] truncate">
                              @{tgInfo.handle}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(url)}
                          className="p-1.5 rounded-lg bg-[#242424] hover:bg-[#303030] text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
                          title="Скопировать"
                        >
                          {copiedUrl === url ? (
                            <Check className="w-3.5 h-3.5 text-[#9ac43e]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1.5 px-3 rounded-xl bg-[#229ED9] hover:bg-[#1d8bc0] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-[#229ED9]/20"
                      >
                        <span>Открыть в Telegram</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  );
                }

                if (ghInfo) {
                  return (
                    <div
                      key={uIdx}
                      className="rounded-2xl overflow-hidden bg-[#181818] border border-[#444444] hover:border-white/50 shadow-xl p-3.5 transition-all max-w-sm sm:max-w-md"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[#252525] text-white flex items-center justify-center shrink-0 border border-[#444]">
                            <Code2 className="w-5 h-5 text-[#9ac43e]" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ac43e] font-mono">
                              GitHub Repository
                            </span>
                            <p className="text-sm font-mono font-bold text-[#ededed] truncate">
                              {ghInfo.owner} {ghInfo.repo ? `/ ${ghInfo.repo}` : ''}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyLink(url)}
                          className="p-1.5 rounded-lg bg-[#242424] hover:bg-[#303030] text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedUrl === url ? (
                            <Check className="w-3.5 h-3.5 text-[#9ac43e]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1.5 px-3 rounded-xl bg-[#2a2a2a] hover:bg-[#353535] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#444]"
                      >
                        <span>Открыть на GitHub</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  );
                }

                if (isImg) {
                  return (
                    <div
                      key={uIdx}
                      className="rounded-2xl overflow-hidden bg-[#141414] border border-[#3a3a3a] shadow-xl max-w-sm sm:max-w-md"
                    >
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block max-h-60 overflow-hidden group"
                      >
                        <img
                          src={url}
                          alt="Preview"
                          loading="lazy"
                          className="w-full h-auto max-h-60 object-contain bg-[#111111] group-hover:scale-105 transition-transform"
                        />
                      </a>
                      <div className="p-2.5 bg-[#181818] flex items-center justify-between text-xs text-[#aaaaaa]">
                        <span className="flex items-center gap-1.5 truncate">
                          <ImageIcon className="w-3.5 h-3.5 text-[#9ac43e]" />
                          <span>Изображение</span>
                        </span>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded bg-[#252525] hover:bg-[#303030] text-white font-bold flex items-center gap-1 transition-colors"
                        >
                          <span>Оригинал</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={uIdx}
                    className="rounded-2xl bg-gradient-to-r from-[#1c1c1c] to-[#151515] border border-[#353535] hover:border-[#789d2a]/60 shadow-xl p-3 sm:p-3.5 transition-all max-w-sm sm:max-w-md"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#222222] border border-[#3a3a3a] flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                          {!faviconFailed[domain] ? (
                            <img
                              src={faviconUrl}
                              alt=""
                              className="w-5 h-5 object-contain"
                              onError={() =>
                                setFaviconFailed((prev) => ({ ...prev, [domain]: true }))
                              }
                            />
                          ) : (
                            <Globe className="w-4 h-4 text-[#9ac43e]" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-[#9ac43e]" />
                            <span className="text-[11px] font-bold text-white uppercase tracking-wider font-mono truncate">
                              {domain}
                            </span>
                          </div>
                          <p className="text-xs text-[#888888] font-mono truncate">{url}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(url)}
                          className="p-1.5 rounded-lg bg-[#242424] hover:bg-[#303030] text-[#aaaaaa] hover:text-white transition-colors cursor-pointer"
                          title="Скопировать ссылку"
                        >
                          {copiedUrl === url ? (
                            <Check className="w-3.5 h-3.5 text-[#9ac43e]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-[#272727] hover:bg-[#353535] text-[#9ac43e] hover:text-[#b4e64f] transition-colors cursor-pointer"
                          title="Перейти по ссылке"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full mt-1.5 py-1.5 px-3 rounded-xl bg-[#242424] hover:bg-[#2e2e2e] text-[#ededed] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-[#333]"
                    >
                      <span>Перейти на {domain}</span>
                      <ExternalLink className="w-3 h-3 text-[#9ac43e]" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};