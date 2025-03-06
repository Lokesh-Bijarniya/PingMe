import React, { useEffect, useRef } from "react";
import Peer from "simple-peer";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { clearCallState } from "../../redux/features/call/callSlice";
import socket from "../../services/socket";

const CallWindow = ({ currentCall }) => {
  const dispatch = useDispatch();
  const [localStream, setLocalStream] = React.useState(null);
  const [remoteStream, setRemoteStream] = React.useState(null);
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOn, setIsVideoOn] = React.useState(true);
  const peerInstance = useRef(null);
  const userVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    console.log("📞 Checking currentCall:", currentCall);

    if (!currentCall || !currentCall.callId || !currentCall.peerId) {
      console.error("⚠️ Invalid call data, skipping initialization", currentCall);
      return;
    }

    let peer = null;

    const handleReceiveSignal = (data) => {
      console.log("📞 Received signal:", data);
      if (peer) {
        peer.signal(data.signal);
      } else {
        console.error("❌ Peer instance not initialized when receiving signal");
      }
    };

    const initializeCall = async () => {
      try {
        console.log("🚀 Initializing call with:", currentCall);

        // Get local media stream
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: currentCall.type === "video",
            audio: true,
          });

          if (!stream) {
            console.error("❌ Failed to obtain media stream");
            return;
          }

          console.log("🎥 Local stream obtained:", stream);
        } catch (mediaError) {
          console.error("❌ Media access error:", mediaError.message);
          return;
        }

        setLocalStream(stream);

        // Create Peer instance
        console.log("📞 Initiator check:", !currentCall.isIncoming);
        peer = new Peer({
          initiator: !currentCall.isIncoming,
          trickle: false,
          stream,
          config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
        });

        console.log("✅ Peer instance created:", peer);

        // Handle signaling
        peer.on("signal", (data) => {
          console.log("📞 Sending signal:", data);
          socket.emit("CALL_SIGNAL", {
            to: currentCall.peerId,
            signal: data,
            callId: currentCall.callId,
          });
        });

        peer.on("stream", (remoteStream) => {
          console.log("🎥 Remote stream received!");
          setRemoteStream(remoteStream);
        });

        if (currentCall?.signal) {
          console.log("📞 Handling initial signal:", currentCall.signal);
          peer.signal(currentCall.signal);
        }

        socket.off("RECEIVE_SIGNAL"); // Remove existing listeners
        socket.on("RECEIVE_SIGNAL", handleReceiveSignal);

        peerInstance.current = peer;
      } catch (error) {
        console.error("❌ Call initialization failed:", error.message);
        dispatch(clearCallState());
      }
    };

    initializeCall();

    return () => {
      socket.off("RECEIVE_SIGNAL", handleReceiveSignal);
      if (peer) {
        peer.destroy();
      }
      peerInstance.current = null;
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [currentCall, dispatch]);

  useEffect(() => {
    if (userVideoRef.current && localStream) {
      userVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleEndCall = () => {
    socket.emit("END_CALL", { callId: currentCall?.callId });
    dispatch(clearCallState());
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = !isVideoOn;
      setIsVideoOn(!isVideoOn);
    }
  };

  return (
    <div className="relative flex items-center justify-center h-screen w-full bg-gray-900">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-lg z-0"></div>

      {/* Video Call Section */}
      {currentCall?.type === "video" && (
        <div className="relative z-10 w-full max-w-4xl h-[75vh] rounded-lg overflow-hidden border border-gray-700 shadow-lg">
          {/* Remote Video */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-lg"
          />

          {/* Local Video (Floating) */}
          <div className="absolute bottom-4 right-4 w-40 h-28 border-2 border-white rounded-lg overflow-hidden shadow-lg">
            <video
              ref={userVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Audio Call UI */}
      {currentCall?.type === "audio" && (
        <div className="z-10 flex flex-col items-center text-white">
          <div className="text-2xl font-semibold">Calling...</div>
          <div className="text-xl opacity-80">{currentCall.name || "Unknown Caller"}</div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-8 flex gap-6 z-20">
        <button
          onClick={toggleMute}
          className="p-4 bg-red-600 text-white rounded-full shadow-md transition-transform transform hover:scale-110"
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        {currentCall?.type === "video" && (
          <button
            onClick={toggleVideo}
            className="p-4 bg-blue-500 text-white rounded-full shadow-md transition-transform transform hover:scale-110"
          >
            {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
          </button>
        )}

        <button
          onClick={handleEndCall}
          className="p-4 bg-gray-700 text-white rounded-full shadow-md transition-transform transform hover:scale-110"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
};

export default CallWindow;