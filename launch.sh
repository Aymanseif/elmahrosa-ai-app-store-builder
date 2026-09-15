#!/usr/bin/env bash
# One-command launch: sets GitHub secrets, generates tfvars from env vars,
# boots the S3 state bucket, and runs terraform apply.
#
# Usage (interactive or env-driven):
#   # Minimal — fills everything missing via prompts:
#   ./launch.sh
#
#   # Fully pre-filled (paste your values first):
#   export NEXT_PUBLIC_API_URL=https://app.elmahrosa.com \
#         NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx \
#         NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx \
#         AWS_ACCESS_KEY_ID=AKIA... \
#         AWS_SECRET_ACCESS_KEY=... \
#         CLERK_ISSUER_URL=https://app.clerk.accounts.dev \
#         DB_PASSWORD=... \
#         ALLOWED_ORIGIN=https://app.elmahrosa.com \
#         STRIPE_SECRET_KEY=sk_live_xxx \
#         STRIPE_WEBHOOK_SECRET=whsec_xxx \
#         ANTHROPIC_API_KEY=sk-ant-xxx \
#   && ./launch.sh
#
# Secrets are written to infra/terraform/terraform.tfvars (gitignored) and set
# in GitHub Actions via gh secret set.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
TERRAFORM_DIR="$REPO_ROOT/infra/terraform"
GH_REPO="Elmahrosa/elmahrosa-ai-app-store-builder"

# ─── colours (only when tty) ────────────────────────────────────────────
if [ -t 1 ]; then
  G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; RST='\033[0m'
else G=''; Y=''; R=''; RST=''; fi
info()  { echo -e "${G}✔${RST} $*"; }
warn()  { echo -e "${Y}⚠${RST} $*"; }
die()   { echo -e "${R}✘ $*${RST}" >&2; exit 1; }

# ─── prompt helper ──────────────────────────────────────────────────────
# ask VAR "Prompt text" [default_value]
ask() {
  local var="$1" text="$2" default="${3:-}"
  if [ -n "${!var:-}" ]; then return; fi
  if [ -n "$default" ]; then
    read -rp "$text [$default]: " value
    value="${value:-$default}"
  else
    read -rp "$text: " value
    [ -z "$value" ] && die "required: $var"
  fi
  export "$var=$value"
}

# ─── auto-generate secrets ──────────────────────────────────────────────
generate_password() {
  openssl rand -base64 24 | tr -d '/+=' | head -c 32
}
generate_token() {
  openssl rand -base64 32 | tr -d '/+=' | head -c 48
}

# ─── prerequisites ──────────────────────────────────────────────────────
command -v aws >/dev/null 2>&1  || die "Install the AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
command -v gh  >/dev/null 2>&1  || die "Install gh: https://cli.github.com/"
gh auth status >/dev/null 2>&1  || die "Run 'gh auth login' first"
[ -n "${AWS_ACCESS_KEY_ID:-}" ]     || die "Export AWS_ACCESS_KEY_ID first"
[ -n "${AWS_SECRET_ACCESS_KEY:-}" ] || die "Export AWS_SECRET_ACCESS_KEY first"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Elmahrosa AI App Store — one-command launch"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ─── 1. collect required values ─────────────────────────────────────────
# NEXT_PUBLIC values (baked into browser bundle, required for CD)
ask NEXT_PUBLIC_API_URL            "Public URL of the web app (no trailing /api)"
ask NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY "Clerk publishable key (pk_live_...)"
ask NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY "Stripe publishable key (pk_live_...)"

# Backend secrets (optional at tfvars; empty = feature disabled at boot)
ask CLERK_ISSUER_URL    "Clerk issuer URL (https://yourapp.clerk.accounts.dev)"
ask ALLOWED_ORIGIN       "CORS allowed origin (same as NEXT_PUBLIC_API_URL)" "${NEXT_PUBLIC_API_URL:-}"
ask STRIPE_SECRET_KEY    "Stripe secret key (sk_live_...)"               ""
ask STRIPE_WEBHOOK_SECRET "Stripe webhook secret (whsec_...)"           ""
ask ANTHROPIC_API_KEY    "Anthropic API key"                             ""

# Database — auto-generate strong password if not provided
if [ -z "${DB_PASSWORD:-}" ]; then
  DB_PASSWORD="$(generate_password)"
  info "Auto-generated DB_PASSWORD (saved to tfvars)"
fi

# SERVICE_TOKEN — shared auth between api-core → ai-generator (auto-gen if unset)
if [ -z "${SERVICE_TOKEN:-}" ]; then
  SERVICE_TOKEN="$(generate_token)"
  info "Auto-generated SERVICE_TOKEN (saved to tfvars)"
fi

# Domain — optional for HTTP-only launch; enables HTTPS when set
ask CERTIFICATE_ARN "ACM certificate ARN (blank = skip HTTPS)" ""
ask DOMAIN_NAME     "Custom domain (blank = skip HTTPS)"      ""
ask HOSTED_ZONE_ID  "Route53 hosted zone ID (blank = skip)"   ""

# ─── 2. set GitHub secrets (CD reads these) ─────────────────────────────
echo ""
info "Setting GitHub secrets in $GH_REPO …"
gh secret set AWS_ACCESS_KEY_ID             -b "$AWS_ACCESS_KEY_ID"       --repo "$GH_REPO" 2>/dev/null
gh secret set AWS_SECRET_ACCESS_KEY         -b "$AWS_SECRET_ACCESS_KEY"   --repo "$GH_REPO" 2>/dev/null
gh secret set NEXT_PUBLIC_API_URL           -b "$NEXT_PUBLIC_API_URL"     --repo "$GH_REPO" 2>/dev/null
gh secret set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY -b "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" --repo "$GH_REPO" 2>/dev/null
gh secret set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY -b "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" --repo "$GH_REPO" 2>/dev/null
info "5 GitHub secrets set"

# ─── 3. write terraform.tfvars (bootstrap reads -var-file) ──────────────
cat > "$TERRAFORM_DIR/terraform.tfvars" << EOF
# Auto-generated by launch.sh — DO NOT EDIT BY HAND.
project_name = "elmahrosa"
environment  = "prod"
aws_region   = "us-east-1"

# --- Required (api-core boot) ---
clerk_issuer_url  = "$CLERK_ISSUER_URL"
db_password       = "$DB_PASSWORD"

# --- CD build args ---
image_tag = "latest"

# --- App secrets (empty = disabled) ---
allowed_origin          = "$ALLOWED_ORIGIN"
stripe_secret_key       = "$STRIPE_SECRET_KEY"
stripe_webhook_secret   = "$STRIPE_WEBHOOK_SECRET"
anthropic_api_key       = "$ANTHROPIC_API_KEY"
anthropic_model         = ""
service_token           = "$SERVICE_TOKEN"
clerk_audience          = ""

# --- HTTPS (blank = HTTP only for first deploy, enable later) ---
certificate_arn = "$CERTIFICATE_ARN"
domain_name     = "$DOMAIN_NAME"
hosted_zone_id  = "$HOSTED_ZONE_ID"

# RDS: true in prod so destroy preserves a snapshot
db_skip_final_snapshot = false
EOF
info "tfvars written to infra/terraform/terraform.tfvars (gitignored)"

# ─── 4. terraform: create state bucket + init + apply ───────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Running terraform apply (takes ~3–5 min)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd "$TERRAFORM_DIR"
export AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY
./bootstrap.sh

# ─── 5. deploy — push to master triggers CD ─────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Launch complete — trigger deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cd "$REPO_ROOT"
echo ""
info "To deploy now:"
echo "   git add -A && git commit -m 'chore: launch config' && git push"
echo ""
info "Or run CD manually:"
echo "   gh workflow run CD"
echo ""
info "Check deploy status:"
echo "   gh run list --workflow CD --limit 1"
echo ""
info "Your ALB URL (after ~5 min):"
echo "   terraform -chdir=$TERRAFORM_DIR output alb_dns_name"
