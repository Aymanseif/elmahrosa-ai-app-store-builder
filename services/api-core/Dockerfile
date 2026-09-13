FROM node:18-slim

WORKDIR /app

COPY package.json ./
# Install with devDependencies so the local prisma CLI is available for
# `prisma generate` (it lives in devDependencies); pruned back down after.
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate && npm prune --omit=dev

COPY src ./src

# Milestone 1.5: run pending migrations on container start, then boot. The
# DATABASE_URL is provided by the compose environment.
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]

EXPOSE 3000
