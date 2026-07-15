import { Search } from "lucide-react";
import { useState } from "react";
import AvatarWithFallback from "./chat/AvatarWithFallback";

export default function OnlineUsers({ onlineUsers = [], onSelectUser }) {
  const [searchUser, setSearchUser] = useState("");

  const filteredUsers = (onlineUsers || []).filter((user) => {
    const username = String(user?.username || user?.name || "").toLowerCase();
    return username.includes(String(searchUser || "").toLowerCase());
  });

  return (
    <>
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          className="
            w-full
            rounded-2xl
            border border-purple-100
            bg-purple-50
            px-4 py-3
            text-sm
            outline-none
            transition
            focus:ring-2 focus:ring-purple-200
          "
        />

        <span className="absolute right-4 top-3 text-gray-400">
          <Search className="h-4 w-4" />
        </span>
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => {
            const username = user?.username || user?.name || "Usuario";
            const avatarSrc = user?.profileImg || user?.avatar || "";

            return (
              <div
                key={user.id || `${username}-${index}`}
                onClick={() => onSelectUser?.(user)}
                className="
                  group
                  flex cursor-pointer items-center justify-between
                  rounded-2xl
                  px-3 py-2.5
                  transition-all
                  hover:bg-purple-50
                "
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <AvatarWithFallback
                      src={avatarSrc}
                      alt={username}
                      className="h-10 w-10 border border-purple-100 transition group-hover:scale-105"
                    />

                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-400">
                      <span className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-50" />
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 transition group-hover:text-purple-700">
                      {username}
                    </p>
                    <p className="text-xs text-gray-400">
                      {user.online === true || user.connected === true || user.status === "connected"
                        ? "Conectado"
                        : "Desconectado"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center text-sm text-gray-400">
            No se encontró ningún usuario
          </div>
        )}
      </div>
    </>
  );
}
