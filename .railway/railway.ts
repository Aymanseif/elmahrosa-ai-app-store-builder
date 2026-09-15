import {
  defineRailway,
  github,
  group,
  postgres,
  project,
  redis,
  service,
} from "railway/iac";

export default defineRailway((ctx) => {
  const db = postgres("postgres");
  const cache = redis("redis");

  const apiCore = service("api-core", {
    source: github("Elmahrosa/elmahrosa-ai-app-store-builder", {
      branch: "master",
      rootDirectory: ".",
    }),
    build: {
      builder: "DOCKERFILE",
      dockerfilePath: "services/api-core/Dockerfile",
      buildCommand: null,
      watchPatterns: null,
    },
    rootDirectory: ".",
    startCommand:
      "cd services/api-core && npx prisma migrate deploy && node src/index.js",
    healthcheck: "/health",
    healthcheckTimeout: 300,
    env: {
      PORT: "3000",
      DATABASE_URL: db.env.DATABASE_URL,
      ALLOWED_ORIGIN: "https://web-app-production-9fc0.up.railway.app",
    },
  });

  const web = service("web-app", {
    source: github("Elmahrosa/elmahrosa-ai-app-store-builder", {
      branch: "master",
      rootDirectory: ".",
    }),
    build: {
      builder: "DOCKERFILE",
      dockerfilePath: "apps/web-app/Dockerfile",
      buildCommand: null,
      watchPatterns: null,
    },
    rootDirectory: ".",
    startCommand: "node apps/web-app/server.js",
    healthcheck: "/",
    env: {
      PORT: "3000",
      NEXT_PUBLIC_API_URL: apiCore.env.RAILWAY_PUBLIC_DOMAIN,
    },
  });

  const aiGenerator = service("ai-generator", {
    source: github("Elmahrosa/elmahrosa-ai-app-store-builder", {
      branch: "master",
      rootDirectory: ".",
    }),
    build: {
      builder: "DOCKERFILE",
      dockerfilePath: "services/ai-generator/Dockerfile",
      buildCommand: null,
      watchPatterns: null,
    },
    rootDirectory: ".",
    startCommand: "python -m uvicorn main:app --host 0.0.0.0 --port 8000",
    healthcheck: "/",
    env: {
      PORT: "8000",
    },
  });

  const backend = group("Backend", [apiCore, aiGenerator]);
  const data = group("Data", [db, cache]);

  return project("mindful-alignment", {
    resources: [backend, data, web],
  });
});