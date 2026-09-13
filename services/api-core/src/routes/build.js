const express = require("express");
const router = express.Router();
const buildController = require("../controllers/buildController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Protect the build routes
router.use(authenticateToken);

// Create a new build for a project
router.post("/", (req, res, next) => {
  const { projectId } = req.body || {};
  if (typeof projectId !== "string" || projectId.trim().length === 0) {
    return res.status(400).json({ error: "projectId is required" });
  }
  next();
}, buildController.createBuild);

// Get builds for a project
router.get("/project/:projectId", buildController.getBuilds);

// Get a build by ID
router.get("/:id", buildController.getBuildById);

// Update a build (e.g., update status and artifactUrl)
router.patch("/:id", buildController.updateBuild);

module.exports = router;