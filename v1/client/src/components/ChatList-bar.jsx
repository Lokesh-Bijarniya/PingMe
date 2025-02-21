import React from "react";

const ChatListBar = () => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-300 bg-gray-100 shadow-md sticky top-0 z-10">
      <h1 className="text-xl font-semibold">Messages</h1>
      <div className="flex items-center gap-4">
      <h1>Edit Icon here</h1>
        <h1>Search Icon here</h1>
    
        
         {/* <input
          type="text"
          placeholder="Search..."
          className="border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <img
          src="https://via.placeholder.com/40"
          alt="User Avatar"
          className="w-10 h-10 rounded-full"
        />  */}
      </div>
    </div>
  );
};

export default ChatListBar;
