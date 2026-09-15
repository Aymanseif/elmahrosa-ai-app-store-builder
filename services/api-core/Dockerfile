# Built from the repo root so pnpm can install from the committed workspace
# pnpm-lock.yaml (--frozen-lockfile) instead of a bare `npm install` that
# resolves floating versions on every build. Build context is the repo root:
#   docker build -f services/api-core/Dockerfile .
# Prisma is a runtime dependency (the CMD runs `migrate deploy` on boot), so it
# survives `pnpm prune --prod`.

FROM node:20-slim AS build
# openssl is required for Prisma to detect the runtime libssl version; without
# it the engine falls back to "openssl-1.1.x" and `migrate deploy` tries to
# download the wrong engine binary at container start (fails in ECS/SG-locked
# networks). Install it exactly as Prisma's own error instructs.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile
# The generated client is committed under node_modules by pnpm; regenerate to
# be safe, then prune devDependencies workspace-wide for a lean runtime.
RUN cd services/api-core && pnpm exec prisma generate && cd /app && pnpm prune --prod

FROM node:20-slim AS runtime
# Same openssl requirement as the build stage: the runtime engine must detect
# the same libssl as the one the engine binary was built for, otherwise
# prisma migrate deploy downloads a binary at boot.
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app /app

# Milestone 1.5: run pending migrations on container start, then boot. The
# DATABASE_URL is provided by the compose environment. npx resolves the local
# .bin shim that pnpm left inside services/api-core.
CMD ["sh", "-c", "cd services/api-core && npx prisma migrate deploy && node src/index.js"]

EXPOSE 3000
