import { Bell, MoreVertical, Paperclip } from "lucide-react";
import MessageBubble from "../MessageBubble";
import MessageInput from "../MessageInput";
import TypingIndicator from "../TypingIndicator";

export default function ChatWindow({
  currentChat,
  messages,
  typingUser,
  sendMessage,
  sendTyping,
  connected,
  currentUser,
  currentUserName
}) {
  const chatData = {
    community: {
      icon: "🌎",
      title: "Comunidad",
      subtitle: "Conecta con usuarios en tiempo real",
      emptyTitle: "Aún no hay mensajes",
      emptySubtitle: "Inicia la conversación con la comunidad 🚀"
    },
    support: {
      icon: "🎧",
      title: "Soporte",
      subtitle: "Atención y ayuda para NendoShop",
      emptyTitle: "No hay consultas todavía",
      emptySubtitle: "¿Necesitas ayuda? Escríbenos 💬"
    }
  };

  const chat = chatData[currentChat];

  return (
    <main className="relative flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-b from-white via-purple-50/20 to-white">
      <header className="sticky top-0 z-20 border-b border-purple-100 bg-white/80 backdrop-blur-xl">
        <div className="flex h-20 items-center justify-between gap-2 px-3 sm:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-500 text-lg text-white shadow-md sm:h-12 sm:w-12 sm:text-xl">
              {chat.icon}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-800">{chat.title}</h2>

                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    connected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {connected ? "Conectado" : "Desconectado"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative h-2.5 w-2.5 rounded-full bg-green-500" />
                </span>

                {chat.subtitle}
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button className="h-10 w-10 rounded-xl text-gray-500 transition hover:bg-purple-50 hover:text-purple-600">
              <Bell className="h-5 w-5" />
            </button>

            <button className="h-10 w-10 rounded-xl text-gray-500 transition hover:bg-purple-50 hover:text-purple-600">
              <Paperclip className="h-5 w-5" />
            </button>

            <button className="h-10 w-10 rounded-xl text-gray-500 transition hover:bg-purple-50 hover:text-purple-600">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="mx-auto max-w-4xl space-y-4 px-3 py-4 pb-32 sm:px-8 sm:py-6 sm:pb-40">
          {messages.length === 0 && (
            <div className="mt-32 flex h-full flex-col items-center justify-center">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-purple-100 text-4xl shadow-lg">
                {chat.icon}
              </div>

              <h2 className="text-xl font-bold text-gray-700">{chat.emptyTitle}</h2>

              <p className="mt-2 text-sm text-gray-400">{chat.emptySubtitle}</p>
            </div>
          )}

          {messages.map((msg, i) => {
            const senderName = msg.username || msg.user || "Usuario";
            const text = msg.text || msg.content || "";
            const time = msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "";
            const isOwn =
              senderName === currentUserName ||
              (msg.role === "user" && senderName === (currentUser?.name || currentUser?.email || ""));

            return (
              <MessageBubble
                key={msg.id || msg._id || i}
                user={senderName}
                text={text}
                time={time}
                isOwn={isOwn}
                profileImg={msg.profileImg || msg.meta?.avatar || msg.avatar || (isOwn ? currentUser?.profileImg : null)}
                displayName={isOwn ? "Tú" : senderName}
              />
            );
          })}

          {typingUser ? <TypingIndicator typingUser={typingUser} /> : null}
        </div>
      </div>

      <div className="sticky bottom-0 z-20 w-full">
        <div className="mx-auto max-w-4xl">
          <MessageInput sendMessage={sendMessage} sendTyping={sendTyping} disabled={!connected} />
        </div>
      </div>
    </main>
  );
}
