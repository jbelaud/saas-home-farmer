import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'
import {defineConfig} from 'vitest/config'
dotenv.config({path: path.resolve(__dirname, '.env.test')})

// Configuration avec projects pour différents environnements
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    projects: [
      // Projet pour les tests serveur (services, db) avec Node
      {
        plugins: [react(), tsconfigPaths()],
        test: {
          name: 'client',
          environment: 'jsdom',
          setupFiles: [
            './src/__tests__/setup-test.ts',
            './src/services/__tests__/setup-mocks.ts',
          ],
          include: ['src/**/*.test.{ts,tsx}'],
          globals: true, // cleanup globals activé
          // fileParallelism: false,
          server: {
            deps: {
              // https://github.com/vercel/next.js/issues/77200
              inline: ['next-intl'],
            },
          },
        },
      },
      // Projet pour les tests client (components, app) avec jsdom
      {
        plugins: [react(), tsconfigPaths()],
        test: {
          name: 'server',
          environment: 'jsdom',
          include: [
            'src/app/**/*.test.{ts,tsx}',
            'src/components/**/*.test.{ts,tsx}',
          ],
          globals: true,
          server: {
            deps: {
              // https://github.com/vercel/next.js/issues/77200
              inline: ['next-intl'],
            },
          },
        },
      },
    ],
  },
})
