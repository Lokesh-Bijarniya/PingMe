import React, { useState } from "react";
import { Video, Mic, MicOff, PhoneOff, Users, Search, VideoOff, Expand } from "lucide-react";

const CallPage = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callActive, setCallActive] = useState(false);
  const [currentCall, setCurrentCall] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);

  const contacts = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com" },
    { id: 2, name: "Bob Smith", email: "bob@example.com" },
    { id: 3, name: "Charlie Adams", email: "charlie@example.com" },
  ];

  const startCall = (contact) => {
    setCurrentCall(contact);
    setCallActive(true);
  };

  const endCall = () => {
    setCallActive(false);
    setCurrentCall(null);
  };

  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      {/* Contacts List */}
      <div className="flex-grow overflow-y-auto bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Contacts</h2>
        <div className="relative mb-4">
          <input type="text" placeholder="Search contacts..." className="w-full px-4 py-2 border rounded-md" />
          <Search className="absolute right-3 top-3 text-gray-500 w-5 h-5" />
        </div>
        {contacts.map((contact) => (
          <div key={contact.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
            <div>
              <h3 className="text-md font-medium">{contact.name}</h3>
              <p className="text-sm text-gray-500">{contact.email}</p>
            </div>
            <button
              onClick={() => startCall(contact)}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Video className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Video Call Window */}
      {callActive && currentCall && (
        <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 ${fullscreen ? "z-50" : "z-40"}`}>
          <div className="relative bg-gray-900 w-full md:w-2/3 lg:w-1/2 h-3/4 rounded-lg overflow-hidden">
            <div className="absolute top-3 left-3 text-white text-lg font-medium">{currentCall.name}</div>
            {/* Video Placeholder */}
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              {isVideoOn ? (
                <p className="text-white text-xl">Video Streaming...</p>
              ) : (
                <p className="text-white text-xl">Video Off</p>
              )}
            </div>
            {/* Controls */}
            <div className="absolute bottom-5 w-full flex justify-center space-x-4">
              <button onClick={() => setIsMuted(!isMuted)} className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600">
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <button onClick={() => setIsVideoOn(!isVideoOn)} className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600">
                {isVideoOn ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </button>
              <button onClick={endCall} className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600">
                <PhoneOff className="w-6 h-6" />
              </button>
              <button onClick={() => setFullscreen(!fullscreen)} className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600">
                <Expand className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallPage;
