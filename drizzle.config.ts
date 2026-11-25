import { defineConfig } from "drizzle-kit";

// Use a local .env when there is one; in Docker and CI the variables come from the environment.
try {
  process.loadEnvFile();
} catch {
  // No .env file: rely on the environment.
}

// Migrations run against the direct connection, never the transaction pooler (AD-5).
const url = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  throw new Error("Set DATABASE_DIRECT_URL or DATABASE_URL to run drizzle-kit (see .env.example).");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/shared/db/schema/index.ts",
  out: "./src/shared/db/migrations",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
