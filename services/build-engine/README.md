# Build Engine

> **EXPERIMENTAL — QUARANTINED (Phase 0.7 of the remediation order).**
> The sample app in `app/` cannot currently compile (8 independent defects,
> finding C-5). This service is excluded from docker-compose and CI matrices
> until the Phase 3 rebuild lands. Do not treat this service as functional.

This service handles building Android apps using Gradle and Fastlane.

## Overview

The build engine is designed to:
1. Accept a zip of source code or a git URL
2. Build Android applications using Gradle
3. Sign the build using configured signing credentials
4. Export the built AAB/APK files

## Sample Application

This repository includes a sample Todo List application built with:
- Kotlin
- Jetpack Compose
- Material Design 3

## Directory Structure

- `app/` - Android application source code
- `fastlane/` - Fastlane configuration for build automation
- `gradle/` - Gradle wrapper configuration
- `Dockerfile` - Docker image for building Android apps
- `build.gradle` - Gradle build configuration
- `settings.gradle` - Gradle settings

## Environment Variables

For signing releases, the following environment variables should be set:
- `RELEASE_STORE_FILE` - Path to the keystore file
- `RELEASE_STORE_PASSWORD` - Password for the keystore
- `RELEASE_KEY_ALIAS` - Alias for the key in the keystore
- `RELEASE_KEY_PASSWORD` - Password for the key

## Usage

### Local Development

```bash
# Build debug version
./gradlew assembleDebug

# Build release version
./gradlew assembleRelease
```

### Using Fastlane

```bash
# Build debug version
fastlane build_debug

# Build release version
fastlane build_release

# Full CI pipeline (build, sign, export)
fastlane ci
```

### Using Docker

```bash
# Build the Docker image
docker build -t android-build-engine .

# Run the build engine (mount your source code)
docker run -v $(pwd):/app android-build-engine ./gradlew assembleRelease
```

## Output

Built artifacts will be available in:
- AAB: `app/build/outputs/bundle/release/app-release.aab`
- APK: `app/build/outputs/apk/release/app-release.apk`

## Customization

To use this build engine with your own Android application:
1. Replace the contents of the `app/` directory with your source code
2. Update `build.gradle` with your application ID and dependencies
3. Update `AndroidManifest.xml` with your package name
4. Configure signing credentials via environment variables
