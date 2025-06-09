import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import {defineConfig} from 'vitest/config'

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
