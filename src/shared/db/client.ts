import "server-only";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

// Supabase's transaction pooler listens on port 6543 and does not support prepared statements (AD-5).
const POOLER_PORT = "6543";

// Kept on globalThis so hot reloads in `next dev` reuse one pool instead of opening a new one.
const cache = globalThis as typeof globalThis & { flexptDb?: Database };

function portOf(url: string): string {
  try {
    return new URL(url).port;
  } catch {
    throw new Error("DATABASE_URL is not a valid URL (see .env.example).");
  }
}

/** Returns the shared database client, created on first use from `DATABASE_URL`. */
export function getDb(): Database {
  if (!cache.flexptDb) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set (see .env.example).");
    }
    const pooled = portOf(url) === POOLER_PORT;
    cache.flexptDb = drizzle(postgres(url, { prepare: !pooled }), { schema });
  }
  return cache.flexptDb;
}
