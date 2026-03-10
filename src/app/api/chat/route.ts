import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAuth } from "@/libs/authMiddleware";
import { FITBOT_SYSTEM_PROMPT } from "@/Features/Chat/utils/systemPrompt";

// Client Anthropic initialisé une seule fois au démarrage du module (singleton)
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/chat
// Reçoit l'historique de la conversation et retourne la réponse de FitBot en streaming SSE.
// SSE = Server-Sent Events : le serveur envoie des fragments de texte au fur et à mesure
// au lieu d'attendre que la réponse soit complète (meilleure UX).
export async function POST(req: NextRequest) {
  // Vérifie que l'utilisateur est connecté — sinon retourne 401
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const body = await req.json();

  // messages = historique complet de la conversation (role + content)
  // Inclut tous les échanges précédents pour que Claude ait le contexte
  const messages: { role: "user" | "assistant"; content: string }[] =
    body.messages ?? [];

  if (!messages.length) {
    return NextResponse.json({ error: "Messages requis" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY non configurée" },
      { status: 500 }
    );
  }

  // Crée un ReadableStream : flux de données que le navigateur lit en continu
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Ouvre un stream vers l'API Anthropic
        const anthropicStream = client.messages.stream({
          model: "claude-haiku-4-5", // Modèle rapide et économique
          max_tokens: 1024,          // Limite la longueur de la réponse
          system: FITBOT_SYSTEM_PROMPT, // Instructions de rôle (non visibles par l'utilisateur)
          messages,                  // Historique complet de la conversation
        });

        // Itère sur les événements du stream Anthropic au fur et à mesure qu'ils arrivent
        for await (const event of anthropicStream) {
          // On ne traite que les événements de type "fragment de texte"
          // (il y a d'autres types d'événements : start, stop, metadata... qu'on ignore)
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            // Formate le fragment en ligne SSE et l'envoie au navigateur
            // Format SSE : "data: <json>\n\n"
            const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`;
            controller.enqueue(new TextEncoder().encode(chunk));
          }
        }

        // Envoie le signal de fin de stream au client
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err) {
        // En cas d'erreur Anthropic, on l'envoie dans le stream plutôt que de planter silencieusement
        const msg = err instanceof Error ? err.message : "Erreur serveur";
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ error: msg })}\n\n`)
        );
        controller.close();
      }
    },
  });

  // Retourne le stream avec les headers SSE requis par le navigateur
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream", // Indique au navigateur que c'est un flux SSE
      "Cache-Control": "no-cache",         // Désactive tout cache intermédiaire
      Connection: "keep-alive",            // Maintient la connexion ouverte pendant le stream
    },
  });
}
