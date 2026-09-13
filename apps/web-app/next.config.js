/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required so the multi-stage Dockerfile can copy a minimal, self-contained
  // server bundle instead of node_modules + full source into the final image.
  output: 'standalone',
}

module.exports = nextConfig
