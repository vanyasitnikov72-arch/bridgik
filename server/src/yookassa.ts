import crypto from 'crypto';

export interface YooKassaPaymentRequest {
  amount: {
    value: string;
    currency: 'RUB';
  };
  capture: boolean;
  confirmation: {
    type: 'redirect';
    return_url: string;
  };
  description: string;
  metadata: {
    userId: string;
    licenseKey: string;
    period: string;
    days: number;
    paymentId: string;
  };
}

export interface YooKassaPaymentResponse {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  paid: boolean;
  amount: {
    value: string;
    currency: string;
  };
  confirmation?: {
    type: string;
    confirmation_url: string;
  };
  created_at: string;
  description?: string;
  metadata?: Record<string, any>;
}

export async function createYooKassaPayment(
  req: YooKassaPaymentRequest
): Promise<YooKassaPaymentResponse> {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  if (!shopId || !secretKey) {
    console.warn(
      '[YooKassa] Keys not configured in environment (YOOKASSA_SHOP_ID / YOOKASSA_SECRET_KEY). Providing simulation flow.'
    );
    const mockId = `demo_${crypto.randomUUID()}`;
    const sep = req.confirmation.return_url.includes('?') ? '&' : '?';
    return {
      id: mockId,
      status: 'pending',
      paid: false,
      amount: req.amount,
      confirmation: {
        type: 'redirect',
        confirmation_url: `${req.confirmation.return_url}${sep}payment=demo&demo_id=${mockId}&days=${req.metadata.days}&key=${encodeURIComponent(req.metadata.licenseKey)}`,
      },
      created_at: new Date().toISOString(),
      metadata: req.metadata,
    };
  }

  const idempotenceKey = crypto.randomUUID();
  const authHeader = 'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64');

  const resp = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotence-Key': idempotenceKey,
      Authorization: authHeader,
    },
    body: JSON.stringify(req),
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`YooKassa API error (${resp.status}): ${errorText}`);
  }

  return (await resp.json()) as YooKassaPaymentResponse;
}

export async function getYooKassaPayment(paymentId: string): Promise<YooKassaPaymentResponse | null> {
  const shopId = process.env.YOOKASSA_SHOP_ID;
  const secretKey = process.env.YOOKASSA_SECRET_KEY;

  if (!shopId || !secretKey || paymentId.startsWith('demo_')) {
    return null;
  }

  const authHeader = 'Basic ' + Buffer.from(`${shopId}:${secretKey}`).toString('base64');
  const resp = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
    headers: {
      Authorization: authHeader,
    },
  });

  if (!resp.ok) return null;
  return (await resp.json()) as YooKassaPaymentResponse;
}
