import { StatsRepository } from "@/repositories/StatsRepository";
import { WorkoutDB } from "@/types/workout";
import { WorkoutSessionDB } from "@/types/workoutSession";
import { DbError, NotFoundError, UnauthorizedError } from "@/libs/ServicesErrors";

// Type de retour du service (ce que la route renvoie au client)
export type StatsData = {
    nextSessions: object[];
    todaySessions: object[];
    counts: {
        completed: number;
        inProgress: number;
        planned: number;
        total: number;
        exercises: number;
        workouts: number;
    };
    favoriteWorkout: object | null;
    totalDuration: string;
    totalReps: number;
    totalWeight: number;
    streak: number;
    monthStats: {
        total: number;
        completed: number;
        planned: number;
        completionRate: number;
    };
    totalSets: number;
    completionRate: number;
};

export class StatsService {
    constructor(private readonly statsRepository: StatsRepository) { }

    private requireAuth(userId: string) {
        if (!userId) throw new UnauthorizedError();
    }

    // Retourne une clé unique "YYYY-MM-DD" pour un jour local (ignore l'heure)
    private dayKeyLocal(date: Date): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    // Fixe l'heure à midi pour éviter les problèmes de changement d'heure (DST)
    private atLocalNoon(date: Date): Date {
        const d = new Date(date);
        d.setHours(12, 0, 0, 0);
        return d;
    }

    // Calcule le streak : nombre de jours consécutifs avec au moins une session complétée
    private computeStreak(completedSessions: WorkoutSessionDB[]): number {
        const completedDaysSet = new Set<string>();
        const todayNoon = this.atLocalNoon(new Date());

        for (const session of completedSessions) {
            if (!session.completedDate) continue;
            const sessionDate = new Date(session.completedDate);
            if (Number.isNaN(sessionDate.getTime())) continue;
            if (this.atLocalNoon(sessionDate) > todayNoon) continue;
            completedDaysSet.add(this.dayKeyLocal(sessionDate));
        }

        let cursorDate = new Date(todayNoon);

        // Si pas de session aujourd'hui, vérifier hier — sinon streak = 0
        if (!completedDaysSet.has(this.dayKeyLocal(cursorDate))) {
            cursorDate.setDate(cursorDate.getDate() - 1);
            if (!completedDaysSet.has(this.dayKeyLocal(cursorDate))) return 0;
        }

        let streak = 0;
        while (completedDaysSet.has(this.dayKeyLocal(cursorDate))) {
            streak++;
            cursorDate.setDate(cursorDate.getDate() - 1);
        }

        return streak;
    }

    // Additionne les durées "HH:MM:SS" et retourne le total formaté
    private computeTotalDuration(completedSessions: WorkoutSessionDB[]): string {
        const totalSeconds = completedSessions.reduce((acc, s) => {
            const [h, m, sec] = (s.duration ?? "00:00:00").split(":").map(Number);
            return acc + (h || 0) * 3600 + (m || 0) * 60 + (sec || 0);
        }, 0);

        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }

    // Calcule le volume total : séries complétées, répétitions et poids
    private computeVolume(completedSessions: WorkoutSessionDB[]): {
        totalSets: number;
        totalReps: number;
        totalWeight: number;
    } {
        let totalSets = 0;
        let totalReps = 0;
        let totalWeight = 0;

        for (const session of completedSessions) {
            for (const exercise of session.exercises ?? []) {
                for (const set of exercise.actualSets ?? []) {
                    if (set.completed) totalSets++;
                    totalReps += set.reps ?? 0;
                    totalWeight += set.weight ?? 0;
                }
            }
        }

        return { totalSets, totalReps, totalWeight };
    }

    // Transforme un document session DB en objet avec id (string) au lieu de _id (ObjectId)
    private transformSession(s: WorkoutSessionDB) {
        return {
            ...s,
            id: s._id.toString(),
            userId: s.userId?.toString(),
            workoutId: s.workoutId?.toString(),
        };
    }

    // Transforme un document workout DB en objet avec id (string)
    private transformWorkout(w: WorkoutDB) {
        return { ...w, id: w._id.toString() };
    }

    // ─── MAIN ────────────────────────────────────────────────────────────────────

    async getStats(userId: string): Promise<StatsData> {
        this.requireAuth(userId);

        let userData;
        try {
            userData = await this.statsRepository.findUserStats(userId);
        } catch {
            throw new DbError("Erreur lors de la récupération des statistiques");
        }
        if (!userData) throw new NotFoundError("Utilisateur introuvable");

        const { sessions, workouts, exercisesCount } = userData;
        const now = new Date();

        // Bornes du jour
        const startToday = new Date(now);
        startToday.setHours(0, 0, 0, 0);
        const endToday = new Date(now);
        endToday.setHours(23, 59, 59, 999);

        // Sessions par statut
        const completedSessions = sessions.filter((s) => s.status === "completed");
        const plannedSessions = sessions
            .filter((s) => s.status === "planned")
            .map((s) => ({ ...s, scheduledDate: new Date(s.scheduledDate) }));

        // Sessions du jour et à venir (3 prochaines)
        const todaySessions = plannedSessions.filter(
            (s) => s.scheduledDate >= startToday && s.scheduledDate <= endToday
        );
        const nextSessions = [...plannedSessions]
            .filter((s) => s.scheduledDate > endToday)
            .sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime())
            .slice(0, 3);

        // Compteurs globaux
        const counts = {
            completed: completedSessions.length,
            inProgress: sessions.filter((s) => s.status === "in-progress").length,
            planned: plannedSessions.length,
            total: sessions.length,
            exercises: exercisesCount,
            workouts: workouts.length,
        };

        // Workout le plus utilisé (copie pour éviter la mutation)
        const favoriteWorkout =
            workouts.length > 0
                ? [...workouts].sort((a, b) => b.timesUsed - a.timesUsed)[0]
                : null;

        // Stats calculées
        const totalDuration = this.computeTotalDuration(completedSessions);
        const streak = this.computeStreak(completedSessions);
        const { totalSets, totalReps, totalWeight } = this.computeVolume(completedSessions);

        // Stats du mois en cours
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const sessionsThisMonth = sessions.filter((s) => {
            const date = new Date(s.completedDate ?? s.scheduledDate);
            return date >= startOfMonth && date <= endOfMonth;
        });

        const totalPlannedOrCompleted = sessionsThisMonth.filter(
            (s) => s.status === "completed" || s.status === "planned"
        ).length;
        const completionRate =
            totalPlannedOrCompleted > 0
                ? Math.round(
                    (sessionsThisMonth.filter((s) => s.status === "completed").length /
                        totalPlannedOrCompleted) *
                    100
                )
                : 0;

        const monthStats = {
            total: sessionsThisMonth.length,
            completed: sessionsThisMonth.filter((s) => s.status === "completed").length,
            planned: sessionsThisMonth.filter((s) => s.status === "planned").length,
            completionRate,
        };

        return {
            nextSessions: nextSessions.map((s) => this.transformSession(s as unknown as WorkoutSessionDB)),
            todaySessions: todaySessions.map((s) => this.transformSession(s as unknown as WorkoutSessionDB)),
            counts,
            favoriteWorkout: favoriteWorkout ? this.transformWorkout(favoriteWorkout) : null,
            totalDuration,
            totalReps,
            totalWeight,
            streak,
            monthStats,
            totalSets,
            completionRate,
        };
    }
}
