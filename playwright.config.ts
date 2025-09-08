import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()
export default defineConfig({
  // Test directory - specifically your test folder in backend
  testDir: './test',
  
  // Test file patterns - match your specific file
  testMatch: [
    '**/soundcloud-test.spec.ts'
  ],
  
  // Ignore NestJS source files and other test files
  testIgnore: [
    'src/**/*.spec.ts',     // NestJS unit tests
    'src/**/*.controller.ts', // Controllers
    'src/**/*.service.ts',   // Services
    'src/**/*.module.ts',    // Modules
    'dist/**',               // Built files
    'node_modules/**'                // Dependencies
  ],

  // Global timeout for each test
  timeout: 60000,
  
  // Expect timeout for assertions
  expect: {
    timeout: 10000
  },

  // Run tests in parallel
  fullyParallel: false, // Set to false for OAuth flow to avoid conflicts
  
  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 1 : 0,
  
  // Use 1 worker to avoid OAuth conflicts
  workers: 1,

  // Reporter to use
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],

  // Shared settings for all tests
  use: {
    // Base URL for your app
    baseURL: 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'retain-on-failure',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video recording
    video: 'retain-on-failure',
    
    // Browser context options
    ignoreHTTPSErrors: true,
    
    // Viewport size
    viewport: { width: 1280, height: 720 }
  },

  // Configure projects for browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Launch options for OAuth testing
        launchOptions: {
          slowMo: 1000, // Slow down by 1 second for better visibility
        }
      },
    }
  ],

  // Optional: Run your NestJS server before tests
  // Uncomment if you want Playwright to start your server automatically
  /*
  webServer: {
    command: 'npm run start:dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  */
});