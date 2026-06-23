import { useState } from "react";
import SidebarChats from "../components/chat/SidebarChats";
import ChatWindow from "../components/chat/ChatWindow";
import ChatInfo from "../components/chat/ChatInfo";
//import useSocket from "../hooks/useSocket";
import useChatMock from "../hooks/useChatMock";

export default function ChatPage() {
  const [currentChat, setCurrentChat] = useState("community");

 const {
  messages,
  onlineUsers,
  typingUser,
  sendMessage,
  sendTyping,
} = useChatMock(currentChat);

  return (
    <div className="h-[calc(100vh-64px)] bg-gradient-to-br from-white via-purple-50/30 to-white overflow-hidden">

      <div className="h-full flex">

        <aside className="w-[300px] shrink-0 bg-white border-r border-purple-100 shadow-sm">
          <SidebarChats
            currentChat={currentChat}
            setCurrentChat={setCurrentChat}
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
            />

          </div>

        </main>

        <aside className="
          w-[340px]
          shrink-0
          bg-white
          border-l
          border-purple-100
          shadow-sm
          hidden
          xl:block
        ">
          <ChatInfo users={onlineUsers} />
        </aside>

      </div>
    </div>
  );
}