"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Un message dans la conversation : envoyé par l'utilisateur ("user") ou par FitBot ("assistant")
export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

// Forme complète du store : état + actions
type ChatStore = {
  messages: ChatMessage[];   // Historique de la conversation
  isOpen: boolean;           // Le panel de chat est-il visible ?
  isLoading: boolean;        // FitBot est-il en train de répondre ?
  unreadCount: number;       // Nombre de réponses non lues (badge rouge sur le FAB)
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  updateLastAssistantMessage: (content: string) => void;
  setIsOpen: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  clearMessages: () => void;
  resetUnread: () => void;
  incrementUnread: () => void;
};

// Store Zustand avec persistance localStorage sous la clé "chat_history"
export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      // État initial
      messages: [],
      isOpen: false,
      isLoading: false,
      unreadCount: 0,

      // Ajoute un message à l'historique.
      // Génère automatiquement un id unique et un timestamp.
      addMessage: (msg) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { ...msg, id: crypto.randomUUID(), timestamp: Date.now() },
          ],
        })),

      // Met à jour le contenu du dernier message assistant.
      // Utilisé pendant le streaming : appelé à chaque chunk reçu pour afficher la réponse au fur et à mesure.
      updateLastAssistantMessage: (content) =>
        set((state) => {
          const messages = [...state.messages];
          const lastIdx = messages.length - 1;
          if (lastIdx >= 0 && messages[lastIdx].role === "assistant") {
            messages[lastIdx] = { ...messages[lastIdx], content };
          }
          return { messages };
        }),

      // Ouvre ou ferme le panel.
      // Quand on ouvre, remet le compteur non lus à 0.
      // Quand on ferme, on ne touche PAS à unreadCount (ne pas passer undefined = ne pas écraser).
      setIsOpen: (v) =>
        set(v ? { isOpen: true, unreadCount: 0 } : { isOpen: false }),

      // Active/désactive l'état de chargement (pendant qu'on attend FitBot)
      setIsLoading: (v) => set({ isLoading: v }),

      // Vide tout l'historique de la conversation
      clearMessages: () => set({ messages: [] }),

      // Remet le compteur de messages non lus à 0
      resetUnread: () => set({ unreadCount: 0 }),

      // Incrémente le badge d'un non-lu.
      // Appelé depuis ChatPanel une fois le stream terminé, seulement si le panel est fermé.
      incrementUnread: () =>
        set((state) => ({ unreadCount: state.unreadCount + 1 })),
    }),
    {
      // Nom de la clé dans localStorage
      name: "chat_history",
      // On ne persiste que les messages (pas isOpen, isLoading, unreadCount qui sont des états temporaires)
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);
