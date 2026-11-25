import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "@/features/account/api";
import { buttonClass } from "@/shared/ui/button";

export const metadata: Metadata = { title: "Registrer ny bruker – Flex PT" };

export default function RegisterPage() {
  return (
    <>
      <div>
        <Link href="/logg-inn" className={buttonClass("text", "-ml-2")}>
          <span aria-hidden="true">‹&nbsp;</span>Logg inn
        </Link>
      </div>
      <h1 className="text-display text-text">Registrer ny bruker</h1>
      <RegisterForm />
    </>
  );
}
