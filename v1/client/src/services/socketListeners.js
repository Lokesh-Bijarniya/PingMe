import SocketService from "./socket.js";
import { 
  newMessageReceived, 
  setTypingStatus, 
  updateOnlineStatus 
} from "../redux/features/chat/chatSlice";

import { 
  newCommunityMessage,
  updateCommunityPresence,
  communityUpdated,
  communityDeleted,
  receiveCommunityInvite
} from "../redux/features/chat/communitySlice";



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

// ✅ Setup WebSocket Listeners (Updated for Communities)
export const setupSocketListeners = (dispatch) => {


  // Remove previous listeners to avoid duplicates
  cleanupSocketListeners(); 
  

  SocketService.on("connect", () => {
    console.log("✅ WebSocket connected.");
    SocketService.emit("SETUP_USER");
  });

  // Unified message handler
  const handleNewMessage = (data) => {
    console.log("📩 Received NEW_MESSAGE:", data);
  
    // Validate the incoming message data
    if (!data || !data.chat || !data.message || !data.chat._id || !data.message._id) {
      console.error("❌ Invalid message data:", data);
      return;
    }
  
    const isCommunity = data.chat?.chatType === "community" || data.message.isSystemMessage;
    const messageData = {
      messageId: data.message._id,
      chatId: data.chat._id,
      content: data.message.content,
      sender: {
        id: data.message.sender?._id || null,
        name: data.message.sender?.name || "System",
        avatar: data.message.sender?.avatar || "",
      },
      timestamp: data.message.timestamp,
      isSystem: data.message.isSystemMessage || false,
      status: data.message.status,
      readBy: data.message.readBy || [],
      isPinned: data.message.isPinned || false,
    };
  

    let unreadCount = {};
    if (data.chat.unreadCount instanceof Map) {
      unreadCount = Object.fromEntries(data.chat.unreadCount);
    } else if (typeof data.chat.unreadCount === "object") {
      unreadCount = data.chat.unreadCount;
    }
  
    if (isCommunity) {
      dispatch(newCommunityMessage({
        communityId: data.communityId,
        message: messageData,
        unreadCount,
      }));
    } else {
      dispatch(newMessageReceived({
        chatId: data.chat._id,
        message: messageData,
        unreadCount,
      }));
    }
  };
 
  // Community-specific listeners
  SocketService.on("NEW_COMMUNITY_MESSAGE", handleNewMessage);

  SocketService.on("NEW_MESSAGE", handleNewMessage);


  SocketService.on("MEMBER_LEFT", (data) => {
    dispatch(communityActions.updateMembers(data));
  });
  
  SocketService.on("YOU_LEFT_COMMUNITY", (data) => {
    dispatch(communityActions.removeFromJoined(data.communityId));
  });


  SocketService.on("MEMBER_PRESENCE", (data) => {
    console.log(`🟢 Community member ${data.userId} ${data.online ? "online" : "offline"}`);
    dispatch(updateCommunityPresence(data));
  });

  SocketService.on("COMMUNITY_UPDATED", (community) => {
    console.log("🔄 Community updated:", community._id);
    dispatch(communityUpdated(community));
  });

  SocketService.on("COMMUNITY_DELETED", (communityId) => {
    console.log("❌ Community deleted:", communityId);
    dispatch(communityDeleted(communityId));
  });

  SocketService.on("COMMUNITY_INVITE", (invite) => {
    console.log("📨 Received community invite:", invite);
    dispatch(receiveCommunityInvite(invite));
  });

  // Keep existing listeners
  SocketService.on("TYPING_STATUS", (data) => {
    dispatch(setTypingStatus(data));
  });

  SocketService.on("ONLINE_STATUS", (data) => {
    console.log(`🟢 User ${data.userId} is ${data.isOnline ? "online" : "offline"}`);
    dispatch(updateOnlineStatus(data));
  });

  // ... keep existing call handlers ...



  
  
  

  // ✍ Handle Typing Status
  SocketService.on("TYPING_STATUS", (data) => {
    dispatch(setTypingStatus(data));
  });

  // 🟢 Handle Online Status
  SocketService.on("ONLINE_STATUS", (data) => {
    console.log(`🟢 User ${data.userId} is now ${data.isOnline ? "online" : "offline"}`);
    dispatch(updateOnlineStatus(data));
  });


};


  // SocketService.onAny((event, data) => {
  //   console.log(`📢 Event: ${event}`, data);
  // });

  

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
// };

// 🔄 Cleanup WebSocket Listeners
export const cleanupSocketListeners = () => {
  if (SocketService.connected) {
    const events = [
      "NEW_MESSAGE", "NEW_COMMUNITY_MESSAGE", "TYPING_STATUS", 
      "ONLINE_STATUS", "MEMBER_PRESENCE", "COMMUNITY_UPDATED",
      "COMMUNITY_DELETED", "COMMUNITY_INVITE", "INCOMING_CALL",
      "CALL_REJECTED", "CALL_ENDED", "CALL_ACCEPTED"
    ];

    events.forEach((event) => {
      if (SocketService.hasListeners(event)) {
        SocketService.off(event);
      }
    });
    console.log("🛑 All WebSocket listeners cleaned up.");
  } else {
    console.warn("⚠️ WebSocket not connected. Skipping cleanup.");
  }
};