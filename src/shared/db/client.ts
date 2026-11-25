import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

// Supabase's transaction pooler listens on port 6543 and does not support prepared statements (AD-5).
const POOLER_PORT = "6543";

let db: Database | undefined;

/** Returns the shared database client, created on first use from `DATABASE_URL`. */
export function getDb(): Database {
  if (!db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set (see .env.example).");
    }
    const pooled = new URL(url).port === POOLER_PORT;
    db = drizzle(postgres(url, { prepare: !pooled }), { schema });
  }
  return db;
}
