import createMDX from '@next/mdx'
import type {NextConfig} from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const nextConfig: NextConfig = {
  allowedDevOrigins: ['localhost'],
  pageExtensions: ['js', 'jsx', 'mdx', 'md', 'ts', 'tsx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'iyatdxbvlmszswgoevtc.supabase.co',
        port: '',
      },
    ],
  },

  experimental: {
    authInterrupts: true,
    taint: true,
    useCache: true,
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

export default withNextIntl(withMDX(nextConfig))
