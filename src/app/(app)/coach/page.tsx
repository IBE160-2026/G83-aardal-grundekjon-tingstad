import type { Metadata } from "next";

import { requireUserId } from "@/shared/auth/session";

export const metadata: Metadata = { title: "Coach – Flex PT" };

export default async function CoachPage() {
  await requireUserId();
  return (
    <>
      <h1 className="text-display text-text">Coach</h1>
      <p className="text-body text-text-muted">
        Her kan du snart snakke med coachen din når uka ikke går som planlagt.
      </p>
    </>
  );
}
