import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const socket = new WebSocket(getWebSocketUrl());

    socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "purchase-alert") {
          setAlert(data.payload);
          window.setTimeout(() => setAlert((current) => (current?.id === data.payload?.id ? null : current)), 10000);
        }
      } catch (error) {
        console.error("Purchase alert parse error", error);
      }
    });

    return () => {
      socket.close();
    };
  }, []);

  if (!alert || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1200] pointer-events-none flex items-start justify-center px-4 pt-6">
      <div className="w-full max-w-md rounded-3xl border border-amber-200 bg-white/95 shadow-2xl backdrop-blur-md p-4 animate-[fadeIn_0.25s_ease-out]">
        <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm">
          <span>🔥</span>
          <span>Oferta en tiempo real</span>
        </div>
        <h3 className="mt-2 text-lg font-bold text-gray-900">
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
            href={`/product/${alert.productId}`}
            className="mt-3 inline-flex items-center rounded-full bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700"
          >
            Ver detalle del producto
          </a>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
