const { test } = require("node:test");
const assert = require("node:assert");
const { audit } = require("../lib/index.js");

test("clean code scores 100 with no findings", async () => {
  const result = await audit("const x = 1;\nmodule.exports = x;\n");
  assert.strictEqual(result.score, 100);
  assert.deepStrictEqual(result.report, []);
});

test("hardcoded AWS access key is flagged as critical", async () => {
  const result = await audit('const key = "AKIAIOSFODNN7EXAMPLE";\n');
  assert.ok(result.score < 100);
  assert.ok(result.report.some((f) => f.rule === "SEC-001" && f.severity === "critical"));
});

test("eval usage is flagged", async () => {
  const result = await audit("eval(userInput);\n");
  assert.ok(result.report.some((f) => f.rule === "SEC-002"));
});

test("shell exec is flagged", async () => {
  const result = await audit("const cp = require('child_process');\ncp.exec('ls');\n");
  assert.ok(result.report.some((f) => f.rule === "SEC-003"));
});

test("XML namespace URIs are not flagged as HTTP endpoints", async () => {
  const result = await audit('<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n');
  assert.ok(!result.report.some((f) => f.rule === "SEC-004"));
});

test("plaintext HTTP endpoint outside localhost is flagged", async () => {
  const result = await audit('fetch("http://api.example.com/data");\n');
  assert.ok(result.report.some((f) => f.rule === "SEC-004"));
});

test("empty input throws", async () => {
  await assert.rejects(() => audit("   "), /non-empty/);
});