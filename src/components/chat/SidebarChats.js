const chats = [
  {
    id: "community",
    name: "Chat de Comunidad",
    icon: "🌎",
    description: "Anime, figuras y colecciones",
    badge: 3
  },
  {
    id: "support",
    name: "Chat de Soporte",
    icon: "🎧",
    description: "Ayuda y consultas",
    badge: 0
  }
];

export default function SidebarChats({
  currentChat,
  setCurrentChat
}) {
  return (
    <aside className="w-full h-full bg-white border-r border-purple-100 flex flex-col md:w-80">

     <div className="p-4 border-b border-purple-100 bg-gradient-to-r from-white to-purple-50">

<div className="flex items-center justify-between gap-3">

    {/* izquierda */}
    <div>
      <h2 className="text-sm font-bold text-gray-900 tracking-wide">
        Mensajes
      </h2>
      <p className="text-xs text-gray-500 mt-0.5">
        Conversaciones activas en la plataforma
      </p>
    </div>

    {/* estado premium */}
    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-purple-100">

      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>

      <span className="text-xs font-medium text-gray-700">
        Online
      </span>

    </div>

        </div>

      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">

        {chats.map(chat => (

          <div
            key={chat.id}
            onClick={() => setCurrentChat(chat.id)}
            className={`
            cursor-pointer rounded-2xl p-3 transition
            ${
              currentChat === chat.id
                ? "bg-purple-100 border border-purple-200 shadow-sm"
                : "hover:bg-purple-50"
            }
          `}
          >

            <div className="flex justify-between">

              <div className="flex gap-3">

                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-lg">

                  {chat.icon}

                </div>

                <div>

                  <h3 className="font-semibold text-gray-800">
                    {chat.name}
                  </h3>

                  <p className="text-xs text-gray-500">
                    {chat.description}
                  </p>

                </div>

              </div>

              {chat.badge > 0 && (

                <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">

                  {chat.badge}

                </span>

              )}

            </div>

          </div>

        ))}

      </div>

      <div className="border-t border-purple-100 p-4">

        <div className="rounded-xl bg-purple-50 p-3">

          <p className="text-sm font-semibold text-purple-700">
            Chats disponibles
          </p>

          <p className="text-xs text-gray-500 mt-1">
            🌎 Comunidad · 🎧 Soporte
          </p>

        </div>

      </div>

    </aside>
  );
}