/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/unit/test-setup.ts'],
    include: ['tests/unit/**/*.spec.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
})