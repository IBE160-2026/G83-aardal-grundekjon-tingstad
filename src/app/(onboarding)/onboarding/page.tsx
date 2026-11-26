import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingFlow } from "@/features/onboarding/api";
import { getProfile } from "@/features/profile/api";
import { requireUserId } from "@/shared/auth/session";

export const metadata: Metadata = { title: "Kom i gang – Flex PT" };

export default async function OnboardingPage() {
  const userId = await requireUserId();
  // Someone who has answered the questions never sees them again (they are edited in Profil).
  if (await getProfile(userId)) redirect("/uke");
  return <OnboardingFlow />;
}
