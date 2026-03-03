import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        // Environnement d'exécution des tests.
        // "node" = pas de DOM (navigateur simulé) — adapté aux services/repositories.
        // Utilise "jsdom" si tu testes des composants React.
        environment: "node",

        // Injecte automatiquement describe/it/expect/vi dans chaque fichier de test.
        // Sans ça, il faudrait les importer manuellement depuis "vitest".
        globals: true,

        // Configuration du rapport de couverture de code (quelles lignes sont testées).
        coverage: {
            // "v8" utilise le moteur JS natif de Node — plus rapide que l'alternative "istanbul".
            provider: "v8",
            // "text" affiche le résumé dans le terminal, "html" génère un rapport navigable dans coverage/.
            reporter: ["text", "html"],
        },
    },
    resolve: {
        // Reproduit l'alias @/* défini dans tsconfig.json.
        // Sans ça, les imports comme `import { StatsService } from "@/services/StatsService"`
        // échoueraient car Vitest ne lit pas la config Next.js/TypeScript directement.
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
