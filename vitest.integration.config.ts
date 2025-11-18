import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'integration',
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.integration.ts'],
    include: ['tests/integration/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    testTimeout: 30000, // 30 seconds for database operations
    hookTimeout: 30000,
    pool: 'forks', // Run tests in separate processes for isolation
    poolOptions: {
      forks: {
        singleFork: true, // Sequential execution for database tests
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
