const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const { authenticateToken } = require("../middleware/authMiddleware");

// NOTE: the Stripe webhook handler lives in src/routes/stripeWebhook.js and
// is mounted in index.js BEFORE app.use(express.json()) — raw-body signature
// verification cannot work through the app-level JSON parser.


// Protect all subscription routes
router.use(authenticateToken);

// Create a subscription
router.post("/", subscriptionController.createSubscription);

// Get the user's subscription
router.get("/", subscriptionController.getSubscription);

// Update a subscription
router.patch("/:id", subscriptionController.updateSubscription);

module.exports = router;
