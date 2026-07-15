import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages }) {
  const endRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const isNearBottom = distanceFromBottom < 150;

    if (isNearBottom) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="
        flex-1 overflow-y-auto px-5 py-6
        bg-gradient-to-b from-white via-white to-purple-50/30
        scroll-smooth
      "
    >
      {messages.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center text-center animate-fadeIn">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-2xl shadow-sm">
            <MessageCircle className="h-7 w-7 text-purple-600" />
          </div>

          <p className="text-sm font-semibold text-gray-500">Aún no hay mensajes</p>

          <p className="mt-1 text-xs text-gray-400">
            Inicia la conversación con la comunidad 🚀
          </p>
        </div>
      )}

      <div className="space-y-2">
        {messages.map((msg, i) => (
          <div key={msg.id || i} className="animate-fadeInUp">
            <MessageBubble {...msg} />
          </div>
        ))}
      </div>

      <div ref={endRef} />
    </div>
  );
}
