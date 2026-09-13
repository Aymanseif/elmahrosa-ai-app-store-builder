# Elmahrosa AI App Store Builder - Project Structure

## Root Level
```
.
├── .env.example              # Environment variables template
├── .gitignore               # Git ignore rules
├── LICENSE                  # MIT License
├── README.md                # Main documentation
├── SECURITY.md              # Security policy
├── CONTRIBUTING.md          # Contribution guidelines
├── CODEOWNERS               # Repository ownership
├── PROJECT_STRUCTURE.md     # This file
├── package.json             # PNPM workspace configuration
├── pnpm-workspace.yaml      # Workspace definition
├── turbo.json               # Turborepo configuration
```

## Applications (`/apps`)
### Web App (`/apps/web-app`)
- Next.js 14 application with Tailwind CSS
- Authentication via Clerk
- Project management interface
- Pages: login, signup, dashboard, projects, pricing, profile, project creation
- Components: Navbar, ProjectCard, and reusable UI components

### Sharing Hub (`/apps/sharing-hub`)
- Next.js gallery for sharing generated apps
- Features: app listings, ratings, comments, search
- Community features for users to share their creations

## Services (`/services`)
### API Core (`/services/api-core`)
- Node.js + Express backend
- Prisma ORM with PostgreSQL
- Redis for caching
- BullMQ for job queues
- RESTful API for all core functionality
- Authentication middleware (Clerk JWT verification)
- Subscription and billing management

### AI Generator (`/services/ai-generator`)
- Python + FastAPI service
- Integration with Claude API for natural language processing
- Template-based app generation (utility, ecommerce, blog, saas)
- Project planning and file generation
- Security-focused code generation practices

### Build Engine (`/services/build-engine`)
- Gradle + Fastlane + Docker
- Android build pipeline (AAB/APK generation)
- Signing configurations using environment variables
- Sample apps for testing (todo list utility app)
- CI/CD ready containerized builds

## Shared Packages (`/packages`)
### Database (`/packages/database`)
- Prisma schema and migrations
- Shared database models

### Sentinel Shield (`/packages/sentinel`)
- Security auditing library (@elmahrosa/sentinel)
- Static analysis and security scanning
- Quality assurance checks

### Types (`/packages/types`)
- TypeScript interfaces and shared types
- Shared DTOs and API contracts
- Centralized type definitions

### Config (`/packages/config`)
- Centralized configuration management
- Environment-specific settings
- Feature flags

### UI (`/packages/ui`)
- Shared UI component library
- Design system components
- Reusable UI elements

## Infrastructure (`/infra`)
### Docker Compose (`/infra/docker-compose.yml`)
- Local development environment
- PostgreSQL, Redis, and all services
- Quick setup for development and testing

### Terraform (`/infra/terraform/`)
- AWS infrastructure as code
- VPC, RDS, ElastiCache, ECS configurations
- Production-ready deployment templates

### GitHub Actions (`/infra/github-actions/`)
- CI/CD workflows
- Testing, linting, security scanning
- Automated deployment pipelines

## Templates (`/templates/`)
### Utility App Template (`/templates/utility/`)
- Basic app structure with dashboard and settings
- Simple data storage and retrieval
- Template for tool-like applications

### E-commerce Template (`/templates/ecommerce/`)
- Product listing and detail views
- Shopping cart and checkout flow
- User profile and order management
- Payment integration placeholders

### Blog Template (`/templates/blog/`)
- Article listing and detail views
- Category filtering and search
- Author profiles
- Comment system (optional)

### SaaS Template (`/templates/saas/`)
- Authentication and user management
- Dashboard with analytics
- Settings and configuration
- Team collaboration features
- Reporting and export capabilities

## Documentation (`/docs/`)
- Getting started guides
- Architecture decisions
- API references
- Contributing guidelines
- Security policies
- Release notes
