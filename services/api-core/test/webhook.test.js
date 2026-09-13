const { test } = require("node:test");
const assert = require("node:assert");
const express = require("express");

process.env.STRIPE_SECRET_KEY = "sk_test_placeholder";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_placeholder";

const stripeWebhookRouter = require("../src/routes/stripeWebhook");
const { getStripe } = require("../src/lib/stripe");

function makeApp() {
  const app = express();
  app.use("/api/subscriptions", stripeWebhookRouter);
  return app;
}

async function postWebhook(app, port, payload, signature) {
  const server = app.listen(port);
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/subscriptions/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Stripe-Signature": signature,
      },
      body: payload,
    });
    const text = await res.text();
    let body = null;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    return { status: res.status, body };
  } finally {
    server.close();
  }
}

test("signed webhook payload verifies and is acknowledged 200", async () => {
  const payload = JSON.stringify({
    id: "evt_test_1",
    type: "customer.subscription.created",
    data: { object: {} }, // no id -> applyWebhookEvent no-ops
  });
  const signature = await getStripe().webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET,
  });
  const res = await postWebhook(makeApp(), 3777, payload, signature);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { received: true });
});

test("webhook with invalid signature is rejected 400", async () => {
  const payload = JSON.stringify({
    id: "evt_test_2",
    type: "customer.subscription.created",
    data: { object: {} },
  });
  const res = await postWebhook(makeApp(), 3778, payload, "t=1,v1=deadbeef");
  assert.strictEqual(res.status, 400);
  assert.match(String(res.body), /Webhook Error/);
});

test("unhandled event types are acknowledged 200 without crash", async () => {
  const payload = JSON.stringify({
    id: "evt_test_3",
    type: "some.unknown.event",
    data: { object: {} },
  });
  const signature = await getStripe().webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET,
  });
  const res = await postWebhook(makeApp(), 3779, payload, signature);
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(res.body, { received: true });
});

test("getStripe throws without STRIPE_SECRET_KEY", () => {
  delete process.env.STRIPE_SECRET_KEY;
  // Clear the cached client so the lazy init is exercised.
  const fresh = require("../src/lib/stripe");
  const mod = require.cache[require.resolve("../src/lib/stripe")];
  mod.exports = fresh;
  assert.throws(() => getStripe(), /STRIPE_SECRET_KEY is not configured/);
});