import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { TestDataCleanup } from './helpers/supabaseTestClient';

/**
 * Global test cleanup tracker
 * Each test suite should create its own instance, but this serves as a fallback
 */
let globalCleanup: TestDataCleanup;

/**
 * Setup before all tests
 */
beforeAll(async () => {
  console.log('🧪 Integration test suite starting...');
  globalCleanup = new TestDataCleanup();
});

/**
 * Cleanup after all tests
 */
afterAll(async () => {
  console.log('🧹 Cleaning up integration test data...');
  await globalCleanup.cleanupAll();
  console.log('✅ Integration test suite complete');
});

/**
 * Before each test - log test name
 */
beforeEach(async (context) => {
  console.log(`\n▶️  Running: ${context.task.name}`);
});

/**
 * After each test - small delay to let DB operations settle
 */
afterEach(async () => {
  await new Promise(resolve => setTimeout(resolve, 100));
});

/**
 * Make cleanup utilities available globally
 */
declare global {
  var testCleanup: TestDataCleanup;
}

globalThis.testCleanup = globalCleanup;
