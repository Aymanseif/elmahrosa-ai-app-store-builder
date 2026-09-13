# Elmahrosa AI App Store Builder

A production-ready monorepo for generating Android apps from natural-language prompts.

## 🚀 Features

- **User Authentication**: Secure signup/login with Clerk
- **Subscription Tiers**: Free, Pro, and Enterprise plans
- **AI-Powered Generation**: Create Android apps from natural language descriptions
- **Security Auditing**: Built-in Sentinel Shield security and quality audits
- **Build Pipeline**: Gradle + Fastlane for signed AAB/APK generation
- **Google Play Integration**: Guided one-click publishing workflow
- **Community Hub**: Share and discover apps with ratings & comments
- **Multiple Payment Providers**: Stripe, Fawry, Paymob, Dodo support

## 📱 Supported App Types

- **Utility Apps**: Simple tools and helpers
- **E-commerce**: Shopping apps with cart and checkout
- **Blog/News**: Content publishing platforms
- **SaaS Dashboards**: Business tools and analytics

## 🛠️ Technology Stack

### Frontend
- **Web App**: Next.js 14 + Tailwind CSS + Clerk Auth
- **Sharing Hub**: Next.js Gallery for community apps

### Backend Services
- **API Core**: Node.js + Express + Prisma + PostgreSQL + Redis + BullMQ
- **AI Generator**: Python + FastAPI + Claude API
- **Build Engine**: Gradle + Fastlane + Docker (Android builds)

### Shared Packages
- **Database**: Prisma models and migrations
- **Sentinel Shield**: Security auditing library (@elmahrosa/sentinel)
- **Types**: TypeScript interfaces and shared types
- **UI**: Component library (in development)
- **Config**: Centralized configuration

### Infrastructure
- **Containerization**: Docker for all services
- **Orchestration**: Docker Compose (dev), Terraform + ECS (prod)
- **CI/CD**: GitHub Actions with automated testing and deployment

## 📖 Documentation

- [Getting Started](#-getting-started)
- [Architecture](#-architecture)
- [API Reference](#-api-reference)
- [Contributing](#-contributing)
- [Security Policy](#-security-policy)
- [License](#-license)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.12+
- Docker & Docker Compose
- PostgreSQL
- Clerk account (for authentication)
- Anthropic API key (for AI generation)
- Google Play Developer account (for publishing)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Elmahrosa/elmahrosa-ai-app-store-builder.git
   cd elmahrosa-ai-app-store-builder
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your values (see .env.example for required variables)
   ```

4. Start development services:
   ```bash
   docker compose up
   ```

5. Initialize the database:
   ```bash
   pnpm prisma migrate dev
   ```

6. Start the development servers:
   ```bash
   pnpm dev
   ```

## 🏗️ Architecture

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed system design, data flow diagrams, and scalability considerations.

## 🔐 Security

We take security seriously. Please see our [Security Policy](./SECURITY.md) for details on:
- Reporting security vulnerabilities
- Our security scanning practices
- Dependency management
- Secure coding practices

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:
- How to report bugs and request features
- Our development workflow
- Coding standards and conventions
- How to submit pull requests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by Elmahrosa International
- Powered by Claude AI for natural language processing
- Inspired by the vision of sovereign digital infrastructure

---

**Ready to build your first AI-powered Android app?** Start by creating a project in the web app and watch your ideas come to life!
