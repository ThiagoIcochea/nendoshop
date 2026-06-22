export default function ChatHeader() {
  return (
    <div className="px-6 py-4 border-b border-purple-100 bg-white/70 backdrop-blur-xl flex items-center justify-between">

      <div className="flex flex-col">

        <div className="flex items-center gap-2">

          <h2 className="font-semibold text-purple-700 text-base tracking-tight">
            💬 Chat de Comunidad
          </h2>

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
            LIVE
          </span>

        </div>

        <div className="flex items-center gap-2 text-xs text-green-600 mt-1">

          <span className="relative flex h-2.5 w-2.5">

            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50"></span>

            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 shadow-sm"></span>

          </span>

          <span className="text-gray-600">
            20 usuarios activos ahora
          </span>

        </div>

      </div>

      <div className="flex items-center gap-2">

        <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-600 transition active:scale-95">
          🔔
        </button>

        <button className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-600 transition active:scale-95">
          ⋯
        </button>

      </div>

    </div>
  );
}