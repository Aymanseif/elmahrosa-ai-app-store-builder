const express = require("express");
const router = express.Router();
const auditController = require("../controllers/auditController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { auditCreateSchema, formatZodError } = require("../lib/validation");

// Protect all routes in this router
router.use(authenticateToken);

// Create a new audit for a project
router.post("/", (req, res, next) => {
  const parsed = auditCreateSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json(formatZodError(parsed.error));
  }
  next();
}, auditController.createAudit);

// Get audits for a project
router.get("/project/:projectId", auditController.getAudits);

// Get an audit by ID
router.get("/:id", auditController.getAuditById);

module.exports = router;