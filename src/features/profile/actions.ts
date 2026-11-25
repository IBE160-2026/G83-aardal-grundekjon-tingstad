"use server";

import { cookies } from "next/headers";

import { type ActionResult, fail, ok } from "@/shared/lib/result";

import { type Theme, THEME_COOKIE, THEME_COOKIE_MAX_AGE, themeSchema } from "./theme";

const INVALID_THEME_MESSAGE = "Vi kunne ikke lagre valget. Prøv igjen.";

/**
 * Stores the theme choice in a device cookie (AD-14). No session is needed: the theme is a
 * setting of this device, not user data, and it survives logout. «Følg system» deletes the
 * cookie, so the server sets no `data-theme` and the CSS follows the operating system.
 */
export async function setThemeAction(input: unknown): Promise<ActionResult<Theme>> {
  const parsed = themeSchema.safeParse(input);
  if (!parsed.success) return fail("invalid", INVALID_THEME_MESSAGE);

  const theme = parsed.data;
  const jar = await cookies();
  if (theme === "system") {
    jar.delete(THEME_COOKIE);
  } else {
    // Only the server reads it; the picker sets data-theme on the page itself.
    jar.set(THEME_COOKIE, theme, {
      path: "/",
      maxAge: THEME_COOKIE_MAX_AGE,
      sameSite: "lax",
      httpOnly: true,
    });
  }
  return ok(theme);
}
