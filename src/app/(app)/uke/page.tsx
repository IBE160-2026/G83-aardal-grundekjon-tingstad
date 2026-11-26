import type { Metadata } from "next";

import { getCurrentWeek, isHintDismissed, WeekView, WELCOME_HINT } from "@/features/plan/api";
import { getProfile } from "@/features/profile/api";
import { requireUserId } from "@/shared/auth/session";

export const metadata: Metadata = { title: "Uke – Flex PT" };

export default async function WeekPage() {
  const userId = await requireUserId();
  // The clock is read here, not in the plan code, so the plan logic stays testable (AD-13).
  const week = await getCurrentWeek(userId, new Date());

  if (!week) {
    // Without a profile there is no plan yet (onboarding comes in Story 2.4); with one, the week
    // is not planned here yet (Story 2.5 creates the following weeks).
    const hasProfile = (await getProfile(userId)) !== null;
    return (
      <>
        <h1 className="text-display text-text">Uke</h1>
        <p className="text-body text-text-muted">
          {hasProfile
            ? "Planen for denne uka er ikke klar ennå. Den kommer første gang du åpner en ny uke."
            : "Planen din lages etter spørsmålene i starten. De kommer snart."}
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
