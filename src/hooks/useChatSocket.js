import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";
const WS_PROTOCOL = BACKEND_URL.startsWith("https") ? "wss" : "ws";
const WS_URL = BACKEND_URL.replace(/^http/, WS_PROTOCOL);

const fetchRoomMessages = async (roomKey) => {
  const response = await fetch(`${BACKEND_URL}/api/chat/rooms/${roomKey}/messages?limit=200`, {
    credentials: "include"
  });
  if (!response.ok) {
    throw new Error("No se pudieron cargar los mensajes");
  }
  return response.json();
};

export default function useChatSocket(roomKey, username) {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState("");
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const connectWebSocket = useCallback(() => {
    if (socketRef.current) return;

    const socket = new WebSocket(`${WS_URL}`);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setConnected(true);
      if (roomKey) {
        socket.send(JSON.stringify({ type: "join", roomKey, username }));
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
          case "user-joined":
            setOnlineUsers((prev) => {
              if (prev.some((user) => user.username === payload.username)) return prev;
              return [...prev, { username: payload.username, avatar: "https://ui-avatars.com/api/?name=" + encodeURIComponent(payload.username), online: true }];
            });
            break;
          case "user-left":
            setOnlineUsers((prev) => prev.filter((user) => user.username !== payload.username));
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
      setConnected(false);
      socketRef.current = null;
    });

    socket.addEventListener("error", () => {
      setConnected(false);
    });
  }, [roomKey, username]);

  useEffect(() => {
    if (!roomKey || !username) return;

    let active = true;

    fetchRoomMessages(roomKey)
      .then((data) => {
        if (!active) return;
        setMessages(data);
      })
      .catch((error) => {
        console.error(error);
      });

    connectWebSocket();

    return () => {
      active = false;
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setTypingUser("");
    };
  }, [roomKey, username, connectWebSocket]);

  useEffect(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({ type: "join", roomKey, username }));
  }, [roomKey, username]);

  const sendMessage = useCallback((text) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.warn("Socket no conectado");
      return;
    }
    socketRef.current.send(JSON.stringify({ type: "message", roomKey, text }));
  }, [roomKey]);

  const sendTyping = useCallback(() => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({ type: "typing", roomKey }));
  }, [roomKey]);

  const defaultUsers = useMemo(() => [
    { id: 1, username: "Midoriya", online: true, avatar: "/avatars/midoriya.png" },
    { id: 2, username: "Luffy", online: true, avatar: "/avatars/luffy.png" }
  ], []);

  return {
    messages,
    onlineUsers: onlineUsers.length ? onlineUsers : defaultUsers,
    typingUser,
    sendMessage,
    sendTyping,
    connected
  };
}
