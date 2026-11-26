"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { type ActionResult, fail } from "@/shared/lib/result";

import { startDemo } from "./demo";
import { DEMO_PROFILE_KEYS } from "./demo-profiles";

const INVALID_PROFILE_MESSAGE = "Velg en av profilene A–D.";
const UNEXPECTED_MESSAGE = "Vi fikk ikke startet demoen. Prøv igjen om litt.";

const profileKeySchema = z.enum(DEMO_PROFILE_KEYS);

/** State of the demo picker: null before the first press. */
export type DemoPickerState = ActionResult<never> | null;

/**
 * «Prøv demo»: validates the chosen profile, builds a fresh demo user for it, signs them in and
 * goes to Uke. An unknown profile creates nothing.
 */
export async function startDemoAction(formData: FormData): Promise<ActionResult<never>> {
  const parsed = profileKeySchema.safeParse(formData.get("profile"));
  if (!parsed.success) return fail("invalid", INVALID_PROFILE_MESSAGE);
  try {
    await startDemo(parsed.data, new Date());
  } catch (error) {
    console.error("Demo start failed", error);
    return fail("unexpected", UNEXPECTED_MESSAGE);
  }
  redirect("/uke");
}

/** The same action in the shape useActionState needs, so the picker also works without JS. */
export async function startDemoFormAction(
  _previous: DemoPickerState,
  formData: FormData,
): Promise<DemoPickerState> {
  return startDemoAction(formData);
}
