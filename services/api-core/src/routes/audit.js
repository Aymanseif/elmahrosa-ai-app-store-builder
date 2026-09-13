const express = require("express");
const router = express.Router();
const auditController = require("../controllers/auditController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Protect the audit routes
router.use(authenticateToken);

// Create a new audit for a project
router.post("/", auditController.createAudit);

// Get audits for a project
router.get("/project/:projectId", auditController.getAudits);

// Get an audit by ID
router.get("/:id", auditController.getAuditById);

module.exports = router;