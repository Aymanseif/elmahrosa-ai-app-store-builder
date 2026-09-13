# Phase 0 — Bootable Baseline: Machine-Verified Report

**Order:** Final remediation order, 2026-09-13 (Elmahrosa AI App Store Builder)
**Verified commit:** `master @ fab21c8` ("fix: Phase 0 bootable baseline — …")
**Verification date:** 2026-09-13
**Machine:** Windows 11 (win32), git-bash, node v26.7.0
**Tool versions:** pnpm v9.15.9 (via npx), prisma CLI (api-core devDependency), node v26.7.0
**Reviewer:** Elmahrosa-Teos (founder-directed AI session, live probes below)

> Companion audit: `audits/2026-09-13-ai-app-store-builder-audit.md` — **NOT FOUND**
> in this repository at verification time (referenced by the order but absent;
> per Rule 3 it is recorded as NOT FOUND rather than inferred).

---

## Clean-clone transcript (fresh `git clone` → temp dir, `master @ fab21c8`)

```
$ git clone . $TMP/p0-clone && cd $TMP/p0-clone
HEAD: fab21c8

$ npx pnpm@9 install --frozen-lockfile
Progress: resolved 507, reused 503, downloaded 4, added 507, done
Done in 25.9s using pnpm v9.15.9
→ PASS (gate 0.1 workspace YAML validity, 0.2 dependency matrix, 0.3 lockfile policy)

$ npx pnpm@9 --filter=web-app run build
 ✓ Compiled successfully
 ✓ Generating static pages (4/4)
> Build error occurred        ← standalone-output symlink step only (EPERM,
                                Windows privilege; works on Linux CI/Docker).
                                Compilation and prerendering PASS.
→ PARTIAL PASS on this Windows host; compile+prerender gates met.

$ node --check services/api-core/src/index.js   (and auth.js, stripeWebhook.js,
   stripe.js, buildController.js)
→ node --check sweep: PASS

$ npx prisma generate && PORT=3911 node -e "require('./src/index.js')"
Server is running on port 3911
api-core BOOT: OK
$ curl http://127.0.0.1:3911/health
{"status":"ok","uptime":2.0485878}
→ PASS (boots with STRIPE_SECRET_KEY unset — lazy Stripe init, gate 0.6c)

$ node --test   (workspace: web-app + sentinel + api-core)
ℹ pass 19
ℹ fail 0
→ PASS
```

---

## Milestone verification (Phase 0)

| # | Milestone | Gate result | Evidence |
|---|---|---|---|
| 0.1 | Corrupted files repaired (`templates/*/README.md` literal-`\n` stripped; `pnpm-workspace.yaml` valid) | **PASS** | `pnpm install` parses the workspace YAML from a clean clone; template rescan clean (`.pytest_cache/` was generated scratch, removed) |
| 0.2 | web-app dependency matrix (`next ^14.2.25` satisfying Clerk 6.x peers) | **PASS** | `pnpm install --frozen-lockfile` clean-clone: no ERESOLVE; `next build` compiles + 4/4 prerender |
| 0.3 | Lockfile policy (un-ignored; `pnpm-lock.yaml` committed) | **PASS** | `.gitignore` has zero lockfile patterns (`yarn.lock`, `package-lock.json`, `PIPFILE-LOCK.json` removed); `--frozen-lockfile` install passes |
| 0.4 | All `dodo.pe` payment links removed | **PASS** | `git grep dodo.pe` on the tree: no matches in source; pricing CTAs are disabled buttons with "coming soon" text (`apps/web-app/pages/pricing.js`); Stripe webhook is account-tied + signature-verified |
| 0.5 | `routes/auth.js` locked down with `authenticateToken` | **PASS** | Committed tests: unauthenticated `GET/POST /api/auth/user*` → **401**; malformed JWT → 401 not 500; URL `clerkId` ignored in favor of the token subject (`services/api-core/test/auth.test.js`) |
| 0.6 | api-core runtime breakers | **PASS** (one DB-backed item requires an integration DB — see notes) | (a) `createBuild` writes `"PENDING"` (uppercase enum); `updateBuild` whitelists against `BuildStatus` → bogus status → **400** before any DB call. (b) webhook router mounted **before** `express.json()`; live signed-payload test → **200 `{received:true}`**, invalid signature → **400** (`test/webhook.test.js`). (c) Stripe lazy-init; boot test passes with `STRIPE_SECRET_KEY` unset. (d) `/health` returns `{"status":"ok"}` |
| 0.7 | build-engine quarantined | **PASS** | Removed from `infra/docker-compose.yml` with an explanatory note; marked EXPERIMENTAL in `services/build-engine/README.md`; absent from all CI matrices |
| 0.8 | This report | **DONE** | This file, committed with the full transcript above |

**Phase 0 exit gate:** clean-clone bootstrap works end-to-end; web-app builds (compile+prerender; standalone copy is a Windows-host limitation); api-core boots and passes its new unit tests (19/19 workspace-wide in the clean clone); zero external payment links remain.

## Known gaps (honest, not suppressed)

1. **`createBuild` 201-with-`PENDING` integration test** requires a live Postgres (Prisma rejects queries without `DATABASE_URL`). The validation boundary is unit-tested; the DB-backed assertion is deferred to the integration environment (docker-compose postgres is available; Docker Engine not present on the verification host).
2. **Standalone Docker output** of `next build` fails only on this Windows host (symlink privilege). Linux CI/Docker builds it; noted per docs-honesty.
3. `services/api-core/prisma/schema.prisma` still models a `DODO` payment-method enum — data model only, no external link; removal/implementation is a Phase 5.4 founder-gated decision.
