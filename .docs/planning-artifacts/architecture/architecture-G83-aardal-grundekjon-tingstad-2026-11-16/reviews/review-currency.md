---
review: currency-of-technology
target: ../ARCHITECTURE-SPINE.md (with ../.memlog.md)
date: 2026-11-16
method: npm view (14 packages + dist-tags) and 9 web searches/fetches, 2026-11-16
---

# Review — Currency of technology

## Verdict

**The stack is current, but the spine leaves out a few setup details that could break it.** Every version in the Stack table matches npm `latest` today, and the model id and structured-output API are confirmed in Anthropic's docs. The risks are things the spine does not say: how the app connects to Supabase from Vercel functions, the PostgreSQL 18 Docker volume path, Better Auth cookie handling in Server Actions, how cookie-based dark mode works in Tailwind 4, and running migrations inside the Docker image. Each of these is a well-known way to fail and should be written into an AD or into the first story.

## Version check (npm, 2026-11-16)

| Package | Spine | npm `latest` today | Status |
| --- | --- | --- | --- |
| next | 16.4 | 16.4.6 | OK |
| react | 19.3 | 19.3.1 | OK |
| typescript | 7.0 | 7.0.2 | OK (see F-10) |
| drizzle-orm / drizzle-kit | 0.45 / 0.31 | 0.45.4 / 0.31.11 | OK; 1.0 is beta only |
| better-auth / @better-auth/drizzle-adapter | 1.7 | 1.7.25 / 1.7.25 | OK; `beta` tag is 1.8.0-beta.10 |
| @anthropic-ai/sdk | 1.9 | 1.9.0 | OK |
| zod | 4.6 | 4.6.7 | OK |
| tailwindcss | 4.3 | 4.3.5 | OK |
| vitest | 5.1 | 5.1.0 | OK |
| @playwright/test | 1.65 | 1.65.1 | OK |
| eslint / prettier | 10.15 / 3.10 | 10.15.0 / 3.10.1 | OK |

The memlog's version entries were checked again and match. Model `claude-haiku-5-5` exists as a Claude API id; the docs list pricing "from $0.10 / $0.50 per MTok" and retirement "not sooner than October 7, 2027" (source: https://platform.claude.com/docs/en/about-claude/models/overview).

## Findings

### F-1 — HIGH — The Supabase connection from Vercel functions is not specified (pooler, driver, prepared statements)

AD-14 says only "the Supabase PostgreSQL connection string as an environment variable", and AD-5 does not name a driver (the memlog lists both `postgres` 4.1.1 and `pg` 8.23.1). This is the most common way this stack fails:
- Vercel functions open many short-lived connections, so the app must go through Supabase's pooler (Supavisor, transaction mode, port 6543), not a direct connection.
- Transaction mode does not support prepared statements. With postgres.js you must set `prepare: false`, or you get errors like "prepared statement does not exist". One source also warns that postgres.js pipelining through the transaction pooler can hang queries.
- An alternative from Vercel and Supabase is the `pg` driver with `attachDatabasePool` from `@vercel/functions` (Fluid compute) and `drizzle-orm/node-postgres`. Supabase's own guide recommends this for connect-timeout and hanging-query problems.
- Migrations should use the direct or session connection (port 5432), not the transaction pooler.
- Not verified this session, from earlier knowledge: Supabase's direct connection (`db.<ref>.supabase.co`) may be IPv6-only without a paid add-on, so it cannot be reached from Vercel. Use the pooler host for both the app and migrations (session mode on 5432 for migrations).

**Recommendation:** Add to AD-5/AD-14: name one driver; use two variables, `DATABASE_URL` (pooled, transaction mode) and `DATABASE_URL_MIGRATIONS` (session or direct); and either set `prepare: false` (postgres.js) or use pg with `attachDatabasePool`. Locally in Docker, the same code can connect directly.

Sources:
- https://supabase.com/docs/guides/troubleshooting/disabling-prepared-statements-qL8lEL
- https://supabase.com/kb/troubleshooting/troubleshooting-connect_timeout-or-hanging-queries-in-vercel-serverless-functions-775f92
- https://vercel.com/kb/guide/efficiently-manage-database-connection-pools-with-fluid-compute
- https://supabase.com/docs/guides/troubleshooting/supavisor-faq-YyP5tI.md

### F-2 — HIGH — The `postgres:18` Docker image moved its data directory

The `postgres:18` image changed its default PGDATA to `/var/lib/postgresql/18/docker` and declares `/var/lib/postgresql` as the VOLUME. Older docker-compose examples mount `/var/lib/postgresql/data`. With that mount on 18, the container can exit with code 1, or the data is not persisted where you expect. Because the examiner runs `docker compose up` (AD-14), this would break NFR5 directly.

**Recommendation:** In AD-14 or the Docker story, state: `volumes: - pgdata:/var/lib/postgresql` (not `/data`), and pin `postgres:18` (or `18.x`). Also add a `healthcheck` (`pg_isready`) and `depends_on: condition: service_healthy`, so migrations do not run before the database is ready.

Sources:
- https://github.com/docker-library/postgres/issues/1370
- https://github.com/docker-library/postgres/pull/1259
- https://www.postgresql.org/message-id/EBBF5188-08B7-4434-9324-9FC9D67C3A94%40gmail.com

### F-3 — MEDIUM — Better Auth: the `nextCookies()` plugin, `proxy.ts`, and Better Auth's schema versus drizzle-kit

- **Server Actions:** When Better Auth runs from Server Actions (sign-in, sign-up, demo sign-in under AD-6), cookies are set only if the `nextCookies()` plugin from `better-auth/next-js` is added, and it must be the **last** plugin. Without it, sign-in "succeeds" but no session cookie is set.
- **`proxy.ts`:** Next.js 16 renamed `middleware.ts` to `proxy.ts`, which now runs on the Node runtime. Better Auth recommends that the proxy check only for the cookie (`getSessionCookie`). The real check must happen in every Server Action, Route Handler, or page (this matches AD-4/AD-6, but the spine should say plainly that the proxy is not a security boundary).
- **Schema conflict with AD-5:** Better Auth has its own CLI (`@better-auth/cli generate` / `migrate`). AD-5 requires every schema change to be a drizzle-kit migration. The rule should be: generate Better Auth's tables as a Drizzle schema in `src/shared/db/schema`, then run `drizzle-kit generate`. Never run Better Auth's `migrate`.
- **Version and docs:** `latest` is 1.7.25, but the docs site shows v1.6 and v1.8-beta pages. The adapter now also exists as a separate package (`@better-auth/drizzle-adapter` 1.7.25), while the guides import from `better-auth/adapters/drizzle`. The memlog already notes that the import path must be verified; keep that open as a task in the auth story.

Sources:
- https://better-auth.com/docs/integrations/next.md
- https://better-auth.com/docs/1.6/integrations/next
- https://better-auth.com/docs/beta/integrations/next

### F-4 — MEDIUM — Tailwind 4 dark mode follows the operating system by default; AD-12 needs a class or attribute variant

In Tailwind 4, the `dark:` variant uses `prefers-color-scheme` by default. AD-12 (light/dark/system in a cookie, read on the server) only works if the server sets a class or attribute on `<html>` from the cookie and Tailwind is told to use it: `@custom-variant dark (&:where(.dark, .dark *));` or the `[data-theme=dark]` form. For "system", the server can leave the attribute out, and a CSS media fallback is then needed. That means defining the tokens under both the media query and the class (the same pattern as the artifact rules: `:root:not([data-theme=light])` inside the media query).

Pitfall for AD-13: colour tokens that change in dark mode should be CSS variables on `:root`/`.dark`, mapped through `@theme`. Sources disagree on whether `@theme inline` freezes the values. Check against Tailwind's official docs before the token story.

Sources (mostly third-party; the official page was not fetched within the budget):
- https://tailwindcss.com/docs/dark-mode (official, recommended for verification)
- https://sharedcontext.ai/skills/external/lohnim/tailwind-v4-dark-mode
- https://playbooks.com/skills/wshobson/agents/tailwind-design-system

### F-5 — MEDIUM — Migrations and seed inside the Docker image (drizzle-kit is a devDependency)

AD-14 requires `docker compose up` to run migrations and seed profiles A–D. drizzle-kit is normally a devDependency, and Next.js `output: "standalone"` does not include it. A known pitfall is that the migration step fails in the production image. Choose one approach: run migrations in code with `migrate()` from `drizzle-orm/<driver>/migrator` against the committed SQL files, or use a separate one-off `migrate` service built from the full dev image. On Vercel, migrations must run outside the function (locally or in CI against the migrations URL from F-1).

Sources:
- https://orm.drizzle.team/docs/migrations (official; read before the Docker story)
- npm view drizzle-orm dist-tags (2026-11-16): `latest` 0.45.4, 1.0 only as beta. Pin `~0.45` so you do not get 1.0's breaking changes partway through.

### F-6 — LOW — Next.js 16: `cookies()` is async, and reading it in the layout makes rendering dynamic

The conventions the spine relies on still apply in Next.js 16: Server Actions, Route Handlers, and `cookies()` read on the server. But `cookies()`, `headers()` and `params` must now be awaited (`const c = await cookies()`), because synchronous access is gone. Reading the theme cookie in the root layout (AD-12) makes every route dynamically rendered. That is fine for this app, which needs a session on almost every page anyway, but it should be a conscious choice. The proxy does not protect Server Actions (see F-3).

Sources:
- https://ecorpit.com/nextjs-16-migration-async-request-apis-cache-components-2026/
- https://dev.to/pockit_tools/nextjs-16-migration-guide-turbopack-proxy-cache-components-and-every-breaking-change-explained-35ci
- https://nextjs.org/docs/app/guides/upgrading/version-16 (official, recommended for verification; not fetched)

### F-7 — LOW — Anthropic structured output is confirmed; the schema limits affect the shared Zod schema

Confirmed: `output_config.format` with `type: "json_schema"` is the GA path (no beta header), and Claude Haiku 5.5 is on the list of supported models. Things the spine should know:
- The schema sent must have `additionalProperties: false` on every object. It cannot use numeric limits (`minimum`, `maximum`), string-length limits, recursion, or `minItems` above 1; any of these gives a 400 error.
- The TypeScript SDK has `client.messages.parse()` with `zodOutputFormat(schema)`, which converts the Zod schema and validates the reply (`parsed_output`). This fits AD-8 ("same Zod schema as the Demo provider"). Constraints that cannot be sent are removed from the request but checked by Zod afterwards, so keep the full Zod validation.
- `stop_reason` values (`refusal`, `max_tokens`) were not in the part of the page that was read. AD-8's requirement to check `stop_reason` is still right, but the exact values should be checked in the Messages API reference in the coach story.
- The memlog's claim that "forced tool_choice gives a 400 on new models" was not verified in this review (it comes from the claude-api skill). Nothing in the spine depends on it, since tool_choice is not used.

Sources:
- https://platform.claude.com/docs/en/build-with-claude/structured-outputs
- https://platform.claude.com/docs/en/about-claude/models/overview

### F-8 — LOW — The Supabase free project pauses, and that risk is missing from the spine

The memlog notes that free projects pause after a week without use, but the spine (AD-14 / Deferred) does not mention it. If an examiner opens the published URL after a quiet week, the database may be paused. Add it under Deferred, with a mitigation (wake it before grading, or a scheduled ping). Not re-verified in this review.

### F-9 — INFO — PostgreSQL 19 is just around the corner; Supabase's version is unverified

According to the memlog, PostgreSQL 19 GA is planned for 19.11.2026, three days from now. Staying on 18 is right; pin the major version (`postgres:18`) so `latest` does not move. The spine's Deferred note (Supabase's version is unverified; the app uses nothing beyond PG 15) is a good mitigation.

### F-10 — LOW — TypeScript 7.0 (native compiler) with the rest of the toolchain was not verified

`typescript` 7.0.2 is `latest`, but this review did not verify that typescript-eslint, Drizzle's type inference, and Next.js 16.4's type check officially support TS 7. If anything fails during setup, fall back to TS 6.x/5.x. Note this as a check in the first setup story. (No source; not checked within the budget.)

## Summary of what the spine should change or add

1. AD-5/AD-14: driver, pooled vs migration URL, `prepare: false` or `attachDatabasePool` (F-1).
2. AD-14: `postgres:18` volume at `/var/lib/postgresql`, plus a healthcheck (F-2); migrations in code or in a separate service (F-5).
3. AD-6: `nextCookies()` last; `proxy.ts` only an optimistic check; Better Auth's schema goes through drizzle-kit (F-3).
4. AD-12/AD-13: Tailwind `@custom-variant dark` on a class or `data-theme` set from the cookie, plus a media fallback for "system" (F-4).
5. Deferred: the Supabase pause risk (F-8); verify TS 7 (F-10).
