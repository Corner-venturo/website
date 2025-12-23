import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer'
import { withSentryConfig } from '@sentry/nextjs'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {
  experimental: {
    // 優化常用套件的 tree-shaking
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-popover',
      'date-fns',
      '@supabase/supabase-js',
      'framer-motion',
    ],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'vvtlknlbnbnbavlnzrzs.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'pfqvdacxowpgfamuvnsn.supabase.co',
      },
    ],
  },

  // Next.js 16 Turbopack
  turbopack: {},
};

// Sentry 設定選項
const sentryWebpackPluginOptions = {
  // 只在生產環境且有 Sentry DSN 時才上傳 source maps
  silent: true,
  disableLogger: true,
  // 僅在有 auth token 時上傳
  hideSourceMaps: true,
}

export default withSentryConfig(
  withBundleAnalyzer(nextConfig),
  sentryWebpackPluginOptions
);
