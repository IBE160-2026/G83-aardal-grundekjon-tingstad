// Public surface of the `profile` slice (AD-1). Other code imports this slice only through this file.
// Owns the profile table (AD-3, from Story 1.4) and the theme choice (AD-14, a device cookie).
// Every function that touches user data takes the user id as its first argument and enforces
// its own rules.

export { ThemePicker } from "./components/theme-picker";
export { getTheme } from "./get-theme";
export { type Theme, themeAttribute } from "./theme";
