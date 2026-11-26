import { readFileSync } from "node:fs";

import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

import { exerciseLibrarySchema } from "../../src/shared/engine/exercise";
import { generateFirstWeek, type EngineProfile } from "../../src/shared/engine/plan";
import { isoWeekday, toOsloDate } from "../../src/shared/lib/dates";

// Story 2.3: Uke shows the week's plan for demo users A and C. A demo user's program starts the
// day they press «Prøv demo», so the first week holds only the days from today to Sunday. The
// expected sessions come from the same pure engine, called with today's date, so the tests hold
// on any weekday. Needs the compose database: `docker compose up -d db && npm run db:migrate`.

const { exercises } = exerciseLibrarySchema.parse(
  JSON.parse(readFileSync("data/exercises/exercises.json", "utf8")),
);

const PROFILES: Record<"A" | "C", EngineProfile> = {
  A: {
    focus: "strength",
    experience: "beginner",
    mainFocus: "full_body",
    sessionsPerWeek: 2,
    equipment: "gym",
  },
  C: { focus: "running", experience: "beginner", goal: "10k", longestRunKm: 3, sessionsPerWeek: 3 },
};

const SESSION_NAMES: Record<string, string> = {
  full_body: "Fullkropp",
  easy_short: "Rolig kortløp",
  fast_short: "Rask kortløp",
  long: "Langtur",
};

/** What Uke should show if the demo user was created just now. */
function expectedWeek(key: "A" | "C") {
  const today = toOsloDate(new Date());
  const plan = generateFirstWeek({
    profile: PROFILES[key],
    exercises,
    programStart: today,
    today,
  });
  return {
    sessions: plan.sessions,
    dayCount: 8 - isoWeekday(today),
    todayHasSession: plan.sessions.some((s) => s.date === today),
  };
}

async function startDemo(page: Page, key: "A" | "C") {
  await page.goto("/logg-inn");
  await page.getByRole("link", { name: "Prøv demo" }).click();
  await page.getByRole("button", { name: new RegExp(`^Profil ${key}\\b`) }).click();
  await expect(page).toHaveURL(/\/uke$/);
  await expect(page.getByRole("heading", { level: 1, name: "Uke" })).toBeVisible();
}

const dayRows = (page: Page) => page.locator("main ul > li");
const scrollsSideways = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

for (const key of ["A", "C"] as const) {
  test(`demo profile ${key}: Uke shows the counter, the days from today and today's row`, async ({
    page,
  }) => {
    const expected = expectedWeek(key);
    await startDemo(page, key);

    if (expected.sessions.length === 0) {
      // A start late in the week: no counter, and a line that the plan comes on Monday.
      await expect(page.getByText("Ukeplanen din kommer mandag.")).toBeVisible();
      await expect(page.getByText(/^0 av d+ økter$/)).toHaveCount(0);
    } else {
      await expect(page.getByText(`0 av ${expected.sessions.length} økter`)).toBeVisible();
    }
    await expect(dayRows(page)).toHaveCount(expected.dayCount);
    // Today is the first row and is marked with text, not only a border.
    await expect(dayRows(page).first()).toContainText("(i dag)");
    // A rest day says why rest matters; a day with a session names it.
    if (expected.todayHasSession) {
      await expect(dayRows(page).first()).not.toContainText("Hviledag");
    } else {
      await expect(dayRows(page).first()).toContainText("Hviledag");
      await expect(dayRows(page).first()).toContainText(/Hvile gir|Hvile gjør/);
    }
    for (const session of expected.sessions) {
      await expect(
        page
          .getByRole("link", {
            name: new RegExp(
              SESSION_NAMES[session.kind === "strength" ? session.template : session.runType],
            ),
          })
          .first(),
      ).toBeVisible();
    }
  });

  test(`demo profile ${key}: «Neste økt» is shown when today has no session`, async ({ page }) => {
    const expected = expectedWeek(key);
    await startDemo(page, key);
    const next = page.getByText(/^Neste økt: /);

    if (expected.todayHasSession || expected.sessions.length === 0) {
      await expect(next).toHaveCount(0);
    } else {
      await expect(next).toBeVisible();
    }
  });
}

test("a session opens from Uke: a strength session lists exercises with sets and reps", async ({
  page,
}) => {
  const expected = expectedWeek("A");
  test.skip(expected.sessions.length === 0, "No session is left this week for profile A");
  await startDemo(page, "A");

  await page
    .getByRole("link", { name: /Fullkropp/ })
    .first()
    .click();

  await expect(page.getByRole("heading", { level: 1, name: "Fullkropp" })).toBeVisible();
  await expect(page.locator("main ol > li")).toHaveCount(4);
  await expect(page.locator("main ol > li").first()).toContainText("3 sett × 10 repetisjoner");
  await expect(page.getByText(/\d+ ?kg/)).toHaveCount(0);

  await page.getByRole("link", { name: "Tilbake til uka" }).click();
  await expect(page).toHaveURL(/\/uke$/);
});

test("a run shows its type and its distance in km with one decimal", async ({ page }) => {
  const expected = expectedWeek("C");
  test.skip(expected.sessions.length === 0, "No session is left this week for profile C");
  await startDemo(page, "C");
  const first = expected.sessions[0];
  if (first.kind !== "run") throw new Error("profile C plans runs");

  await page
    .getByRole("link", { name: new RegExp(SESSION_NAMES[first.runType]) })
    .first()
    .click();

  await expect(
    page.getByRole("heading", { level: 1, name: SESSION_NAMES[first.runType] }),
  ).toBeVisible();
  await expect(page.getByText(`${first.distanceKm.toFixed(1).replace(".", ",")} km`)).toBeVisible();
});

test("the welcome hint shows once, closes with a ✕ of at least 44 px and stays closed", async ({
  page,
}) => {
  await startDemo(page, "A");
  const hint = page.getByRole("region", { name: "Tips" });
  await expect(hint).toBeVisible();

  const close = hint.getByRole("button", { name: "Lukk tipset" });
  const box = await close.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  await close.click();
  await expect(hint).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Uke" })).toBeVisible();
  await expect(hint).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "Hovedmeny" })
    .getByRole("link", { name: "Profil" })
    .click();
  await page
    .getByRole("navigation", { name: "Hovedmeny" })
    .getByRole("link", { name: "Uke" })
    .click();
  await expect(hint).toHaveCount(0);
});

test("a session that is not yours, or does not exist, shows «Fant ikke økta»", async ({ page }) => {
  await startDemo(page, "A");

  await page.goto("/uke/00000000-0000-4000-8000-000000000000");
  await expect(page.getByRole("heading", { level: 1, name: "Fant ikke økta" })).toBeVisible();
  await expect(page.locator("main ol")).toHaveCount(0);

  // A path that is not an id is the same page, not an error.
  await page.goto("/uke/ikke-en-id");
  await expect(page.getByRole("heading", { level: 1, name: "Fant ikke økta" })).toBeVisible();
});

test("Uke works at 320 px and 200 % text without sideways scroll, and without motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await startDemo(page, "C");
  await page.addStyleTag({ content: "html { font-size: 200%; }" });

  expect(await scrollsSideways(page)).toBe(false);
  await expect(page.getByRole("heading", { level: 1, name: "Uke" })).toBeVisible();
  for (const row of await dayRows(page).all()) {
    const box = await row.boundingBox();
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(320);
  }
});

test.describe("axe finds no WCAG 2.2 AA violations on Uke and a session", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`in ${theme}`, async ({ page, baseURL }) => {
      await page.context().addCookies([{ name: "theme", value: theme, url: baseURL }]);
      const scan = () =>
        new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();

      await startDemo(page, "A");
      expect((await scan()).violations, `/uke ${theme}`).toEqual([]);

      const session = page.getByRole("link", { name: /Fullkropp/ }).first();
      if ((await session.count()) > 0) {
        await session.click();
        await expect(page.getByRole("heading", { level: 1, name: "Fullkropp" })).toBeVisible();
        expect((await scan()).violations, `session ${theme}`).toEqual([]);
      }
    });
  }
});
