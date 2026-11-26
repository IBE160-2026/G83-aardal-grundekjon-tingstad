import type { ProfileInput } from "@/features/profile/api";

// The demo profiles A–D from PRD Appendix B (Story 1.4). Later epics add plans, logs and coach
// scenarios to the same seed.

export const DEMO_PROFILE_KEYS = ["A", "B", "C", "D"] as const;
export type DemoProfileKey = (typeof DEMO_PROFILE_KEYS)[number];

export const DEMO_PROFILES: Record<
  DemoProfileKey,
  { title: string; description: string; profile: ProfileInput }
> = {
  A: {
    title: "Profil A",
    description: "Styrke for nybegynnere: helkropp to ganger i uka på treningssenter.",
    profile: {
      focus: "strength",
      experience: "beginner",
      mainFocus: "full_body",
      sessionsPerWeek: 2,
      equipment: "gym",
    },
  },
  B: {
    title: "Profil B",
    description: "Styrke for erfarne: fem økter i uka på treningssenter.",
    profile: {
      focus: "strength",
      experience: "experienced",
      mainFocus: "full_body",
      sessionsPerWeek: 5,
      equipment: "gym",
    },
  },
  C: {
    title: "Profil C",
    description: "Løping for nybegynnere: mål 10 km, løper 3 km i dag, tre økter i uka.",
    profile: {
      focus: "running",
      experience: "beginner",
      goal: "10k",
      longestRunKm: 3,
      sessionsPerWeek: 3,
    },
  },
  D: {
    title: "Profil D",
    description: "Løping for erfarne: mål halvmaraton, løper 15 km i dag, fire økter i uka.",
    profile: {
      focus: "running",
      experience: "experienced",
      goal: "half_marathon",
      longestRunKm: 15,
      sessionsPerWeek: 4,
    },
  },
};
