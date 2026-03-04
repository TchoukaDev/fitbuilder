/**
 * Script de migration MongoDB — Étape 3
 *
 * Passage du modèle embarqué (tout dans `users`) aux collections séparées :
 *   users.workouts[]  →  collection `workouts`  (+ champ userId)
 *   users.sessions[]  →  collection `sessions`  (userId/workoutId déjà présents)
 *   users.exercises[] →  collection `exercises` (+ champ userId)
 *   collection `exercises` publics → ajout userId: null
 *
 * Usage :
 *   npx tsx scripts/migrate.ts              — migration réelle
 *   npx tsx scripts/migrate.ts --dry-run    — simulation (aucune écriture)
 *   npx tsx scripts/migrate.ts --cleanup    — migration + suppression des tableaux embarqués
 *
 * Le script est idempotent : peut être relancé sans risque (upsert).
 */

import fs from "fs";
import path from "path";
import { MongoClient, ObjectId } from "mongodb";

// ─── Chargement de .env.local ────────────────────────────────────────────────

function loadEnv() {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (!fs.existsSync(envPath)) return;
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = value;
    }
}

loadEnv();

// ─── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes("--dry-run");
const CLEANUP = process.argv.includes("--cleanup");

const log = (...args: unknown[]) => process.stdout.write(args.join(" ") + "\n");
const warn = (...args: unknown[]) => process.stderr.write("⚠  " + args.join(" ") + "\n");

// ─── Migration ───────────────────────────────────────────────────────────────

async function migrate() {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI introuvable dans .env.local");

    log(DRY_RUN ? "\n🔍 MODE DRY-RUN — aucune écriture\n" : "\n🚀 Migration en cours...\n");

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();

    try {
        // ── État initial ──────────────────────────────────────────────────────

        const users = await db.collection("users").find({}).toArray();
        log(`Utilisateurs trouvés : ${users.length}`);

        const totalEmbeddedWorkouts = users.reduce((n, u) => n + (u.workouts?.length ?? 0), 0);
        const totalEmbeddedSessions = users.reduce((n, u) => n + (u.sessions?.length ?? 0), 0);
        const totalEmbeddedPrivateExercises = users.reduce((n, u) => n + (u.exercises?.length ?? 0), 0);
        const totalPublicExercises = await db.collection("exercises").countDocuments({ userId: { $exists: false } });

        log(`  workouts embarqués    : ${totalEmbeddedWorkouts}`);
        log(`  sessions embarquées   : ${totalEmbeddedSessions}`);
        log(`  exercices privés      : ${totalEmbeddedPrivateExercises}`);
        log(`  exercices publics     : ${totalPublicExercises}\n`);

        // ── Phase 1 : Copie vers les nouvelles collections ────────────────────

        let workoutsMigrated = 0;
        let sessionsMigrated = 0;
        let privateExercisesMigrated = 0;

        for (const user of users) {
            const userId = user._id as ObjectId;

            // Workouts
            if (user.workouts?.length) {
                for (const workout of user.workouts) {
                    const doc = { ...workout, userId };
                    if (!DRY_RUN) {
                        await db.collection("workouts").updateOne(
                            { _id: doc._id },
                            { $setOnInsert: doc },
                            { upsert: true }
                        );
                    }
                    workoutsMigrated++;
                }
            }

            // Sessions
            if (user.sessions?.length) {
                for (const session of user.sessions) {
                    if (!DRY_RUN) {
                        await db.collection("sessions").updateOne(
                            { _id: session._id },
                            { $setOnInsert: session },
                            { upsert: true }
                        );
                    }
                    sessionsMigrated++;
                }
            }

            // Exercices privés
            if (user.exercises?.length) {
                for (const exercise of user.exercises) {
                    const doc = { ...exercise, userId };
                    if (!DRY_RUN) {
                        await db.collection("exercises").updateOne(
                            { _id: doc._id },
                            { $setOnInsert: doc },
                            { upsert: true }
                        );
                    }
                    privateExercisesMigrated++;
                }
            }
        }

        // Exercices publics : ajout userId: null
        if (!DRY_RUN && totalPublicExercises > 0) {
            await db.collection("exercises").updateMany(
                { userId: { $exists: false } },
                { $set: { userId: null } }
            );
        }

        log("Résultats de la migration :");
        log(`  workouts migrés       : ${workoutsMigrated}`);
        log(`  sessions migrées      : ${sessionsMigrated}`);
        log(`  exercices privés      : ${privateExercisesMigrated}`);
        log(`  exercices publics mis à jour : ${totalPublicExercises}`);

        // ── Vérification ─────────────────────────────────────────────────────

        if (!DRY_RUN) {
            log("\nVérification :");
            const countWorkouts = await db.collection("workouts").countDocuments();
            const countSessions = await db.collection("sessions").countDocuments();
            const countExercises = await db.collection("exercises").countDocuments();

            const ok = (actual: number, expected: number, label: string) => {
                const status = actual >= expected ? "✅" : "❌";
                log(`  ${status} ${label} : ${actual} (attendu : ${expected})`);
                if (actual < expected) warn(`Écart de ${expected - actual} documents pour ${label}`);
            };

            ok(countWorkouts, totalEmbeddedWorkouts, "workouts");
            ok(countSessions, totalEmbeddedSessions, "sessions");
            ok(countExercises, totalEmbeddedPrivateExercises + totalPublicExercises, "exercises");
        }

        // ── Phase 2 : Nettoyage (optionnel) ──────────────────────────────────

        if (CLEANUP) {
            if (DRY_RUN) {
                log("\n[DRY-RUN] Supprimerait workouts[], sessions[], exercises[] de tous les users");
            } else {
                log("\nNettoyage des tableaux embarqués...");
                const result = await db.collection("users").updateMany(
                    {},
                    { $unset: { workouts: "", sessions: "", exercises: "" } }
                );
                log(`  ✅ ${result.modifiedCount} utilisateurs nettoyés`);
            }
        } else {
            log("\n💡 Les tableaux embarqués sont conservés pour l'instant.");
            log("   Relance avec --cleanup pour les supprimer une fois les Repositories mis à jour.");
        }

    } finally {
        await client.close();
        log("\nTerminé.");
    }
}

migrate().catch((err) => {
    console.error("❌ Erreur :", err);
    process.exit(1);
});
