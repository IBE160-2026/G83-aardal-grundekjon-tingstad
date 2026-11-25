import { redirect } from "next/navigation";

import { getUserId } from "@/shared/auth/session";

// No start page of its own: signed-in users go to Uke, everyone else to the login screen.
export default async function HomePage() {
  redirect((await getUserId()) ? "/uke" : "/logg-inn");
}
