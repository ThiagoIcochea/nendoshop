import { useContext, useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import SidebarChats from "../components/chat/SidebarChats";
import ChatWindow from "../components/chat/ChatWindow";
import ChatInfo from "../components/chat/ChatInfo";
import { AuthContext } from "../context/AuthContext";
import useChatSocket from "../hooks/useChatSocket";

export default function ChatPage() {
  const [currentChat, setCurrentChat] = useState("community");
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const { auth } = useContext(AuthContext);

  const username = auth?.name || auth?.email || "Invitado";
  const userId = auth?._id || auth?.id || auth?.userId || null;

  const {
    messages,
    onlineUsers,
    typingUser,
    sendMessage,
    sendTyping,
    reportUser,
    connected
  } = useChatSocket(currentChat, username, userId, auth?.profileImg || "");

  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showLeftSidebar = windowWidth >= 768 || menuOpen;
  const showRightSidebar = windowWidth >= 1280 || infoOpen;

  return (
    <div className="h-[calc(100dvh-64px)] md:h-[calc(100vh-64px)] bg-gradient-to-br from-white via-purple-50/30 to-white overflow-hidden flex flex-col">
      <div className="flex items-center justify-between border-b border-purple-100 bg-white/90 px-4 py-3 md:hidden flex-shrink-0">
        <button onClick={() => { setMenuOpen((v) => !v); setInfoOpen(false); }} className="rounded-xl border border-purple-200 p-2 text-purple-700">
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <span className="text-sm font-semibold text-gray-700">Chat</span>
        <button onClick={() => { setInfoOpen((v) => !v); setMenuOpen(false); }} className="rounded-xl border border-purple-200 px-3 py-2 text-sm text-purple-700">
          {infoOpen ? "Cerrar Info" : "Info"}
        </button>
      </div>

      <div className="flex-grow flex h-full min-h-0 flex-col md:flex-row relative">
        {showLeftSidebar && (
          <aside className={`${windowWidth < 768 ? "absolute inset-y-0 left-0 w-full z-20" : "relative w-[300px] shrink-0"} border-r border-purple-100 bg-white shadow-sm h-full`}>
            <SidebarChats
              currentChat={currentChat}
              setCurrentChat={(chat) => {
                setCurrentChat(chat);
                setMenuOpen(false);
              }}
            />
          </aside>
        )}

        <main className="flex-grow flex-1 min-h-0 min-w-0 flex justify-center overflow-hidden">
          <div className="w-full max-w-5xl flex flex-col bg-white/40 backdrop-blur-sm min-h-0">
            <ChatWindow
              currentChat={currentChat}
              messages={messages}
              typingUser={typingUser}
              sendMessage={sendMessage}
              sendTyping={sendTyping}
              connected={connected}
              currentUser={auth}
              currentUserName={username}
            />
          </div>
        </main>

        {showRightSidebar && (
          <aside className={`${windowWidth < 1280 ? "absolute inset-y-0 right-0 w-full md:w-[340px] z-20" : "relative w-[340px] shrink-0"} border-l border-purple-100 bg-white shadow-sm h-full`}>
            <ChatInfo users={onlineUsers} currentUser={auth} onReportUser={reportUser} />
          </aside>
        )}
      </div>
    </div>
  );
}
