/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/unit/test-setup.ts'],
    include: ['tests/unit/**/*.spec.{ts,tsx}'],
    env: {
      NEXT_PUBLIC_APP_BASE_URL: 'http://localhost:3000',
      DATABASE_URL: 'libsql://test.db',
      DATABASE_AUTH_TOKEN: 'test-token',
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
})