const express = require("express");
const router = express.Router();
const auditController = require("../controllers/auditController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Protect the audit routes
router.use(authenticateToken);

// Create a new audit for a project
router.post("/", (req, res, next) => {
  const { projectId, score, report } = req.body || {};
  if (typeof projectId !== "string" || projectId.trim().length === 0) {
    return res.status(400).json({ error: "projectId is required" });
  }
  if (!Number.isInteger(score) || score < 0 || score > 100) {
    return res.status(400).json({ error: "score must be an integer between 0 and 100" });
  }
  if (typeof report !== "object" || report === null || Array.isArray(report)) {
    return res.status(400).json({ error: "report must be a JSON object" });
  }
  next();
}, auditController.createAudit);

// Get audits for a project
router.get("/project/:projectId", auditController.getAudits);

// Get an audit by ID
router.get("/:id", auditController.getAuditById);

module.exports = router;