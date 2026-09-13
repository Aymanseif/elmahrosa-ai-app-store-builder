# Requires next.config.js to set `output: 'standalone'` for the final
# COPY steps below to have something to copy — see the accompanying
# next.config.js fix.

FROM node:18-slim AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

FROM node:18-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
