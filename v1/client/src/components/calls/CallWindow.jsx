import React, { useState, useEffect, useRef } from "react";
import Peer from "simple-peer";
import { Mic, MicOff, PhoneOff, Video, VideoOff, Maximize2, Minimize2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { clearCallState } from "../../redux/features/call/callSlice";
import socket from '../../services/socket';
import { toast } from "react-toastify";

const CallWindow = ({
  currentCall,
  isMuted,
  isVideoOn,
  isSpeakerMuted,
  fullscreen,
  setIsMuted,
  setIsVideoOn,
  setIsSpeakerMuted,
  setFullscreen,
}) => {
  const dispatch = useDispatch();
  const [callDuration, setCallDuration] = useState(0);
  const [stream, setStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [isLoadingStream, setIsLoadingStream] = useState(true);
  
  const userVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const hasInitializedMedia = useRef(false);

  console.log("curr-call:", currentCall); // Improved logging for debugging

  if (!currentCall || typeof currentCall !== "object") {
    return <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75"><div className="text-white text-xl">No active call</div></div>;
  }

  useEffect(() => {
    const timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cleanup = () => {};
  
    const setupMediaAndPeer = async () => {
      if (!currentCall || hasInitializedMedia.current) return;
      hasInitializedMedia.current = true;
      setIsLoadingStream(true);
  
      // Wait for a valid peerId (poll or use state)
      const checkPeerId = () => {
        return new Promise((resolve) => {
          const interval = setInterval(() => {
            if (currentCall.peerId && typeof currentCall.peerId === "string") {
              clearInterval(interval);
              resolve(currentCall.peerId);
            }
          }, 100); // Check every 100ms for up to 5 seconds
          setTimeout(() => {
            clearInterval(interval);
            resolve(null); // Timeout if peerId not found
          }, 5000);
        });
      };
  
      try {
        console.log("🔍 Setting up media with currentCall:", currentCall);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: currentCall.type === "video",
          audio: true,
        });
        console.log("✅ Media stream acquired:", mediaStream);
        setStream(mediaStream);
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = mediaStream;
          userVideoRef.current.play().catch(err => console.error("❌ Video play error:", err));
          console.log("🎥 Stream assigned and played in userVideoRef");
        }
  
        const peerId = await checkPeerId();
        if (!peerId) {
          console.error("❌ Peer ID not received within timeout:", currentCall);
          toast.error("Call cannot proceed. Peer ID not available.");
          return;
        }
  
        console.log("🔗 Setting up WebRTC with stream and peerId:", peerId);
        const newPeer = new Peer({
          initiator: !currentCall.isIncoming,
          trickle: false,
          stream: mediaStream,
        });
  
        newPeer.on("signal", (data) => {
          console.log("📤 Sending signal to peer:", peerId, "Signal:", data);
          socket.emit("CALL_SIGNAL", { to: peerId, signal: data });
        });
  
        newPeer.on("stream", (remoteStream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(err => console.error("❌ Remote video play error:", err));
            console.log("📡 Remote stream received, assigned, and played");
          }
        });
  
        newPeer.on("error", (err) => {
          console.error("❌ Peer connection error:", err);
          toast.error("WebRTC connection failed. Check network or peer availability.");
        });
  
        newPeer.on("connect", () => {
          console.log("✅ Peer connection established");
        });
  
        socket.on("RECEIVE_SIGNAL", ({ signal }) => {
          console.log("📩 Received signal from peer:", signal);
          newPeer.signal(signal);
        });
  
        setPeer(newPeer);
  
        cleanup = () => {
          socket.off("RECEIVE_SIGNAL");
          newPeer.destroy();
          console.log("🛑 Peer destroyed");
        };
      } catch (error) {
        console.error("❌ Error in media or WebRTC setup:", error);
        toast.error("Failed to setup call. Check camera/microphone permissions or network.");
      } finally {
        setIsLoadingStream(false);
      }
    };
  
    setupMediaAndPeer();
  
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        console.log("🛑 Stream tracks stopped");
      }
      cleanup();
    };
  }, [currentCall]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  const handleEndCall = () => {
    socket.emit("END_CALL", { callId: currentCall.callId });
    stream?.getTracks().forEach(track => track.stop());
    dispatch(clearCallState());
  };

  const toggleMute = () => {
    stream?.getAudioTracks().forEach(track => track.enabled = !isMuted);
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    stream?.getVideoTracks().forEach(track => track.enabled = !isVideoOn);
    setIsVideoOn(!isVideoOn);
  };

  if (isLoadingStream) {
    return <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75"><div className="text-white text-xl font-semibold">Connecting...</div></div>;
  }

  return (
    <div className={`fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 ${fullscreen ? "p-0" : "p-4"}`}>
      <div className={`relative bg-gray-800 rounded-2xl shadow-2xl overflow-hidden ${fullscreen ? "w-full h-full" : "w-[90%] max-w-4xl h-[40rem]"}`}>
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-gray-900 to-gray-800 p-4 flex justify-between items-center z-10">
          <div className="text-white font-semibold">{currentCall.name} • <span className="text-gray-300">{formatDuration(callDuration)}</span></div>
          <button onClick={() => setFullscreen(!fullscreen)} className="text-white hover:text-gray-300">{fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}</button>
        </div>
        <div className="relative w-full h-full flex">
          {currentCall.type === "video" && (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                onError={(e) => console.error("❌ Remote video error:", e)}
                className="w-full h-full object-cover bg-black"
              />
              <video
                ref={userVideoRef}
                autoPlay
                playsInline
                muted
                onError={(e) => console.error("❌ Local video error:", e)}
                className="absolute bottom-8 right-8 w-32 h-24 rounded-lg border-2 border-white shadow-lg object-cover bg-black"
              />
            </>
          )}
          {currentCall.type !== "video" && (
            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-semibold">Audio Call with {currentCall.name}</div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 p-6 flex justify-center space-x-6">
          <button onClick={toggleMute} className={`p-3 rounded-full ${isMuted ? "bg-red-500" : "bg-gray-700"} hover:bg-gray-600 text-white`} title={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          {currentCall.type === "video" && (
            <button onClick={toggleVideo} className={`p-3 rounded-full ${!isVideoOn ? "bg-red-500" : "bg-gray-700"} hover:bg-gray-600 text-white`} title={isVideoOn ? "Turn off video" : "Turn on video"}>
              {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
            </button>
          )}
          <button onClick={handleEndCall} className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white" title="End Call">
            <PhoneOff size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallWindow;