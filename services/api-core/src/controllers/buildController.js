const prisma = require("../prisma/client");

// Mirrors the BuildStatus enum in prisma/schema.prisma (uppercase values).
const BUILD_STATUSES = ["PENDING", "BUILDING", "SUCCESS", "FAILED", "CANCELED"];

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
        // FIX: the DB stores BuildStatus as an uppercase enum (PENDING,
        // BUILDING, ...). Writing lowercase "pending" made Prisma reject the
        // create with an enum-parse error, so build creation always 500'd.
        status: "PENDING",
      },
    });

    res.status(201).json(build);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
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
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
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
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update a build (e.g., update status and artifactUrl)
const updateBuild = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, artifactUrl } = req.body;

    // FIX: status was previously taken from the body unvalidated and compared
    // against lowercase "success"/"failed" that could never match the
    // uppercase enum. Whitelist against the DB enum values and reject
    // anything else with a 400 instead of a Prisma 500.
    if (status !== undefined && !BUILD_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ error: `status must be one of: ${BUILD_STATUSES.join(", ")}` });
    }

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

    // If the build completed, increment the buildCount of the project
    if (status === "SUCCESS" || status === "FAILED") {
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
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createBuild,
  getBuilds,
  getBuildById,
  updateBuild,
};