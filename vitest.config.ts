import {defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

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
  },
})
