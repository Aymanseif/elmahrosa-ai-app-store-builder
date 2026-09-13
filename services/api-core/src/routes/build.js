const express = require("express");
const router = express.Router();
const buildController = require("../controllers/buildController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Protect the build routes
router.use(authenticateToken);

// Create a new build for a project
router.post("/", buildController.createBuild);

// Get builds for a project
router.get("/project/:projectId", buildController.getBuilds);

// Get a build by ID
router.get("/:id", buildController.getBuildById);

// Update a build (e.g., update status and artifactUrl)
router.patch("/:id", buildController.updateBuild);

module.exports = router;