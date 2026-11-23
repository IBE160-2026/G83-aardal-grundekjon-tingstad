// Story 2.1: velger ut et kuratert øvelsesbibliotek fra Free Exercise DB (public domain).
//
// Bruk:
//   node scripts/select-exercises.mjs [sti-til-exercises.json]
// Uten argument lastes kilden ned fra GitHub. Resultatet skrives til data/exercises/exercises.json.
// Utvalget under er håndplukket og skal gjennomgås i PR. Skriptet sjekker bare at ID-ene finnes,
// at hvert mønster er dekket (gym og hjemme) og at utstyret passer til merkingen.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../data/exercises/exercises.json");

// Mønstre fra PRD Appendix A (Session slots).
const PATTERNS = [
  "squat", "hinge", "single-leg", "calf",
  "horizontal-push", "vertical-push", "horizontal-pull", "vertical-pull",
  "biceps", "triceps", "core",
];

// Kjente hull hjemme (Story 2.1): disse mønstrene bruker fallback i PRD Appendix A.
const KNOWN_HOME_GAPS = new Set(["biceps"]);

// location: gym = kun treningssenter, both = gym og hjemme (kroppsvekt; stang/benk/trinn
// kan brukes til å trekke eller stå på, jf. R5).
// [id i kilden, norsk visningsnavn, mønster, sted]
const CURATED = [
  // squat
  ["Barbell_Squat", "Knebøy med stang", "squat", "gym"],
  ["Leg_Press", "Beinpress", "squat", "gym"],
  ["Goblet_Squat", "Goblet-knebøy", "squat", "gym"],
  ["Bodyweight_Squat", "Knebøy med kroppsvekt", "squat", "both"],
  ["Freehand_Jump_Squat", "Hoppende knebøy", "squat", "both"],
  // hinge
  ["Romanian_Deadlift", "Rumensk markløft", "hinge", "gym"],
  ["Barbell_Deadlift", "Markløft", "hinge", "gym"],
  ["Stiff-Legged_Dumbbell_Deadlift", "Strakbent markløft med manualer", "hinge", "gym"],
  ["Butt_Lift_Bridge", "Hoftehev (glutebro)", "hinge", "both"],
  ["Single_Leg_Glute_Bridge", "Enbens hoftehev", "hinge", "both"],
  // single-leg
  ["Dumbbell_Lunges", "Utfall med manualer", "single-leg", "gym"],
  ["Split_Squat_with_Dumbbells", "Splittknebøy med manualer", "single-leg", "gym"],
  ["Bodyweight_Walking_Lunge", "Gående utfall", "single-leg", "both"],
  ["Step-up_with_Knee_Raise", "Step-up med knehev", "single-leg", "both"],
  // calf
  ["Standing_Calf_Raises", "Stående tåhev i maskin", "calf", "gym"],
  ["Seated_Calf_Raise", "Sittende tåhev", "calf", "gym"],
  ["Standing_Dumbbell_Calf_Raise", "Tåhev med manualer", "calf", "gym"],
  // horizontal push
  ["Barbell_Bench_Press_-_Medium_Grip", "Benkpress med stang", "horizontal-push", "gym"],
  ["Dumbbell_Bench_Press", "Benkpress med manualer", "horizontal-push", "gym"],
  ["Machine_Bench_Press", "Brystpress i maskin", "horizontal-push", "gym"],
  ["Pushups", "Armhevinger", "horizontal-push", "both"],
  ["Incline_Push-Up", "Armhevinger med hendene hevet", "horizontal-push", "both"],
  ["Push-Ups_With_Feet_Elevated", "Armhevinger med føttene hevet", "horizontal-push", "both"],
  // vertical push
  ["Dumbbell_Shoulder_Press", "Skulderpress med manualer", "vertical-push", "gym"],
  ["Machine_Shoulder_Military_Press", "Skulderpress i maskin", "vertical-push", "gym"],
  ["Standing_Military_Press", "Stående skulderpress med stang", "vertical-push", "gym"],
  // horizontal pull
  ["Bent_Over_Two-Dumbbell_Row", "Roing med to manualer", "horizontal-pull", "gym"],
  ["Seated_Cable_Rows", "Sittende roing med kabel", "horizontal-pull", "gym"],
  ["One-Arm_Dumbbell_Row", "Enarmsro med manual", "horizontal-pull", "gym"],
  ["Inverted_Row", "Omvendt roing (under bord eller stang)", "horizontal-pull", "both"],
  // vertical pull
  ["Wide-Grip_Lat_Pulldown", "Nedtrekk med bredt grep", "vertical-pull", "gym"],
  ["Close-Grip_Front_Lat_Pulldown", "Nedtrekk med smalt grep", "vertical-pull", "gym"],
  ["Pullups", "Pullups", "vertical-pull", "both"],
  ["Chin-Up", "Chins", "vertical-pull", "both"],
  // biceps
  ["Dumbbell_Bicep_Curl", "Bicepscurl med manualer", "biceps", "gym"],
  ["Barbell_Curl", "Bicepscurl med stang", "biceps", "gym"],
  ["Hammer_Curls", "Hammercurl", "biceps", "gym"],
  // triceps
  ["Triceps_Pushdown", "Tricepspress i kabel", "triceps", "gym"],
  ["Standing_Dumbbell_Triceps_Extension", "Overhead tricepsekstensjon med manual", "triceps", "gym"],
  ["Bench_Dips", "Dips med hendene på en stol", "triceps", "both"],
  ["Standing_Towel_Triceps_Extension", "Tricepsekstensjon med håndkle", "triceps", "both"],
  // core
  ["Cable_Crunch", "Magecrunch i kabel", "core", "gym"],
  ["Sit-Up", "Sit-ups", "core", "both"],
  ["Plank", "Planke", "core", "both"],
  ["Dead_Bug", "Dead bug", "core", "both"],
];

// Egne øvelser som Free Exercise DB ikke har (kroppsvekt, uten utstyr). Skrevet og gjennomgått av teamet.
// [id, norsk navn, engelsk navn, mønster, primære muskler, sekundære muskler, nivå]
const CUSTOM = [
  ["custom-bodyweight-calf-raise", "Tåhev på kroppsvekt", "Bodyweight Calf Raise", "calf", ["calves"], [], "beginner"],
  ["custom-single-leg-calf-raise", "Enbens tåhev", "Single-Leg Calf Raise", "calf", ["calves"], [], "beginner"],
  ["custom-bent-knee-inverted-row", "Omvendt roing med bøyde knær", "Bent-Knee Inverted Row", "horizontal-pull", ["middle back"], ["lats", "biceps"], "beginner"],
  ["custom-pike-push-up", "Pike push-up", "Pike Push-Up", "vertical-push", ["shoulders"], ["triceps", "chest"], "intermediate"],
  ["custom-pike-push-up-feet-elevated", "Pike push-up med føttene hevet", "Pike Push-Up, Feet Elevated", "vertical-push", ["shoulders"], ["triceps", "chest"], "intermediate"],
];

// Utstyr i kilden som er greit for «both» (kroppsvekt, stang/benk/trinn man har tilgang til).
const HOME_OK_EQUIPMENT = new Set(["body only", "other", null]);

async function loadSource() {
  const path = process.argv[2];
  if (path) return JSON.parse(readFileSync(path, "utf8"));
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Kunne ikke hente kilden: ${res.status}`);
  return res.json();
}

const source = await loadSource();
const byId = new Map(source.map((e) => [e.id, e]));
const errors = [];
const ids = new Set();

const library = CURATED.map(([id, nameNo, pattern, location]) => {
  const src = byId.get(id);
  if (!src) { errors.push(`Finnes ikke i kilden: ${id}`); return null; }
  if (ids.has(id)) errors.push(`Duplikat: ${id}`);
  ids.add(id);
  if (!PATTERNS.includes(pattern)) errors.push(`Ukjent mønster for ${id}: ${pattern}`);
  if (location === "both" && !HOME_OK_EQUIPMENT.has(src.equipment)) {
    errors.push(`${id} er merket «both», men krever utstyr: ${src.equipment}`);
  }
  const bodyweight = src.equipment === "body only" || src.equipment === null;
  return {
    id,
    source: "free-exercise-db",
    nameNo,
    nameEn: src.name,
    pattern,
    location,
    bodyweight,
    primaryMuscles: src.primaryMuscles,
    secondaryMuscles: src.secondaryMuscles,
    sourceEquipment: src.equipment,
    level: src.level,
  };
}).filter(Boolean);

for (const [id, nameNo, nameEn, pattern, primaryMuscles, secondaryMuscles, level] of CUSTOM) {
  if (ids.has(id)) errors.push(`Duplikat: ${id}`);
  ids.add(id);
  library.push({
    id, source: "custom", nameNo, nameEn, pattern, location: "both", bodyweight: true,
    primaryMuscles, secondaryMuscles, sourceEquipment: null, level,
  });
}

// Dekning: minst to øvelser per mønster for gym (alle) og hjemme (kun «both»), unntatt kjente hull.
for (const pattern of PATTERNS) {
  const all = library.filter((e) => e.pattern === pattern).length;
  const home = library.filter((e) => e.pattern === pattern && e.location === "both").length;
  if (all < 2) errors.push(`Gym: mønsteret ${pattern} har bare ${all} øvelse(r)`);
  if (KNOWN_HOME_GAPS.has(pattern)) {
    if (home > 0) errors.push(`${pattern} står som kjent hull hjemme, men har ${home} øvelse(r). Fjern det fra KNOWN_HOME_GAPS`);
  } else if (home < 2) {
    errors.push(`Hjemme: mønsteret ${pattern} har bare ${home} øvelse(r)`);
  }
}

if (library.length < 30 || library.length > 50) {
  errors.push(`Biblioteket har ${library.length} øvelser, forventet 30–50`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const output = {
  source: "Free Exercise DB (https://github.com/yuhonas/free-exercise-db), public domain (Unlicense), pluss egne øvelser merket source: custom",
  knownHomeGaps: [...KNOWN_HOME_GAPS],
  exercises: library,
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(output, null, 2) + "\n");
console.log(`Skrev ${library.length} øvelser til ${OUT}`);
