const prisma = require("../prisma/client");

// Create a new build
const createBuild = async (req, res) => {
  try {
    const { projectId } = req.body;

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

    const build = await prisma.build.create({
      data: {
        projectId,
        status: "pending", // Default status
      },
    });

    res.status(201).json(build);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get builds for a project
const getBuilds = async (req, res) => {
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

    const builds = await prisma.build.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    res.json(builds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a build by ID
const getBuildById = async (req, res) => {
  try {
    const { id } = req.params;

    const build = await prisma.build.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!build) {
      return res.status(404).json({ error: "Build not found" });
    }

    // Verify that the project belongs to the authenticated user
    if (build.project.userId !== req.dbUser.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(build);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a build (e.g., update status and artifactUrl)
const updateBuild = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, artifactUrl } = req.body;

    const build = await prisma.build.findUnique({ where: { id } });

    if (!build) {
      return res.status(404).json({ error: "Build not found" });
    }

    // Verify that the project belongs to the authenticated user
    const project = await prisma.project.findUnique({
      where: { id: build.projectId },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.userId !== req.dbUser.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updated = await prisma.build.update({
      where: { id },
      data: {
        status,
        artifactUrl,
      },
    });

    // If the build is completed (success or failed), increment the buildCount of the project
    if (status === "success" || status === "failed") {
      await prisma.project.update({
        where: { id: build.projectId },
        data: {
          buildCount: {
            increment: 1,
          },
        },
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBuild,
  getBuilds,
  getBuildById,
  updateBuild,
};