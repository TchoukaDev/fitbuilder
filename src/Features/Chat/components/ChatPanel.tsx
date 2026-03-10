"use client";

import { useEffect, useRef } from "react";
import { X, Trash2 } from "lucide-react";
import { useChatStore } from "../store/chatStore";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

// Panel principal du chat : header, liste des messages, indicateur de frappe, input.
// Ne s'affiche pas si isOpen === false (return null en bas du composant).
export default function ChatPanel() {
  const {
    messages,
    isLoading,
    isOpen,
    setIsOpen,
    addMessage,
    updateLastAssistantMessage,
    setIsLoading,
    clearMessages,
    incrementUnread,
  } = useChatStore();

  // Référence sur le conteneur scrollable (la zone des messages)
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scrolle au bas du conteneur dans 3 cas :
  // - nouveau message arrivé
  // - état de chargement changé (indicateur "..." apparu/disparu)
  // - panel rouvert (isOpen passe à true → remount du composant)
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isLoading, isOpen]);

  // Appelée quand l'utilisateur envoie un message.
  // Gère tout le cycle : ajout du message, appel API, lecture du stream, mise à jour du store.
  const handleSend = async (text: string) => {
    // Bloque si une réponse est déjà en cours
    if (isLoading) return;

    // 1. Ajoute le message de l'utilisateur dans le store (et l'affiche immédiatement)
    addMessage({ role: "user", content: text });
    setIsLoading(true);

    // 2. Ajoute un message assistant vide en attente (sera rempli chunk par chunk pendant le streaming)
    addMessage({ role: "assistant", content: "" });

    try {
      // 3. Récupère l'historique complet SAUF le dernier message assistant vide (qui n'est pas encore une vraie réponse)
      const history = useChatStore
        .getState()
        .messages.slice(0, -1)
        .map(({ role, content }) => ({ role, content }));

      // 4. Envoie l'historique à l'API /api/chat
      // L'API retourne une réponse en streaming SSE (text/event-stream)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!response.ok || !response.body) {
        updateLastAssistantMessage("Désolé, une erreur s'est produite.");
        return;
      }

      // 5. Lit le stream SSE chunk par chunk
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = ""; // Texte accumulé depuis le début de la réponse

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Décode les octets reçus en texte
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          // Les événements SSE commencent par "data: "
          if (!line.startsWith("data: ")) continue;

          const data = line.slice(6); // Retire le préfixe "data: "

          // Le serveur envoie "data: [DONE]" pour signaler la fin du stream
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);

            if (parsed.text) {
              // Nouveau fragment de texte reçu → on l'accumule et on met à jour la bulle
              accumulated += parsed.text;
              updateLastAssistantMessage(accumulated);
            } else if (parsed.error) {
              // Le serveur a renvoyé une erreur dans le stream
              updateLastAssistantMessage("Erreur : " + parsed.error);
            }
          } catch {
            // Ignore les lignes malformées (peut arriver en cas de découpage inattendu)
          }
        }
      }
    } catch {
      // Erreur réseau (pas de connexion, timeout, etc.)
      updateLastAssistantMessage("Désolé, une erreur réseau s'est produite.");
    } finally {
      // Dans tous les cas, on arrête l'état de chargement
      setIsLoading(false);
      // Si le panel est fermé au moment où FitBot finit de répondre → badge +1
      if (!useChatStore.getState().isOpen) {
        incrementUnread();
      }
    }
  };

  // Si le panel est fermé, on ne rend rien du tout
  if (!isOpen) return null;

  return (
    // Panel fixe positionné au-dessus du FAB
    // mobile : bottom-[160px] (FAB + bottom nav), desktop : bottom-[88px]
    <div className="fixed bottom-[160px] lg:bottom-[88px] right-4 w-[90vw] sm:w-96 h-[480px] z-[70] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">

      {/* Header : nom du bot + boutons corbeille et fermeture */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary-500 text-white shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">FitBot</span>
          <span className="text-xs opacity-75">Coach IA</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Vide tout l'historique de la conversation */}
          <button
            onClick={clearMessages}
            className="p-1.5 hover:bg-primary-400 rounded-lg transition-colors"
            title="Effacer la conversation"
            aria-label="Effacer la conversation"
          >
            <Trash2 size={14} />
          </button>
          {/* Ferme le panel (le FAB reste visible) */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-primary-400 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Zone de messages, scrollable */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-3">

        {/* Message d'accueil affiché uniquement quand la conversation est vide */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-500 font-bold text-lg">AI</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Bonjour ! Je suis FitBot</p>
              <p className="text-xs mt-1">Posez-moi vos questions sur l&apos;entraînement ou FitBuilder.</p>
            </div>
          </div>
        )}

        {/* Liste des messages de la conversation */}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Indicateur "..." animé pendant que FitBot génère sa réponse.
            Affiché seulement si isLoading ET que le dernier message assistant est encore vide */}
        {isLoading && messages[messages.length - 1]?.content === "" && (
          <div className="flex justify-start mb-3">
            <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 mt-0.5">
              AI
            </div>
            <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-tl-sm">
              {/* Trois points qui rebondissent avec un délai décalé pour l'effet "frappe" */}
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Zone de saisie en bas du panel */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
