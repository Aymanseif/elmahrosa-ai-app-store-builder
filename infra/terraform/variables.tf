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
