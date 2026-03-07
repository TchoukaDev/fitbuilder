import { ChatMessage as ChatMessageType } from "../store/chatStore";

export default function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 mt-0.5">
          AI
        </div>
      )}
      <div
        className={[
          "max-w-[80%] px-3 py-2 rounded-2xl text-sm",
          isUser
            ? "bg-primary-500 text-white rounded-tr-sm"
            : "bg-gray-100 text-gray-800 rounded-tl-sm",
        ].join(" ")}
      >
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}
