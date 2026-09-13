const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const { getStripe } = require("../lib/stripe");

// This router is mounted in index.js BEFORE app.use(express.json()) so the
// raw request body is available for Stripe signature verification (fixes
// finding C-6b: app-level JSON parsing ran first and constructEvent always
// failed on the already-parsed object).

// Webhook route for Stripe events (must be publicly reachable)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = getStripe().webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    const data = event.data.object;

    try {
      switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          await subscriptionController.applyWebhookEvent(
            data.id,
            data.status ||
              (event.type === "customer.subscription.deleted"
                ? "canceled"
                : undefined),
            data.current_period_end
          );
          break;
        case "invoice.payment_succeeded":
        case "invoice.payment_failed":
          // The invoice object has no subscription status; fetch the current
          // state from Stripe so the DB stays in sync.
          if (typeof data.subscription === "string") {
            const sub = await getStripe().subscriptions.retrieve(
              data.subscription
            );
            await subscriptionController.applyWebhookEvent(
              sub.id,
              sub.status,
              sub.current_period_end
            );
          }
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
        // Unhandled events are acknowledged 200 without crash (finding C-6).
      }
    } catch (err) {
      console.error(`Error processing webhook event ${event.type}:`, err);
      // Stripe will retry on non-2xx; that's desirable here since the
      // failure is on our side, not a bad payload.
      return res.status(500).json({ error: "Webhook processing failed" });
    }

    // Return a response to Stripe to acknowledge receipt of the event
    res.json({ received: true });
  }
);

module.exports = router;