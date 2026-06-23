import { useState } from "react";

export default function useChatMock(currentChat) {

  const [typingUser, setTypingUser] = useState("");

  const [onlineUsers] = useState([
    {
      id: 1,
      username: "Midoriya",
      online: true,
      avatar: "/avatars/midoriya.png"
    },
    {
      id: 2,
      username: "Luffy",
      online: true,
      avatar: "/avatars/luffy.png"
    }
  ]);

  const [allMessages, setAllMessages] = useState({
    community: [
      {
        id: 1,
        user: "Midoriya",
        text: "¡Hola! Bienvenido 👋",
        time: "11:20"
      }
    ],
    support: []
  });

  const messages = allMessages[currentChat];

  const sendMessage = (text, user) => {

    const msg = {
      id: Date.now(),
      user,
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setAllMessages(prev => ({
      ...prev,
      [currentChat]: [...prev[currentChat], msg]
    }));

  };

  const sendTyping = (user) => {

    setTypingUser(user);

    setTimeout(() => {
      setTypingUser("");
    }, 1500);

  };

  return {
    messages,
    onlineUsers,
    typingUser,
    sendMessage,
    sendTyping
  };

}