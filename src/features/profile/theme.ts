import { z } from "zod";

// Theme choice (AD-14): stored on the device in a cookie, never in the database. Pure module,
// shared by the server (layout, action) and the client picker.

export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

export const THEME_COOKIE = "theme";
/** One year: the choice should outlive sessions and logouts on the same device. */
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const themeSchema = z.enum(THEMES);

/** Reads a cookie value. Only `light` and `dark` set a theme; anything else follows the system. */
export function parseTheme(value: string | undefined): Theme {
  return value === "light" || value === "dark" ? value : "system";
}

/** The `data-theme` value for `<html>`: none for system, so the CSS media query decides. */
export function themeAttribute(theme: Theme): "light" | "dark" | undefined {
  return theme === "system" ? undefined : theme;
}
