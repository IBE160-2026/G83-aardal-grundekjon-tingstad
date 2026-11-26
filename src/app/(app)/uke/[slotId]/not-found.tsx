import Link from "next/link";

import { buttonClass } from "@/shared/ui/button";

// Shown for a session that does not exist or belongs to someone else: the same page for both, so
// nothing reveals which. With Uke's loading state the response status is already sent as 200.
export default function SessionNotFound() {
  return (
    <>
      <h1 className="text-display text-text">Fant ikke økta</h1>
      <p className="text-body text-text-muted">
        Denne økta finnes ikke, eller den er ikke din. Gå tilbake til uka for å se planen din.
      </p>
      <Link href="/uke" className={buttonClass("secondary")}>
        Tilbake til uka
      </Link>
    </>
  );
}
