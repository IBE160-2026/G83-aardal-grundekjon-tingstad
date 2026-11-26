import { builtinModules } from "node:module";

import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

// Slice edges from the architecture spine (AD-1). A slice may import another slice only
// through that slice's api.ts, and only along these edges.
const SLICE_EDGES = {
  account: [],
  onboarding: ["profile", "plan"],
  plan: ["logging", "profile"],
  logging: ["plan"],
  coach: ["plan", "profile", "account"],
  profile: ["plan"],
};

const ALL_SLICES = Object.keys(SLICE_EDGES);

/** Selector for the public surface (api.ts) of the given slices. */
const sliceApi = (slices) => ({
  to: { element: { type: "slice", captured: { slice: slices }, fileInternalPath: "api.ts" } },
});

// Database, network and framework modules that pure code must not import.
const IMPURE_MODULES = [
  "postgres",
  "drizzle-orm",
  "drizzle-orm/*",
  "@anthropic-ai/sdk",
  "next",
  "next/*",
  "react",
  "react-dom",
];

// Every Node.js builtin, with and without the `node:` prefix (fs, http, net, ...).
const NODE_BUILTINS = builtinModules.flatMap((name) =>
  name.startsWith("node:") ? [name] : [name, `node:${name}`],
);

const PURITY_MESSAGE = "engine and lib must stay pure: pass data in instead of importing I/O.";
const CLOCK_MESSAGE = "engine and lib must not read the clock: take the moment as an argument.";

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
      "tests/lint/fixtures/**",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app" },
        { type: "seed", pattern: "src/seed" },
        { type: "slice", pattern: "src/features/*", capture: ["slice"] },
        { type: "engine", pattern: "src/shared/engine" },
        { type: "lib", pattern: "src/shared/lib" },
        { type: "shared", pattern: "src/shared/*", capture: ["module"] },
      ],
      "boundaries/elements-single-match": true,
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          message:
            "Import not allowed by the architecture (AD-1): slices import each other only through api.ts and along the spine's edges, and engine and lib import only lib.",
          policies: [
            { from: { element: { type: "app" } }, allow: sliceApi(ALL_SLICES) },
            // «Prøv demo» (Story 1.4): routes call the seed, the only code that uses account and
            // profile together.
            { from: { element: { type: "app" } }, allow: { to: { element: { type: "seed" } } } },
            { from: { element: { type: "seed" } }, allow: sliceApi(ALL_SLICES) },
            ...ALL_SLICES.filter((slice) => SLICE_EDGES[slice].length > 0).map((slice) => ({
              from: { element: { type: "slice", captured: { slice } } },
              allow: sliceApi(SLICE_EDGES[slice]),
            })),
            {
              from: { element: { types: ["app", "seed", "slice"] } },
              allow: { to: { element: { types: ["shared", "engine", "lib"] } } },
            },
            {
              from: { element: { type: "shared" } },
              allow: { to: { element: { types: ["shared", "engine", "lib"] } } },
            },
            { from: { element: { type: "engine" } }, allow: { to: { element: { type: "lib" } } } },
          ],
        },
      ],
    },
  },
  {
    // engine and lib are pure: no clock, database, network or framework (AD-2, AD-13).
    files: ["src/shared/engine/**/*.{ts,tsx}", "src/shared/lib/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: NODE_BUILTINS.map((name) => ({ name, message: PURITY_MESSAGE })),
          patterns: [{ group: IMPURE_MODULES, message: PURITY_MESSAGE }],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message: CLOCK_MESSAGE,
        },
        { selector: "CallExpression[callee.name='Date']", message: CLOCK_MESSAGE },
      ],
      "no-restricted-properties": [
        "error",
        { object: "Date", property: "now", message: CLOCK_MESSAGE },
        { object: "performance", property: "now", message: CLOCK_MESSAGE },
      ],
    },
  },
];

export default config;
