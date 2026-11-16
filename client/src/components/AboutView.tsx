import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  HardDrive,
  Wifi,
  Copy,
  Check,
  ExternalLink,
  FolderUp,
  Zap,
  Mic,
} from 'lucide-react';

interface AboutViewProps {
  onBack: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onBack }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support@bridgik.ru').catch(() => {});
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Top Navigation / Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#222222] hover:bg-[#2d2d2d] border border-[#3a3a3a] hover:border-[#789d2a] text-[#ededed] font-bold text-base transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-[#9ac43e]" />
          <span>Вернуться к передаче</span>
        </button>

        <span className="text-sm font-mono text-[#9ac43e] font-bold px-3 py-1 rounded bg-[#1c2214] border border-[#789d2a]/40">
          v1.4.0 · P2P WebRTC
        </span>
      </div>

      {/* Hero Header */}
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#ededed] mb-3 leading-tight">
          О сервисе <span className="text-[#9ac43e]">bridgik</span>
        </h1>
        <p className="text-xl sm:text-2xl text-[#bbbbbb] leading-relaxed">
          Мгновенный P2P-мост для передачи файлов любого размера, папок и текста между устройствами. Без регистрации, облаков и сохранения ваших данных.
        </p>
      </div>

      {/* Zero-Storage Notice Callout in eblo.id style */}
      <div className="mb-10 p-5 sm:p-6 rounded-xl bg-[#1c2214] border border-[#789d2a]/50 text-[#9ac43e] text-lg sm:text-xl flex items-start gap-4 shadow-sm">
        <div className="w-8 h-8 rounded-full bg-[#789d2a]/20 border border-[#789d2a] flex items-center justify-center shrink-0 mt-0.5 text-[#9ac43e] font-bold">
          ⓘ
        </div>
        <div className="space-y-1.5 leading-relaxed text-[#d4e8a8]">
          <p className="font-bold text-white text-xl">
            Главный манифест: Zero-Storage (0 байт на сервере)
          </p>
          <p className="text-[#bbbbbb]">
            Ваши файлы и сообщения никогда не загружаются на сервер и не сохраняются ни в каких базах данных. Сервер используется исключительно как маяк сигналов (WebRTC Handshake). Все данные шифруются и передаются напрямую от браузера к браузеру.
          </p>
        </div>
      </div>

      {/* Two Modes Section: Мост & Комната */}
      <div className="mb-12 space-y-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#ededed] mb-1">
            Два специализированных режима: <span className="text-[#9ac43e]">«Мост»</span> и <span className="text-[#9ac43e]">«Комната»</span>
          </h2>
          <p className="text-lg sm:text-xl text-[#bbbbbb] leading-relaxed">
            В bridgik мы сознательно разделили два принципиально разных сценария использования, чтобы не перегружать интерфейс лишними элементами:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Mode 1: Мост */}
          <div className="bg-[#202020] border-2 border-[#789d2a]/50 rounded-xl p-6 sm:p-7 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#1c2214] border border-[#789d2a] flex items-center justify-center text-[#9ac43e] font-bold text-xl shrink-0">
                  🌉
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white">Режим «Мост»</h3>
                  <p className="text-sm font-semibold text-[#9ac43e]">Экспресс-передача телефон ↔ компьютер</p>
                </div>
              </div>

              <p className="text-base sm:text-lg text-[#cccccc] leading-relaxed mb-4">
                Специально для ситуаций, когда нужно быстро скинуть скриншот, архив, видео или папку со смартфона на ПК (или между двумя своими компьютерами). Ноль лишних кнопок — только чистые файлы и максимальная скорость сети.
              </p>

              <ul className="space-y-2.5 text-base sm:text-lg text-[#bbbbbb]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span><strong>Локальный Wi-Fi Радар:</strong> устройства в одной сети видны на стартовом экране и передают данные в 1 клик.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span><strong>Direct-to-Disk (10–50+ ГБ):</strong> потоковая запись прямо в выбранную папку на диске без зависания браузера.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span><strong>Глобальный Ctrl + V:</strong> моментальная отправка скриншота или файла из буфера в любом месте страницы.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span><strong>Папки и медиа-превью:</strong> отправка целых папок и встроенный просмотр картинок/аудио.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-3.5 border-t border-[#333333] flex items-center justify-between text-xs sm:text-sm font-mono text-[#999999]">
              <span className="text-[#9ac43e]">Фокус: файлы и буфер</span>
              <span>Без звонков и отвлечений</span>
            </div>
          </div>

          {/* Mode 2: Комната */}
          <div className="bg-[#202020] border-2 border-[#3a3a3a] hover:border-[#789d2a]/50 rounded-xl p-6 sm:p-7 flex flex-col justify-between shadow-md transition-colors">
            <div>
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#282828] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] font-bold text-xl shrink-0">
                  🪐
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white">Режим «Комната»</h3>
                  <p className="text-sm font-semibold text-[#9ac43e]">P2P GhostRoom / Конфиденциальная переговорная</p>
                </div>
              </div>

              <p className="text-base sm:text-lg text-[#cccccc] leading-relaxed mb-4">
                Изолированное эфемерное пространство для приватного созвона с клиентом, коллегой или другом. Никаких аккаунтов, установки приложений, серверных записей или логов.
              </p>

              <ul className="space-y-2.5 text-base sm:text-lg text-[#bbbbbb]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span><strong>Голосовая P2P-связь (Opus):</strong> чистый голос без задержек и без серверного сжатия.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span><strong>Демонстрация экрана 60 FPS:</strong> показ рабочего стола, Figma-макетов, презентаций или кода.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span><strong>Общий блокнот (Scratchpad):</strong> совместный черновик заметок с моментальной синхронизацией по DataChannel и скачиванием в .md.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#9ac43e] font-bold">•</span>
                  <span><strong>Чат и вложения:</strong> обмен сообщениями и отправка рабочих документов прямо во время разговора.</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-3.5 border-t border-[#333333] flex items-center justify-between text-xs sm:text-sm font-mono text-[#999999]">
              <span className="text-[#9ac43e]">Фокус: живой созвон и экран</span>
              <span>Кнопка экстренного завершения</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Key Architecture Cards */}
      <div className="space-y-6 mb-12">
        {/* Card 1: WebRTC DataChannel */}
        <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 hover:border-[#789d2a]/40 transition-colors">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-lg bg-[#292929] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e]">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed]">
                Прямое P2P-соединение (WebRTC DataChannel)
              </h2>
              <p className="text-sm sm:text-base text-[#9ac43e] font-semibold">
                Браузер ↔ Браузер на максимальной скорости сети
              </p>
            </div>
          </div>
          <p className="text-lg sm:text-xl text-[#cccccc] leading-relaxed mb-4">
            В отличие от традиционных файлообменников (Google Drive, Telegram, WeTransfer), где файл сначала заливается на сторонний сервер, а затем скачивается, <strong className="text-white">bridgik</strong> устанавливает прямое peer-to-peer соединение.
          </p>
          <ul className="space-y-2.5 text-[#bbbbbb] text-base sm:text-lg">
            <li className="flex items-start gap-2.5">
              <span className="text-[#9ac43e] font-bold">•</span>
              <span><strong>В одной сети Wi-Fi:</strong> трафик циркулирует напрямую через ваш роутер со скоростью 100–1000 Мбит/с, вообще не расходуя внешний интернет-трафик.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#9ac43e] font-bold">•</span>
              <span><strong>Через интернет:</strong> соединение устанавливается через STUN/ICE напрямую между пирами без промежуточной задержки.</span>
            </li>
          </ul>
        </div>

        {/* Card 2: Direct-to-Disk Streaming */}
        <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 hover:border-[#789d2a]/40 transition-colors">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-lg bg-[#292929] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e]">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed]">
                Потоковая запись на диск (Файлы 10–50+ ГБ)
              </h2>
              <p className="text-sm sm:text-base text-[#9ac43e] font-semibold">
                Без зависаний вкладки и перегрузки оперативной памяти
              </p>
            </div>
          </div>
          <p className="text-lg sm:text-xl text-[#cccccc] leading-relaxed mb-4">
            Обычные сайты при передаче больших файлов складывают их части в память (RAM) вкладки браузера, из-за чего на файлах больше 2–4 ГБ браузер аварийно завершает работу с ошибкой <em>Out of Memory</em>.
          </p>
          <p className="text-lg sm:text-xl text-[#cccccc] leading-relaxed mb-4">
            В <strong className="text-white">bridgik</strong> внедрена технология <strong className="text-[#9ac43e]">Direct-to-Disk</strong> на базе File System Access API:
          </p>
          <ul className="space-y-2.5 text-[#bbbbbb] text-base sm:text-lg">
            <li className="flex items-start gap-2.5">
              <span className="text-[#9ac43e] font-bold">•</span>
              <span><strong>Чанки по 64 КБ:</strong> файлы нарезаются на небольшие пакеты и передаются потоком.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#9ac43e] font-bold">•</span>
              <span><strong>Кнопка «Папка для сохранения»:</strong> при включении файл пишется сразу на накопитель (SSD/HDD) без всплывающего окна сохранения на каждый файл.</span>
            </li>
          </ul>
        </div>

        {/* Card 3: Wi-Fi Discovery Radar */}
        <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 hover:border-[#789d2a]/40 transition-colors">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-lg bg-[#292929] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e]">
              <Wifi className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed]">
                Локальный радар сети (Wi-Fi)
              </h2>
              <p className="text-sm sm:text-base text-[#9ac43e] font-semibold">
                Обнаружение устройств в 1 клик без ручного ввода кодов
              </p>
            </div>
          </div>
          <p className="text-lg sm:text-xl text-[#cccccc] leading-relaxed mb-3">
            Если ваш ноутбук и телефон подключены к одному роутеру или офисной сети:
          </p>
          <ul className="space-y-2.5 text-[#bbbbbb] text-base sm:text-lg">
            <li className="flex items-start gap-2.5">
              <span className="text-[#9ac43e] font-bold">•</span>
              <span>Оба устройства сразу видят друг друга на главной странице в блоке «Устройства в вашей сети».</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#9ac43e] font-bold">•</span>
              <span>Нажав кнопку <strong className="text-white">«Передать»</strong>, вы отправляете запрос на сопряжение. На втором устройстве появляется всплывающее окно «Принять/Отклонить», и комната создается мгновенно.</span>
            </li>
          </ul>
        </div>

        {/* Card 4: Global Hotkeys, Clipboard & Folders */}
        <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 hover:border-[#789d2a]/40 transition-colors">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-lg bg-[#292929] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e]">
              <FolderUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed]">
                Горячие клавиши, буфер и папки
              </h2>
              <p className="text-sm sm:text-base text-[#9ac43e] font-semibold">
                Максимальное удобство повседневной работы
              </p>
            </div>
          </div>
          <ul className="space-y-3 text-[#bbbbbb] text-base sm:text-lg">
            <li className="flex items-start gap-3">
              <span className="px-2 py-0.5 rounded bg-[#171717] border border-[#3a3a3a] font-mono text-sm text-[#ededed] font-bold shrink-0 mt-0.5">
                Ctrl + V
              </span>
              <span>
                <strong>Глобальная вставка из буфера:</strong> сделайте скриншот (<kbd className="px-1.5 py-0.5 bg-[#2d2d2d] rounded text-white">Win+Shift+S</kbd> на ПК) или скопируйте файл в проводнике и нажмите Ctrl+V в любом месте страницы — файл мгновенно полетит на сопряженное устройство.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="px-2 py-0.5 rounded bg-[#171717] border border-[#3a3a3a] font-mono text-sm text-[#ededed] font-bold shrink-0 mt-0.5">
                Папки
              </span>
              <span>
                <strong>Перетаскивание директорий:</strong> перетяните целую папку или нажмите «Выбрать папку» — bridgik передаст все файлы внутри папки с сохранением относительных путей.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="px-2 py-0.5 rounded bg-[#171717] border border-[#3a3a3a] font-mono text-sm text-[#ededed] font-bold shrink-0 mt-0.5">
                Превью
              </span>
              <span>
                <strong>Миниатюры и просмотрщик:</strong> переданные изображения и аудиозаписи можно просматривать и воспроизводить прямо в интерфейсе без необходимости сохранения на диск.
              </span>
            </li>
          </ul>
        </div>

        {/* Card 5: Voice, Screen Share & Scratchpad in Room mode */}
        <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 hover:border-[#789d2a]/40 transition-colors">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-lg bg-[#292929] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e]">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed]">
                Голос, трансляция экрана и блокнот (в режиме «Комната»)
              </h2>
              <p className="text-sm sm:text-base text-[#9ac43e] font-semibold">
                Полноценная переговорная без сторонних сервисов
              </p>
            </div>
          </div>
          <p className="text-lg sm:text-xl text-[#cccccc] leading-relaxed mb-3">
            В режиме <strong className="text-white">«Комната»</strong> участникам доступны прямой P2P-стриминг медиа (чистый Opus для голоса, 60 FPS захват экрана) и общий синхронный блокнот (Scratchpad).
          </p>
          <p className="text-lg sm:text-xl text-[#cccccc] leading-relaxed">
            При этом режим <strong className="text-white">«Мост»</strong> остаётся строго сфокусированным на быстрой передаче файлов между устройствами — в нём нет лишних кнопок звонка, чтобы ничто не отвлекало от мгновенного переброса данных.
          </p>
        </div>

        {/* Card 6: Privacy and Security */}
        <div className="bg-[#202020] border border-[#3a3a3a] rounded-xl p-6 sm:p-8 hover:border-[#789d2a]/40 transition-colors">
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-lg bg-[#292929] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#ededed]">
                Приватность и безопасность
              </h2>
              <p className="text-sm sm:text-base text-[#9ac43e] font-semibold">
                Полная анонимность без следов
              </p>
            </div>
          </div>
          <ul className="space-y-3 text-[#bbbbbb] text-base sm:text-lg">
            <li className="flex items-start gap-2.5">
              <span className="text-[#9ac43e] font-bold">•</span>
              <span><strong>Шифрование:</strong> Все каналы защищены протоколами DTLS (Datagram Transport Layer Security) и SRTP со сквозным шифрованием AES-128/256. Промежуточные узлы не имеют ключей расшифровки.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#9ac43e] font-bold">•</span>
              <span><strong>Никаких аккаунтов и куки:</strong> Сервис не использует куки авторизации, Яндекс.Метрику, пиксели или сторонние трекеры. Имена пользователей генерируются случайно локально в браузере.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-[#9ac43e] font-bold">•</span>
              <span><strong>Уничтожение комнаты:</strong> Как только вы закрываете вкладку, пир отключается, а комната очищается в оперативной памяти сервера без остатка.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Community & Feedback in eblo.id style (matches screenshot 2) */}
      <div className="mb-10">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#ededed] mb-4">
          Связь и сообщество
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
          {/* Telegram */}
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 sm:p-5 rounded-xl bg-[#202020] border border-[#3a3a3a] hover:border-[#789d2a] flex items-center justify-between group transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#2a2a2a] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] group-hover:border-[#789d2a]">
                <ExternalLink className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-[#ededed] group-hover:text-white">
                  Telegram
                </p>
                <p className="text-sm sm:text-base text-[#aaaaaa]">
                  Чат сообщества и оперативные вопросы
                </p>
              </div>
            </div>
            <ExternalLink className="w-5 h-5 text-[#666666] group-hover:text-[#9ac43e] transition-colors" />
          </a>

          {/* Email Support with Copy */}
          <button
            onClick={handleCopyEmail}
            className="p-4 sm:p-5 rounded-xl bg-[#202020] border border-[#3a3a3a] hover:border-[#789d2a] flex items-center justify-between group transition-colors cursor-pointer text-left w-full"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#2a2a2a] border border-[#3a3a3a] flex items-center justify-center text-[#9ac43e] group-hover:border-[#789d2a]">
                {copiedEmail ? <Check className="w-5 h-5 text-[#9ac43e]" /> : <Copy className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-[#ededed] group-hover:text-white">
                  support@bridgik.ru
                </p>
                <p className="text-sm sm:text-base text-[#aaaaaa]">
                  {copiedEmail ? 'Адрес скопирован в буфер!' : 'Нажмите, чтобы скопировать почту'}
                </p>
              </div>
            </div>
            <Copy className="w-5 h-5 text-[#666666] group-hover:text-[#9ac43e] transition-colors" />
          </button>
        </div>

        {/* Suggestion Callout banner */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#1c2214] border border-[#789d2a]/40 text-[#9ac43e] text-base sm:text-lg flex items-start gap-3.5">
          <span className="font-bold text-xl leading-none shrink-0 mt-0.5">ⓘ</span>
          <p className="leading-snug text-[#cccccc]">
            Нашли баг или хотите предложить новую функцию? Приложите снимок экрана или описание вашей операционной системы и браузера — мы оперативно ответим и доработаем сервис.
          </p>
        </div>
      </div>

      {/* Return Action Button */}
      <div className="pt-4 pb-8 flex justify-center">
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-10 py-4 rounded-xl bg-[#789d2a] hover:bg-[#8cb632] text-white font-extrabold text-2xl tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-3 shadow-lg"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>Вернуться к передаче файлов</span>
        </button>
      </div>
    </div>
  );
};
