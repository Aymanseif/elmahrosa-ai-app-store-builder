// Lazily initialized Stripe client. FIX (finding C-6c): the client was
// constructed at module load time (`require("stripe")(process.env...)`),
// which threw on boot when STRIPE_SECRET_KEY was unset — making the entire
// API unstartable without Stripe credentials. Construction now happens on
// first use, inside the request path that actually needs it.
let stripeClient = null;

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured; Stripe functionality is unavailable"
    );
  }
  if (!stripeClient) {
    stripeClient = require("stripe")(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

module.exports = { getStripe };