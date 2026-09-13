const express = require("express");
const router = express.Router();
const { getUserByClerkId, createUser } = require("../controllers/authController");

// Get user by Clerk ID
router.get("/user/:clerkId", async (req, res) => {
  try {
    const user = await getUserByClerkId(req.params.clerkId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user (if not exists)
router.post("/user", async (req, res) => {
  try {
    const { clerkId, email, name, image } = req.body;
    let user = await getUserByClerkId(clerkId);
    if (!user) {
      user = await createUser({ clerkId, email, name, image });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
