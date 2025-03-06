import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMessages,
  updateMessageStatus,
  deleteChat,
  setSelectedChat,
} from "../../redux/features/chat/chatSlice";
import SocketService from "../../services/socket";
import MessageInput from "./MessageInput";
import ChatWindowNavbar from "./chatWindow-bar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChatWindow = () => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const { selectedChat, messages } = useSelector((state) => state.chat);
  const currentUser = useSelector((state) => state.auth.user); // Get current user


  console.log("chat-wind-msg",messages);

  // ✅ Load messages when selectedChat changes
  useEffect(() => {
    if (selectedChat?.chatId && !messages[selectedChat.chatId]) {
      dispatch(fetchMessages(selectedChat.chatId));
    }
  }, [selectedChat, dispatch]);

  // ✅ Mark messages as read
  useEffect(() => {
    if (selectedChat) {
      messages[selectedChat.chatId]?.forEach((msg) => {
        if (msg.sender.id !== currentUser.id && msg.status !== "read") {
          dispatch(updateMessageStatus({ messageId: msg.messageId, status: "read" }));
        }
      });
    }
  }, [selectedChat, messages, dispatch, currentUser]);

  // ✅ Scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages[selectedChat?.chatId]]);

  // ✅ Handle sending messages & files
  const handleSendMessage = async (messageText, file) => {
    if (!messageText.trim() && !file) return;

    try {
      if (file) {
        const chunkSize = 64 * 1024;
        const totalChunks = Math.ceil(file.size / chunkSize);
        let currentChunk = 0;

        console.log(`📤 Uploading ${file.name} in ${totalChunks} chunks...`);

        const sendChunk = async (chunk, isLastChunk) => {
          const base64Chunk = await readFileAsBase64(chunk);
          return new Promise((resolve) => {
            SocketService.emit("UPLOAD_FILE", {
              chatId: selectedChat.chatId,
              fileName: file.name,
              fileType: file.type,
              chunk: base64Chunk,
              isLastChunk,
            });

            console.log(`📤 Sent chunk ${currentChunk + 1}/${totalChunks}`);
            currentChunk++;
            setTimeout(resolve, 100);
          });
        };

        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(file.size, start + chunkSize);
          const chunk = file.slice(start, end);
          await sendChunk(chunk, i + 1 === totalChunks);
        }

        console.log("✅ File upload complete!");
      } else {
        SocketService.emit("SEND_MESSAGE", {
          chatId: selectedChat.chatId,
          content: messageText,
          senderId: currentUser?._id || currentUser?.id,
        });
      }

      scrollToBottom();
    } catch (error) {
      console.error("❌ Error sending message:", error);
      toast.error("❌ Failed to send message. Please try again.");
    }
  };

  // ✅ Convert file chunk to Base64
  const readFileAsBase64 = (chunk) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(chunk);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
    });
  };

  // ✅ Delete chat
  const handleDeleteChat = async (chatId) => {
    if (window.confirm("Are you sure you want to delete this chat?")) {
      try {
        await SocketService.emit("DELETE_CHAT", { chatId });
        dispatch(deleteChat(chatId)).then(() => {
          dispatch(setSelectedChat(null));
          toast.success("✅ Chat deleted successfully!");
        });
      } catch (error) {
        console.error("Error deleting chat:", error);
        toast.error("❌ Failed to delete chat. Please try again.");
      }
    }
  };

  // ✅ Format date headers
  const formatDateHeader = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) return "Today";
    if (messageDate.toDateString() === yesterday.toDateString()) return "Yesterday";

    return messageDate.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="flex flex-col h-full">
      <ChatWindowNavbar chat={selectedChat} onDeleteChat={handleDeleteChat} />
      {selectedChat ? (
        <>
          <div className="flex-1 overflow-y-auto p-4">
            {messages[selectedChat.chatId]?.map((msg, index, arr) => {
              const isMyMessage = msg.sender.id === currentUser._id;
              const previousMessage = arr[index - 1];
              const showDateHeader =
                !previousMessage ||
                new Date(previousMessage.timestamp).toDateString() !== new Date(msg.timestamp).toDateString();
              const messageDateHeader = formatDateHeader(msg.timestamp);

              return (
                <React.Fragment key={msg.messageId}>
                  {showDateHeader && <div className="text-center text-sm text-gray-500 my-2">{messageDateHeader}</div>}
                  <div className={`mb-2 flex ${isMyMessage ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs md:max-w-md lg:max-w-lg px-3 py-2 rounded-lg ${
                        isMyMessage ? "bg-green-300 text-black" : "bg-gray-200 text-black"
                      }`}
                    >
                      {/* ✅ Check for attachments */}
                      {msg.attachment ? (
                        msg.fileType?.startsWith("image/") ? (
                          <img src={msg.attachment} alt="Sent Image" className="rounded-lg max-w-xs" />
                        ) : msg.fileType?.startsWith("video/") ? (
                          <video controls className="rounded-lg max-w-xs">
                            <source src={msg.attachment} type={msg.fileType} />
                          </video>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>📎 {msg.fileName || "Attachment"}</span>
                            <a
                              href={msg.attachment}
                              download={msg.fileName}
                              className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                            >
                              Download
                            </a>
                          </div>
                        )
                      ) : (
                        <p>{msg.content}</p>
                      )}

                      {/* ✅ Show message timestamp */}
                      <p className="text-xs text-gray-500 text-right mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}
                      </p>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <MessageInput onSend={handleSendMessage} />
        </>
      ) : (
        <p className="text-center text-gray-500">Select a chat to start messaging</p>
      )}
    </div>
  );
};

export default ChatWindow;
