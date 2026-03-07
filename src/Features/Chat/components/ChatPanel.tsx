"use client";

import { useEffect, useRef } from "react";
import { X, Trash2 } from "lucide-react";
import { useChatStore } from "../store/chatStore";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

export default function ChatPanel() {
  const { messages, isLoading, isOpen, setIsOpen, addMessage, updateLastAssistantMessage, setIsLoading, clearMessages } =
    useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (isLoading) return;

    addMessage({ role: "user", content: text });
    setIsLoading(true);

    // Ajouter un message assistant vide (sera rempli en streaming)
    addMessage({ role: "assistant", content: "" });

    try {
      const history = useChatStore
        .getState()
        .messages.slice(0, -1) // exclure le message assistant vide
        .map(({ role, content }) => ({ role, content }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!response.ok || !response.body) {
        updateLastAssistantMessage("Désolé, une erreur s'est produite.");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              accumulated += parsed.text;
              updateLastAssistantMessage(accumulated);
            } else if (parsed.error) {
              updateLastAssistantMessage("Erreur : " + parsed.error);
            }
          } catch {
            // Ignore parsing errors
          }
        }
      }
    } catch {
      updateLastAssistantMessage("Désolé, une erreur réseau s'est produite.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-[160px] lg:bottom-[88px] right-4 w-[90vw] sm:w-96 h-[480px] z-[70] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary-500 text-white shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">FitBot</span>
          <span className="text-xs opacity-75">Coach IA</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearMessages}
            className="p-1.5 hover:bg-primary-400 rounded-lg transition-colors"
            title="Effacer la conversation"
            aria-label="Effacer la conversation"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-primary-400 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
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

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Indicateur de frappe */}
        {isLoading && messages[messages.length - 1]?.content === "" && (
          <div className="flex justify-start mb-3">
            <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 mt-0.5">
              AI
            </div>
            <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-tl-sm">
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

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
