const prisma = require("../prisma/client");
const { getStripe } = require("../lib/stripe");
const { stripePriceSchema, formatZodError } = require("../lib/validation");

// Prisma eats uppercase enum values; map Stripe/lowercase spellings in.
const PLAN_MAP = {
  free: "FREE",
  pro: "PRO",
  enterprise: "ENTERPRISE",
};

const STATUS_MAP = {
  active: "ACTIVE",
  canceled: "CANCELED",
  past_due: "PAST_DUE",
  trialing: "TRIALING",
  unpaid: "UNPAID",
};

// Create a subscription for the user
const createSubscription = async (req, res) => {
  try {
    const userId = req.dbUser.id;
    const { priceId, plan = "pro" } = req.body; // Expecting a Stripe price ID

    // Input validation
    const parsedPrice = stripePriceSchema.safeParse(priceId);
    if (!parsedPrice.success) {
      return res.status(400).json(formatZodError(parsedPrice.error));
    }

    const planEnum = PLAN_MAP[String(plan).toLowerCase()];
    if (!planEnum) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    // Get or create a Stripe customer for the user
    let customerId = req.dbUser.stripeCustomerId;
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: req.dbUser.email,
        metadata: {
          userId: req.dbUser.id,
        },
      });
      customerId = customer.id;
      // Update the user in our database with the stripeCustomerId
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Check if the user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
    });

    if (existingSubscription) {
      return res.status(400).json({ error: "User already has an active subscription" });
    }

    // Create the subscription in Stripe
    const stripeSubscription = await getStripe().subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ["latest_invoice.payment_intent"],
    });

    // Save the subscription to our database
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        stripeId: stripeSubscription.id,
        plan: planEnum,
        status: STATUS_MAP[stripeSubscription.status] || "ACTIVE",
        currentPeriodEnd: stripeSubscription.current_period_end
          ? new Date(stripeSubscription.current_period_end * 1000)
          : null,
      },
    });

    res.status(201).json(subscription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get the subscription for the authenticated user
const getSubscription = async (req, res) => {
  try {
    const userId = req.dbUser.id;
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    res.json(subscription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update subscription (user-initiated).
// SECURITY: only cancellation is allowed from the client. If users could set
// an arbitrary status (e.g. "ACTIVE") they would self-upgrade and bypass the
// plan-limit checks in project.js without ever paying. Every other status
// transition comes from Stripe via the webhook handler.
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (status && String(status).toLowerCase() !== "canceled") {
      return res.status(400).json({
        error:
          "Only cancellation is supported; subscription status changes are applied from Stripe webhooks",
      });
    }

    const subscription = await prisma.subscription.findUnique({ where: { id } });

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    // Ensure the subscription belongs to the authenticated user
    if (subscription.userId !== req.dbUser.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        status: "CANCELED",
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Apply a Stripe webhook event to our subscription record by Stripe subscription id
const applyWebhookEvent = async (stripeId, status, currentPeriodEnd) => {
  if (!stripeId) return;

  const subscription = await prisma.subscription.findUnique({
    where: { stripeId },
  });

  if (!subscription) return;

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: STATUS_MAP[String(status).toLowerCase()] || subscription.status,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd)
        : subscription.currentPeriodEnd,
    },
  });
};

module.exports = {
  createSubscription,
  getSubscription,
  updateSubscription,
  applyWebhookEvent,
};