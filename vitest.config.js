import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setupTests.js',
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'cobertura'],
      include: [
        'src/api/**/*.{js,jsx}',
        'src/components/**/*.{js,jsx}',
        'src/pages/Dashboard/**/*.{js,jsx}',
        'src/keycloak.js',
      ],
      exclude: ['src/test/**', 'src/**/*.test.{js,jsx}', 'src/**/*.spec.{js,jsx}'],
    },
  },
})
