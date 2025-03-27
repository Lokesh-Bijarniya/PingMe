import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import SocketService from "../services/socket";
import ChatList from "../components/messages/ChatList";
import ChatWindow from "../components/messages/ChatWindow";
import { deleteChat, clearSelectedChat } from "../redux/features/chat/chatSlice";
import { motion } from "framer-motion";
import {ArrowLeft} from 'lucide-react';


const ChatPage = () => {
  const dispatch = useDispatch();
  const selectedChat = useSelector((state) => state.chat.selectedChat);
  

  useEffect(() => {
    const handleChatDeleted = (data) => {
      const { chatId } = data;
      dispatch(deleteChat(chatId)); // Remove chat from Redux state
    };

    // Attach event listener
    SocketService.chatSocket?.on("CHAT_DELETED", handleChatDeleted);

    // Cleanup function (removes listener on unmount)
    return () => {
      SocketService.chatSocket?.off("CHAT_DELETED", handleChatDeleted);
    };
  }, [dispatch]); // Depend on dispatch only



   // 🔄 Join Selected Chat Room
    useEffect(() => {
      if (selectedChat && selectedChat.chatId) {
        console.log(`📩 Joining chat room: ${selectedChat.chatId}`);
        SocketService.chatSocket?.emit("JOIN_CHAT", { chatId: selectedChat.chatId });
      }
    }, [selectedChat]);

  return (
    <div className="flex h-screen">
      {/* Chat List Section */}
      <div
        className={`lg:w-2/5 w-full lg:block ${
          selectedChat ? "hidden lg:flex" : "flex"
        }`}
      >
         <ChatList />
      </div>

      {/* Chat Window Section */}
      <div className={`flex-1 flex items-center justify-center bg-gray-100 shadow-md rounded-lg ${
          selectedChat ? "w-full" : "hidden lg:flex"
        }`}>
        {selectedChat ? (

          <div className="w-full h-full flex flex-col">
            <ChatWindow selectedChat={selectedChat} />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center text-gray-600 text-lg not-lg:hidden" 
          >
            {/* Logo with bounce effect */}
            <motion.img
              src="/LogoAuth.png"
              alt="Chat"
              className="mx-auto w-28 h-28 mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: [0, -5, 0] }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeInOut", repeat: 2, repeatType: "reverse" }}
            />

            {/* Animated text with floating effect */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
              className="text-xl font-semibold text-gray-700"
            >
              Select a community to start chatting 🚀
            </motion.p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
