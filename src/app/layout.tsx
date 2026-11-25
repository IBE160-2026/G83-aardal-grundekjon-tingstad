import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getTheme, themeAttribute } from "@/features/profile/api";

import "./globals.css";

export const metadata: Metadata = {
  title: "Flex PT",
  description: "Treningsappen med en personlig trener som tilpasser seg uka di.",
};

// The server sets the theme from the device cookie, so a reload never flashes the other theme
// (AD-14). Reading the cookie makes every route dynamic; they need the session anyway.
export default async function RootLayout({ children }: { children: ReactNode }) {
  const theme = await getTheme();
  return (
    <html lang="nb" data-theme={themeAttribute(theme)}>
      <body>{children}</body>
    </html>
  );
}
