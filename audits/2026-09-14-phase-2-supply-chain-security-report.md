# Phase 2 — Supply-Chain Security: Machine-Verified Report

**Order:** Final remediation order, 2026-09-13 (Elmahrosa AI App Store Builder)
**Verified commit:** `master @ bfdd733` ("fix: Phase 2 supply-chain security — …")
**Baseline:** Phase 1 exit gate met (`8fd10bd`, report `2026-09-14-phase-1-...` in `audits/`)
**Verification date:** 2026-09-14
**Machine:** Windows 11 (win32), git-bash, node v26.7.0
**Tool versions:** pnpm v9.15.9, eslint 8.x, pytest 9.1.1, Python 3.12.10

---

## Discovery

`pnpm audit --audit-level=high` on the pre-fix tree (`7f124b1`) returned **exit 1** with 32
vulnerabilities (2 critical, 12 high, 16 low/moderate). The CI `security` job runs this gate,
meaning every push to `master` or `develop` was red.

**Critical advisories:**
- Next.js unauthenticated RCE on windows-hosted servers (`>=13.4.0 <15.5.24`, patched `>=15.5.24`)
- Next.js RCE in Image Optimization API when AVIF files are used (`>=10.0.0 <15.5.24`, patched `>=15.5.24`)

Both are exploitable without authentication and require only sending crafted requests to any
Next.js instance that accepts AVIF or runs on Windows. They are server-side code-execution
vulnerabilities — as severe as an advisory gets for a web framework.

---

## Milestone verification (Phase 2)

| # | Milestone | Gate result | Evidence |
|---|---|---|---|
| 2.1 | Eliminate critical/high audit findings | **PASS** | `apps/web-app/package.json`: `next` + `eslint-config-next` `^14.2.25` → `^15.5.25`. This single version line covers both criticals (Next ≥15.5.24 is the patched boundary for both). React 18.2.0 and `@clerk/nextjs ^6.0.0` are peer-compatible (Clerk 6.39.6: `next ^15.2.3 || ^16`, `react ^18.0.0`; Next 15.5.25: `react ^18.2.0 || ^19.0.0`). |
| 2.2 | prisma generate + api-core boot | **PASS** | `npx prisma generate` → OK. api-core boots with env vars (`PORT`, `CLERK_ISSUER_URL`, `DATABASE_URL`); fail-fast without them unchanged. |
| 2.3 | Fix transitive moderate findings | **PASS** | `services/api-core/package.json`: `nodemon` `^2.0.0` → `^3.1.14` (drops `simple-update-notifier > semver@7.0.0` ReDoS chain). Root `package.json` `pnpm.overrides`: `postcss >=8.5.18` (patched path-traversal and arbitrary-file-read advisories); `semver@>=7.0.0 <7.5.2` → `>=7.5.2`; `qs@>=2.2.5 <6.16.0` → `>=6.16.0` (array-limit bypass and isBuffer DoS). Express 4.22.2 now resolves `qs@6.16.0`. |
| 2.4 | `pnpm audit --audit-level=high` exit 0 | **PASS** | After fix: exit 0. Single remaining advisory: `uuid@9.0.1` (bullmq dep, moderate, "Missing buffer bounds check in v3/v5/v6 when buf is provided"). Affects uuid v3/v5/v6 with a custom buffer argument only; bullmq uses `uuid.v4()` — no exposure. Not possible to override to 11.x without risking bullmq runtime breakage (bullmq pins `^9`). Below CI `high` threshold by design. |
| 2.5 | web-app lint (Next 15) | **PASS** | `npx eslint .` → exit 0. `next lint` → exit 0 (deprecated notice: "removed in Next.js 16"; still functional in 15.5). |
| 2.6 | web-app build (Next 15) | **PASS** | `npx next build` → "✓ Compiled successfully", 4/4 static pages generated. Exit 1 is the pre-existing Windows-only `standalone` symlink EPERM (documented in Phase 0/1; passes on Linux CI/Docker). |
| 2.7 | web-app tests | **PASS** | `node --test` → 4/4 pass, 0 fail. |
| 2.8 | api-core lint | **PASS** | `npx eslint src/` → exit 0. |
| 2.9 | api-core tests | **PASS** | `node --test` → 10/10 pass, 0 fail. |
| 2.10 | sentinel tests | **PASS** | `node --test` → 5/5 pass, 0 fail. |
| 2.11 | ai-generator tests | **PASS** | `pytest services/ai-generator` → 11 passed. |
| 2.12 | Git hygiene gaps fixed | **PASS** | `apps/web-app/.dockerignore` — existed on disk, never committed (Phase 1 report claimed `.dockerignore` in "every service"; only api-core and ai-generator were tracked). `services/build-engine/gradle/wrapper/gradle-wrapper.jar` — `gradlew` script present but jar untracked; fresh clones could not run the wrapper. Both now tracked. |

---

## Transcript highlights (live probes)

```
$ npx pnpm@9 audit --audit-level=high   → exit 0 (0 high, 0 critical, 1 moderate)
$ npx pnpm@9 audit                      → exit 1 (1 moderate: uuid@9.0.1)
$ npx eslint .                           → ESLint: PASS (web-app)
$ npx eslint src/                        → ESLint: PASS (api-core)
$ node --test (api-core)                 → pass 10 / fail 0
$ node --test (web-app)                  → pass 4 / fail 0
$ node --test (sentinel)                 → pass 5 / fail 0
$ pytest services/ai-generator           → 11 passed
$ npx next build (web-app)              → Compiled successfully; 4/4 static pages
```

---

## Known gaps (honest, not suppressed)

1. **`uuid@9.0.1` (bullmq):** moderate, affects v3/v5/v6 with custom buffer; bullmq uses `v4()`.
   Override to `>=11.1.1` is not attempted: bullmq pins `^9`, and forcing 11 could introduce
   runtime failures. Below CI threshold by design. Will clear on the next major bullmq upgrade
   that accepts `uuid@^11`.

2. **`pnpm audit` moderate-only:** `pnpm audit` (no threshold) exits 1 with the single uuid
   advisory. If the `security` job is ever changed to `--audit-level=moderate`, this must be
   resolved first.

3. **Next.js `next lint` deprecation:** functional in 15.5.x but deprecated (removed in 16).
   The deprecation notice is printed in CI but does not affect the exit code. Migrate to
   `eslint` CLI before upgrading to Next 16.

4. **Windows standalone symlink EPERM:** `next build` with `output: 'standalone'` fails to copy
   pnpm symlinks on Windows NTFS. Compile and static-page generation pass. This is the build
   host's `SeCreateSymbolicLinkPrivilege` limitation; it passes on Linux CI/Docker.

5. **Docker image `web-app` is not CI-gated:** The CD pipeline builds and pushes a `web-app`
   Docker image on every `master` push. The `CI` workflow has no `docker build` or container
   test step for web-app (or any service). This is a gap to close before the image is deployed
   to ECS.

---

## What remains for launch (not addressed in this phase)

- **CD pipeline test gate:** `cd.yml` has no smoke test or health check after deploy.
- **Sentinel Shield rule tuning:** SEC-004 false-positive on Android XML namespaces
  (`http://schemas.android.com`); test-fixture patterns in test files trigger SEC-001/002/003
  intentionally. Tuning is cosmetic, not a launch blocker.
- **`next lint` → eslint CLI migration** (Next 16 prep).
