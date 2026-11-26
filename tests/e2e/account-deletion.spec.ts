import { randomUUID } from "node:crypto";

import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

import { completeOnboarding } from "./onboarding-helper";

// Story 1.5: «Slett konto» on Profil, the confirmation dialog and what happens after «Slett».
// Needs the compose database: `docker compose up -d db && npm run db:migrate`.

const PASSWORD = "hemmelig1";
const newEmail = () => `e2e-${randomUUID().slice(0, 12)}@flexpt.test`;
const DIALOG_TEXT =
  "Vil du slette kontoen? Profil, planer, logger og meldinger slettes for alltid.";

async function registerAndOpenProfil(page: Page, email = newEmail()) {
  await page.goto("/registrer");
  await page.getByLabel("E-post").fill(email);
  await page.getByLabel("Passord").fill(PASSWORD);
  await page.getByRole("button", { name: "Registrer" }).click();
  await completeOnboarding(page);
  await page.goto("/profil");
  await expect(page.getByRole("heading", { level: 1, name: "Profil" })).toBeVisible();
  return email;
}

const deleteButton = (page: Page) => page.getByRole("button", { name: "Slett konto" });
const dialog = (page: Page) => page.getByRole("dialog", { name: "Slett konto" });

test("the dialog shows the warning, keeps focus inside and returns it when closed", async ({
  page,
}) => {
  await registerAndOpenProfil(page);

  await deleteButton(page).click();
  await expect(dialog(page)).toBeVisible();
  await expect(dialog(page)).toHaveAccessibleDescription(DIALOG_TEXT);
  const cancel = dialog(page).getByRole("button", { name: "Avbryt" });
  const confirm = dialog(page).getByRole("button", { name: "Slett", exact: true });
  await expect(cancel).toBeFocused();

  // Tab and Shift+Tab wrap inside the dialog.
  await page.keyboard.press("Tab");
  await expect(confirm).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(cancel).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(confirm).toBeFocused();

  // Escape cancels and focus goes back to «Slett konto».
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeHidden();
  await expect(deleteButton(page)).toBeFocused();

  // So does «Avbryt», opened from the keyboard this time.
  await page.keyboard.press("Enter");
  await expect(cancel).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog(page)).toBeHidden();
  await expect(deleteButton(page)).toBeFocused();

  // Nothing was deleted: still signed in after a reload.
  await page.reload();
  await expect(page).toHaveURL(/\/profil$/);
  await expect(deleteButton(page)).toBeVisible();
});

test("«Slett» pressed twice deletes the account once and lands on login for good", async ({
  page,
}) => {
  const email = await registerAndOpenProfil(page);

  await deleteButton(page).click();
  await dialog(page).getByRole("button", { name: "Slett", exact: true }).dblclick();
  await expect(page).toHaveURL(/\/logg-inn$/);
  await expect(page.getByRole("button", { name: "Logg inn" })).toBeVisible();
  await expect(page.getByText("Noe gikk galt")).toHaveCount(0);

  // Back does not show Profil any more.
  // Wait for where Back lands first, so the negative check cannot pass before it renders.
  await page.goBack();
  await page.waitForLoadState();
  await expect(page).toHaveURL(/\/logg-inn$/);
  await expect(page.getByRole("button", { name: "Logg inn" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Profil" })).toHaveCount(0);

  // The old email and password no longer work.
  await page.goto("/logg-inn");
  await page.getByLabel("E-post").fill(email);
  await page.getByLabel("Passord").fill(PASSWORD);
  await page.getByRole("button", { name: "Logg inn" }).click();
  await expect(page.getByText("Feil e-post eller passord.")).toBeVisible();
  await expect(page).toHaveURL(/\/logg-inn$/);
});

test.describe("axe finds no WCAG 2.2 AA violations with the dialog open", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`in ${theme}`, async ({ page, baseURL }) => {
      await page.context().addCookies([{ name: "theme", value: theme, url: baseURL }]);
      await registerAndOpenProfil(page);
      await deleteButton(page).click();
      await expect(dialog(page)).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe("at 320 px and 200 % text", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  test("Profil and the open dialog do not scroll sideways", async ({ page }) => {
    await registerAndOpenProfil(page);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    const scrollsSideways = () =>
      page.evaluate(() => {
        const open = document.querySelector("dialog[open]");
        const wide = document.documentElement.scrollWidth > window.innerWidth;
        return wide || (open !== null && open.scrollWidth > open.clientWidth);
      });

    expect(await scrollsSideways()).toBe(false);
    await deleteButton(page).click();
    await expect(dialog(page)).toBeVisible();
    expect(await scrollsSideways()).toBe(false);
    const confirm = dialog(page).getByRole("button", { name: "Slett", exact: true });
    await confirm.scrollIntoViewIfNeeded();
    await expect(confirm).toBeInViewport();
  });
});
