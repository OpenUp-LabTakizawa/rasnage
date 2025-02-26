import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
    reactCompiler: true,
    viewTransition: true,
  },
  output: "standalone",
}

export default nextConfig
