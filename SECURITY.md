# Security Policy

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

We take the security of our project seriously. If you discover a security vulnerability within Elmahrosa AI App Store Builder, please follow these steps:

### Reporting Process

1. **Do NOT** publicly disclose the vulnerability
2. Email the security team at security@elmahrosa.org with:
   - A clear description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Any proof-of-concept code or screenshots
3. We will acknowledge receipt of your report within 48 hours
4. We will provide regular updates on our progress
5. We will coordinate disclosure timelines with you

### What Happens After Reporting

1. **Triage**: We will verify the vulnerability and determine its severity
2. **Investigation**: We will investigate the issue and develop a fix
3. **Fix**: We will implement a fix and test it thoroughly
4. **Release**: We will release a patch in a timely manner
5. **Credit**: We will publicly credit you for the discovery (if desired)

## Security Best Practices

Honest status of each practice — claims below are marked either **in place**
or **planned** so this document reflects reality rather than aspiration.

### Code Security
- **Planned**: all user input is validated and sanitized (validation exists on
  mutating API routes today; not yet systematic)
- **In place**: Prisma parameterized queries (no string-built SQL)
- **In place**: environment variables for secrets (never hardcoded)
- **Planned**: regular dependency updates and scanning (Dependabot configured;
  Snyk token not yet wired in CI)
- **In place**: code reviews on all changes (CODEOWNERS + required reviews)

### Infrastructure Security
- **In place**: dedicated security group for data services, RDS in private
  subnets with `publicly_accessible = false`
- **Planned**: container image scanning
- **In place**: automated dependency updates via Dependabot
- **Planned**: security headers at the edge (the API sets `helmet` headers;
  no CDN/WAF layer yet)

### Generated App Security
- **Planned**: HTTPS-only enforcement in generated code
- **In place**: no hardcoded secrets in generated code (template-based,
  generated from static assets)
- **In place**: minimal permissions requested in AndroidManifest.xml
- **Planned**: input validation and sanitization in all generated apps
- **Planned**: secure storage practices for any local data

### Data Protection
- **Planned**: personal data encrypted at rest (RDS encryption not yet enabled)
- **Planned**: GDPR compliance assessment
- **Planned**: regular encrypted backups
- **Planned**: data retention and deletion policies
- **Planned**: privacy by design principles

## Security Tools & Processes

### Automated Scanning
- Dependabot for dependency updates
- Snyk for vulnerability scanning
- GitHub Advanced Security for code scanning
- Container scanning for Docker images
- Regular penetration testing

### Manual Processes
- Quarterly security audits
- Monthly dependency review
- Continuous security training for team
- Incident response plan and drills
- Security considerations in all design reviews

## Contact Information

- **Security Email**: security@elmahrosa.org
- **Response Time**: Within 48 hours for initial acknowledgment
- **Encryption**: We can provide PGP keys for encrypted communication upon request
- **Bug Bounty**: We do not currently operate a public bug bounty program, but we welcome responsible disclosure

## Acknowledgments

We thank all contributors and users who help us keep Elmahrosa AI App Store Builder secure through responsible disclosure and feedback.

*Last updated: September 2026*
