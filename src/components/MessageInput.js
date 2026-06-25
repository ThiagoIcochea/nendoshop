import { useState } from "react";

export default function MessageInput({ sendMessage, sendTyping, disabled }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    sendMessage(trimmed, "User");
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = text.trim().length > 0;

  return (
    <div className="w-full border-t border-purple-100 bg-white/80 px-3 py-3 backdrop-blur-xl sm:px-4">

      <div className="mx-auto flex max-w-3xl flex-col gap-2 rounded-2xl border border-purple-100 bg-purple-50/40 px-3 py-2 transition focus-within:ring-2 focus-within:ring-purple-200 sm:flex-row sm:items-center">

        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            sendTyping?.("User");
          }}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          className="flex-1 min-w-0 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />

        <button
          onClick={handleSend}
          disabled={!canSend || disabled}
          className={`
            flex items-center justify-center px-4 h-10 rounded-xl transition whitespace-nowrap
            active:scale-95
            ${
              canSend && !disabled
                ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md hover:shadow-lg hover:shadow-purple-200"
                : "bg-purple-100 text-purple-300 cursor-not-allowed"
            }
          `}
        >
          Enviar mensaje
        </button>

      </div>

 
      <div className="flex justify-between mt-2 px-1">

        <span className="text-[11px] text-gray-400">
          Presiona Enter para enviar
        </span>

        <span className={`text-[11px] ${disabled ? "text-red-400" : "text-purple-400"}`}>
          {disabled ? "Conexión desconectada" : "Comunidad activa 💬"}
        </span>

      </div>

    </div>
  );
}