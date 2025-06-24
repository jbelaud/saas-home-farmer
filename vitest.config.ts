import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'
import {defineConfig} from 'vitest/config'
dotenv.config({path: path.resolve(__dirname, '.env.test')})

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: [
      './src/__tests__/setup-test.ts',
      './src/services/__tests__/setup-mocks.ts',
    ],
    include: ['**/*.test.{ts,tsx}'],
    alias: {
      '@/*': './src/*',
    },
    globals: true, // cleanup globals activé
    fileParallelism: false,
    server: {
      deps: {
        // https://github.com/vercel/next.js/issues/77200
        inline: ['next-intl'],
      },
    },
  },
})
