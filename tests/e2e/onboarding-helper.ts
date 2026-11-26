import { expect, type Page } from "@playwright/test";

/**
 * Answers the onboarding questions for a strength user (full body, beginner, 2 sessions, gym) and
 * waits for Uke. A newly registered user lands on onboarding (Story 2.4), so tests that need the
 * app shell call this right after registering.
 */
export async function completeOnboarding(page: Page) {
  await expect(page).toHaveURL(/\/onboarding$/);
  await page.getByRole("radio", { name: /^Styrke/ }).check();
  await page.getByRole("button", { name: "Neste" }).click();
  await page.getByRole("radio", { name: "Hele kroppen" }).check();
  await page.getByRole("radio", { name: "Nybegynner" }).check();
  await page.getByRole("button", { name: "Neste" }).click();
  await page.getByRole("radio", { name: "2", exact: true }).check();
  await page.getByRole("button", { name: "Neste" }).click();
  await page.getByRole("radio", { name: "På treningssenter" }).check();
  await page.getByRole("button", { name: "Lag planen" }).click();
  await expect(page).toHaveURL(/\/uke$/);
}
