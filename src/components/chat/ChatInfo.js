import { useState } from "react";
import OnlineUsers from "../OnlineUsers";


export default function ChatInfo({ users, onReportUser }) {

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <aside className="w-80 h-full bg-white flex flex-col">

      <div className="p-5 border-b border-purple-100 bg-gradient-to-b from-purple-50 to-white">

        <h3 className="text-sm font-semibold text-purple-700">
          Información del chat
        </h3>

        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          Espacio para comunidad, soporte y conversaciones en tiempo real.
        </p>

      </div>

      <div className="p-5 border-b border-purple-100">

        <div className="flex items-center justify-between mb-4">

          <div>
            <h4 className="text-sm font-semibold text-gray-800">
              👥 Usuarios activos
            </h4>

            <p className="text-xs text-gray-400">
              {users.length} conectados
            </p>
          </div>

          <div className="flex -space-x-3">

            {users.slice(0, 4).map((u, i) => (

              <img
                key={i}
                src={u.profileImg || u.avatar}
                alt={u.username}
                className="
                w-9 h-9 rounded-full
                border-2 border-white
                shadow-sm
                "
              />

            ))}

          </div>

        </div>

        <OnlineUsers onlineUsers={users} onSelectUser={setSelectedUser} />

      </div>

      <div className="flex-1 p-5">

        <h4 className="text-sm font-semibold text-gray-800 mb-4">
          📜 Reglas del chat
        </h4>

        <div className="space-y-4 text-sm">

          <div className="flex gap-3 text-gray-600 hover:text-purple-700 transition">
            <span>✅</span>
            <span>Sé respetuoso con los demás</span>
          </div>

          <div className="flex gap-3 text-gray-600 hover:text-purple-700 transition">
            <span>🚫</span>
            <span>No spam ni publicidad</span>
          </div>

          <div className="flex gap-3 text-gray-600 hover:text-purple-700 transition">
            <span>🔗</span>
            <span>No enlaces maliciosos</span>
          </div>

          <div className="flex gap-3 text-gray-600 hover:text-purple-700 transition">
            <span>🎉</span>
            <span>Participa y disfruta</span>
          </div>

        </div>

      </div>

      <div className="p-5 border-t border-purple-100 bg-white">

        <button
          onClick={() => {
            if (!selectedUser) {
              alert("Selecciona un usuario de la lista primero");
              return;
            }
            setIsReportOpen(true);
          }}
          className="
          w-full py-3 rounded-2xl
          bg-gradient-to-r
          from-red-500 to-red-400
          text-white font-medium
          hover:shadow-lg
          transition
          "
        >
          ⚠ Reportar usuario
        </button>

        <p className="text-[11px] text-gray-400 text-center mt-2">
          El equipo revisará tu reporte
        </p>

      </div>

      {isReportOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white w-96 rounded-2xl p-5 shadow-xl">

            <h2 className="text-lg font-semibold text-gray-900">
              Reportar usuario
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Describe el problema del usuario
            </p>

            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Ej: spam, insultos, comportamiento inapropiado..."
              className="w-full mt-3 p-3 border rounded-xl text-sm focus:ring-2 focus:ring-red-300 outline-none"
            />

            <div className="flex justify-end gap-2 mt-4">

              <button
                onClick={() => setIsReportOpen(false)}
                className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  if (!selectedUser) return;
                  onReportUser?.({
                    targetUserId: selectedUser.id,
                    targetUsername: selectedUser.username,
                    reason: reportText
                  });
                  setReportText("");
                  setIsReportOpen(false);
                }}
                className="px-3 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600"
              >
                Enviar
              </button>

            </div>

          </div>

        </div>
      )}

    </aside>
  );
}