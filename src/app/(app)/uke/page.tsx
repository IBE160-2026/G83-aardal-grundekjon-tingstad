import type { Metadata } from "next";

import { getCurrentWeek, isHintDismissed, WeekView, WELCOME_HINT } from "@/features/plan/api";
import { requireUserId } from "@/shared/auth/session";

export const metadata: Metadata = { title: "Uke – Flex PT" };

export default async function WeekPage() {
  const userId = await requireUserId();
  // The clock is read here, not in the plan code, so the plan logic stays testable (AD-13).
  const week = await getCurrentWeek(userId, new Date());

  if (!week) {
    // The week is not planned yet: the first week is made on the first visit, and the following
    // weeks come with Story 2.5. A user without a profile never gets here (onboarding comes first).
    return (
      <>
        <h1 className="text-display text-text">Uke</h1>
        <p className="text-body text-text-muted">
          Planen for denne uka er ikke klar ennå. Den kommer første gang du åpner en ny uke.
        </p>
      </>
    );
  }

  const showWelcome = !(await isHintDismissed(userId, WELCOME_HINT));
  return (
    <>
      <h1 className="text-display text-text">Uke</h1>
      <WeekView week={week} showWelcome={showWelcome} />
    </>
  );
}
