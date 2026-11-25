import type { Metadata } from "next";

import { requireUserId } from "@/shared/auth/session";

export const metadata: Metadata = { title: "Historikk – Flex PT" };

export default async function HistoryPage() {
  await requireUserId();
  return (
    <>
      <h1 className="text-display text-text">Historikk</h1>
      <p className="text-body text-text-muted">Her finner du snart øktene du har fullført.</p>
    </>
  );
}
