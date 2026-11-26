import type { ReactNode } from "react";

import { requireUserId } from "@/shared/auth/session";

// Onboarding: a signed-in user without a profile. No tab bar, because the app has nothing to show
// before the questions are answered.
export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  await requireUserId();
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-content flex-col gap-gap-card px-margin-screen pt-6 pb-7">
      {children}
    </main>
  );
}
