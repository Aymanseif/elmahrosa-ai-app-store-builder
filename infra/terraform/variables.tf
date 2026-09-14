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

variable "image_tag" {
  description = "Container image tag to deploy for all ECS services"
  type        = string
  default     = "latest"
}

variable "jwt_secret" {
  description = "Secret used to verify JWTs in api-core"
  type        = string
  sensitive   = true
}

variable "anthropic_api_key" {
  description = "Anthropic API key used by the ai-generator service"
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
