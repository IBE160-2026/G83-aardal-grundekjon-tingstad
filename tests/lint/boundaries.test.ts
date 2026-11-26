import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { ESLint } from "eslint";
import { beforeAll, describe, expect, it } from "vitest";

// Lints probe code placed at paths in tests/lint/fixtures with the project's real ESLint
// config, to prove the slice boundary rule (AD-1) and the purity rule for engine and lib.
const root = fileURLToPath(new URL("../..", import.meta.url));
const fixtures = fileURLToPath(new URL("./fixtures", import.meta.url));

// The allowed edges from the architecture spine, written out here on purpose: the test must
// fail if eslint.config.mjs drops or adds an edge.
const SPINE_EDGES: Record<string, string[]> = {
  account: [],
  onboarding: ["profile", "plan"],
  plan: ["logging", "profile"],
  logging: ["plan"],
  coach: ["plan", "profile", "account"],
  profile: ["plan"],
};
const SLICES = Object.keys(SPINE_EDGES);
const pairs = SLICES.flatMap((from) =>
  SLICES.filter((to) => to !== from).map((to) => ({ from, to })),
);
const allowedEdges = pairs.filter(({ from, to }) => SPINE_EDGES[from].includes(to));
const missingEdges = pairs.filter(({ from, to }) => !SPINE_EDGES[from].includes(to));

let eslint: ESLint;

beforeAll(() => {
  eslint = new ESLint({
    cwd: fixtures,
    overrideConfigFile: `${root}/eslint.config.mjs`,
    // The fixtures are ignored by `npm run lint`; lint them here on purpose.
    ignore: false,
  });
});

/** Lints `code` as if it were the file at `path` (relative to fixtures) and returns the rule ids. */
async function ruleIds(path: string, code: string): Promise<string[]> {
  const [result] = await eslint.lintText(code, { filePath: join(fixtures, path) });
  return result.messages.map((message) => message.ruleId ?? "fatal");
}

const importFrom = (source: string) =>
  `import { api } from "${source}";\n\nexport const probe = api;\n`;

describe("slice edges", () => {
  it.each(allowedEdges)("allows $from -> $to through api.ts", async ({ from, to }) => {
    expect(await ruleIds(`src/features/${from}/probe.ts`, importFrom(`../${to}/api`))).toEqual([]);
  });

  it.each(missingEdges)("rejects $from -> $to (no edge in the spine)", async ({ from, to }) => {
    expect(await ruleIds(`src/features/${from}/probe.ts`, importFrom(`../${to}/api`))).toEqual([
      "boundaries/dependencies",
    ]);
  });

  it.each(allowedEdges)("rejects $from -> $to internals", async ({ from, to }) => {
    const code = `import { internal } from "../${to}/internal";\n\nexport const probe = internal;\n`;
    expect(await ruleIds(`src/features/${from}/probe.ts`, code)).toEqual([
      "boundaries/dependencies",
    ]);
  });
});

describe("routes, seed and shared code", () => {
  it.each(["src/app/page.tsx", "src/seed/probe.ts"])(
    "%s may use a slice's api.ts",
    async (path) => {
      expect(await ruleIds(path, importFrom("../features/profile/api"))).toEqual([]);
    },
  );

  it.each(["src/app/page.tsx", "src/seed/probe.ts"])(
    "%s may not use a slice's internals",
    async (path) => {
      const code = `import { internal } from "../features/profile/internal";\n\nexport const probe = internal;\n`;
      expect(await ruleIds(path, code)).toEqual(["boundaries/dependencies"]);
    },
  );

  it("src/app may use the seed («Prøv demo»)", async () => {
    expect(await ruleIds("src/app/page.tsx", importFrom("../seed/actions"))).toEqual([]);
  });

  it.each([
    "src/features/account/probe.ts",
    "src/features/profile/probe.ts",
    "src/shared/ui/probe.ts",
  ])("%s may not use the seed", async (path) => {
    const depth = path.split("/").length - 2;
    const code = importFrom(`${"../".repeat(depth)}seed/actions`);
    expect(await ruleIds(path, code)).toEqual(["boundaries/dependencies"]);
  });

  it.each(["src/shared/ui/probe.ts", "src/shared/lib/probe.ts", "src/shared/engine/probe.ts"])(
    "%s may not import a slice",
    async (path) => {
      expect(await ruleIds(path, importFrom("../../features/profile/api"))).toEqual([
        "boundaries/dependencies",
      ]);
    },
  );
});

describe("engine and lib stay pure", () => {
  it.each(["engine", "lib"])("%s may not import the database client or driver", async (dir) => {
    const code = `import postgres from "postgres";\n\nimport { db } from "../db/client";\n\nexport const probe = [db, postgres];\n`;
    const ids = await ruleIds(`src/shared/${dir}/probe.ts`, code);
    expect(ids).toContain("boundaries/dependencies");
    expect(ids).toContain("no-restricted-imports");
  });

  it.each(["fs", "http", "node:fs", "node:net"])("engine may not import %s", async (builtin) => {
    const code = `import * as io from "${builtin}";\n\nexport const probe = io;\n`;
    expect(await ruleIds("src/shared/engine/probe.ts", code)).toEqual(["no-restricted-imports"]);
  });

  it.each([
    ["Date.now()", "no-restricted-properties"],
    ["new Date()", "no-restricted-syntax"],
    ["Date()", "no-restricted-syntax"],
    ["performance.now()", "no-restricted-properties"],
  ])("lib may not read the clock with %s", async (expression, rule) => {
    expect(
      await ruleIds("src/shared/lib/probe.tsx", `export const probe = ${expression};\n`),
    ).toEqual([rule]);
  });

  it("lib may build a date from a given moment", async () => {
    const code = `export const probe = (moment: string) => new Date(moment);\n`;
    expect(await ruleIds("src/shared/lib/probe.ts", code)).toEqual([]);
  });
});
