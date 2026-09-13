# Release Process

## Overview
This document outlines the release process for Elmahrosa AI App Store Builder.

## Release Types
- **Patch** (x.y.Z): Bug fixes and minor improvements
- **Minor** (x.Y.z): New features, backwards compatible
- **Major** (X.y.z): Breaking changes, major new features

## Release Cycle
1. Development happens in feature branches
2. Features are merged to `master` (the default branch) via pull requests
3. Release candidates are created from `master`
4. Final releases are tagged on `master`
5. `develop` may be reintroduced as an integration branch once the team grows;
   until then master-only keeps the flow honest with the branch that exists

## Pre-Release Checklist
### Code Quality
- [ ] All tests pass
- [ ] Code review completed
- [ ] No linting errors
- [ ] Dependency updates reviewed
- [ ] Security scans passed

### Documentation
- [ ] README updated if needed
- [ ] API documentation updated
- [ ] Changelog entry added
- [ ] Breaking changes documented

### Versioning
- [ ] Version number updated in package.json
- [ ] Version number updated in relevant service configs
- [ ] Changelog entry created

## Release Steps

### 1. Prepare Release Branch
```bash
git checkout master
git pull origin master
git checkout -b release/v0.1.1
```

### 2. Update Version Numbers
Update version in:
- `package.json` (root)
- Individual service package.json files as needed
- Update changelog

### 3. Run Tests
```bash
pnpm install && pnpm test
# Ensure all tests pass
```

### 4. Create Release Candidate
```bash
git commit -am "chore: prepare release v0.1.1"
git tag -a v0.1.1 -m "Release v0.1.1"
git push origin release/v0.1.1 --tags
```

### 5. Deploy to Staging
- GitHub Actions will automatically deploy rc to staging
- Perform smoke tests
- Verify functionality

### 6. Release to Production
```bash
git checkout master
git pull origin master
git merge --no-ff release/v0.1.1
git push origin master
git push origin --tags
```

### 7. Post-Release
- Delete release branch: `git branch -d release/v1.2.3`
- Publish release notes on GitHub
- Announce to stakeholders
- Monitor for issues

## Hotfix Process
For critical issues in production:

```bash
# From master branch
git checkout -b hotfix/v0.1.2
# Fix the issue
git commit -am "fix: critical issue description"
git checkout master
git merge --no-ff hotfix/v0.1.2
git tag -a v0.1.2 -m "Hotfix v0.1.2"
git push origin master --tags
git branch -d hotfix/v0.1.2
```

## Automation
GitHub Actions automates:
- Building Docker images
- Running tests
- Security scanning
- Deploying to staging/production based on tags/branches

## Dependencies
- Use Dependabot for automated dependency updates
- Review and merge dependency PRs regularly
- Major version updates require manual testing

## Signing and Artifacts
- Android artifacts are signed with release keys
- Keys managed via secure secret management
- Artifacts stored in secure artifact repository
- Provenance and integrity verified
