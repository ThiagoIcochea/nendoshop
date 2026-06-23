import { useCallback, useEffect, useRef, useState } from "react";

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
const WS_URL = getWebSocketUrl();

const fetchRoomMessages = async (roomKey) => {
  const response = await fetch(`${BACKEND_URL}/api/chat/rooms/${roomKey}/messages?limit=200`, {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("No se pudieron cargar los mensajes");
  }
  return response.json();
};

export default function useChatSocket(roomKey, username, userId, profileImg = "") {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  const connectWebSocket = useCallback(() => {
    if (socketRef.current) return;

    const socket = new WebSocket(`${WS_URL}`);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      if (!isMountedRef.current) return;
      setConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (roomKey && username) {
        socket.send(JSON.stringify({ type: "join", roomKey, username, userId, profileImg }));
      }
    });

    socket.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(event.data);
        switch (payload.type) {
          case "joined":
            break;
          case "room-message":
            setMessages((prev) => [...prev, payload.message]);
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

    socket.addEventListener("close", () => {
      if (!isMountedRef.current) return;
      setConnected(false);
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connectWebSocket();
        }, 2500);
      }
    });

    socket.addEventListener("error", () => {
      setConnected(false);
    });
  }, [roomKey, username, userId]);

  useEffect(() => {
    isMountedRef.current = true;
    if (!roomKey || !username) return;

    let active = true;

    setMessages([]);
    fetchRoomMessages(roomKey)
      .then((data) => {
        if (!active) return;
        setMessages(data);
      })
      .catch((error) => {
        console.error(error);
      });

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      connectWebSocket();
    } else {
      socketRef.current.send(JSON.stringify({ type: "join", roomKey, username, userId, profileImg }));
    }

    return () => {
      active = false;
      isMountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setTypingUser("");
      setOnlineUsers([]);
    };
  }, [roomKey, username, userId, profileImg, connectWebSocket]);

  const sendMessage = useCallback((text) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn("Socket no conectado");
      return;
    }
    socketRef.current.send(JSON.stringify({ type: "message", roomKey, text, username, userId, profileImg }));
  }, [roomKey, username, userId, profileImg]);

  const sendTyping = useCallback(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({ type: "typing", roomKey }));
  }, [roomKey]);

  const reportUser = useCallback((payload) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({ type: "report-user", roomKey, ...payload }));
  }, [roomKey]);

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
