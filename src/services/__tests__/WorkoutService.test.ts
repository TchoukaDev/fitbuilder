import { describe, expect, it, vi, beforeEach } from "vitest";
import { WorkoutService } from "../WorkoutService";
import { DuplicateError, NotFoundError, UnauthorizedError } from "@/libs/ServicesErrors";

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Crée un workout app-facing (id = string) avec les champs minimaux
function makeWorkout(name: string, id = "workout-id-1") {
    return {
        id,
        name,
        description: "Test",
        category: "Test",
        estimatedDuration: 0,
        exercises: [],
        timesUsed: 0,
        lastUsedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

// ─── Mock ────────────────────────────────────────────────────────────────────

const mockRepo = {
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
};

// ─── Setup ───────────────────────────────────────────────────────────────────

let service: WorkoutService;

beforeEach(() => {
    vi.clearAllMocks();
    service = new WorkoutService(mockRepo as any);
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("WorkoutService", () => {

    describe("create", () => {

        it("lève UnauthorizedError si userId est vide", async () => {
            await expect(service.create("", makeWorkout("Test"))).rejects.toThrow(UnauthorizedError);
        });

        it("lève DuplicateError si un workout avec le même nom existe déjà", async () => {
            mockRepo.findAll.mockResolvedValue([makeWorkout("Push Day")]);
            await expect(service.create("user1", makeWorkout("Push Day"))).rejects.toThrow(DuplicateError);
        });

        it("lève DuplicateError même si la casse est différente (push day vs Push Day)", async () => {
            // La règle métier est case-insensitive : "push day" == "Push Day"
            mockRepo.findAll.mockResolvedValue([makeWorkout("Push Day")]);
            await expect(service.create("user1", makeWorkout("push day"))).rejects.toThrow(DuplicateError);
        });

    });

    describe("update", () => {

        it("lève UnauthorizedError si userId est vide", async () => {
            await expect(service.update("", "id-1", makeWorkout("Test"))).rejects.toThrow(UnauthorizedError);
        });

        it("lève NotFoundError si workoutId est vide", async () => {
            await expect(service.update("user1", "", makeWorkout("Test"))).rejects.toThrow(NotFoundError);
        });

        it("lève DuplicateError si un autre workout a déjà ce nom", async () => {
            // id-1 et id-2 sont deux workouts différents
            // On tente de renommer id-2 avec le nom déjà pris par id-1
            mockRepo.findAll.mockResolvedValue([
                makeWorkout("Push Day", "id-1"),
                makeWorkout("Pull Day", "id-2"),
            ]);
            await expect(
                service.update("user1", "id-2", makeWorkout("Push Day", "id-2"))
            ).rejects.toThrow(DuplicateError);
        });

        it("autorise de garder le même nom sur le même workout", async () => {
            // On renomme id-1 avec son propre nom → pas de DuplicateError
            mockRepo.findAll.mockResolvedValue([makeWorkout("Push Day", "id-1")]);
            mockRepo.update.mockResolvedValue(makeWorkout("Push Day", "id-1"));
            await expect(
                service.update("user1", "id-1", makeWorkout("Push Day", "id-1"))
            ).resolves.not.toThrow();
        });

    });

    describe("delete", () => {

        it("lève UnauthorizedError si userId est vide", async () => {
            await expect(service.delete("", "id-1")).rejects.toThrow(UnauthorizedError);
        });

        it("lève NotFoundError si workoutId est vide", async () => {
            await expect(service.delete("user1", "")).rejects.toThrow(NotFoundError);
        });

    });

});
