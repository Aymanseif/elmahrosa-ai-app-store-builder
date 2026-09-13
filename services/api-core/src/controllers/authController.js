const prisma = require("../prisma/client");

// Auth controller (simplified, in real app use Clerk)
const getUserByClerkId = async (clerkId) => {
  return await prisma.user.findUnique({ where: { clerkId } });
};

const createUser = async (data) => {
  return await prisma.user.create({ data });
};

module.exports = { getUserByClerkId, createUser };