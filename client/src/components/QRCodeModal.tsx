import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Smartphone } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pin: string;
  roomUrl: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  pin,
  roomUrl,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-800/60 hover:bg-neutral-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-flex p-2.5 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 mb-3">
          <Smartphone className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">Подключение по QR</h3>
        <p className="text-xs text-neutral-400 mb-5">
          Наведите камеру смартфона для мгновенного P2P сопряжения без проводов
        </p>

        {/* QR Code Container with High Contrast */}
        <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mb-5">
          <QRCodeSVG
            value={roomUrl}
            size={200}
            level="M"
            includeMargin={false}
          />
        </div>

        {/* 4-digit PIN Highlight */}
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
            Короткий PIN-код комнаты
          </p>
          <div className="inline-flex items-center gap-2 bg-neutral-950 px-4 py-1.5 rounded-xl border border-neutral-800">
            <span className="font-mono text-2xl font-bold tracking-widest text-cyan-400">
              {pin}
            </span>
          </div>
        </div>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl p-1.5 pl-3 text-xs">
          <input
            type="text"
            readOnly
            value={roomUrl}
            className="bg-transparent text-neutral-300 w-full outline-none truncate select-all"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Скопировано</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Копия</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
