const express = require("express");
const router = express.Router();
const { getUserByClerkId, createUser } = require("../controllers/authController");
const { authenticateToken, requireValidToken } = require("../middleware/authMiddleware");

// Protect all routes in this router. FIX: the user lookup/creation endpoints
// were previously unauthenticated, letting any caller fetch or create an
// arbitrary user by Clerk ID.
router.use(authenticateToken);

// Get user by Clerk ID
router.get("/user/:clerkId", async (req, res) => {
  try {
    // Ignore the clerkId in the URL and use the authenticated user's id —
    // a valid token for user A must never read user B's record.
    const user = await getUserByClerkId(req.dbUser.clerkId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create user (if not exists). authenticateToken's DB check would 404 for a
// brand-new user, so this route uses token verification only and upserts the
// authenticated user's own record: the clerkId always comes from the verified
// token's `sub` claim, never from the request body.
router.post("/user", requireValidToken, async (req, res) => {
  try {
    const { sub } = req.user;
    const { email, name, image } = req.body || {};
    let user = await getUserByClerkId(sub);
    if (!user) {
      user = await createUser({ clerkId: sub, email, name, image });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
