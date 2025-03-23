import SocketService from "./socket";
import { 
  newCommunityMessage, updateCommunityPresence, 
  communityUpdated, communityDeleted, receiveCommunityInvite 
} from "../redux/features/chat/communitySlice";




const communitySocket = {
  setupListeners: (dispatch) => {
    // Remove existing listeners to avoid duplicates
    communitySocket.cleanupListeners();

    // ✅ Listen for new community messages
    SocketService.communitySocket?.on("NEW_COMMUNITY_MESSAGE", (data) => {
      console.log("🌍 New community message:", data);
      dispatch(newCommunityMessage({ communityId: data.communityId, message: data.message }));
    });

    // ✅ Listen for member presence updates
    SocketService.communitySocket?.on("MEMBER_PRESENCE", (data) => {
      console.log(`🟢 Community member ${data.userId} is ${data.online ? "online" : "offline"}`);
      dispatch(updateCommunityPresence(data));
    });

    // ✅ Listen for community updates
    SocketService.communitySocket?.on("COMMUNITY_UPDATED", (community) => {
      console.log("🔄 Community updated:", community._id);
      dispatch(communityUpdated(community));
    });

    // ✅ Listen for community deletion
    SocketService.communitySocket?.on("COMMUNITY_DELETED", (communityId) => {
      console.log("❌ Community deleted:", communityId);
      dispatch(communityDeleted(communityId));
    });

    // ✅ Listen for community invites
    SocketService.communitySocket?.on("COMMUNITY_INVITE", (invite) => {
      console.log("📨 Received community invite:", invite);
      dispatch(receiveCommunityInvite(invite));
    });
  },

  cleanupListeners: () => {
    const events = [
      "NEW_COMMUNITY_MESSAGE", "MEMBER_PRESENCE", "COMMUNITY_UPDATED", 
      "COMMUNITY_DELETED", "COMMUNITY_INVITE"
    ];
    events.forEach((event) => {
      SocketService.communitySocket?.off(event);
    });
    console.log("🛑 Community WebSocket listeners cleaned up.");
  },


  joinCommunityRoom: (communityId) => {
    SocketService.communitySocket?.emit("JOIN_COMMUNITY_ROOM", communityId);
    console.log(`✅ Joined community room: ${communityId}`);
  },

  leaveCommunityRoom: (communityId) => {
    SocketService.communitySocket?.emit("LEAVE_COMMUNITY_ROOM", communityId);
    console.log(`🚪 Left community room: ${communityId}`);
  },

  sendMessage: (messageData) => {
    SocketService.communitySocket?.emit("SEND_COMMUNITY_MESSAGE", messageData);
    console.log("📩 Message sent:", messageData);
  }
};



export default communitySocket;
