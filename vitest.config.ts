import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/e2e/**", "tests/lint/fixtures/**", "node_modules/**"],
    environment: "node",
    // The lint test loads ESLint with the TypeScript resolver, which is slow on first run.
    testTimeout: 30_000,
  },
});
