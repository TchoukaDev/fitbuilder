"use client";

import { MessageCircle } from "lucide-react";
import { useChatStore } from "../store/chatStore";
import ChatPanel from "./ChatPanel";

// FAB = Floating Action Button
// Bouton rond fixe en bas à droite de l'écran qui ouvre/ferme le chat.
// Affiche un badge rouge avec le nombre de messages non lus quand le panel est fermé.
export default function ChatFAB() {
  const { isOpen, setIsOpen, unreadCount, resetUnread } = useChatStore();

  // Bascule l'état ouvert/fermé du panel.
  // Si on ouvre, on réinitialise aussi le compteur de non-lus.
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) resetUnread();
  };

  return (
    <>
      {/* Le panel est monté ici mais ne s'affiche que si isOpen === true (voir ChatPanel) */}
      <ChatPanel />

      {/* Bouton rond fixe :
          - mobile : positionné au-dessus de la bottom nav (bottom-[88px])
          - desktop : près du bord bas (bottom-6)
          - z-[70] pour passer au-dessus de la bottom nav (z-50) et des modales (z-[60]) */}
      <button
        onClick={handleToggle}
        aria-label={isOpen ? "Fermer FitBot" : "Ouvrir FitBot"}
        className="fixed bottom-[88px] lg:bottom-6 right-4 z-[70] w-14 h-14 rounded-full bg-primary-500 hover:bg-primary-600 active:scale-95 text-white shadow-lg flex items-center justify-center transition-colors"
      >
        <MessageCircle size={24} />

        {/* Badge rouge avec le nombre de non-lus, visible seulement si > 0 */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {/* Affiche "9+" si plus de 9 messages non lus */}
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </>
  );
}
