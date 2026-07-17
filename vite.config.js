import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    css: false,
    environment: 'jsdom',
    exclude: ['e2e-tests/**', 'node_modules/**', 'dist/**'],
    globals: true,
    setupFiles: './src/test/setupTests.js',
    testTimeout: 20000,
    coverage: {
      exclude: ['src/test/**', 'src/**/*.test.{js,jsx}', 'src/**/*.spec.{js,jsx}'],
      include: [
        'src/api/**/*.{js,jsx}',
        'src/components/**/*.{js,jsx}',
        'src/pages/Dashboard/**/*.{js,jsx}',
        'src/keycloak.js',
      ],
      provider: 'v8',
      reporter: ['text', 'cobertura'],
    },
  },
})
