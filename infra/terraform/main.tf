terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  tags = {
    Name = "${var.project_name}-vpc"
    Environment = var.environment
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  tags = {
    Name = "${var.project_name}-public-${count.index + 1}"
    Environment = var.environment
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "${var.project_name}-igw"
    Environment = var.environment
  }
}

# Route Table for Public Subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = {
    Name = "${var.project_name}-public-rt"
    Environment = var.environment
  }
}

# Associate Public Subnets with Route Table
resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Security Group for Services
resource "aws_security_group" "services" {
  name        = "${var.project_name}-services-sg"
  description = "Allow HTTP/HTTPS inbound"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Health checks"
    from_port   = 3000
    to_port     = 9000
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]  # VPC CIDR
  }

  egress {
    description = "All traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-services-sg"
    Environment = var.environment
  }
}

# RDS Database
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.public[0].id, aws_subnet.public[1].id]
  tags = {
    Name = "${var.project_name}-db-subnet-group"
    Environment = var.environment
  }
}

resource "aws_db_instance" "main" {
  identifier         = "${var.project_name}-postgres"
  engine             = "postgres"
  engine_version     = "15"
  instance_class     = "db.t3.micro"
  allocated_storage  = 20
  name               = "elmahrosa"
  username           = "elmahrosa"
  password           = var.db_password
  db_subnet_group_name = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.services.id]
  skip_final_snapshot = true
  tags = {
    Name = "${var.project_name}-postgres"
    Environment = var.environment
  }
}

# Elasticache for Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-redis-subnet-group"
  subnet_ids = [aws_subnet.public[0].id, aws_subnet.public[1].id]
  tags = {
    Name = "${var.project_name}-redis-subnet-group"
    Environment = var.environment
  }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id          = "${var.project_name}-redis"
  description                   = "Redis cluster for Elmahrosa"
  engine                        = "redis"
  engine_version                = "7.0"
  node_type                     = "cache.t3.micro"
  num_node_groups               = 1
  replicas_per_node_group       = 0
  automatic_failover_enabled    = false
  subnet_group_name             = aws_elasticache_subnet_group.main.name
  security_group_ids            = [aws_security_group.services.id]
  tags = {
    Name = "${var.project_name}-redis"
    Environment = var.environment
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"
  tags = {
    Name = "${var.project_name}-cluster"
    Environment = var.environment
  }
}

# Variables
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

