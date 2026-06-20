import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    // Keep Playwright e2e specs (tests/) out of the unit runner.
    exclude: ['tests/**', 'node_modules/**'],
  },
})
