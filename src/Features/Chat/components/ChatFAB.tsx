"use client";

import { MessageCircle } from "lucide-react";
import { useChatStore } from "../store/chatStore";
import ChatPanel from "./ChatPanel";

export default function ChatFAB() {
  const { isOpen, setIsOpen, unreadCount, resetUnread } = useChatStore();

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) resetUnread();
  };

  return (
    <>
      <ChatPanel />
      <button
        onClick={handleToggle}
        aria-label={isOpen ? "Fermer FitBot" : "Ouvrir FitBot"}
        className="fixed bottom-[88px] lg:bottom-6 right-4 z-[70] w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-600 active:scale-95 text-white shadow-lg flex items-center justify-center transition-colors"
      >
        <MessageCircle size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </>
  );
}
