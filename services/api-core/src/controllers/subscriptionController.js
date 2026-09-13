const prisma = require("../prisma/client");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create a subscription for the user
const createSubscription = async (req, res) => {
  try {
    const userId = req.dbUser.id;
    const { priceId } = req.body; // Expecting a Stripe price ID

    // Get or create a Stripe customer for the user
    let customerId = req.dbUser.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
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
      where: { userId, status: "active" },
    });

    if (existingSubscription) {
      return res.status(400).json({ error: "User already has an active subscription" });
    }

    // Create the subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ["latest_invoice.payment_intent"],
    });

    // Save the subscription to our database
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        stripeId: stripeSubscription.id,
        plan: priceId, // We're storing the price ID as the plan for simplicity
        status: stripeSubscription.status,
        currentPeriodEnd: stripeSubscription.current_period_end
          ? new Date(stripeSubscription.current_period_end * 1000)
          : null,
      },
    });

    res.status(201).json(subscription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
};

// Update subscription (e.g., from webhook or user request)
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, currentPeriodEnd } = req.body;

    const subscription = await prisma.subscription.update({
      where: { id },
      data: {
        status,
        currentPeriodEnd: currentPeriodEnd
          ? new Date(currentPeriodEnd)
          : null,
      },
    });

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSubscription,
  getSubscription,
  updateSubscription,
};