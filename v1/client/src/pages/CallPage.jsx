import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import ContactsList from "../components/calls/ContactList";
import CallWindow from "../components/calls/CallWindow";
import IncomingCallPopup from "../components/calls/IncomingCallPopup";
import SearchUsers from "../components/SearchUser";
import { fetchCallHistory, setCurrentCall, sendCallRequest, clearCallState } from "../redux/features/call/callSlice";
import { toast } from "react-toastify";
import ringtone from "../../public/sounds/ringtone.mp3";
import socket from '../services/socket';
;

const CallPage = () => {
  const dispatch = useDispatch();
  const { callHistory, currentCall, incomingCall } = useSelector((state) => state.call);
  const [showSearch, setShowSearch] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [callType, setCallType] = useState("video");

  // Call states
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [isVideoSwapped, setIsVideoSwapped] = useState(false);

  const ringtoneRef = useRef(null);


  console.log("curr-call-ll",currentCall);

  useEffect(() => {
    dispatch(fetchCallHistory());

    if (!ringtoneRef.current) {
      ringtoneRef.current = new Audio(ringtone);
      ringtoneRef.current.loop = true;
    }

    // Socket event listeners
    const handleIncomingCall = (data) => {
      dispatch({ type: "call/receiveCall", payload: data });
      if (isAudioEnabled) ringtoneRef.current?.play().catch(console.error);
    };

    const handleCallAccepted = (data) => {
      dispatch({ type: "call/setCurrentCall", payload: data });
      ringtoneRef.current?.pause();
    };

    const handleCallRejected = () => {
      console.log("📵 Call was rejected");
      dispatch(clearCallState()); // ✅ Remove incoming call notification
      ringtoneRef.current?.pause();
  };
  

    const handleCallEnded = () => {
      dispatch({ type: "call/clearCallState" });
      ringtoneRef.current?.pause();
    };

    socket.on("INCOMING_CALL", handleIncomingCall);
    socket.on("CALL_ACCEPTED", handleCallAccepted);
    socket.on("CALL_REJECTED", handleCallRejected);
    socket.on("CALL_ENDED", handleCallEnded);

    return () => {
      socket.off("INCOMING_CALL", handleIncomingCall);
      socket.off("CALL_ACCEPTED", handleCallAccepted);
      socket.off("CALL_REJECTED", handleCallRejected);
      socket.off("CALL_ENDED", handleCallEnded);
    };
  }, [dispatch, isAudioEnabled]);


  useEffect(() => {
    const handleIncomingCall = (data) => {
      console.log("📞 Incoming Call Data:", data); // ✅ Debugging line
      dispatch({ type: "call/receiveCall", payload: data });
  
      if (isAudioEnabled) {
        ringtoneRef.current?.play().catch(err => console.error("🔊 Ringtone error:", err));
      }
    };
  
    socket.on("INCOMING_CALL", handleIncomingCall);
  
    return () => {
      socket.off("INCOMING_CALL", handleIncomingCall);
    };
  }, [dispatch, isAudioEnabled]);
  


  useEffect(() => {
    const handleCallConnected = (data) => {
      dispatch(setCurrentCall(prev => ({
        ...prev,
        peerId: data.peerId
      })));
    };
  
    socket.on("CALL_CONNECTED", handleCallConnected);
    return () => socket.off("CALL_CONNECTED", handleCallConnected);
  }, [dispatch]);

  useEffect(() => {
    if (currentCall?.type) setCallType(currentCall.type);
  }, [currentCall]);

  useEffect(() => {
    if (!incomingCall) ringtoneRef.current?.pause();
  }, [incomingCall]);

  // const handleEnableAudio = () => {
  //   setIsAudioEnabled(true);
  //   if (ringtoneRef.current) ringtoneRef.current.muted = false;
  // };

  useEffect(() => {
    dispatch(fetchCallHistory()).then((res) => {
      console.log("📜 Updated Call History:", res.payload);
    });
  }, [dispatch]);
  

  const startCall = async (user, type) => {
    try {
      await requestMediaPermissions();
      const result = await dispatch(sendCallRequest({ recipientId: user._id, type })).unwrap();
      if (!result.call) throw new Error("Missing call data in response");
      console.log("📞 Call Started Successfully:", result);
  
      // Ensure peerId is present, fallback to socket.id if missing
      const peerId = result.call.peerId || socket.id;
      if (!peerId) throw new Error("Peer ID missing in call response");
  
      dispatch(setCurrentCall({
        callId: result.call._id,
        recipientId: result.call.recipientId,
        type: result.call.type,
        status: result.call.status,
        peerId: peerId,
        isIncoming: false,
        callerSocketId: result.call.callerSocketId,
        name: user.name || "Unknown",
      }));
    } catch (error) {
      console.error("🚨 Call request failed:", error);
      toast.error("Call failed. Please try again.");
      dispatch(clearCallState());
    }
  };
  
  const handleAcceptCall = async () => {
    if (!incomingCall) return;
    await requestMediaPermissions();
    
    // Ensure peerId is set correctly for the recipient
    const peerId = socket.id; // Use recipient's socket.id as peerId
    if (!peerId) throw new Error("Recipient peer ID missing");
  
    dispatch(setCurrentCall({
      callId: incomingCall.callId,
      recipientId: incomingCall.recipientId,
      type: incomingCall.type,
      status: "accepted",
      peerId: peerId,
      isIncoming: false,
      callerSocketId: incomingCall.callerSocketId,
      name: incomingCall.name || "Unknown",
    }));
  
    socket.emit("ACCEPT_CALL", {
      callId: incomingCall.callId,
      callerSocketId: incomingCall.callerSocketId,
      recipientSocketId: peerId,
    });
  };



  const handleRejectCall = () => {
    if (!incomingCall) return;

    socket.emit("REJECT_CALL", {
      callId: incomingCall.callId,
      callerSocketId: incomingCall.callerSocketId
    });

    dispatch(clearCallState());  // ✅ Correctly reset call state
    console.log("Call is rejected");
};


  const handleEndCall = () => {
    if (!currentCall?.callId) return;
    socket.emit("END_CALL", { callId: currentCall.callId });

    // Re-fetch call history
  dispatch(fetchCallHistory());
  };

  // Request permissions handler
const requestMediaPermissions = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setIsAudioEnabled(true);
  } catch (error) {
    console.error("Permission denied:", error);
  }
};

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-y-auto">
      <div className="fixed bottom-6 right-6 flex gap-4">
      {!isAudioEnabled && (
        <button 
          onClick={requestMediaPermissions}
          className="bg-blue-500 text-white p-3 rounded-lg shadow-lg"
        >
          Enable Camera/Microphone
        </button>
      )}
    </div>

      {incomingCall && !currentCall && (
        <IncomingCallPopup
          caller={incomingCall}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      <div className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-semibold">Recent Calls</h1>
        <button 
          onClick={() => setShowSearch(!showSearch)} 
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {showSearch ? "Close Search" : "New Call"}
        </button>
      </div>

      <div className="flex-1 flex">
        <div className={`${showSearch ? "w-2/3" : "w-full"} p-4`}>
          <ContactsList callHistory={callHistory} onStartCall={startCall} />
        </div>
        {showSearch && (
          <div className="w-1/2 border-r bg-white p-4">
            <SearchUsers onCall={startCall} />
          </div>
        )}
      </div>

      {currentCall && (
        <CallWindow
          currentCall={currentCall}
          isMuted={isMuted}
          isVideoOn={isVideoOn}
          isSpeakerMuted={isSpeakerMuted}
          fullscreen={fullscreen}
          setIsMuted={setIsMuted}
          setIsVideoOn={setIsVideoOn}
          setIsSpeakerMuted={setIsSpeakerMuted}
          setFullscreen={setFullscreen}
          isVideoSwapped={isVideoSwapped}
          setIsVideoSwapped={setIsVideoSwapped}
          endCall={handleEndCall}
        />
      )}
    </div>
  );
};

export default CallPage;