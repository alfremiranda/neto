import { defineConfig } from 'vitest/config'

// Vitest replaces vite.config.ts when present, so mirror the `@/` path alias
// (vite.config uses the same `resolve.tsconfigPaths` built-in). Pure-logic
// merge tests run in the node environment — no jsdom/react needed.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
