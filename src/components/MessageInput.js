import { useEffect, useRef, useState } from "react";
import { Mic, SendHorizonal } from "lucide-react";

export default function MessageInput({ sendMessage, sendTyping, disabled }) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.();
    };
  }, []);

  const sendTextMessage = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed || disabled) return;

    sendMessage(trimmed, "User");
    setText("");
    setVoiceError("");
  };

  const handleSend = () => {
    sendTextMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = text.trim().length > 0;

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Tu navegador no admite dictado por voz en este momento.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop?.();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError("");
    };

    recognition.onerror = () => {
      setIsListening(false);
      setVoiceError("No se pudo transcribir la voz. Intenta de nuevo.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();

      if (transcript) {
        setText(transcript);
        sendTextMessage(transcript);
      } else {
        setVoiceError("No se detectó audio suficiente.");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="w-full border-t border-purple-100 bg-gradient-to-t from-white via-white to-purple-50/30 px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(88,28,135,0.06)] backdrop-blur-xl sm:px-4 sm:py-4">

      <div className="mx-auto flex max-w-3xl flex-col gap-2 rounded-[22px] border border-purple-200/80 bg-white/95 px-2.5 py-2 shadow-sm transition focus-within:ring-2 focus-within:ring-purple-200 sm:flex-row sm:items-center sm:px-3 sm:py-2.5">

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

        <div className="flex items-center gap-2 sm:gap-2">
          <button
            type="button"
            onClick={handleVoiceInput}
            aria-label="Enviar mensaje por voz"
            className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
              isListening
                ? "border-purple-500 bg-purple-600 text-white shadow-sm"
                : "border-purple-200 bg-white text-purple-600 hover:bg-purple-100"
            }`}
          >
            <Mic className="h-4 w-4" />
          </button>

          <button
            onClick={handleSend}
            disabled={!canSend || disabled}
            className={`
              flex h-11 items-center justify-center gap-2 rounded-xl px-4 whitespace-nowrap transition active:scale-95
              ${
                canSend && !disabled
                  ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md hover:shadow-lg hover:shadow-purple-200"
                  : "cursor-not-allowed bg-purple-100 text-purple-300"
              }
            `}
          >
            <SendHorizonal className="h-4 w-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </div>

      </div>

 
      <div className="mt-2 flex flex-col gap-1 px-1 text-[11px] sm:flex-row sm:items-center sm:justify-between">

        <span className="text-gray-400">
          {voiceError || "Presiona Enter para enviar · Usa el micrófono para dictar"}
        </span>

        <span className={`font-medium ${disabled ? "text-red-400" : "text-purple-400"}`}>
          {disabled ? "Conexión desconectada" : "Comunidad activa 💬"}
        </span>

      </div>

    </div>
  );
}