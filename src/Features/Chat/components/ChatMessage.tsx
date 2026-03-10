import { ChatMessage as ChatMessageType } from "../store/chatStore";

// Affiche une bulle de message dans la conversation.
// - Message utilisateur : bulle bleue alignée à droite, pas d'avatar
// - Message FitBot : bulle grise alignée à gauche, avec l'avatar "AI"
export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    // Aligne la bulle à droite pour l'utilisateur, à gauche pour FitBot
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>

      {/* Avatar "AI" visible uniquement pour les messages de FitBot */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 mt-0.5">
          AI
        </div>
      )}

      {/* Bulle de message avec style conditionnel selon l'expéditeur */}
      <div
        className={[
          "max-w-[80%] px-3 py-2 rounded-2xl text-sm",
          isUser
            ? "bg-primary-500 text-white rounded-tr-sm"   // Bleu, coin haut-droit carré
            : "bg-gray-100 text-gray-800 rounded-tl-sm",  // Gris, coin haut-gauche carré
        ].join(" ")}
      >
        {/* whitespace-pre-wrap : respecte les sauts de ligne dans la réponse de FitBot */}
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}
