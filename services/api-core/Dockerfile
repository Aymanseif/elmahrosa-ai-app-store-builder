# Built from the repo root so pnpm can install from the committed workspace
# pnpm-lock.yaml (--frozen-lockfile) instead of a bare `npm install` that
# resolves floating versions on every build. Build context is the repo root:
#   docker build -f services/api-core/Dockerfile .
# Prisma is a runtime dependency (the CMD runs `migrate deploy` on boot), so it
# survives `pnpm prune --prod`.

FROM node:20-slim AS build
RUN corepack enable
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile
# The generated client is committed under node_modules by pnpm; regenerate to
# be safe, then prune devDependencies workspace-wide for a lean runtime.
RUN cd services/api-core && pnpm exec prisma generate && cd /app && pnpm prune --prod

FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app /app

# Milestone 1.5: run pending migrations on container start, then boot. The
# DATABASE_URL is provided by the compose environment. npx resolves the local
# .bin shim that pnpm left inside services/api-core.
CMD ["sh", "-c", "cd services/api-core && npx prisma migrate deploy && node src/index.js"]

EXPOSE 3000
