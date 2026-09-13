const express = require("express");
const router = express.Router();
const buildController = require("../controllers/buildController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { projectIdSchema, buildUpdateSchema, formatZodError } = require("../lib/validation");

// Protect the build routes
router.use(authenticateToken);

// Create a new build for a project
router.post("/", (req, res, next) => {
  const parsed = projectIdSchema.safeParse((req.body || {}).projectId);
  if (!parsed.success) {
    return res.status(400).json(formatZodError(parsed.error));
  }
  next();
}, buildController.createBuild);

// Get builds for a project
router.get("/project/:projectId", buildController.getBuilds);

// Get a build by ID
router.get("/:id", buildController.getBuildById);

// Update a build (e.g., update status and artifactUrl)
router.patch("/:id", (req, res, next) => {
  const parsed = buildUpdateSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json(formatZodError(parsed.error));
  }
  next();
}, buildController.updateBuild);

module.exports = router;