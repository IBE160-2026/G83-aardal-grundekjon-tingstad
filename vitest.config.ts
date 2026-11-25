import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Use a local .env when there is one (DATABASE_URL turns on the integration tests); in CI the
// variables come from the environment.
try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on the environment.
}

const path = (relative: string) => fileURLToPath(new URL(relative, import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path("./src"),
      // `server-only` throws outside React Server Components; tests run server code directly.
      "server-only": path("./tests/stubs/server-only.ts"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/e2e/**", "tests/lint/fixtures/**", "node_modules/**"],
    environment: "node",
    // The lint test loads ESLint with the TypeScript resolver, which is slow on first run.
    testTimeout: 30_000,
    server: {
      deps: {
        // Better Auth's nextCookies() imports next/headers itself; inlining Better Auth lets the
        // integration tests' mock of next/headers reach that import.
        inline: ["better-auth"],
      },
    },
  },
});
