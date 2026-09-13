const { test } = require("node:test");
const assert = require("node:assert");
const express = require("express");

const authRouter = require("../src/routes/auth");

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRouter);
  return app;
}

async function call(app, port, method, path, headers) {
  const server = app.listen(port);
  try {
    const res = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: headers || {},
    });
    return { status: res.status, body: await res.json().catch(() => null) };
  } finally {
    server.close();
  }
}

test("GET /api/auth/user/<id> without token -> 401 (was unauthenticated)", async () => {
  const res = await call(makeApp(), 3881, "GET", "/api/auth/user/any-id");
  assert.strictEqual(res.status, 401);
  assert.match(res.body.error, /Access token required|Invalid or expired token/);
});

test("POST /api/auth/user without token -> 401 (was unauthenticated)", async () => {
  const res = await call(makeApp(), 3882, "POST", "/api/auth/user");
  assert.strictEqual(res.status, 401);
});

test("authenticateToken rejects a malformed token with 401, not 500", async () => {
  const res = await call(makeApp(), 3883, "GET", "/api/auth/user/any-id", {
    Authorization: "Bearer not-a-jwt",
  });
  assert.strictEqual(res.status, 401);
});