import "server-only";

import { type Exercise, exerciseLibrarySchema } from "@/shared/engine/exercise";

import library from "../../../data/exercises/exercises.json";

// The curated library (Story 2.1), validated once when first used. Bundled with the app, so the
// standalone Docker image and Vercel need no extra files.
let cached: Exercise[] | undefined;

export function getExercises(): Exercise[] {
  cached ??= exerciseLibrarySchema.parse(library).exercises;
  return cached;
}
