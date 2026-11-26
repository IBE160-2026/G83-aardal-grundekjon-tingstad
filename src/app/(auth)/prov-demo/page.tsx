import type { Metadata } from "next";
import Link from "next/link";

import { DEMO_PROFILE_KEYS, DEMO_PROFILES } from "@/seed/demo-profiles";
import { buttonClass } from "@/shared/ui/button";

import { DemoPicker } from "./demo-picker";

export const metadata: Metadata = { title: "Prøv demo – Flex PT" };

const choices = DEMO_PROFILE_KEYS.map((key) => ({
  key,
  title: DEMO_PROFILES[key].title,
  description: DEMO_PROFILES[key].description,
}));

export default function TryDemoPage() {
  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-display text-text">Prøv demo</h1>
        <p className="text-body text-text-muted">
          Velg en profil. Du får en egen demobruker. Demobrukere eldre enn et døgn slettes.
        </p>
      </header>
      <DemoPicker choices={choices} />
      <div className="flex justify-center">
        <Link href="/logg-inn" className={buttonClass("text")}>
          Tilbake til innlogging
        </Link>
      </div>
    </>
  );
}
