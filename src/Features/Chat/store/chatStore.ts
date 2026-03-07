"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

type ChatStore = {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  unreadCount: number;
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  updateLastAssistantMessage: (content: string) => void;
  setIsOpen: (v: boolean) => void;
  setIsLoading: (v: boolean) => void;
  clearMessages: () => void;
  resetUnread: () => void;
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      isOpen: false,
      isLoading: false,
      unreadCount: 0,

      addMessage: (msg) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { ...msg, id: crypto.randomUUID(), timestamp: Date.now() },
          ],
          unreadCount:
            msg.role === "assistant" && !state.isOpen
              ? state.unreadCount + 1
              : state.unreadCount,
        })),

      updateLastAssistantMessage: (content) =>
        set((state) => {
          const messages = [...state.messages];
          const lastIdx = messages.length - 1;
          if (lastIdx >= 0 && messages[lastIdx].role === "assistant") {
            messages[lastIdx] = { ...messages[lastIdx], content };
          }
          return { messages };
        }),

      setIsOpen: (v) =>
        set({ isOpen: v, unreadCount: v ? 0 : undefined } as Partial<ChatStore>),

      setIsLoading: (v) => set({ isLoading: v }),

      clearMessages: () => set({ messages: [] }),

      resetUnread: () => set({ unreadCount: 0 }),
    }),
    {
      name: "chat_history",
      partialize: (state) => ({ messages: state.messages }),
    }
  )
);
