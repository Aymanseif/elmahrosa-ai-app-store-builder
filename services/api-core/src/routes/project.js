const express = require("express");
const router = express.Router();
const prisma = require("../prisma/client");
const { authenticateToken } = require("../middleware/authMiddleware");

// Protect all routes in this router
router.use(authenticateToken);

// Get all projects for the authenticated user
router.get("/user/:userId", async (req, res) => {
  try {
    // Ignore the userId in the URL and use the authenticated user's id
    const userId = req.dbUser.id;
    const projects = await prisma.project.findMany({ where: { userId } });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new project for the authenticated user
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.dbUser.id;

    // Get the user's subscription to determine the plan
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: "active" },
      orderBy: { createdAt: "desc" },
    });

    // Determine the plan; default to free if no active subscription
    // (DB stores the plan as an uppercase enum, e.g. "PRO")
    const plan = (subscription ? subscription.plan : "free").toLowerCase();
    if (!["free", "pro", "enterprise"].includes(plan)) {
      return res.status(403).json({ error: "Unknown subscription plan" });
    }

    // Define project limits per plan
    const limits = {
      free: 1,
      pro: 5,
      enterprise: Number.MAX_SAFE_INTEGER, // effectively unlimited
    };

    const limit = limits[plan] || limits.free;

    // Count the user's existing projects
    const projectCount = await prisma.project.count({ where: { userId } });

    if (projectCount >= limit) {
      return res.status(403).json({
        error: `Project limit exceeded for ${plan} plan. You can have at most ${limit} projects.`,
      });
    }

    const project = await prisma.project.create({
      data: { name, description, userId },
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project by ID for the authenticated user
router.get("/:id", async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Ensure the project belongs to the authenticated user
    if (project.userId !== req.dbUser.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project for the authenticated user
router.put("/:id", async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const existing = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Ensure the project belongs to the authenticated user
    if (existing.userId !== req.dbUser.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description, status },
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project for the authenticated user
router.delete("/:id", async (req, res) => {
  try {
    const existing = await prisma.project.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Ensure the project belongs to the authenticated user
    if (existing.userId !== req.dbUser.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    await prisma.project.delete({ where: { id: req.params.id } });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;