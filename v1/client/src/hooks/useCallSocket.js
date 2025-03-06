import { useEffect } from "react";
import { useDispatch } from "react-redux";
import SocketService from "../services/socket";
import { setIncomingCall, setCallStatus, addCallHistory } from "../redux/callSlice";

const useCallSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!SocketService.socket) return;

    // Handle incoming call
     SocketService.on("call:incoming", (callData) => {
      console.log("📞 Incoming call:", callData);
      dispatch(setIncomingCall({ ...callData, peerId: callData.callerId, roomId: callData.roomId }));
    });

    // Handle call accepted
    SocketService.on("call:accepted", (callData) => {
      console.log("✅ Call accepted:", callData);
      dispatch(setCallStatus("accepted"));
    });

    // Handle call rejected
    SocketService.on("call:rejected", (callData) => {
      console.log("❌ Call rejected:", callData);
      dispatch(setCallStatus("rejected"));
    });

    // Handle call ended
    SocketService.on("call:ended", (callData) => {
      console.log("🔴 Call ended:", callData);
      dispatch(setCallStatus("ended"));
      dispatch(addCallHistory(callData));
    });

    return () => {
      SocketService.off("call:incoming");
      SocketService.off("call:accepted");
      SocketService.off("call:rejected");
      SocketService.off("call:ended");
    };
  }, [dispatch]);

  return null;
};

export default useCallSocket;