import { randomUUID } from "node:crypto";

import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

import { completeOnboarding } from "./onboarding-helper";

// Story 1.4: «Prøv demo» on the login screen, the profile picker A–D, and the «Demo» badge.
// The demo users are created by pressing the button, which runs the same seed code (AD-16).
// Needs the compose database: `docker compose up -d db && npm run db:migrate`.

const PROFILES = ["A", "B", "C", "D"] as const;

const badge = (page: Page) => page.getByText("Demo", { exact: true });
const card = (page: Page, key: string) =>
  page.getByRole("button", { name: new RegExp(`^Profil ${key}\\b`) });

async function openPicker(page: Page) {
  await page.goto("/logg-inn");
  await page.getByRole("link", { name: "Prøv demo" }).click();
  await expect(page).toHaveURL(/\/prov-demo$/);
  await expect(page.getByRole("heading", { level: 1, name: "Prøv demo" })).toBeVisible();
}

for (const key of PROFILES) {
  test(`Prøv demo with profile ${key} lands on Uke with the Demo badge`, async ({ page }) => {
    await openPicker(page);
    await card(page, key).click();

    await expect(page).toHaveURL(/\/uke$/);
    await expect(page.getByRole("heading", { level: 1, name: "Uke" })).toBeVisible();
    await expect(badge(page)).toBeVisible();

    await page
      .getByRole("navigation", { name: "Hovedmeny" })
      .getByRole("link", { name: "Profil" })
      .click();
    await expect(page).toHaveURL(/\/profil$/);
    await expect(badge(page)).toBeVisible();
  });
}

test("the picker shows four profiles with descriptions and a way back", async ({ page }) => {
  await openPicker(page);

  await expect(page.getByRole("button", { name: /^Profil [A-D]\b/ })).toHaveCount(4);
  await expect(card(page, "C")).toContainText(
    "Løping for nybegynnere: mål 10 km, løper 3 km i dag, tre økter i uka.",
  );
  for (const key of PROFILES) {
    const box = await card(page, key).boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }

  await page.getByRole("link", { name: "Tilbake til innlogging" }).click();
  await expect(page).toHaveURL(/\/logg-inn$/);
});

test("a double click creates one demo user: the cards ignore presses while pending", async ({
  page,
}) => {
  await openPicker(page);
  let posts = 0;
  let release: () => void = () => undefined;
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/prov-demo", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    posts += 1;
    await held;
    await route.continue();
  });

  await card(page, "A").click();
  await expect(card(page, "A")).toHaveAttribute("aria-disabled", "true");
  await expect(card(page, "B")).toHaveAttribute("aria-disabled", "true");
  // Playwright waits for aria-disabled buttons to be enabled; force presses them anyway.
  await card(page, "A").click({ force: true });
  await card(page, "B").click({ force: true });
  release();

  await expect(page).toHaveURL(/\/uke$/);
  expect(posts).toBe(1);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("picking a profile still starts the demo", async ({ page }) => {
    await page.goto("/prov-demo");
    await card(page, "C").click();
    await expect(page).toHaveURL(/\/uke$/);
    await expect(badge(page)).toBeVisible();
  });
});

test("a registered user has no Demo badge", async ({ page }) => {
  await page.goto("/registrer");
  await page.getByLabel("E-post").fill(`e2e-${randomUUID().slice(0, 12)}@flexpt.test`);
  await page.getByLabel("Passord").fill("hemmelig1");
  await page.getByRole("button", { name: "Registrer" }).click();
  await completeOnboarding(page);
  await expect(badge(page)).toHaveCount(0);

  await page.goto("/profil");
  await expect(page.getByRole("heading", { level: 1, name: "Profil" })).toBeVisible();
  await expect(badge(page)).toHaveCount(0);
});

test.describe("axe finds no WCAG 2.2 AA violations", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`on /prov-demo and Uke with the badge in ${theme}`, async ({ page, baseURL }) => {
      await page.context().addCookies([{ name: "theme", value: theme, url: baseURL }]);
      const scan = () =>
        new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();

      await openPicker(page);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      expect((await scan()).violations, "/prov-demo").toEqual([]);

      await card(page, "B").click();
      await expect(page).toHaveURL(/\/uke$/);
      await expect(badge(page)).toBeVisible();
      expect((await scan()).violations, "/uke").toEqual([]);
    });
  }
});

test.describe("at 320 px and 200 % text", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  const enlargeText = (page: Page) =>
    page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
  const scrollsSideways = (page: Page) =>
    page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

  test("the picker and Uke with the badge do not scroll sideways", async ({ page }) => {
    await openPicker(page);
    await enlargeText(page);
    expect(await scrollsSideways(page), "/prov-demo").toBe(false);

    await card(page, "D").click();
    await expect(page).toHaveURL(/\/uke$/);
    await enlargeText(page);
    await expect(badge(page)).toBeVisible();
    expect(await scrollsSideways(page), "/uke").toBe(false);
  });
});
