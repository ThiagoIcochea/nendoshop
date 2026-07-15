import { useState } from "react";
import { AlertTriangle, FileText, Users, User } from "lucide-react";
import OnlineUsers from "../OnlineUsers";

export default function ChatInfo({ users, onReportUser }) {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [brokenImages, setBrokenImages] = useState({});

  return (
    <aside className="flex h-full w-full flex-col overflow-y-auto bg-white md:w-80">
      <div className="border-b border-purple-100 bg-gradient-to-b from-purple-50 to-white p-5">
        <h3 className="text-sm font-semibold text-purple-700">Información del chat</h3>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          Espacio para comunidad, soporte y conversaciones en tiempo real.
        </p>
      </div>

      <div className="border-b border-purple-100 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-800">
              <Users className="inline h-4 w-4" /> Usuarios activos
            </h4>
            <p className="text-xs text-gray-400">{users.length} conectados</p>
          </div>

          <div className="-space-x-3 flex">
            {users.slice(0, 4).map((u, i) => {
              const username = u?.username || u?.name || "Usuario";
              const avatarSrc = u?.profileImg || u?.avatar || "";
              const showImage = Boolean(avatarSrc) && !brokenImages[i];

              return (
                <div
                  key={i}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-purple-500 to-fuchsia-500 text-[11px] font-semibold text-white shadow-sm"
                >
                  {showImage ? (
                    <img
                      src={avatarSrc}
                      alt={username}
                      onError={() => setBrokenImages((prev) => ({ ...prev, [i]: true }))}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <OnlineUsers onlineUsers={users} onSelectUser={setSelectedUser} />
      </div>

      <div className="flex-1 p-5">
        <h4 className="mb-4 text-sm font-semibold text-gray-800">
          <FileText className="inline h-4 w-4" /> Reglas del chat
        </h4>

        <div className="space-y-4 text-sm">
          <div className="flex gap-3 text-gray-600 transition hover:text-purple-700">
            <span>✅</span>
            <span>Sé respetuoso con los demás</span>
          </div>

          <div className="flex gap-3 text-gray-600 transition hover:text-purple-700">
            <span>🚫</span>
            <span>No spam ni publicidad</span>
          </div>

          <div className="flex gap-3 text-gray-600 transition hover:text-purple-700">
            <span>🔗</span>
            <span>No enlaces maliciosos</span>
          </div>

          <div className="flex gap-3 text-gray-600 transition hover:text-purple-700">
            <span>🎉</span>
            <span>Participa y disfruta</span>
          </div>
        </div>
      </div>

      <div className="border-t border-purple-100 bg-white p-5">
        <button
          onClick={() => {
            if (!selectedUser) {
              alert("Selecciona un usuario de la lista primero");
              return;
            }
            setFeedback("");
            setIsReportOpen(true);
          }}
          className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-red-400 py-3 font-medium text-white transition hover:shadow-lg"
        >
          <AlertTriangle className="mr-2 inline h-4 w-4" /> Reportar usuario
        </button>

        <p className="mt-2 text-center text-[11px] text-gray-400">
          El equipo revisará tu reporte
        </p>
        {feedback ? (
          <p className="mt-2 text-center text-sm text-red-500">{feedback}</p>
        ) : null}
      </div>

      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[min(92vw,24rem)] rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Reportar usuario</h2>
            <p className="mt-1 text-xs text-gray-500">Describe el problema del usuario</p>

            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Ej: spam, insultos, comportamiento inapropiado..."
              className="mt-3 w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 focus:ring-red-300"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsReportOpen(false)}
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200"
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
                  setFeedback("Reporte enviado. El comportamiento del usuario en el chat será analizado por nuestro sistema inteligente.");
                  setReportText("");
                  setIsReportOpen(false);
                }}
                className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600"
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
