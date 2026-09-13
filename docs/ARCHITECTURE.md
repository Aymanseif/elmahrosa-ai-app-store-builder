# System Architecture

## High-Level Components

```
+-------------------+    +-------------------+    +------------------+
|   Web App         |    | Sharing Hub       |    |  Mobile App      |
| (Next.js 14)      |    | (Next.js)         |    | (Generated)      |
+--------+----------+    +--------+----------+    +--------+----------+
         |                         |                         |
         v                         v                         v
+-------------------+    +-------------------+    +------------------+
|   API Gateway     |    |   CDN             |    |  App Store       |
|   (API Core)      |    |                   |    |  (Google Play)   |
+--------+----------+    +--------+----------+    +--------+----------+
         |                         |                         |
         v                         v                         v
+-------------------+    +-------------------+    +------------------+
| AI Generator      |    | Build Engine      |    |  Sentinel Shield |
| (Python/FastAPI)  |    | (Gradle/Fastlane) |    |  (Audit Service) |
+--------+----------+    +--------+----------+    +--------+----------+
         |                         |                         |
         v                         v                         v
+-------------------+    +-------------------+    +------------------+
|   Database        |    |   Object Storage  |    |  Monitoring/Logs |
|  (PostgreSQL)     |    |   (S3-compatible) |    |                  |
+-------------------+    +-------------------+    +------------------+
```

## Data Flow

1. **User Interaction**:
   - User signs up/login via Clerk in Web App
   - User creates a project using the wizard
   - User provides natural language prompt for app generation

2. **App Generation**:
   - Web App sends request to API Core
   - API Core forwards to AI Generator service
   - AI Generator uses Claude API to generate Kotlin/Jetpack Compose code
   - Generated code is validated and stored

3. **Security Auditing**:
   - Generated code is sent to Sentinel Shield for security/quality audit
   - Audit results are stored and returned to user
   - If issues found, AI Generator can attempt fixes

4. **Build Process**:
   - Approved code is sent to Build Engine
   - Build Engine compiles signed AAB/APK using Gradle
   - Fastlane handles signing and packaging
   - Artifacts are stored in object storage

5. **Publishing**:
   - User configures Google Play metadata
   - One-click publishing to internal test track
   - Promotion to production after review

## Security Considerations

- All service-to-service communication uses JWT tokens
- Secrets managed via environment variables and secret managers
- Input validation and sanitization at all entry points
- Regular dependency updates via Dependabot
- Security audits built into the generation pipeline
- Minimal permissions principle applied to generated apps
- No hardcoded secrets in generated code
- HTTPS enforced for all network communications

## Scalability

- Services designed to be stateless where possible
- Horizontal scaling via container orchestration
- Database read replicas for scaling reads
- Caching layer (Redis) for frequent computations
- Message queues (BullMQ) for asynchronous processing

