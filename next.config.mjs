import { validateEnvironment } from './lib/env.mjs'

validateEnvironment()

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@stellar/stellar-sdk', '@noble/hashes', '@noble/ed25519', '@noble/curves', '@scure/base'],
}

export default nextConfig
