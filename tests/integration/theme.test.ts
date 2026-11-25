import { beforeEach, describe, expect, it, vi } from "vitest";

import { setThemeAction } from "@/features/profile/actions";
import { getTheme } from "@/features/profile/get-theme";
import {
  parseTheme,
  THEME_COOKIE,
  THEME_COOKIE_MAX_AGE,
  themeAttribute,
} from "@/features/profile/theme";

// Story 1.3: the theme choice lives in a device cookie (AD-14). No database needed.

type CookieOptions = { path?: string; maxAge?: number; sameSite?: string; httpOnly?: boolean };
const jar = new Map<string, { value: string; options?: CookieOptions }>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (jar.has(name) ? { name, value: jar.get(name)!.value } : undefined),
    set: (name: string, value: string, options?: CookieOptions) => {
      jar.set(name, { value, options });
    },
    delete: (name: string) => {
      jar.delete(name);
    },
  }),
}));

beforeEach(() => jar.clear());

describe("parseTheme", () => {
  it.each([
    ["light", "light"],
    ["dark", "dark"],
    ["system", "system"],
    [undefined, "system"],
    ["", "system"],
    ["blue", "system"],
    ["Dark", "system"],
    [" dark", "system"],
  ] as const)("%j → %s", (value, expected) => {
    expect(parseTheme(value)).toBe(expected);
  });
});

describe("themeAttribute", () => {
  it("sets data-theme only for light and dark", () => {
    expect(themeAttribute("light")).toBe("light");
    expect(themeAttribute("dark")).toBe("dark");
    expect(themeAttribute("system")).toBeUndefined();
  });
});

describe("setThemeAction", () => {
  it("stores dark for a year on the whole site", async () => {
    expect(await setThemeAction("dark")).toEqual({ ok: true, data: "dark" });
    expect(jar.get(THEME_COOKIE)).toEqual({
      value: "dark",
      options: { path: "/", maxAge: THEME_COOKIE_MAX_AGE, sameSite: "lax", httpOnly: true },
    });
    expect(await getTheme()).toBe("dark");
  });

  it("stores light", async () => {
    expect(await setThemeAction("light")).toEqual({ ok: true, data: "light" });
    expect(await getTheme()).toBe("light");
  });

  it("deletes the cookie for system, so no data-theme is set", async () => {
    await setThemeAction("dark");
    expect(await setThemeAction("system")).toEqual({ ok: true, data: "system" });
    expect(jar.has(THEME_COOKIE)).toBe(false);
    expect(await getTheme()).toBe("system");
  });

  it.each(["blue", "", null, 1, { theme: "dark" }])(
    "rejects %j and leaves the cookie unchanged",
    async (input) => {
      await setThemeAction("dark");
      const result = await setThemeAction(input);
      expect(result).toMatchObject({ ok: false, code: "invalid" });
      expect(jar.get(THEME_COOKIE)?.value).toBe("dark");
    },
  );

  it("reads an unknown cookie value as system", async () => {
    jar.set(THEME_COOKIE, { value: "blue" });
    expect(await getTheme()).toBe("system");
  });
});
