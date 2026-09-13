# Infrastructure

This directory contains infrastructure configurations for the Elmahrosa AI App Store Builder.

## Directories

- `docker-compose.yml` - Local development environment
- `terraform/` - AWS infrastructure as code
- `github-actions/` - CI/CD workflows

## Local Development

To start the development environment:

```bash
cp .env.example .env
# Edit .env with your values
docker compose up
```

This will start:
- PostgreSQL database
- Redis cache
- API Core service
- AI Generator service
- Build Engine service

## AWS Deployment

To deploy to AWS using Terraform:

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

You will need to provide:
- AWS credentials
- Database password
- Other required variables

## CI/CD

GitHub Actions workflows are located in `github-actions/`:
- `ci.yml` - Runs tests, linting, and security scans
- `cd.yml` - Deploys to AWS ECS on main branch pushes

## Services

Each service in `../services/` has its own Dockerfile for containerization.

