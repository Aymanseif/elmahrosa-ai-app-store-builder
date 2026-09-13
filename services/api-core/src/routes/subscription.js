const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const { authenticateToken } = require("../middleware/authMiddleware");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Protect the subscription routes (except webhook)
router.use(authenticateToken);

// Create a subscription
router.post("/", subscriptionController.createSubscription);

// Get the user's subscription
router.get("/", subscriptionController.getSubscription);

// Update a subscription
router.patch("/:id", subscriptionController.updateSubscription);

// Webhook route for Stripe events
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  let subscription;
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      subscription = event.data.object;
      break;
    case "customer.subscription.deleted":
      subscription = event.data.object;
      // For deleted subscription, we might want to mark it as canceled
      break;
    case "invoice.payment_succeeded":
    case "invoice.payment_failed":
      subscription = event.data.object.subscription;
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  if (subscription) {
    try {
      // Update our subscription record
      await subscriptionController.updateSubscription(null, {
        params: { id: subscription.id },
        body: {
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null,
        },
      });
    } catch (err) {
      console.error(`Error updating subscription from webhook:`, err);
      // We still return 200 to Stripe to avoid retries
    }
  }

  // Return a response to Stripe to acknowledge receipt of the event
  res.json({ received: true });
});

module.exports = router;