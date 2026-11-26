import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getSession, SessionDetailView } from "@/features/plan/api";
import { requireUserId } from "@/shared/auth/session";
import { buttonClass } from "@/shared/ui/button";

export const metadata: Metadata = { title: "Økt – Flex PT" };

export default async function SessionPage({ params }: { params: Promise<{ slotId: string }> }) {
  const userId = await requireUserId();
  const { slotId } = await params;
  // A slot of another user, or one that does not exist, is the same 404.
  const session = await getSession(userId, slotId);
  if (!session) notFound();
  return (
    <>
      <SessionDetailView session={session} />
      <Link href="/uke" className={buttonClass("secondary")}>
        Tilbake til uka
      </Link>
    </>
  );
}
