# Elmahrosa AI App Store Builder Documentation

## Overview

This monorepo contains a full-stack platform for generating Android apps from natural language prompts.

## Architecture

### Frontend
- Web App (Next.js 14) - User interface
- Sharing Hub (Next.js) - Community app gallery

### Backend Services
- API Core (Node.js/Express) - Main API, authentication, project management
- AI Generator (Python/FastAPI) - App generation using Claude API
- Build Engine (Gradle/Fastlane/Docker) - Android build pipeline

### Shared Packages
- Database (Prisma models)
- Sentinel Shield (@elmahrosa/sentinel) - Security auditing
- Types (TypeScript definitions)
- UI Component Library
- Configuration

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   Copy `.env.example` to `.env` and fill in the required values

3. Start development servers:
   ```bash
   pnpm dev
   ```

## Features

- User authentication with Clerk
- Subscription tiers (Free, Pro, Enterprise)
- Natural language to app generation
- Security auditing with Sentinel Shield
- Signed AAB/APK builds
- Google Play publishing workflow
- Community sharing hub
- Multiple payment providers (Stripe, Fawry, Paymob, Dodo)

## Development

### Web App
Located in `/apps/web-app`

### API Core
Located in `/services/api-core`

### AI Generator
Located in `/services/ai-generator`

### Build Engine
Located in `/services/build-engine`

## Deployment

See `infra/` directory for Docker Compose, Terraform, and GitHub Actions configurations.

