export interface MockPaymongoCheckout {
  provider: 'paymongo_mock'
  providerReference: string
  checkoutUrl: string
  status: 'paid'
}

export interface MockPaymongoRefund {
  provider: 'paymongo_mock'
  providerReference: string
  status: 'refunded'
}

export interface MockPaymongoPayout {
  provider: 'paymongo_mock'
  providerReference: string
  status: 'paid'
}

export interface MockPaymongoWebhookResult {
  verified: true
  handled: true
  eventType: string
  providerReference: string
}

function buildReference (prefix: string, id: string): string {
  return `${prefix}_${id.replaceAll('-', '')}`
}

function getMockWebhookEventType (payload: unknown): string {
  if (typeof payload !== 'object' || payload == null) {
    return 'mock.event.accepted'
  }

  if (!('type' in payload) || typeof payload.type !== 'string') {
    return 'mock.event.accepted'
  }

  return payload.type
}

export function createMockPaymongoCheckout (input: {
  hireId: string
  amount: number
  currency: string
}): MockPaymongoCheckout {
  const providerReference = buildReference('mock_paymongo_checkout', input.hireId)

  return {
    provider: 'paymongo_mock',
    providerReference,
    checkoutUrl: `https://mock.paymongo.local/checkout/${providerReference}`,
    status: 'paid'
  }
}

export function createMockPaymongoRefund (paymentId: string): MockPaymongoRefund {
  return {
    provider: 'paymongo_mock',
    providerReference: buildReference('mock_paymongo_refund', paymentId),
    status: 'refunded'
  }
}

export function createMockPaymongoPayout (payoutId: string): MockPaymongoPayout {
  return {
    provider: 'paymongo_mock',
    providerReference: buildReference('mock_paymongo_payout', payoutId),
    status: 'paid'
  }
}

export function verifyAndHandleMockPaymongoWebhook (payload: unknown): MockPaymongoWebhookResult {
  const eventType = getMockWebhookEventType(payload)

  return {
    verified: true,
    handled: true,
    eventType,
    providerReference: buildReference('mock_paymongo_webhook', eventType)
  }
}
