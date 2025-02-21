import React from "react";
import { Phone, Video, MoreVertical } from "lucide-react";

const ChatWindowNavbar = () => {
  return (
    <div className="flex items-center justify-between bg-gray-100 p-4 shadow-md border-b border-gray-300">
      {/* Left: User Info */}
      <div className="flex items-center gap-3">
        <img
          src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D"
          alt="User Avatar"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold">Odama Studio</p>
          <p className="text-sm text-gray-500">Mas Happy Typing...</p>
        </div>
      </div>

      {/* Right: Call and Options */}
      <div className="flex items-center gap-4">
        <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <Phone className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <Video className="w-5 h-5 text-gray-600" />
        </button>
        <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default ChatWindowNavbar;
