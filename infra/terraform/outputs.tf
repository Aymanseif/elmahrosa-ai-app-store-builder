output "db_endpoint" {
  description = "PostgreSQL endpoint"
  value       = aws_db_instance.main.endpoint
}

output "redis_endpoint" {
  description = "Redis endpoint"
  value       = aws_elasticache_replication_group.main.primary_endpoint_address
}

output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "subnet_ids" {
  description = "Subnet IDs for ECS"
  value       = [aws_subnet.public[0].id, aws_subnet.public[1].id]
}

output "security_group_ids" {
  description = "Security group IDs for services"
  value       = [aws_security_group.services.id]
}

output "alb_dns_name" {
  description = "Public DNS name of the application load balancer"
  value       = aws_lb.main.dns_name
}

output "ecr_repository_urls" {
  description = "ECR repository URLs for the service images"
  value = {
    web_app      = aws_ecr_repository.web_app.repository_url
    api_core     = aws_ecr_repository.api_core.repository_url
    ai_generator = aws_ecr_repository.ai_generator.repository_url
  }
}
