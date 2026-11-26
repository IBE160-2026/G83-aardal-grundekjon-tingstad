import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getProfile } from "@/features/profile/api";

import { isDemoSession, requireUserId } from "@/shared/auth/session";
import { DemoBadge } from "@/shared/ui/demo-badge";
import { TabBar } from "@/shared/ui/tab-bar";

// The app shell: every page here needs a signed-in user. The tab bar is part of the page flow
// (sticky at the bottom), so it never covers the last element, also at 200 % text. A demo user
// gets a header with the «Demo» badge on every screen (Story 1.4).
export default async function AppLayout({ children }: { children: ReactNode }) {
  const userId = await requireUserId();
  // A signed-in user who has not answered the questions yet goes to onboarding (Story 2.4).
  if (!(await getProfile(userId))) redirect("/onboarding");
  const demo = await isDemoSession();
  return (
    <div className="flex min-h-dvh flex-col">
      {demo ? (
        <header className="mx-auto flex w-full max-w-content justify-end px-margin-screen pt-4">
          <DemoBadge />
        </header>
      ) : null}
      <main className="mx-auto flex w-full max-w-content flex-1 flex-col gap-gap-card px-margin-screen pt-6 pb-7">
        {children}
      </main>
      <TabBar />
    </div>
  );
}
