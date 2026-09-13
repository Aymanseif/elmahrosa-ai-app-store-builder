const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRouter = require("./routes/auth");
const projectRouter = require("./routes/project");
const subscriptionRouter = require("./routes/subscription");
const buildRouter = require("./routes/build");
const auditRouter = require("./routes/audit");
const stripeWebhookRouter = require("./routes/stripeWebhook");

const app = express();
const PORT = process.env.PORT || 3000;

// Fail fast at boot when required configuration is missing. FIX (finding H-7,
// milestone 1.2): previously the API booted without CLERK_ISSUER_URL or
// DATABASE_URL and only failed with per-request 500s, making a
// misconfiguration look like a runtime outage. STRIPE_SECRET_KEY is
// intentionally optional (Stripe functionality degrades gracefully via lazy
// init in src/lib/stripe.js).
const REQUIRED_ENV = ["CLERK_ISSUER_URL", "DATABASE_URL"];
const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}. ` +
      "The API cannot start without them."
  );
}

app.use(helmet());

// Simple CORS: no cross-origin requests unless ALLOWED_ORIGIN is set.
app.use((req, res, next) => {
  const origin = process.env.ALLOWED_ORIGIN;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Basic per-IP rate limiting for the whole API surface.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// The Stripe webhook MUST be mounted before app.use(express.json()) so the
// raw body is available for signature verification. (FIX: finding C-6b —
// the webhook previously lived behind the JSON parser and constructEvent
// always failed.)
app.use("/api/subscriptions", stripeWebhookRouter);

app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/builds", buildRouter);
app.use("/api/audits", auditRouter);

// Liveness endpoint for compose healthchecks and load balancer checks
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/", (req, res) => {
  res.json({ message: "API Core is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});