import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against the real stack: this storefront (vite preview on
 * :3000) talking to the backend API (:5000) with MongoDB (replica set) and
 * Redis, seeded by the backend's scripts/seed-dev.js before every run.
 *
 *   E2E_BACKEND_DIR   path to the backend checkout (default: ../backend)
 *   E2E_MONGO_URI     database to (re)seed — its name must contain dev/e2e/test
 *   E2E_REDIS_URL     redis to flush after seeding (default redis://localhost:6379)
 *
 * The servers are started by CI (see .github/workflows/ci.yml) or by hand.
 */
export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.mjs",
  globalSetup: "./e2e/global-setup.mjs",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testIgnore: /admin\.spec/ },
  ],
});
