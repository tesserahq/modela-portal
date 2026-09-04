import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './app'),
      '@shadcn': resolve(__dirname, './app/modules/shadcn'),
    },
  },
  test: {
    include: ['app/**/*.test.ts'],
  },
})
