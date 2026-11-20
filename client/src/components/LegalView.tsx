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
                  1.1. Настоящие Правила определяют порядок и условия использования веб-сервиса <strong className="text-white">Bridgik</strong> (далее — «Сервис»), доступного в сети Интернет по адресу <a href="https://bridgik.ru" className="text-[#9ac43e] hover:underline">https://bridgik.ru</a>.
                </p>
                <p>
                  1.2. Сервис предназначен для прямого безопасного обмена файлами любого объема между браузерами пользователей по стандарту WebRTC DataChannel, проведения онлайн-встреч в виртуальных комнатах с голосовой связью и реакциями, совместной работы в интерактивном Канвасе (заметки и изображения), а также защищённого P2P-чата с поддержкой сгорающих сообщений.
                </p>
                <p>
                  1.3. Использование Сервиса означает полное и безоговорочное согласие Пользователя с настоящими Правилами, Политикой конфиденциальности и Публичной офертой.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">2. Архитектурный принцип Zero-Storage и специфика P2P</h3>
                <p>
                  2.1. Базовая передача файлов, голосовое общение и текстовый чат осуществляются по пиринговому протоколу WebRTC (Peer-to-Peer) напрямую между устройствами пользователей.
                </p>
                <p>
                  2.2. Сигнальный сервер Сервиса выполняет исключительно функцию координатора соединения (handshake / обмен дескрипторами SDP и ICE-кандидатами). Содержимое пересылаемых файлов, текстовые заметки Канваса и аудиопотоки не загружаются на сервер, не кэшируются и не сохраняются в базах данных (0 байт на сервере).
                </p>
                <p>
                  2.3. Исключением является функция отложенной передачи «Drop & Go» (доступная в тарифе Bridgik Pro): в случае, когда устройство-получатель находится оффлайн, зашифрованный буфер файла (размером до 200 МБ) временно сохраняется на сервере на срок не более 24 часов и автоматически безвозвратно удаляется сразу после доставки или по истечении 24 часов.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">3. Режимы доступа и авторизация</h3>
                <p>
                  3.1. <strong className="text-white">Анонимный режим (без регистрации):</strong> базовый функционал прямой P2P-передачи файлов, комнат и чата доступен без обязательной регистрации, ввода email или номера телефона.
                </p>
                <p>
                  3.2. <strong className="text-white">Авторизованный режим:</strong> Пользователь может авторизоваться через доверенные OAuth-провайдеры (Яндекс ID) для сохранения настроек профиля (никнейм, аватар), привязки постоянных доверенных устройств (Sticky Bridge) и управления подпиской Bridgik Pro.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">4. Обязанности и ответственность пользователя</h3>
                <p>
                  4.1. Пользователь несёт полную личную ответственность за законность и содержание передаваемых через Сервис файлов, изображений и текстовых сообщений.
                </p>
                <p>
                  4.2. Категорически запрещается использовать Сервис для:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm sm:text-base text-[#aaaaaa]">
                  <li>Распространения вредоносного программного обеспечения, компьютерных вирусов, троянов и эксплойтов;</li>
                  <li>Передачи материалов, нарушающих действующее законодательство Российской Федерации (включая призывы к экстремизму, терроризму, распространение наркотических средств, детской порнографии, разжигание розни);</li>
                  <li>Несанкционированного массового перебора PIN-кодов комнат (брутфорс), DoS/DDoS-атак на сигнальные сервера или вмешательства в работу инфраструктуры Сервиса;</li>
                  <li>Нарушения исключительных авторских и смежных прав третьих лиц.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">5. Безопасность и сгорающие сообщения</h3>
                <p>
                  5.1. Функция сгорающих сообщений в чате обеспечивает автоматическое удаление текста по истечении установленного таймера и визуальное выгорание на экранах участников.
                </p>
                <p>
                  5.2. Пользователь осознаёт, что техническое уничтожение сообщения в браузере не исключает возможность фиксации информации получателем с помощью внешних средств (фотосъёмка экрана, сторонний захват видео).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">6. Права Администратора</h3>
                <p>
                  6.1. Администратор оставляет за собой право блокировать доступ (по IP-адресу или идентификатору аккаунта) пользователям, нарушающим настоящие Правила или осуществляющим деструктивные действия в отношении Сервиса.
                </p>
                <p>
                  6.2. Администратор вправе приостанавливать доступ к Сервису для проведения необходимых регламентных и профилактических технических работ.
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
                [ Документ 02 // Конфиденциальность ]
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] mt-1">
                Политика конфиденциальности и обработки персональных данных
              </h2>
            </div>

            <div className="space-y-5 text-base sm:text-lg text-[#cccccc] leading-relaxed">
              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">1. Общие положения</h3>
                <p>
                  1.1. Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки и защиты информации о физических лицах (далее — «Пользователи»), пользующихся сайтом <a href="https://bridgik.ru" className="text-[#9ac43e] hover:underline">https://bridgik.ru</a> (далее — «Сервис»).
                </p>
                <p>
                  1.2. Оператором персональных данных является физическое лицо <strong className="text-white">Ситников Иван Максимович</strong>, применяющий специальный налоговый режим «Налог на профессиональный доход» (ИНН 682966705968, далее — «Оператор»).
                </p>
                <p>
                  1.3. Обработка персональных данных осуществляется в строгом соответствии с Федеральным законом РФ № 152-ФЗ «О персональных данных».
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">2. Категории обрабатываемых данных</h3>
                <p>
                  <strong className="text-white">2.1. Данные неавторизованных пользователей:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm sm:text-base text-[#aaaaaa]">
                  <li>Технические метаданные сетевого соединения (IP-адрес для координации WebRTC-соединения, User-Agent, ClientID / SessionID сессии);</li>
                  <li>Содержимое пересылаемых файлов, аудиопотоки голосовой связи и текст чата Оператором <strong className="text-white">не собираются, не обрабатываются и не сохраняются</strong> на сервере (принцип Zero-Storage и сквозное шифрование DTLS/SRTP).</li>
                </ul>

                <p className="pt-2">
                  <strong className="text-white">2.2. Данные авторизованных пользователей (при входе через Яндекс ID):</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm sm:text-base text-[#aaaaaa]">
                  <li>Идентификатор учетной записи (ID провайдера авторизации);</li>
                  <li>Публичный никнейм и имя;</li>
                  <li>Ссылка на аватар или загруженное изображение профиля;</li>
                  <li>Адрес электронной почты (email), передаваемый сервисом авторизации либо при оформлении подписки;</li>
                  <li>Сведения о статусе и сроке действия подписки (Bridgik Pro).</li>
                </ul>

                <p className="pt-2">
                  <strong className="text-white">2.3. Временный буфер функции «Drop & Go»:</strong>
                </p>
                <p className="text-sm sm:text-base text-[#aaaaaa]">
                  Файлы, передаваемые через функцию отложенной доставки Drop & Go (до 200 МБ), сохраняются на защищённом сервере Оператора в зашифрованном виде на срок не более 24 часов и безвозвратно удаляются сразу после получения адресатом или по истечении 24 часов. Оператор не имеет доступа к содержимому зашифрованного файла.
                </p>

                <p className="pt-2">
                  <strong className="text-white">2.4. Cookies и локальное хранилище (LocalStorage):</strong>
                </p>
                <p className="text-sm sm:text-base text-[#aaaaaa]">
                  Файлы Cookies и LocalStorage браузера применяются исключительно для обеспечения технической функциональности Сервиса (сохранение текущей сессии, темы оформления, аудио-настроек). Сторонние коммерческие трекеры и рекламные пиксели профилирования не используются.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">3. Цели обработки персональных данных</h3>
                <ul className="list-disc pl-6 space-y-1 text-sm sm:text-base text-[#aaaaaa]">
                  <li>Обеспечение технической работы пирингового соединения WebRTC и навигации по комнатам;</li>
                  <li>Идентификация Пользователя в личном кабинете и синхронизация привязанных устройств (Sticky Bridge);</li>
                  <li>Заключение и исполнение лицензионного договора / предоставление доступа к тарифам Bridgik Pro;</li>
                  <li>Выставление фискальных чеков самозанятого и финансовая отчётность в соответствии с законодательством РФ;</li>
                  <li>Обработка обращений в службу технической поддержки.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">4. Порядок обработки и партнёры-обработчики</h3>
                <p>
                  4.1. Обработка персональных данных осуществляется законными способами с использованием средств автоматизации. Хранение баз данных авторизованных пользователей осуществляется на серверах, расположенных на территории Российской Федерации.
                </p>
                <p>
                  4.2. Для выполнения обязательств Оператор вправе привлекать надёжных партнёров-обработчиков:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm sm:text-base text-[#aaaaaa]">
                  <li>Провайдер авторизации: ООО «Яндекс» (сервис Яндекс ID);</li>
                  <li>Платёжные сервисы: сертифицированные российские платёжные шлюзы и банки-эквайеры (обработка платежей по банковским картам и СБП по стандарту безопасности PCI DSS; платёжные реквизиты карт Оператором не собираются и не сохраняются).</li>
                </ul>
                <p>
                  4.3. Персональные данные не передаются третьим лицам, за исключением случаев, прямо предусмотренных действующим законодательством РФ.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">5. Безопасность и сквозное шифрование</h3>
                <p>
                  5.1. P2P-трафик между устройствами шифруется на транспортном уровне протоколами DTLS (Datagram Transport Layer Security) и SRTP (Secure Real-time Transport Protocol) с применением алгоритмов AES-128 / AES-256. Ключи шифрования генерируются браузерами и не передаются серверу.
                </p>
                <p>
                  5.2. Веб-трафик Сервиса защищён защищённым протоколом SSL/HTTPS.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">6. Права Пользователя</h3>
                <p>
                  6.1. Пользователь имеет право на получение сведений о своих персональных данных, их уточнение, блокирование или уничтожение.
                </p>
                <p>
                  6.2. Отзыв согласия на обработку персональных данных осуществляется путём направления письменного обращения Оператору через Telegram: <a href="https://t.me/IvanchesskO" target="_blank" rel="noopener noreferrer" className="text-[#9ac43e] hover:underline font-bold">@IvanchesskO</a>.
                </p>
              </section>

              <section className="space-y-2 pt-2 border-t border-white/10">
                <h3 className="font-extrabold text-xl text-white">7. Реквизиты Оператора</h3>
                <div className="p-4 rounded-xl bg-[#222222] border border-[#333333] space-y-1 text-sm sm:text-base font-mono">
                  <p><strong className="text-white font-sans">Оператор:</strong> Ситников Иван Максимович</p>
                  <p><strong className="text-white font-sans">Статус:</strong> Плательщик налога на профессиональный доход (Самозанятый)</p>
                  <p><strong className="text-white font-sans">ИНН:</strong> 682966705968</p>
                  <p><strong className="text-white font-sans">Сайт:</strong> https://bridgik.ru</p>
                  <p>
                    <strong className="text-white font-sans">Связь для обращений:</strong>{' '}
                    <a href="https://t.me/IvanchesskO" target="_blank" rel="noopener noreferrer" className="text-[#9ac43e] hover:underline font-bold">
                      @IvanchesskO
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* DOCUMENT 3: ОФЕРТА И СОГЛАШЕНИЕ */}
        {activeDoc === 'terms' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-[#2d2d2d] pb-4">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#9ac43e] font-mono">
                [ Документ 03 // Лицензионный договор ]
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] mt-1">
                Публичная оферта на использование сервиса Bridgik
              </h2>
            </div>

            <div className="space-y-5 text-base sm:text-lg text-[#cccccc] leading-relaxed">
              <p className="text-sm sm:text-base text-[#aaaaaa] italic">
                Настоящий документ представляет собой официальное предложение физического лица Ситникова Ивана Максимовича, применяющего специальный налоговый режим «Налог на профессиональный доход» (ИНН 682966705968, далее — «Лицензиар»), заключить лицензионный договор на право использования сервиса и программного обеспечения «Bridgik» на изложенных ниже условиях с любым дееспособным лицом (далее — «Лицензиат»). В соответствии с пунктом 2 статьи 437 Гражданского кодекса Российской Федерации (ГК РФ) данный документ является публичной офертой.
              </p>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">1. Термины и определения</h3>
                <p>
                  1.1. <strong className="text-white">Сервис</strong> — веб-сайт, расположенный в сети Интернет по адресу <a href="https://bridgik.ru" className="text-[#9ac43e] hover:underline">https://bridgik.ru</a>, включая программный комплекс, WebRTC-движок, интерфейс комнат, Канвас, сопутствующий код и дизайн.
                </p>
                <p>
                  1.2. <strong className="text-white">Базовый функционал (Free)</strong> — безвозмездно предоставляемое право прямого обмена файлами, использования комнат и чата без гарантированного сохранения истории сессий.
                </p>
                <p>
                  1.3. <strong className="text-white">Подписка Bridgik Pro</strong> — расширенный платный функционал Сервиса (включая функцию отложенной передачи Drop & Go с буферизацией до 200 МБ на 24 часа, постоянные доверенные устройства Sticky Bridge, увеличенные лимиты комнат и статусную кастомизацию), предоставляемый на оплаченный период времени.
                </p>
                <p>
                  1.4. <strong className="text-white">Акцепт Оферты:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm sm:text-base text-[#aaaaaa]">
                  <li>В отношении Базового функционала: начало использования Сервиса Лицензиатом (переход на сайт, создание комнаты или подключение по PIN-коду);</li>
                  <li>В отношении Подписки Bridgik Pro: совершение Лицензиатом 100% оплаты стоимости выбранного периода тарифа на Сервисе.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">2. Предмет договора</h3>
                <p>
                  2.1. Лицензиар обязуется предоставить Лицензиату право использования Сервиса и его платных функций (в случае оплаты тарифа Pro) на условиях простой (неисключительной) лицензии в пределах, предусмотренных настоящей Офертой.
                </p>
                <p>
                  2.2. Срок действия базовой лицензии: на весь период фактического использования Сервиса. Срок действия платной лицензии Pro: на оплаченный Лицензиатом период подписки.
                </p>
                <p>
                  2.3. Территория действия лицензии: весь мир (без территориальных ограничений).
                </p>
                <p>
                  2.4. Запреты для Лицензиата:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm sm:text-base text-[#aaaaaa]">
                  <li>Копировать, декомпилировать, модифицировать исходный закрытый программный код бэкенда и сигнального сервера;</li>
                  <li>Перепродавать доступ к Сервису или отдельным Pro-функциям третьим лицам;</li>
                  <li>Использовать Сервис для организации конкурирующих коммерческих платформ файлообмена или создания сервисов нелегального распространения контента.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">3. Порядок заключения договора и предоставления доступа</h3>
                <p>
                  3.1. Договор считается заключенным в простой письменной форме с момента совершения Акцепта (ст. 434, ст. 438 ГК РФ).
                </p>
                <p>
                  3.2. Доступ к функциям Подписки Bridgik Pro активируется в учётной записи Лицензиата автоматически сразу после подтверждения успешной оплаты платёжной системой.
                </p>
                <p>
                  3.3. Обязательство Лицензиара по предоставлению права использования платных функций считается исполненным в полном объёме с момента активации Pro-доступа в профиле Лицензиата.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">4. Стоимость и порядок оплаты</h3>
                <p>
                  4.1. Стоимость права использования Подписки Bridgik Pro определяется тарифами, опубликованными в разделе «Тарифы» на сайте Сервиса на момент оплаты.
                </p>
                <p>
                  4.2. Оплата производится в форме 100% авансового платежа (предоплаты) в безналичном порядке через подключенные сторонние платёжные сервисы (интернет-эквайринг, банковские карты, Система быстрых платежей СБП).
                </p>
                <p>
                  4.3. Автоматическое регулярное списание (рекуррентные платежи) осуществляется только при наличии явного предварительного согласия Лицензиата. Лицензиат вправе в любой момент отключить продление подписки в личном кабинете.
                </p>
                <p>
                  4.4. Моментом исполнения обязательства Лицензиата по оплате считается момент зачисления денежных средств на счёт Лицензиара (или уполномоченного платёжного агента). Чек самозанятого формируется автоматически в соответствии с Федеральным законом № 422-ФЗ.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">5. Условия возврата денежных средств</h3>
                <p>
                  5.1. В соответствии со ст. 1286 ГК РФ и нормами Закона РФ «О защите прав потребителей», предметом договора является предоставление права использования нематериального цифрового продукта (программного обеспечения). Поскольку право использования активируется сразу после оплаты, возврат средств за уже предоставленный период доступа не производится.
                </p>
                <p>
                  5.2. В случае выявления доказанной полной технической неработоспособности Сервиса по вине Лицензиара, продолжающейся более 48 (сорока восьми) часов подряд и препятствующей использованию оплаченных Pro-функций, Лицензиар обязуется соразмерно продлить срок действия подписки либо по письменному заявлению Лицензиата произвести возврат части средств пропорционально неиспользованному времени в течение 10 (десяти) рабочих дней.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">6. Ограничение ответственности («КАК ЕСТЬ» / AS IS)</h3>
                <p>
                  6.1. Сервис предоставляется на условиях «КАК ЕСТЬ» («AS IS»). Лицензиар не гарантирует, что Сервис будет работать непрерывно и безошибочно при блокировках протокола WebRTC локальными провайдерами связи, специфических настройках симметричного NAT (Symmetric NAT) или корпоративных брандмауэрах Лицензиата.
                </p>
                <p>
                  6.2. Лицензиар не контролирует и не несёт ответственности за содержание, законность и безопасность файлов и текстовой информации, пересылаемой Лицензиатом через Сервис.
                </p>
                <p>
                  6.3. Совокупный размер ответственности Лицензиара по любым претензиям ограничен суммой, фактически уплаченной Лицензиатом за соответствующий период подписки. Лицензиар ни при каких обстоятельствах не возмещает упущенную выгоду и косвенные убытки.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">7. Форс-мажор</h3>
                <p>
                  7.1. Стороны освобождаются от ответственности за неисполнение обязательств при возникновении обстоятельств непреодолимой силы (стихийные бедствия, военные действия, глобальные аварии на магистральных сетях связи, блокировки регулирующих органов).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">8. Разрешение споров</h3>
                <p>
                  8.1. Все споры и разногласия разрешаются путём переговоров с соблюдением обязательного досудебного претензионного порядка. Срок ответа на письменную претензию, направленную в Telegram Лицензиара — 30 (тридцать) календарных дней.
                </p>
                <p>
                  8.2. В случае недостижения согласия спор подлежит рассмотрению в суде по месту нахождения Лицензиара в соответствии с законодательством Российской Федерации.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-extrabold text-xl text-white">9. Изменение оферты</h3>
                <p>
                  9.1. Лицензиар вправе в любой момент в одностороннем порядке вносить изменения в условия настоящей Оферты. Новая редакция вступает в силу с момента её публикации на сайте Сервиса.
                </p>
              </section>

              <section className="space-y-2 pt-2 border-t border-white/10">
                <h3 className="font-extrabold text-xl text-white">10. Реквизиты Лицензиара</h3>
                <div className="p-4 rounded-xl bg-[#222222] border border-[#333333] space-y-1 text-sm sm:text-base font-mono">
                  <p><strong className="text-white font-sans">Лицензиар:</strong> Ситников Иван Максимович</p>
                  <p><strong className="text-white font-sans">Статус:</strong> Плательщик налога на профессиональный доход (Самозанятый)</p>
                  <p><strong className="text-white font-sans">ИНН:</strong> 682966705968</p>
                  <p><strong className="text-white font-sans">Сайт:</strong> https://bridgik.ru</p>
                  <p>
                    <strong className="text-white font-sans">Telegram для связи:</strong>{' '}
                    <a href="https://t.me/IvanchesskO" target="_blank" rel="noopener noreferrer" className="text-[#9ac43e] hover:underline font-bold">
                      @IvanchesskO
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
