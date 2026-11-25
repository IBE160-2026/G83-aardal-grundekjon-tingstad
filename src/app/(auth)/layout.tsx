import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getUserId } from "@/shared/auth/session";

// Login and registration: a signed-in user goes straight to Uke.
export default async function AuthLayout({ children }: { children: ReactNode }) {
  if (await getUserId()) redirect("/uke");
  return (
    <main className="mx-auto flex min-h-dvh max-w-content flex-col gap-gap-card px-margin-screen pt-6 pb-5">
      {children}
    </main>
  );
}
