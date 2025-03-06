import SocketService from "./socket.js";
// import { receiveCall, clearCallState, setCurrentCall } from "../redux/features/call/callSlice";
import { newMessageReceived, setTypingStatus, updateOnlineStatus } from "../redux/features/chat/chatSlice";

// ✅ Ensure Correct Ringtone Path
const ringtone = new Audio("/sounds/ringtone.mp3");
ringtone.loop = true;

// ✅ Ensure User Interaction for Audio Playback
let userInteracted = false;
const enableAudio = () => {
  userInteracted = true;
  document.removeEventListener("click", enableAudio);
  document.removeEventListener("keypress", enableAudio);
};

document.addEventListener("click", enableAudio);
document.addEventListener("keypress", enableAudio);

// Centralized ringtone playback
const playRingtone = () => {
  if (userInteracted) {
    ringtone.play().catch((err) => console.error("🔊 Ringtone error:", err));
  } else {
    console.warn("⚠️ Ringtone blocked due to lack of user interaction.");
  }
};

// ✅ Setup WebSocket Listeners
export const setupSocketListeners = (dispatch) => {

  SocketService.on("connect", () => {
    console.log("✅ WebSocket connected.");
    SocketService.emit("SETUP_USER");
  });


   // 📩 Handle New Messages (Including Files)
   SocketService.on("NEW_MESSAGE", (data) => {
    console.log("📩 Received NEW_MESSAGE:", data);

    if (!data || !data.chatId || !data.message) {
      console.error("❌ Invalid NEW_MESSAGE data received:", data);
      return;
    }

    const message = data.message;
    const isFileMessage = !!message.attachment; // ✅ Check if it's a file

    dispatch(
      newMessageReceived({
        chatId: data.chatId,
        message: {
          messageId: message.messageId,
          content: isFileMessage ? "" : message.content, // ✅ Remove "📎 Attachment"
          sender: message.sender,
          timestamp: message.timestamp,
          attachment: message.attachment || null, // ✅ Ensure correct file URL is stored
          fileType: message.fileType || null,
          fileName: message.fileName || null,
        },
      })
    );
  });

  
  
  
  
  
  

  // ✍ Handle Typing Status
  SocketService.on("TYPING_STATUS", (data) => {
    dispatch(setTypingStatus(data));
  });

  // 🟢 Handle Online Status
  SocketService.on("ONLINE_STATUS", (data) => {
    console.log(`🟢 User ${data.userId} is now ${data.isOnline ? "online" : "offline"}`);
    dispatch(updateOnlineStatus(data));
  });

  // 📞 Incoming Calls + Play Ringtone
  // SocketService.on("INCOMING_CALL", (data) => {
  //   if (!data || !data.callId || !data.recipientId) {
  //     console.error("Invalid INCOMING_CALL data:", data);
  //     return;
  //   }

  //   console.log("📞 Incoming call:", data);
  //   dispatch(receiveCall(data));
  //   playRingtone();
  // });

  // // ❌ Stop Ringtone on Call Rejection
  // SocketService.on("CALL_REJECTED", () => {
  //   console.warn("❌ Call rejected.");
  //   ringtone.pause();
  //   ringtone.currentTime = 0;
  //   dispatch(clearCallState());
  // });

  // // 🚫 Stop Ringtone on Call Ended
  // SocketService.on("CALL_ENDED", () => {
  //   console.warn("🚫 Call ended.");
  //   ringtone.pause();
  //   ringtone.currentTime = 0;
  //   dispatch(clearCallState());
  // });

  // // 🛑 Stop Ringtone on Call Acceptance
  // SocketService.on("CALL_ACCEPTED", (data) => {
  //   if (!data || !data.callId) {
  //     console.error("Invalid CALL_ACCEPTED data:", data);
  //     return;
  //   }

  //   console.log("📞 Call Accepted Data:", data);

  //   const acceptedCall = {
  //     callId: data.callId,
  //     recipientId: data.recipientId || "UNKNOWN_RECIPIENT",
  //     type: data.type,
  //     status: "accepted",
  //     peerId: data.peerId || SocketService.socket?.id || "UNKNOWN_PEER_ID",
  //     callerSocketId: data.callerSocketId || "UNKNOWN_CALLER",
  //     isIncoming: false,
  //     name: data.name || "Unknown",
  //   };

  //   dispatch(setCurrentCall(acceptedCall));

  //   ringtone.pause();
  //   ringtone.currentTime = 0;
  // });
};

// 🔄 Cleanup WebSocket Listeners
export const cleanupSocketListeners = () => {
  if (SocketService.connected) {
    const events = ["NEW_MESSAGE", "TYPING_STATUS", "ONLINE_STATUS", "INCOMING_CALL", "CALL_REJECTED", "CALL_ENDED", "CALL_ACCEPTED"];
    events.forEach((event) => {
      if (SocketService.hasListeners(event)) { // Hypothetical method to check listeners
        SocketService.off(event);
      }
    });
    console.log("🛑 WebSocket listeners cleaned up.");
  } else {
    console.warn("⚠️ WebSocket not connected. Skipping listener cleanup.");
  }
};