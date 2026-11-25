import { randomUUID } from "node:crypto";

import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

// Story 1.3: Lys / Mørk / Følg system on Profil, stored in a device cookie and set on <html> by
// the server (AD-14), plus axe on the login screen and Profil in both themes (NFR8).
// Needs the compose database: `docker compose up -d db && npm run db:migrate`.

const PASSWORD = "hemmelig1";
const LIGHT_BACKGROUND = "rgb(255, 248, 243)";
const DARK_BACKGROUND = "rgb(23, 16, 13)";

async function registerAndOpenProfil(
  page: Page,
  beforeSubmit?: () => Promise<void>,
): Promise<string> {
  const email = `e2e-${randomUUID().slice(0, 12)}@flexpt.test`;
  await page.goto("/registrer");
  await beforeSubmit?.();
  await page.getByLabel("E-post").fill(email);
  await page.getByLabel("Passord").fill(PASSWORD);
  await page.getByRole("button", { name: "Registrer" }).click();
  await expect(page).toHaveURL(/\/uke$/);
  await page.goto("/profil");
  return email;
}

const html = (page: Page) => page.locator("html");
const background = (page: Page) => page.locator("body");
const themeGroup = (page: Page) => page.getByRole("group", { name: "Utseende" });
const option = (page: Page, name: string) => themeGroup(page).getByRole("radio", { name });
const themeCookie = async (page: Page) =>
  (await page.context().cookies()).find((cookie) => cookie.name === "theme")?.value;

/** The `<html>` start tag as the server sent it, before any client script ran. */
async function serverHtmlTag(page: Page, path: string): Promise<string> {
  const response = await page.request.get(path);
  return (await response.text()).match(/<html[^>]*>/)?.[0] ?? "";
}

test("Utseende is a radio group with three options; Følg system is the default", async ({
  page,
}) => {
  await registerAndOpenProfil(page);

  await expect(themeGroup(page).getByRole("radio")).toHaveCount(3);
  await expect(option(page, "Lys")).not.toBeChecked();
  await expect(option(page, "Mørk")).not.toBeChecked();
  await expect(option(page, "Følg system")).toBeChecked();
  await expect(html(page)).not.toHaveAttribute("data-theme");
});

test("choosing Mørk switches at once and survives a reload with no flash", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await registerAndOpenProfil(page);

  await option(page, "Mørk").check();
  await expect(html(page)).toHaveAttribute("data-theme", "dark");
  await expect(background(page)).toHaveCSS("background-color", DARK_BACKGROUND);
  await expect(option(page, "Mørk")).toBeChecked();

  await expect.poll(() => themeCookie(page)).toBe("dark");
  expect(await serverHtmlTag(page, "/profil")).toContain('data-theme="dark"');

  await page.reload();
  await expect(html(page)).toHaveAttribute("data-theme", "dark");
  await expect(option(page, "Mørk")).toBeChecked();
});

test("Lys stays light when the system is dark", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await registerAndOpenProfil(page);
  await expect(background(page)).toHaveCSS("background-color", DARK_BACKGROUND);

  await option(page, "Lys").check();
  await expect(html(page)).toHaveAttribute("data-theme", "light");
  await expect(background(page)).toHaveCSS("background-color", LIGHT_BACKGROUND);
  await expect.poll(() => themeCookie(page)).toBe("light");
  await page.reload();
  await expect(background(page)).toHaveCSS("background-color", LIGHT_BACKGROUND);
});

test("Følg system removes the attribute and follows the system", async ({ page }) => {
  await registerAndOpenProfil(page);
  await option(page, "Mørk").check();
  await expect(html(page)).toHaveAttribute("data-theme", "dark");

  await option(page, "Følg system").check();
  await expect(html(page)).not.toHaveAttribute("data-theme");
  await expect.poll(() => themeCookie(page)).toBeUndefined();
  expect(await serverHtmlTag(page, "/profil")).not.toContain("data-theme");

  await page.emulateMedia({ colorScheme: "dark" });
  await expect(background(page)).toHaveCSS("background-color", DARK_BACKGROUND);
  await page.emulateMedia({ colorScheme: "light" });
  await expect(background(page)).toHaveCSS("background-color", LIGHT_BACKGROUND);
});

test("arrow keys move the choice", async ({ page }) => {
  await registerAndOpenProfil(page);
  await option(page, "Følg system").focus();

  await page.keyboard.press("ArrowLeft");
  await expect(option(page, "Mørk")).toBeChecked();
  await expect(option(page, "Mørk")).toBeFocused();
  await expect(html(page)).toHaveAttribute("data-theme", "dark");

  await page.keyboard.press("ArrowLeft");
  await expect(option(page, "Lys")).toBeChecked();
  await expect(html(page)).toHaveAttribute("data-theme", "light");
});

test("the choice survives logging out and in on the same device", async ({ page }) => {
  const email = await registerAndOpenProfil(page);
  await option(page, "Mørk").check();
  await expect.poll(() => themeCookie(page)).toBe("dark");

  await page.getByRole("button", { name: "Logg ut" }).click();
  await expect(page).toHaveURL(/\/logg-inn$/);
  await expect(html(page)).toHaveAttribute("data-theme", "dark");

  await page.getByLabel("E-post").fill(email);
  await page.getByLabel("Passord").fill(PASSWORD);
  await page.getByRole("button", { name: "Logg inn" }).click();
  await expect(page).toHaveURL(/\/uke$/);
  await expect(html(page)).toHaveAttribute("data-theme", "dark");
});

test("a failed save puts the theme back and says so", async ({ page }) => {
  await registerAndOpenProfil(page);
  // Server actions post to the page's own URL; dropping the request makes the action throw.
  await page.route("**/profil", (route) =>
    route.request().method() === "POST" ? route.abort() : route.continue(),
  );

  await option(page, "Mørk").check();
  await expect(themeGroup(page).getByRole("alert")).toHaveText(
    "Vi kunne ikke lagre valget. Prøv igjen.",
  );
  await expect(option(page, "Følg system")).toBeChecked();
  await expect(html(page)).not.toHaveAttribute("data-theme");
  expect(await themeCookie(page)).toBeUndefined();
});

test("with reduced motion the theme switches without a transition", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await registerAndOpenProfil(page);

  await option(page, "Mørk").check();
  await expect(background(page)).toHaveCSS("background-color", DARK_BACKGROUND);
  for (const element of [background(page), themeGroup(page).locator("label").first()]) {
    await expect(element).toHaveCSS("transition-duration", "0s");
  }
});

test.describe("axe finds no WCAG 2.2 AA violations", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`on the login screen and Profil in ${theme}`, async ({ page, baseURL }) => {
      await page.context().addCookies([{ name: "theme", value: theme, url: baseURL }]);
      const scan = () =>
        new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();

      await page.goto("/logg-inn");
      await expect(html(page)).toHaveAttribute("data-theme", theme);
      expect((await scan()).violations, "/logg-inn").toEqual([]);

      await registerAndOpenProfil(page, async () => {
        expect((await scan()).violations, "/registrer").toEqual([]);
      });
      await expect(html(page)).toHaveAttribute("data-theme", theme);
      expect((await scan()).violations, "/profil").toEqual([]);
    });
  }
});
