import React from "react";
import { Plus, Search, ArrowLeft } from "lucide-react";

const ChatListBar = ({ isFriendsView, toggleView }) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-300 bg-gray-100 shadow-md sticky top-0 z-10">
      <h1 className="text-xl font-semibold">{isFriendsView ? "Friends" : "Messages"}</h1>
      <div className="flex items-center gap-4">
        {isFriendsView ? (
          <button onClick={toggleView} className="p-2 rounded-full hover:bg-gray-200">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
        ) : (
          <button onClick={toggleView} className="p-2 rounded-full hover:bg-gray-200">
            <Plus className="w-6 h-6 text-blue-600" />
          </button>
        )}

        <button className="p-2 rounded-full hover:bg-gray-200">
          <Search className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default ChatListBar;
