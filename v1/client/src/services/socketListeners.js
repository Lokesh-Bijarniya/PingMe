import SocketService from "./socket";
import { receiveCall, clearCallState } from "../redux/features/call/callSlice";
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

// ✅ Setup WebSocket Listeners
export const setupSocketListeners = (dispatch) => {
  SocketService.on("connect", () => {
    console.log("✅ WebSocket connected.");
    SocketService.emit("SETUP_USER");
  });

  // 📩 Handle New Messages
  SocketService.on("NEW_MESSAGE", (data) => {
    console.log("📩 New message received:", data);
    dispatch(newMessageReceived({ chatId: data.chatId, message: data.message }));
  });

  // ✍ Handle Typing Status
  SocketService.on("TYPING_STATUS", (data) => {
    dispatch(setTypingStatus(data));
  });

  // 🟢 Handle Online Status
  SocketService.on("ONLINE_STATUS", (data) => {
    dispatch(updateOnlineStatus(data));
  });

  // 📞 Incoming Calls + Play Ringtone
  SocketService.on("INCOMING_CALL", (data) => {
    console.log("📞 Incoming call:", data);
    dispatch(receiveCall(data));

    if (userInteracted) {
      ringtone.play().catch((err) => console.error("🔊 Ringtone error:", err));
    } else {
      console.warn("⚠️ Ringtone blocked due to lack of user interaction.");
    }
  });

  // ❌ Stop Ringtone on Call Rejection
  SocketService.on("CALL_REJECTED", () => {
    console.warn("❌ Call rejected.");
    ringtone.pause();
    ringtone.currentTime = 0;
    dispatch(clearCallState());
  });

  // 🚫 Stop Ringtone on Call Ended
  SocketService.on("CALL_ENDED", () => {
    console.warn("🚫 Call ended.");
    ringtone.pause();
    ringtone.currentTime = 0;
    dispatch(clearCallState());
  });

  // 🛑 Stop Ringtone on Call Acceptance
  SocketService.on("CALL_ACCEPTED", () => {
    console.log("✅ Call accepted.");
    ringtone.pause();
    ringtone.currentTime = 0;
  });

  console.log("✅ WebSocket listeners set up.");
};

// 🔄 Cleanup WebSocket Listeners
export const cleanupSocketListeners = () => {
  ["NEW_MESSAGE", "TYPING_STATUS", "ONLINE_STATUS", "INCOMING_CALL", "CALL_REJECTED", "CALL_ENDED", "CALL_ACCEPTED"].forEach((event) => {
    SocketService.off(event);
  });
  console.log("🛑 WebSocket listeners cleaned up.");
};
