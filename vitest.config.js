import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    exclude: ['e2e-tests/**', 'node_modules/**', 'dist/**'],
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
    css: false,
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setupTests.js',
  },
})
