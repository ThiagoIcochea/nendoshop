import { useState } from "react";

const getUserInitials = (username = "") => {
  const parts = String(username).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export default function OnlineUsers({ onlineUsers = [], onSelectUser }) {

  const [searchUser, setSearchUser] = useState("");
  const [imageErrors, setImageErrors] = useState({});

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
            bg-purple-50
            border border-purple-100
            px-4 py-3
            text-sm
            outline-none
            focus:ring-2 focus:ring-purple-200
            transition
          "
        />

        <span className="absolute right-4 top-3 text-gray-400">
          🔍
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">

        {filteredUsers.length > 0 ? (

          filteredUsers.map((user, index) => {
            const username = user?.username || user?.name || "Usuario";
            const avatarSrc = user?.profileImg || user?.avatar || "";
            const imageFailed = Boolean(imageErrors[index]);

            return (

            <div
              key={user.id || `${username}-${index}`}
              onClick={() => onSelectUser?.(user)}
              className="
                group
                flex items-center justify-between
                px-3 py-2.5
                rounded-2xl
                hover:bg-purple-50
                transition-all
                cursor-pointer
              "
            >
              <div className="flex items-center gap-3">

                <div className="relative">

                  {avatarSrc && !imageFailed ? (
                    <img
                      src={avatarSrc}
                      alt={username}
                      onError={() => setImageErrors((prev) => ({ ...prev, [index]: true }))}
                      className="
                        w-10 h-10
                        rounded-full
                        object-cover
                        border border-purple-100
                        shadow-sm
                        group-hover:scale-105
                        transition
                      "
                    />
                  ) : (
                    <div
                      className="
                        w-10 h-10
                        rounded-full
                        bg-gradient-to-br from-purple-500 to-fuchsia-500
                        text-white
                        flex items-center justify-center
                        text-sm font-semibold
                        border border-purple-100
                        shadow-sm
                        group-hover:scale-105
                        transition
                      "
                    >
                      {getUserInitials(username)}
                    </div>
                  )}

                  <span
                    className="
                      absolute bottom-0 right-0
                      w-3 h-3 rounded-full
                      bg-green-400 border-2 border-white
                    "
                  >
                    <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-50"></span>
                  </span>

                </div>

                <div>

                  <p
                    className="
                      text-sm font-medium text-gray-700
                      group-hover:text-purple-700
                      transition
                    "
                  >
                    {username}
                  </p>

                  <p className="text-xs text-gray-400">
                    {user.online === true || user.connected === true || user.status === "connected" ? "Conectado" : "Desconectado"}
                  </p>

                </div>

              </div>

            </div>

          );
          })

        ) : (

          <div className="text-center py-6 text-gray-400 text-sm">
            No se encontró ningún usuario
          </div>

        )}

      </div>

    </>
  );
}