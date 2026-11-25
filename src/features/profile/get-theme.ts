import "server-only";

import { cookies } from "next/headers";

import { parseTheme, type Theme, THEME_COOKIE } from "./theme";

/** The theme stored on this device, read from the request cookie (AD-14). */
export async function getTheme(): Promise<Theme> {
  return parseTheme((await cookies()).get(THEME_COOKIE)?.value);
}
