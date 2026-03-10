"use client";

import { useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";

type ChatInputProps = {
  onSend: (text: string) => void; // Callback appelé quand l'utilisateur envoie un message
  disabled: boolean;              // Bloque l'input pendant que FitBot répond
};

// Barre de saisie en bas du panel : textarea + bouton envoi.
// Entrée = envoyer, Shift+Entrée = saut de ligne.
export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  // Référence directe sur le textarea pour lire et vider sa valeur sans état React
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const text = ref.current?.value.trim();
    // Ne fait rien si le texte est vide ou si une réponse est en cours
    if (!text || disabled) return;
    onSend(text);
    // Vide le textarea après envoi
    if (ref.current) ref.current.value = "";
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Entrée seule = envoyer (preventDefault bloque le saut de ligne par défaut)
    // Shift+Entrée = saut de ligne (comportement natif conservé)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 items-end p-3 border-t border-gray-200 bg-white">
      <textarea
        ref={ref}
        rows={1}
        placeholder="Posez votre question..."
        disabled={disabled}
        onKeyDown={handleKey}
        // max-h-24 : le textarea grandit jusqu'à ~6 lignes puis devient scrollable
        className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary-400 disabled:opacity-50 max-h-24"
        style={{ minHeight: "38px" }}
      />
      {/* Bouton d'envoi désactivé pendant le chargement */}
      <button
        onClick={handleSend}
        disabled={disabled}
        aria-label="Envoyer"
        className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl p-2 transition-colors shrink-0"
      >
        <Send size={16} />
      </button>
    </div>
  );
}
