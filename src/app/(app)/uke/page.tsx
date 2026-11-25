import type { Metadata } from "next";

import { requireUserId } from "@/shared/auth/session";

export const metadata: Metadata = { title: "Uke – Flex PT" };

export default async function WeekPage() {
  await requireUserId();
  return (
    <>
      <h1 className="text-display text-text">Uke</h1>
      <p className="text-body text-text-muted">
        Her kommer treningsplanen for uka di. Snart kan du se dagens økt og hvor langt du har
        kommet.
      </p>
    </>
  );
}
