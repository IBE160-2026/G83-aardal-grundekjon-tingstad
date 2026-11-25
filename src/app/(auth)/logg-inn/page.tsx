import type { Metadata } from "next";

import { LoginForm } from "@/features/account/api";

export const metadata: Metadata = { title: "Logg inn – Flex PT" };

export default function LoginPage() {
  return (
    <>
      <header className="flex flex-col gap-1 pt-4 pb-7">
        <h1 className="text-display text-text">Flex PT</h1>
        <p className="text-meta text-text-muted">Personlig trener som tilpasser seg hverdagen.</p>
      </header>
      <LoginForm />
    </>
  );
}
