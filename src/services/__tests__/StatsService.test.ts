import { describe, it, expect, vi, beforeEach } from "vitest";
import { StatsService } from "../StatsService";
import { NotFoundError, UnauthorizedError } from "@/libs/ServicesErrors";
import { ObjectId } from "mongodb";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeSession(completedDate: string) {
    return {
        _id: new ObjectId(),
        userId: new ObjectId(),
        workoutId: new ObjectId(),
        workoutName: "Test",
        scheduledDate: completedDate,
        status: "completed" as const,
        notes: null,
        effort: null,
        isPlanned: false,
        startedAt: null,
        completedDate,
        estimatedDuration: 60,
        duration: "00:30:00",
        exercises: [],
        createdAt: completedDate,
        updatedAt: completedDate,
    };
}

// Retourne la date d'il y a N jours en ISO string
function daysAgo(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
}

// ─── Mock ────────────────────────────────────────────────────────────────────

const mockRepo = { findUserStats: vi.fn() };

// ─── Setup ───────────────────────────────────────────────────────────────────

let service: StatsService;

beforeEach(() => {
    vi.clearAllMocks();
    service = new StatsService(mockRepo as any);
});

// Données minimales pour les tests qui ne portent pas sur les sessions
function emptyStats(sessions: any[] = []) {
    return { sessions, workouts: [], exercisesCount: 0 };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("StatsService", () => {

    describe("getStats — guards", () => {

        it("lève UnauthorizedError si userId est vide", async () => {
            await expect(service.getStats("")).rejects.toThrow(UnauthorizedError);
        });

        it("lève NotFoundError si l'utilisateur est introuvable en base", async () => {
            mockRepo.findUserStats.mockResolvedValue(null);
            await expect(service.getStats("user123")).rejects.toThrow(NotFoundError);
        });

    });

    describe("computeStreak", () => {

        it("retourne 0 quand aucune session complétée", async () => {
            mockRepo.findUserStats.mockResolvedValue(emptyStats());
            const result = await service.getStats("user123");
            expect(result.streak).toBe(0);
        });

        it("retourne 1 quand une session est complétée aujourd'hui", async () => {
            mockRepo.findUserStats.mockResolvedValue(emptyStats([makeSession(daysAgo(0))]));
            const result = await service.getStats("user123");
            expect(result.streak).toBe(1);
        });

        it("retourne 1 quand la dernière session est hier (mais pas aujourd'hui)", async () => {
            mockRepo.findUserStats.mockResolvedValue(emptyStats([makeSession(daysAgo(1))]));
            const result = await service.getStats("user123");
            expect(result.streak).toBe(1);
        });

        it("retourne 0 quand la dernière session remonte à avant-hier (streak cassé)", async () => {
            mockRepo.findUserStats.mockResolvedValue(emptyStats([makeSession(daysAgo(2))]));
            const result = await service.getStats("user123");
            expect(result.streak).toBe(0);
        });

        it("compte correctement un streak de 3 jours consécutifs", async () => {
            mockRepo.findUserStats.mockResolvedValue(emptyStats([
                makeSession(daysAgo(0)),
                makeSession(daysAgo(1)),
                makeSession(daysAgo(2)),
            ]));
            const result = await service.getStats("user123");
            expect(result.streak).toBe(3);
        });

        it("compte plusieurs sessions le même jour comme 1 seul jour", async () => {
            // 3 sessions aujourd'hui → streak = 1, pas 3
            mockRepo.findUserStats.mockResolvedValue(emptyStats([
                makeSession(daysAgo(0)),
                makeSession(daysAgo(0)),
                makeSession(daysAgo(0)),
            ]));
            const result = await service.getStats("user123");
            expect(result.streak).toBe(1);
        });

        it("ignore les sessions avec completedDate null", async () => {
            const sessionWithNull = { ...makeSession(daysAgo(0)), completedDate: null };
            mockRepo.findUserStats.mockResolvedValue(emptyStats([sessionWithNull]));
            const result = await service.getStats("user123");
            expect(result.streak).toBe(0);
        });

        it("ignore les sessions dont la date est dans le futur", async () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            mockRepo.findUserStats.mockResolvedValue(emptyStats([makeSession(tomorrow.toISOString())]));
            const result = await service.getStats("user123");
            expect(result.streak).toBe(0);
        });

    });

    describe("computeTotalDuration", () => {

        it("retourne 00:00:00 quand aucune session", async () => {
            mockRepo.findUserStats.mockResolvedValue(emptyStats());
            const result = await service.getStats("user123");
            expect(result.totalDuration).toBe("00:00:00");
        });

        it("additionne correctement deux sessions de 30 minutes", async () => {
            mockRepo.findUserStats.mockResolvedValue(emptyStats([
                { ...makeSession(daysAgo(0)), duration: "00:30:00" },
                { ...makeSession(daysAgo(0)), duration: "00:30:00" },
            ]));
            const result = await service.getStats("user123");
            expect(result.totalDuration).toBe("01:00:00");
        });

        it("gère le dépassement des minutes en heures (45 + 45 = 01:30:00)", async () => {
            mockRepo.findUserStats.mockResolvedValue(emptyStats([
                { ...makeSession(daysAgo(0)), duration: "00:45:00" },
                { ...makeSession(daysAgo(0)), duration: "00:45:00" },
            ]));
            const result = await service.getStats("user123");
            expect(result.totalDuration).toBe("01:30:00");
        });

    });

    describe("computeVolume", () => {

        it("retourne 0 partout quand aucune session", async () => {
            mockRepo.findUserStats.mockResolvedValue(emptyStats());
            const result = await service.getStats("user123");
            expect(result.totalSets).toBe(0);
            expect(result.totalReps).toBe(0);
            expect(result.totalWeight).toBe(0);
        });

        it("ne compte que les séries complétées pour sets, reps et poids", async () => {
            // La série non complétée (reps: 6, weight: 50) doit être ignorée partout
            const session = {
                ...makeSession(daysAgo(0)),
                exercises: [{
                    actualSets: [
                        { completed: true, reps: 10, weight: 50 },
                        { completed: true, reps: 8, weight: 40 },
                        { completed: false, reps: 6, weight: 50 }, // ← doit être ignorée
                    ],
                }],
            };
            mockRepo.findUserStats.mockResolvedValue(emptyStats([session]));
            const result = await service.getStats("user123");
            expect(result.totalSets).toBe(2);     // seulement les 2 completed
            expect(result.totalReps).toBe(18);    // 10 + 8 (pas 6)
            expect(result.totalWeight).toBe(90);  // 50 + 40 (pas 50)
        });

    });

});
