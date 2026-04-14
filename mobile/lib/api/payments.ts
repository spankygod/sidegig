import { request } from './client';
import type { PaymentSummary } from './types';

export async function fetchPayments(
  baseUrl: string,
  token: string,
  filters?: {
    limit?: number;
  }
): Promise<PaymentSummary[]> {
  const response = await request<{ payments: PaymentSummary[] }>(baseUrl, '/v1/payments', {
    token,
    query: {
      limit: filters?.limit,
    },
  });

  return response.payments;
}

export async function fetchPayment(
  baseUrl: string,
  token: string,
  paymentId: string
): Promise<PaymentSummary> {
  const response = await request<{ payment: PaymentSummary }>(baseUrl, `/v1/payments/${paymentId}`, {
    token,
  });

  return response.payment;
}
