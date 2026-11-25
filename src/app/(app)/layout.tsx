import type { ReactNode } from "react";

import { requireUserId } from "@/shared/auth/session";
import { TabBar } from "@/shared/ui/tab-bar";

// The app shell: every page here needs a signed-in user. The tab bar is part of the page flow
// (sticky at the bottom), so it never covers the last element, also at 200 % text.
export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireUserId();
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-content flex-1 flex-col gap-gap-card px-margin-screen pt-6 pb-7">
        {children}
      </main>
      <TabBar />
    </div>
  );
}
