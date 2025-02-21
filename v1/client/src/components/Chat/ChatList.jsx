import React from "react";
import ChatListBar from "../ChatList-bar";

const ChatList = () => {
  const chats = [
    { name: "Odama Studio", lastMessage: "Mas Happy Typing...", time: "05:11 PM", unread: true },
    { name: "Hatypo Studio", lastMessage: "Lahh gas!", time: "04:01 PM", unread: false },
    { name: "Nolaaa", lastMessage: "Keren banget", time: "03:29 PM", unread: true },
    { name: "Odama Studio", lastMessage: "Mas Happy Typing...", time: "05:11 PM", unread: true },
    { name: "Hatypo Studio", lastMessage: "Lahh gas!", time: "04:01 PM", unread: false },
    { name: "Nolaaa", lastMessage: "Keren banget", time: "03:29 PM", unread: true },
    { name: "Odama Studio", lastMessage: "Mas Happy Typing...", time: "05:11 PM", unread: true },
    { name: "Hatypo Studio", lastMessage: "Lahh gas!", time: "04:01 PM", unread: false },
    { name: "Nolaaa", lastMessage: "Keren banget", time: "03:29 PM", unread: true },
    { name: "Odama Studio", lastMessage: "Mas Happy Typing...", time: "05:11 PM", unread: true },
    { name: "Hatypo Studio", lastMessage: "Lahh gas!", time: "04:01 PM", unread: false },
    { name: "Nolaaa", lastMessage: "Keren banget", time: "03:29 PM", unread: true },
    { name: "Odama Studio", lastMessage: "Mas Happy Typing...", time: "05:11 PM", unread: true },
    { name: "Hatypo Studio", lastMessage: "Lahh gas!", time: "04:01 PM", unread: false },
    { name: "Nolaaa", lastMessage: "Keren banget", time: "03:29 PM", unread: true },

  ];

  return (
    <div className="w-2/5 bg-gray-50 max-h-screen overflow-y-auto ">
      <ChatListBar/>

      {chats.map((chat, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 m-2 bg-white rounded-lg shadow hover:bg-gray-100 cursor-pointer"
        >
          <div className="overflow-hidden">
            <p className="font-semibold truncate">{chat.name}</p>
            <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">{chat.time}</p>
            {chat.unread && <span className="text-blue-500 text-xs">●</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
