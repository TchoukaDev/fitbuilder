export type sessionExercise = {
    actualSets: actualSet[],
    completed: boolean,
    effort: number | null,
    exerciseId: string,
    exerciseName: string,
    notes?: string
    order: number,
    restTime: number
    targetReps: number,
    targetSets: number,
    targetWeight: number
}

export type actualSet = {
    reps?: number,
    weight?: number,
    completed: boolean
}