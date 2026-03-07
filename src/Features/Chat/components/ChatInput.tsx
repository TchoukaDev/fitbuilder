"use client";

import { useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";

type ChatInputProps = {
  onSend: (text: string) => void;
  disabled: boolean;
};

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const text = ref.current?.value.trim();
    if (!text || disabled) return;
    onSend(text);
    if (ref.current) ref.current.value = "";
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
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
        className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-primary-400 disabled:opacity-50 max-h-24"
        style={{ minHeight: "38px" }}
      />
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
