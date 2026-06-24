import { useContext, useState } from "react";
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

  return (
    <div className="h-[calc(100vh-64px)] bg-gradient-to-br from-white via-purple-50/30 to-white overflow-hidden">
      <div className="flex items-center justify-between border-b border-purple-100 bg-white/90 px-4 py-3 md:hidden">
        <button onClick={() => setMenuOpen((v) => !v)} className="rounded-xl border border-purple-200 p-2 text-purple-700">
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <span className="text-sm font-semibold text-gray-700">Chat</span>
        <button onClick={() => setInfoOpen((v) => !v)} className="rounded-xl border border-purple-200 px-3 py-2 text-sm text-purple-700">
          Info
        </button>
      </div>

      <div className="h-full flex flex-col md:flex-row">
        <aside className={`${menuOpen ? "block" : "hidden"} w-full border-b border-purple-100 bg-white shadow-sm md:block md:w-[300px] md:shrink-0 md:border-b-0 md:border-r`}>
          <SidebarChats
            currentChat={currentChat}
            setCurrentChat={(chat) => {
              setCurrentChat(chat);
              setMenuOpen(false);
            }}
          />
        </aside>

        <main className="flex-1 min-w-0 flex justify-center">

          <div className="w-full max-w-5xl flex flex-col bg-white/40 backdrop-blur-sm">

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

        <aside className={`${infoOpen ? "block" : "hidden"} w-full border-t border-purple-100 bg-white shadow-sm md:block md:w-[340px] md:shrink-0 md:border-l md:border-t-0 xl:block`}>
          <ChatInfo users={onlineUsers} onReportUser={reportUser} />
        </aside>

      </div>
    </div>
  );
}