import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";
import axios from "axios";

const socket = io("http://localhost:8000"); // Update with your backend URL

const CallComponent = () => {
  const [peerId, setPeerId] = useState("");
  const [remotePeerId, setRemotePeerId] = useState("");
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const peerRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const userVideoRef = useRef(null);

  useEffect(() => {
    if (peerId) {
      socket.emit("join", { userId: localStorage.getItem("userId"), peerId });
    }
  }, [peerId]);
  

  useEffect(() => {
    const peer = new Peer();

    peer.on("open", (id) => {
      setPeerId(id);
      socket.emit("join", id);
    });

    peer.on("call", (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
        setStream(mediaStream);
        call.answer(mediaStream);
        call.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });
      });
    });

    peerRef.current = peer;

    return () => {
      peer.disconnect();
    };
  }, []);

  const callUser = (id) => {
    if (!id) {
      console.error("❌ Peer ID is missing!");
      return;
    }
  
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((mediaStream) => {
      setStream(mediaStream);
      userVideoRef.current.srcObject = mediaStream;
  
      console.log(`📞 Calling Peer ID: ${id}`);
      
      const call = peerRef.current.call(id, mediaStream);
      call.on("stream", (remoteStream) => {
        setRemoteStream(remoteStream);
        remoteVideoRef.current.srcObject = remoteStream;
      });
    });
  };
  

  const fetchUsers = async () => {
    try {
      if (!search) return;
      const { data } = await axios.get(`http://localhost:8000/v1/api/auth/search?query=${search}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, // Adjust as per auth method
      });
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h2 className="text-2xl font-bold mb-4">Real-Time Video Call</h2>

      <div className="flex space-x-4">
        <video ref={userVideoRef} autoPlay muted className="w-48 h-48 bg-black rounded-lg border border-gray-700" />
        <video ref={remoteVideoRef} autoPlay className="w-48 h-48 bg-black rounded-lg border border-gray-700" />
      </div>

      <div className="mt-4">
        <p className="text-lg">
          Your ID: <span className="font-mono bg-gray-700 px-2 py-1 rounded">{peerId}</span>
        </p>
        <input
          type="text"
          placeholder="Search user by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-2 p-2 text-black rounded w-full"
        />
        <button onClick={fetchUsers} className="bg-green-500 hover:bg-green-700 text-white px-4 py-2 rounded mt-2">
          Search
        </button>

        <ul className="mt-2 w-full">
          {users.map((user) => (
            <li
              key={user._id}
              className="cursor-pointer bg-gray-800 p-2 mt-1 rounded flex justify-between items-center"
              onClick={() => setRemotePeerId(user.peerId)}
            >
              <div className="flex items-center space-x-2">
                <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                <p>{user.name} ({user.email})</p>
              </div>
              <button
                onClick={() => callUser(user.peerId)}
                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-1 rounded"
              >
                Call
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CallComponent;
