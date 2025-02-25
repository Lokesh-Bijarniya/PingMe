import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedChat, addChat } from "../../redux/features/chat/chatSlice";
import ChatListBar from "../ChatList-bar";

const ChatList = () => {
  const dispatch = useDispatch();
  const chats = useSelector((state) => state.chat.chats);
  const [isFriendsView, setIsFriendsView] = useState(false);
  const [newFriend, setNewFriend] = useState("");

  const toggleView = () => {
    setIsFriendsView(!isFriendsView);
  };

  const handleAddFriend = () => {
    if (!newFriend.trim()) return;

    const newFriendObj = {
      id: Date.now(),
      name: newFriend,
      lastMessage: "Say hi!",
      time: "Just now",
      unread: false,
    };

    dispatch(addChat(newFriendObj));
    setNewFriend("");
  };

  return (
    <div className="w-2/5 bg-gray-50 max-h-screen overflow-y-auto">
      <ChatListBar isFriendsView={isFriendsView} toggleView={toggleView} />

      {isFriendsView ? (
        <div className="p-4">
          

          {/* Add Friend Section */}
          <div className="">
            <input
              type="text"
              placeholder="Enter friend's email"
              value={newFriend}
              onChange={(e) => setNewFriend(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={handleAddFriend}
              className="w-full mt-2 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            >
              Add Friend
            </button>
          </div>



          {chats.map((friend, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 m-2 bg-white rounded-lg shadow hover:bg-gray-100 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                
              <img src="https://via.placeholder.com/50" alt="User Avatar" className="w-10 h-10 rounded-full" />
              <p className="font-semibold truncate">{friend.name}</p>
            </div>
              <button
                    className="text-green-800 text-sm hover:underline p-2 rounded-full bg-gray-200"
                  >
                    Start Chat
                  </button>
            </div>
          ))}
        </div>
      ) : (
        chats.map((chat, index) => (
          <div
            key={index}
            onClick={() => dispatch(setSelectedChat(chat))}
            className="flex items-center justify-between p-3 m-2 bg-white rounded-lg shadow hover:bg-gray-100 cursor-pointer"
          >

            <div className="overflow-hidden">
            <div className="flex items-center gap-2">
                
                <img src="https://via.placeholder.com/50" alt="User Avatar" className="w-10 h-10 rounded-full" />
              <p className="font-semibold truncate">{chat.name}</p>
              </div>
              <p className="text-sm text-gray-500 truncate pl-12">{chat.lastMessage}</p>
            </div>

            
            <div className="text-right">
              <p className="text-xs text-gray-400">{chat.time}</p>
              {chat.unread && <span className="text-blue-500 text-xs">●</span>}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatList;
