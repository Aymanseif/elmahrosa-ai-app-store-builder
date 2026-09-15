variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "elmahrosa"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "db_skip_final_snapshot" {
  description = "Skip creating a final DB snapshot when destroying. Keep true only for throwaway dev environments; set false in prod so destroy preserves a recoverable snapshot."
  type        = bool
  default     = true
}

variable "image_tag" {
  description = "Container image tag to deploy for all ECS services"
  type        = string
  default     = "latest"
}

variable "clerk_issuer_url" {
  description = "Clerk issuer URL (from Clerk dashboard -> API Keys -> Issuer). Required by api-core at boot; e.g. https://<app>.clerk.accounts.dev"
  type        = string
  sensitive   = true
  default     = ""
}

variable "clerk_audience" {
  description = "Optional Clerk audience to require on the JWT aud claim. Leave empty for no audience check."
  type        = string
  sensitive   = true
  default     = ""
}

variable "allowed_origin" {
  description = "CORS origin allowed to call api-core (the web-app origin). Leave empty to disable CORS headers (same-origin only)."
  type        = string
  default     = ""
}

variable "stripe_secret_key" {
  description = "Stripe secret key (sk_live_...). Optional; Stripe endpoints degrade gracefully when unset."
  type        = string
  sensitive   = true
  default     = ""
}

variable "stripe_webhook_secret" {
  description = "Stripe webhook signing secret (whsec_...). Required for the webhook endpoint to verify events."
  type        = string
  sensitive   = true
  default     = ""
}

variable "anthropic_api_key" {
  description = "Anthropic API key used by the ai-generator service"
  type        = string
  sensitive   = true
  default     = ""
}

variable "anthropic_model" {
  description = "Anthropic model used by the ai-generator service"
  type        = string
  default     = ""
}

variable "service_token" {
  description = "Shared token api-core sends to authenticate requests to the ai-generator service"
  type        = string
  sensitive   = true
  default     = ""
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate for HTTPS. When set, an HTTPS listener is created and HTTP redirects to HTTPS; leave empty for HTTP-only (dev)."
  type        = string
  default     = ""
}

variable "domain_name" {
  description = "Domain name for ACM certificate validation (optional, ignored when certificate_arn is set)"
  type        = string
  default     = ""
}

variable "hosted_zone_id" {
  description = "Route53 hosted zone ID for DNS certificate validation (required when domain_name is set)"
  type        = string
  default     = ""
}
