# Requires next.config.js to set `output: 'standalone'` for the final
# COPY steps below to have something to copy — see the accompanying
# next.config.js fix. Built from the repo root so pnpm installs from the
# committed workspace pnpm-lock.yaml (--frozen-lockfile) instead of a bare
# `npm install` with floating versions:
#   docker build -f apps/web-app/Dockerfile .

FROM node:20-slim AS build
RUN corepack enable
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter web-app build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/apps/web-app/public ./public
COPY --from=build /app/apps/web-app/.next/standalone ./
COPY --from=build /app/apps/web-app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
