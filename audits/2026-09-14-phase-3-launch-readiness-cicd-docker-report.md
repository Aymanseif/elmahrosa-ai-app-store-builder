# Phase 3 — Launch Readiness: CI/CD Pipeline, Docker Reproducibility, Terraform

**Order:** Final remediation order, 2026-09-13 (Elmahrosa AI App Store Builder)
**Verified commits:** `master @ 1505790` (fixes `3a571eb`, `5425e16`, `8779146`, `1505790`)
**Baseline:** Phase 2 exit gate met (`bfdd733`, report `2026-09-14-phase-2-...` in `audits/`)
**Verification date:** 2026-09-14
**Machine:** Windows 11 (win32), git-bash, node v26.7.0
**Tool versions:** pnpm v9.15.9, Terraform v1.9.8 (hashicorp/aws ~> 5.0), Python 3.12.10

---

## Discovery / motivation

The Phase 2 report's "remains for launch" list was addressed. Two CI holes were found and closed:

1. **`CI` had no Docker build gate.** All service images were built only inside the CD workflow on
   `master` push. A Dockerfile that fails to build could therefore reach production ECS before
   anyone noticed. Now the `docker-build` job builds all three images in CI on every push.
2. **`test-node (api-core)` failed on clean checkouts** (`@prisma/client did not initialize yet`):
   the generated Prisma client was only present locally. `pretest: prisma generate` now runs
   whenever tests run, using the local declaration of the `prisma` CLI (relocated from
   devDependencies to dependencies so it survives production pruning and works in images).

---

## Milestone verification (Phase 3)

| # | Milestone | Gate result | Evidence |
|---|---|---|---|
| 3.1 | Reproducible Docker builds from repo root | **PASS** | All three Dockerfiles build from the repo root and `pnpm install --frozen-lockfile` from the committed `pnpm-lock.yaml`, replacing bare `npm install` (floating versions) that could drift from the lockfile. CI `docker-build` matrix builds `api-core`, `ai-generator`, `web-app`, all three pass in the green run (see transcript). |
| 3.2 | Deterministic pnpm version everywhere | **PASS** | Added `"packageManager": "pnpm@9.15.9"` (matches lockfile generator). Without it, Docker's corepack resolved the latest pnpm (v10), whose overrides handling differs — surfaced as `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` in the first post-fix CI run. corepack now installs exactly 9.15.9 in images; `pnpm/action-setup@v4` in CI reads the same field (its `version: 9` input clashed with the field → `ERR_PNPM_BAD_PM_VERSION`, fixed by dropping the input). |
| 3.3 | CI green on every matrix job | **PASS** | Run `34904013553` (`1505790`): lint (api-core, web-app), test-node (api-core, web-app, sentinel), test-python, docker-build (×3), security — **all ✓**. |
| 3.4 | api-core `test` runs Prisma generate first | **PASS** | `"pretest": "prisma generate"` in `services/api-core/package.json`. `node --test` → 10/10 pass, 0 fail on a checkout that had no prior local client. |
| 3.5 | api-core image can `migrate deploy` at runtime | **PASS** | `prisma` moved to `dependencies` (runtime needs the CLI for `migrate deploy`). Dockerfile CMD runs `npx prisma migrate deploy && node src/index.js` — `npx` resolves the local `.bin` shim pnpm leaves in `services/api-core/node_modules`. |
| 3.6 | web-app image is buildable and gated | **PASS** | Dockerfile: `next.config.js` sets `output: 'standalone'` (already committed in `3a571eb`); build does `pnpm --filter web-app build`; runner stage copies `public`, `.next/standalone`, `.next/static`. CI `docker-build (web-app)` ✓ — closes Phase 2 known-gap #5. |
| 3.7 | build-engine removed from CD matrix sync | **PASS** | `cd.yml` builds all three services via `docker build -f <service>/Dockerfile .` from the repo root, matching the CI gate's exact commands and contexts. |
| 3.8 | Terraform config actually validates | **PASS** | Terraform v1.9.8 + hashicorp/aws 5.100.0: `terraform validate` → **"Success! The configuration is valid."** This is significant — prior phases reported Terraform "unverified" because the CLI was unavailable; a real bug was found and fixed (below). |
| 3.9 | ECR `force_delete` fix | **PASS** | `aws_ecr_repository` rejects `force_destroy` (that is an S3-bucket argument); correct argument is `force_delete`. All three repos in `ecs.tf` now use `force_delete`. Pre-existing config had never been applied, so this was latent. |
| 3.10 | HTTPS listener + HTTP→HTTPS redirect (opts-in) | **PASS** | Added ACM certificate (request+Route53 DNS validation when `domain_name` + `hosted_zone_id` are set) and an HTTPS listener (`ELBSecurityPolicy-TLS13-1-2-2021-06`). HTTP listener redirects `301 → :443` only when HTTPS is on; with no cert provided everything stays HTTP-forwarded so dev works unchanged. API rule attaches to whichever listener is current. Validated with two paths (`use_https` on/off) via a scratch backend. |
| 3.11 | Terraform S3 remote backend | **PASS** | `backend "s3"` added (`elmahrosa-terraform-state`, key `elmahrosa-ai-app-store-builder/terraform.tfstate`, region `us-east-1`, `encrypt = true`) so CI/CD and dev machines share state instead of silently diverging. Bucket/versioning must be created once before first `apply`. `.terraform*` artifacts ignored at any depth; provider lockfile committed. |
| 3.12 | Root `.dockerignore` + compose contexts | **PASS** | New root `.dockerignore` (node_modules, .git, .next, out, build, dist, .env\*, logs, python caches/venv, `.terraform`) keeps the root build context clean. `infra/docker-compose.yml` builds use `context: ..` + explicit dockerfile paths; compose is run from `infra/`. |
| 3.13 | dependency-review action fixed | **PASS** | `dependabot` job: `if: github.event_name == 'pull_request'` (the action requires PR `base-ref`/`head-ref`, so it errored on every push) and `allow-ghsas: true` (replaces invalid `allow-ghas-advisories-in-pr`). |
| 3.14 | Node 20 toolchain | **PASS** | CI `setup-node` bumped `'18' → '20'` across the matrix, matching the `node:20-slim` Docker images. |

---

## Transcript highlights (live probes)

```
$ docker-build (CI, 1505790)  → api-core ✓  ai-generator ✓  web-app ✓
$ lint (api-core)             → ✓   test-node (api-core)  → ✓ (pretest prisma generate)
$ lint (web-app)              → ✓   test-node (web-app)   → ✓ (4/4)
$ test-node (sentinel)        → ✓ (7/7)   test-python → ✓ (11 passed)   security → ✓
$ terraform validate          → Success! The configuration is valid.   (aws 5.100.0, Terraform 1.9.8)

Diagnosed and fixed during this phase (two CI regressions introduced by the fixes themselves):
$ corepack resolved latest pnpm → ERR_PNPM_LOCKFILE_CONFIG_MISMATCH (overrides changed in v10)
                                  → fixed with "packageManager": "pnpm@9.15.9"
$ pnpm/action-setup version:9 vs packageManager field → ERR_PNPM_BAD_PM_VERSION
                                  → fixed by omitting the version input (reads package.json)
```

---

## Known gaps (honest, not suppressed)

1. **Terraform apply still unexecuted.** The config now validates, but no `terraform apply` has been
   run (no AWS credentials on this machine). First apply will also require creating the
   `elmahrosa-terraform-state` S3 bucket (or swapping the backend to `local`) and, for the HTTPS
   listener, supplying `certificate_arn` (pre-validated) or `domain_name` + `hosted_zone_id` and
   pointing DNS at the ALB (`outputs.tf` `alb_dns_name`).
2. **`uuid@9.0.1` (bullmq, moderate)** unchanged — documented in Phase 2; below CI `high` threshold.
3. **Node 20 deprecation warnings on runners** — informational only; setup-node targets Node 24 for
   action execution. Node 20 itself is still in CI/Docker until a future bump.
4. **Windows `next build` standalone symlink EPERM** persists locally (documented); Linux CI/Docker
   builds are unaffected and web-app image is now CI-gated.
5. **CD deploy smoke gate** (from Phase 2.2) still requires a first successful deploy to prove the
   task-definition re-registration + `wait services-stable` + ALB probe logic end-to-end.

---

## What remains before first deploy (next actions)

- Bootstrap the S3 state bucket and run `terraform apply` (with `certificate_arn` or `domain_name`
  chosen), then trigger the CD workflow and confirm the ecs-wait + smoke gates.
- Set `Clerk publishable key`/secret and `ANTHROPIC_API_KEY`/`DATABASE_URL` secrets in the CD
  workflow's environment or AWS Secrets Manager as expected by the task definitions.