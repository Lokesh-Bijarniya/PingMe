import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ContactsList from "../components/calls/ContactList";
import CallWindow from "../components/calls/CallWindow";
import IncomingCallPopup from "../components/calls/IncomingCallPopup";
import SearchUsers from "../components/SearchUser";
import { fetchCallHistory, setCurrentCall, setIncomingCall, clearCallState } from "../redux/features/call/callSlice";
import { toast } from "react-toastify";
import SocketService from "../services/socket";

const CallPage = () => {
  const dispatch = useDispatch();
  const { callHistory, currentCall, incomingCall } = useSelector((state) => state.call);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    dispatch(fetchCallHistory());

    // Listen for incoming calls
    SocketService.on("call:incoming", (callData) => {
      console.log("📞 Incoming call:", callData);
      dispatch(setIncomingCall(callData));
    });

    return () => {
      SocketService.off("call:incoming");
    };
  }, [dispatch]);

  const startCall = async (user, type) => {
    try {
      // Emit the `call:start` event via WebSocket
      const response = await SocketService.emit("call:start", {
        receiverId: user._id,
        type,
      });

      if (response.success) {
        // Set the current call in Redux
        dispatch(
          setCurrentCall({
            callId: response.call._id,
            peerId: response.call.receiverId, // Peer ID is the recipient's socket ID
            type,
            isIncoming: false,
            name: user.name,
          })
        );
      } else {
        toast.error("Failed to start call: " + response.message);
      }
    } catch (error) {
      toast.error("Call failed: " + error.message);
    }
  };

  const handleAcceptCall = () => {
    if (!incomingCall) return;

    // Emit the `call:accept` event via WebSocket
    SocketService.emit("call:accept", { callId: incomingCall.callId });

    // Set the current call in Redux
    dispatch(
      setCurrentCall({
        callId: incomingCall.callId,
        peerId: incomingCall.peerId,
        type: incomingCall.type,
        isIncoming: true,
        name: incomingCall.name,
      })
    );
  };

  const handleRejectCall = () => {
    if (!incomingCall) return;

    // Emit the `call:reject` event via WebSocket
    SocketService.emit("call:reject", { callId: incomingCall.callId });

    // Clear the incoming call in Redux
    dispatch(clearCallState());
  };

  return (
    <div>
      {/* Incoming Call Popup */}
      {incomingCall && !currentCall && (
        <IncomingCallPopup
          caller={incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {/* New Call Button */}
      <button
        onClick={() => setShowSearch(!showSearch)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        {showSearch ? "Close Search" : "New Call"}
      </button>

      {/* Search Users Component */}
      {showSearch && <SearchUsers onCall={startCall} />}

      {/* Active Call Window */}
      {currentCall && <CallWindow currentCall={currentCall} />}

      {/* Recent Calls List */}
      <ContactsList callHistory={callHistory} onStartCall={startCall} />
    </div>
  );
};

export default CallPage;