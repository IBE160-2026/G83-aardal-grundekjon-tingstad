import { expect, test } from "@playwright/test";

test("the start page sends a logged-out visitor to the login screen, in bokmål", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/logg-inn$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "nb");
  await expect(page.getByRole("heading", { level: 1, name: "Flex PT" })).toBeVisible();
});

// Theme tokens (AD-14): data-theme wins over the system setting; no attribute follows the system.
const LIGHT_BACKGROUND = "rgb(255, 248, 243)";
const DARK_BACKGROUND = "rgb(23, 16, 13)";

for (const { theme, expected } of [
  { theme: null, expected: DARK_BACKGROUND },
  { theme: "light", expected: LIGHT_BACKGROUND },
  { theme: "dark", expected: DARK_BACKGROUND },
]) {
  test(`with the system in dark mode, data-theme=${theme ?? "absent"} gives the right tokens`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/logg-inn");
    await page.evaluate((value) => {
      if (value) document.documentElement.setAttribute("data-theme", value);
      else document.documentElement.removeAttribute("data-theme");
    }, theme);
    await expect(page.locator("body")).toHaveCSS("background-color", expected);
  });
}

test("without data-theme a light system gives light tokens", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/logg-inn");
  await expect(page.locator("body")).toHaveCSS("background-color", LIGHT_BACKGROUND);
});
