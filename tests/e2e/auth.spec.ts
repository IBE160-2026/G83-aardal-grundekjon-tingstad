import { randomUUID } from "node:crypto";

import { expect, type Page, test } from "@playwright/test";

// Story 1.2: register, log in and log out, the app shell, and the layout floor (320 px, 200 %).
// Needs the compose database: `docker compose up -d db && npm run db:migrate`.

const PASSWORD = "hemmelig1";
const newEmail = () => `e2e-${randomUUID().slice(0, 12)}@flexpt.test`;

async function register(page: Page, email: string, password = PASSWORD) {
  await page.goto("/registrer");
  await page.getByLabel("E-post").fill(email);
  await page.getByLabel("Passord").fill(password);
  await page.getByRole("button", { name: "Registrer" }).click();
}

async function logIn(page: Page, email: string, password = PASSWORD) {
  await page.goto("/logg-inn");
  await page.getByLabel("E-post").fill(email);
  await page.getByLabel("Passord").fill(password);
  await page.getByRole("button", { name: "Logg inn" }).click();
}

const tabBar = (page: Page) => page.getByRole("navigation", { name: "Hovedmeny" });

/** True when the page is wider than the viewport, i.e. it would scroll sideways. */
const scrollsSideways = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

test("register, open Profil, log out, Back shows no app content, log in again", async ({
  page,
}) => {
  const email = newEmail();

  await register(page, `  ${email.toUpperCase()} `);
  await expect(page).toHaveURL(/\/uke$/);
  await expect(page.getByRole("heading", { level: 1, name: "Uke" })).toBeVisible();

  await tabBar(page).getByRole("link", { name: "Profil" }).click();
  await expect(page).toHaveURL(/\/profil$/);
  await page.getByRole("button", { name: "Logg ut" }).click();
  await expect(page).toHaveURL(/\/logg-inn$/);
  await expect(page.getByRole("button", { name: "Logg inn" })).toBeVisible();

  await page.goBack();
  await expect(page.getByRole("button", { name: "Logg inn" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Profil" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Logg ut" })).toHaveCount(0);

  await logIn(page, email);
  await expect(page).toHaveURL(/\/uke$/);
});

test("the app shell shows four tabs with the active one marked", async ({ page }) => {
  await register(page, newEmail());
  await expect(page).toHaveURL(/\/uke$/);

  const tabs = tabBar(page).getByRole("link");
  await expect(tabs).toHaveText(["Uke", "Coach", "Historikk", "Profil"]);
  await expect(tabBar(page).locator("svg")).toHaveCount(4);

  for (const [name, path] of [
    ["Uke", "/uke"],
    ["Coach", "/coach"],
    ["Historikk", "/historikk"],
  ]) {
    await tabBar(page).getByRole("link", { name }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
    await expect(page.locator("main p").first()).toContainText(/snart/i);
    const active = tabBar(page).locator('[aria-current="page"]');
    await expect(active).toHaveText(name);
    // The 3 px marker above the icon is drawn only on the active tab.
    await expect(active.locator("span[aria-hidden]")).toHaveCSS("height", "3px");
    await expect(tabBar(page).locator("span[aria-hidden]")).toHaveCount(1);
  }
});

test("a logged-out visitor is sent from app routes to the login screen", async ({ page }) => {
  for (const path of ["/uke", "/coach", "/historikk", "/profil"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/logg-inn$/);
  }
});

test("a logged-in user is sent from /, /logg-inn and /registrer to Uke", async ({ page }) => {
  await register(page, newEmail());
  await expect(page).toHaveURL(/\/uke$/);
  for (const path of ["/", "/logg-inn", "/registrer"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/uke$/);
  }
});

test("registration errors show under the field, and the typed email stays", async ({ page }) => {
  await register(page, "mari@eksempel", "kort");

  const email = page.getByLabel("E-post");
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toHaveAccessibleDescription("Skriv en gyldig e-postadresse.");
  await expect(email).toHaveValue("mari@eksempel");
  await expect(page.getByLabel("Passord")).toHaveAccessibleDescription(
    "Passordet er for kort. Bruk minst 8 tegn.",
  );
  await expect(email).toBeFocused();
});

test("an email that is in use is refused under the field", async ({ page }) => {
  const email = newEmail();
  await register(page, email);
  await expect(page).toHaveURL(/\/uke$/);
  await page.context().clearCookies();

  await register(page, email.toUpperCase());
  await expect(page.getByLabel("E-post")).toHaveAccessibleDescription(
    "Det finnes allerede en konto med denne e-postadressen.",
  );
});

test("a wrong login gives one general message", async ({ page }) => {
  const email = newEmail();
  await register(page, email);
  await expect(page).toHaveURL(/\/uke$/);
  await page.context().clearCookies();

  await logIn(page, email, "feilpassord");
  await expect(
    page.getByRole("alert").filter({ hasText: "Feil e-post eller passord." }),
  ).toBeVisible();
  await expect(page.getByLabel("E-post")).toHaveValue(email);
  await expect(page.getByRole("alert").locator("p")).toBeFocused();

  await logIn(page, newEmail(), PASSWORD);
  await expect(
    page.getByRole("alert").filter({ hasText: "Feil e-post eller passord." }),
  ).toBeVisible();
  await expect(page.getByLabel("E-post")).not.toHaveAttribute("aria-invalid", "true");
});

test("registration works with the keyboard only", async ({ page }) => {
  await page.goto("/registrer");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Logg inn" }).first()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("E-post")).toBeFocused();
  await page.keyboard.type(newEmail());
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Passord")).toBeFocused();
  await page.keyboard.type(PASSWORD);
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Registrer" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/uke$/);
});

test.describe("at 320 px and 200 % text", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  const enlargeText = (page: Page) =>
    page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });

  test("login and registration do not scroll sideways", async ({ page }) => {
    for (const path of ["/logg-inn", "/registrer"]) {
      await page.goto(path);
      await enlargeText(page);
      expect(await scrollsSideways(page), path).toBe(false);
    }
  });

  test("Profil with the tab bar does not scroll sideways", async ({ page }) => {
    await register(page, newEmail());
    await expect(page).toHaveURL(/\/uke$/);
    await page.goto("/profil");
    await enlargeText(page);
    expect(await scrollsSideways(page)).toBe(false);
    await page.getByRole("button", { name: "Logg ut" }).scrollIntoViewIfNeeded();
    await expect(page.getByRole("button", { name: "Logg ut" })).toBeInViewport();
  });
});
