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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#222222] border border-[#3a3a3a] rounded-xl max-w-sm w-full p-6 text-center shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#aaaaaa] hover:text-white rounded-md bg-[#2d2d2d] hover:bg-[#3a3a3a] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-flex p-2 rounded-md bg-[#2d2d2d] border border-[#3a3a3a] text-[#9ac43e] mb-3">
          <Smartphone className="w-5 h-5" />
        </div>

        <h3 className="text-lg font-bold text-[#ededed] mb-1">Подключение по QR</h3>
        <p className="text-xs text-[#aaaaaa] mb-5">
          Наведите камеру смартфона для мгновенного P2P сопряжения
        </p>

        {/* QR Code Container */}
        <div className="bg-white p-3.5 rounded-lg inline-block shadow-sm mb-5">
          <QRCodeSVG
            value={roomUrl}
            size={180}
            level="M"
            includeMargin={false}
          />
        </div>

        {/* 4-digit PIN Highlight */}
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-wider text-[#999999] font-bold mb-1">
            Код комнаты
          </p>
          <div className="inline-flex items-center gap-2 bg-[#171717] px-4 py-1.5 rounded-md border border-[#3a3a3a]">
            <span className="font-mono text-2xl font-bold tracking-widest text-[#9ac43e]">
              {pin}
            </span>
          </div>
        </div>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2 bg-[#171717] border border-[#3a3a3a] rounded-md p-1.5 pl-3 text-xs">
          <input
            type="text"
            readOnly
            value={roomUrl}
            className="bg-transparent text-[#ededed] w-full outline-none truncate select-all font-mono text-[11px]"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-md bg-[#789d2a] hover:bg-[#8cb632] text-white font-bold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Скопировано</span>
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
