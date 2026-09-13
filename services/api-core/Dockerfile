FROM node:18-slim

WORKDIR /app

COPY package.json ./
# Install with devDependencies so the local prisma CLI is available for
# `prisma generate` (it lives in devDependencies); pruned back down after.
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate && npm prune --omit=dev

COPY src ./src

EXPOSE 3000

CMD ["node", "src/index.js"]
