import SocketService from "./socket";
import { newMessageReceived, setTypingStatus, updateOnlineStatus } from "../redux/features/chat/chatSlice";

const chatSocket = {
  setupListeners: (dispatch) => {
    // Remove existing listeners to avoid duplicates
    chatSocket.cleanupListeners();

    // ✅ Listen for new chat messages
    SocketService.chatSocket?.on("NEW_MESSAGE", (data) => {
      console.log("📩 New private message received:", data);
    
      if (!data?.chatId || !data?.messageId) {
        console.error("❌ Invalid NEW_MESSAGE data:", data);
        return;
      }
    
      dispatch(
        newMessageReceived({
          chatId: data.chatId,  // Fix typo (was `chaId`)
          message: {
            id: data.messageId,
            content: data.content,
            sender: data.sender,
            timestamp: data.timestamp,
          },
        })
      );
    });
    

    // ✅ Listen for typing status
    SocketService.chatSocket?.on("TYPING_STATUS", (data) => {
      dispatch(setTypingStatus(data));
    });

    // ✅ Listen for online/offline status
    SocketService.chatSocket?.on("ONLINE_STATUS", (data) => {
      console.log("ONLINE",data);
      console.log(`🟢 User ${data.userId} is ${data.isOnline ? "online" : "offline"}`);
      dispatch(updateOnlineStatus(data));
    });
  },




  cleanupListeners: () => {
    const events = ["NEW_MESSAGE", "TYPING_STATUS", "ONLINE_STATUS", "MESSAGES_READ"];
    events.forEach((event) => {
      SocketService.chatSocket?.off(event);
    });
    console.log("🛑 Chat WebSocket listeners cleaned up.");
  }
};

export default chatSocket;
