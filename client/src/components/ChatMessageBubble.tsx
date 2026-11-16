import React, { useState } from 'react';
import { ExternalLink, Play, Copy, Check, Image as ImageIcon, Globe } from 'lucide-react';
import { findEmote, extractYouTubeId, isImageUrl, getDomainFromUrl, EmoteItem } from '../utils/emotes.js';

interface ChatMessageBubbleProps {
  senderName: string;
  text: string;
  isMe: boolean;
  time?: string;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  senderName,
  text,
  isMe,
  time,
}) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // URL matching
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
  const urls = text.match(urlRegex) || [];

  // Split text by URLs and whitespace to process emotes and links
  const tokens = text.split(/(\s+)/);

  // Check if entire message consists ONLY of 1-3 emotes
  const nonWhitespaceTokens = tokens.filter((t) => t.trim().length > 0);
  const allTokensAreEmotes =
    nonWhitespaceTokens.length > 0 &&
    nonWhitespaceTokens.length <= 4 &&
    nonWhitespaceTokens.every((t) => Boolean(findEmote(t)));

  // Render tokens inline
  const renderedContent = tokens.map((token, idx) => {
    if (!token.trim()) {
      return <span key={idx}>{token}</span>;
    }

    // Check if token is a URL
    if (urlRegex.test(token)) {
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

    // Check if token is a 7TV emote
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

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}>
      <div className="flex items-center gap-2 mb-1 px-1">
        <span className="text-xs font-bold text-[#aaaaaa]">{senderName}</span>
        {time && <span className="text-[10px] text-[#666666] font-mono">{time}</span>}
      </div>

      <div
        className={`max-w-[90%] sm:max-w-[85%] rounded-2xl text-base leading-relaxed break-words shadow-sm ${
          allTokensAreEmotes
            ? 'bg-transparent border-0 p-1'
            : isMe
            ? 'p-3.5 bg-[#1b2413] border border-[#789d2a]/50 text-[#d4e8a8]'
            : 'p-3.5 bg-[#252525] border border-[#383838] text-[#ededed]'
        }`}
      >
        <div className="leading-snug">{renderedContent}</div>

        {/* Rich Link Previews (YouTube, Direct Images, Web Link Cards) */}
        {urls.length > 0 && !allTokensAreEmotes && (
          <div className="mt-2.5 pt-2 border-t border-white/10 space-y-2.5">
            {urls.slice(0, 2).map((url, uIdx) => {
              const ytId = extractYouTubeId(url);
              const isImg = isImageUrl(url);
              const domain = getDomainFromUrl(url);

              // 1. YouTube Rich Card
              if (ytId) {
                const thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                return (
                  <div
                    key={uIdx}
                    className="rounded-xl overflow-hidden bg-[#141414] border border-[#3a3a3a] shadow-lg group hover:border-[#ff0000]/60 transition-colors"
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block aspect-video w-full max-h-48 overflow-hidden bg-black"
                    >
                      <img
                        src={thumbUrl}
                        alt="YouTube preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#ff0000]/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-white ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-white text-[11px] font-bold font-mono flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#ff0000]" />
                        <span>YouTube</span>
                      </div>
                    </a>

                    <div className="p-2.5 flex items-center justify-between gap-2 text-xs">
                      <span className="text-[#cccccc] font-semibold truncate">Видео на YouTube</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(url)}
                          className="p-1 rounded hover:bg-[#252525] text-[#aaaaaa] hover:text-white cursor-pointer"
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
                          className="px-2.5 py-1 rounded bg-[#2a2a2a] hover:bg-[#333333] text-white font-bold flex items-center gap-1 transition-colors"
                        >
                          <span>Смотреть</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              }

              // 2. Direct Image Preview Card
              if (isImg) {
                return (
                  <div
                    key={uIdx}
                    className="rounded-xl overflow-hidden bg-[#141414] border border-[#3a3a3a] shadow-lg"
                  >
                    <a href={url} target="_blank" rel="noopener noreferrer" className="block max-h-52 overflow-hidden">
                      <img
                        src={url}
                        alt="Preview"
                        loading="lazy"
                        className="w-full h-auto max-h-52 object-contain bg-[#111111]"
                      />
                    </a>
                    <div className="p-2 flex items-center justify-between text-xs text-[#aaaaaa]">
                      <span className="flex items-center gap-1 truncate">
                        <ImageIcon className="w-3.5 h-3.5 text-[#9ac43e]" />
                        <span>Изображение</span>
                      </span>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white font-bold flex items-center gap-1"
                      >
                        <span>Открыть</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              }

              // 3. Generic Web Link Card
              return (
                <div
                  key={uIdx}
                  className="p-2.5 rounded-xl bg-[#181818] border border-[#333333] flex items-center justify-between gap-2.5 hover:border-[#789d2a]/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#222222] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        {domain}
                      </p>
                      <p className="text-xs text-[#888888] truncate">{url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopyLink(url)}
                      className="p-1.5 rounded-lg bg-[#222222] hover:bg-[#2c2c2c] text-[#aaaaaa] hover:text-white cursor-pointer"
                      title="Скопировать"
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
                      className="p-1.5 rounded-lg bg-[#222222] hover:bg-[#2c2c2c] text-[#9ac43e] hover:text-[#b4e64f] cursor-pointer"
                      title="Перейти"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
