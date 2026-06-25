import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const getProductUrl = (productId) => {
  if (!productId) return null;
  return `/#/product/${productId}`;
};

const getBackendUrl = () => {
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:4000";
    }
  }

  return "https://backendproyectodf.onrender.com";
};

const BACKEND_URL = getBackendUrl();
const getWebSocketUrl = () => {
  if (!BACKEND_URL) return null;
  if (BACKEND_URL.startsWith("https://")) return BACKEND_URL.replace("https://", "wss://");
  if (BACKEND_URL.startsWith("http://")) return BACKEND_URL.replace("http://", "ws://");
  return BACKEND_URL;
};

export default function PurchaseAlertModal() {
  const [alert, setAlert] = useState(null);
  const socketRef = useRef(null);
  const timeoutRef = useRef(null);
  const reconnectRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const connectSocket = () => {
      if (socketRef.current && ["connecting", "open"].includes(socketRef.current.readyState)) {
        return;
      }

      const socket = new WebSocket(getWebSocketUrl());
      socketRef.current = socket;

      socket.addEventListener("message", (event) => {
        try {
          const data = typeof event.data === "string" ? JSON.parse(event.data) : null;
          if (data?.type !== "purchase-alert") return;

          const payload = data.payload || data;
          if (!payload?.id) return;

          setAlert(payload);

          if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
          }

          timeoutRef.current = window.setTimeout(() => {
            setAlert((current) => (current?.id === payload.id ? null : current));
          }, 10000);
        } catch (error) {
          console.error("Purchase alert parse error", error);
        }
      });

      socket.addEventListener("close", () => {
        if (reconnectRef.current) {
          window.clearTimeout(reconnectRef.current);
        }
        reconnectRef.current = window.setTimeout(() => {
          connectSocket();
        }, 2000);
      });
    };

    connectSocket();

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      if (reconnectRef.current) {
        window.clearTimeout(reconnectRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  if (!alert || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[1200] pointer-events-none" role="status" aria-live="polite">
      <div className="w-[320px] max-w-[calc(100vw-2rem)] rounded-2xl border border-amber-200 bg-white/95 shadow-2xl backdrop-blur-md p-3 animate-[fadeIn_0.25s_ease-out]">
        <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs uppercase tracking-wide">
          <span>🔥</span>
          <span>Oferta en tiempo real</span>
        </div>
        <h3 className="mt-2 text-sm font-bold text-gray-900 leading-snug">
          {alert.customer} acaba de comprar {alert.product}
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Aprovecha ahora por solo {alert.priceLabel || `S/. ${alert.price}`}
        </p>
        <p className="mt-2 text-xs text-purple-700 font-medium">
          {alert.message}
        </p>
        {alert.productId ? (
          <a
            href={getProductUrl(alert.productId)}
            className="mt-3 inline-flex items-center rounded-full bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700 pointer-events-auto"
          >
            Ver producto
          </a>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
