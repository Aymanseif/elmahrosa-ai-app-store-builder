const prisma = require("../prisma/client");

// Create a new audit
const createAudit = async (req, res) => {
  try {
    const { projectId, score, report } = req.body;

    // Verify that the project belongs to the authenticated user
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.userId !== req.dbUser.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const audit = await prisma.audit.create({
      data: {
        projectId,
        score,
        report,
      },
    });

    // If the audit is created, increment the auditCount of the project
    await prisma.project.update({
      where: { id: projectId },
      data: {
        auditCount: {
          increment: 1,
        },
      },
    });

    res.status(201).json(audit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get audits for a project
const getAudits = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify that the project belongs to the authenticated user
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { user: true },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.userId !== req.dbUser.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const audits = await prisma.audit.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    res.json(audits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get an audit by ID
const getAuditById = async (req, res) => {
  try {
    const { id } = req.params;

    const audit = await prisma.audit.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!audit) {
      return res.status(404).json({ error: "Audit not found" });
    }

    // Verify that the project belongs to the authenticated user
    if (audit.project.userId !== req.dbUser.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(audit);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createAudit,
  getAudits,
  getAuditById,
};