import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchChats,
  fetchMessages,
  updateMessageStatus,
  newMessageReceived,
  deleteChat,
} from "../../redux/features/chat/chatSlice";
import SocketService from "../../services/socket";
import MessageInput from "./MessageInput";
import ChatWindowNavbar from "./chatWindow-bar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const ChatWindow = () => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const { selectedChat, messages, typingStatus } = useSelector((state) => state.chat);
  const currentUser = useSelector((state) => state.auth.user); // Get the current user


  console.log("currentUser", currentUser)
  // console.log("selectedChat", selectedChat.chatId);
  console.log("window-chat", selectedChat, messages);

  // Load messages when selectedChat changes
  useEffect(() => {
    if (selectedChat?.chatId && !messages[selectedChat.chatId]) {
      dispatch(fetchMessages(selectedChat.chatId));
    }
  }, [selectedChat, dispatch]);

  // Mark messages as read when chat is selected
  useEffect(() => {
    if (selectedChat) {
      messages[selectedChat.chatId]?.forEach((msg) => {
        if (msg.sender.id !== currentUser.id && msg.status !== "read") {
          dispatch(
            updateMessageStatus({
              messageId: msg.messageId,
              status: "read",
            })
          );
        }
      });
    }
  }, [selectedChat, messages, dispatch, currentUser]);

  // Handle new message event
  useEffect(() => {
    const handleNewMessage = (data) => {
      if (selectedChat?.chatId === data.chatId) {
        dispatch(newMessageReceived({ chatId: data.chatId, message: data }));
        scrollToBottom();
      }
    };

    SocketService.on("NEW_MESSAGE", handleNewMessage);
    return () => SocketService.off("NEW_MESSAGE", handleNewMessage);
  }, [selectedChat, dispatch]);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100); // Small delay ensures smooth scrolling
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages[selectedChat?.chatId]]); // Scroll when new messages arrive

  // Send a message via SocketService
  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || !selectedChat) return;
  
    try {
      const optimisticMessage = {
        messageId: `temp-${Date.now()}`,
        content: messageText,
        sender: {
          id: currentUser?._id || currentUser?.id,
          name: currentUser?.name || "Unknown",
        },
        timestamp: new Date(),
      };
  
      if (!optimisticMessage.sender.id) {
        console.error("❌ Sender ID is missing! Message:", optimisticMessage);
        toast.error("🚨 Unexpected error! Please try again.");
        return;
      }
  
      // ✅ Dispatch new message to Redux
      dispatch(
        newMessageReceived({
          chatId: selectedChat.chatId,
          message: optimisticMessage,
        })
      );
  
      // ✅ Simulate chat update so it moves to top
      dispatch(fetchChats());
  
      await SocketService.emit("SEND_MESSAGE", {
        chatId: selectedChat.chatId,
        content: messageText,
        senderId: currentUser?._id || currentUser?.id,
      });
  
      scrollToBottom();
      toast.success("📩 Message sent!");
    } catch (error) {
      console.error("Message send error:", error);
      toast.error("❌ Failed to send message. Please try again.");
    }
  };



    // Handle chat deletion
    const handleDeleteChat = async (chatId) => {
      if (window.confirm("Are you sure you want to delete this chat?")) {
        try {
          await SocketService.emit("DELETE_CHAT", { chatId }); // Notify backend
          dispatch(deleteChat(chatId)).unwrap(); // Remove chat from Redux state
          
          toast.success("Chat deleted successfully!");
        } catch (error) {
          console.error("Error deleting chat:", error);
          toast.error("Failed to delete chat. Please try again.");
        }
      }
    };
  
  

  // Emit typing status
  const handleTyping = (isTyping) => {
    SocketService.emit("TYPING", {
      chatId: selectedChat?.chatId,
      isTyping,
    });
  };

  // Format date header logic
  const formatDateHeader = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString([], {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ChatWindowNavbar chat={selectedChat}   onDeleteChat={handleDeleteChat} />
      {selectedChat ? (
        <>
          <div className="flex-1 overflow-y-auto p-4">
            {messages[selectedChat.chatId]?.map((msg, index, arr) => {
              const isMyMessage = msg.sender.id === currentUser._id; // Check sender properly
              const previousMessage = arr[index - 1];
              const showDateHeader =
                !previousMessage ||
                new Date(previousMessage.timestamp).toDateString() !==
                  new Date(msg.timestamp).toDateString();

              const messageDateHeader = formatDateHeader(msg.timestamp);

              return (
                <React.Fragment key={msg.messageId}>
                  {showDateHeader && (
                    <div className="text-center text-sm text-gray-500 my-2">
                      {messageDateHeader}
                    </div>
                  )}
                  <div
                    className={`mb-2 flex ${
                      isMyMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md lg:max-w-lg px-2 py-1 rounded-lg ${
                        isMyMessage
                          ? "bg-green-300 text-black"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-xs text-gray-500 flex items-end text-right">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <MessageInput onSend={handleSendMessage} onTyping={handleTyping} />
        </>
      ) : (
        <p className="text-center text-gray-500">
          Select a chat to start messaging
        </p>
      )}
    </div>
  );
};

export default ChatWindow;


