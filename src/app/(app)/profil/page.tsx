import type { Metadata } from "next";

import { LogoutButton } from "@/features/account/api";
import { requireUserId } from "@/shared/auth/session";

export const metadata: Metadata = { title: "Profil – Flex PT" };

export default async function ProfilePage() {
  await requireUserId();
  return (
    <>
      <h1 className="text-display text-text">Profil</h1>
      <div className="flex-1" />
      <LogoutButton />
    </>
  );
}
