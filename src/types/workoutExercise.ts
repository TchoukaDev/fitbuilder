export type WorkoutExercise = {
    exerciseId: string;
    name: string;
    sets: number;
    reps: number | string; // number (ex: 10) ou range (ex: "8-12")
    targetWeight: number;
    restTime: number;
    notes: string | null;
    effort: number | null;
    order: number;
}