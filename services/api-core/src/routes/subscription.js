const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const { authenticateToken } = require("../middleware/authMiddleware");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Webhook route for Stripe events (must be publicly reachable)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
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

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await subscriptionController.applyWebhookEvent(
          data.id,
          data.status ||
            (event.type === "customer.subscription.deleted" ? "canceled" : undefined),
          data.current_period_end
        );
        break;
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
        if (typeof data.subscription === "string") {
          await subscriptionController.applyWebhookEvent(
            data.subscription,
            data.subscription_status
          );
        }
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to Stripe to acknowledge receipt of the event
    res.json({ received: true });
  }
);

// Protect all other subscription routes
router.use(authenticateToken);

// Create a subscription
router.post("/", subscriptionController.createSubscription);

// Get the user's subscription
router.get("/", subscriptionController.getSubscription);

// Update a subscription
router.patch("/:id", subscriptionController.updateSubscription);

module.exports = router;