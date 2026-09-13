const { z } = require("zod");

// Milestone 1.1: single validation layer on zod. Malformed payloads return
// 400 with structured errors from these schemas — never a Prisma 500.

const projectIdSchema = z
  .string()
  .min(1, "projectId is required")
  .max(64, "projectId is too long");

const projectCreateSchema = z.object({
  name: z.string().trim().min(1, "name is required").max(100, "name must be at most 100 characters"),
  description: z.string().max(500, "description must be at most 500 characters").optional(),
});

const auditCreateSchema = z.object({
  projectId: projectIdSchema,
  score: z
    .number()
    .int("score must be an integer")
    .min(0, "score must be between 0 and 100")
    .max(100, "score must be between 0 and 100"),
  report: z
    .record(z.unknown())
    .refine((value) => JSON.stringify(value).length <= 64 * 1024, {
      message: "report exceeds the 64KB size cap",
    }),
});

const paginationSchema = z.object({
  limit: z.coerce
    .number()
    .int("limit must be an integer")
    .min(1, "limit must be at least 1")
    .max(100, "limit must be at most 100")
    .default(20),
  offset: z.coerce
    .number()
    .int("offset must be an integer")
    .min(0, "offset must be at least 0")
    .default(0),
});

const buildStatusSchema = z.enum(["PENDING", "BUILDING", "SUCCESS", "FAILED", "CANCELED"]);

const buildUpdateSchema = z.object({
  status: buildStatusSchema.optional(),
  artifactUrl: z.string().url("artifactUrl must be a valid URL").optional(),
});

const stripePriceSchema = z
  .string()
  .regex(/^price_[A-Za-z0-9]+$/, "priceId must be a Stripe price ID");

// Formats a ZodError into a structured 400 payload.
function formatZodError(error) {
  return {
    error: "Validation failed",
    details: error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  };
}

module.exports = {
  z,
  projectIdSchema,
  projectCreateSchema,
  auditCreateSchema,
  paginationSchema,
  buildStatusSchema,
  buildUpdateSchema,
  stripePriceSchema,
  formatZodError,
};