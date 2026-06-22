export default function useSocket() {

  return {
    messages: [],
    onlineUsers: [],
    typingUser: "",
    sendMessage: () => {},
    sendTyping: () => {}
  };

}