#!/usr/bin/env bash
# Bootstraps the infra needed to point Terraform at remote state, then applies.
# Run from this directory with AWS credentials exported:
#   export AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=...
#   ./bootstrap.sh            # optional -var-file=terraform.tfvars
#
# Steps:
#   1. Create the elmahrosa-terraform-state S3 bucket (idempotent, region us-east-1)
#      with versioning + default encryption, matching what main.tf expects.
#   2. terraform init (initializes the S3 backend once the bucket exists).
#   3. terraform plan, then apply --auto-approve (pass --plan-only to skip apply).
set -euo pipefail

BUCKET="elmahrosa-terraform-state"
REGION="us-east-1"
KEY="elmahrosa-ai-app-store-builder/terraform.tfstate"
PLAN_ONLY="${PLAN_ONLY:-}"

if ! command -v aws >/dev/null 2>&1; then
  echo "error: AWS CLI not found — install it and export AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY" >&2
  exit 1
fi

[ -n "${AWS_ACCESS_KEY_ID:-}" ] || { echo "error: AWS_ACCESS_KEY_ID not set" >&2; exit 1; }
[ -n "${AWS_SECRET_ACCESS_KEY:-}" ] || { echo "error: AWS_SECRET_ACCESS_KEY not set" >&2; exit 1; }

echo "==> ensuring state bucket $BUCKET"
if aws s3api head-bucket --bucket "$BUCKET" --region "$REGION" >/dev/null 2>&1; then
  echo "    bucket exists, skipping"
else
  aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" >/dev/null
  echo "    created"
fi
aws s3api put-bucket-versioning --bucket "$BUCKET" --versioning-configuration \
  Status=Enabled --region "$REGION" >/dev/null
aws s3api put-bucket-encryption --bucket "$BUCKET" --server-side-encryption-configuration \
  '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}' \
  --region "$REGION" >/dev/null
aws s3api put-public-access-block --bucket "$BUCKET" \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true \
  --region "$REGION" >/dev/null
echo "    bucket: versioning+encryption+public-access-block applied"

echo "==> terraform init"
# Respect the committed .terraform.lock.hcl (drop -upgrade so the pinned
# provider isn't floated).
terraform init -backend-config="bucket=$BUCKET" \
  -backend-config="key=$KEY" -backend-config="region=$REGION"

echo "==> terraform plan"
terraform plan -out=terraform.tfplan "$@"

if [ -n "$PLAN_ONLY" ]; then
  echo "==> PLAN_ONLY set — skip applying. Inspect the plan and run: terraform apply terraform.tfplan"
  exit 0
fi

echo "==> terraform apply"
# A saved plan has the variables baked in; passing -var-file again here is
# rejected by Terraform, so apply takes only the plan.
terraform apply "terraform.tfplan"
echo "==> done — outputs:"
terraform output