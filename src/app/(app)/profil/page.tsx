import type { Metadata } from "next";

import { DeleteAccountButton, LogoutButton } from "@/features/account/api";
import { getTheme, ThemePicker } from "@/features/profile/api";
import { requireUserId } from "@/shared/auth/session";

export const metadata: Metadata = { title: "Profil – Flex PT" };

export default async function ProfilePage() {
  await requireUserId();
  const theme = await getTheme();
  return (
    <>
      <h1 className="text-display text-text">Profil</h1>
      <ThemePicker theme={theme} />
      <div className="flex-1" />
      <LogoutButton />
      <DeleteAccountButton />
    </>
  );
}
