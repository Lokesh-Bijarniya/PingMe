import React from "react";
import { Phone, Video, MoreVertical } from "lucide-react";

const ChatWindowNavbar = ({ chat }) => {
  return (
    <div className="flex items-center justify-between bg-gray-100 p-4 shadow-md border-b border-gray-300">
      <div className="flex items-center gap-3">
        <img
          src="https://via.placeholder.com/50"
          alt="User Avatar"
          className="w-10 h-10 rounded-full"
        />
        <div>
          <p className="font-semibold">{chat.name}</p>
          <p className="text-sm text-gray-500">Online</p>
        </div>
      </div>
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
