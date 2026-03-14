import { drizzleDb } from './index';
import { webhooks } from './schema';

const truncateDb = async () => {
  await drizzleDb.execute('TRUNCATE TABLE webhooks;');
};

truncateDb().catch(console.error);

const STRIPE_IPS = [
  '3.18.12.63',
  '3.130.192.231',
  '13.235.14.237',
  '13.235.122.149',
  '18.211.135.69',
  '35.154.171.200',
  '52.15.183.38',
  '54.187.174.169',
  '54.187.205.235',
  '54.187.216.72',
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function stripeSignature() {
  const ts = Math.floor(Date.now() / 1000);
  const sig = Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `t=${ts},v1=${sig}`;
}

function stripeEventId() {
  return `evt_${Math.random().toString(36).slice(2, 24)}`;
}

function stripeCustomerId() {
  return `cus_${Math.random().toString(36).slice(2, 16)}`;
}

function stripePaymentIntentId() {
  return `pi_${Math.random().toString(36).slice(2, 24)}`;
}

function stripeInvoiceId() {
  return `in_${Math.random().toString(36).slice(2, 24)}`;
}

function stripeSubscriptionId() {
  return `sub_${Math.random().toString(36).slice(2, 24)}`;
}

function stripeChargeId() {
  return `ch_${Math.random().toString(36).slice(2, 24)}`;
}

function stripeRefundId() {
  return `re_${Math.random().toString(36).slice(2, 24)}`;
}

function stripePriceId() {
  return `price_${Math.random().toString(36).slice(2, 16)}`;
}

function stripeProductId() {
  return `prod_${Math.random().toString(36).slice(2, 16)}`;
}

function randomAmount() {
  return Math.floor(Math.random() * 100000) + 990;
}

function stripeHeaders(body: string) {
  return {
    'content-type': 'application/json',
    'user-agent': 'Stripe/1.0 (+https://stripe.com/docs/webhooks)',
    'stripe-signature': stripeSignature(),
    'x-stripe-idempotency-key': Math.random().toString(36).slice(2, 20),
    'x-forwarded-for': randomItem(STRIPE_IPS),
    'x-real-ip': randomItem(STRIPE_IPS),
    'content-length': String(Buffer.byteLength(body, 'utf8')),
    accept: '*/*',
  };
}

type WebhookInsert = {
  method: string;
  pathname: string;
  ip: string;
  statusCode: number;
  contentType: string | null;
  contentLength: number | null;
  queryParams: Record<string, string>;
  headers: Record<string, string>;
  body: string | null;
};

function makeWebhook(
  event: string,
  data: object,
  statusCode = 200
): WebhookInsert {
  const body = JSON.stringify(
    {
      id: stripeEventId(),
      object: 'event',
      api_version: '2023-10-16',
      created:
        Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400 * 30),
      type: event,
      livemode: false,
      pending_webhooks: 1,
      request: { id: null, idempotency_key: null },
      data: { object: data },
    },
    null,
    2
  );

  return {
    method: 'POST',
    pathname: '/webhooks/stripe',
    ip: randomItem(STRIPE_IPS),
    statusCode,
    contentType: 'application/json',
    contentLength: Buffer.byteLength(body, 'utf8'),
    queryParams: {},
    headers: stripeHeaders(body),
    body,
  };
}

const customerId = stripeCustomerId();
const subscriptionId = stripeSubscriptionId();
const priceId = stripePriceId();
const productId = stripeProductId();

const seedWebhooks: WebhookInsert[] = [
  // payment_intent events
  makeWebhook('payment_intent.created', {
    id: stripePaymentIntentId(),
    object: 'payment_intent',
    amount: randomAmount(),
    currency: 'brl',
    status: 'requires_payment_method',
    customer: customerId,
  }),
  makeWebhook('payment_intent.created', {
    id: stripePaymentIntentId(),
    object: 'payment_intent',
    amount: randomAmount(),
    currency: 'usd',
    status: 'requires_payment_method',
    customer: stripeCustomerId(),
  }),
  makeWebhook('payment_intent.payment_failed', {
    id: stripePaymentIntentId(),
    object: 'payment_intent',
    amount: randomAmount(),
    currency: 'brl',
    status: 'requires_payment_method',
    last_payment_error: {
      code: 'card_declined',
      message: 'Your card was declined.',
    },
    customer: customerId,
  }),
  makeWebhook('payment_intent.payment_failed', {
    id: stripePaymentIntentId(),
    object: 'payment_intent',
    amount: randomAmount(),
    currency: 'brl',
    status: 'requires_payment_method',
    last_payment_error: {
      code: 'insufficient_funds',
      message: 'Your card has insufficient funds.',
    },
    customer: stripeCustomerId(),
  }),
  makeWebhook('payment_intent.payment_failed', {
    id: stripePaymentIntentId(),
    object: 'payment_intent',
    amount: randomAmount(),
    currency: 'usd',
    status: 'requires_payment_method',
    last_payment_error: {
      code: 'expired_card',
      message: 'Your card has expired.',
    },
    customer: stripeCustomerId(),
  }),
  makeWebhook('payment_intent.succeeded', {
    id: stripePaymentIntentId(),
    object: 'payment_intent',
    amount: randomAmount(),
    currency: 'brl',
    status: 'succeeded',
    customer: customerId,
  }),
  makeWebhook('payment_intent.succeeded', {
    id: stripePaymentIntentId(),
    object: 'payment_intent',
    amount: randomAmount(),
    currency: 'brl',
    status: 'succeeded',
    customer: stripeCustomerId(),
  }),
  makeWebhook('payment_intent.succeeded', {
    id: stripePaymentIntentId(),
    object: 'payment_intent',
    amount: randomAmount(),
    currency: 'usd',
    status: 'succeeded',
    customer: stripeCustomerId(),
  }),
  makeWebhook('payment_intent.succeeded', {
    id: stripePaymentIntentId(),
    object: 'payment_intent',
    amount: randomAmount(),
    currency: 'usd',
    status: 'succeeded',
    customer: stripeCustomerId(),
  }),
  makeWebhook('payment_intent.canceled', {
    id: stripePaymentIntentId(),
    object: 'payment_intent',
    amount: randomAmount(),
    currency: 'brl',
    status: 'canceled',
    cancellation_reason: 'abandoned',
    customer: customerId,
  }),
  makeWebhook('payment_intent.requires_action', {
    id: stripePaymentIntentId(),
    object: 'payment_intent',
    amount: randomAmount(),
    currency: 'brl',
    status: 'requires_action',
    next_action: { type: 'use_stripe_sdk' },
    customer: stripeCustomerId(),
  }),
  makeWebhook('payment_intent.processing', {
    id: stripePaymentIntentId(),
    object: 'payment_intent',
    amount: randomAmount(),
    currency: 'brl',
    status: 'processing',
    customer: stripeCustomerId(),
  }),

  // charge events
  makeWebhook('charge.succeeded', {
    id: stripeChargeId(),
    object: 'charge',
    amount: randomAmount(),
    currency: 'brl',
    status: 'succeeded',
    paid: true,
    customer: customerId,
    description: 'Subscription payment',
  }),
  makeWebhook('charge.succeeded', {
    id: stripeChargeId(),
    object: 'charge',
    amount: randomAmount(),
    currency: 'usd',
    status: 'succeeded',
    paid: true,
    customer: stripeCustomerId(),
    description: 'One-time purchase',
  }),
  makeWebhook('charge.succeeded', {
    id: stripeChargeId(),
    object: 'charge',
    amount: randomAmount(),
    currency: 'brl',
    status: 'succeeded',
    paid: true,
    customer: stripeCustomerId(),
    description: 'Subscription payment',
  }),
  makeWebhook('charge.failed', {
    id: stripeChargeId(),
    object: 'charge',
    amount: randomAmount(),
    currency: 'brl',
    status: 'failed',
    paid: false,
    failure_code: 'card_declined',
    failure_message: 'Your card was declined.',
    customer: customerId,
  }),
  makeWebhook('charge.failed', {
    id: stripeChargeId(),
    object: 'charge',
    amount: randomAmount(),
    currency: 'usd',
    status: 'failed',
    paid: false,
    failure_code: 'insufficient_funds',
    failure_message: 'Insufficient funds.',
    customer: stripeCustomerId(),
  }),
  makeWebhook('charge.refunded', {
    id: stripeChargeId(),
    object: 'charge',
    amount: randomAmount(),
    currency: 'brl',
    amount_refunded: 4990,
    refunded: true,
    customer: customerId,
  }),
  makeWebhook('charge.refunded', {
    id: stripeChargeId(),
    object: 'charge',
    amount: randomAmount(),
    currency: 'usd',
    amount_refunded: 2990,
    refunded: true,
    customer: stripeCustomerId(),
  }),
  makeWebhook('charge.dispute.created', {
    id: `dp_${Math.random().toString(36).slice(2)}`,
    object: 'dispute',
    amount: randomAmount(),
    currency: 'brl',
    reason: 'fraudulent',
    status: 'needs_response',
    charge: stripeChargeId(),
  }),
  makeWebhook('charge.dispute.closed', {
    id: `dp_${Math.random().toString(36).slice(2)}`,
    object: 'dispute',
    amount: randomAmount(),
    currency: 'brl',
    reason: 'general',
    status: 'lost',
    charge: stripeChargeId(),
  }),

  // refund events
  makeWebhook('refund.created', {
    id: stripeRefundId(),
    object: 'refund',
    amount: 4990,
    currency: 'brl',
    status: 'succeeded',
    charge: stripeChargeId(),
    reason: 'requested_by_customer',
  }),
  makeWebhook('refund.created', {
    id: stripeRefundId(),
    object: 'refund',
    amount: 9990,
    currency: 'usd',
    status: 'succeeded',
    charge: stripeChargeId(),
    reason: 'duplicate',
  }),
  makeWebhook('refund.updated', {
    id: stripeRefundId(),
    object: 'refund',
    amount: 2990,
    currency: 'brl',
    status: 'pending',
    charge: stripeChargeId(),
  }),

  // customer events
  makeWebhook('customer.created', {
    id: customerId,
    object: 'customer',
    email: 'joao@example.com',
    name: 'João Silva',
    created: Math.floor(Date.now() / 1000),
  }),
  makeWebhook('customer.created', {
    id: stripeCustomerId(),
    object: 'customer',
    email: 'maria@example.com',
    name: 'Maria Souza',
    created: Math.floor(Date.now() / 1000),
  }),
  makeWebhook('customer.updated', {
    id: customerId,
    object: 'customer',
    email: 'joao@example.com',
    name: 'João Silva Updated',
    phone: '+5511999999999',
  }),
  makeWebhook('customer.deleted', {
    id: stripeCustomerId(),
    object: 'customer',
    email: 'deleted@example.com',
    deleted: true,
  }),
  makeWebhook('customer.subscription.created', {
    id: subscriptionId,
    object: 'subscription',
    customer: customerId,
    status: 'active',
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor(Date.now() / 1000) + 2592000,
    plan: { id: priceId, amount: 9990, currency: 'brl', interval: 'month' },
  }),
  makeWebhook('customer.subscription.updated', {
    id: subscriptionId,
    object: 'subscription',
    customer: customerId,
    status: 'active',
    cancel_at_period_end: false,
  }),
  makeWebhook('customer.subscription.updated', {
    id: stripeSubscriptionId(),
    object: 'subscription',
    customer: stripeCustomerId(),
    status: 'past_due',
    cancel_at_period_end: false,
  }),
  makeWebhook('customer.subscription.deleted', {
    id: stripeSubscriptionId(),
    object: 'subscription',
    customer: stripeCustomerId(),
    status: 'canceled',
    canceled_at: Math.floor(Date.now() / 1000),
  }),
  makeWebhook('customer.subscription.trial_will_end', {
    id: stripeSubscriptionId(),
    object: 'subscription',
    customer: stripeCustomerId(),
    status: 'trialing',
    trial_end: Math.floor(Date.now() / 1000) + 259200,
  }),
  makeWebhook('customer.subscription.paused', {
    id: stripeSubscriptionId(),
    object: 'subscription',
    customer: stripeCustomerId(),
    status: 'paused',
  }),
  makeWebhook('customer.subscription.resumed', {
    id: stripeSubscriptionId(),
    object: 'subscription',
    customer: stripeCustomerId(),
    status: 'active',
  }),

  // invoice events
  makeWebhook('invoice.created', {
    id: stripeInvoiceId(),
    object: 'invoice',
    customer: customerId,
    amount_due: 9990,
    currency: 'brl',
    status: 'draft',
    subscription: subscriptionId,
  }),
  makeWebhook('invoice.finalized', {
    id: stripeInvoiceId(),
    object: 'invoice',
    customer: customerId,
    amount_due: 9990,
    currency: 'brl',
    status: 'open',
    subscription: subscriptionId,
  }),
  makeWebhook('invoice.paid', {
    id: stripeInvoiceId(),
    object: 'invoice',
    customer: customerId,
    amount_paid: 9990,
    currency: 'brl',
    status: 'paid',
    subscription: subscriptionId,
  }),
  makeWebhook('invoice.paid', {
    id: stripeInvoiceId(),
    object: 'invoice',
    customer: stripeCustomerId(),
    amount_paid: 4990,
    currency: 'brl',
    status: 'paid',
    subscription: stripeSubscriptionId(),
  }),
  makeWebhook('invoice.paid', {
    id: stripeInvoiceId(),
    object: 'invoice',
    customer: stripeCustomerId(),
    amount_paid: 19990,
    currency: 'usd',
    status: 'paid',
    subscription: stripeSubscriptionId(),
  }),
  makeWebhook('invoice.payment_failed', {
    id: stripeInvoiceId(),
    object: 'invoice',
    customer: customerId,
    amount_due: 9990,
    currency: 'brl',
    status: 'open',
    attempt_count: 1,
    next_payment_attempt: Math.floor(Date.now() / 1000) + 86400,
    subscription: subscriptionId,
  }),
  makeWebhook('invoice.payment_failed', {
    id: stripeInvoiceId(),
    object: 'invoice',
    customer: stripeCustomerId(),
    amount_due: 4990,
    currency: 'brl',
    status: 'open',
    attempt_count: 2,
    next_payment_attempt: Math.floor(Date.now() / 1000) + 172800,
    subscription: stripeSubscriptionId(),
  }),
  makeWebhook('invoice.payment_action_required', {
    id: stripeInvoiceId(),
    object: 'invoice',
    customer: stripeCustomerId(),
    amount_due: 9990,
    currency: 'brl',
    status: 'open',
    subscription: stripeSubscriptionId(),
  }),
  makeWebhook('invoice.voided', {
    id: stripeInvoiceId(),
    object: 'invoice',
    customer: stripeCustomerId(),
    amount_due: 4990,
    currency: 'brl',
    status: 'void',
  }),
  makeWebhook('invoice.upcoming', {
    id: stripeInvoiceId(),
    object: 'invoice',
    customer: customerId,
    amount_due: 9990,
    currency: 'brl',
    status: 'draft',
    next_payment_attempt: Math.floor(Date.now() / 1000) + 604800,
    subscription: subscriptionId,
  }),

  // product & price events
  makeWebhook('product.created', {
    id: productId,
    object: 'product',
    name: 'Plano Pro',
    active: true,
    description: 'Acesso completo à plataforma',
  }),
  makeWebhook('product.updated', {
    id: productId,
    object: 'product',
    name: 'Plano Pro',
    active: true,
    description: 'Acesso completo à plataforma - atualizado',
  }),
  makeWebhook('price.created', {
    id: priceId,
    object: 'price',
    product: productId,
    unit_amount: 9990,
    currency: 'brl',
    recurring: { interval: 'month', interval_count: 1 },
    active: true,
  }),
  makeWebhook('price.updated', {
    id: priceId,
    object: 'price',
    product: productId,
    unit_amount: 9990,
    currency: 'brl',
    active: false,
  }),

  // checkout events
  makeWebhook('checkout.session.completed', {
    id: `cs_${Math.random().toString(36).slice(2)}`,
    object: 'checkout.session',
    customer: customerId,
    payment_status: 'paid',
    mode: 'subscription',
    subscription: subscriptionId,
    amount_total: 9990,
    currency: 'brl',
  }),
  makeWebhook('checkout.session.completed', {
    id: `cs_${Math.random().toString(36).slice(2)}`,
    object: 'checkout.session',
    customer: stripeCustomerId(),
    payment_status: 'paid',
    mode: 'payment',
    amount_total: 4990,
    currency: 'brl',
  }),
  makeWebhook('checkout.session.completed', {
    id: `cs_${Math.random().toString(36).slice(2)}`,
    object: 'checkout.session',
    customer: stripeCustomerId(),
    payment_status: 'paid',
    mode: 'subscription',
    subscription: stripeSubscriptionId(),
    amount_total: 19990,
    currency: 'usd',
  }),
  makeWebhook('checkout.session.expired', {
    id: `cs_${Math.random().toString(36).slice(2)}`,
    object: 'checkout.session',
    customer: stripeCustomerId(),
    payment_status: 'unpaid',
    mode: 'payment',
    amount_total: 9990,
    currency: 'brl',
  }),
  makeWebhook('checkout.session.async_payment_succeeded', {
    id: `cs_${Math.random().toString(36).slice(2)}`,
    object: 'checkout.session',
    customer: stripeCustomerId(),
    payment_status: 'paid',
    mode: 'payment',
    amount_total: 14990,
    currency: 'brl',
  }),
  makeWebhook('checkout.session.async_payment_failed', {
    id: `cs_${Math.random().toString(36).slice(2)}`,
    object: 'checkout.session',
    customer: stripeCustomerId(),
    payment_status: 'unpaid',
    mode: 'payment',
    amount_total: 9990,
    currency: 'brl',
  }),

  // payment method events
  makeWebhook('payment_method.attached', {
    id: `pm_${Math.random().toString(36).slice(2)}`,
    object: 'payment_method',
    type: 'card',
    card: { brand: 'visa', last4: '4242', exp_month: 12, exp_year: 2027 },
    customer: customerId,
  }),
  makeWebhook('payment_method.attached', {
    id: `pm_${Math.random().toString(36).slice(2)}`,
    object: 'payment_method',
    type: 'card',
    card: { brand: 'mastercard', last4: '5555', exp_month: 8, exp_year: 2026 },
    customer: stripeCustomerId(),
  }),
  makeWebhook('payment_method.detached', {
    id: `pm_${Math.random().toString(36).slice(2)}`,
    object: 'payment_method',
    type: 'card',
    card: { brand: 'visa', last4: '0002', exp_month: 3, exp_year: 2025 },
    customer: null,
  }),
  makeWebhook('payment_method.updated', {
    id: `pm_${Math.random().toString(36).slice(2)}`,
    object: 'payment_method',
    type: 'card',
    card: { brand: 'amex', last4: '0005', exp_month: 6, exp_year: 2028 },
    customer: stripeCustomerId(),
  }),

  // failed/error responses (400)
  makeWebhook(
    'payment_intent.payment_failed',
    {
      id: stripePaymentIntentId(),
      object: 'payment_intent',
      amount: randomAmount(),
      currency: 'brl',
      status: 'requires_payment_method',
      last_payment_error: { code: 'do_not_honor', message: 'Do not honor.' },
      customer: stripeCustomerId(),
    },
    400
  ),
  makeWebhook(
    'invoice.payment_failed',
    {
      id: stripeInvoiceId(),
      object: 'invoice',
      customer: stripeCustomerId(),
      amount_due: 9990,
      currency: 'brl',
      status: 'open',
      attempt_count: 3,
      subscription: stripeSubscriptionId(),
    },
    400
  ),
  makeWebhook(
    'charge.failed',
    {
      id: stripeChargeId(),
      object: 'charge',
      amount: randomAmount(),
      currency: 'brl',
      status: 'failed',
      paid: false,
      failure_code: 'fraudulent',
      failure_message: 'Transaction blocked for suspected fraud.',
      customer: stripeCustomerId(),
    },
    500
  ),
];

async function seed() {
  console.log('Seeding webhooks...');
  await drizzleDb.insert(webhooks).values(seedWebhooks);
  console.log(`Inserted ${seedWebhooks.length} webhooks.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
