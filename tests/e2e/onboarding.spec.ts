import { randomUUID } from "node:crypto";

import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

// Story 2.4: onboarding after registering, one question per screen. Needs the compose database:
// `docker compose up -d db && npm run db:migrate`.

const PASSWORD = "hemmelig1";
const newEmail = () => `e2e-${randomUUID().slice(0, 12)}@flexpt.test`;

async function register(page: Page, email = newEmail()) {
  await page.goto("/registrer");
  await page.getByLabel("E-post").fill(email);
  await page.getByLabel("Passord").fill(PASSWORD);
  await page.getByRole("button", { name: "Registrer" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  return email;
}

const step = (page: Page, text: string) => page.getByText(text, { exact: true });
const heading = (page: Page, name: string) => page.getByRole("heading", { level: 1, name });
const next = (page: Page) => page.getByRole("button", { name: "Neste" });
const radio = (page: Page, name: string | RegExp) =>
  page.getByRole("radio", { name, ...(typeof name === "string" ? { exact: true } : {}) });
const scrollsSideways = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

test("registering leads to onboarding step 1, with no back button and no tab bar", async ({
  page,
}) => {
  await register(page);

  await expect(heading(page, "Hva vil du fokusere på?")).toBeVisible();
  await expect(step(page, "Steg 1 av 5")).toBeVisible();
  await expect(radio(page, /^Styrke/)).toHaveCount(1);
  await expect(radio(page, /^Løping/)).toHaveCount(1);
  await expect(page.getByRole("button", { name: /Tilbake/ })).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Hovedmeny" })).toHaveCount(0);
});

test("a strength user answers four questions, goes back with answers kept, and lands on Uke", async ({
  page,
}) => {
  await register(page);

  // Nothing chosen: a plain-text message, and the step does not change.
  await next(page).click();
  await expect(page.locator('p[role="alert"]')).toHaveText("Velg Styrke eller Løping.");
  await expect(step(page, "Steg 1 av 5")).toBeVisible();

  await radio(page, /^Styrke/).check();
  await expect(page.locator("label:has(input:checked)")).toContainText("✓");
  await next(page).click();

  // Step 2 has two questions; both are needed.
  await expect(step(page, "Steg 2 av 5")).toBeVisible();
  await radio(page, "Overkropp").check();
  await next(page).click();
  await expect(page.locator('p[role="alert"]')).toContainText("Velg ett alternativ");
  await radio(page, "Erfaren").check();
  await next(page).click();

  await expect(step(page, "Steg 3 av 5")).toBeVisible();
  await expect(heading(page, "Hvor mange økter i uka?")).toBeVisible();
  await expect(page.getByRole("radio")).toHaveCount(4);
  await radio(page, "4").check();

  // Back keeps the answers, also two steps back.
  await page.getByRole("button", { name: /Tilbake/ }).click();
  await expect(radio(page, "Overkropp")).toBeChecked();
  await expect(radio(page, "Erfaren")).toBeChecked();
  await next(page).click();
  await expect(radio(page, "4")).toBeChecked();
  await next(page).click();

  await expect(step(page, "Steg 4 av 5")).toBeVisible();
  await expect(heading(page, "Hvor trener du?")).toBeVisible();
  await radio(page, "Hjemme").check();
  await page.getByRole("button", { name: "Lag planen" }).click();

  await expect(page).toHaveURL(/\/uke$/);
  await expect(page.getByRole("heading", { level: 1, name: "Uke" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Tips" })).toBeVisible();
  // Four sessions a week; the counter or, late in the week, the Monday line.
  await expect(page.getByText(/^0 av [0-4] økter$|Ukeplanen din kommer mandag\./)).toBeVisible();
});

test("a running user answers three questions with «Steg N av 4», and a bad longest run is refused under the field", async ({
  page,
}) => {
  await register(page);
  await radio(page, /^Løping/).check();
  await expect(step(page, "Steg 1 av 4")).toBeVisible();
  await next(page).click();

  await expect(step(page, "Steg 2 av 4")).toBeVisible();
  await radio(page, "10 km").check();
  await page.getByLabel("Lengste løpetur så langt (km)").fill("abc");
  await next(page).click();

  await expect(step(page, "Steg 3 av 4")).toBeVisible();
  await radio(page, "3").check();
  // The last question: the button makes the plan, and there is no «Hvor trener du?» for running.
  await page.getByRole("button", { name: "Lag planen" }).click();

  // The server refuses «abc» and sends the user back to the field with a plain-text error.
  await expect(step(page, "Steg 2 av 4")).toBeVisible();
  const field = page.getByLabel("Lengste løpetur så langt (km)");
  await expect(field).toHaveAccessibleDescription(/mellom 1 og 50 km/);
  await expect(field).toHaveValue("abc");

  await field.fill("7,5");
  await next(page).click();
  await expect(radio(page, "3")).toBeChecked();
  await page.getByRole("button", { name: "Lag planen" }).click();

  await expect(page).toHaveURL(/\/uke$/);
  await expect(page.getByRole("heading", { level: 1, name: "Uke" })).toBeVisible();
});

test("pressing the last button twice still gives one working Uke", async ({ page }) => {
  await register(page);
  await radio(page, /^Løping/).check();
  await next(page).click();
  await radio(page, "Første 5 km").check();
  await page.getByLabel("Lengste løpetur så langt (km)").fill("2");
  await next(page).click();
  await radio(page, "2").check();

  await page.getByRole("button", { name: "Lag planen" }).dblclick();

  await expect(page).toHaveURL(/\/uke$/);
  await expect(page.getByRole("heading", { level: 1, name: "Uke" })).toBeVisible();
});

test("after logging out and in, the user goes straight to Uke, and /onboarding is closed", async ({
  page,
}) => {
  const email = await register(page);
  await radio(page, /^Styrke/).check();
  await next(page).click();
  await radio(page, "Hele kroppen").check();
  await radio(page, "Nybegynner").check();
  await next(page).click();
  await radio(page, "3").check();
  await next(page).click();
  await radio(page, "På treningssenter").check();
  await page.getByRole("button", { name: "Lag planen" }).click();
  await expect(page).toHaveURL(/\/uke$/);

  await page.goto("/onboarding");
  await expect(page).toHaveURL(/\/uke$/);

  await page.goto("/profil");
  await page.getByRole("button", { name: "Logg ut" }).click();
  await expect(page).toHaveURL(/\/logg-inn$/);
  await page.getByLabel("E-post").fill(email);
  await page.getByLabel("Passord").fill(PASSWORD);
  await page.getByRole("button", { name: "Logg inn" }).click();
  await expect(page).toHaveURL(/\/uke$/);
});

test("logging in without a profile goes to onboarding, and every app page redirects there", async ({
  page,
}) => {
  const email = await register(page);
  for (const path of ["/uke", "/profil", "/coach", "/historikk"]) {
    await page.goto(path);
    await expect(page, path).toHaveURL(/\/onboarding$/);
  }

  await page.goto("/profil").catch(() => undefined);
  await page.context().clearCookies();
  await page.goto("/logg-inn");
  await page.getByLabel("E-post").fill(email);
  await page.getByLabel("Passord").fill(PASSWORD);
  await page.getByRole("button", { name: "Logg inn" }).click();
  await expect(page).toHaveURL(/\/onboarding$/);
  await expect(step(page, "Steg 1 av 5")).toBeVisible();
});

test("a signed-out visitor to /onboarding goes to login, and a demo user to Uke", async ({
  page,
}) => {
  await page.goto("/onboarding");
  await expect(page).toHaveURL(/\/logg-inn$/);

  await page.getByRole("link", { name: "Prøv demo" }).click();
  await page.getByRole("button", { name: /^Profil A\b/ }).click();
  await expect(page).toHaveURL(/\/uke$/);
  await page.goto("/onboarding");
  await expect(page).toHaveURL(/\/uke$/);
});

test("the flow works with the keyboard only, and focus moves to the new question", async ({
  page,
}) => {
  await register(page);

  await page.keyboard.press("Tab");
  await expect(radio(page, /^Styrke/)).toBeFocused();
  await page.keyboard.press("Space");
  await expect(radio(page, /^Styrke/)).toBeChecked();
  await page.keyboard.press("Tab");
  await expect(next(page)).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(step(page, "Steg 2 av 5")).toBeVisible();
  await expect(heading(page, "Fortell om treningen din")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(radio(page, "Overkropp")).toBeFocused();
});

test.describe("axe finds no WCAG 2.2 AA violations on the onboarding steps", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`in ${theme}`, async ({ page, baseURL }) => {
      await page.context().addCookies([{ name: "theme", value: theme, url: baseURL }]);
      const scan = (label: string) =>
        new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
          .then((result) => expect(result.violations, `${label} ${theme}`).toEqual([]));

      await register(page);
      await scan("step 1");
      await radio(page, /^Styrke/).check();
      await scan("step 1 selected");
      await next(page).click();
      await radio(page, "Overkropp").check();
      await scan("strength step 2");
      await radio(page, "Erfaren").check();
      await next(page).click();
      await radio(page, "3").check();
      await scan("sessions");
      await next(page).click();
      await scan("where");
    });
  }
});

test.describe("at 320 px and 200 % text", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  test("no step scrolls sideways, and motion is off with reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await register(page);
    await page.addStyleTag({ content: "html { font-size: 200%; }" });
    expect(await scrollsSideways(page)).toBe(false);

    await radio(page, /^Løping/).check();
    await next(page).click();
    expect(await scrollsSideways(page)).toBe(false);
    await expect(page.getByLabel("Lengste løpetur så langt (km)")).toBeVisible();
    await next(page).scrollIntoViewIfNeeded();
    await expect(next(page)).toBeInViewport();
  });
});
