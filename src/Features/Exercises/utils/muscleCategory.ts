const MUSCLE_TO_CATEGORY: Record<string, string> = {
  "Pectoraux supérieurs": "Poitrine",
  "Pectoraux moyens": "Poitrine",
  "Pectoraux inférieurs": "Poitrine",
  "Grand dorsal": "Dos",
  "Rhomboïdes": "Dos",
  "Trapèzes": "Dos",
  "Érecteurs du rachis": "Dos",
  "Deltoïde antérieur": "Épaules",
  "Deltoïde médial": "Épaules",
  "Deltoïde postérieur": "Épaules",
  "Biceps": "Bras",
  "Triceps": "Bras",
  "Avant-bras": "Bras",
  "Brachialis": "Bras",
  "Quadriceps": "Jambes",
  "Ischio-jambiers": "Jambes",
  "Adducteurs": "Jambes",
  "Mollets": "Jambes",
  "Grand fessier": "Fessiers",
  "Moyen fessier": "Fessiers",
  "Abdominaux": "Core",
  "Obliques": "Core",
  "Core profond": "Core",
  "Corps entier": "Autre",
  "Cardio": "Autre",
};

export function getMuscleCategory(muscle: string): string {
  return MUSCLE_TO_CATEGORY[muscle] ?? muscle;
}
