const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRouter = require("./routes/auth");
const projectRouter = require("./routes/project");
const subscriptionRouter = require("./routes/subscription");
const buildRouter = require("./routes/build");
const auditRouter = require("./routes/audit");

const app = express();
const PORT = process.env.PORT || 3000;

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

app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/builds", buildRouter);
app.use("/api/audits", auditRouter);

app.get("/", (req, res) => {
  res.json({ message: "API Core is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});