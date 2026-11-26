import { defineConfig, devices } from "@playwright/test";

// Use a local .env when there is one; in CI the variables come from the environment.
try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on the environment.
}

const PORT = 3100;
// Set E2E_BASE_URL to test an app that is already running, e.g. the Docker image on port 3000.
const externalBaseUrl = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Server actions that make a plan (onboarding) can take a few seconds on a cold server with
  // several workers; the default 5 s is too tight for a URL change after them.
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: externalBaseUrl ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Pixel 7"] } }],
  webServer: externalBaseUrl
    ? undefined
    : {
        // Test the production build, as the examiner runs it. Needs the compose database:
        // `docker compose up -d db && npm run db:migrate`.
        command: `npm run build && npm run start -- --port ${PORT}`,
        url: `http://localhost:${PORT}/logg-inn`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        env: {
          DATABASE_URL:
            process.env.DATABASE_URL ?? "postgres://flexpt:flexpt@localhost:5432/flexpt",
          // Test-only value, not a secret; a BETTER_AUTH_SECRET from the environment wins.
          BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || "e2e-only-not-a-secret",
          BETTER_AUTH_URL: `http://localhost:${PORT}`,
        },
      },
});
