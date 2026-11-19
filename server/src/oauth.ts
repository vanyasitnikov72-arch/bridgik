import crypto from 'crypto';

export interface SocialAuthProfile {
  id: string;
  login: string;
  username?: string;
  displayName: string;
  avatarUrl?: string;
}

// In-memory pending bot auth tokens (session codes)
export interface PendingBotSession {
  token: string;
  createdAt: number;
  socketId?: string;
  completedUser?: any;
}

export const pendingBotSessions = new Map<string, PendingBotSession>();

// Cleanup stale sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, sess] of pendingBotSessions.entries()) {
    if (now - sess.createdAt > 15 * 60 * 1000) {
      pendingBotSessions.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * 1. YANDEX ID HELPERS
 */
export function getYandexClientCredentials() {
  const clientId = process.env.YANDEX_CLIENT_ID;
  const clientSecret = process.env.YANDEX_CLIENT_SECRET;
  return { clientId, clientSecret, isConfigured: Boolean(clientId && clientSecret) };
}

export async function exchangeYandexCode(
  code: string,
  redirectUri: string
): Promise<SocialAuthProfile> {
  const { clientId, clientSecret, isConfigured } = getYandexClientCredentials();

  if (!isConfigured) {
    throw new Error('Yandex OAuth credentials not configured in environment');
  }

  // 1. Exchange code for access_token
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId!,
    client_secret: clientSecret!,
  });

  const tokenResp = await fetch('https://oauth.yandex.ru/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!tokenResp.ok) {
    const errText = await tokenResp.text();
    throw new Error(`Yandex token exchange failed (${tokenResp.status}): ${errText}`);
  }

  const tokenData = await tokenResp.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    throw new Error('No access_token returned by Yandex');
  }

  // 2. Fetch user profile
  const userResp = await fetch('https://login.yandex.ru/info?format=json', {
    headers: { Authorization: `OAuth ${accessToken}` },
  });

  if (!userResp.ok) {
    throw new Error(`Failed to fetch Yandex user profile (${userResp.status})`);
  }

  const raw = await userResp.json();
  const avatarUrl =
    raw.default_avatar_id && !raw.is_avatar_empty
      ? `https://avatars.yandex.net/get-yapic/${raw.default_avatar_id}/islands-200`
      : undefined;

  const displayName = raw.display_name || raw.real_name || raw.login || 'Пользователь Яндекса';

  return {
    id: String(raw.id),
    login: raw.login || `yandex_${raw.id}`,
    displayName,
    avatarUrl,
  };
}

/**
 * 2. TELEGRAM HELPERS
 */
export function getTelegramBotCredentials() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'bridgik_bot';
  let botId = '';
  if (botToken && botToken.includes(':')) {
    botId = botToken.split(':')[0];
  }
  return { botToken, botUsername, botId, isConfigured: Boolean(botToken) };
}

export function verifyTelegramAuthData(
  queryData: Record<string, string>,
  botToken: string
): boolean {
  if (!botToken || !queryData.hash) return false;
  const hash = queryData.hash;

  const checkKeys = Object.keys(queryData)
    .filter((k) => k !== 'hash')
    .sort();

  const dataCheckString = checkKeys.map((k) => `${k}=${queryData[k]}`).join('\n');
  const secret = crypto.createHash('sha256').update(botToken).digest();
  const hmac = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');

  return hmac === hash;
}

/**
 * 3. HTML CONSENT SCREEN RENDERING (Matches the screenshot layout from user)
 */
export function renderOAuthConsentScreen(options: {
  provider: 'yandex' | 'telegram';
  confirmActionUrl: string;
  cancelUrl: string;
  state: string;
  defaultLogin?: string;
  defaultName?: string;
}): string {
  const isYandex = options.provider === 'yandex';
  const brandName = isYandex ? 'Яндекс ID' : 'Telegram';
  const brandColor = isYandex ? '#FC3F1D' : '#229ED9';
  const brandHover = isYandex ? '#e03414' : '#1b8ec4';
  const brandLogo = isYandex
    ? `<svg width="40" height="40" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#FC3F1D"/><path d="M17.4 8h2.3v16h-2.3v-6.9h-1.9l-3 6.9H9.8l3.4-7.4c-1.8-.8-2.7-2.3-2.7-4.2 0-2.6 1.8-4.4 5.2-4.4h1.7zm0 2.2h-1.6c-2.1 0-3 1.1-3 2.5 0 1.5 1 2.4 3 2.4h1.6V10.2z" fill="#FFFFFF"/></svg>`
    : `<svg width="40" height="40" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#229ED9"/><path d="M22.8 10.2L7.6 16.1c-1 .4-1 1-.2 1.2l3.9 1.2 1.4 4.3c.2.5.1.7.6.7.4 0 .6-.2.8-.4l2-1.9 4.2 3.1c.8.4 1.3.2 1.5-.7l2.8-13c.3-1.1-.4-1.6-1.8-1.2z" fill="#FFFFFF"/></svg>`;

  const mockUser = isYandex
    ? {
        name: options.defaultName || 'Иван Ситников',
        login: options.defaultLogin || 'vanya.sitnikov@yandex.ru',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      }
    : {
        name: options.defaultName || 'Ivan Sitnikov',
        login: options.defaultLogin || '@bridgik_user',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      };

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brandName} Auth — bridgik.ru</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0e0e10;
      color: #efeff1;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      width: 100%;
      max-width: 480px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .brand-header {
      margin-bottom: 20px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 4px;
    }
    .brand-subtitle {
      font-size: 14px;
      color: #adadb8;
    }
    .account-badge {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: #18181b;
      border: 1px solid #2e2e35;
      padding: 8px 16px;
      border-radius: 9999px;
      margin-top: 16px;
      margin-bottom: 24px;
      text-align: left;
    }
    .account-badge img {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
    }
    .account-badge .names {
      font-size: 13px;
    }
    .account-badge .display {
      font-weight: 700;
      color: #efeff1;
    }
    .account-badge .handle {
      color: #888888;
      font-size: 11px;
    }
    .permissions-box {
      width: 100%;
      background: #18181b;
      border: 1px solid #2e2e35;
      border-radius: 12px;
      padding: 20px;
      text-align: left;
      margin-bottom: 24px;
      font-size: 13px;
      line-height: 1.5;
    }
    .permissions-box h3 {
      font-size: 15px;
      font-weight: 700;
      margin-bottom: 12px;
      color: #ffffff;
    }
    .permissions-box ul {
      list-style-position: inside;
      color: #adadb8;
      margin-bottom: 14px;
    }
    .permissions-box li {
      margin-bottom: 6px;
    }
    .permissions-box .info-meta {
      border-top: 1px solid #2e2e35;
      padding-top: 12px;
      font-size: 12px;
      color: #71717a;
    }
    .btn-submit {
      width: 100%;
      background-color: ${brandColor};
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 700;
      padding: 12px 20px;
      cursor: pointer;
      transition: background-color 0.15s ease;
      margin-bottom: 10px;
    }
    .btn-submit:hover {
      background-color: ${brandHover};
    }
    .btn-cancel {
      width: 100%;
      background-color: #26262c;
      color: #efeff1;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      padding: 10px 20px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }
    .btn-cancel:hover {
      background-color: #32323a;
    }
    .notice {
      margin-top: 16px;
      font-size: 11px;
      color: #71717a;
      line-height: 1.4;
    }
    .notice a {
      color: ${brandColor};
      text-decoration: none;
    }
    .footer-links {
      margin-top: 24px;
      font-size: 12px;
      display: flex;
      gap: 16px;
    }
    .footer-links a {
      color: #adadb8;
      text-decoration: none;
    }
    .footer-links a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand-header">
      ${brandLogo}
    </div>

    <h1 class="brand-title">bridgik.ru</h1>
    <p class="brand-subtitle">хочет получить доступ к вашей учетной записи ${brandName}</p>

    <div class="account-badge">
      <img src="${mockUser.avatar}" alt="${mockUser.name}">
      <div class="names">
        <div class="display">${mockUser.name}</div>
        <div class="handle">${mockUser.login}</div>
      </div>
    </div>

    <div class="permissions-box">
      <h3>Авторизация позволит bridgik.ru:</h3>
      <ul>
        <li>Получить ваше имя и фото профиля</li>
        <li>Привязать устройства Sticky Bridge для быстрой передачи</li>
        <li>Сохранять статус подписки Pro навсегда</li>
      </ul>
      <div class="info-meta">
        <div>Авторизация перенаправит вас на сайт <strong>https://bridgik.ru</strong></div>
        <div style="margin-top: 4px;">Убедитесь, что вы доверяете сервису bridgik.ru</div>
      </div>
    </div>

    <form method="POST" action="${options.confirmActionUrl}" style="width: 100%;">
      <input type="hidden" name="state" value="${options.state}">
      <input type="hidden" name="login" value="${mockUser.login}">
      <input type="hidden" name="displayName" value="${mockUser.name}">
      <input type="hidden" name="avatarUrl" value="${mockUser.avatar}">
      <button type="submit" class="btn-submit">Разрешить</button>
    </form>

    <a href="${options.cancelUrl}" class="btn-cancel">Отмена</a>

    <p class="notice">
      Нажав «Разрешить», вы разрешите bridgik.ru доступ к указанным выше данным в соответствии с
      <a href="/?doc=privacy" target="_blank">Политикой конфиденциальности</a>.
    </p>

    <div class="footer-links">
      <a href="/?doc=privacy" target="_blank">О конфиденциальности</a>
      <a href="/?doc=terms" target="_blank">Условия обслуживания</a>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 4. HTML POPUP SUCCESS REDIRECT (Sends postMessage to parent and closes window)
 */
export function renderAuthSuccessCallback(options: {
  provider: string;
  licenseKey: string;
  userProfile: any;
}): string {
  const jsonUser = JSON.stringify(options.userProfile).replace(/</g, '\\u003c');
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Успешная авторизация — Bridgik</title>
  <style>
    body {
      background: #141414;
      color: #ededed;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      text-align: center;
    }
    .box {
      background: #1c1c1c;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 16px;
      padding: 32px 40px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    h2 { font-size: 20px; font-weight: 800; margin-bottom: 8px; color: #9ac43e; }
    p { font-size: 14px; color: #a8a8a8; }
  </style>
</head>
<body>
  <div class="box">
    <h2>✓ Вход выполнен!</h2>
    <p>Связываем аккаунт с устройствами...</p>
  </div>
  <script>
    (function() {
      const payload = {
        type: 'BRIDGIK_AUTH_SUCCESS',
        provider: '${options.provider}',
        key: '${options.licenseKey}',
        user: ${jsonUser}
      };

      if (window.opener && !window.opener.closed) {
        try {
          window.opener.postMessage(payload, '*');
        } catch (e) {
          console.error('postMessage failed', e);
        }
        setTimeout(function() { window.close(); }, 350);
      } else {
        window.location.href = '/?tab=profile&auth=success&key=' + encodeURIComponent('${options.licenseKey}');
      }
    })();
  </script>
</body>
</html>`;
}
