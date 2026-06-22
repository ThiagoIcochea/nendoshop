import { useState } from "react";

export default function MessageInput({ sendMessage, sendTyping }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

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
    <div className="w-full px-4 py-3 border-t border-purple-100 bg-white/70 backdrop-blur-xl">

      <div className="flex items-center gap-3 bg-purple-50/40 border border-purple-100 rounded-2xl px-3 py-2 focus-within:ring-2 focus-within:ring-purple-200 transition">

        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            sendTyping?.("User");
          }}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />

        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`
            flex items-center justify-center w-10 h-10 rounded-xl transition
            active:scale-95
            ${
              canSend
                ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md hover:shadow-lg hover:shadow-purple-200"
                : "bg-purple-100 text-purple-300 cursor-not-allowed"
            }
          `}
        >

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M3.4 20.2l17.45-7.48c.79-.34.79-1.45 0-1.79L3.4 3.45c-.81-.35-1.64.46-1.29 1.27l2.2 5.2c.13.31.41.53.74.58l6.86.98c.63.09.63 1 0 1.09l-6.86.98c-.33.05-.61.27-.74.58l-2.2 5.2c-.35.81.48 1.62 1.29 1.27z" />
          </svg>
        </button>

      </div>

 
      <div className="flex justify-between mt-2 px-1">

        <span className="text-[11px] text-gray-400">
          Presiona Enter para enviar
        </span>

        <span className="text-[11px] text-purple-400">
          Comunidad activa 💬
        </span>

      </div>

    </div>
  );
}