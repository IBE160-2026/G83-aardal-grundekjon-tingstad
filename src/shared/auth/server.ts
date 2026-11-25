import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { getDb } from "../db/client";
import * as schema from "../db/schema";

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET is not set. Set it in .env (see .env.example); docker compose sets a local-only default.",
    );
  }
  return betterAuth({
    secret,
    baseURL: process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(getDb(), { provider: "pg", schema }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: MIN_PASSWORD_LENGTH,
      maxPasswordLength: MAX_PASSWORD_LENGTH,
      autoSignIn: true,
    },
    // nextCookies() must be the last plugin: it writes Better Auth's cookies from Server Actions.
    plugins: [nextCookies()],
  });
}

export type Auth = ReturnType<typeof createAuth>;

// Created on first use, not at import, so `next build` works without runtime secrets, and kept
// on globalThis so hot reloads in `next dev` reuse one instance.
const cache = globalThis as typeof globalThis & { flexptAuth?: Auth };

/** Returns the Better Auth instance. Throws a clear error when BETTER_AUTH_SECRET is missing. */
export function getAuth(): Auth {
  cache.flexptAuth ??= createAuth();
  return cache.flexptAuth;
}
