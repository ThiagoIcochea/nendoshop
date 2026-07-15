import { useCallback, useEffect, useRef, useState } from "react";
import { BACKEND_URL } from "../utils/config";
import { ROUTES } from "../utils/secureRoutes";

const getWebSocketUrl = () => {
  if (!BACKEND_URL) return null;
  if (BACKEND_URL.startsWith("https://")) return BACKEND_URL.replace("https://", "wss://");
  if (BACKEND_URL.startsWith("http://")) return BACKEND_URL.replace("http://", "ws://");
  return BACKEND_URL;
};

const WS_URL = getWebSocketUrl();

const getAuthToken = () => {
  try {
    const savedAuth = localStorage.getItem("auth");
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      if (authData?.token) return authData.token;
      if (authData?.user?.token) return authData.user.token;
    }
  } catch (error) {
    // Ignore malformed auth payloads and fall back to the plain token entry.
  }

  return localStorage.getItem("token") || "";
};

const decodeTokenPayload = (token) => {
  try {
    const payload = String(token || "").split(".")[1];
    if (!payload) return null;
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4), "=");
    return JSON.parse(window.atob(paddedPayload));
  } catch (error) {
    return null;
  }
};

const getUserIdFromToken = (token) => {
  const payload = decodeTokenPayload(token);
  return payload?.id || payload?._id || payload?.userId || payload?.sub || null;
};

const fetchRoomMessages = async (roomKey) => {
  const headers = {};
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${BACKEND_URL}/api/chat/rooms/${roomKey}/messages?limit=200`, {
    credentials: "include",
    headers
  });

  if (!response.ok) {
    throw new Error("No se pudieron cargar los mensajes");
  }

  return response.json();
};

const readLocalCart = () => {
  try {
    const storedCart = localStorage.getItem("cart");
    const cart = storedCart ? JSON.parse(storedCart) : [];
    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    return [];
  }
};

const getCacheKey = (roomKey) => `chat_messages_${roomKey}`;

const readCachedMessages = (roomKey) => {
  try {
    const cached = localStorage.getItem(getCacheKey(roomKey));
    const data = cached ? JSON.parse(cached) : [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
};

const saveCachedMessages = (roomKey, messages) => {
  try {
    localStorage.setItem(getCacheKey(roomKey), JSON.stringify(messages));
  } catch (error) {
    // No-op.
  }
};

export default function useChatSocket(roomKey, username, userId, profileImg = "") {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectDelayRef = useRef(500);
  const isMountedRef = useRef(true);

  const authToken = getAuthToken();
  const resolvedUserId = userId || getUserIdFromToken(authToken);
  const finalRoomKey = roomKey === "support" ? (resolvedUserId ? `support_${resolvedUserId}` : roomKey) : roomKey;

  const syncBotCartAction = useCallback((message) => {
    const action = message?.meta?.action;
    if (!action || action.type !== "cart_add") return;

    const product = action.product || {};
    let cart = [];

    try {
      const storedCart = localStorage.getItem("cart");
      cart = storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      cart = [];
    }

    if (!Array.isArray(cart)) cart = [];

    const normalizedProduct = {
      id: product.id || product._id || product.name,
      _id: product.id || product._id || product.name,
      name: product.name || "Producto",
      price: Number(product.price || 0),
      quantity: Number(product.quantity || 1),
      stock: Number(product.stock || 1),
      image: product.image || ""
    };

    const existing = cart.find((item) => String(item.id) === String(normalizedProduct.id) || String(item._id) === String(normalizedProduct._id));
    if (existing) {
      existing.quantity = Number(existing.quantity || 1) + Number(normalizedProduct.quantity || 1);
    } else {
      cart.push(normalizedProduct);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));
  }, []);

  const handleBotAction = useCallback((message) => {
    const action = message?.meta?.action;
    if (!action) return;

    if (action.type === "navigate" && action.path) {
      const routeMap = {
        "/pagos": ROUTES.payments,
        "/pedidos": ROUTES.orders
      };
      window.location.hash = `#${routeMap[action.path] || action.path}`;
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    if (!WS_URL) return;

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    if (socketRef.current && [WebSocket.CONNECTING, WebSocket.OPEN].includes(socketRef.current.readyState)) {
      return;
    }

    const separator = WS_URL.includes("?") ? "&" : "?";
    const socketUrl = authToken ? `${WS_URL}${separator}token=${encodeURIComponent(authToken)}` : WS_URL;
    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      if (!isMountedRef.current) return;
      setConnected(true);
      reconnectDelayRef.current = 500;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (finalRoomKey && username) {
        socket.send(JSON.stringify({ type: "join", roomKey: finalRoomKey, username, userId: resolvedUserId, profileImg }));
      }
    });

    socket.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(event.data);
        switch (payload.type) {
          case "joined":
            break;
          case "room-message":
            if (payload.message?.role === "assistant") {
              syncBotCartAction(payload.message);
              handleBotAction(payload.message);
            }
            setMessages((prev) => {
              const next = [...prev, payload.message];
              saveCachedMessages(finalRoomKey, next);
              return next;
            });
            break;
          case "typing":
            if (payload.username !== username) {
              setTypingUser(payload.username);
              clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => setTypingUser(""), 1500);
            }
            break;
          case "room-users":
            setOnlineUsers(payload.users || []);
            break;
          case "force-disconnect":
            setConnected(false);
            if (socketRef.current) {
              socketRef.current.close();
              socketRef.current = null;
            }
            break;
          case "user-joined":
            setOnlineUsers((prev) => {
              if (prev.some((user) => user.id === payload.user.id)) return prev;
              return [...prev, payload.user];
            });
            break;
          case "user-left":
            setOnlineUsers((prev) => prev.filter((user) => user.id !== payload.userId));
            break;
          case "error":
            console.error("Chat error:", payload.message);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error("WebSocket parse error:", error);
      }
    });

    socket.addEventListener("close", (event) => {
      if (!isMountedRef.current) return;
      setConnected(false);
      if (socketRef.current === socket) {
        socketRef.current = null;
      }

      if (event.code === 1008 || event.code === 4001) {
        return;
      }

      if (!reconnectTimeoutRef.current) {
        const delay = reconnectDelayRef.current;
        reconnectDelayRef.current = Math.min(delay * 2, 5000);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connectWebSocket();
        }, delay);
      }
    });

    socket.addEventListener("error", () => {
      setConnected(false);
    });
  }, [authToken, finalRoomKey, handleBotAction, profileImg, resolvedUserId, syncBotCartAction, username]);

  useEffect(() => {
    isMountedRef.current = true;
    if (!roomKey || !username) return undefined;

    let active = true;
    const cachedMessages = readCachedMessages(finalRoomKey);
    if (cachedMessages.length) {
      setMessages(cachedMessages);
    } else {
      setMessages([]);
    }

    fetchRoomMessages(finalRoomKey)
      .then((data) => {
        if (!active) return;
        const nextMessages = Array.isArray(data) ? data : [];
        setMessages(nextMessages);
        saveCachedMessages(finalRoomKey, nextMessages);
      })
      .catch((error) => {
        console.error(error);
      });

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      connectWebSocket();
    } else if (finalRoomKey) {
      socketRef.current.send(JSON.stringify({ type: "join", roomKey: finalRoomKey, username, userId: resolvedUserId, profileImg }));
    }

    return () => {
      active = false;
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (socketRef.current) {
        try {
          socketRef.current.close();
        } catch (error) {
          // Ignore close errors during unmount.
        }
        socketRef.current = null;
      }
      setTypingUser("");
      setOnlineUsers([]);
    };
  }, [authToken, connectWebSocket, finalRoomKey, profileImg, resolvedUserId, roomKey, username]);

  const sendMessage = useCallback((text) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn("Socket no conectado");
      return;
    }

    const cartItems = finalRoomKey?.startsWith("support") ? readLocalCart() : [];
    socketRef.current.send(JSON.stringify({ type: "message", roomKey: finalRoomKey, text, username, userId: resolvedUserId, profileImg, cartItems }));
  }, [finalRoomKey, profileImg, resolvedUserId, username]);

  const sendTyping = useCallback(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({ type: "typing", roomKey: finalRoomKey }));
  }, [finalRoomKey]);

  const reportUser = useCallback((payload) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({ type: "report-user", roomKey: finalRoomKey, ...payload }));
  }, [finalRoomKey]);

  return {
    messages,
    onlineUsers,
    typingUser,
    sendMessage,
    sendTyping,
    reportUser,
    connected
  };
}
