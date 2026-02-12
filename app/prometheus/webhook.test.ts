// @ts-nocheck
import * as webhook from './webhook.js';

test('webhook counter should be properly configured', async () => {
  webhook.init();
  const counter = webhook.getWebhookCounter();
  expect(counter.name).toStrictEqual('dd_webhook_total');
  expect(counter.labelNames).toStrictEqual(['action']);
});

test('webhook init should replace existing counter when called twice', async () => {
  webhook.init();
  const first = webhook.getWebhookCounter();
  webhook.init();
  const second = webhook.getWebhookCounter();
  expect(second.name).toStrictEqual('dd_webhook_total');
  expect(second).not.toBe(first);
});

test('getWebhookCounter should return undefined before init', async () => {
  vi.resetModules();
  const fresh = await import('./webhook.js');
  expect(fresh.getWebhookCounter()).toBeUndefined();
});
