import React, { useState } from 'react';
import { ArrowLeft, FileText, ShieldCheck, Scale, Lock, ServerOff, Cpu } from 'lucide-react';
import { sound } from '../utils/sound.js';

export type LegalDocType = 'rules' | 'privacy' | 'terms';

interface LegalViewProps {
  onBack: () => void;
  defaultDoc?: LegalDocType;
}

export const LegalView: React.FC<LegalViewProps> = ({ onBack, defaultDoc = 'rules' }) => {
  const [activeDoc, setActiveDoc] = useState<LegalDocType>(defaultDoc);

  const tabs: { id: LegalDocType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'rules',
      label: 'Правила сайта',
      icon: <FileText className="w-4 h-4" />,
      desc: 'Базовые правила и регламент сервиса',
    },
    {
      id: 'privacy',
      label: 'Конфиденциальность',
      icon: <ShieldCheck className="w-4 h-4" />,
      desc: 'Политика обработки данных и Zero-Storage',
    },
    {
      id: 'terms',
      label: 'Оферта',
      icon: <Scale className="w-4 h-4" />,
      desc: 'Пользовательское соглашение',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-24">
      {/* Top Bar with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-lg bg-[#222222] border border-[#3a3a3a] text-[#aaaaaa] hover:text-[#ededed] hover:border-[#789d2a] transition-colors cursor-pointer"
            title="Вернуться на главную"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#ededed] tracking-tight">
              Условия и регламент
            </h1>
            <p className="text-sm sm:text-base text-[#aaaaaa] mt-0.5">
              Официальные правила, политика конфиденциальности и соглашение сервиса bridgik.ru
            </p>
          </div>
        </div>
      </div>

      {/* Segmented Sub-Tabs Switcher */}
      <div className="flex flex-wrap sm:flex-nowrap p-1.5 rounded-2xl bg-[#1c1c1c] border border-white/[0.08] gap-1.5">
        {tabs.map((tab) => {
          const isActive = activeDoc === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveDoc(tab.id);
                sound.playClick();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-base sm:text-lg font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#283216] border border-[#789d2a] text-[#ededed] shadow-[0_0_15px_rgba(120,157,42,0.2)]'
                  : 'text-[#999999] hover:text-[#ededed] hover:bg-white/[0.04]'
              }`}
            >
              <span className={isActive ? 'text-[#9ac43e]' : 'text-[#777777]'}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Document Content View */}
      <div className="p-6 sm:p-9 rounded-2xl bg-[#1c1c1c] border border-white/[0.08] shadow-xl text-left select-text">
        {/* DOCUMENT 1: ПРАВИЛА САЙТА */}
        {activeDoc === 'rules' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#2d2d2d] pb-4">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#9ac43e] font-mono">
                [ Документ 01 // Регламент ]
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] mt-1">
                Правила использования сервиса bridgik.ru
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              <div className="p-3.5 rounded-xl bg-[#222222] border border-[#333333] flex items-center gap-3">
                <ServerOff className="w-5 h-5 text-[#9ac43e] shrink-0" />
                <span className="text-xs font-bold text-[#cccccc]">0 байт на сервере</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#222222] border border-[#333333] flex items-center gap-3">
                <Cpu className="w-5 h-5 text-[#9ac43e] shrink-0" />
                <span className="text-xs font-bold text-[#cccccc]">Прямой P2P DataChannel</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#222222] border border-[#333333] flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#9ac43e] shrink-0" />
                <span className="text-xs font-bold text-[#cccccc]">Без регистрации и смс</span>
              </div>
            </div>

            <div className="space-y-5 text-base sm:text-lg text-[#cccccc] leading-relaxed">
              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">1. Общие положения и назначение</h3>
                <p>
                  Веб-сервис <strong className="text-white">bridgik.ru</strong> предназначен для прямого безопасного обмена файлами любого объема, синхронизации текстового канваса и голосового общения между браузерами пользователей по стандарту WebRTC без промежуточных серверов хранения.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">2. Архитектурный принцип Zero-Storage</h3>
                <p>
                  Сервер bridgik выполняет исключительно функцию временного сигнального координатора (handshake) для обмена сетевыми дескрипторами соединений (SDP / ICE кандидаты). Файлы, чат и аудиопотоки передаются строго напрямую от одного устройства к другому. На сервере <strong className="text-[#9ac43e]">не сохраняются</strong> и не кэшируются никакие данные пользователя.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">3. Обязанности и ответственность пользователя</h3>
                <p>
                  Пользователь самостоятельно контролирует содержимое передаваемых файлов и сообщений. Категорически запрещается использовать сервис для:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm sm:text-base text-[#aaaaaa]">
                  <li>Распространения вредоносного программного обеспечения, вирусов и эксплойтов.</li>
                  <li>Передачи материалов, нарушающих действующее законодательство РФ и международные нормы.</li>
                  <li>Осуществления спам-рассылок и несанкционированного перебора комнат (брутфорс PIN-кодов).</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">4. Доступность сервиса</h3>
                <p>
                  Доступ ко всем функциям сервиса предоставляется на бесплатной основе, без подписок и без необходимости авторизации через телефон или сторонние сервисы.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* DOCUMENT 2: КОНФИДЕНЦИАЛЬНОСТЬ */}
        {activeDoc === 'privacy' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#2d2d2d] pb-4">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#9ac43e] font-mono">
                [ Документ 02 // Безопасность ]
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] mt-1">
                Политика конфиденциальности и защита данных
              </h2>
            </div>

            <div className="space-y-5 text-base sm:text-lg text-[#cccccc] leading-relaxed">
              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">1. Нулевой сбор персональных данных</h3>
                <p>
                  Сервис bridgik.ru принципиально <strong className="text-white">не собирает и не обрабатывает</strong> персональные данные пользователей. Для использования сервиса не требуются email, номер телефона, имя или паспортные данные. Имя устройства или никнейм генерируются локально в браузере и не привязываются к реальной личности.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">2. Отсутствие трекеров, рекламы и аналитики</h3>
                <p>
                  В исходном коде bridgik отсутствуют аналитические трекеры (включая Google Analytics, Яндекс.Метрику, рекламные пиксели и телеметрию). Мы не ведем профилирование пользователей, не продаем информацию третьим лицам и не сохраняем отслеживающие cookies.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">3. Сквозное шифрование (End-to-End Encryption)</h3>
                <p>
                  Каждое P2P-соединение шифруется на транспортном уровне протоколами <strong className="text-[#9ac43e]">DTLS</strong> (Datagram Transport Layer Security) и <strong className="text-[#9ac43e]">SRTP</strong> (Secure Real-time Transport Protocol) с применением алгоритмов AES-128 / AES-256. Ключи шифрования генерируются исключительно на устройствах участников и никогда не передаются серверу.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">4. Эфемерность сессий и очистка памяти</h3>
                <p>
                  Все комнаты, временные PIN-коды и ссылки являются эфемерными. Как только участники покидают комнату или закрывают вкладку браузера, виртуальный узел связи мгновенно аннулируется. На диске сервера не остается никаких следов сессии.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* DOCUMENT 3: ОФЕРТА И СОГЛАШЕНИЕ */}
        {activeDoc === 'terms' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#2d2d2d] pb-4">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#9ac43e] font-mono">
                [ Документ 03 // Соглашение ]
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] mt-1">
                Пользовательское соглашение и публичная оферта
              </h2>
            </div>

            <div className="space-y-5 text-base sm:text-lg text-[#cccccc] leading-relaxed">
              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">1. Предмет оферты</h3>
                <p>
                  Настоящий документ представляет собой открытое соглашение об условиях безвозмездного использования веб-приложения bridgik.ru неограниченным кругом дееспособных лиц. Использование сервиса означает полное безоговорочное согласие с настоящими условиями.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">2. Отказ от гарантий (AS IS)</h3>
                <p>
                  Программное обеспечение предоставляется по принципу «как есть» («as is»). Разработчики не гарантируют абсолютную бесперебойность работы при сетевых сбоях локальных провайдеров, симметричных брандмауэрах (Symmetric NAT) или блокировках портов WebRTC на стороне сетевого оборудования пользователя.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">3. Ограничение ответственности</h3>
                <p>
                  Администрация и разработчики не несут ответственности за прямой или косвенный ущерб, потерю информации или коммерческие убытки, возникшие в результате использования или невозможности использования веб-приложения.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">4. Обратная связь и контакты</h3>
                <p>
                  По любым техническим вопросам, предложениям по улучшению сервиса и сообщениям о неполадках вы можете обратиться в Telegram разработчика:
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#222222] border border-[#3a3a3a] text-base font-mono">
                  <a
                    href="https://t.me/IvanchesskO"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#9ac43e] hover:underline font-bold"
                  >
                    @IvanchesskO
                  </a>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
