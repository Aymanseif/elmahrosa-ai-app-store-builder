# Requires next.config.js to set `output: 'standalone'` for the final
# COPY steps below to have something to copy — see the accompanying
# next.config.js fix. Built from the repo root so pnpm installs from the
# committed workspace pnpm-lock.yaml (--frozen-lockfile) instead of a bare
# `npm install` with floating versions:
#   docker build -f apps/web-app/Dockerfile .
#
# NEXT_PUBLIC_* values are inlined into the browser bundle at BUILD time by
# Next.js, so they MUST be passed as build args by the deploy pipeline (CD
# workflow / docker-compose) or the shipped app will call "localhost:3000"
# from users' browsers. Empty defaults keep a bare local build green without
# external credentials — matching the app's no-key fallback in pages/_app.js
# and lib/api.js.

FROM node:20-slim AS build
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RUN corepack enable
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RUN pnpm --filter web-app build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/apps/web-app/public ./public
COPY --from=build /app/apps/web-app/.next/standalone ./
COPY --from=build /app/apps/web-app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
