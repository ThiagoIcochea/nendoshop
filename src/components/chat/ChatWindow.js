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
      emptySubtitle: "Inicia la conversación con la comunidad 🚀",
    },
    support: {
      icon: "🎧",
      title: "Soporte",
      subtitle: "Atención y ayuda para NendoShop",
      emptyTitle: "No hay consultas todavía",
      emptySubtitle: "¿Necesitas ayuda? Escríbenos 💜",
    },
  };

  const chat = chatData[currentChat];

  return (
    <main className="flex flex-col h-full bg-gradient-to-b from-white via-purple-50/20 to-white">

      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-purple-100">

        <div className="h-20 px-3 sm:px-8 flex items-center justify-between gap-2">

          <div className="flex items-center gap-4">

            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-500 text-white flex items-center justify-center text-lg sm:text-xl shadow-md">
              {chat.icon}
            </div>

            <div>

              <div className="flex items-center gap-3">

                <h2 className="font-bold text-gray-800 text-lg">
                  {chat.title}
                </h2>

                <span className={`px-2 py-1 rounded-full text-xs font-medium ${connected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {connected ? "Conectado" : "Desconectado"}
                </span>

              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">

                <span className="relative flex h-2.5 w-2.5">

                  <span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75"></span>

                  <span className="relative rounded-full h-2.5 w-2.5 bg-green-500"></span>

                </span>

                {chat.subtitle}

              </div>

            </div>

          </div>

          <div className="hidden sm:flex items-center gap-2">

            <button className="w-10 h-10 rounded-xl hover:bg-purple-50 text-gray-500 hover:text-purple-600 transition">
              🔔
            </button>

            <button className="w-10 h-10 rounded-xl hover:bg-purple-50 text-gray-500 hover:text-purple-600 transition">
              📌
            </button>

            <button className="w-10 h-10 rounded-xl hover:bg-purple-50 text-gray-500 hover:text-purple-600 transition">
              ⋮
            </button>

          </div>

        </div>

      </header>

      <div className="flex-1 overflow-y-auto">

        <div className="max-w-4xl mx-auto px-3 sm:px-8 py-4 sm:py-6 space-y-4">

          {messages.length === 0 && (

            <div className="h-full flex flex-col items-center justify-center mt-32">

              <div className="w-24 h-24 rounded-3xl bg-purple-100 flex items-center justify-center text-4xl shadow-lg mb-6">
                {chat.icon}
              </div>

              <h2 className="text-xl font-bold text-gray-700">
                {chat.emptyTitle}
              </h2>

              <p className="text-sm text-gray-400 mt-2">
                {chat.emptySubtitle}
              </p>

            </div>

          )}

          {messages.map((msg, i) => {
            const senderName = msg.username || msg.user || "Usuario";
            const text = msg.text || msg.content || "";
            const time = msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "";
            const isOwn = senderName === currentUserName || (msg.role === "user" && senderName === (currentUser?.name || currentUser?.email || ""));

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

          {typingUser && (
            <TypingIndicator
              typingUser={typingUser}
            />
          )}

        </div>

      </div>

      <div className="bg-white/80 backdrop-blur-xl border-t border-purple-100">

        <div className="max-w-4xl mx-auto">
          <MessageInput
            sendMessage={sendMessage}
            sendTyping={sendTyping}
            disabled={!connected}
          />
        </div>

      </div>

    </main>
  );
}